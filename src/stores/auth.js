import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)
  
  const hasRole = (role) => {
    return user.value?.role === role || user.value?.role === 'admin'
  }

  const login = async (credentials) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (credentials.username === 'admin' && credentials.password === 'admin') {
          const mockUser = {
            id: 1,
            username: 'admin',
            email: 'admin@smartlock.com',
            role: 'admin',
            name: 'System Administrator'
          }
          const mockToken = 'mock-jwt-token-' + Date.now()
          
          user.value = mockUser
          token.value = mockToken
          localStorage.setItem('token', mockToken)
          localStorage.setItem('user', JSON.stringify(mockUser))
          
          resolve({ success: true, user: mockUser })
        } else {
          resolve({ success: false, message: 'Invalid credentials' })
        }
      }, 1000)
    })
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const checkAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    hasRole,
    login,
    logout,
    checkAuth
  }
})
