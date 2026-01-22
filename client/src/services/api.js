import axios from 'axios'
import { addAntiScrapingHeaders } from '../utils/antiScraping'

// 动态获取API基础URL
// 开发环境：优先使用相对路径让Vite proxy转发，如果proxy不工作则使用当前host
// 生产环境：使用环境变量或当前host的API地址
const getApiBaseUrl = () => {
  // 如果设置了环境变量，优先使用
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // 在浏览器环境中，根据当前访问的host决定
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const protocol = window.location.protocol
    
    // 如果是localhost或127.0.0.1，使用相对路径（依赖Vite proxy）
    if (host === 'localhost' || host === '127.0.0.1') {
      return '/api'
    }
    
    // 如果是局域网IP（192.168.x.x或10.x.x.x等），使用该IP的5000端口
    if (host.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return `http://${host}:5000/api`
    }
    
    // 其他情况，尝试使用相对路径
    return '/api'
  }
  
  // 默认fallback
  return 'http://localhost:5000/api'
}

const API_BASE_URL = getApiBaseUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 为所有API请求添加反爬虫头
api.interceptors.request.use(addAntiScrapingHeaders, (error) => {
  return Promise.reject(error);
});

// Products API
export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)

// Locations API
export const getLocations = (params) => api.get('/locations', { params })
export const getLocation = (id) => api.get(`/locations/${id}`)

// Events API
export const getEvents = (params) => api.get('/events', { params })
export const getEvent = (id) => api.get(`/events/${id}`)

// Guides API
export const getGuides = (params) => api.get('/guides', { params })
export const getGuide = (id) => api.get(`/guides/${id}`)

// Orders API
export const createOrder = (orderData) => {
  const token = localStorage.getItem('userToken');
  const config = {};
  if (token) {
    config.headers = { Authorization: `Bearer ${token}` };
  }
  return api.post('/orders', orderData, config);
}
export const getOrder = (id) => api.get(`/orders/${id}`)
export const getUserOrders = (email) => api.get(`/orders/user/${email}`)
export const getMyOrders = (params) => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    return Promise.reject(new Error('User not logged in'));
  }
  return api.get('/orders/my-orders', {
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
}
export const payOrder = (id) => {
  const token = localStorage.getItem('userToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return api.post(`/orders/${id}/pay`, {}, { headers });
}

// Admin API
const getAdminToken = () => localStorage.getItem('adminToken');

// Create authenticated API instance for admin
const getAdminApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return '/api';
    }
    if (host.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return `http://${host}:5000/api`;
    }
    return '/api';
  }
  return 'http://localhost:5000/api';
};

// User Auth API
const getUserToken = () => localStorage.getItem('userToken');

// Create authenticated API instance for users
const userApi = axios.create({
  baseURL: getAdminApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to user requests
userApi.interceptors.request.use((config) => {
  const token = getUserToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return addAntiScrapingHeaders(config);
}, (error) => {
  return Promise.reject(error);
});

export const register = (userData) => api.post('/users/register', userData)
export const login = (email, password) => api.post('/users/login', { email, password })
export const verifyUserToken = (token) => api.post('/users/verify', { token })
export const getUserInfo = () => userApi.get('/users/me')
export const updateUserInfo = (userData) => userApi.put('/users/me', userData)
export const updatePassword = (currentPassword, newPassword) => 
  userApi.put('/users/me/password', { currentPassword, newPassword })
export const updateAddresses = (addresses, defaultAddressIndex) => 
  userApi.put('/users/me/addresses', { addresses, defaultAddressIndex })

export const adminApi = axios.create({
  baseURL: getAdminApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token and anti-scraping headers to admin requests
adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // 同时添加反爬虫头
  return addAntiScrapingHeaders(config);
}, (error) => {
  return Promise.reject(error);
});

// Admin Auth API
export const adminLogin = (username, password) => api.post('/auth/login', { username, password })
export const adminVerify = (token) => api.post('/auth/verify', { token })

// Admin Products API
export const adminGetProducts = (params) => adminApi.get('/products', { params: { ...params, all: 'true' } })
export const adminCreateProduct = (productData) => adminApi.post('/products', productData)
export const adminUpdateProduct = (id, productData) => adminApi.put(`/products/${id}`, productData)
export const adminDeleteProduct = (id) => adminApi.delete(`/products/${id}`)

// Admin Events API
export const adminGetEvents = (params) => adminApi.get('/events', { params })
export const adminCreateEvent = (eventData) => adminApi.post('/events', eventData)
export const adminUpdateEvent = (id, eventData) => adminApi.put(`/events/${id}`, eventData)
export const adminDeleteEvent = (id) => adminApi.delete(`/events/${id}`)

// Admin Locations API
export const adminGetLocations = (params) => adminApi.get('/locations', { params: { ...params, all: 'true' } })
export const adminCreateLocation = (locationData) => adminApi.post('/locations', locationData)
export const adminUpdateLocation = (id, locationData) => adminApi.put(`/locations/${id}`, locationData)
export const adminDeleteLocation = (id) => adminApi.delete(`/locations/${id}`)

// Admin Guides API
export const adminGetGuides = (params) => adminApi.get('/guides', { params: { ...params, all: 'true' } })
export const adminCreateGuide = (guideData) => adminApi.post('/guides', guideData)
export const adminUpdateGuide = (id, guideData) => adminApi.put(`/guides/${id}`, guideData)
export const adminDeleteGuide = (id) => adminApi.delete(`/guides/${id}`)

// Admin Upload API
export const adminUploadImages = async (type, id, files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  
  const token = getAdminToken();
  const baseURL = getAdminApiBaseUrl();
  
  const response = await axios.post(
    `${baseURL}/upload/${type}/${id}`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response;
};

export const adminDeleteImage = (type, id, filepath) => {
  return adminApi.delete(`/upload/${type}/${id}`, { data: { filepath } });
};

// Admin Orders API
export const adminGetOrders = (params) => adminApi.get('/orders', { params })
export const adminGetOrder = (id) => adminApi.get(`/orders/${id}`)
export const adminUpdateOrderStatus = (id, updateData) => adminApi.patch(`/orders/${id}/status`, updateData)
export const adminCancelOrder = (id) => adminApi.post(`/orders/${id}/cancel`)
export const adminShipOrder = (id, shippingData) => adminApi.post(`/orders/${id}/ship`, shippingData)
export const adminUpdateShippingInfo = (id, shippingData) => adminApi.patch(`/orders/${id}/shipping`, shippingData)

// Admin WeChat Scraper API
export const scrapeWeChatArticle = (scrapingConfig) => {
  return adminApi.post('/scrape-wechat', scrapingConfig);
};

export default api
