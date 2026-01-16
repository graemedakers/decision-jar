#!/usr/bin/env node

/**
 * Generate VAPID keys for Web Push Notifications
 * 
 * Run this script to generate the keys needed for push notifications:
 * node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push');

console.log('\n🔐 Generating VAPID Keys for Push Notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys Generated!\n');
console.log('📋 Add these to your .env file and Vercel environment variables:\n');
console.log('─'.repeat(80));
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);
console.log('─'.repeat(80));
console.log('\n⚠️  IMPORTANT:');
console.log('   1. Keep the PRIVATE KEY secret - never commit it to git');
console.log('   2. Add these to your Vercel project environment variables');
console.log('   3. Redeploy after adding the variables');
console.log('   4. Change VAPID_SUBJECT to your actual email address\n');
