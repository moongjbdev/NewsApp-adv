const Bookmark = require('../models/Bookmark');

// @desc    Get user bookmarks
// @route   GET /api/user/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const bookmarks = await Bookmark.find({ user: req.user._id })
      .sort({ bookmarkedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Bookmark.countDocuments({ user: req.user._id });

    res.json({
      bookmarks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add bookmark
// @route   POST /api/user/bookmarks
// @access  Private
const addBookmark = async (req, res) => {
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
      pubDate
    } = req.body;

    // Validate required fields
    if (!article_id || !title || !link) {
      return res.status(400).json({ 
        message: 'article_id, title, and link are required' 
      });
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({ 
      user: req.user._id, 
      article_id 
    });

    if (existing) {
      return res.status(400).json({ message: 'Article already bookmarked' });
    }

    const bookmark = new Bookmark({
      user: req.user._id,
      article_id,
      title,
      description,
      image_url,
      source_name,
      source_url,
      link,
      category,
      pubDate
    });

    await bookmark.save();

    res.status(201).json({
      message: 'Article bookmarked successfully',
      bookmark
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/user/bookmarks/:article_id
// @access  Private
const removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user._id,
      article_id: req.params.article_id
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if article is bookmarked
// @route   GET /api/user/bookmarks/check/:article_id
// @access  Private
const checkBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      user: req.user._id,
      article_id: req.params.article_id
    });

    res.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear all bookmarks
// @route   DELETE /api/user/bookmarks
// @access  Private
const clearBookmarks = async (req, res) => {
  try {
    await Bookmark.deleteMany({ user: req.user._id });
    res.json({ message: 'All bookmarks cleared' });
  } catch (error) {
    console.error('Clear bookmarks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark,
  clearBookmarks
}; 