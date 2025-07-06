/**
 * Test Crystallize Authentication and Basic API Access
 */

require('dotenv').config();

console.log('🔍 Testing Crystallize Authentication...');
console.log('Environment check:');
console.log('- Tenant:', process.env.CRYSTALLIZE_TENANT_IDENTIFIER || 'NOT SET');
console.log('- Token ID:', process.env.CRYSTALLIZE_ACCESS_TOKEN_ID ? 'SET' : 'NOT SET');
console.log('- Token Secret:', process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET ? 'SET' : 'NOT SET');

async function testAuth() {
  const authHeader = Buffer.from(
    `${process.env.CRYSTALLIZE_ACCESS_TOKEN_ID}:${process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET}`
  ).toString('base64');
  
  const headers = {
    'Authorization': `Basic ${authHeader}`,
    'Content-Type': 'application/json'
  };
  
  const pimApiUrl = `https://pim.crystallize.com/${process.env.CRYSTALLIZE_TENANT_IDENTIFIER}/graphql`;
  
  console.log('\n🌐 Testing PIM API connection...');
  console.log('URL:', pimApiUrl);
  
  const query = {
    query: `
      query {
        tenant {
          id
          identifier
          name
        }
      }
    `
  };
  
  try {
    const response = await fetch(pimApiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(query)
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
    } else {
      console.log('✅ Authentication successful!');
      console.log('Tenant info:', result.data.tenant);
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testAuth();
