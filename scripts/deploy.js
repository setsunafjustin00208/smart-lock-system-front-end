#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const environments = {
  local: {
    env: '.env.local',
    command: 'npm run dev',
    description: 'Start local development server'
  },
  test: {
    env: '.env.test',
    command: 'npm run build && npm run preview',
    description: 'Build and preview for testing'
  },
  staging: {
    env: '.env.staging',
    command: 'npm run build',
    description: 'Build for staging deployment'
  },
  production: {
    env: '.env.production',
    command: 'npm run build',
    description: 'Build for production deployment'
  }
}

function showUsage() {
  console.log('\n🚀 SmartLock Frontend Deployment Script\n')
  console.log('Usage: node scripts/deploy.js <environment>\n')
  console.log('Available environments:')
  
  Object.entries(environments).forEach(([env, config]) => {
    console.log(`  ${env.padEnd(12)} - ${config.description}`)
  })
  
  console.log('\nExamples:')
  console.log('  node scripts/deploy.js local      # Start development server')
  console.log('  node scripts/deploy.js production # Build for production')
  console.log('')
}

function copyEnvFile(envFile) {
  const sourcePath = path.join(__dirname, '..', envFile)
  const targetPath = path.join(__dirname, '..', '.env')
  
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Environment file ${envFile} not found!`)
    process.exit(1)
  }
  
  fs.copyFileSync(sourcePath, targetPath)
  console.log(`✅ Copied ${envFile} to .env`)
}

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') })
    console.log(`✅ ${description} completed successfully!`)
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    process.exit(1)
  }
}

function checkBackendConnection(environment) {
  if (environment === 'local') {
    console.log('\n🔍 Checking backend connection...')
    console.log('Make sure the backend server is running:')
    console.log('  cd ../backend')
    console.log('  php spark serve --port=8080')
    console.log('')
  }
}

function main() {
  const environment = process.argv[2]
  
  if (!environment || !environments[environment]) {
    showUsage()
    process.exit(1)
  }
  
  const config = environments[environment]
  
  console.log(`\n🎯 Deploying to ${environment.toUpperCase()} environment`)
  console.log(`📋 ${config.description}`)
  
  // Copy environment file
  copyEnvFile(config.env)
  
  // Check backend connection for local development
  checkBackendConnection(environment)
  
  // Run the deployment command
  runCommand(config.command, config.description)
  
  // Show completion message
  console.log(`\n🎉 ${environment.toUpperCase()} deployment completed!`)
  
  if (environment === 'local') {
    console.log('\n📱 Access the application at:')
    console.log('   http://localhost:3000/smart-lock-system-front-end/')
    console.log('\n🔑 Demo credentials:')
    console.log('   Admin: admin / admin123')
    console.log('   Manager: manager / manager123')
    console.log('   User: user / user123')
    console.log('   Guest: guest / guest123')
  } else if (environment === 'test' || environment === 'staging' || environment === 'production') {
    console.log('\n📦 Build files are ready in the dist/ directory')
    console.log('   Deploy the contents to your web server')
  }
  
  console.log('')
}

main()
