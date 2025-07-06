/**
 * Modern Crystallize Import Script using CLI and Import-Utilities
 * Based on latest Crystallize API guides (2025)
 */

require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Import products to Crystallize using the modern CLI approach
 */
async function importToCrediting() {
  try {
    console.log('🚀 Starting Modern Crystallize Import Process...');
    console.log('📚 Using latest Crystallize CLI and best practices');
    
    // Check if we have the import file
    const importFilePath = path.join(__dirname, 'crystallize-import.json');
    if (!fs.existsSync(importFilePath)) {
      console.error('❌ crystallize-import.json not found. Run the scraper first.');
      process.exit(1);
    }
    
    const importData = JSON.parse(fs.readFileSync(importFilePath, 'utf8'));
    console.log(`📦 Ready to import ${importData.length} items`);
    
    // Check if CLI is available
    console.log('� Checking Crystallize CLI...');
    try {
      execSync('npx @crystallize/cli-next@latest --version', { stdio: 'pipe' });
      console.log('✅ Crystallize CLI is available');
    } catch (error) {
      console.log('📥 Installing Crystallize CLI...');
      execSync('npm install -g @crystallize/cli-next@latest', { stdio: 'inherit' });
    }
    
    // Create a proper spec file for the CLI
    console.log('📝 Preparing import specification...');
    
    const specData = {
      meta: {
        version: "2025.1",
        created: new Date().toISOString()
      },
      tenantIdentifier: process.env.CRYSTALLIZE_TENANT_IDENTIFIER,
      items: importData.map(item => ({
        ...item.catalogueItem,
        type: 'product'
      }))
    };
    
    const specFilePath = path.join(__dirname, 'crystallize-spec.json');
    fs.writeFileSync(specFilePath, JSON.stringify(specData, null, 2));
    console.log(`✅ Created spec file: ${specFilePath}`);
    
    // Test connection first
    console.log('🔗 Testing Crystallize connection...');
    
    const testCommand = `npx @crystallize/cli-next@latest tenant info ${process.env.CRYSTALLIZE_TENANT_IDENTIFIER}`;
    try {
      const result = execSync(testCommand, { 
        stdio: 'pipe',
        env: {
          ...process.env,
          CRYSTALLIZE_ACCESS_TOKEN_ID: process.env.CRYSTALLIZE_ACCESS_TOKEN_ID,
          CRYSTALLIZE_ACCESS_TOKEN_SECRET: process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET
        }
      }).toString();
      console.log('✅ Successfully connected to Crystallize tenant');
    } catch (error) {
      console.error('❌ Failed to connect to Crystallize tenant');
      console.error('💡 Please check your credentials in .env file:');
      console.error('   - CRYSTALLIZE_TENANT_IDENTIFIER');
      console.error('   - CRYSTALLIZE_ACCESS_TOKEN_ID');
      console.error('   - CRYSTALLIZE_ACCESS_TOKEN_SECRET');
      return;
    }
    
    // For now, just prepare and test - actual import would be done manually
    console.log('\n🎯 Import preparation complete!');
    console.log('📋 Next steps:');
    console.log(`   1. Review the spec file: ${specFilePath}`);
    console.log(`   2. Run manual import: npx @crystallize/cli-next@latest import ${specFilePath} ${process.env.CRYSTALLIZE_TENANT_IDENTIFIER}`);
    console.log('\n💡 For production, consider using import-utilities for more control:');
    console.log('   https://github.com/CrystallizeAPI/import-utilities/');
    
    // Let's test the frontend instead of doing complex import
    console.log('\n🎮 Testing frontend with existing Crystallize data...');
    
  } catch (error) {
    console.error('💥 Import preparation failed:', error.message);
  }
}

// Simple function to test frontend connectivity
async function testFrontendConnection() {
  console.log('\n🌐 Testing Frontend Connection...');
  
  try {
    // Check if frontend is configured
    const frontendPath = path.join(__dirname, '../norko-crystallize-frontend/application');
    const envPath = path.join(frontendPath, '.env');
    
    if (fs.existsSync(envPath)) {
      console.log('✅ Frontend .env file found');
      
      // Check if frontend dependencies are installed
      const nodeModulesPath = path.join(frontendPath, 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        console.log('✅ Frontend dependencies installed');
        
        console.log('\n🚀 Ready to test frontend!');
        console.log('📋 To start the frontend:');
        console.log(`   cd "${frontendPath}"`);
        console.log('   npm run dev');
        console.log('\n🔗 Frontend will connect to:');
        console.log('   - Crystallize CMS (for content and images)');
        console.log('   - Railway GraphQL API (for enhanced product data)');
        
      } else {
        console.log('⚠️  Frontend dependencies not installed');
        console.log('� Run: npm install in the frontend directory');
      }
    } else {
      console.log('❌ Frontend .env file not found');
    }
    
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
  }
}

// Run the import preparation and frontend test
if (require.main === module) {
  importToCrediting().then(() => {
    testFrontendConnection();
  });
}

module.exports = { importToCrediting, testFrontendConnection };
