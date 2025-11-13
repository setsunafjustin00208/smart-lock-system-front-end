import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000/smart-lock-system-front-end'
const API_BASE_URL = 'http://localhost:8080/api'

// Test credentials from backend documentation
const testCredentials = {
  admin: { username: 'admin', password: 'admin123' },
  manager: { username: 'manager', password: 'manager123' },
  user: { username: 'user', password: 'user123' },
  guest: { username: 'guest', password: 'guest123' }
}

test.describe('API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`)
  })

  test('should login with admin credentials and access dashboard', async ({ page }) => {
    // Fill login form with admin credentials
    await page.fill('input[type="text"]', testCredentials.admin.username)
    await page.fill('input[type="password"]', testCredentials.admin.password)
    
    // Submit login form
    await page.click('button[type="submit"]')
    
    // Wait for navigation to dashboard
    await page.waitForURL(`${BASE_URL}/`)
    
    // Verify we're on the dashboard
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Check if locks are loaded from API
    await page.waitForSelector('.lock-card', { timeout: 10000 })
    
    // Verify lock cards are present
    const lockCards = await page.locator('.lock-card').count()
    expect(lockCards).toBeGreaterThan(0)
  })

  test('should display API-loaded locks in locks page', async ({ page }) => {
    // Login first
    await page.fill('input[type="text"]', testCredentials.admin.username)
    await page.fill('input[type="password"]', testCredentials.admin.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/`)
    
    // Navigate to locks page
    await page.click('a[href="/smart-lock-system-front-end/locks"]')
    await page.waitForURL(`${BASE_URL}/locks`)
    
    // Wait for locks to load
    await page.waitForSelector('.lock-card', { timeout: 10000 })
    
    // Verify locks page title
    await expect(page.locator('h1')).toContainText('Lock Management')
    
    // Check if lock data matches API structure
    const firstLockCard = page.locator('.lock-card').first()
    await expect(firstLockCard).toBeVisible()
    
    // Verify lock card contains expected elements
    await expect(firstLockCard.locator('.lock-name')).toBeVisible()
    await expect(firstLockCard.locator('.battery-text')).toBeVisible()
    await expect(firstLockCard.locator('.action-button')).toBeVisible()
  })

  test('should handle lock control via API', async ({ page }) => {
    // Login first
    await page.fill('input[type="text"]', testCredentials.admin.username)
    await page.fill('input[type="password"]', testCredentials.admin.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/`)
    
    // Navigate to locks page
    await page.click('a[href="/smart-lock-system-front-end/locks"]')
    await page.waitForURL(`${BASE_URL}/locks`)
    
    // Wait for locks to load
    await page.waitForSelector('.lock-card', { timeout: 10000 })
    
    // Find an online lock and try to control it
    const onlineLockCard = page.locator('.lock-card').filter({ hasNot: page.locator('.lock-card--offline') }).first()
    
    if (await onlineLockCard.count() > 0) {
      const actionButton = onlineLockCard.locator('.action-button')
      
      // Get initial button text
      const initialText = await actionButton.textContent()
      
      // Click the action button
      await actionButton.click()
      
      // Wait for loading to complete
      await page.waitForTimeout(2000)
      
      // Verify button text changed (lock/unlock toggle)
      const newText = await actionButton.textContent()
      expect(newText).not.toBe(initialText)
      
      // Check for success toast notification
      await expect(page.locator('.Vue-Toastification__toast--success')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should test different user roles', async ({ page }) => {
    for (const [role, credentials] of Object.entries(testCredentials)) {
      console.log(`Testing ${role} role...`)
      
      // Go to login page
      await page.goto(`${BASE_URL}/login`)
      
      // Login with role credentials
      await page.fill('input[type="text"]', credentials.username)
      await page.fill('input[type="password"]', credentials.password)
      await page.click('button[type="submit"]')
      
      // Wait for navigation
      await page.waitForURL(`${BASE_URL}/`)
      
      // Verify dashboard access
      await expect(page.locator('h1')).toContainText('Dashboard')
      
      // Check navigation menu based on role
      if (role === 'admin') {
        // Admin should see Users menu
        await expect(page.locator('a[href="/smart-lock-system-front-end/users"]')).toBeVisible()
      }
      
      // Logout
      await page.click('button:has-text("System Administrator"), button:has-text("Manager"), button:has-text("User"), button:has-text("Guest")')
      await page.click('text=Logout')
      
      // Verify logout
      await page.waitForURL(`${BASE_URL}/login`)
    }
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure by intercepting requests
    await page.route(`${API_BASE_URL}/**`, route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server Error' })
      })
    })
    
    // Try to login
    await page.fill('input[type="text"]', testCredentials.admin.username)
    await page.fill('input[type="password"]', testCredentials.admin.password)
    await page.click('button[type="submit"]')
    
    // Should show error toast
    await expect(page.locator('.Vue-Toastification__toast--error')).toBeVisible({ timeout: 5000 })
  })

  test('should verify token refresh mechanism', async ({ page }) => {
    // Login first
    await page.fill('input[type="text"]', testCredentials.admin.username)
    await page.fill('input[type="password"]', testCredentials.admin.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/`)
    
    // Simulate expired token by intercepting API calls
    let callCount = 0
    await page.route(`${API_BASE_URL}/locks`, route => {
      callCount++
      if (callCount === 1) {
        // First call returns 401 (expired token)
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Token expired' })
        })
      } else {
        // Second call should succeed (after refresh)
        route.continue()
      }
    })
    
    // Navigate to locks page to trigger API call
    await page.click('a[href="/smart-lock-system-front-end/locks"]')
    
    // Should still load locks after token refresh
    await page.waitForSelector('.lock-card', { timeout: 10000 })
    expect(callCount).toBeGreaterThan(1)
  })
})

test.describe('Backend Connectivity', () => {
  test('should verify backend server is running', async ({ request }) => {
    try {
      const response = await request.get('http://localhost:8080/')
      expect(response.status()).toBe(200)
    } catch (error) {
      throw new Error('Backend server is not running. Start it with: cd ../backend && php spark serve --port=8080')
    }
  })
  
  test('should verify API endpoints are accessible', async ({ request }) => {
    // Test login endpoint
    const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
      data: testCredentials.admin
    })
    
    expect(loginResponse.status()).toBe(200)
    
    const loginData = await loginResponse.json()
    expect(loginData.status).toBe('success')
    expect(loginData.data.token).toBeDefined()
    
    // Test protected endpoint with token
    const token = loginData.data.token
    const locksResponse = await request.get(`${API_BASE_URL}/locks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    expect(locksResponse.status()).toBe(200)
    
    const locksData = await locksResponse.json()
    expect(locksData.status).toBe('success')
    expect(Array.isArray(locksData.data)).toBe(true)
  })
})
