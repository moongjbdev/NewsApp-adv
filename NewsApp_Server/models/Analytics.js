const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['article_view', 'category_view', 'search', 'user_activity'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  article_id: {
    type: String
  },
  category: {
    type: String
  },
  searchQuery: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ user: 1, timestamp: -1 });
analyticsSchema.index({ article_id: 1, timestamp: -1 });
analyticsSchema.index({ category: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema); 