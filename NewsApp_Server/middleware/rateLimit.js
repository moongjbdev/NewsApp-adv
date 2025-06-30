const rateLimit = require('express-rate-limit');

// Rate limiter ONLY for external NewsData.io API calls
const externalAPILimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit external API calls to 50 requests per 15 minutes
  message: {
    message: 'Too many external API requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only apply to NewsData.io API routes
  skip: (req) => {
    // Skip rate limiting for all internal API routes
    const path = req.path;
    
    // Skip for all internal API routes (auth, users, news, comments, etc.)
    if (path.startsWith('/api/auth') ||
        path.startsWith('/api/users') ||
        path.startsWith('/api/user') ||
        path.startsWith('/api/news/cached') ||
        path.startsWith('/api/news/breaking') ||
        path.startsWith('/api/news/popular') ||
        path.startsWith('/api/news/track') ||
        path.startsWith('/api/comments') ||
        path.startsWith('/api/notifications')) {
      return true;
    }
    
    // Only apply rate limiting to external news fetching routes
    // Note: Currently no direct external API routes, all are cached
    return true; // Skip all for now since we use caching
  }
});

// General rate limiter - DISABLED for all internal routes
const generalLimiter = (req, res, next) => {
  // Skip rate limiting for ALL internal API routes
  const path = req.path;
  
  console.log(`🔍 Rate limit check for path: ${path}`);
  
  if (path.startsWith('/api/')) {
    console.log(`✅ Skipping rate limit for internal API: ${path}`);
    return next(); // No rate limiting for any internal API
  }
  
  console.log(`⚠️ Applying rate limit for external route: ${path}`);
  // Only apply rate limiting to external routes (if any)
  return externalAPILimiter(req, res, next);
};

// Auth rate limiter - DISABLED
const authLimiter = (req, res, next) => {
  // No rate limiting for auth routes
  return next();
};

// Comment rate limiter - DISABLED
const commentLimiter = (req, res, next) => {
  // No rate limiting for comment routes
  return next();
};

module.exports = {
  generalLimiter,
  authLimiter,
  commentLimiter,
  externalAPILimiter
}; 