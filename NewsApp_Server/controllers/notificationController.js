const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user._id;

    let query = { user_id: userId, isDeleted: false };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('data.user_id', 'username fullName avatar');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      user_id: userId,
      isDeleted: false
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.markAsRead();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { user_id: userId, isRead: false, isDeleted: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      user_id: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.markAsDeleted();

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get notification settings
// @route   GET /api/notifications/settings
// @access  Private
const getNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      push_enabled: user.notificationSettings?.push_enabled ?? true,
      email_enabled: user.notificationSettings?.email_enabled ?? false,
      in_app_enabled: user.notificationSettings?.in_app_enabled ?? true,
      preferences: user.notificationSettings?.preferences ?? {
        breaking_news: true,
        comment_replies: true,
        comment_likes: true,
        comment_mentions: true,
        bookmark_updates: false,
        daily_digest: true,
        trending_topics: true,
        category_news: true,
        reading_reminders: false,
        achievements: true,
        system_notifications: true,
        quiet_hours: {
          enabled: false,
          start_time: "22:00",
          end_time: "08:00"
        },
        digest_frequency: 'daily',
        max_notifications_per_day: 20
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update notification settings
// @route   PUT /api/notifications/settings
// @access  Private
const updateNotificationSettings = async (req, res) => {
  try {
    const { push_enabled, email_enabled, in_app_enabled, preferences } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (push_enabled !== undefined) updateData['notificationSettings.push_enabled'] = push_enabled;
    if (email_enabled !== undefined) updateData['notificationSettings.email_enabled'] = email_enabled;
    if (in_app_enabled !== undefined) updateData['notificationSettings.in_app_enabled'] = in_app_enabled;
    if (preferences) updateData['notificationSettings.preferences'] = preferences;

    await User.findByIdAndUpdate(userId, { $set: updateData });

    res.json({ message: 'Notification settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Notification.getUnreadCount(userId);
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create notification (internal use)
// @route   POST /api/notifications/create
// @access  Private
const createNotification = async (req, res) => {
  try {
    const { user_id, type, title, message, data, scheduledFor } = req.body;

    const notification = new Notification({
      user_id,
      type,
      title,
      message,
      data,
      scheduledFor
    });

    await notification.save();

    res.status(201).json({ notification });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  createNotification,
  getUnreadCount
}; 