<template>
  <div class="users-view">
    <div class="container is-fluid">
      <div class="columns">
        <div class="column">
          <h1 class="title is-2 has-text-white mb-5">
            <i class="fas fa-users mr-3"></i>
            User Management
          </h1>
        </div>
      </div>
      
      <div class="card glass-effect">
        <div class="card-content">
          <div class="table-container">
            <table class="table is-fullwidth is-hoverable">
              <thead>
                <tr>
                  <th class="has-text-white">Name</th>
                  <th class="has-text-white">Email</th>
                  <th class="has-text-white">Role</th>
                  <th class="has-text-white">Status</th>
                  <th class="has-text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td class="has-text-white">{{ user.name }}</td>
                  <td class="has-text-white-ter">{{ user.email }}</td>
                  <td>
                    <span class="tag" :class="getRoleClass(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>
                    <span class="tag is-success">Active</span>
                  </td>
                  <td>
                    <div class="buttons are-small">
                      <button class="button is-info is-outlined">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="button is-danger is-outlined">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'

const users = ref([
  {
    id: 1,
    name: 'System Administrator',
    email: 'admin@smartlock.com',
    role: 'admin'
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  },
  {
    id: 3,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'manager'
  }
])

const getRoleClass = (role) => {
  switch (role) {
    case 'admin': return 'is-danger'
    case 'manager': return 'is-warning'
    case 'user': return 'is-info'
    default: return 'is-light'
  }
}
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
