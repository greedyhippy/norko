// HeatShop Product Scraper for Crystallize
// Extracts ~100 infrared heater products and formats for Crystallize import

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://www.heatershop.co.uk',
  delay: 2000, // 2 seconds between requests (respectful scraping)
  maxProducts: 100,
  outputFile: 'crystallize-products.json',
  userAgent: 'Educational-Portfolio-Bot/1.0'
};

// Categories to scrape from HeatShop
const CATEGORIES = [
  {
    name: 'Panel Heaters',
    path: '/infrared-heaters/infrared-panel-heaters',
    crystallizePath: '/infrared-heaters/panel-heaters'
  },
  {
    name: 'Ceiling Heaters', 
    path: '/infrared-heaters/ceiling-infrared-heaters-1',
    crystallizePath: '/infrared-heaters/ceiling-heaters'
  },
  {
    name: 'Industrial Heaters',
    path: '/infrared-heaters/industrial-warehouse', 
    crystallizePath: '/infrared-heaters/industrial-heaters'
  },
  {
    name: 'Far Infrared Heaters',
    path: '/infrared-heaters/far-infrared-heaters',
    crystallizePath: '/infrared-heaters/far-infrared-heaters'
  }
];

class HeatShopScraper {
  constructor() {
    this.products = [];
    this.processedUrls = new Set();
    this.requestCount = 0;
  }

