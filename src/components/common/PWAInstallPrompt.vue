<template>
  <div v-if="isInstallable && !isInstalled" class="pwa-install-prompt">
    <div class="notification is-info is-light">
      <button class="delete" @click="dismiss"></button>
      <div class="content">
        <p class="has-text-weight-semibold">Install SmartLock App</p>
        <p>Add SmartLock to your home screen for quick access and offline functionality.</p>
        <div class="buttons mt-3">
          <button class="button is-primary is-small" @click="install">
            <span class="icon">
              <i class="fas fa-download"></i>
            </span>
            <span>Install App</span>
          </button>
          <button class="button is-small" @click="dismiss">
            Not Now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePWA } from '@/composables/usePWA'
import { useToast } from 'vue-toastification'

const { isInstallable, isInstalled, installApp } = usePWA()
const toast = useToast()

const install = async () => {
  const success = await installApp()
  if (success) {
    toast.success('App installed successfully!')
  }
}

const dismiss = () => {
  isInstallable.value = false
}
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 1000;
  max-width: 400px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .pwa-install-prompt {
    left: auto;
    right: 1rem;
    margin: 0;
  }
}
</style>
