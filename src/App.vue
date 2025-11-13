<template>
  <div id="app">
    <NavBar v-if="authStore.isAuthenticated" />
    <main class="main-content" :class="{ 'with-navbar': authStore.isAuthenticated }">
      <RouterView />
    </main>
    <NotificationCenter v-if="authStore.isAuthenticated" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import NavBar from './components/common/NavBar.vue'
import NotificationCenter from './components/common/NotificationCenter.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.checkAuth()
})
</script>

<style>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  min-height: 100vh;
  padding: 1rem;
}

.main-content.with-navbar {
  padding-top: 4rem;
}

.card {
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
}

.button.is-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  transition: all 0.3s ease;
}

.button.is-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.lock-card {
  transition: all 0.3s ease;
}

.lock-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.5);
}

@media (max-width: 768px) {
  .main-content {
    padding: 0.5rem;
  }
  
  .main-content.with-navbar {
    padding-top: 3.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .button {
    min-height: 44px;
    min-width: 44px;
  }
  
  .card {
    margin-bottom: 1rem;
  }
  
  .title {
    line-height: 1.2;
  }
  
  .subtitle {
    line-height: 1.3;
  }
}
</style>