  // Add delay between requests
  async delay(ms = CONFIG.delay) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Make HTTP request with error handling
  async makeRequest(url) {
    try {
      this.requestCount++;
      console.log(`Request ${this.requestCount}: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': CONFIG.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: 10000
      });
      
      await this.delay();
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      return null;
    }
  }

  // Extract product URLs from category page
  async extractProductUrls(categoryUrl) {
    const html = await this.makeRequest(categoryUrl);
    if (!html) return [];

    const $ = cheerio.load(html);
    const productUrls = [];

    // Look for product links - these may vary based on site structure
    $('a[href*="/"]').each((i, element) => {
      const href = $(element).attr('href');
      if (href && (
        href.includes('herschel') || 
        href.includes('heater') ||
        href.includes('infrared') ||
        href.includes('panel')
      ) && !href.includes('category') && !href.includes('?')) {
        const fullUrl = href.startsWith('http') ? href : CONFIG.baseUrl + href;
        if (!this.processedUrls.has(fullUrl)) {
          productUrls.push(fullUrl);
          this.processedUrls.add(fullUrl);
        }
      }
    });

    // Also look for product cards or tiles
    $('.product-item, .product-card, .product-tile').each((i, element) => {
      const link = $(element).find('a').first().attr('href');
      if (link) {
        const fullUrl = link.startsWith('http') ? link : CONFIG.baseUrl + link;
        if (!this.processedUrls.has(fullUrl)) {
          productUrls.push(fullUrl);
          this.processedUrls.add(fullUrl);
        }
      }
    });

    console.log(`Found ${productUrls.length} product URLs in category`);
    return productUrls.slice(0, 25); // Limit per category
  }

  // Extract product details from product page
  async extractProductDetails(productUrl, category) {
    const html = await this.makeRequest(productUrl);
    if (!html) return null;

    const $ = cheerio.load(html);

    try {
      // Extract basic product info
      const name = this.extractProductName($);
      const price = this.extractPrice($);
      const description = this.extractDescription($);
      const specifications = this.extractSpecifications($);
      const features = this.extractFeatures($);
      const images = this.extractImages($);

      // Generate product data in Crystallize format
      const product = {
        id: this.generateId(name),
        name: name,
        path: this.generatePath(name, category),
        shape: 'Heater Product',
        category: category.name,
        crystallizePath: category.crystallizePath,
        sourceUrl: productUrl,
        components: {
          description: {
            type: 'richText',
            content: {
              html: description,
              plainText: this.stripHtml(description)
            }
          },
          specifications: {
            type: 'contentChunk',
            chunks: [{
              wattage: specifications.wattage || this.generateDummyWattage(),
              dimensions: specifications.dimensions || this.generateDummyDimensions(),
              weight: specifications.weight || this.generateDummyWeight()
            }]
          },
          features: {
            type: 'richText',
            content: {
              html: features,
              plainText: this.stripHtml(features)
            }
          },
          productImages: {
            type: 'images',
            images: images
          }
        },
        variants: this.generateVariants(name, price, specifications),
        topics: [category.crystallizePath]
      };

      return product;
    } catch (error) {
      console.error(`Error extracting product from ${productUrl}:`, error.message);
      return null;
    }
  }

  // Extract product name
  extractProductName($) {
    const selectors = [
      'h1',
      '.product-title',
      '.product-name', 
      'title'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim()) {
        return element.text().trim().replace(/\s+/g, ' ');
      }
    }

    return 'Unknown Product';
  }

  // Extract price
  extractPrice($) {
    const selectors = [
      '.price',
      '.product-price',
      '[class*="price"]',
      '.cost'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length) {
        const priceText = element.text();
        const priceMatch = priceText.match(/£?(\d+(?:\.\d{2})?)/);
        if (priceMatch) {
          return parseFloat(priceMatch[1]);
        }
      }
    }

    return this.generateDummyPrice();
  }

  // Extract description
  extractDescription($) {
    const selectors = [
      '.product-description',
      '.description', 
      '.product-details',
      '.product-info p'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim().length > 50) {
        return element.html() || element.text();
      }
    }

    return '<p>High-quality infrared heater providing efficient and comfortable heating.</p>';
  }

  // Extract specifications  
  extractSpecifications($) {
    const specs = {
      wattage: null,
      dimensions: null,
      weight: null
    };

    // Look for wattage
    const wattageMatch = $.html().match(/(\d+)\s*W(?:att)?/i);
    if (wattageMatch) {
      specs.wattage = parseInt(wattageMatch[1]);
    }

    // Look for dimensions
    const dimensionsMatch = $.html().match(/(\d+mm?\s*x\s*\d+mm?(?:\s*x\s*\d+mm?)?)/i);
    if (dimensionsMatch) {
      specs.dimensions = dimensionsMatch[1];
    }

    // Look for weight
    const weightMatch = $.html().match(/(\d+(?:\.\d+)?)\s*kg/i);
    if (weightMatch) {
      specs.weight = parseFloat(weightMatch[1]);
    }

    return specs;
  }

  // Extract features
  extractFeatures($) {
    const features = [];
    
    // Look for bullet points or feature lists
    $('ul li, .features li, .benefits li').each((i, element) => {
      const text = $(element).text().trim();
      if (text && text.length > 10 && text.length < 200) {
        features.push(text);
      }
    });

    if (features.length > 0) {
      return '<ul>' + features.slice(0, 5).map(f => `<li>${f}</li>`).join('') + '</ul>';
    }

    return '<ul><li>Energy efficient infrared heating</li><li>Easy wall mounting</li><li>Silent operation</li><li>Maintenance free</li></ul>';
  }

  // Extract images
  extractImages($) {
    const images = [];
    
    $('img').each((i, element) => {
      const src = $(element).attr('src');
      const alt = $(element).attr('alt') || 'Product image';
      
      if (src && (src.includes('product') || src.includes('heater') || i < 3)) {
        const fullUrl = src.startsWith('http') ? src : CONFIG.baseUrl + src;
        images.push({
          url: fullUrl,
          altText: alt
        });
      }
    });

    return images.slice(0, 3); // Limit to 3 images
  }

  // Generate variants
  generateVariants(name, basePrice, specifications) {
    const variants = [];
    const wattages = specifications.wattage ? [specifications.wattage] : [250, 350, 550, 900];
    
    wattages.forEach((wattage, index) => {
      const priceMultiplier = wattage / (wattages[0] || 250);
      const variantPrice = basePrice * priceMultiplier;
      
      variants.push({
        name: `${wattage}W`,
        sku: this.generateSku(name, wattage),
        price: Math.round(variantPrice * 100) / 100,
        priceVariants: [{
          identifier: 'default',
          price: Math.round(variantPrice * 100) / 100,
          currency: 'GBP'
        }],
        attributes: [
          { attribute: 'wattage', value: `${wattage}W` },
          { attribute: 'dimensions', value: specifications.dimensions || this.generateDummyDimensions() }
        ],
        stock: this.generateDummyStock(),
        isDefault: index === 0
      });
    });

    return variants;
  }

  // Utility functions
  generateId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  generatePath(name, category) {
    const productSlug = this.generateId(name);
    return `${category.crystallizePath}/${productSlug}`;
  }

  generateSku(name, wattage) {
    const nameCode = name.substring(0, 3).toUpperCase();
    return `${nameCode}-${wattage}W`;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Dummy data generators
  generateDummyWattage() {
    const wattages = [250, 350, 550, 900, 1200];
    return wattages[Math.floor(Math.random() * wattages.length)];
  }

  generateDummyDimensions() {
    const dimensions = [
      '600mm x 300mm',
      '800mm x 600mm', 
      '900mm x 300mm',
      '1000mm x 800mm',
      '1200mm x 300mm'
    ];
    return dimensions[Math.floor(Math.random() * dimensions.length)];
  }

  generateDummyWeight() {
    return Math.round((Math.random() * 10 + 2) * 10) / 10; // 2-12 kg
  }

  generateDummyPrice() {
    return Math.round((Math.random() * 500 + 200) * 100) / 100; // £200-700
  }

  generateDummyStock() {
    return Math.floor(Math.random() * 50) + 5; // 5-55 units
  }

  // Main scraping process
  async scrapeProducts() {
    console.log('🚀 Starting HeatShop product scraping...');
    console.log(`Target: ${CONFIG.maxProducts} products`);
    
    for (const category of CATEGORIES) {
      if (this.products.length >= CONFIG.maxProducts) break;
      
      console.log(`\n📂 Scraping category: ${category.name}`);
      console.log(`URL: ${CONFIG.baseUrl}${category.path}`);
      
      // Get product URLs from category page
      const productUrls = await this.extractProductUrls(CONFIG.baseUrl + category.path);
      
      // Scrape individual products
      for (const productUrl of productUrls) {
        if (this.products.length >= CONFIG.maxProducts) break;
        
        console.log(`\n📦 Scraping product ${this.products.length + 1}/${CONFIG.maxProducts}`);
        const product = await this.extractProductDetails(productUrl, category);
        
        if (product) {
          this.products.push(product);
          console.log(`✅ Added: ${product.name}`);
        } else {
          console.log('❌ Failed to extract product');
        }
      }
    }
    
    console.log(`\n🎉 Scraping complete! Extracted ${this.products.length} products`);
    return this.products;
  }

  // Save products to JSON file
  async saveProducts() {
    const output = {
      metadata: {
        scrapedAt: new Date().toISOString(),
        totalProducts: this.products.length,
        source: 'heatershop.co.uk',
        categories: CATEGORIES.map(c => c.name)
      },
      products: this.products
    };

    await fs.writeFile(CONFIG.outputFile, JSON.stringify(output, null, 2));
    console.log(`💾 Saved ${this.products.length} products to ${CONFIG.outputFile}`);
  }

  // Generate sample Crystallize import format
  async generateCrystallizeImport() {
    const crystallizeFormat = this.products.map(product => ({
      // Crystallize import format
      catalogueItem: {
        name: product.name,
        shape: product.shape,
        path: product.path,
        topics: product.topics,
        components: Object.entries(product.components).map(([id, component]) => ({
          componentId: id,
          ...component
        })),
        variants: product.variants
      }
    }));

    const importFile = 'crystallize-import.json';
    await fs.writeFile(importFile, JSON.stringify(crystallizeFormat, null, 2));
    console.log(`📤 Generated Crystallize import file: ${importFile}`);
  }
}

// Run the scraper
async function main() {
  try {
    const scraper = new HeatShopScraper();
    
    // Scrape products
    await scraper.scrapeProducts();
    
    // Save results
    await scraper.saveProducts();
    await scraper.generateCrystallizeImport();
    
    console.log('\n✨ Scraping completed successfully!');
    console.log(`📊 Total products: ${scraper.products.length}`);
    console.log(`📁 Output files:`);
    console.log(`  - ${CONFIG.outputFile} (detailed data)`);
    console.log(`  - crystallize-import.json (import format)`);
    
  } catch (error) {
    console.error('💥 Scraping failed:', error);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { HeatShopScraper, CONFIG, CATEGORIES };

// Run if called directly
if (require.main === module) {
  main();
}