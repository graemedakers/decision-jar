// test-localhost-api.js
// Test what localhost API is returning

async function testLocalAPI() {
    try {
        console.log('🧪 Testing localhost API...\n');

        const response = await fetch('http://localhost:3000/api/auth/me', {
            credentials: 'include',
        });

        console.log('Status:', response.status);
        const data = await response.json();

        console.log('\n📊 Response:');
        console.log(JSON.stringify(data, null, 2));

        if (data.user) {
            console.log('\n✅ User Data Found:');
            console.log('   isPremium:', data.user.isPremium);
            console.log('   isLifetimePro:', data.user.isLifetimePro);
            console.log('   hasPaid:', data.user.hasPaid);
            console.log('   activeJarId:', data.user.activeJarId);
            console.log('   memberships:', data.user.memberships?.length || 0);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testLocalAPI();
