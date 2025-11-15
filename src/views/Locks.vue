<template>
  <div class="locks-view">
    <div class="container is-fluid">
      <div class="columns">
        <div class="column">
          <h1 class="title is-2 has-text-white mb-5">
            <i class="fas fa-key mr-3"></i>
            Lock Management
          </h1>
        </div>
        <div class="column is-narrow">
          <div class="field is-grouped is-grouped-multiline" :class="{ 'mb-2': isMobile }">
            <div class="control">
              <button 
                class="button is-info refresh-btn"
                @click="refreshLocks"
                :class="{ 'is-loading': isRefreshing, 'is-small': isMobile, 'pb-2': !isMobile,}"
              >
                <i class="fas fa-sync" :class="{ 'mt-1': !isMobile, 'mr-2': !isMobile }"></i>
                <span :class="{'mt-1': !isMobile}">Refresh</span>
              </button>
            </div>
            <div class="control">
              <div class="select">
                <select v-model="filterStatus">
                  <option value="all">{{ statusText }}</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            <div class="control">
              <div class="select">
                <select v-model="filterLocked">
                  <option value="all">{{ locksText }}</option>
                  <option value="locked">Locked</option>
                  <option value="unlocked">Unlocked</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="locksStore.loading" class="has-text-centered">
        <div class="loader"></div>
        <p class="has-text-white mt-3">Loading locks...</p>
      </div>
      
      <LockGrid v-else :locks="filteredLocks" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLocksStore } from '../stores/locks'
import { useToast } from 'vue-toastification'
import LockGrid from '../components/locks/LockGrid.vue'

const locksStore = useLocksStore()
const toast = useToast()
const filterStatus = ref('all')
const filterLocked = ref('all')
const isRefreshing = ref(false)
const isMobile = ref(window.innerWidth <= 1023)

const updateScreenSize = () => {
  isMobile.value = window.innerWidth <= 1023
}

const statusText = computed(() => isMobile.value ? 'All' : 'All Status')
const locksText = computed(() => isMobile.value ? 'All' : 'All Locks')

const filteredLocks = computed(() => {
  let filtered = locksStore.locks

  if (filterStatus.value !== 'all') {
    const isOnline = filterStatus.value === 'online'
    filtered = filtered.filter(lock => lock.is_online === isOnline)
  }

  if (filterLocked.value !== 'all') {
    const isLocked = filterLocked.value === 'locked'
    filtered = filtered.filter(lock => lock.status?.is_locked === isLocked)
  }

  return filtered
})

const refreshLocks = async () => {
  isRefreshing.value = true
  await locksStore.fetchLocks()
  toast.success('Locks refreshed')
  isRefreshing.value = false
}

onMounted(async () => {
  await locksStore.fetchLocks()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<style scoped>
.locks-view {
  padding: 2rem 0;
}

.loader {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #fff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.refresh-btn {
  padding: 0.25rem 0.5rem;
}

.refresh-btn span {
  display: inline;
}

@media screen and (max-width: 1023px) {
  .refresh-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .refresh-btn span {
    display: none;
  }
  
  .select.is-small {
    font-size: 0.875rem;
  }
  
  .select.is-small select {
    padding: 0.5rem 0.75rem;
  }
}
</style>
