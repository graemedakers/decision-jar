// check-production-status.js
// Check what the production API is returning

async function checkProduction() {
    const urls = [
        'https://spinthejar.com/api/auth/me',
        'https://www.spinthejar.com/api/auth/me',
    ];

    for (const url of urls) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🔍 Checking: ${url}`);
        console.log('='.repeat(60));

        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            console.log(`Status: ${response.status} ${response.statusText}`);

            const text = await response.text();

            if (response.ok) {
                try {
                    const data = JSON.parse(text);
                    console.log('\n✅ Response:');
                    console.log(JSON.stringify(data, null, 2));
                } catch (e) {
                    console.log('\n⚠️  Response (not JSON):');
                    console.log(text.substring(0, 500));
                }
            } else {
                console.log('\n❌ Error response:');
                console.log(text.substring(0, 500));
            }

        } catch (error) {
            console.error(`❌ Request failed: ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log('If you see 500 errors: Vercel deployment not complete yet');
    console.log('If you see 401 errors: Need to be logged in (expected for /me)');
    console.log('If you see 200 OK: API is working!\n');
}

checkProduction();
