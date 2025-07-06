/**
 * Test Script for Supabase GraphQL Integration
 * 
 * This script demonstrates the enhanced GraphQL operations with Supabase,
 * showcasing the features we've implemented following the official documentation.
 * 
 * Run with: node test-supabase-graphql.js
 */

require('dotenv').config();
const { 
  QUERIES, 
  MUTATIONS, 
  executeGraphQL, 
  createGraphQLClient,
  UTILS 
} = require('./supabase-graphql');

async function testSupabaseGraphQL() {
  console.log('🚀 Testing Supabase GraphQL Integration\n');

  // Check environment variables
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_GRAPHQL_URL', 
    'SUPABASE_SERVICE_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing environment variable: ${envVar}`);
      console.log('Please update your .env file with Supabase credentials');
      return;
    }
  }

  // Create GraphQL client
  const client = createGraphQLClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log(`🔗 GraphQL Endpoint: ${client.endpoint}`);
  console.log(`🔑 Using API Key: ${client.apiKey.substring(0, 20)}...`);

  try {
    // Test 1: Schema Introspection
    console.log('\n📋 Test 1: Schema Introspection');
    const introspectionQuery = `
      query SchemaIntrospection {
        __schema {
          queryType {
            name
          }
          mutationType {
            name
          }
        }
      }
    `;

    const introspectionResult = await client.query(introspectionQuery);
    if (introspectionResult.success) {
      console.log('✅ GraphQL schema accessible');
      console.log(`   Query Type: ${introspectionResult.data.__schema.queryType.name}`);
      console.log(`   Mutation Type: ${introspectionResult.data.__schema.mutationType.name}`);
    } else {
      console.log('❌ Schema introspection failed:', introspectionResult.errors);
      return;
    }

    // Test 2: Table Introspection
    console.log('\n🗄️ Test 2: Table Schema Check');
    const tableIntrospectionQuery = `
      query TableIntrospection {
        __type(name: "product_images") {
          name
          fields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    `;

    const tableResult = await client.query(tableIntrospectionQuery);
    if (tableResult.success && tableResult.data.__type) {
      console.log('✅ product_images table found in GraphQL schema');
      console.log(`   Fields: ${tableResult.data.__type.fields.length} fields available`);
    } else {
      console.log('⚠️ product_images table not found - you may need to create it first');
    }

    // Test 3: Basic Query
    console.log('\n📊 Test 3: Basic Collection Query');
    const basicQueryResult = await client.query(QUERIES.GET_RECENT_IMAGES, { limit: 5 });
    
    if (basicQueryResult.success) {
      const images = basicQueryResult.data.product_imagesCollection?.edges || [];
      console.log(`✅ Query successful - found ${images.length} images`);
      
      if (images.length > 0) {
        console.log('   Sample image:', {
          id: images[0].node.id,
          filename: images[0].node.filename,
          product_id: images[0].node.product_id
        });
      }
    } else {
      console.log('❌ Basic query failed:', basicQueryResult.errors);
    }

    // Test 4: Advanced Search Query
    console.log('\n🔍 Test 4: Advanced Search Query');
    const searchResult = await client.query(QUERIES.GET_RECENT_IMAGES, {
      limit: 3
    });

    if (searchResult.success) {
      const searchImages = searchResult.data.product_imagesCollection?.edges || [];
      console.log(`✅ Search query successful - found ${searchImages.length} matching images`);
      
      const pageInfo = searchResult.data.product_imagesCollection?.pageInfo;
      console.log('   Pagination info:', {
        hasNextPage: pageInfo?.hasNextPage || false,
        hasPreviousPage: pageInfo?.hasPreviousPage || false
      });
    } else {
      console.log('❌ Search query failed:', searchResult.errors);
    }

    // Test 5: Test Mutation (Create)
    console.log('\n➕ Test 5: Test Image Metadata Creation');
    const testImageData = {
      product_id: 'test-heater-graphql-' + Date.now(),
      product_name: 'Test GraphQL Heater',
      image_index: 0,
      filename: 'test-graphql-image.jpg',
      storage_path: 'test/test-graphql-image.jpg',
      file_size: 125000,
      content_type: 'image/jpeg',
      alt_text: 'Test image for GraphQL functionality',
      tags: ['test', 'graphql', 'heater'],
      upload_status: 'uploaded',
      is_public: true
    };

    const createResult = await client.mutate(MUTATIONS.CREATE_IMAGE_METADATA, {
      input: testImageData
    });

    if (createResult.success) {
      const createdImage = createResult.data.insertIntoproduct_imagesCollection.records[0];
      console.log('✅ Image metadata created successfully');
      console.log(`   ID: ${createdImage.id}`);
      console.log(`   Product: ${createdImage.product_name}`);

      // Test 6: Update the created record
      console.log('\n📝 Test 6: Update Image Metadata');
      const updateResult = await client.mutate(MUTATIONS.UPDATE_IMAGE_METADATA, {
        id: createdImage.id,
        input: {
          alt_text: 'Updated test image for GraphQL functionality',
          tags: ['test', 'graphql', 'heater', 'updated']
        }
      });

      if (updateResult.success) {
        console.log('✅ Image metadata updated successfully');
      } else {
        console.log('❌ Update failed:', updateResult.errors);
      }

      // Test 7: Clean up - delete the test record
      console.log('\n🗑️ Test 7: Cleanup Test Data');
      const deleteResult = await client.mutate(MUTATIONS.DELETE_IMAGE_METADATA, {
        id: createdImage.id
      });

      if (deleteResult.success) {
        console.log('✅ Test data cleaned up successfully');
      } else {
        console.log('❌ Cleanup failed:', deleteResult.errors);
      }

    } else {
      console.log('❌ Image creation failed:', createResult.errors);
      console.log('   This might be due to missing table or RLS policies');
    }

    console.log('\n🎉 GraphQL integration test completed!');
    console.log('\n📚 Next Steps:');
    console.log('   1. Create the product_images table if not done already');
    console.log('   2. Set up RLS policies for proper access control');
    console.log('   3. Create the storage bucket for file uploads');
    console.log('   4. Test the complete image upload pipeline');

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Check your .env file has correct Supabase credentials');
    console.log('   2. Verify your PROJECT_REF is correct in the GraphQL URL');
    console.log('   3. Ensure pg_graphql extension is enabled in Supabase');
    console.log('   4. Check network connectivity to Supabase');
  }
}

// Run the test
if (require.main === module) {
  testSupabaseGraphQL();
}

module.exports = testSupabaseGraphQL;
