const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../public/icon.png');
const outputDir = path.join(__dirname, '../public');

// Check if input file exists
if (!fs.existsSync(inputFile)) {
    console.error('❌ Error: icon.png not found in /public directory');
    console.log('Please add an icon.png file (recommended size: 1024x1024) to /public directory');
    process.exit(1);
}

console.log('🎨 Starting PWA icon generation...\n');

// PWA icon sizes
const pwaIcons = [72, 96, 128, 144, 152, 192, 384, 512];

// Apple icon
const appleIcon = { size: 180, name: 'apple-touch-icon.png' };

// Microsoft/Windows tiles
const msIcons = [
    { size: 70, name: 'ms-icon-70x70.png' },
    { size: 150, name: 'ms-icon-150x150.png' },
    { size: 310, name: 'ms-icon-310x310.png' }
];

// Favicon
const favicon = { size: 32, name: 'favicon-32x32.png' };

async function generateIcons() {
    let successCount = 0;
    let errorCount = 0;

    try {
        // Generate PWA icons
        for (const size of pwaIcons) {
            try {
                await sharp(inputFile)
                    .resize(size, size, {
                        fit: 'contain',
                        background: { r: 236, g: 72, b: 153, alpha: 1 } // Brand pink
                    })
                    .png()
                    .toFile(path.join(outputDir, `icon-${size}.png`));
                console.log(`✅ Generated icon-${size}.png`);
                successCount++;
            } catch (err) {
                console.error(`❌ Failed to generate icon-${size}.png:`, err.message);
                errorCount++;
            }
        }

        // Generate Apple Touch Icon
        try {
            await sharp(inputFile)
                .resize(appleIcon.size, appleIcon.size, {
                    fit: 'contain',
                    background: { r: 236, g: 72, b: 153, alpha: 1 }
                })
                .png()
                .toFile(path.join(outputDir, appleIcon.name));
            console.log(`✅ Generated ${appleIcon.name}`);
            successCount++;
        } catch (err) {
            console.error(`❌ Failed to generate ${appleIcon.name}:`, err.message);
            errorCount++;
        }

        // Generate Microsoft icons
        for (const icon of msIcons) {
            try {
                await sharp(inputFile)
                    .resize(icon.size, icon.size, {
                        fit: 'contain',
                        background: { r: 236, g: 72, b: 153, alpha: 1 }
                    })
                    .png()
                    .toFile(path.join(outputDir, icon.name));
                console.log(`✅ Generated ${icon.name}`);
                successCount++;
            } catch (err) {
                console.error(`❌ Failed to generate ${icon.name}:`, err.message);
                errorCount++;
            }
        }

        // Generate favicon
        try {
            await sharp(inputFile)
                .resize(favicon.size, favicon.size, {
                    fit: 'contain',
                    background: { r: 236, g: 72, b: 153, alpha: 1 }
                })
                .png()
                .toFile(path.join(outputDir, favicon.name));
            console.log(`✅ Generated ${favicon.name}`);
            successCount++;
        } catch (err) {
            console.error(`❌ Failed to generate ${favicon.name}:`, err.message);
            errorCount++;
        }

        // Summary
        console.log(`\n🎉 Icon generation complete!`);
        console.log(`✅ Successfully generated: ${successCount} icons`);
        if (errorCount > 0) {
            console.log(`❌ Failed: ${errorCount} icons`);
        }
        console.log(`\n📂 Icons saved to: ${outputDir}\n`);

    } catch (error) {
        console.error('❌ Fatal error during icon generation:', error);
        process.exit(1);
    }
}

generateIcons();
