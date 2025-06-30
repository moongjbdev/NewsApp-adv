const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  createNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');
const notificationScheduler = require('../services/scheduler');
const NotificationGenerator = require('../services/notificationGenerator');

// All routes require authentication
router.use(auth);

// Get user notifications
router.get('/', getUserNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Get notification settings
router.get('/settings', getNotificationSettings);

// Update notification settings
router.put('/settings', updateNotificationSettings);

// Create notification (internal use)
router.post('/create', createNotification);

// Test routes for manual notification triggers (Admin only)
router.post('/test/daily-digest', async (req, res) => {
  try {
    // Check if user is admin (you can implement your own admin check)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const result = await notificationScheduler.triggerDailyDigest();
    res.json(result);
  } catch (error) {
    console.error('Error triggering daily digest:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/test/reading-reminder', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const result = await notificationScheduler.triggerReadingReminder();
    res.json(result);
  } catch (error) {
    console.error('Error triggering reading reminder:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/test/achievement-check', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const result = await notificationScheduler.triggerAchievementCheck();
    res.json(result);
  } catch (error) {
    console.error('Error triggering achievement check:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test endpoint to create a comment like notification
router.post('/test/comment-like', async (req, res) => {
  try {
    const { comment_id, liked_by_user_id } = req.body;
    
    if (!comment_id || !liked_by_user_id) {
      return res.status(400).json({ message: 'comment_id and liked_by_user_id are required' });
    }
    
    const result = await NotificationGenerator.generateCommentLikeNotification(comment_id, liked_by_user_id);
    res.json({ success: true, notification: result });
  } catch (error) {
    console.error('Error creating test comment like notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test endpoint to create a comment reply notification
router.post('/test/comment-reply', async (req, res) => {
  try {
    const { comment_id, reply_comment_id } = req.body;
    
    if (!comment_id || !reply_comment_id) {
      return res.status(400).json({ message: 'comment_id and reply_comment_id are required' });
    }
    
    const result = await NotificationGenerator.generateCommentReplyNotification(comment_id, reply_comment_id);
    res.json({ success: true, notification: result });
  } catch (error) {
    console.error('Error creating test comment reply notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test endpoint to cleanup duplicates
router.post('/test/cleanup-duplicates', async (req, res) => {
  try {
    await NotificationGenerator.cleanupDuplicateNotifications();
    res.json({ success: true, message: 'Cleanup completed' });
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 