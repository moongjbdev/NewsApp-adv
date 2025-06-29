const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const {
  register,
  login,
  getMe,
  updateProfile
} = require('../controllers/authController');

// Public routes with rate limiting and validation
router.post('/register', authLimiter, validateRegistration, register);
router.post('/login', authLimiter, validateLogin, login);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

module.exports = router; 