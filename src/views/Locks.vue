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
          <div class="field is-grouped">
            <div class="control">
              <div class="select is-rounded">
                <select v-model="filterStatus">
                  <option value="all">All Status</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            <div class="control">
              <div class="select is-rounded">
                <select v-model="filterLocked">
                  <option value="all">All Locks</option>
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
import { ref, computed, onMounted } from 'vue'
import { useLocksStore } from '../stores/locks'
import LockGrid from '../components/locks/LockGrid.vue'

const locksStore = useLocksStore()
const filterStatus = ref('all')
const filterLocked = ref('all')

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

onMounted(async () => {
  await locksStore.fetchLocks()
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
</style>
