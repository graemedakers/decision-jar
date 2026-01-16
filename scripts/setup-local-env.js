#!/usr/bin/env node

/**
 * Setup Local Environment
 * 
 * Copies dev.env to .env for local development
 */

const fs = require('fs');
const path = require('path');

const devEnvPath = path.join(__dirname, '..', 'dev.env');
const envPath = path.join(__dirname, '..', '.env');

console.log('\n🔧 Setting up local environment...\n');

// Check if dev.env exists
if (!fs.existsSync(devEnvPath)) {
    console.error('❌ Error: dev.env not found!');
    console.error('   Please create dev.env first.');
    process.exit(1);
}

// Check if .env already exists
if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists.');
    console.log('   If you want to update it, delete .env first and run this script again.\n');
    process.exit(0);
}

// Copy dev.env to .env
try {
    fs.copyFileSync(devEnvPath, envPath);
    console.log('✅ Successfully copied dev.env → .env\n');
    console.log('📋 Your local environment is ready!\n');
    console.log('Next steps:');
    console.log('  1. Review .env to ensure all values are correct');
    console.log('  2. Restart your dev server: npm run dev');
    console.log('  3. Test notifications locally\n');
} catch (error) {
    console.error('❌ Error copying file:', error.message);
    process.exit(1);
}
