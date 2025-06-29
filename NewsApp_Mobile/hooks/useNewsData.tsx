import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { PUBLIC_API_KEY } from '@/constants/Config';
import { NewsDataType } from '@/types';
import { useDebouncedCallback } from './useDebouncedCallback';

interface UseNewsDataReturn {
  breakingNews: NewsDataType[];
  news: NewsDataType[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  fetchNewsByCategory: (category: string) => Promise<void>;
}

// Simple in-memory cache
const newsCache: Record<string, NewsDataType[]> = {};
let lastRefresh = 0;

export const useNewsData = (): UseNewsDataReturn => {
  const [breakingNews, setBreakingNews] = useState<NewsDataType[]>([]);
  const [news, setNews] = useState<NewsDataType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  // Helper: Retry logic for 429
  const handleApiError = useCallback((err: any, retryFn: () => void) => {
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      setError('Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.');
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
      retryTimeout.current = setTimeout(() => {
        retryFn();
      }, 7000); // retry sau 7s
    } else {
      setError(err.message || 'Không thể tải dữ liệu');
    }
  }, []);

  const fetchBreakingNews = useCallback(async () => {
    try {
      const URL = `https://newsdata.io/api/1/latest?apikey=${PUBLIC_API_KEY}&language=vi&country=vi&image=1&removeduplicate=1&size=5`;
      const response = await axios.get(URL);
      if (response?.data?.results) {
        setBreakingNews(response.data.results);
      }
    } catch (error: any) {
      handleApiError(error, fetchBreakingNews);
      throw new Error('Không thể tải tin tức nổi bật');
    }
  }, [handleApiError]);

  // Debounced fetchNewsByCategory
  const _fetchNewsByCategory = useCallback(async (category: string = '') => {
    try {
      setError(null);
      let categoryString = '';
      if (category.length !== 0) {
        categoryString = `&category=${category}`;
      }
      // Check cache
      if (newsCache[category]) {
        setNews(newsCache[category]);
        return;
      }
      const URL = `https://newsdata.io/api/1/latest?apikey=${PUBLIC_API_KEY}&language=vi&country=vi&image=1&removeduplicate=1&size=10${categoryString}`;
      const response = await axios.get(URL);
      if (response?.data?.results) {
        setNews(response.data.results);
        newsCache[category] = response.data.results;
      }
    } catch (error: any) {
      handleApiError(error, () => _fetchNewsByCategory(category));
      throw new Error('Không thể tải danh sách tin tức');
    }
  }, [handleApiError]);

  // Debounce 500ms
  const fetchNewsByCategory = useDebouncedCallback(
    (category: string) => _fetchNewsByCategory(category),
    500
  ) as (category: string) => Promise<void>;

  // Limit refresh: chỉ cho phép 1 lần mỗi 5s
  const refreshData = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefresh < 5000) {
      setError('Bạn thao tác làm mới quá nhanh, vui lòng thử lại sau!');
      return;
    }
    lastRefresh = now;
    setError(null);
    try {
      await Promise.all([fetchBreakingNews(), _fetchNewsByCategory('')]);
    } catch (error: any) {
      setError(error.message || 'Không thể làm mới dữ liệu');
    }
  }, [fetchBreakingNews, _fetchNewsByCategory]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchBreakingNews(), _fetchNewsByCategory('')]);
      } catch (error: any) {
        setError(error.message || 'Không thể tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
    return () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    }
  }, [fetchBreakingNews, _fetchNewsByCategory]);

  return {
    breakingNews,
    news,
    isLoading,
    error,
    refreshData,
    fetchNewsByCategory,
  };
}; 