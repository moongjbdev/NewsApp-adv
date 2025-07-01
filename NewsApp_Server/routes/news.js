const express = require('express');
const router = express.Router();
const { externalAPILimiter } = require('../middleware/rateLimit');
const { auth } = require('../middleware/auth');
const {
  getCachedNews,
  getBreakingNews,
  trackArticleView,
  trackCategoryView,
  getPopularArticles
} = require('../controllers/newsController');

// Public routes
router.get('/cached/:category', externalAPILimiter, getCachedNews);
router.get('/breaking', externalAPILimiter, getBreakingNews);
router.get('/popular', getPopularArticles);

// Protected routes (analytics)
router.post('/track-view', auth, trackArticleView);
router.post('/track-category', auth, trackCategoryView);

module.exports = router; 