const Comment = require('../models/Comment');
const User = require('../models/User');

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
      .populate({
        path: 'replyCount',
        match: { isDeleted: false }
      })
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

// @desc    Get replies for a comment
// @route   GET /api/comments/:comment_id/replies
// @access  Public
const getReplies = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const replies = await Comment.find({ 
      parent_id: comment_id, 
      isDeleted: false 
    })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: 1 })
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

    const comment = new Comment({
      user: req.user._id,
      article_id,
      content: content.trim(),
      parent_id: parent_id || null
    });

    await comment.save();
    await comment.populate('user', 'username fullName avatar');

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
const toggleLike = async (req, res) => {
  try {
    const { comment_id } = req.params;

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

    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      comment.likes.push(userId);
      // Remove from dislikes if exists
      if (isDisliked) {
        comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
      }
    }

    await comment.save();

    res.json({
      message: isLiked ? 'Comment unliked' : 'Comment liked',
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Dislike/Undislike comment
// @route   POST /api/comments/:comment_id/dislike
// @access  Private
const toggleDislike = async (req, res) => {
  try {
    const { comment_id } = req.params;

    const comment = await Comment.findById(comment_id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ message: 'Cannot dislike deleted comment' });
    }

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);
    const isDisliked = comment.dislikes.includes(userId);

    if (isDisliked) {
      // Undislike
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());
    } else {
      // Dislike
      comment.dislikes.push(userId);
      // Remove from likes if exists
      if (isLiked) {
        comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
      }
    }

    await comment.save();

    res.json({
      message: isDisliked ? 'Comment undisliked' : 'Comment disliked',
      likes: comment.likes.length,
      dislikes: comment.dislikes.length,
      isDisliked: !isDisliked
    });
  } catch (error) {
    console.error('Toggle dislike error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getComments,
  getReplies,
  addComment,
  updateComment,
  deleteComment,
  toggleLike,
  toggleDislike
}; 