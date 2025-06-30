const NewsCache = require('../models/NewsCache');
const Analytics = require('../models/Analytics');
const axios = require('axios');

// @desc    Get cached news by category
// @route   GET /api/news/cached/:category
// @access  Public
const getCachedNews = async (req, res) => {
  try {
    const { category = 'general' } = req.params;
    const { type = 'latest' } = req.query;

    console.log(`📰 Fetching cached news for category: ${category}, type: ${type}`);

    // Check cache first
    const cached = await NewsCache.findOne({
      category,
      type,
      expiresAt: { $gt: new Date() }
    });

    if (cached) {
      console.log(`✅ Returning cached news for ${category}/${type}`);
      return res.json({
        data: cached.data,
        cached: true,
        lastUpdated: cached.lastUpdated
      });
    }

    console.log(`🔄 Cache expired, fetching fresh data for ${category}/${type}`);

    // If not cached, fetch from NewsData.io
    const newsData = await fetchFromNewsData(category, type);

    if (newsData) {
      // Cache the data for 60 minutes (increased from 30)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await NewsCache.findOneAndUpdate(
        { category, type },
        {
          data: newsData,
          expiresAt,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Fresh news cached for ${category}/${type}`);
      res.json({
        data: newsData,
        cached: false,
        lastUpdated: new Date()
      });
    } else {
      console.log(`❌ Failed to fetch news data for ${category}/${type}`);
      res.status(500).json({ message: 'Failed to fetch news data' });
    }
  } catch (error) {
    console.error('Get cached news error:', error);
    
    // If it's a 429 error, try to return stale cache
    if (error.response?.status === 429) {
      console.log(`⚠️ Rate limit hit, trying to return stale cache`);
      try {
        const staleCache = await NewsCache.findOne({
          category: req.params.category || 'general',
          type: req.query.type || 'latest'
        });
        
        if (staleCache) {
          console.log(`✅ Returning stale cache due to rate limit`);
          return res.json({
            data: staleCache.data,
            cached: true,
            lastUpdated: staleCache.lastUpdated,
            stale: true
          });
        }
      } catch (staleError) {
        console.error('Error fetching stale cache:', staleError);
      }
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get breaking news (cached)
// @route   GET /api/news/breaking
// @access  Public
const getBreakingNews = async (req, res) => {
  try {
    const cached = await NewsCache.findOne({
      category: 'general',
      type: 'breaking',
      expiresAt: { $gt: new Date() }
    });

    if (cached) {
      return res.json({
        data: cached.data,
        cached: true,
        lastUpdated: cached.lastUpdated
      });
    }

    // Fetch breaking news
    const newsData = await fetchFromNewsData('general', 'breaking');

    if (newsData) {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes for breaking news

      await NewsCache.findOneAndUpdate(
        { category: 'general', type: 'breaking' },
        {
          data: newsData,
          expiresAt,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      res.json({
        data: newsData,
        cached: false,
        lastUpdated: new Date()
      });
    } else {
      res.status(500).json({ message: 'Failed to fetch breaking news' });
    }
  } catch (error) {
    console.error('Get breaking news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Track article view
// @route   POST /api/news/track-view
// @access  Private
const trackArticleView = async (req, res) => {
  try {
    const { article_id, category, title } = req.body;

    const analytics = new Analytics({
      type: 'article_view',
      user: req.user._id,
      article_id,
      category,
      metadata: { title }
    });

    await analytics.save();

    res.json({ message: 'View tracked successfully' });
  } catch (error) {
    console.error('Track article view error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Track category view
// @route   POST /api/news/track-category
// @access  Private
const trackCategoryView = async (req, res) => {
  try {
    const { category } = req.body;

    const analytics = new Analytics({
      type: 'category_view',
      user: req.user._id,
      category
    });

    await analytics.save();

    res.json({ message: 'Category view tracked successfully' });
  } catch (error) {
    console.error('Track category view error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get popular articles (analytics)
// @route   GET /api/news/popular
// @access  Public
const getPopularArticles = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const popularArticles = await Analytics.aggregate([
      {
        $match: {
          type: 'article_view',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$article_id',
          viewCount: { $sum: 1 },
          categories: { $addToSet: '$category' },
          metadata: { $first: '$metadata' }
        }
      },
      {
        $sort: { viewCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(popularArticles);
  } catch (error) {
    console.error('Get popular articles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to fetch from NewsData.io
const fetchFromNewsData = async (category, type) => {
  try {
    const API_KEY = process.env.NEWSDATA_API_KEY || 'pub_78ea72dff8f24d26a18fd0a926ff5d30';
    const baseUrl = 'https://newsdata.io/api/1/latest';

    let url = `${baseUrl}?apikey=${API_KEY}&language=vi&country=vi&image=1&removeduplicate=1`;

    if (category && category !== 'general') {
      url += `&category=${category}`;
    }

    if (type === 'breaking') {
      url += '&size=5';
    } else {
      url += '&size=10';
    }

    console.log(`🌐 Fetching from NewsData.io: ${category}/${type}`);

    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'NewsApp/1.0'
      }
    });

    console.log(`✅ NewsData.io response received for ${category}/${type}`);
    return response.data;
  } catch (error) {
    console.error('Fetch from NewsData error:', error);
    
    if (error.response?.status === 429) {
      console.log(`⚠️ NewsData.io rate limit exceeded for ${category}/${type}`);
      throw new Error('Rate limit exceeded');
    }
    
    if (error.code === 'ECONNABORTED') {
      console.log(`⚠️ NewsData.io request timeout for ${category}/${type}`);
      throw new Error('Request timeout');
    }
    
    throw error;
  }
};

module.exports = {
  getCachedNews,
  getBreakingNews,
  trackArticleView,
  trackCategoryView,
  getPopularArticles
}; 