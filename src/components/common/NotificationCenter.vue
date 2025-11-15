<template>
  <div class="notification-center">
    <div class="dropdown" :class="{ 'is-active': isOpen }">
      <div class="dropdown-trigger">
        <button 
          class="button is-ghost has-text-white"
          @click="toggleDropdown"
          aria-haspopup="true"
          aria-controls="notification-menu"
        >
          <span class="icon">
            <i class="fas fa-bell"></i>
          </span>
          <span v-if="unreadCount > 0" class="notification-badge">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        </button>
      </div>
      
      <!-- Mobile Modal -->
      <Teleport to="body" :disabled="!isMobile">
        <div v-if="isOpen && isMobile" class="notification-modal" @click="closeModal">
          <div class="notification-modal-content" @click.stop>
          <div class="notification-header">
            <h6 class="title is-6 mb-2">Notifications</h6>
            <div class="buttons are-small">
              <button 
                v-if="unreadCount > 0"
                class="button is-small is-text"
                @click="markAllAsRead"
              >
                Mark all read
              </button>
              <button 
                class="button is-small is-text"
                @click="refreshNotifications"
                :class="{ 'is-loading': loading }"
              >
                <i class="fas fa-sync-alt"></i>
              </button>
              <button class="button is-small" @click="closeModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="notification-list">
            <div v-if="loading && notifications.length === 0" class="notification-item">
              <div class="has-text-centered py-4">
                <i class="fas fa-spinner fa-spin"></i>
                <p class="mt-2">Loading notifications...</p>
              </div>
            </div>
            
            <div v-else-if="notifications.length === 0" class="notification-item">
              <div class="has-text-centered py-4">
                <i class="fas fa-bell-slash has-text-grey-light"></i>
                <p class="mt-2 has-text-grey">No notifications</p>
              </div>
            </div>
            
            <div 
              v-else
              v-for="notification in notifications" 
              :key="notification.id"
              class="notification-item"
              :class="{ 'is-unread': !notification.is_read }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-content">
                <div class="notification-icon">
                  <i :class="getNotificationIcon(notification.type)"></i>
                </div>
                <div class="notification-body">
                  <p class="notification-title">{{ notification.title }}</p>
                  <p class="notification-message">{{ notification.message }}</p>
                  <p class="notification-time">{{ formatTime(notification.created_at) }}</p>
                </div>
                <div class="notification-actions">
                  <button 
                    v-if="!notification.is_read"
                    class="button is-small is-text"
                    @click.stop="markAsRead(notification.id)"
                    title="Mark as read"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button 
                    class="button is-small is-text has-text-danger"
                    @click.stop="deleteNotification(notification.id)"
                    title="Delete"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </Teleport>
      
      <!-- Desktop Dropdown -->
      <div class="dropdown-menu desktop-only" id="notification-menu" role="menu">
        <div class="dropdown-content">
          <div class="notification-header">
            <h6 class="title is-6 mb-2">Notifications</h6>
            <div class="buttons are-small">
              <button 
                v-if="unreadCount > 0"
                class="button is-small is-text"
                @click="markAllAsRead"
              >
                Mark all read
              </button>
              <button 
                class="button is-small is-text"
                @click="refreshNotifications"
                :class="{ 'is-loading': loading }"
              >
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
          
          <div class="notification-list">
            <div v-if="loading && notifications.length === 0" class="notification-item">
              <div class="has-text-centered py-4">
                <i class="fas fa-spinner fa-spin"></i>
                <p class="mt-2">Loading notifications...</p>
              </div>
            </div>
            
            <div v-else-if="notifications.length === 0" class="notification-item">
              <div class="has-text-centered py-4">
                <i class="fas fa-bell-slash has-text-grey-light"></i>
                <p class="mt-2 has-text-grey">No notifications</p>
              </div>
            </div>
            
            <div 
              v-else
              v-for="notification in notifications" 
              :key="notification.id"
              class="notification-item"
              :class="{ 'is-unread': !notification.is_read }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-content">
                <div class="notification-icon">
                  <i :class="getNotificationIcon(notification.type)"></i>
                </div>
                <div class="notification-body">
                  <p class="notification-title">{{ notification.title }}</p>
                  <p class="notification-message">{{ notification.message }}</p>
                  <p class="notification-time">{{ formatTime(notification.created_at) }}</p>
                </div>
                <div class="notification-actions">
                  <button 
                    v-if="!notification.is_read"
                    class="button is-small is-text"
                    @click.stop="markAsRead(notification.id)"
                    title="Mark as read"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button 
                    class="button is-small is-text has-text-danger"
                    @click.stop="deleteNotification(notification.id)"
                    title="Delete"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { notificationManager } from '@/services/notificationManager'
