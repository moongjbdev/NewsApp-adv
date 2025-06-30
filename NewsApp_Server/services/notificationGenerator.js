const Notification = require('../models/Notification');
const User = require('../models/User');
const ReadingHistory = require('../models/ReadingHistory');
const Bookmark = require('../models/Bookmark');
const Comment = require('../models/Comment');
const { sendRealtimeNotification } = require('./socketService');

class NotificationGenerator {
  // Generate comment reply notification
  static async generateCommentReplyNotification(commentId, replyCommentId) {
    try {
      console.log(`🔔 Generating reply notification for comment ${commentId}, reply ${replyCommentId}`);
      
      const comment = await Comment.findById(commentId).populate('user', 'username fullName');
      const reply = await Comment.findById(replyCommentId).populate('user', 'username fullName');
      
      if (!comment) {
        console.error(`❌ Parent comment ${commentId} not found`);
        return null;
      }
      
      if (!reply) {
        console.error(`❌ Reply comment ${replyCommentId} not found`);
        return null;
      }
      
      if (comment.user._id.toString() === reply.user._id.toString()) {
        console.log(`⏭️ Skipping notification - user replying to their own comment`);
        return null;
      }

      // Use upsert to prevent duplicates
      const notificationData = {
        user_id: comment.user._id,
        type: 'comment_reply',
        title: 'Có người trả lời bình luận của bạn',
        message: `${reply.user.fullName || reply.user.username} đã trả lời bình luận của bạn`,
        data: {
          article_id: comment.article_id,
          comment_id: commentId,
          reply_id: replyCommentId,
          user_id: reply.user._id,
          reply_content: reply.content.substring(0, 100)
        }
      };

      // Try to find existing notification first
      const existingNotification = await Notification.findOne({
        user_id: comment.user._id,
        type: 'comment_reply',
        $or: [
          {
            'data.comment_id': commentId.toString(),
            'data.reply_id': replyCommentId.toString()
          },
          {
            'data.comment_id': commentId,
            'data.reply_id': replyCommentId
          }
        ]
      });

      if (existingNotification) {
        console.log(`✅ Duplicate reply notification prevented for comment: ${commentId}, reply: ${replyCommentId}`);
        return existingNotification;
      }

      // Create new notification
      const notification = new Notification(notificationData);
      await notification.save();
      console.log(`✅ Reply notification created for comment: ${commentId}, by user: ${reply.user._id}`);
      // Emit realtime notification
      sendRealtimeNotification(comment.user._id.toString(), notification);
      return notification;
    } catch (error) {
      console.error('❌ Error generating comment reply notification:', error);
      throw error; // Re-throw to handle in controller
    }
  }

  // Generate comment like notification
  static async generateCommentLikeNotification(commentId, likedByUserId) {
    try {
      const comment = await Comment.findById(commentId).populate('user', 'username fullName');
      const likedByUser = await User.findById(likedByUserId).select('username fullName');
      
      if (!comment || !likedByUser || comment.user._id.toString() === likedByUserId) {
        return;
      }

      // Use upsert to prevent duplicates
      const notificationData = {
        user_id: comment.user._id,
        type: 'comment_like',
        title: 'Có người thích bình luận của bạn',
        message: `${likedByUser.fullName || likedByUser.username} đã thích bình luận của bạn`,
        data: {
          article_id: comment.article_id,
          comment_id: commentId,
          user_id: likedByUserId
        }
      };

      // Try to find existing notification first
      const existingNotification = await Notification.findOne({
        user_id: comment.user._id,
        type: 'comment_like',
        $or: [
          {
            'data.comment_id': commentId.toString(),
            'data.user_id': likedByUserId.toString()
          },
          {
            'data.comment_id': commentId,
            'data.user_id': likedByUserId
          }
        ]
      });

      if (existingNotification) {
        console.log('Duplicate like notification prevented for comment:', commentId, 'by user:', likedByUserId);
        return existingNotification;
      }

      // Create new notification
      const notification = new Notification(notificationData);
      await notification.save();
      console.log('Like notification created for comment:', commentId, 'by user:', likedByUserId);
      // Emit realtime notification
      sendRealtimeNotification(comment.user._id.toString(), notification);
      return notification;
    } catch (error) {
      console.error('Error generating like notification:', error);
      throw error; // Re-throw to handle in controller
    }
  }

