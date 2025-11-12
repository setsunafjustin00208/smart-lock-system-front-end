<template>
  <div class="spinner" :class="sizeClass">
    <div class="spinner-inner" :class="colorClass"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'white', 'success', 'warning', 'danger'].includes(value)
  }
})

const sizeClass = computed(() => `spinner--${props.size}`)
const colorClass = computed(() => `spinner--${props.color}`)
</script>

<style scoped>
.spinner {
  display: inline-block;
}

.spinner--small {
  width: 16px;
  height: 16px;
}

.spinner--medium {
  width: 20px;
  height: 20px;
}

.spinner--large {
  width: 24px;
  height: 24px;
}

.spinner-inner {
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 1s linear infinite;
}

.spinner--primary {
  color: #3b82f6;
}

.spinner--white {
  color: white;
}

.spinner--success {
  color: #22c55e;
}

.spinner--warning {
  color: #fbbf24;
}

.spinner--danger {
  color: #ef4444;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
