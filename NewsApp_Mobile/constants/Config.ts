// API Configuration
// Get API key from newsdata.io free
//3b064333d14840cb8504d70cca0c161f  api from site free
export const PUBLIC_API_KEY = 'pub_78ea72dff8f24d26a18fd0a926ff5d30';

// Backend API Configuration
export const getBackendAPIUrl = () => {
  // Detect environment and return appropriate URL
  if (__DEV__) {
    // Development - Android emulator
    return 'http://10.0.2.2:5000/api';
  } else {
    // Production - replace with your actual domain
    return 'https://your-domain.com/api';
  }
};

export const API_BASE_URL = getBackendAPIUrl();

// Default API Parameters
export const DEFAULT_API_PARAMS = {
  language: 'vi',
  country: 'vi',
  image: 1,
  removeduplicate: 1,
}; 