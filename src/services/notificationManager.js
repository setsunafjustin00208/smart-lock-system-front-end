import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'

class NotificationManager {
  constructor() {
    this.pollingInterval = null
    this.isPolling = false
    this.retryCount = 0
    this.maxRetries = 3
  }

  start() {
    if (this.isPolling) return
    
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return
    
    this.isPolling = true
    this.retryCount = 0
    
    // Start polling with error handling
    this.pollingInterval = setInterval(async () => {
      await this.pollNotifications()
    }, 10000) // Increased to 10 seconds to reduce load
    
    // Initial fetch
    this.pollNotifications()
  }

  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    this.isPolling = false
    this.retryCount = 0
  }

  async pollNotifications() {
    try {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.stop()
        return
      }

      const notificationsStore = useNotificationsStore()
      await notificationsStore.fetchNotifications(true) // Only unread
      
      // Reset retry count on success
      this.retryCount = 0
    } catch (error) {
      console.warn('Notification polling error:', error)
      
      this.retryCount++
      if (this.retryCount >= this.maxRetries) {
        console.warn('Max notification polling retries reached, stopping')
        this.stop()
      }
    }
  }

  restart() {
    this.stop()
    setTimeout(() => this.start(), 1000)
  }
}

export const notificationManager = new NotificationManager()
