import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { notificationManager } from '@/services/notificationManager'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))

  const isAuthenticated = computed(() => !!token.value)
  
  const hasRole = (role) => {
    return user.value?.roles?.includes(role) || user.value?.roles?.includes('admin')
  }

  const isAdmin = computed(() => user.value?.roles?.includes('admin'))
  const isManager = computed(() => user.value?.roles?.includes('manager'))

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { user: userData, token: authToken, refresh_token } = response.data.data
      
      user.value = userData
      token.value = authToken
      refreshToken.value = refresh_token
      
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Start notification manager after successful login
      setTimeout(() => {
        notificationManager.start()
      }, 1000)
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.response?.data?.messages?.error || 'Login failed' 
      }
    }
  }

  const logout = async () => {
    try {
      // Stop notification manager first
      notificationManager.stop()
      
      if (token.value) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      token.value = null
      refreshToken.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      
      // Clear notifications store
      const { useNotificationsStore } = await import('./notifications')
      const notificationsStore = useNotificationsStore()
      notificationsStore.clearNotifications()
    }
  }

  const checkAuth = () => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      
      // Start notification manager for existing session
      setTimeout(() => {
        notificationManager.start()
      }, 2000)
    }
  }

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isAdmin,
    isManager,
    hasRole,
    login,
    logout,
    checkAuth
  }
})
