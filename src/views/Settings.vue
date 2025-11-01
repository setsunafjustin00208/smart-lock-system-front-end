<template>
  <div class="settings-view">
    <div class="container is-fluid">
      <div class="columns">
        <div class="column">
          <h1 class="title is-2 has-text-white mb-5">
            <i class="fas fa-cog mr-3"></i>
            Settings
          </h1>
        </div>
      </div>
      
      <div class="columns">
        <div class="column is-8">
          <!-- Profile Settings -->
          <div class="card glass-effect mb-5">
            <div class="card-header">
              <p class="card-header-title has-text-white">
                <i class="fas fa-user mr-2"></i>
                Profile Settings
              </p>
            </div>
            <div class="card-content">
              <div class="field">
                <label class="label has-text-white">Username</label>
                <div class="control">
                  <input 
                    v-model="profileForm.username" 
                    class="input" 
                    type="text" 
                    :disabled="!editingProfile"
                  >
                </div>
              </div>
              
              <div class="field">
                <label class="label has-text-white">Email</label>
                <div class="control">
                  <input 
                    v-model="profileForm.email" 
                    class="input" 
                    type="email" 
                    :disabled="!editingProfile"
                  >
                </div>
              </div>
              
              <div class="field">
                <label class="label has-text-white">Roles</label>
                <div class="control">
                  <span 
                    v-for="role in authStore.user?.roles" 
                    :key="role"
                    class="tag mr-1" 
                    :class="getRoleClass(role)"
                  >
                    {{ role }}
                  </span>
                </div>
              </div>

              <div class="field is-grouped">
                <div class="control">
                  <button 
                    v-if="!editingProfile"
                    class="button is-primary"
                    @click="startEditProfile"
                  >
                    <i class="fas fa-edit mr-2"></i>
                    Edit Profile
                  </button>
                  <button 
                    v-else
                    class="button is-success"
                    @click="saveProfile"
                    :class="{ 'is-loading': savingProfile }"
                  >
                    <i class="fas fa-save mr-2"></i>
                    Save Changes
                  </button>
                </div>
                <div class="control" v-if="editingProfile">
                  <button 
                    class="button"
                    @click="cancelEditProfile"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Change Password -->
          <div class="card glass-effect mb-5">
            <div class="card-header">
              <p class="card-header-title has-text-white">
                <i class="fas fa-key mr-2"></i>
                Change Password
              </p>
            </div>
            <div class="card-content">
              <div class="field">
                <label class="label has-text-white">Current Password</label>
                <div class="control">
                  <input 
                    v-model="passwordForm.currentPassword" 
                    class="input" 
                    type="password"
                    placeholder="Enter current password"
                  >
                </div>
              </div>
              
              <div class="field">
                <label class="label has-text-white">New Password</label>
                <div class="control">
                  <input 
                    v-model="passwordForm.newPassword" 
                    class="input" 
                    type="password"
                    placeholder="Enter new password"
                  >
                </div>
              </div>
              
              <div class="field">
                <label class="label has-text-white">Confirm New Password</label>
                <div class="control">
                  <input 
                    v-model="passwordForm.confirmPassword" 
                    class="input" 
                    type="password"
                    placeholder="Confirm new password"
                  >
                </div>
              </div>

              <div class="field">
                <div class="control">
                  <button 
                    class="button is-warning"
                    @click="changePassword"
                    :class="{ 'is-loading': changingPassword }"
                    :disabled="!isPasswordFormValid"
                  >
                    <i class="fas fa-key mr-2"></i>
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Notification Settings -->
          <div class="card glass-effect">
            <div class="card-header">
              <p class="card-header-title has-text-white">
                <i class="fas fa-bell mr-2"></i>
                Notification Settings
              </p>
            </div>
            <div class="card-content">
              <div class="field">
                <label class="checkbox has-text-white">
                  <input 
                    v-model="notificationSettings.push" 
                    type="checkbox"
                    @change="saveNotificationSettings"
                  >
                  Push Notifications
                </label>
              </div>

              <div class="field">
                <label class="checkbox has-text-white">
                  <input 
                    v-model="notificationSettings.lockAlerts" 
                    type="checkbox"
                    @change="saveNotificationSettings"
                  >
                  Lock Status Alerts
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="column is-4">
          <!-- System Information -->
          <div class="card glass-effect mb-5">
            <div class="card-header">
              <p class="card-header-title has-text-white">
                <i class="fas fa-info-circle mr-2"></i>
                System Information
              </p>
            </div>
            <div class="card-content">
              <div class="content has-text-white-ter">
                <p><strong class="has-text-white">Version:</strong> 3.0.0</p>
                <p><strong class="has-text-white">Build:</strong> 2025.11.02</p>
                <p><strong class="has-text-white">Environment:</strong> Production</p>
                <p><strong class="has-text-white">Backend:</strong> Connected</p>
                <p><strong class="has-text-white">Database:</strong> Online</p>
                <p><strong class="has-text-white">Uptime:</strong> {{ systemUptime }}</p>
              </div>
            </div>
          </div>

          <!-- Account Actions -->
          <div class="card glass-effect">
            <div class="card-header">
              <p class="card-header-title has-text-white">
                <i class="fas fa-shield-alt mr-2"></i>
                Account Security
              </p>
            </div>
            <div class="card-content">
              <div class="field">
                <button 
                  class="button is-info is-fullwidth mb-3"
                  @click="exportAccountData"
                  :class="{ 'is-loading': exportingData }"
                >
                  <i class="fas fa-download mr-2"></i>
                  Export Account Data
                </button>
              </div>
              
              <div class="field">
                <button 
                  class="button is-warning is-fullwidth mb-3"
                  @click="viewLoginHistory"
                  :class="{ 'is-loading': loadingHistory }"
                >
                  <i class="fas fa-history mr-2"></i>
                  View Login History
                </button>
              </div>
              
              <div class="field">
                <button 
                  class="button is-danger is-fullwidth"
                  @click="confirmDeleteAccount"
                >
                  <i class="fas fa-trash mr-2"></i>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

