<template>
  <div class="users-view">
    <div class="container is-fluid">
      <div class="columns is-vcentered mb-5">
        <div class="column">
          <h1 class="title is-2 has-text-white">
            <i class="fas fa-users mr-3"></i>
            User Management
          </h1>
        </div>
        <div class="column is-narrow">
          <button class="button is-primary" @click="showCreateModal = true">
            <i class="fas fa-plus mr-2"></i>
            Add User
          </button>
        </div>
      </div>
      
      <div class="card glass-effect">
        <div class="card-content">
          <div v-if="loading" class="has-text-centered">
            <i class="fas fa-spinner fa-spin fa-2x has-text-white"></i>
          </div>
          <div v-else class="table-container">
            <table class="table is-fullwidth is-hoverable">
              <thead>
                <tr>
                  <th class="has-text-white">Username</th>
                  <th class="has-text-white">Email</th>
                  <th class="has-text-white">Roles</th>
                  <th class="has-text-white">Created</th>
                  <th class="has-text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td class="has-text-white">{{ user.username }}</td>
                  <td class="has-text-white-ter">{{ user.email }}</td>
                  <td>
                    <span 
                      v-for="role in user.roles" 
                      :key="role"
                      class="tag mr-1" 
                      :class="getRoleClass(role)"
                    >
                      {{ role }}
                    </span>
                  </td>
                  <td class="has-text-white-ter">{{ formatDate(user.created_at) }}</td>
                  <td>
                    <div class="buttons are-small">
                      <button 
                        class="button is-info is-outlined"
                        @click="editUser(user)"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        class="button is-danger is-outlined"
                        @click="deleteUser(user)"
                        :disabled="user.username === 'admin'"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div class="modal" :class="{ 'is-active': showCreateModal || showEditModal }">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ editingUser ? 'Edit User' : 'Create New User' }}
          </p>
          <button class="delete" @click="closeModal"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Username</label>
            <div class="control">
              <input 
                v-model="userForm.username" 
                class="input" 
                type="text" 
                placeholder="Enter username"
                :disabled="editingUser"
              >
            </div>
          </div>
          
          <div class="field">
            <label class="label">Email</label>
            <div class="control">
              <input 
                v-model="userForm.email" 
                class="input" 
                type="email" 
                placeholder="Enter email"
              >
            </div>
          </div>
          
          <div class="field" v-if="!editingUser">
            <label class="label">Password</label>
            <div class="control">
              <input 
                v-model="userForm.password" 
                class="input" 
                type="password" 
                placeholder="Enter password"
              >
            </div>
          </div>
          
          <div class="field">
            <label class="label">Roles</label>
            <div class="control">
              <label class="checkbox mr-4" v-for="role in availableRoles" :key="role">
                <input 
                  type="checkbox" 
                  :value="role"
                  v-model="userForm.roles"
                >
                {{ role }}
              </label>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button 
            class="button is-success" 
            @click="saveUser"
            :class="{ 'is-loading': saving }"
          >
            {{ editingUser ? 'Update' : 'Create' }}
          </button>
          <button class="button" @click="closeModal">Cancel</button>
        </footer>
      </div>
    </div>
    <!-- Delete Confirmation Modal -->
    <div class="modal" :class="{ 'is-active': showDeleteModal }">
      <div class="modal-background" @click="closeDeleteModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Confirm Deletion</p>
          <button class="delete" @click="closeDeleteModal"></button>
        </header>
        <section class="modal-card-body">
          <p>Are you sure you want to delete user <strong>"{{ userToDelete?.username }}"</strong>?</p>
          <p class="has-text-danger mt-3">This action cannot be undone.</p>
        </section>
        <footer class="modal-card-foot">
          <button 
            class="button is-danger" 
            @click="confirmDelete"
            :class="{ 'is-loading': deleting }"
            :disabled="deleting"
          >
            Delete User
          </button>
          <button class="button" @click="closeDeleteModal" :disabled="deleting">Cancel</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import { formatDistanceToNow } from 'date-fns'

const toast = useToast()

const users = ref([])
const loading = ref(false)
const saving = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingUser = ref(null)

const availableRoles = ['admin', 'manager', 'user', 'guest']

const userForm = reactive({
  username: '',
  email: '',
  password: '',
  roles: []
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/users')
    users.value = response.data.data.map(user => ({
      ...user,
      roles: JSON.parse(user.auth_data || '{}').roles || ['user']
    }))
  } catch (error) {
    toast.error('Failed to fetch users')
  } finally {
    loading.value = false
  }
}

const saveUser = async () => {
  saving.value = true
  try {
    if (editingUser.value) {
      // Update user
      await api.put(`/users/${editingUser.value.id}`, {
        email: userForm.email,
        roles: userForm.roles
      })
      toast.success('User updated successfully')
    } else {
      // Create user
      await api.post('/users', userForm)
      toast.success('User created successfully')
    }
    
    await fetchUsers()
    closeModal()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to save user')
  } finally {
    saving.value = false
  }
}

const editUser = (user) => {
  editingUser.value = user
  userForm.username = user.username
  userForm.email = user.email
  userForm.password = ''
  userForm.roles = [...user.roles]
  showEditModal.value = true
}

const showDeleteModal = ref(false)
const userToDelete = ref(null)
const deleting = ref(false)

const deleteUser = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    await api.delete(`/users/${userToDelete.value.id}`)
    toast.success('User deleted successfully')
    await fetchUsers()
    closeDeleteModal()
  } catch (error) {
    toast.error('Failed to delete user')
  } finally {
    deleting.value = false
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  userToDelete.value = null
  deleting.value = false
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingUser.value = null
  Object.assign(userForm, {
    username: '',
    email: '',
    password: '',
    roles: []
  })
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

const formatDate = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-view {
  padding: 2rem 0;
}

.table {
  background: transparent;
}

.table th {
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
