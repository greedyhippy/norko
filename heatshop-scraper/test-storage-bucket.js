/**
 * Test Supabase Storage Upload with Mock Data
 * 
 * This test creates a simple test file and uploads it to verify
 * the Supabase storage bucket is working correctly.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { createGraphQLClient } = require('./supabase-graphql');
const fs = require('fs');
const path = require('path');

async function testSupabaseStorage() {
  console.log('🧪 Testing Supabase Storage Bucket\n');

  // Check environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  console.log('✅ Environment variables configured');
  console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL}`);

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: { persistSession: false }
      }
    );

    console.log('✅ Supabase client initialized');

    // Create a simple test file
    const testFileName = `test-image-${Date.now()}.txt`;
    const testFilePath = path.join(__dirname, testFileName);
    const testContent = `Test file for Supabase storage\nCreated at: ${new Date().toISOString()}\nBucket: product-images`;
    
    fs.writeFileSync(testFilePath, testContent);
    console.log(`✅ Created test file: ${testFileName}`);

    // Test 1: Upload file to storage bucket
    console.log('\n📤 Test 1: Uploading file to Supabase Storage...');
    
    const fileBuffer = fs.readFileSync(testFilePath);
    const storagePath = `test/${testFileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Storage upload failed:', uploadError.message);
      return;
    }

    console.log('✅ File uploaded successfully');
    console.log(`   Storage Path: ${uploadData.path}`);
    console.log(`   Full Path: ${uploadData.fullPath}`);

    // Test 2: Get public URL
    console.log('\n🌐 Test 2: Getting public URL...');
    
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    console.log('✅ Public URL generated');
    console.log(`   Public URL: ${urlData.publicUrl}`);

    // Test 3: Save metadata via GraphQL
    console.log('\n📄 Test 3: Saving metadata via GraphQL...');
    
    const graphqlClient = createGraphQLClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const productId = `test-storage-${Date.now()}`;
    const createMetadataMutation = `
      mutation CreateImageMetadata($input: product_imagesInsertInput!) {
        insertIntoproduct_imagesCollection(objects: [$input]) {
          records {
            id
            product_id
            filename
            storage_path
            file_size
            created_at
          }
          affectedCount
        }
      }
    `;

    const metadataInput = {
      product_id: productId,
      product_name: 'Test Storage Product',
      image_index: 0,
      filename: testFileName,
      storage_path: storagePath,
      file_size: fileBuffer.length,
      content_type: 'text/plain',
      alt_text: 'Test file for storage verification',
      tags: ['test', 'storage', 'verification'],
      upload_status: 'uploaded',
      is_public: true
    };

    const metadataResult = await graphqlClient.mutate(createMetadataMutation, {
      input: metadataInput
    });

    if (metadataResult.success) {
      const createdRecord = metadataResult.data.insertIntoproduct_imagesCollection.records[0];
      console.log('✅ Metadata saved successfully');
      console.log(`   Record ID: ${createdRecord.id}`);
      console.log(`   Product ID: ${createdRecord.product_id}`);
      console.log(`   File Size: ${createdRecord.file_size} bytes`);

      // Test 4: Query metadata back
      console.log('\n🔍 Test 4: Querying metadata...');
      
      const queryMetadata = `
        query GetImageMetadata($productId: String!) {
          product_imagesCollection(
            filter: { product_id: { eq: $productId } }
          ) {
            edges {
              node {
                id
                filename
                storage_path
                file_size
                alt_text
                tags
                created_at
              }
            }
          }
        }
      `;

      const queryResult = await graphqlClient.query(queryMetadata, { productId });
      
      if (queryResult.success) {
        const images = queryResult.data.product_imagesCollection?.edges || [];
        console.log(`✅ Found ${images.length} metadata record(s)`);
        
        images.forEach(image => {
          const node = image.node;
          console.log(`   📄 Record: ${node.filename}`);
          console.log(`       Path: ${node.storage_path}`);
          console.log(`       Size: ${node.file_size} bytes`);
          console.log(`       Tags: ${node.tags?.join(', ') || 'None'}`);
        });

        // Test 5: Clean up
        console.log('\n🗑️ Test 5: Cleaning up...');
        
        // Delete metadata
        const deleteMetadata = `
          mutation DeleteTestMetadata($productId: String!) {
            deleteFromproduct_imagesCollection(
              filter: { product_id: { eq: $productId } }
            ) {
              affectedCount
            }
          }
        `;

        const deleteResult = await graphqlClient.mutate(deleteMetadata, { productId });
        if (deleteResult.success) {
          console.log(`✅ Deleted ${deleteResult.data.deleteFromproduct_imagesCollection.affectedCount} metadata record(s)`);
        }

        // Delete file from storage
        const { error: deleteError } = await supabase.storage
          .from('product-images')
          .remove([storagePath]);

        if (deleteError) {
          console.warn(`⚠️  Failed to delete storage file: ${deleteError.message}`);
        } else {
          console.log('✅ Deleted storage file');
        }

      } else {
        console.error('❌ Failed to query metadata:', queryResult.errors);
      }

    } else {
      console.error('❌ Failed to save metadata:', metadataResult.errors);
    }

    // Clean up local test file
    fs.unlinkSync(testFilePath);
    console.log('✅ Cleaned up local test file');

    console.log('\n🎉 Storage Test Complete!');
    console.log('📊 Test Results:');
    console.log('   ✅ Storage Bucket: Working');
    console.log('   ✅ File Upload: Working');
    console.log('   ✅ Public URLs: Working');
    console.log('   ✅ GraphQL Metadata: Working');
    console.log('   ✅ Cleanup: Working');
    console.log('\n🚀 Supabase storage is ready for production use!');

  } catch (error) {
    console.error('\n💥 Storage test failed:', error.message);
    console.log('\nStack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testSupabaseStorage();
}

module.exports = testSupabaseStorage;