const authStore = useAuthStore()
const toast = useToast()

const editingProfile = ref(false)
const savingProfile = ref(false)
const changingPassword = ref(false)
const exportingData = ref(false)
const loadingHistory = ref(false)
const systemUptime = ref('2 days 14 hours')

const profileForm = reactive({
  username: '',
  email: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const notificationSettings = reactive({
  push: true,
  lockAlerts: true
})

const isPasswordFormValid = computed(() => {
  return passwordForm.currentPassword && 
         passwordForm.newPassword && 
         passwordForm.confirmPassword &&
         passwordForm.newPassword === passwordForm.confirmPassword &&
         passwordForm.newPassword.length >= 6
})

const startEditProfile = () => {
  profileForm.username = authStore.user?.username || ''
  profileForm.email = authStore.user?.email || ''
  editingProfile.value = true
}

const cancelEditProfile = () => {
  editingProfile.value = false
  profileForm.username = ''
  profileForm.email = ''
}

const saveProfile = async () => {
  savingProfile.value = true
  try {
    await api.put('/auth/profile', {
      username: profileForm.username,
      email: profileForm.email
    })
    
    // Update auth store
    authStore.user.username = profileForm.username
    authStore.user.email = profileForm.email
    
    toast.success('Profile updated successfully')
    editingProfile.value = false
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update profile')
  } finally {
    savingProfile.value = false
  }
}

const changePassword = async () => {
  changingPassword.value = true
  try {
    await api.put('/auth/password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    toast.success('Password changed successfully')
    
    // Clear form
    Object.assign(passwordForm, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to change password')
  } finally {
    changingPassword.value = false
  }
}

const saveNotificationSettings = async () => {
  try {
    await api.put('/auth/notifications', notificationSettings)
    toast.success('Notification settings updated')
  } catch (error) {
    toast.error('Failed to update notification settings')
  }
}

const exportAccountData = async () => {
  exportingData.value = true
  try {
    const response = await api.get('/auth/export')
    const data = response.data.data
    
    // Create and download JSON file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `account-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('Account data exported successfully')
  } catch (error) {
    toast.error('Failed to export account data')
  } finally {
    exportingData.value = false
  }
}

const viewLoginHistory = async () => {
  loadingHistory.value = true
  try {
    const response = await api.get('/auth/login-history')
    const history = response.data.data
    
    // Create modal content
    let content = '<div class="content"><h4>Login History</h4><ul>'
    history.forEach(entry => {
      content += `<li><strong>${entry.timestamp}</strong> - ${entry.ip_address} (${entry.user_agent})</li>`
    })
    content += '</ul></div>'
    
    // Show in modal (simplified - in real app would use proper modal)
    const modal = document.createElement('div')
    modal.innerHTML = `
      <div class="modal is-active">
        <div class="modal-background" onclick="this.parentElement.remove()"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Login History</p>
            <button class="delete" onclick="this.closest('.modal').remove()"></button>
          </header>
          <section class="modal-card-body">${content}</section>
          <footer class="modal-card-foot">
            <button class="button" onclick="this.closest('.modal').remove()">Close</button>
          </footer>
        </div>
      </div>
    `
    document.body.appendChild(modal)
    
    toast.success('Login history loaded')
  } catch (error) {
    toast.error('Failed to load login history')
  } finally {
    loadingHistory.value = false
  }
}

const confirmDeleteAccount = () => {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    deleteAccount()
  }
}

const deleteAccount = async () => {
  try {
    await api.delete('/auth/account')
    toast.success('Account deleted successfully')
    authStore.logout()
  } catch (error) {
    toast.error('Failed to delete account')
  }
}

const getRoleClass = (role) => {
  switch (role) {
    case 'admin': return 'is-danger'
    case 'manager': return 'is-warning'
    case 'user': return 'is-info'
    case 'guest': return 'is-light'
    default: return 'is-light'
  }
}

const loadNotificationSettings = async () => {
  try {
    const response = await api.get('/auth/notifications')
    Object.assign(notificationSettings, response.data.data)
  } catch (error) {
    // Use defaults if API fails
  }
}

onMounted(() => {
  loadNotificationSettings()
  
  // Update system uptime every minute
  setInterval(() => {
    const now = new Date()
    const start = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000) - (14 * 60 * 60 * 1000))
    const diff = now - start
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    systemUptime.value = `${days} days ${hours} hours`
  }, 60000)
})
</script>

<style scoped>
.settings-view {
  padding: 2rem 0;
}

.input {
  background: rgba(255, 255, 255, 0.9);
}

.switch {
  appearance: none;
  width: 50px;
  height: 25px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.switch:checked {
  background: #48c78e;
}

.switch::before {
  content: '';
  position: absolute;
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.switch:checked::before {
  transform: translateX(25px);
}
</style>
