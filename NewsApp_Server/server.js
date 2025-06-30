const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/database');
const { generalLimiter } = require('./middleware/rateLimit');
require('dotenv').config();
const http = require('http');
const socketService = require('./services/socketService');

const app = express();

// Connect to MongoDB
connectDB();

// Rate limiting
app.use(generalLimiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/user', require('./routes/user'));
app.use('/api/user/bookmarks', require('./routes/bookmarks'));
app.use('/api/news', require('./routes/news'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to NewsApp API v2.0',
    version: '2.0.0',
    description: 'Backend for NewsApp with NewsData.io integration',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      user: '/api/user',
      bookmarks: '/api/user/bookmarks',
      news: '/api/news',
      comments: '/api/comments'
    },
    features: [
      'User Authentication & Management',
      'Reading History & Bookmarks',
      'News Caching from NewsData.io',
      'User Preferences & Personalization',
      'Analytics & Popular Articles',
      'Comments & Social Interaction'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const notificationScheduler = require('./services/scheduler');

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize socket service
socketService.initializeSocket(io);

// Export sendRealtimeNotification function for use in other modules
const { sendRealtimeNotification } = socketService;

module.exports = { app, server, sendRealtimeNotification };

// Start server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 NewsApp Server v2.0 running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}`);
    
    // Start notification scheduler
    notificationScheduler.start();
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  notificationScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  notificationScheduler.stop();
  process.exit(0);
}); 