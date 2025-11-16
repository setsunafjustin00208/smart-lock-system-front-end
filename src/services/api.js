import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000  // Reduced from 30s to 10s for faster feedback
})

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired(token)) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(new Error('Token expired'))
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add retry logic for tunnel instability
    config.retry = config.retry || 0
    config.retryDelay = config.retryDelay || 1000
    
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor for token refresh and retry logic
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Handle network errors with retry
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      if (originalRequest.retry < 2) {
        originalRequest.retry += 1
        await new Promise(resolve => setTimeout(resolve, originalRequest.retryDelay))
        return api(originalRequest)
      }
    }

    // Don't retry notification requests to prevent cascading failures
    if (originalRequest.url?.includes('/notifications')) {
      console.warn('Notification request failed:', error.message)
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Token expired, redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    return Promise.reject(error)
  }
)

export default api
