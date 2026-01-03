# PWA Icon Generation Instructions

Since we need multiple icon sizes for the PWA, you have two options:

## Option 1: Use Online Tool (Easiest)
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your existing `/public/icon.png` file
3. Download the generated icon pack
4. Extract all icons to `/public/` folder

## Option 2: Use ImageMagick (Command Line)
If you have ImageMagick installed, run these commands from the `/public` directory:

```bash
# Generate all required icon sizes
convert icon.png -resize 72x72 icon-72.png
convert icon.png -resize 96x96 icon-96.png
convert icon.png -resize 128x128 icon-128.png
convert icon.png -resize 144x144 icon-144.png
convert icon.png -resize 152x152 icon-152.png
convert icon.png -resize 192x192 icon-192.png
convert icon.png -resize 384x384 icon-384.png
convert icon.png -resize 512x512 icon-512.png

# Apple Touch Icon
convert icon.png -resize 180x180 apple-touch-icon.png

# Windows Tiles
convert icon.png -resize 70x70 ms-icon-70x70.png
convert icon.png -resize 150x150 ms-icon-150x150.png
convert icon.png -resize 310x310 ms-icon-310x310.png
```

## Option 3: Use Sharp (Node.js)
Create a script `scripts/generate-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/icon.png');

sizes.forEach(size => {
  sharp(inputFile)
    .resize(size, size)
    .toFile(path.join(__dirname, `../public/icon-${size}.png`))
    .then(() => console.log(`Generated icon-${size}.png`))
    .catch(err => console.error(err));
});

// Apple Touch Icon
sharp(inputFile)
  .resize(180, 180)
  .toFile(path.join(__dirname, '../public/apple-touch-icon.png'))
  .then(() => console.log('Generated apple-touch-icon.png'))
  .catch(err => console.error(err));
```

Then run: `npm install sharp && node scripts/generate-icons.js`

## Required Files Checklist
- [ ] icon-72.png
- [ ] icon-96.png
- [ ] icon-128.png
- [ ] icon-144.png
- [ ] icon-152.png
- [ ] icon-192.png
- [ ] icon-384.png
- [ ] icon-512.png
- [ ] apple-touch-icon.png
- [ ] ms-icon-70x70.png
- [ ] ms-icon-150x150.png
- [ ] ms-icon-310x310.png

Note: screenshot-mobile.png and screenshot-desktop.png are optional but recommended for app stores.
