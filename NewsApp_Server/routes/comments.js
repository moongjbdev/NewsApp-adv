const express = require('express');
const router = express.Router();
const {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  getReplies
} = require('../controllers/commentController');
const { auth } = require('../middleware/auth');
const { commentLimiter } = require('../middleware/rateLimit');
const { validateCommentInput } = require('../middleware/validation');

// Public routes
router.get('/:article_id', getComments);
router.get('/:comment_id/replies', getReplies);

// Protected routes
router.post('/', auth, commentLimiter, validateCommentInput, addComment);
router.put('/:comment_id', auth, validateCommentInput, updateComment);
router.delete('/:comment_id', auth, deleteComment);
router.post('/:comment_id/like', auth, likeComment);

module.exports = router; 