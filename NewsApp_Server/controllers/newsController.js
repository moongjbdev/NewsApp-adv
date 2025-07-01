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
    let cached = await NewsCache.findOne({
      category,
      type,
      // Bỏ kiểm tra expiresAt để luôn lấy cache nếu có
    });

    // Nếu cache còn hạn thì trả luôn
    if (cached && cached.expiresAt > new Date()) {
      console.log(`✅ Returning cached news for ${category}/${type}`);
      return res.json({
        data: cached.data,
        cached: true,
        lastUpdated: cached.lastUpdated
      });
    }

    console.log(`🔄 Cache expired or not found, fetching fresh data for ${category}/${type}`);

    // Nếu cache hết hạn, vẫn giữ lại để fallback nếu call NewsData.io lỗi
    let staleCache = cached;

    // If not cached or cache expired, fetch from NewsData.io
    let newsData;
    try {
      newsData = await fetchFromNewsData(category, type);
    } catch (error) {
      console.error('Fetch from NewsData.io error:', error);
      // Nếu bị lỗi (kể cả 429), trả về cache cũ nếu có
      if (staleCache) {
        console.log(`⚠️ Returning stale cache due to NewsData.io error`);
        return res.json({
          data: staleCache.data,
          cached: true,
          lastUpdated: staleCache.lastUpdated,
          stale: true
        });
      }
      return res.status(500).json({ message: 'Failed to fetch news data' });
    }

    if (newsData) {
      // Cache the data for 10 minutes (phù hợp demo)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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
    } else if (staleCache) {
      // Nếu không lấy được newsData nhưng có cache cũ thì trả về cache cũ
      console.log(`⚠️ Returning stale cache as fallback`);
      res.json({
        data: staleCache.data,
        cached: true,
        lastUpdated: staleCache.lastUpdated,
        stale: true
      });
    } else {
      res.status(500).json({ message: 'Failed to fetch news data' });
    }
  } catch (error) {
    console.error('Get cached news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get breaking news (cached)
// @route   GET /api/news/breaking
// @access  Public
const getBreakingNews = async (req, res) => {
  try {
    let cached = await NewsCache.findOne({
      category: 'general',
      type: 'breaking',
      // Bỏ kiểm tra expiresAt để luôn lấy cache nếu có
    });

    if (cached && cached.expiresAt > new Date()) {
      return res.json({
        data: cached.data,
        cached: true,
        lastUpdated: cached.lastUpdated
      });
    }

    let staleCache = cached;
    let newsData;
    try {
      newsData = await fetchFromNewsData('general', 'breaking');
    } catch (error) {
      console.error('Fetch from NewsData.io error:', error);
      if (staleCache) {
        return res.json({
          data: staleCache.data,
          cached: true,
          lastUpdated: staleCache.lastUpdated,
          stale: true
        });
      }
      return res.status(500).json({ message: 'Failed to fetch breaking news' });
    }

    if (newsData) {
      // Cache breaking news for 5 phút (phù hợp demo)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

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
    } else if (staleCache) {
      res.json({
        data: staleCache.data,
        cached: true,
        lastUpdated: staleCache.lastUpdated,
        stale: true
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
    const API_KEY = process.env.NEWSDATA_API_KEY;
    
    if (!API_KEY) {
      throw new Error('NEWSDATA_API_KEY not configured');
    }
    
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