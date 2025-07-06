/**
 * Enhanced HeatShop Product Scraper with Crystallize & Supabase Image Integration
 * 
 * This enhanced version of the scraper includes:
 * - Image upload to Crystallize CMS (primary)
 * - Image backup to Supabase Storage (secondary)
 * - Cost-effective image hosting strategy
 * - Enhanced error handling and retry logic
 * 
 * @author Norko Development Team
 * @version 3.0.0
 * @since 2025-07-06
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { ImageUploadService } = require('./image-upload-service');

// Load environment variables if available
try {
  require('dotenv').config();
} catch (error) {
  console.log('💡 Install dotenv for .env file support: npm install dotenv');
}

// Enhanced configuration for cloud image integration
const ENHANCED_CONFIG = {
  baseUrl: 'https://www.heatershop.co.uk',
  delay: 2000, // 2 seconds between requests (respectful scraping)
  maxProducts: 10, // Start with fewer products for testing
  outputFile: 'crystallize-products-enhanced.json',
  userAgent: 'Educational-Portfolio-Bot/1.0',
  
  // Image handling configuration
  enableImageUpload: true, // Upload to Crystallize & Supabase
  enableLocalBackup: false, // Disable local image storage
  maxImagesPerProduct: 5, // Limit images per product
  imageQualityThreshold: 50000, // Minimum file size for quality images (50KB)
  
  // Scraping behavior
  validateData: true,
  retryFailedRequests: true,
  maxRetries: 3,
  generateFallbackData: true,
  
  // Test mode configuration
  testMode: true, // Enable for testing with limited products
  testCategories: ['Panel Heaters'], // Test with specific categories only
};

// Test-friendly categories
const TEST_CATEGORIES = [
  {
    name: 'Panel Heaters',
    path: '/infrared-heaters/infrared-panel-heaters',
    crystallizePath: '/infrared-heaters/panel-heaters',
    description: 'Wall-mounted infrared panel heaters',
    powerRange: '250W - 1200W',
  }
];

/**
 * Enhanced HeatShop Scraper with Cloud Image Integration
 */
class EnhancedHeatShopScraper {
  constructor() {
    this.products = [];
    this.processedUrls = new Set();
    this.requestCount = 0;
    this.errors = [];
    this.startTime = Date.now();
    
    // Enhanced statistics tracking
    this.statistics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      productsExtracted: 0,
      categoriesProcessed: 0,
      imagesProcessed: 0,
      imagesUploaded: 0,
      imageUploadsFailed: 0,
      crystallizeUploads: 0,
      supabaseUploads: 0
    };
    
