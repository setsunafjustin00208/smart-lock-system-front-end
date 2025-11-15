<template>
  <div class="mobile-sidebar-overlay" :class="{ 'is-active': isOpen }" @click="$emit('close')">
    <div class="mobile-sidebar" @click.stop>
      <div class="sidebar-header">
        <div class="brand">
          <i class="fas fa-lock"></i>
          <span>{{ appName }}</span>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <div class="user-profile">
          <i class="fas fa-user-circle"></i>
          <div class="profile-info">
            <span class="username">{{ authStore.user?.username }}</span>
            <span class="role">{{ authStore.user?.role }}</span>
          </div>
        </div>
        
        <router-link class="nav-item" to="/" @click="$emit('close')">
          <i class="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </router-link>
        <router-link class="nav-item" to="/locks" @click="$emit('close')">
          <i class="fas fa-key"></i>
          <span>Locks</span>
        </router-link>
        <router-link 
          v-if="authStore.hasRole('admin')" 
          class="nav-item" 
          to="/users"
          @click="$emit('close')"
        >
          <i class="fas fa-users"></i>
          <span>Users</span>
        </router-link>
        <router-link class="nav-item" to="/settings" @click="$emit('close')">
          <i class="fas fa-cog"></i>
          <span>Settings</span>
        </router-link>
        <a class="nav-item" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </a>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const router = useRouter()
const authStore = useAuthStore()
const appName = computed(() => __APP_NAME__)

// Prevent body scroll when sidebar is open
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.classList.add('sidebar-open')
  } else {
    document.body.classList.remove('sidebar-open')
  }
})

const logout = async () => {
  await authStore.logout()
  router.push('/login')
  // Close sidebar after logout
  emit('close')
}
</script>

<style scoped>
.mobile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-sidebar-overlay.is-active {
  opacity: 1;
  visibility: visible;
}

/* Prevent body scroll when sidebar is open */
body.sidebar-open {
  overflow: hidden;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
}

.mobile-sidebar-overlay.is-active .mobile-sidebar {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin: 0 1rem 1rem 1rem;
}

.user-profile i {
  font-size: 2.5rem;
  color: white;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
}

.role {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: capitalize;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: white;
  text-decoration: none;
  transition: background 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  border-left-color: white;
}

.nav-item i {
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 0.5rem;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Only show on mobile */
@media screen and (min-width: 769px) {
  .mobile-sidebar-overlay {
    display: none;
  }
}
</style>