  // Generate mention notification
  static async generateMentionNotification(commentId, mentionedUserId) {
    try {
      const comment = await Comment.findById(commentId).populate('user', 'username fullName');
      const mentionedUser = await User.findById(mentionedUserId).select('username fullName');
      
      if (!comment || !mentionedUser || comment.user._id.toString() === mentionedUserId) {
        return;
      }

      const notification = new Notification({
        user_id: mentionedUserId,
        type: 'comment_mention',
        title: 'Có người nhắc đến bạn',
        message: `${comment.user.fullName || comment.user.username} đã nhắc đến bạn trong bình luận`,
        data: {
          article_id: comment.article_id,
          comment_id: commentId,
          user_id: comment.user._id,
          comment_content: comment.content.substring(0, 100)
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error generating mention notification:', error);
    }
  }

  // Generate reading achievement notification
  static async generateReadingAchievementNotification(userId, achievementType, value) {
    try {
      let title, message;
      
      switch (achievementType) {
        case 'reading_streak':
          title = 'Thành tích đọc tin tức!';
          message = `Chúc mừng! Bạn đã đọc liên tục ${value} ngày`;
          break;
        case 'total_articles':
          title = 'Thành tích đọc tin tức!';
          message = `Bạn đã đọc ${value} tin tức`;
          break;
        case 'total_bookmarks':
          title = 'Thành tích bookmark!';
          message = `Bạn đã bookmark ${value} tin tức`;
          break;
        default:
          return;
      }

      const notification = new Notification({
        user_id: userId,
        type: 'achievement',
        title,
        message,
        data: {
          achievement_type: achievementType,
          value: value
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error generating achievement notification:', error);
    }
  }

  // Generate daily digest notification
  static async generateDailyDigestNotification(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get user's reading stats for today
      const readingCount = await ReadingHistory.countDocuments({
        user: userId,
        readAt: { $gte: today }
      });

      const bookmarkCount = await Bookmark.countDocuments({
        user: userId,
        bookmarkedAt: { $gte: today }
      });

      // Get user's favorite categories
      const user = await User.findById(userId);
      const favoriteCategories = user.preferences?.favoriteCategories || [];

      let message = `Hôm nay bạn đã đọc ${readingCount} tin tức`;
      if (bookmarkCount > 0) {
        message += ` và bookmark ${bookmarkCount} tin tức`;
      }

      const notification = new Notification({
        user_id: userId,
        type: 'daily_digest',
        title: 'Tóm tắt hoạt động hôm nay',
        message,
        data: {
          reading_count: readingCount,
          bookmark_count: bookmarkCount,
          favorite_categories: favoriteCategories
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error generating daily digest notification:', error);
    }
  }

  // Generate category news notification
  static async generateCategoryNewsNotification(userId, category, newsCount) {
    try {
      const user = await User.findById(userId);
      const favoriteCategories = user.preferences?.favoriteCategories || [];

      if (!favoriteCategories.includes(category)) {
        return;
      }

      const notification = new Notification({
        user_id: userId,
        type: 'category_news',
        title: 'Tin tức mới trong category yêu thích',
        message: `Có ${newsCount} tin tức ${category} mới!`,
        data: {
          category: category,
          news_count: newsCount
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error generating category news notification:', error);
    }
  }

  // Generate reading reminder notification
  static async generateReadingReminderNotification(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const readingCount = await ReadingHistory.countDocuments({
        user: userId,
        readAt: { $gte: today }
      });

      if (readingCount > 0) {
        return; // User has already read today
      }

      const notification = new Notification({
        user_id: userId,
        type: 'reading_reminder',
        title: 'Nhắc nhở đọc tin tức',
        message: 'Bạn chưa đọc tin tức nào hôm nay. Hãy cập nhật tin tức mới nhất!',
        data: {
          reminder_type: 'daily_reading'
        }
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error generating reading reminder notification:', error);
    }
  }

  // Check and generate achievement notifications
  static async checkAndGenerateAchievements(userId) {
    try {
      const user = await User.findById(userId);
      
      // Check reading streak
      const readingStreak = await this.calculateReadingStreak(userId);
      if (readingStreak >= 7 && readingStreak % 7 === 0) {
        await this.generateReadingAchievementNotification(userId, 'reading_streak', readingStreak);
      }

      // Check total articles read
      const totalArticles = await ReadingHistory.countDocuments({ user: userId });
      if (totalArticles >= 100 && totalArticles % 100 === 0) {
        await this.generateReadingAchievementNotification(userId, 'total_articles', totalArticles);
      }

      // Check total bookmarks
      const totalBookmarks = await Bookmark.countDocuments({ user: userId });
      if (totalBookmarks >= 50 && totalBookmarks % 50 === 0) {
        await this.generateReadingAchievementNotification(userId, 'total_bookmarks', totalBookmarks);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  // Calculate reading streak
  static async calculateReadingStreak(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streak = 0;
      let currentDate = new Date(today);
      
      while (true) {
        const hasRead = await ReadingHistory.exists({
          user: userId,
          readAt: {
            $gte: currentDate,
            $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
          }
        });
        
        if (hasRead) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating reading streak:', error);
      return 0;
    }
  }

  // Clean up duplicate notifications (run periodically)
  static async cleanupDuplicateNotifications() {
    try {
      // Find and remove duplicate like notifications
      const duplicateLikes = await Notification.aggregate([
        {
          $match: {
            type: 'comment_like'
          }
        },
        {
          $group: {
            _id: {
              user_id: '$user_id',
              comment_id: '$data.comment_id',
              liked_by: '$data.user_id'
            },
            count: { $sum: 1 },
            notifications: { $push: '$_id' }
          }
        },
        {
          $match: { count: { $gt: 1 } }
        }
      ]);

      // Remove duplicates, keep the first one
      for (const duplicate of duplicateLikes) {
        const toRemove = duplicate.notifications.slice(1);
        await Notification.deleteMany({ _id: { $in: toRemove } });
        console.log(`Removed ${toRemove.length} duplicate like notifications`);
      }

      // Find and remove duplicate reply notifications
      const duplicateReplies = await Notification.aggregate([
        {
          $match: {
            type: 'comment_reply'
          }
        },
        {
          $group: {
            _id: {
              user_id: '$user_id',
              comment_id: '$data.comment_id',
              reply_id: '$data.reply_id'
            },
            count: { $sum: 1 },
            notifications: { $push: '$_id' }
          }
        },
        {
          $match: { count: { $gt: 1 } }
        }
      ]);

      // Remove duplicates, keep the first one
      for (const duplicate of duplicateReplies) {
        const toRemove = duplicate.notifications.slice(1);
        await Notification.deleteMany({ _id: { $in: toRemove } });
        console.log(`Removed ${toRemove.length} duplicate reply notifications`);
      }

      console.log('Duplicate notification cleanup completed');
    } catch (error) {
      console.error('Error cleaning up duplicate notifications:', error);
    }
  }
}

module.exports = NotificationGenerator; 