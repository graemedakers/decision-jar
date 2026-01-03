const puppeteer = require('puppeteer');
const path = require('path');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../public');

console.log('📸 Starting PWA screenshot generation...\n');
console.log(`📍 Target URL: ${BASE_URL}\n`);

async function captureScreenshots() {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // ========================================
        // 1. MOBILE SCREENSHOT (540x720 minimum for PWA)
        // ========================================
        console.log('📱 Capturing mobile screenshot...');

        await page.setViewport({
            width: 540,
            height: 720,
            deviceScaleFactor: 2
        });

        await page.goto(`${BASE_URL}/dashboard`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for content to load
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'screenshot-mobile.png'),
            type: 'png'
        });

        console.log('✅ Mobile screenshot saved: screenshot-mobile.png\n');

        // ========================================
        // 2. DESKTOP SCREENSHOT (1280x720 minimum for PWA)
        // ========================================
        console.log('🖥️  Capturing desktop screenshot...');

        await page.setViewport({
            width: 1280,
            height: 720,
            deviceScaleFactor: 2
        });

        await page.goto(`${BASE_URL}/dashboard`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'screenshot-desktop.png'),
            type: 'png'
        });

        console.log('✅ Desktop screenshot saved: screenshot-desktop.png\n');

        // ========================================
        // 3. BONUS: LANDING PAGE SCREENSHOT
        // ========================================
        console.log('🏠 Capturing landing page screenshot...');

        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 2
        });

        await page.goto(BASE_URL, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'screenshot-landing.png'),
            type: 'png',
            fullPage: false
        });

        console.log('✅ Landing page screenshot saved: screenshot-landing.png\n');

        // ========================================
        // 4. BONUS: OG IMAGE SCREENSHOT (for social sharing)
        // ========================================
        console.log('🌐 Capturing OG image screenshot...');

        await page.setViewport({
            width: 1200,
            height: 630,
            deviceScaleFactor: 2
        });

        await page.goto(BASE_URL, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'og-image.jpg'),
            type: 'jpeg',
            quality: 90
        });

        console.log('✅ OG image screenshot saved: og-image.jpg\n');

        console.log('🎉 All screenshots captured successfully!');
        console.log(`📂 Screenshots saved to: ${OUTPUT_DIR}\n`);

    } catch (error) {
        console.error('❌ Error capturing screenshots:', error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run if called directly
if (require.main === module) {
    captureScreenshots();
}

module.exports = { captureScreenshots };
