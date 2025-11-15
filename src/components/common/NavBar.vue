<template>
  <nav class="navbar is-fixed-top glass-effect" role="navigation">
    <div class="navbar-brand">
      <!-- Mobile sidebar burger (left side) -->
      <a 
        role="button" 
        class="navbar-burger has-text-white is-hidden-desktop sidebar-burger" 
        @click="showSidebar = true"
      >
        <span></span>
        <span></span>
        <span></span>
      </a>
      
      <router-link class="navbar-item" to="/">
        <img src="/logo-brand.png" alt="LocKEY Logo" style="height: 48px;">
      </router-link>
      
      <!-- Mobile notification bell (right side) -->
      <div class="navbar-item is-hidden-desktop mobile-notification">
        <NotificationCenter />
      </div>
    </div>

    <div class="navbar-menu is-hidden-touch" :class="{ 'is-active': showMobileMenu }">
      <div class="navbar-start">
        <router-link class="navbar-item has-text-white" to="/">
          <i class="fas fa-tachometer-alt mr-2"></i>
          Dashboard
        </router-link>
        <router-link class="navbar-item has-text-white" to="/locks">
          <i class="fas fa-key mr-2"></i>
          Locks
        </router-link>
        <router-link 
          v-if="authStore.hasRole('admin')" 
          class="navbar-item has-text-white" 
          to="/users"
        >
          <i class="fas fa-users mr-2"></i>
          Users
        </router-link>
        <router-link class="navbar-item has-text-white" to="/settings">
          <i class="fas fa-cog mr-2"></i>
          Settings
        </router-link>
      </div>

      <div class="navbar-end">        
        <!-- Notification Center - visible on all devices -->
        <div class="navbar-item">
          <NotificationCenter />
        </div>
        
        <div class="navbar-item">
          <div class="dropdown is-right" :class="{ 'is-active': showUserMenu }">
            <div class="dropdown-trigger">
              <button 
                class="button is-small is-outlined is-white"
                @click="showUserMenu = !showUserMenu"
              >
                <i class="fas fa-user mr-1"></i>
                <span>{{ authStore.user?.username }}</span>
                <i class="fas fa-angle-down ml-1"></i>
              </button>
            </div>
            <div class="dropdown-menu">
              <div class="dropdown-content">
                <a class="dropdown-item" @click="logout">
                  <i class="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Mobile Sidebar (kept for future use) -->
  <MobileSidebar :is-open="showSidebar" @close="showSidebar = false" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import NotificationCenter from './NotificationCenter.vue'
import MobileSidebar from './MobileSidebar.vue'

const router = useRouter()
const authStore = useAuthStore()

const showMobileMenu = ref(false)
const showSidebar = ref(false)
const showUserMenu = ref(false)

const appName = computed(() => __APP_NAME__)

// Swipe gesture variables
let startX = 0
let startY = 0
let currentX = 0
let currentY = 0
let isSwipeActive = false

const handleTouchStart = (e) => {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  isSwipeActive = true
}

const handleTouchMove = (e) => {
  if (!isSwipeActive) return
  
  currentX = e.touches[0].clientX
  currentY = e.touches[0].clientY
}

const handleTouchEnd = () => {
  if (!isSwipeActive) return
  
  const deltaX = currentX - startX
  const deltaY = Math.abs(currentY - startY)
  
  // Only trigger if horizontal swipe is more significant than vertical
  if (Math.abs(deltaX) > 50 && deltaY < 100) {
    if (deltaX > 0 && startX < 50) {
      // Swipe right from left edge - show sidebar
      showSidebar.value = true
    } else if (deltaX < -50 && showSidebar.value) {
      // Swipe left - hide sidebar
      showSidebar.value = false
    }
  }
  
  isSwipeActive = false
}

onMounted(() => {
  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchmove', handleTouchMove, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
})

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

/* Ensure Bulma color helpers work */
.navbar-item.has-text-white,
.navbar .has-text-white,
.navbar .button.has-text-white,
.navbar .button.is-ghost.has-text-white {
  color: white !important;
}

.navbar-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.router-link-active {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.button.is-outlined.is-white {
  color: white !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.button.is-outlined.is-white:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Mobile hamburger styling */
.navbar-burger {
  height: 3.25rem;
  width: 3.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.navbar-burger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Mobile sidebar burger positioning */
.sidebar-burger {
  order: -1;
  margin-right: 0.25rem;
}

/* Mobile notification positioning */
.mobile-notification {
  margin-left: auto;
  padding: 0.5rem 0.75rem;
}

.mobile-notification .notification-center {
  position: relative;
}

.mobile-notification .dropdown {
  margin-top: 5px;
}

/* Mobile navbar brand spacing */
@media screen and (max-width: 768px) {
  .navbar-brand {
    justify-content: flex-start;
    margin-right: 50%;
  }
  
  .navbar-brand .navbar-item {
    padding-left: 0.25rem;
  }
}

/* Touch-friendly button sizing */
.button.is-small {
  min-height: 44px;
  min-width: 44px;
}

.dropdown-menu {
  background-color: white;
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

.dropdown-content {
  background-color: white;
}

.dropdown-item {
  color: black !important;
  background-color: transparent !important;
}

.dropdown-item:hover {
  background-color: #f5f5f5 !important;
}
</style>
