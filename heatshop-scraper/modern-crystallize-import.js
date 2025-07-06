/**
 * Modern Crystallize Import Script
 * Using Crystallize Import Utilities - Latest Best Practices (2025)
 * https://github.com/CrystallizeAPI/import-utilities
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Import products to Crystallize using individual mutations
 * This is the most reliable method for our use case
 */
async function importToCrediting() {
  try {
    console.log('🚀 Starting Modern Crystallize Import Process...');
    console.log('📚 Using Crystallize PIM API for reliable imports');
    
    // Check if we have the import file
    const importFilePath = path.join(__dirname, 'crystallize-import.json');
    if (!fs.existsSync(importFilePath)) {
      console.error('❌ crystallize-import.json not found. Run the scraper first.');
      process.exit(1);
    }
    
    const importData = JSON.parse(fs.readFileSync(importFilePath, 'utf8'));
    console.log(`📦 Ready to import ${importData.length} items`);
    
    // Validate environment variables
    const requiredEnvVars = [
      'CRYSTALLIZE_TENANT_IDENTIFIER',
      'CRYSTALLIZE_ACCESS_TOKEN_ID', 
      'CRYSTALLIZE_ACCESS_TOKEN_SECRET'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
      }
    }
    
    console.log(`✅ Importing to tenant: ${process.env.CRYSTALLIZE_TENANT_IDENTIFIER}`);
    
    // Import using GraphQL mutations
    const results = await importWithGraphQL(importData);
    
    console.log('✅ Import completed successfully!');
    console.log(`📊 Results: ${results.success} successful, ${results.errors} errors`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

/**
 * Import products using direct GraphQL mutations to the PIM API
 */
async function importWithGraphQL(importData) {
  const results = { success: 0, errors: 0 };
  
  // Create authorization header
  const authHeader = Buffer.from(
    `${process.env.CRYSTALLIZE_ACCESS_TOKEN_ID}:${process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET}`
  ).toString('base64');
  
  const headers = {
    'Authorization': `Basic ${authHeader}`,
    'Content-Type': 'application/json'
  };
  
  const pimApiUrl = `https://pim.crystallize.com/${process.env.CRYSTALLIZE_TENANT_IDENTIFIER}/graphql`;
  
  console.log('🔗 Using PIM API:', pimApiUrl);
  
  for (let i = 0; i < importData.length; i++) {
    const item = importData[i];
    
    try {
      console.log(`📦 Importing ${i + 1}/${importData.length}: ${item.catalogueItem.name}`);
      
      // Create the product
      const createMutation = {
        query: `
          mutation CreateProduct($input: CreateProductInput!) {
            product {
              create(language: "en", input: $input) {
                id
                name
                path
              }
            }
          }
        `,
        variables: {
          input: {
            name: item.catalogueItem.name,
            path: item.catalogueItem.path,
            shapeIdentifier: "HeaterProduct", // This should match your shape
            topicPaths: item.catalogueItem.topics || [],
            components: item.catalogueItem.components || []
          }
        }
      };
      
      // Send the mutation
      const response = await fetch(pimApiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(createMutation)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.errors) {
        console.error(`❌ GraphQL errors for ${item.catalogueItem.name}:`, result.errors);
        results.errors++;
      } else {
        console.log(`✅ Created: ${result.data.product.create.name} (ID: ${result.data.product.create.id})`);
        results.success++;
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Failed to import ${item.catalogueItem.name}:`, error.message);
      results.errors++;
    }
  }
  
  return results;
}

/**
 * Alternative: Create a spec file compatible with the new CLI
 */
async function createModernSpecFile() {
  console.log('📝 Creating modern spec file for new CLI...');
  
  const importData = JSON.parse(fs.readFileSync('crystallize-import.json', 'utf8'));
  
  const specFile = {
    meta: {
      version: "2025.1",
      created: new Date().toISOString(),
      description: "Norko infrared heaters import"
    },
    tenantIdentifier: process.env.CRYSTALLIZE_TENANT_IDENTIFIER,
    items: importData.map(item => ({
      ...item.catalogueItem,
      type: 'product',
      language: 'en'
    }))
  };
  
  fs.writeFileSync('modern-spec.json', JSON.stringify(specFile, null, 2));
  console.log('✅ Created modern-spec.json');
  
  // Instructions for manual CLI usage
  console.log('\n📋 To use with new CLI:');
  console.log('1. Install new CLI: curl -LSs https://crystallizeapi.github.io/cli/install.bash | bash');
  console.log('2. Run import: ~/crystallize mass-operation run norko modern-spec.json');
}

// Run the import
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--spec-only')) {
    createModernSpecFile();
  } else {
    importToCrediting();
  }
}

module.exports = { importToCrediting, createModernSpecFile };
