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
          <div class="card glass-effect mb-5">
            <div class="card-header">
              <p class="card-header-title has-text-white">
                <i class="fas fa-user mr-2"></i>
                Profile Settings
              </p>
            </div>
            <div class="card-content">
              <div class="field">
                <label class="label has-text-white">Name</label>
                <div class="control">
                  <input class="input" type="text" :value="authStore.user?.name" readonly>
                </div>
              </div>
              
              <div class="field">
                <label class="label has-text-white">Email</label>
                <div class="control">
                  <input class="input" type="email" :value="authStore.user?.email" readonly>
                </div>
              </div>
              
              <div class="field">
                <label class="label has-text-white">Role</label>
                <div class="control">
                  <span class="tag is-danger">{{ authStore.user?.role }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card glass-effect">
            <div class="card-header">
              <p class="card-header-title has-text-white">
                <i class="fas fa-bell mr-2"></i>
                Notification Settings
              </p>
            </div>
            <div class="card-content">
              <div class="field">
                <input id="emailNotifications" type="checkbox" class="switch" checked>
                <label for="emailNotifications" class="has-text-white">Email Notifications</label>
              </div>
              
              <div class="field">
                <input id="pushNotifications" type="checkbox" class="switch" checked>
                <label for="pushNotifications" class="has-text-white">Push Notifications</label>
              </div>
              
              <div class="field">
                <input id="smsNotifications" type="checkbox" class="switch">
                <label for="smsNotifications" class="has-text-white">SMS Notifications</label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="column is-4">
          <div class="card glass-effect">
            <div class="card-header">
              <p class="card-header-title has-text-white">
                <i class="fas fa-info-circle mr-2"></i>
                System Information
              </p>
            </div>
            <div class="card-content">
              <div class="content has-text-white-ter">
                <p><strong class="has-text-white">Version:</strong> 1.0.0</p>
                <p><strong class="has-text-white">Build:</strong> 2024.10.03</p>
                <p><strong class="has-text-white">Environment:</strong> Development</p>
                <p><strong class="has-text-white">Uptime:</strong> 2 hours 15 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
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
