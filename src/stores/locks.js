import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lockey.ngrok.io'

export const useLocksStore = defineStore('locks', () => {
  const toast = useToast()
  const authStore = useAuthStore()
  
  const locks = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lockLoadingStates = ref({}) // Per-lock loading states
  
  let pollingInterval = null

  const onlineLocks = computed(() => 
    locks.value.filter(lock => lock.is_online)
  )

  const offlineLocks = computed(() => 
    locks.value.filter(lock => !lock.is_online)
  )

  const lockedCount = computed(() => 
    locks.value.filter(lock => lock.status_data?.is_locked).length
  )

  const unlockedCount = computed(() => 
    locks.value.filter(lock => !lock.status_data?.is_locked).length
  )

  const lowBatteryLocks = computed(() => 
    locks.value.filter(lock => (lock.status_data?.battery_level || 100) < 30)
  )

  // Fetch locks from API
  const fetchLocks = async () => {
    if (!authStore.token) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/locks`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch locks')
      
      const data = await response.json()
      locks.value = data
      error.value = null
      
    } catch (err) {
      console.error('Fetch locks error:', err)
      error.value = err.message
    }
  }

  // Control lock with loading state
  const toggleLock = async (lockId) => {
    const lock = locks.value.find(l => l.id === lockId)
    if (!lock || !lock.is_online) {
      toast.error('Cannot control offline lock')
      return
    }

    // Set loading state for this specific lock
    lockLoadingStates.value[lockId] = true
    
    try {
      const command = lock.status_data?.is_locked ? 'unlock' : 'lock'
      
      const response = await fetch(`${API_BASE_URL}/api/locks/${lockId}/control`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: command,
          reason: `User ${command} via UI`
        })
      })
      
      if (!response.ok) throw new Error('Command failed')
      
      toast.success(`${command} command sent to ${lock.name}`)
      
      // Loading state will be cleared when status updates via polling
      
    } catch (err) {
      console.error('Lock command error:', err)
      lockLoadingStates.value[lockId] = false
      toast.error(`Failed to control ${lock.name}`)
    }
  }

  // Clear loading state when lock status changes
  const clearLoadingState = (lockId) => {
    if (lockLoadingStates.value[lockId]) {
      lockLoadingStates.value[lockId] = false
    }
  }

  // Start polling with reduced frequency (2 seconds)
  const startPolling = () => {
    if (pollingInterval) return
    
    // Initial fetch
    fetchLocks()
    
    // Poll every 2 seconds for responsive UI
    pollingInterval = setInterval(async () => {
      const previousLocks = [...locks.value]
      await fetchLocks()
      
      // Clear loading states for locks that changed status
      locks.value.forEach(lock => {
        const prevLock = previousLocks.find(p => p.id === lock.id)
        if (prevLock && prevLock.status_data?.is_locked !== lock.status_data?.is_locked) {
          clearLoadingState(lock.id)
        }
      })
    }, 2000)
  }

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  // Check if specific lock is loading
  const isLockLoading = (lockId) => {
    return lockLoadingStates.value[lockId] || false
  }

  return {
    locks,
    loading,
    error,
    lockLoadingStates,
    onlineLocks,
    offlineLocks,
    lockedCount,
    unlockedCount,
    lowBatteryLocks,
    toggleLock,
    fetchLocks,
    startPolling,
    stopPolling,
    isLockLoading,
    clearLoadingState
  }
})
