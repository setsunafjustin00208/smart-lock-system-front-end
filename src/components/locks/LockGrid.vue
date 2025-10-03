<template>
  <div class="lock-grid">
    <div class="columns is-multiline">
      <div 
        v-for="lock in locks" 
        :key="lock.id" 
        class="column is-12-mobile is-6-tablet is-4-desktop is-3-widescreen"
      >
        <LockCard :lock="lock" />
      </div>
    </div>
    
    <div v-if="locks.length === 0" class="has-text-centered py-6">
      <i class="fas fa-lock is-size-1 has-text-white-ter mb-4"></i>
      <p class="has-text-white-ter is-size-5">No locks found</p>
      <p class="has-text-white-ter">Add your first smart lock to get started</p>
    </div>
  </div>
</template>

<script setup>
import LockCard from './LockCard.vue'

defineProps({
  locks: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.lock-grid {
  padding: 1rem 0;
}
</style>
