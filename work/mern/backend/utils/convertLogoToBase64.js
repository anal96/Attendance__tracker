// Convert logo image to base64 for email embedding
const fs = require('fs');
const path = require('path');

// Path to the logo image
const logoPath = path.join(__dirname, '../../frontend/public/images/Track.Manage__1_-removebg-preview.png');

try {
  // Check if file exists
  if (fs.existsSync(logoPath)) {
    // Read the image file
    const imageBuffer = fs.readFileSync(logoPath);
    // Convert to base64
    const base64Image = imageBuffer.toString('base64');
    const imageType = 'image/png';
    const dataUri = `data:${imageType};base64,${base64Image}`;
    
    console.log('✅ Logo converted to base64 successfully!');
    console.log(`📏 Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📐 Base64 length: ${base64Image.length} characters`);
    console.log('');
    console.log('📋 Copy this data URI to use in email template:');
    console.log(dataUri.substring(0, 100) + '...');
    console.log('');
    console.log('💡 The full data URI will be saved to logo-base64.txt');
    
    // Save to file for easy access
    fs.writeFileSync(path.join(__dirname, 'logo-base64.txt'), dataUri);
    console.log('✅ Base64 data saved to utils/logo-base64.txt');
  } else {
    console.error('❌ Logo image not found at:', logoPath);
    console.error('💡 Please check the path and ensure the image exists');
  }
} catch (error) {
  console.error('❌ Error converting logo:', error.message);
}






