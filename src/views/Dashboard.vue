<template>
  <div class="dashboard">
    <div class="container is-fluid">
      <div class="columns">
        <div class="column">
          <h1 class="title is-2 mb-5 has-text-white dashboard-title">
            <i class="fas fa-tachometer-alt mr-3"></i>
            Dashboard
          </h1>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="columns is-multiline is-mobile mb-5">
        <div class="column is-6-mobile is-3-desktop">
          <div class="card glass-effect stats-card">
            <div class="card-content has-text-centered">
              <div class="level is-mobile">
                <div class="level-left">
                  <div>
                    <p class="heading">Total Locks</p>
                    <p class="title is-4-mobile is-3-desktop">{{ locksStore.locks.length }}</p>
                  </div>
                </div>
                <div class="level-right">
                  <i class="fas fa-key is-size-3-mobile is-size-2-desktop has-text-info"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="column is-6-mobile is-3-desktop">
          <div class="card glass-effect stats-card">
            <div class="card-content has-text-centered">
              <div class="level is-mobile">
                <div class="level-left">
                  <div>
                    <p class="heading">Online</p>
                    <p class="title is-4-mobile is-3-desktop has-text-success">{{ locksStore.onlineLocks.length }}</p>
                  </div>
                </div>
                <div class="level-right">
                  <i class="fas fa-wifi is-size-3-mobile is-size-2-desktop has-text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="column is-6-mobile is-3-desktop">
          <div class="card glass-effect stats-card">
            <div class="card-content has-text-centered">
              <div class="level is-mobile">
                <div class="level-left">
                  <div>
                    <p class="heading">Locked</p>
                    <p class="title is-4-mobile is-3-desktop has-text-warning">{{ locksStore.lockedCount }}</p>
                  </div>
                </div>
                <div class="level-right">
                  <i class="fas fa-lock is-size-3-mobile is-size-2-desktop has-text-warning"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="column is-6-mobile is-3-desktop">
          <div class="card glass-effect stats-card">
            <div class="card-content has-text-centered">
              <div class="level is-mobile">
                <div class="level-left">
                  <div>
                    <p class="heading">Offline</p>
                    <p class="title is-4-mobile is-3-desktop has-text-danger">{{ locksStore.offlineLocks.length }}</p>
                  </div>
                </div>
                <div class="level-right">
                  <i class="fas fa-wifi-slash is-size-3-mobile is-size-2-desktop has-text-danger"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="columns mb-5">
        <div class="column">
          <div class="card glass-effect">
            <div class="card-header">
              <p class="card-header-title">
                <i class="fas fa-bolt mr-2"></i>
                Quick Actions
              </p>
            </div>
            <div class="card-content">
              <div class="buttons is-centered-mobile">
                <button 
                  class="button is-success is-rounded touch-button"
                  @click="lockAll"
                  :disabled="isLoading"
                >
                  <i class="fas fa-lock mr-2"></i>
                  <span class="is-hidden-mobile">Lock All</span>
                  <span class="is-hidden-tablet">Lock</span>
                </button>
                <button 
                  class="button is-warning is-rounded touch-button"
                  @click="unlockAll"
                  :disabled="isLoading"
                >
                  <i class="fas fa-unlock mr-2"></i>
                  <span class="is-hidden-mobile">Unlock All</span>
                  <span class="is-hidden-tablet">Unlock</span>
                </button>
                <button 
                  class="button is-info is-rounded touch-button"
                  @click="refreshStatus"
                  :class="{ 'is-loading': isLoading }"
                >
                  <i class="fas fa-sync mr-2"></i>
                  <span class="is-hidden-mobile">Refresh Status</span>
                  <span class="is-hidden-tablet">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Locks -->
      <div class="columns">
        <div class="column">
          <div class="card glass-effect">
            <div class="card-header">
              <p class="card-header-title">
                <i class="fas fa-history mr-2"></i>
                Recent Activity
              </p>
            </div>
            <div class="card-content">
              <LockGrid :locks="recentLocks" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLocksStore } from '../stores/locks'
import { useToast } from 'vue-toastification'
import LockGrid from '../components/locks/LockGrid.vue'

const locksStore = useLocksStore()
const toast = useToast()
const isLoading = ref(false)

const recentLocks = computed(() => {
  return locksStore.locks
    .slice()
    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
    .slice(0, 4)
})

const lockAll = async () => {
  await locksStore.lockAll()
}

const unlockAll = async () => {
  await locksStore.unlockAll()
}

const refreshStatus = async () => {
  isLoading.value = true
  await locksStore.fetchLocks()
  toast.success('Status refreshed')
  isLoading.value = false
}

onMounted(async () => {
  // Fetch locks from API
  await locksStore.fetchLocks()
  // Start status polling only (reduced frequency)
  locksStore.startPolling()
})
</script>

<style scoped>
.dashboard {
  padding: 1rem 0;
}

.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.card-header-title {
  color: white;
}

.stats-card {
  min-height: 120px;
}

.stats-card .card-content {
  padding: 1.25rem;
}

.touch-button {
  min-height: 48px;
  min-width: 48px;
  margin: 0.25rem;
  transition: all 0.3s ease;
}

.touch-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Mobile optimizations */
@media screen and (max-width: 768px) {
  .dashboard {
    padding: 0.5rem 0;
  }
  
  .dashboard-title {
    margin-top: 10px;
  }
  
  .stats-card {
    margin-bottom: 1rem;
  }
  
  .stats-card .card-content {
    padding: 1rem;
  }
  
  .level.is-mobile .level-left,
  .level.is-mobile .level-right {
    flex-shrink: 0;
  }
  
  .level.is-mobile .level-right {
    margin-left: auto;
  }
  
  .buttons.is-centered-mobile {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .touch-button {
    flex: 1;
    min-width: 100px;
    margin: 0.25rem;
  }
  
  .title {
    color: #f5f5f5 !important;
  }
  .title.is-4-mobile {
    font-size: 1.5rem !important;
  }
  
  .is-size-3-mobile {
    font-size: 1rem !important;
  }
}

/* Tablet optimizations */
@media screen and (min-width: 769px) and (max-width: 1023px) {
  .stats-card .card-content {
    padding: 1rem;
  }
  
  .touch-button {
    min-width: 120px;
  }
}

/* Enhanced card hover effects */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.5);
}

/* Better spacing for mobile */
@media screen and (max-width: 768px) {
  .mb-5 {
    margin-bottom: 2rem !important;
  }
  
  .container.is-fluid {
    padding: 0 1rem;
  }
}
</style>
