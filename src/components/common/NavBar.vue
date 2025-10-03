<template>
  <nav class="navbar is-fixed-top glass-effect" role="navigation">
    <div class="navbar-brand">
      <router-link class="navbar-item" to="/">
        <i class="fas fa-lock has-text-white"></i>
        <span class="has-text-white ml-2 is-size-5 has-text-weight-bold">SmartLock</span>
      </router-link>
      
      <a 
        role="button" 
        class="navbar-burger has-text-white" 
        :class="{ 'is-active': showMobileMenu }"
        @click="showMobileMenu = !showMobileMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </a>
    </div>

    <div class="navbar-menu" :class="{ 'is-active': showMobileMenu }">
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
        <div class="navbar-item">
          <div class="buttons">
            <button 
              class="button is-small is-outlined is-white"
              @click="toggleNotifications"
            >
              <i class="fas fa-bell"></i>
              <span v-if="notificationsStore.unreadCount > 0" class="tag is-danger is-small ml-1">
                {{ notificationsStore.unreadCount }}
              </span>
            </button>
            <div class="dropdown is-right" :class="{ 'is-active': showUserMenu }">
              <div class="dropdown-trigger">
                <button 
                  class="button is-small is-outlined is-white"
                  @click="showUserMenu = !showUserMenu"
                >
                  <i class="fas fa-user mr-1"></i>
                  <span>{{ authStore.user?.name }}</span>
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
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'

const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const showMobileMenu = ref(false)
const showUserMenu = ref(false)

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const toggleNotifications = () => {
  // This would open a notifications panel
  console.log('Toggle notifications')
}
</script>

<style scoped>
.navbar {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.navbar-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.router-link-active {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

/* Mobile menu improvements */
@media screen and (max-width: 1023px) {
  .navbar-menu {
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
    border-radius: 0 0 12px 12px;
    margin-top: 1px;
  }
  
  .navbar-menu .navbar-item {
    color: #363636 !important;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .navbar-menu .navbar-item:hover {
    background-color: rgba(102, 126, 234, 0.1) !important;
    color: #667eea !important;
  }
  
  .navbar-menu .navbar-end .navbar-item {
    border-bottom: none;
  }
  
  .navbar-burger {
    height: 3.25rem;
    width: 3.25rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .navbar-burger:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .navbar-burger.is-active span:nth-child(1) {
    transform: translateY(5px) rotate(45deg);
  }
  
  .navbar-burger.is-active span:nth-child(2) {
    opacity: 0;
  }
  
  .navbar-burger.is-active span:nth-child(3) {
    transform: translateY(-5px) rotate(-45deg);
  }
}

/* Touch-friendly button sizing */
.button.is-small {
  min-height: 44px;
  min-width: 44px;
}

.dropdown-menu {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}
</style>
