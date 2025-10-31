import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

export const useLocksStore = defineStore('locks', () => {
  const toast = useToast()
  const locks = ref([])
  const loading = ref(false)
  const error = ref(null)

  const onlineLocks = computed(() => 
    locks.value.filter(lock => lock.is_online)
  )

  const offlineLocks = computed(() => 
    locks.value.filter(lock => !lock.is_online)
  )

  const lockedCount = computed(() => 
    locks.value.filter(lock => lock.status?.is_locked).length
  )

  const unlockedCount = computed(() => 
    locks.value.filter(lock => !lock.status?.is_locked).length
  )

  const lowBatteryLocks = computed(() => 
    locks.value.filter(lock => lock.status?.battery_level < 30)
  )

  const fetchLocks = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/locks')
      locks.value = response.data.data.map(lock => ({
        ...lock,
        config: JSON.parse(lock.config_data || '{}'),
        status: JSON.parse(lock.status_data || '{}')
      }))
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch locks'
      toast.error('Failed to load locks')
      console.error('Fetch locks error:', err)
    } finally {
      loading.value = false
    }
  }

  const toggleLock = async (lockId) => {
    const lock = locks.value.find(l => l.id === lockId)
    if (!lock) return

    if (!lock.is_online) {
      toast.error('Cannot control offline lock')
      return
    }

    loading.value = true
    
    try {
      const action = lock.status?.is_locked ? 'unlock' : 'lock'
      const response = await api.post(`/locks/${lockId}/control`, { action })
      
      // Update local state
      if (response.data.status === 'success') {
        lock.status.is_locked = !lock.status.is_locked
        lock.status.last_activity = new Date().toISOString()
        
        const actionText = lock.status.is_locked ? 'locked' : 'unlocked'
        toast.success(`${lock.name} ${actionText} successfully`)
      }
      
      // Refresh locks to get updated data
      await fetchLocks()
      
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to control lock'
      toast.error('Failed to control lock')
      console.error('Toggle lock error:', err)
    } finally {
      loading.value = false
    }
  }

  const updateLockStatus = (lockId, status) => {
    const lock = locks.value.find(l => l.id === lockId)
    if (lock) {
      Object.assign(lock.status, status)
    }
  }

  // Simulate real-time updates (will be replaced with WebSocket)
  const startRealTimeUpdates = () => {
    setInterval(() => {
      // Randomly update battery levels
      locks.value.forEach(lock => {
        if (Math.random() < 0.1 && lock.status) { // 10% chance
          lock.status.battery_level = Math.max(0, lock.status.battery_level - Math.floor(Math.random() * 2))
        }
      })
      
      // Randomly change online status
      if (Math.random() < 0.05) { // 5% chance
        const randomLock = locks.value[Math.floor(Math.random() * locks.value.length)]
        if (randomLock) {
          randomLock.is_online = !randomLock.is_online
          
          if (!randomLock.is_online) {
            toast.warning(`${randomLock.name} went offline`)
          } else {
            toast.success(`${randomLock.name} is back online`)
          }
        }
      }
    }, 10000) // Every 10 seconds
  }

  return {
    locks,
    loading,
    error,
    onlineLocks,
    offlineLocks,
    lockedCount,
    unlockedCount,
    lowBatteryLocks,
    fetchLocks,
    toggleLock,
    updateLockStatus,
    startRealTimeUpdates
  }
})
