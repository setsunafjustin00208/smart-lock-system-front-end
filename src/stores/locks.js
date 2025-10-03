import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'

export const useLocksStore = defineStore('locks', () => {
  const toast = useToast()
  const locks = ref([
    {
      id: 1,
      name: 'Front Door',
      location: 'Main Entrance',
      isLocked: true,
      status: 'online',
      batteryLevel: 85,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      hardwareId: 'ESP32-001'
    },
    {
      id: 2,
      name: 'Back Door',
      location: 'Garden Entrance',
      isLocked: false,
      status: 'online',
      batteryLevel: 92,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      hardwareId: 'ESP32-002'
    },
    {
      id: 3,
      name: 'Garage Door',
      location: 'Garage',
      isLocked: true,
      status: 'offline',
      batteryLevel: 23,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      hardwareId: 'ESP32-003'
    },
    {
      id: 4,
      name: 'Office Door',
      location: 'Home Office',
      isLocked: false,
      status: 'online',
      batteryLevel: 67,
      lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      hardwareId: 'ESP32-004'
    }
  ])
  
  const loading = ref(false)
  const error = ref(null)

  const onlineLocks = computed(() => 
    locks.value.filter(lock => lock.status === 'online')
  )

  const offlineLocks = computed(() => 
    locks.value.filter(lock => lock.status === 'offline')
  )

  const lockedCount = computed(() => 
    locks.value.filter(lock => lock.isLocked).length
  )

  const unlockedCount = computed(() => 
    locks.value.filter(lock => !lock.isLocked).length
  )

  const lowBatteryLocks = computed(() => 
    locks.value.filter(lock => lock.batteryLevel < 30)
  )

  const toggleLock = async (lockId) => {
    const lock = locks.value.find(l => l.id === lockId)
    if (!lock) return

    if (lock.status === 'offline') {
      toast.error('Cannot control offline lock')
      return
    }

    loading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      lock.isLocked = !lock.isLocked
      lock.lastActivity = new Date().toISOString()
      
      const action = lock.isLocked ? 'locked' : 'unlocked'
      toast.success(`${lock.name} ${action} successfully`)
      
      // Simulate real-time update
      setTimeout(() => {
        updateLockStatus(lockId, { 
          lastActivity: new Date().toISOString() 
        })
      }, 500)
      
    } catch (err) {
      error.value = err.message
      toast.error('Failed to control lock')
    } finally {
      loading.value = false
    }
  }

  const updateLockStatus = (lockId, status) => {
    const lock = locks.value.find(l => l.id === lockId)
    if (lock) {
      Object.assign(lock, status)
    }
  }

  // Simulate real-time updates
  const startRealTimeUpdates = () => {
    setInterval(() => {
      // Randomly update battery levels
      locks.value.forEach(lock => {
        if (Math.random() < 0.1) { // 10% chance
          lock.batteryLevel = Math.max(0, lock.batteryLevel - Math.floor(Math.random() * 2))
        }
      })
      
      // Randomly change status
      if (Math.random() < 0.05) { // 5% chance
        const randomLock = locks.value[Math.floor(Math.random() * locks.value.length)]
        randomLock.status = randomLock.status === 'online' ? 'offline' : 'online'
        
        if (randomLock.status === 'offline') {
          toast.warning(`${randomLock.name} went offline`)
        } else {
          toast.success(`${randomLock.name} is back online`)
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
    toggleLock,
    updateLockStatus,
    startRealTimeUpdates
  }
})
