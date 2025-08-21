const API_CONFIG = {
  // استخدم البورت 8000 للـ Backend
  BASE_URL: process.env.REACT_APP_API_URL || 'http://152.67.153.191:8000',
  
  // Timeout للطلبات
  TIMEOUT: 30000,
  
  // Headers الافتراضية
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

export default API_CONFIG;