import { formatDistanceToNow } from 'date-fns'

const notificationsStore = useNotificationsStore()
const isOpen = ref(false)
const isMobile = ref(window.innerWidth <= 768)

const notifications = computed(() => notificationsStore.notifications.slice(0, 10))
const unreadCount = computed(() => notificationsStore.unreadCount)
const loading = computed(() => notificationsStore.loading)

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    await refreshNotifications()
  }
}

const refreshNotifications = async () => {
  await notificationsStore.fetchNotifications(true)
}

const markAsRead = async (notificationId) => {
  await notificationsStore.markAsRead(notificationId)
}

const markAllAsRead = async () => {
  await notificationsStore.markAllAsRead()
}

const deleteNotification = async (notificationId) => {
  await notificationsStore.deleteNotification(notificationId)
}

const handleNotificationClick = async (notification) => {
  if (!notification.is_read) {
    await markAsRead(notification.id)
  }
  
  // Handle navigation based on notification type
  if (notification.type === 'lock_status' && notification.lock_id) {
    // Navigate to locks page or specific lock
    console.log('Navigate to lock:', notification.lock_id)
  }
}

const viewAllNotifications = () => {
  isOpen.value = false
  // Navigate to notifications page
  console.log('Navigate to all notifications')
}

const closeModal = () => {
  isOpen.value = false
}

const getNotificationIcon = (type) => {
  const icons = {
    lock_status: 'fas fa-lock text-info',
    battery_alert: 'fas fa-battery-quarter text-warning',
    system_alert: 'fas fa-exclamation-triangle text-danger',
    user_action: 'fas fa-user text-primary',
    status_alert: 'fas fa-wifi text-warning'
  }
  return icons[type] || 'fas fa-bell text-info'
}

const formatTime = (timestamp) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.notification-center')) {
    isOpen.value = false
  }
}

// Handle window resize for mobile detection
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  // Start notification manager
  notificationManager.start()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  // Don't stop notification manager here - let it run globally
})
</script>

<style scoped>
.notification-center {
  position: relative;
}

/* Force notification button to be white in navbar */
.button.is-ghost.has-text-white {
  color: white !important;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff3860;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
}

.dropdown-menu {
  min-width: 350px;
  max-width: 400px;
  right: 0;
  left: auto;
}

.dropdown-content {
  background: white;
  color: black;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e8e8e8;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.is-unread {
  background-color: #f0f8ff;
  border-left: 3px solid #3273dc;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #363636;
}

.notification-message {
  font-size: 0.875rem;
  color: #4a4a4a;
  margin-bottom: 0.25rem;
  word-wrap: break-word;
}

.notification-time {
  font-size: 0.75rem;
  color: #7a7a7a;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.notification-footer {
  padding: 0.75rem 1rem;
  text-align: center;
  border-top: 1px solid #e8e8e8;
}

/* Color overrides for white background */
.notification-title {
  color: black !important;
}

.notification-message {
  color: #333 !important;
}

.notification-time {
  color: #666 !important;
}

.notification-header .title,
.notification-header h6.title {
  color: black !important;
}

.notification-footer a {
  color: black !important;
}

/* Mobile Modal Styles */
.notification-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1rem;
  padding-top: 4rem;
}

.notification-modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Hide desktop dropdown on mobile */
@media screen and (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

/* Hide modal on desktop */
@media screen and (min-width: 769px) {
  .notification-modal {
    display: none !important;
  }
}
</style>