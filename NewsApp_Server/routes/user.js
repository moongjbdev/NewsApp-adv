const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getUserPreferences,
  updateUserPreferences,
  getReadingHistory,
  addToReadingHistory,
  clearReadingHistory,
  getUserStats
} = require('../controllers/userController');

// User preferences
router.get('/preferences', auth, getUserPreferences);
router.put('/preferences', auth, updateUserPreferences);

// Reading history
router.get('/reading-history', auth, getReadingHistory);
router.post('/reading-history', auth, addToReadingHistory);
router.delete('/reading-history', auth, clearReadingHistory);

// User stats
router.get('/stats', auth, getUserStats);

module.exports = router; 