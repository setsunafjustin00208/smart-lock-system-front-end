import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

export const useUsersStore = defineStore('users', () => {
  const toast = useToast()
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/users')
      users.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch users'
      toast.error('Failed to load users')
      console.error('Fetch users error:', err)
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/users', userData)
      users.value.push(response.data.data)
      toast.success('User created successfully')
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create user'
      toast.error('Failed to create user')
      console.error('Create user error:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (userId, userData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/users/${userId}`, userData)
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = response.data.data
      }
      toast.success('User updated successfully')
      return { success: true, data: response.data.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update user'
      toast.error('Failed to update user')
      console.error('Update user error:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (userId) => {
    loading.value = true
    error.value = null
    
    try {
      await api.delete(`/users/${userId}`)
      users.value = users.value.filter(u => u.id !== userId)
      toast.success('User deleted successfully')
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete user'
      toast.error('Failed to delete user')
      console.error('Delete user error:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  }
})
