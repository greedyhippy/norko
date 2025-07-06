/**
 * Quick Image Test with Enhanced Scraper
 * Tests image downloading with just 1 product
 */

const HeatShopScraper = require('./scrape-heatshop.js');

async function quickImageTest() {
  console.log('🔥 Quick Image Test - Enhanced Scraper\n');
  
  // Create scraper instance with image downloading enabled
  const scraper = new HeatShopScraper();
  
  // Override config for testing
  const originalConfig = { ...scraper.CONFIG };
  scraper.CONFIG = {
    ...originalConfig,
    maxProducts: 1, // Just test 1 product
    enableImageDownload: true,
    delay: 1000, // Faster for testing
    imageDirectory: './images'
  };
  
  try {
    console.log('🚀 Starting enhanced scraper with image downloading...');
    const results = await scraper.scrapeProducts();
    
    console.log('\n📊 Results Summary:');
    console.log(`✅ Products scraped: ${results.products?.length || 0}`);
    
    if (results.products && results.products.length > 0) {
      const product = results.products[0];
      console.log(`📦 Product: ${product.name}`);
      console.log(`🖼️  Images found: ${product.components?.productImages?.images?.length || 0}`);
      
      if (product.components?.productImages?.images?.length > 0) {
        console.log('\n📸 Image details:');
        product.components.productImages.images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.url}`);
          console.log(`      Alt: ${img.altText}`);
          console.log(`      Local: ${img.isLocal ? '✅ Downloaded' : '❌ Original URL'}`);
          if (img.size) {
            console.log(`      Size: ${Math.round(img.size / 1024)}KB`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
  
  console.log('\n🏁 Quick image test completed!');
}

// Run the test
if (require.main === module) {
  quickImageTest().catch(console.error);
}

module.exports = { quickImageTest };
