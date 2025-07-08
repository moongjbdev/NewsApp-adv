const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'breaking_news',
      'comment_reply',
      'comment_like',
      'comment_dislike',
      'comment_mention',
      'bookmark_update',
      'daily_digest',
      'trending_topic',
      'category_news',
      'reading_reminder',
      'achievement',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    article_id: {
      type: String,
      index: true
    },
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    reply_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    category: String,
    additional_data: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  scheduledFor: {
    type: Date,
    index: true
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ user_id: 1, createdAt: -1 });
notificationSchema.index({ user_id: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

notificationSchema.methods.markAsDeleted = function() {
  this.isDeleted = true;
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    user_id: userId,
    isRead: false,
    isDeleted: false
  });
};

notificationSchema.statics.getUserNotifications = function(userId, page = 1, limit = 20) {
  return this.find({
    user_id: userId,
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .populate('data.user_id', 'username fullName avatar')
  .populate('data.comment_id', 'content');
};

module.exports = mongoose.model('Notification', notificationSchema); 