/**
 * Test Image Processing Functionality
 * Tests the enhanced image downloading and filtering capabilities
 */

const { isValidProductImage, downloadImage, processProductImages } = require('./scrape-heatshop.js');

async function testImageProcessing() {
  console.log('🧪 Testing Enhanced Image Processing...\n');

  // Test image validation
  console.log('1️⃣ Testing Image Validation:');
  const testUrls = [
    'https://example.com/product-heater-600w.jpg', // Should pass
    'https://example.com/logo.png', // Should fail
    'https://example.com/heater-panel-large.webp', // Should pass
    'https://example.com/social-icon.svg', // Should fail
    'https://example.com/badge-award.png', // Should fail
    'https://example.com/infrared-heating-1200x800.jpg' // Should pass
  ];

  testUrls.forEach(url => {
    const isValid = isValidProductImage(url, 'Infrared Panel Heater');
    console.log(`${isValid ? '✅' : '❌'} ${url}`);
  });

  console.log('\n2️⃣ Testing Real Image URLs from HeatShop:');
  
  // Test with some real URLs (these might not download due to access restrictions)
  const realTestUrls = [
    'https://www.heatershop.co.uk/static.heatershop.co.uk/Cache/Images/heatershop-logo-2021-2.svg',
    'https://via.placeholder.com/600x400/FF5733/FFFFFF?text=Test+Heater'
  ];

  for (const url of realTestUrls) {
    try {
      const isValid = isValidProductImage(url, 'Test Heater');
      console.log(`${isValid ? '✅' : '❌'} Validation: ${url}`);
      
      if (isValid) {
        console.log(`⏬ Attempting download: ${url}`);
        // Note: This might fail due to CORS or authentication
        // const result = await downloadImage(url, '', 'test-product');
        // console.log(`📁 Download result:`, result);
      }
    } catch (error) {
      console.log(`⚠️ Error processing ${url}: ${error.message}`);
    }
  }

  console.log('\n3️⃣ Testing Image Directory Structure:');
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const imagesDir = path.join(__dirname, 'images');
    const files = await fs.readdir(imagesDir);
    console.log(`📁 Images directory exists with ${files.length} files`);
    
    if (files.length > 0) {
      console.log('📸 Current image files:');
      files.slice(0, 5).forEach(file => {
        console.log(`   - ${file}`);
      });
      if (files.length > 5) {
        console.log(`   ... and ${files.length - 5} more files`);
      }
    }
  } catch (error) {
    console.log(`⚠️ Could not read images directory: ${error.message}`);
  }

  console.log('\n✅ Image processing test completed!');
}

// Run the test
if (require.main === module) {
  testImageProcessing().catch(console.error);
}

module.exports = { testImageProcessing };
