const Comment = require('../models/Comment');
const User = require('../models/User');
const NotificationGenerator = require('../services/notificationGenerator');

// @desc    Get comments for an article
// @route   GET /api/comments/:article_id
// @access  Public
const getComments = async (req, res) => {
  try {
    const { article_id } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;

    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'mostLiked':
        sortOption = { 'likes.length': -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const comments = await Comment.find({ 
      article_id, 
      parent_id: null, 
      isDeleted: false 
    })
      .populate('user', 'username fullName avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ 
      article_id, 
      parent_id: null, 
      isDeleted: false 
    });

    res.json({
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { article_id, content, parent_id } = req.body;

    if (!article_id || !content || content.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Article ID and content are required' 
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({ 
        message: 'Comment content cannot exceed 1000 characters' 
      });
    }

    // If this is a reply, validate that the parent comment exists
    if (parent_id) {
      const parentComment = await Comment.findById(parent_id);
      if (!parentComment) {
        return res.status(404).json({ 
          message: 'Parent comment not found' 
        });
      }
      if (parentComment.isDeleted) {
        return res.status(400).json({ 
          message: 'Cannot reply to a deleted comment' 
        });
      }
    }

    const comment = new Comment({
      user: req.user._id,
      article_id,
      content: content.trim(),
      parent_id: parent_id || null
    });

    await comment.save();
    await comment.populate('user', 'username fullName avatar');

    // Check for mentions (@username) and generate notifications
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);
    if (mentions) {
      for (const mention of mentions) {
        const username = mention.substring(1); // Remove @ symbol
        try {
          const mentionedUser = await User.findOne({ username });
          if (mentionedUser && mentionedUser._id.toString() !== req.user._id.toString()) {
            await NotificationGenerator.generateMentionNotification(comment._id, mentionedUser._id);
          }
        } catch (mentionError) {
          console.error('Error generating mention notification:', mentionError);
          // Don't fail the request if mention notification fails
        }
      }
    }

    // Generate reply notification if this is a reply
    if (parent_id) {
      try {
        await NotificationGenerator.generateCommentReplyNotification(parent_id, comment._id);
        console.log('Reply notification generated for comment:', parent_id, 'reply:', comment._id);
      } catch (replyNotificationError) {
        console.error('Error generating reply notification:', replyNotificationError);
        // Don't fail the request if notification fails
      }
    }

    // Generate notification for article author (if different from commenter)
    // Note: This would require article data to get the author
    // For now, we'll skip this as we don't have article author info
    // TODO: Add article author notification when article data is available

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:comment_id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Content is required' 
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({ 
        message: 'Comment content cannot exceed 1000 characters' 
      });
    }

    const comment = await Comment.findById(comment_id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ message: 'Cannot edit deleted comment' });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('user', 'username fullName avatar');

    // Check for new mentions (@username) in updated content and generate notifications
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);
    if (mentions) {
      for (const mention of mentions) {
        const username = mention.substring(1); // Remove @ symbol
        try {
          const mentionedUser = await User.findOne({ username });
          if (mentionedUser && mentionedUser._id.toString() !== req.user._id.toString()) {
            await NotificationGenerator.generateMentionNotification(comment._id, mentionedUser._id);
          }
        } catch (mentionError) {
          console.error('Error generating mention notification:', mentionError);
          // Don't fail the request if mention notification fails
        }
      }
    }

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:comment_id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const { comment_id } = req.params;

    const comment = await Comment.findById(comment_id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Soft delete - mark as deleted instead of removing
    comment.isDeleted = true;
    await comment.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Unlike comment
// @route   POST /api/comments/:comment_id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { action = 'like' } = req.body;

    const comment = await Comment.findById(comment_id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ message: 'Cannot like deleted comment' });
    }

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);
    const isDisliked = comment.dislikes.includes(userId);

    if (action === 'like') {
      if (isLiked) {
        // Unlike
        comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
      } else {
        // Like
        comment.likes.push(userId);
        // Remove from dislikes if present
        if (isDisliked) {
          comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
        }
        
        // Generate notification for comment owner (only when liking, not unliking)
        // Don't notify if user is liking their own comment
        if (comment.user.toString() !== userId.toString()) {
          // Generate notification in parallel (don't await) for faster response
          NotificationGenerator.generateCommentLikeNotification(comment_id, userId)
            .then(() => {
              console.log('✅ Like notification generated successfully');
            })
            .catch((notificationError) => {
              console.error('❌ Error generating like notification:', notificationError);
            });
        }
      }
    } else if (action === 'dislike') {
      if (isDisliked) {
        // Remove dislike
        comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
      } else {
        // Add dislike
        comment.dislikes.push(userId);
        // Remove from likes if present
        if (isLiked) {
          comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
        }
      }
    }

    await comment.save();

    res.json({
      message: 'Comment action completed',
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      isLiked: comment.likes.includes(userId),
      isDisliked: comment.dislikes.includes(userId)
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get replies for a comment
// @route   GET /api/comments/:comment_id/replies
// @access  Public
const getReplies = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Check if the parent comment exists
    const parentComment = await Comment.findById(comment_id);
    if (!parentComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const replies = await Comment.find({ 
      parent_id: comment_id, 
      isDeleted: false 
    })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: 1 }) // Show oldest replies first
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ 
      parent_id: comment_id, 
      isDeleted: false 
    });

    res.json({
      replies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  getReplies
}; 