/**
 * Debug RLS Policies for Supabase GraphQL
 * 
 * This script helps debug Row Level Security issues that are preventing
 * GraphQL mutations from working properly.
 */

require('dotenv').config();
const { createGraphQLClient } = require('./supabase-graphql');

async function debugRLS() {
  console.log('🔍 Debugging RLS Policies for Supabase GraphQL\n');

  // Create GraphQL client with service role key
  const client = createGraphQLClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log(`🔗 GraphQL Endpoint: ${client.endpoint}`);
  console.log(`🔑 Using Service Key: ${process.env.SUPABASE_SERVICE_KEY.substring(0, 30)}...`);

  try {
    // Test 1: Check if table exists and is accessible
    console.log('\n📋 Test 1: Table Accessibility');
    const schemaQuery = `
      query CheckTableSchema {
        __type(name: "product_images") {
          name
          kind
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

    const schemaResult = await client.query(schemaQuery);
    if (schemaResult.success) {
      console.log('✅ Table schema accessible via GraphQL');
      const tableType = schemaResult.data.__type;
      if (tableType) {
        console.log(`   Table name: ${tableType.name}`);
        console.log(`   Field count: ${tableType.fields?.length || 0}`);
      }
    } else {
      console.log('❌ Table schema not accessible:', schemaResult.errors);
    }

    // Test 2: Try a minimal select query
    console.log('\n🔍 Test 2: Minimal Select Query');
    const selectQuery = `
      query MinimalSelect {
        product_imagesCollection(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const selectResult = await client.query(selectQuery);
    if (selectResult.success) {
      console.log('✅ Basic select query works');
      const count = selectResult.data.product_imagesCollection?.edges?.length || 0;
      console.log(`   Found ${count} records`);
    } else {
      console.log('❌ Basic select query failed:', selectResult.errors);
    }

    // Test 3: Try different mutation approaches
    console.log('\n➕ Test 3: Mutation Debugging');
    
    // Approach 1: Minimal data
    console.log('\n   3a: Minimal mutation with required fields only');
    const minimalMutation = `
      mutation MinimalCreate($input: product_imagesInsertInput!) {
        insertIntoproduct_imagesCollection(objects: [$input]) {
          records {
            id
            product_id
          }
          affectedCount
        }
      }
    `;

    const minimalData = {
      product_id: 'debug-test-' + Date.now(),
      product_name: 'Debug Test Heater',
      filename: 'debug.jpg',
      storage_path: 'debug/debug.jpg'
    };

    const minimalResult = await client.mutate(minimalMutation, {
      input: minimalData
    });

    if (minimalResult.success) {
      console.log('✅ Minimal mutation succeeded!');
      const created = minimalResult.data.insertIntoproduct_imagesCollection.records[0];
      console.log(`   Created ID: ${created.id}`);

      // Clean up
      const cleanupMutation = `
        mutation Cleanup($id: UUID!) {
          deleteFromproduct_imagesCollection(filter: { id: { eq: $id } }) {
            affectedCount
          }
        }
      `;
      
      await client.mutate(cleanupMutation, { id: created.id });
      console.log('   ✅ Cleaned up test record');

    } else {
      console.log('❌ Minimal mutation failed:', minimalResult.errors);
      
      // Check if it's an RLS issue specifically
      const errorMessage = minimalResult.errors?.[0]?.message || '';
      if (errorMessage.includes('row-level security')) {
        console.log('\n🔒 RLS Policy Issue Detected!');
        console.log('   This suggests the policies exist but aren\'t configured correctly.');
        
        // Test 4: Try with anon key instead
        console.log('\n   Test 4: Trying with Anonymous Key');
        const anonClient = createGraphQLClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        );

        const anonResult = await anonClient.mutate(minimalMutation, {
          input: minimalData
        });

        if (anonResult.success) {
          console.log('✅ Anonymous key mutation succeeded!');
          console.log('   This suggests the service role key has RLS restrictions');
        } else {
          console.log('❌ Anonymous key mutation also failed:', anonResult.errors);
        }
      }
    }

    // Test 5: Check current role context
    console.log('\n👤 Test 5: Current Role Context');
    const roleQuery = `
      query GetCurrentRole {
        __schema {
          queryType {
            name
          }
        }
      }
    `;

    const roleResult = await client.query(roleQuery);
    console.log('   Query type available:', roleResult.data?.__schema?.queryType?.name);

  } catch (error) {
    console.error('💥 Debug failed with error:', error.message);
    console.log('\nStack trace:', error.stack);
  }

  console.log('\n📚 RLS Debugging Summary:');
  console.log('1. If minimal mutation fails with RLS error:');
  console.log('   - Check if policies are enabled (not just created)');
  console.log('   - Verify policy expressions are correct');
  console.log('   - Ensure service role has proper permissions');
  console.log('2. If anonymous key works but service key doesn\'t:');
  console.log('   - The "Service role full access" policy might be incorrect');
  console.log('   - Try using `auth.role() = \'service_role\'` instead of `true`');
  console.log('3. If nothing works:');
  console.log('   - RLS might be disabled entirely');
  console.log('   - Check table permissions in Supabase dashboard');
}

// Run the debug
if (require.main === module) {
  debugRLS();
}

module.exports = debugRLS;
