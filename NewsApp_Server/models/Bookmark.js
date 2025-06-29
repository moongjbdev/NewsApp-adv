const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  article_id: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image_url: {
    type: String,
    trim: true
  },
  source_name: {
    type: String,
    trim: true
  },
  source_url: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    required: true,
    trim: true
  },
  category: [{
    type: String,
    trim: true
  }],
  pubDate: {
    type: String,
    trim: true
  },
  bookmarkedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries - chỉ tạo unique index khi article_id không null
bookmarkSchema.index({ user: 1, bookmarkedAt: -1 });
bookmarkSchema.index({ user: 1, article_id: 1 }, { 
  unique: true,
  partialFilterExpression: { article_id: { $exists: true, $ne: null } }
});

module.exports = mongoose.model('Bookmark', bookmarkSchema); 