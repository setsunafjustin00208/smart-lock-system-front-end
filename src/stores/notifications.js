import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const lastFetch = ref(null)
  
  const toast = useToast()

  const fetchNotifications = async (unreadOnly = false) => {
    // Prevent concurrent requests
    if (loading.value) return { notifications: [], unread_count: 0 }
    
    try {
      loading.value = true
      const params = unreadOnly ? '?unread_only=true&limit=10' : '?limit=50'
      
      // Add timeout for notification requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await api.get(`/notifications${params}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      notifications.value = response.data.data.notifications
      unreadCount.value = response.data.data.unread_count
      lastFetch.value = new Date()
      
      return response.data.data
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Notification request timed out')
      } else {
        console.error('Failed to fetch notifications:', error)
      }
      return { notifications: [], unread_count: 0 }
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      
      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification && !notification.is_read) {
        notification.is_read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      
      return true
    } catch (error) {
      toast.error('Failed to mark notification as read')
      return false
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      
      // Update local state
      notifications.value.forEach(notification => {
        notification.is_read = true
      })
      unreadCount.value = 0
      
      toast.success('All notifications marked as read')
      return true
    } catch (error) {
      toast.error('Failed to mark all notifications as read')
      return false
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      
      // Remove from local state
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        const notification = notifications.value[index]
        if (!notification.is_read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }
      
      toast.success('Notification deleted')
      return true
    } catch (error) {
      toast.error('Failed to delete notification')
      return false
    }
  }

  // Remove polling methods - handled by notificationManager
  const clearNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
    lastFetch.value = null
  }

  return {
    notifications,
    unreadCount,
    loading,
    lastFetch,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications
  }
})
