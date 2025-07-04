import { Platform } from 'react-native';

// API Configuration
// Get API key from newsdata.io free
//3b064333d14840cb8504d70cca0c161f  api from site free
// export const PUBLIC_API_KEY = 'pub_78ea72dff8f24d26a18fd0a926ff5d30';
export const PUBLIC_API_KEY = 'pub_2e6bf1dcbf5441988b2b4ab6c5ee14a1';


// Backend API Configuration
export const getBackendAPIUrl = () => {
  // Detect environment and return appropriate URL
  if (__DEV__) {
    // Development - try multiple URLs for different environments
    // Android emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';
    }
    // iOS simulator
    if (Platform.OS === 'ios') {
      return 'http://localhost:5000/api';
    }
    // Device thật hoặc web
    return 'http://192.168.1.40:5000/api';
  } else {
    // Production - replace with your actual domain
    return 'https://your-domain.com/api';
  }
};

// Fallback API URL nếu Platform không hoạt động
export const API_BASE_URL = __DEV__ ? 'http://10.0.2.2:5000/api' : 'https://your-domain.com/api';

// Default API Parameters
export const DEFAULT_API_PARAMS = {
  language: 'vi',
  country: 'vi',
  image: 1,
  removeduplicate: 1,
};

// App Configuration
export const APP_CONFIG = {
  name: 'NewsApp',
  version: '1.0.0',
  buildNumber: '1',
  environment: __DEV__ ? 'development' : 'production',
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableNotifications: true,
  enableComments: true,
  enableBookmarks: true,
  enableAnalytics: true,
  enableRealtimeUpdates: true,
};

// Cache Configuration
export const CACHE_CONFIG = {
  newsCacheDuration: 60 * 60 * 1000, // 1 hour
  userDataCacheDuration: 30 * 60 * 1000, // 30 minutes
  maxCacheSize: 50 * 1024 * 1024, // 50MB
}; 