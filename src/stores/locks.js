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
  const lockLoadingStates = ref({})

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



  const fetchLocks = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/locks')
      const previousLocks = [...locks.value]
      
      locks.value = response.data.data.map(lock => ({
        ...lock,
        config: JSON.parse(lock.config_data || '{}'),
        status: JSON.parse(lock.status_data || '{}')
      }))
      
      // Clear loading states for locks that changed status
      previousLocks.forEach(prevLock => {
        const currentLock = locks.value.find(l => l.id === prevLock.id)
        if (currentLock && lockLoadingStates.value[prevLock.id]) {
          const prevStatus = prevLock.status?.is_locked
          const currentStatus = currentLock.status?.is_locked
          
          if (prevStatus !== currentStatus) {
            lockLoadingStates.value[prevLock.id] = false
          }
        }
      })
      
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch locks'
      toast.error('Failed to load locks')
      console.error('Fetch locks error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchSingleLock = async (lockId) => {
    try {
      const response = await api.get(`/locks/${lockId}`)
      const updatedLock = {
        ...response.data.data,
        config: JSON.parse(response.data.data.config_data || '{}'),
        status: JSON.parse(response.data.data.status_data || '{}')
      }
      
      // Update the specific lock in the array
      const index = locks.value.findIndex(l => l.id === lockId)
      if (index !== -1) {
        locks.value[index] = updatedLock
        // Clear loading state
        lockLoadingStates.value[lockId] = false
      }
      
      return updatedLock
    } catch (err) {
      console.error('Fetch single lock error:', err)
      return null
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

    // Set loading state for specific lock
    lockLoadingStates.value[lockId] = true
    
    try {
      const action = lock.status?.is_locked ? 'unlock' : 'lock'
      
      console.log('Sending request:', {
        url: `/locks/${lockId}/control`,
        data: { action: action }
      })
      
      const response = await api.post(`/locks/${lockId}/control`, { 
        action: action
      })
      
      console.log('Response:', response.data)
      
      if (response.data.status === 'success') {
        toast.success(`${lock.name} command sent`)
        console.log(`${action} command sent for lock ${lockId}`)
        
        // Fetch individual lock status with retries
        setTimeout(async () => {
          await fetchSingleLock(lockId)
        }, 2000)
        
        // Retry after 4 seconds if still loading
        setTimeout(async () => {
          if (lockLoadingStates.value[lockId]) {
            await fetchSingleLock(lockId)
          }
        }, 4000)
        
        // Final retry after 6 seconds
        setTimeout(async () => {
          if (lockLoadingStates.value[lockId]) {
            await fetchSingleLock(lockId)
            // Force clear loading state after final attempt
            lockLoadingStates.value[lockId] = false
          }
        }, 6000)
      }
      
    } catch (err) {
      console.error('Toggle lock error:', err)
      console.error('Error response:', err.response?.data)
      
      error.value = err.response?.data?.message || 'Failed to control lock'
      toast.error(`Failed to control lock: ${err.response?.data?.message || err.message}`)
      
      // Clear loading state on error
      lockLoadingStates.value[lockId] = false
    }
  }

  const controlLock = async (lockId, action) => {
    try {
      const response = await api.post(`/locks/${lockId}/control`, {
        action: action
      })
      
      if (response.data.status === 'success') {
        const lockName = locks.value.find(l => l.id === lockId)?.name || 'Lock'
        toast.success(`${lockName} ${action} command sent`)
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



  const updateLockStatus = (lockId, status) => {
    const lock = locks.value.find(l => l.id === lockId)
    if (lock) {
      Object.assign(lock.status, status)
    }
  }

  const startPolling = () => {
    if (statusInterval.value) return
    
    const statusPollingInterval = parseInt(import.meta.env.VITE_STATUS_POLLING_INTERVAL) || 30000
    
    // Only poll lock status for connectivity checks (30 seconds)
    statusInterval.value = setInterval(async () => {
      await fetchLockStatus()
    }, statusPollingInterval)
  }

  const stopPolling = () => {
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
    lockLoadingStates,
    onlineLocks,
    offlineLocks,
    lockedCount,
    unlockedCount,

    fetchLocks,
    fetchSingleLock,
    fetchLockStatus,
    toggleLock,
    controlLock,
    lockAll,
    unlockAll,
    getOfflineLocks,

    updateLockStatus,
    startPolling,
    stopPolling,
    startRealTimeUpdates
  }
})
