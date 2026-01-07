// test-api-me.js
// Test the /api/auth/me endpoint directly

async function testAPI() {
    try {
        console.log('🧪 Testing /api/auth/me endpoint...\n');

        const response = await fetch('http://localhost:3000/api/auth/me', {
            credentials: 'include',
            headers: {
                'Cookie': 'your-session-cookie-here' // You'll need to get this from browser
            }
        });

        const data = await response.json();

        console.log('📊 API Response:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(JSON.stringify(data, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (data.user) {
            console.log('✅ User found');
            console.log(`   isPremium: ${data.user.isPremium}`);
            console.log(`   hasPaid: ${data.user.hasPaid}`);
            console.log(`   isLifetimePro: ${data.user.isLifetimePro}`);
            console.log(`   activeJarId: ${data.user.activeJarId}`);
            console.log(`   memberships count: ${data.user.memberships?.length || 0}`);
        } else {
            console.log('❌ No user data returned');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testAPI();
