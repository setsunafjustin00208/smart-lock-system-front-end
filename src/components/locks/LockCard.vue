<template>
  <div class="card lock-card" :class="lockStatusClass">
    <div class="card-content">
      <!-- Header with lock icon and status -->
      <div class="lock-header">
        <div class="lock-icon-container">
          <i class="fas fa-lock lock-icon" :class="iconClass"></i>
          <div class="status-indicator" :class="statusIndicatorClass"></div>
        </div>
        <div class="lock-info">
          <h3 class="lock-name">{{ lock.name }}</h3>
          <p class="lock-location">{{ lock.location }}</p>
        </div>
      </div>
      
      <!-- Action Button -->
      <div class="lock-action">
        <button 
          class="action-button"
          :class="actionButtonClass"
          @click="toggleLock"
          :disabled="isLoading || !lock.is_online"
        >
          <div v-if="isLoading" class="loading-spinner"></div>
          <i v-else :class="lock.status?.is_locked ? 'fas fa-unlock' : 'fas fa-lock'"></i>
          <span>{{ isLoading ? 'Processing...' : (lock.status?.is_locked ? 'Unlock' : 'Lock') }}</span>
        </button>
      </div>
      
      <!-- Last Activity (simplified) -->
      <div class="lock-footer">
        <span class="last-activity">{{ formatDate(lock.status?.last_activity || lock.updated_at) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLocksStore } from '../../stores/locks'
import { formatDistanceToNow } from 'date-fns'

const props = defineProps({
  lock: {
    type: Object,
    required: true
  }
})

const locksStore = useLocksStore()

const isLoading = computed(() => 
  locksStore.lockLoadingStates[props.lock.id] || false
)

const lockStatusClass = computed(() => ({
  'lock-card--locked': props.lock.status?.is_locked && props.lock.is_online,
  'lock-card--unlocked': !props.lock.status?.is_locked && props.lock.is_online,
  'lock-card--offline': !props.lock.is_online
}))

const iconClass = computed(() => ({
  'lock-icon--locked': props.lock.status?.is_locked && props.lock.is_online,
  'lock-icon--unlocked': !props.lock.status?.is_locked && props.lock.is_online,
  'lock-icon--offline': !props.lock.is_online
}))

const statusIndicatorClass = computed(() => ({
  'status-indicator--online': props.lock.is_online,
  'status-indicator--offline': !props.lock.is_online
}))

const actionButtonClass = computed(() => ({
  'action-button--lock': !props.lock.status?.is_locked && props.lock.is_online,
  'action-button--unlock': props.lock.status?.is_locked && props.lock.is_online,
  'action-button--disabled': !props.lock.is_online
}))

const toggleLock = async () => {
  await locksStore.toggleLock(props.lock.id)
}

const formatDate = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}
</script>

<style scoped>
.lock-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  transition: transform 0.2s ease;
  overflow: hidden;
  position: relative;
}

.lock-card:hover {
  transform: translateY(-2px);
}

/* Status-based card styling */
.lock-card--locked {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
  border-color: rgba(34, 197, 94, 0.3);
}

.lock-card--unlocked {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05));
  border-color: rgba(251, 191, 36, 0.3);
}

.lock-card--offline {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
  border-color: rgba(239, 68, 68, 0.3);
}

.card-content {
  padding: 1.25rem 1.5rem;
}

/* Header Layout */
.lock-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.lock-icon-container {
  position: relative;
  flex-shrink: 0;
}

.lock-icon {
  font-size: 2rem;
  transition: color 0.2s ease;
}

.lock-icon--locked {
  color: #22c55e;
}

.lock-icon--unlocked {
  color: #fbbf24;
}

.lock-icon--offline {
  color: #ef4444;
  animation: pulse 2s infinite;
}

.status-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.status-indicator--online {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

.status-indicator--offline {
  background: #ef4444;
  animation: pulse 2s infinite;
}

.lock-info {
  flex: 1;
  min-width: 0;
}

.lock-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lock-location {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Action Button */
.lock-action {
  margin-bottom: 1rem;
}

.action-button {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
  overflow: hidden;
}

.action-button--lock {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.action-button--unlock {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.action-button--lock:hover,
.action-button--unlock:hover {
  transform: translateY(-1px);
}

.action-button--disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.loading-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Footer */
.lock-footer {
  display: flex;
  justify-content: center;
}

.last-activity {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-slide-in {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile optimizations */
@media screen and (max-width: 768px) {
  .card-content {
    padding: 1rem 1.25rem;
  }
  
  .lock-header {
    gap: 0.75rem;
  }
  
  .lock-icon {
    font-size: 1.75rem;
  }
  
  .lock-name {
    font-size: 1rem;
  }
  
  .lock-location {
    font-size: 0.8rem;
  }
  
  .action-button {
    height: 44px;
    font-size: 0.95rem;
  }
}
</style>