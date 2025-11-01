import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

export const useLocksStore = defineStore('locks', () => {
  const toast = useToast()
  const locks = ref([])
  const lockStatus = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pollingInterval = ref(null)
  const statusInterval = ref(null)

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

  const fetchLockStatus = async () => {
    try {
      const response = await api.get('/locks/status')
      lockStatus.value = response.data.data || []
      
      // Update locks with status information
      locks.value.forEach(lock => {
        const status = lockStatus.value.find(s => s.lock_id === lock.id)
        if (status) {
          lock.status = status.status
          lock.is_online = status.status === 'online'
          lock.last_updated = status.last_updated
        }
      })
    } catch (error) {
      console.error('Fetch lock status error:', error)
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
      const response = await api.post(`/locks/${lockId}/control`, { 
        action: action
      })
      
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

  const controlLock = async (lockId, action) => {
    try {
      const response = await api.post(`/locks/${lockId}/control`, {
        action: action
      })
      
      if (response.data.status === 'success') {
        const lockName = locks.value.find(l => l.id === lockId)?.name || 'Lock'
        toast.success(`${lockName} ${action}ed successfully`)
        
        // Refresh locks after action
        await fetchLocks()
        return true
      }
    } catch (error) {
      console.error('Lock control error:', error)
      toast.error(`Failed to ${action} lock`)
      return false
    }
  }

  const lockAll = async () => {
    const promises = locks.value
      .filter(lock => !lock.status?.is_locked && lock.is_online)
      .map(lock => controlLock(lock.id, 'lock'))
    
    await Promise.all(promises)
  }

  const unlockAll = async () => {
    const promises = locks.value
      .filter(lock => lock.status?.is_locked && lock.is_online)
      .map(lock => controlLock(lock.id, 'unlock'))
    
    await Promise.all(promises)
  }

  const getOfflineLocks = () => {
    return locks.value.filter(lock => !lock.is_online)
  }

  const getLowBatteryLocks = () => {
    return locks.value.filter(lock => lock.status?.battery_level && lock.status.battery_level < 20)
  }

  const updateLockStatus = (lockId, status) => {
    const lock = locks.value.find(l => l.id === lockId)
    if (lock) {
      Object.assign(lock.status, status)
    }
  }

  const startPolling = () => {
    if (pollingInterval.value) return
    
    // Poll lock data every 3 seconds
    pollingInterval.value = setInterval(async () => {
      await fetchLocks()
    }, 3000)
    
    // Poll lock status every 30 seconds
    statusInterval.value = setInterval(async () => {
      await fetchLockStatus()
    }, 30000)
  }

  const stopPolling = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
    
    if (statusInterval.value) {
      clearInterval(statusInterval.value)
      statusInterval.value = null
    }
  }

  // Legacy method for compatibility
  const startRealTimeUpdates = () => {
    startPolling()
  }

  return {
    locks,
    lockStatus,
    loading,
    error,
    onlineLocks,
    offlineLocks,
    lockedCount,
    unlockedCount,
    lowBatteryLocks,
    fetchLocks,
    fetchLockStatus,
    toggleLock,
    controlLock,
    lockAll,
    unlockAll,
    getOfflineLocks,
    getLowBatteryLocks,
    updateLockStatus,
    startPolling,
    stopPolling,
    startRealTimeUpdates
  }
})
