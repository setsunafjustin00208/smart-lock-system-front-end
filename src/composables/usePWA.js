import { ref, onMounted } from 'vue'

export function usePWA() {
  const deferredPrompt = ref(null)
  const isInstallable = ref(false)
  const isInstalled = ref(false)

  const checkInstallation = () => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled.value = true
    }
  }

  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    isInstallable.value = true
  }

  const installApp = async () => {
    if (!deferredPrompt.value) return false

    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    
    if (outcome === 'accepted') {
      isInstalled.value = true
      isInstallable.value = false
    }
    
    deferredPrompt.value = null
    return outcome === 'accepted'
  }

  onMounted(() => {
    checkInstallation()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  })

  return {
    isInstallable,
    isInstalled,
    installApp
  }
}
