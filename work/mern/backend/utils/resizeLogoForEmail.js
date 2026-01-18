// Resize logo image for email notifications
const fs = require('fs');
const path = require('path');

// Try to use sharp if available, otherwise use a simple approach
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️ Sharp not available, will use original image size');
}

// Path to the logo image
const logoPath = path.join(__dirname, '../../frontend/public/images/Track.Manage__1_-removebg-preview.png');
const outputPath = path.join(__dirname, 'logo-email.png');
const base64Path = path.join(__dirname, 'logo-base64.txt');

// Email-optimized dimensions
const emailWidth = 180; // Good width for email headers
const emailHeight = null; // Maintain aspect ratio

async function resizeLogoForEmail() {
  try {
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Logo image not found at:', logoPath);
      return;
    }

    if (sharp) {
      console.log('🔄 Resizing logo with Sharp...');
      console.log(`📏 Target width: ${emailWidth}px (height: auto)`);
      
      // Resize the image
      await sharp(logoPath)
        .resize(emailWidth, emailHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({
          quality: 90,
          compressionLevel: 9,
          adaptiveFiltering: true
        })
        .toFile(outputPath);
      
      console.log('✅ Logo resized successfully!');
      
      // Get file size
      const stats = fs.statSync(outputPath);
      console.log(`📦 Resized file size: ${(stats.size / 1024).toFixed(2)} KB`);
      
      // Convert to base64
      const imageBuffer = fs.readFileSync(outputPath);
      const base64Image = imageBuffer.toString('base64');
      const dataUri = `data:image/png;base64,${base64Image}`;
      
      // Save base64
      fs.writeFileSync(base64Path, dataUri);
      console.log('✅ Base64 saved to logo-base64.txt');
      console.log(`📐 Base64 length: ${base64Image.length} characters`);
      
    } else {
      console.log('📋 Sharp not available, using original image...');
      console.log('💡 To resize, install sharp: npm install sharp');
      
      // Fallback: use original image
      const imageBuffer = fs.readFileSync(logoPath);
      const base64Image = imageBuffer.toString('base64');
      const dataUri = `data:image/png;base64,${base64Image}`;
      
      fs.writeFileSync(base64Path, dataUri);
      console.log('✅ Base64 saved (original size)');
      console.log(`📦 Original file size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    }
    
  } catch (error) {
    console.error('❌ Error resizing logo:', error.message);
    
    // Fallback to original
    try {
      const imageBuffer = fs.readFileSync(logoPath);
      const base64Image = imageBuffer.toString('base64');
      const dataUri = `data:image/png;base64,${base64Image}`;
      fs.writeFileSync(base64Path, dataUri);
      console.log('✅ Fallback: Using original image');
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
    }
  }
}

resizeLogoForEmail();