    // Initialize image upload service
    this.imageService = new ImageUploadService();
    console.log('🚀 Enhanced scraper initialized with cloud image integration');
  }

  /**
   * Main scraping function
   */
  async scrapeProducts() {
    console.log('🕷️  Starting enhanced product scraping with cloud image integration...');
    console.log(`📊 Target: ${ENHANCED_CONFIG.maxProducts} products`);
    console.log('=====================================');
    
    try {
      // Wait for image service initialization
      console.log('⏳ Initializing image upload services...');
      await this.delay(3000); // Allow time for service initialization
      
      const categories = ENHANCED_CONFIG.testMode ? TEST_CATEGORIES : CATEGORIES;
      
      for (const category of categories) {
        if (this.products.length >= ENHANCED_CONFIG.maxProducts) {
          console.log(`✅ Reached maximum product limit (${ENHANCED_CONFIG.maxProducts})`);
          break;
        }
        
        console.log(`\\n📂 Processing category: ${category.name}`);
        await this.scrapeCategoryProducts(category);
        
        this.statistics.categoriesProcessed++;
        
        // Delay between categories
        await this.delay(3000);
      }
      
      // Generate final output
      await this.generateOutput();
      this.printStatistics();
      
      console.log('✅ Enhanced scraping completed successfully!');
      
    } catch (error) {
      console.error('❌ Scraping failed:', error.message);
      this.errors.push({
        type: 'SCRAPING_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Scrape products from a specific category
   */
  async scrapeCategoryProducts(category) {
    try {
      const categoryUrl = ENHANCED_CONFIG.baseUrl + category.path;
      console.log(`🔍 Fetching category page: ${categoryUrl}`);
      
      const response = await this.makeRequest(categoryUrl);
      if (!response) return;
      
      const $ = cheerio.load(response.data);
      
      // Extract product links
      const productLinks = this.extractProductLinks($, category);
      console.log(`📦 Found ${productLinks.length} products in ${category.name}`);
      
      // Process each product
      for (const [index, productUrl] of productLinks.entries()) {
        if (this.products.length >= ENHANCED_CONFIG.maxProducts) break;
        
        console.log(`\\n📦 Processing product ${index + 1}/${productLinks.length}: ${productUrl}`);
        await this.scrapeProduct(productUrl, category);
        
        // Delay between products
        await this.delay();
      }
      
    } catch (error) {
      console.error(`❌ Failed to scrape category ${category.name}:`, error.message);
      this.errors.push({
        type: 'CATEGORY_ERROR',
        category: category.name,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Extract product links from category page
   */
  extractProductLinks($, category) {
    const productLinks = [];
    
    // Common selectors for product links
    const selectors = [
      'a[href*="/product"]',
      'a[href*="heater"]',
      '.product-item a',
      '.product-card a',
      '.product-link',
      '[class*="product"] a'
    ];
    
    selectors.forEach(selector => {
      $(selector).each((i, element) => {
        const href = $(element).attr('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : ENHANCED_CONFIG.baseUrl + href;
          if (!productLinks.includes(fullUrl) && !this.processedUrls.has(fullUrl)) {
            productLinks.push(fullUrl);
          }
        }
      });
    });
    
    return productLinks.slice(0, ENHANCED_CONFIG.maxProducts);
  }

  /**
   * Scrape individual product with enhanced image processing
   */
  async scrapeProduct(productUrl, category) {
    try {
      if (this.processedUrls.has(productUrl)) {
        console.log('⏭️  Already processed, skipping...');
        return;
      }
      
      this.processedUrls.add(productUrl);
      
      const response = await this.makeRequest(productUrl);
      if (!response) return;
      
      const $ = cheerio.load(response.data);
      
      // Extract basic product information
      const name = this.extractProductName($);
      const price = this.extractPrice($);
      const description = this.extractDescription($);
      const specifications = this.extractSpecifications($);
      
      if (!name || name.trim() === '') {
        console.log('⚠️  No product name found, skipping...');
        return;
      }
      
      console.log(`📝 Product: ${name}`);
      console.log(`💰 Price: ${price || 'N/A'}`);
      
      // Generate product ID
      const productId = this.generateProductId(name);
      
      // Enhanced image processing with cloud upload
      console.log(`📸 Processing images for ${name}...`);
      const images = await this.processProductImages($, productId, name);
      
      // Create enhanced product object
      const product = this.createProductObject({
        name,
        price,
        description,
        specifications,
        images,
        productId,
        category: category.name,
        sourceUrl: productUrl,
        scrapedAt: new Date().toISOString()
      });
      
      this.products.push(product);
      this.statistics.productsExtracted++;
      
      console.log(`✅ Product processed successfully (${this.products.length}/${ENHANCED_CONFIG.maxProducts})`);
      
    } catch (error) {
      console.error(`❌ Failed to scrape product ${productUrl}:`, error.message);
      this.errors.push({
        type: 'PRODUCT_ERROR',
        url: productUrl,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Enhanced image processing with cloud upload
   */
  async processProductImages($, productId, productName) {
    try {
      // Extract image URLs from page
      const imageUrls = this.extractImageUrls($, productName);
      
      if (imageUrls.length === 0) {
        console.log(`⚠️  No images found for ${productName}`);
        return [];
      }
      
      console.log(`🔍 Found ${imageUrls.length} potential images`);
      
      // Filter valid product images
      const validImageUrls = imageUrls
        .filter(url => this.isValidProductImage(url, productName))
        .slice(0, ENHANCED_CONFIG.maxImagesPerProduct);
      
      console.log(`✅ ${validImageUrls.length} valid product images identified`);
      this.statistics.imagesProcessed += validImageUrls.length;
      
      if (!ENHANCED_CONFIG.enableImageUpload || validImageUrls.length === 0) {
        // Return original URLs if upload disabled
        return validImageUrls.map((url, index) => ({
          url: url,
          altText: `${productName} - Image ${index + 1}`,
          isCloudHosted: false,
          originalUrl: url
        }));
      }
      
      // Upload images to cloud services
      console.log(`☁️  Uploading ${validImageUrls.length} images to cloud services...`);
      
      const uploadResults = await this.imageService.uploadProductImages(
        validImageUrls,
        productId,
        productName
      );
      
      // Process upload results
      const processedImages = uploadResults.map((result, index) => {
        if (result.success) {
          this.statistics.imagesUploaded++;
          
          if (result.primaryUrl) this.statistics.crystallizeUploads++;
          if (result.backupUrl) this.statistics.supabaseUploads++;
          
          // Prefer Crystallize CDN URL, fallback to Supabase, then original
          const imageUrl = result.primaryUrl || result.backupUrl || result.originalUrl;
          
          console.log(`✅ Image ${index + 1} uploaded: ${imageUrl}`);
          
          return {
            url: imageUrl,
            crystallizeUrl: result.primaryUrl,
            supabaseUrl: result.backupUrl,
            altText: result.altText,
            originalUrl: result.originalUrl,
            crystallizeId: result.crystallizeId,
            supabasePath: result.supabasePath,
            uploadedAt: new Date().toISOString(),
            isCloudHosted: !!(result.primaryUrl || result.backupUrl)
          };
        } else {
          this.statistics.imageUploadsFailed++;
          console.warn(`⚠️  Image ${index + 1} upload failed: ${result.error}`);
          
          // Return original URL as fallback
          return {
            url: result.originalUrl,
            altText: result.altText,
            originalUrl: result.originalUrl,
            isCloudHosted: false,
            uploadError: result.error
          };
        }
      }).filter(img => img.url);
      
      console.log(`📸 Successfully processed ${processedImages.length} images for ${productName}`);
      return processedImages;
      
    } catch (error) {
      console.error(`❌ Failed to process images for ${productName}:`, error.message);
      this.statistics.imageUploadsFailed++;
      return [];
    }
  }

  /**
   * Extract image URLs from page
   */
  extractImageUrls($, productName) {
    const imageUrls = [];
    
    // Extract from img tags
    $('img').each((i, element) => {
      const src = $(element).attr('src');
      const dataSrc = $(element).attr('data-src');
      const srcset = $(element).attr('srcset');
      
      [src, dataSrc].forEach(source => {
        if (source && source.trim()) {
          const fullUrl = source.startsWith('http') ? source : ENHANCED_CONFIG.baseUrl + source;
          if (!imageUrls.includes(fullUrl)) {
            imageUrls.push(fullUrl);
          }
        }
      });
      
      // Parse srcset
      if (srcset) {
        const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
        srcsetUrls.forEach(url => {
          if (url) {
            const fullUrl = url.startsWith('http') ? url : ENHANCED_CONFIG.baseUrl + url;
            if (!imageUrls.includes(fullUrl)) {
              imageUrls.push(fullUrl);
            }
          }
        });
      }
    });
    
    return imageUrls;
  }

  /**
   * Validate if image URL is a product image
   */
  isValidProductImage(imageUrl, productName) {
    const urlLower = imageUrl.toLowerCase();
    const productWords = productName.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    // Include criteria
    const includeKeywords = [
      'product', 'heater', 'panel', 'infrared', 'heating',
      ...productWords
    ];
    
    // Exclude criteria
    const excludeKeywords = [
      'logo', 'icon', 'banner', 'header', 'footer', 'menu',
      'social', 'facebook', 'twitter', 'payment', 'badge',
      'award', 'delivery', 'shipping', 'warranty-badge'
    ];
    
    // Check exclusions first
    if (excludeKeywords.some(keyword => urlLower.includes(keyword))) {
      return false;
    }
    
    // Check inclusions
    return includeKeywords.some(keyword => urlLower.includes(keyword));
  }

  // Utility methods
  async makeRequest(url) {
    try {
      this.statistics.totalRequests++;
      const response = await axios.get(url, {
        headers: { 'User-Agent': ENHANCED_CONFIG.userAgent },
        timeout: 30000
      });
      this.statistics.successfulRequests++;
      return response;
    } catch (error) {
      this.statistics.failedRequests++;
      console.error(`❌ Request failed: ${url} - ${error.message}`);
      return null;
    }
  }

  extractProductName($) {
    const selectors = ['h1', '.product-title', '.product-name', '[class*="title"]'];
    for (const selector of selectors) {
      const name = $(selector).first().text().trim();
      if (name) return name;
    }
    return 'Unknown Product';
  }

  extractPrice($) {
    const selectors = ['.price', '.product-price', '[class*="price"]'];
    for (const selector of selectors) {
      const price = $(selector).first().text().trim();
      if (price) return price;
    }
    return null;
  }

  extractDescription($) {
    const selectors = ['.description', '.product-description', '.product-info'];
    for (const selector of selectors) {
      const desc = $(selector).first().text().trim();
      if (desc) return desc;
    }
    return null;
  }

  extractSpecifications($) {
    const specs = {};
    $('.specification, .spec, .feature').each((i, element) => {
      const text = $(element).text().trim();
      if (text.includes(':')) {
        const [key, value] = text.split(':').map(s => s.trim());
        if (key && value) specs[key] = value;
      }
    });
    return Object.keys(specs).length > 0 ? specs : null;
  }

  generateProductId(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  createProductObject(data) {
    return {
      id: data.productId,
      name: data.name,
      price: data.price,
      description: data.description,
      specifications: data.specifications,
      images: data.images,
      category: data.category,
      sourceUrl: data.sourceUrl,
      scrapedAt: data.scrapedAt,
      // Crystallize-specific format
      crystallize: {
        shape: 'product',
        name: data.name,
        components: {
          name: { type: 'singleLine', content: data.name },
          price: { type: 'numeric', content: this.parsePrice(data.price) },
          description: { type: 'richText', content: data.description },
          images: {
            type: 'images',
            content: data.images.map(img => ({
              src: img.url,
              altText: img.altText,
              crystallizeId: img.crystallizeId
            }))
          },
          specifications: { type: 'propertiesTable', content: data.specifications }
        }
      }
    };
  }

  parsePrice(priceString) {
    if (!priceString) return null;
    const match = priceString.match(/[£$€]?([\\d,]+\\.?\\d*)/);
    return match ? parseFloat(match[1].replace(',', '')) : null;
  }

  async delay(ms = ENHANCED_CONFIG.delay) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateOutput() {
    try {
      const output = {
        metadata: {
          scraper: 'Enhanced HeatShop Scraper v3.0',
          scrapedAt: new Date().toISOString(),
          totalProducts: this.products.length,
          categories: [...new Set(this.products.map(p => p.category))],
          imageStrategy: 'Crystallize CMS + Supabase Storage',
          statistics: this.statistics
        },
        products: this.products,
        errors: this.errors
      };

      await fs.writeFile(
        ENHANCED_CONFIG.outputFile,
        JSON.stringify(output, null, 2),
        'utf8'
      );

      console.log(`\\n💾 Output saved to: ${ENHANCED_CONFIG.outputFile}`);
    } catch (error) {
      console.error('❌ Failed to save output:', error.message);
    }
  }

  printStatistics() {
    const duration = (Date.now() - this.startTime) / 1000;
    
    console.log('\\n📊 Scraping Statistics');
    console.log('=======================');
    console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
    console.log(`📦 Products extracted: ${this.statistics.productsExtracted}`);
    console.log(`📂 Categories processed: ${this.statistics.categoriesProcessed}`);
    console.log(`🌐 Requests made: ${this.statistics.totalRequests}`);
    console.log(`✅ Successful requests: ${this.statistics.successfulRequests}`);
    console.log(`❌ Failed requests: ${this.statistics.failedRequests}`);
    console.log(`\\n🖼️  Image Statistics`);
    console.log(`📸 Images processed: ${this.statistics.imagesProcessed}`);
    console.log(`☁️  Images uploaded: ${this.statistics.imagesUploaded}`);
    console.log(`❌ Upload failures: ${this.statistics.imageUploadsFailed}`);
    console.log(`🎯 Crystallize uploads: ${this.statistics.crystallizeUploads}`);
    console.log(`💾 Supabase uploads: ${this.statistics.supabaseUploads}`);
    
    if (this.statistics.imagesProcessed > 0) {
      const successRate = (this.statistics.imagesUploaded / this.statistics.imagesProcessed * 100).toFixed(1);
      console.log(`📈 Upload success rate: ${successRate}%`);
    }
  }
}

// Run scraper if this file is executed directly
if (require.main === module) {
  const scraper = new EnhancedHeatShopScraper();
  scraper.scrapeProducts();
}

module.exports = { EnhancedHeatShopScraper, ENHANCED_CONFIG };
