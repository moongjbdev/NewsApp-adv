const mongoose = require('mongoose');

const newsCacheSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    default: 'general'
  },
  type: {
    type: String,
    enum: ['latest', 'breaking', 'featured'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
newsCacheSchema.index({ category: 1, type: 1 });
newsCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('NewsCache', newsCacheSchema); 