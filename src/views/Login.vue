<template>
  <div class="login-container">
    <div class="container">
      <div class="login-wrapper">
        <div class="login-form-container">
          <div class="card glass-effect">
            <div class="card-content">
              <div class="has-text-centered mb-5">
                <img src="/logo-brand.png" class="login-logo" alt="LocKEY Logo">

                <p class="subtitle is-6 has-text-white-ter">Secure Access Management</p>
              </div>
              
              <form @submit.prevent="handleLogin">
                <div class="field">
                  <label class="label has-text-white">Username</label>
                  <div class="control has-icons-left">
                    <input 
                      v-model="credentials.username"
                      class="input is-rounded"
                      type="text" 
                      placeholder="Enter username"
                      required
                    >
                    <span class="icon is-small is-left">
                      <i class="fas fa-user black-login-icon"></i>
                    </span>
                  </div>
                </div>
                
                <div class="field">
                  <label class="label has-text-white">Password</label>
                  <div class="control has-icons-left">
                    <input 
                      v-model="credentials.password"
                      class="input is-rounded"
                      type="password" 
                      placeholder="Enter password"
                      required
                    >
                    <span class="icon is-small is-left">
                      <i class="fas fa-lock black-login-icon"></i>
                    </span>
                  </div>
                </div>
                
                <div class="field">
                  <div class="control">
                    <button 
                      class="button is-primary is-fullwidth is-rounded"
                      :class="{ 'is-loading': isLoading }"
                      type="submit"
                      :disabled="isLoading"
                    >
                      <i class="fas fa-sign-in-alt mr-2"></i>
                      Sign In
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const isLoading = ref(false)
const appName = computed(() => __APP_NAME__)
const credentials = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  isLoading.value = true
  
  try {
    const result = await authStore.login(credentials)
    
    if (result.success) {
      toast.success('Login successful!')
      router.push('/')
    } else {
      toast.error(result.message || 'Login failed')
    }
  } catch (error) {
    toast.error('An error occurred during login')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.08)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
  pointer-events: none;
}

.card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 60px rgba(31, 38, 135, 0.4);
  transition: all 0.4s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 80px rgba(31, 38, 135, 0.6);
}

.input {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  font-size: 1rem;
  padding: 0.75rem 1rem;
}

.input:focus {
  background: rgba(255, 255, 255, 1);
  border-color: #667eea;
  box-shadow: 0 0 0 0.125em rgba(102, 126, 234, 0.25);
  transform: translateY(-1px);
}

.input::placeholder {
  color: rgba(54, 54, 54, 0.6);
}

.button.is-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.75rem 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.button.is-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  background: linear-gradient(45deg, #5a6fd8, #6a4190);
}

.button.is-primary:active {
  transform: translateY(-1px);
}

.label {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.icon {
  color: rgba(54, 54, 54, 0.7);
}

.title.is-3 {
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle.is-6 {
  font-weight: 500;
  opacity: 0.9;
}

.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.login-form-container {
  width: 100%;
  max-width: 400px;
}

@media screen and (min-width: 769px) {
  .login-form-container {
    max-width: 350px;
  }
}

@media screen and (min-width: 1024px) {
  .login-form-container {
    max-width: 400px;
  }
}

/* Mobile optimizations */
@media screen and (max-width: 768px) {
  .card-content {
    padding: 2rem 1.5rem;
  }
  
  .title.is-3 {
    font-size: 1.75rem;
  }
  
  .input {
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 48px;
  }
  
  .button.is-primary {
    min-height: 48px;
    font-size: 1rem;
  }
  
  .field {
    margin-bottom: 1.5rem;
  }
}

/* Enhanced focus states for accessibility */
.input:focus,
.button:focus {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

/* Loading state improvements */
.button.is-loading {
  pointer-events: none;
}

.button.is-loading::after {
  border-color: transparent transparent white white;
}

/* Animation for card entrance */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: slideInUp 0.6s ease-out;
}

/* Improved glass effect */
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-logo {
  width: 90%;
  margin-bottom: 1rem;
}
</style>
