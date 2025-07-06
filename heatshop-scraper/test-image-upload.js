/**
 * Test Script for Image Upload Service
 * 
 * This script tests the image upload functionality with Crystallize and Supabase
 * using sample infrared heater images.
 * 
 * @author Norko Development Team
 * @version 1.0.0
 * @since 2025-07-06
 */

const { ImageUploadService } = require('./image-upload-service');
const path = require('path');

// Sample test images (publicly accessible)
const TEST_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
    description: 'Sample heater image 1',
  },
  {
    url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800',
    description: 'Sample heater image 2',
  }
];

const TEST_PRODUCT = {
  id: 'test-heater-001',
  name: 'Test Infrared Panel Heater 600W',
};

/**
 * Main test function
 */
async function testImageUploadService() {
  console.log('🧪 Starting Image Upload Service Tests');
  console.log('=====================================');
  
  try {
    // Initialize the service
    console.log('🚀 Initializing Image Upload Service...');
    const imageService = new ImageUploadService();
    
    // Wait for service initialization
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 1: Single Image Upload
    console.log('\n📤 Test 1: Single Image Upload');
    console.log('-------------------------------');
    
    const singleResult = await imageService.uploadProductImage(
      TEST_IMAGES[0].url,
      TEST_PRODUCT.id,
      TEST_PRODUCT.name,
      0
    );
    
    console.log('Single upload result:', JSON.stringify(singleResult, null, 2));
    
    // Test 2: Multiple Image Upload
    console.log('\n📤 Test 2: Multiple Image Upload');
    console.log('--------------------------------');
    
    const imageUrls = TEST_IMAGES.map(img => img.url);
    const multipleResults = await imageService.uploadProductImages(
      imageUrls,
      TEST_PRODUCT.id,
      TEST_PRODUCT.name
    );
    
    console.log('Multiple upload results:');
    multipleResults.forEach((result, index) => {
      console.log(`Image ${index + 1}:`, JSON.stringify(result, null, 2));
    });
    
    // Test 3: Error Handling (Invalid URL)
    console.log('\n❌ Test 3: Error Handling');
    console.log('-------------------------');
    
    const errorResult = await imageService.uploadProductImage(
      'https://invalid-url-that-does-not-exist.com/image.jpg',
      TEST_PRODUCT.id,
      TEST_PRODUCT.name,
      0
    );
    
    console.log('Error handling result:', JSON.stringify(errorResult, null, 2));
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('===============');
    
    const allResults = [singleResult, ...multipleResults, errorResult];
    const successful = allResults.filter(r => r.success).length;
    const failed = allResults.filter(r => !r.success).length;
    
    console.log(`✅ Successful uploads: ${successful}`);
    console.log(`❌ Failed uploads: ${failed}`);
    console.log(`📈 Success rate: ${(successful / allResults.length * 100).toFixed(1)}%`);
    
    // Service Analysis
    console.log('\n🔍 Service Analysis');
    console.log('===================');
    
    const crystallizeUploads = allResults.filter(r => r.primaryUrl).length;
    const supabaseUploads = allResults.filter(r => r.backupUrl).length;
    
    console.log(`🎯 Crystallize uploads: ${crystallizeUploads}`);
    console.log(`💾 Supabase uploads: ${supabaseUploads}`);
    
    if (crystallizeUploads > 0) {
      console.log('✅ Crystallize integration working');
    } else {
      console.log('⚠️  Crystallize integration needs configuration');
    }
    
    if (supabaseUploads > 0) {
      console.log('✅ Supabase integration working');
    } else {
      console.log('⚠️  Supabase integration needs configuration');
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
  
  console.log('\n🏁 Image Upload Service Tests Complete');
}

/**
 * Quick configuration check
 */
function checkConfiguration() {
  console.log('⚙️  Configuration Check');
  console.log('=======================');
  
  const requiredVars = [
    'CRYSTALLIZE_TENANT_IDENTIFIER',
    'CRYSTALLIZE_ACCESS_TOKEN_ID',
    'CRYSTALLIZE_ACCESS_TOKEN_SECRET'
  ];
  
  const optionalVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY'
  ];
  
  console.log('Required Environment Variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value ? 'Set' : 'Missing'}`);
  });
  
  console.log('\nOptional Environment Variables:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '⚠️ ';
    console.log(`${status} ${varName}: ${value ? 'Set' : 'Not set'}`);
  });
  
  console.log('\n📝 Note: Copy .env.example to .env and configure your keys');
  console.log('');
}

// Run tests if this file is executed directly
if (require.main === module) {
  // Load environment variables if .env file exists
  try {
    require('dotenv').config();
  } catch (error) {
    console.log('💡 Install dotenv for .env file support: npm install dotenv');
  }
  
  checkConfiguration();
  testImageUploadService();
}

module.exports = {
  testImageUploadService,
  checkConfiguration,
  TEST_IMAGES,
  TEST_PRODUCT
};
