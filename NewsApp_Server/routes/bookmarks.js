const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark,
  clearBookmarks
} = require('../controllers/bookmarkController');

// Bookmarks
router.get('/', auth, getBookmarks);
router.post('/', auth, addBookmark);
router.delete('/', auth, clearBookmarks);
router.get('/check/:article_id', auth, checkBookmark);
router.delete('/:article_id', auth, removeBookmark);

module.exports = router; 