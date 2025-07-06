const { HeatShopScraper, CONFIG } = require('./scrape-heatshop.js');

// Test configuration
CONFIG.maxProducts = 5; // Test with just 5 products
CONFIG.delay = 1000; // Faster for testing

console.log('🧪 Starting test scrape with 5 products...');

async function testScraper() {
  try {
    const scraper = new HeatShopScraper();
    
    console.log('📋 Test Configuration:');
    console.log(`   Max products: ${CONFIG.maxProducts}`);
    console.log(`   Delay: ${CONFIG.delay}ms`);
    console.log(`   Validation: ${CONFIG.validateData}`);
    
    await scraper.scrapeProducts();
    await scraper.saveProducts();
    
    console.log('\n✅ Test scraping completed successfully!');
    console.log(`📊 Results: ${scraper.products.length} products extracted`);
    
    if (scraper.products.length > 0) {
      const sample = scraper.products[0];
      console.log('\n📋 Sample Product:');
      console.log(`   Name: ${sample.name}`);
      console.log(`   Price: £${sample.pricing?.basePrice || 'Unknown'}`);
      console.log(`   Power: ${sample.specifications?.basic?.wattage || 'Unknown'}W`);
      console.log(`   Category: ${sample.category}`);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error(error.stack);
  }
}

testScraper();
