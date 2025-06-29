const User = require('../models/User');
const ReadingHistory = require('../models/ReadingHistory');
const Bookmark = require('../models/Bookmark');

// @desc    Get user preferences
// @route   GET /api/user/preferences
// @access  Private
const getUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    res.json(user.preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user preferences
// @route   PUT /api/user/preferences
// @access  Private
const updateUserPreferences = async (req, res) => {
  try {
    const { favoriteCategories, language, country, theme, notifications } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (favoriteCategories) user.preferences.favoriteCategories = favoriteCategories;
    if (language) user.preferences.language = language;
    if (country) user.preferences.country = country;
    if (theme) user.preferences.theme = theme;
    if (notifications) user.preferences.notifications = { ...user.preferences.notifications, ...notifications };

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reading history
// @route   GET /api/user/reading-history
// @access  Private
const getReadingHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const history = await ReadingHistory.find({ user: req.user._id })
      .sort({ readAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReadingHistory.countDocuments({ user: req.user._id });

    res.json({
      history,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get reading history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add to reading history
// @route   POST /api/user/reading-history
// @access  Private
const addToReadingHistory = async (req, res) => {
  try {
    const {
      article_id,
      title,
      description,
      image_url,
      source_name,
      source_url,
      link,
      category,
      pubDate,
      readingTime
    } = req.body;

    // Validate required fields
    if (!article_id || !title || !link) {
      return res.status(400).json({ 
        message: 'article_id, title, and link are required' 
      });
    }

    // Check if already exists
    const existing = await ReadingHistory.findOne({ 
      user: req.user._id, 
      article_id 
    });

    if (existing) {
      // Update existing record
      existing.readAt = new Date();
      existing.readingTime = readingTime || existing.readingTime;
      await existing.save();
    } else {
      // Create new record
      const history = new ReadingHistory({
        user: req.user._id,
        article_id,
        title,
        description,
        image_url,
        source_name,
        source_url,
        link,
        category,
        pubDate,
        readingTime
      });
      await history.save();
    }

    // Update user reading stats
    const user = await User.findById(req.user._id);
    user.readingStats.totalArticlesRead += 1;
    user.readingStats.totalReadingTime += readingTime || 0;
    user.readingStats.lastActiveDate = new Date();
    await user.save();

    res.json({ message: 'Added to reading history' });
  } catch (error) {
    console.error('Add reading history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear reading history
// @route   DELETE /api/user/reading-history
// @access  Private
const clearReadingHistory = async (req, res) => {
  try {
    await ReadingHistory.deleteMany({ user: req.user._id });
    res.json({ message: 'Reading history cleared' });
  } catch (error) {
    console.error('Clear reading history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user stats
// @route   GET /api/user/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('readingStats');
    const totalBookmarks = await Bookmark.countDocuments({ user: req.user._id });
    const totalHistory = await ReadingHistory.countDocuments({ user: req.user._id });

    res.json({
      readingStats: user.readingStats,
      totalBookmarks,
      totalHistory
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  getReadingHistory,
  addToReadingHistory,
  clearReadingHistory,
  getUserStats
}; 