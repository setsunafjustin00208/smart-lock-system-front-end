import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request priority for critical endpoints
    if (config.url?.includes('/auth/login') || config.url?.includes('/locks')) {
      config.priority = 'high'
    } else if (config.url?.includes('/notifications')) {
      config.priority = 'low'
      // Shorter timeout for notifications to prevent blocking
      config.timeout = 8000
    }
    
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Don't retry notification requests to prevent cascading failures
    if (originalRequest.url?.includes('/notifications')) {
      console.warn('Notification request failed:', error.message)
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          })
          
          const newToken = response.data.data.token
          localStorage.setItem('auth_token', newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          window.location.href = '/lockey/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
