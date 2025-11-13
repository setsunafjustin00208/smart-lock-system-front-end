#!/usr/bin/env node

import axios from 'axios'

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const testCredentials = {
  admin: { username: 'admin', password: 'admin123' },
  manager: { username: 'manager', password: 'manager123' },
  user: { username: 'user', password: 'user123' },
  guest: { username: 'guest', password: 'guest123' }
}

async function testEndpoint(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      timeout: 5000
    }
    
    if (data) {
      config.data = data
    }
    
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` }
    }
    
    const response = await axios(config)
    return { success: true, data: response.data, status: response.status }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 0
    }
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Endpoints...')
  
  for (const [role, credentials] of Object.entries(testCredentials)) {
    console.log(`\n  Testing ${role} login...`)
    
    const result = await testEndpoint('POST', '/auth/login', credentials)
    
    if (result.success) {
      console.log(`  ✅ ${role} login successful`)
      
      // Test logout
      const token = result.data.data?.token
      if (token) {
        const logoutResult = await testEndpoint('POST', '/auth/logout', null, token)
        if (logoutResult.success) {
          console.log(`  ✅ ${role} logout successful`)
        } else {
          console.log(`  ⚠️  ${role} logout failed: ${logoutResult.error}`)
        }
      }
      
      return { role, token, credentials }
    } else {
      console.log(`  ❌ ${role} login failed: ${result.error}`)
    }
  }
  
  return null
}

async function testProtectedEndpoints(authData) {
  if (!authData) {
    console.log('\n❌ Skipping protected endpoint tests - no valid authentication')
    return
  }
  
  console.log('\n🔒 Testing Protected Endpoints...')
  
  // Re-login to get fresh token
  const loginResult = await testEndpoint('POST', '/auth/login', authData.credentials)
  if (!loginResult.success) {
    console.log('❌ Failed to get fresh token for protected endpoint tests')
    return
  }
  
  const token = loginResult.data.data.token
  
  // Test locks endpoint
  console.log('\n  Testing locks endpoint...')
  const locksResult = await testEndpoint('GET', '/locks', null, token)
  if (locksResult.success) {
    console.log(`  ✅ Locks endpoint successful (${locksResult.data.data?.length || 0} locks found)`)
    
    // Test lock control if locks exist
    if (locksResult.data.data?.length > 0) {
      const lockId = locksResult.data.data[0].id
      console.log(`  Testing lock control for lock ID: ${lockId}...`)
      
      const controlResult = await testEndpoint('POST', `/locks/${lockId}/control`, { action: 'unlock' }, token)
      if (controlResult.success) {
        console.log('  ✅ Lock control successful')
      } else {
        console.log(`  ⚠️  Lock control failed: ${controlResult.error}`)
      }
    }
  } else {
    console.log(`  ❌ Locks endpoint failed: ${locksResult.error}`)
  }
  
  // Test users endpoint (admin only)
  if (authData.role === 'admin') {
    console.log('\n  Testing users endpoint (admin only)...')
    const usersResult = await testEndpoint('GET', '/users', null, token)
    if (usersResult.success) {
      console.log(`  ✅ Users endpoint successful (${usersResult.data.data?.length || 0} users found)`)
    } else {
      console.log(`  ❌ Users endpoint failed: ${usersResult.error}`)
    }
  }
}

async function testBackendConnection() {
  console.log('🌐 Testing Backend Connection...')
  console.log(`   API Base URL: ${API_BASE_URL}`)
  
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/`, { timeout: 5000 })
    console.log('✅ Backend server is reachable')
    return true
  } catch (error) {
    console.log('❌ Backend server is not reachable')
    console.log('   Make sure the backend server is running:')
    console.log('   cd ../backend')
    console.log('   php spark serve --port=8080')
    return false
  }
}

async function main() {
  console.log('🧪 SmartLock API Connectivity Test\n')
  console.log('=' .repeat(50))
  
  // Test backend connection
  const isBackendReachable = await testBackendConnection()
  
  if (!isBackendReachable) {
    console.log('\n❌ Cannot proceed with API tests - backend server is not reachable')
    process.exit(1)
  }
  
  // Test authentication
  const authData = await testAuthentication()
  
  // Test protected endpoints
  await testProtectedEndpoints(authData)
  
  console.log('\n' + '=' .repeat(50))
  console.log('🎉 API connectivity test completed!')
  
  if (authData) {
    console.log('\n✅ Backend integration is working correctly')
    console.log('   You can now start the frontend with: npm run deploy:local')
  } else {
    console.log('\n⚠️  Some authentication issues detected')
    console.log('   Check backend configuration and database setup')
  }
  
  console.log('')
}

main().catch(error => {
  console.error('\n💥 Test script error:', error.message)
  process.exit(1)
})
