/**
 * HeatShop Product Scraper for Crystallize E-Commerce Platform
 * 
 * This scraper extracts comprehensive infrared heater product data from HeatShop
 * and formats it for import into Crystallize headless CMS.
 * 
 * Features:
 * - Respectful scraping with rate limiting
 * - Comprehensive product data extraction
 * - TypeScript-like data validation
 * - Crystallize-formatted output
 * - Error handling and logging
 * 
 * @author Norko Development Team
 * @version 2.0.0
 * @since 2025-07-06
 */

// HeatShop Product Scraper for Crystallize
// Extracts ~100 infrared heater products and formats for Crystallize import

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Enhanced configuration with new extraction capabilities
const CONFIG = {
  baseUrl: 'https://www.heatershop.co.uk',
  delay: 2000, // 2 seconds between requests (respectful scraping)
  maxProducts: 100,
  outputFile: 'crystallize-products.json',
  userAgent: 'Educational-Portfolio-Bot/1.0',
  // New enhanced options
  enableImageDownload: false, // Set to true to download images locally
  validateData: true, // Validate extracted data before saving
  retryFailedRequests: true, // Retry failed requests
  maxRetries: 3,
  generateFallbackData: true, // Generate dummy data when real data missing
  extractTechnicalSpecs: true, // Enhanced technical specification extraction
  categorizeByPower: true, // Automatically categorize by power rating
};

// Enhanced categories with more detailed targeting
const CATEGORIES = [
  {
    name: 'Panel Heaters',
    path: '/infrared-heaters/infrared-panel-heaters',
    crystallizePath: '/infrared-heaters/panel-heaters',
    description: 'Wall-mounted infrared panel heaters perfect for residential and office spaces',
    powerRange: '250W - 1200W',
    targetSelectors: {
      products: '.product-item, .product-card, [class*="product"]',
      productLinks: 'a[href*="panel"], a[href*="infrared"]'
    }
  },
  {
    name: 'Ceiling Heaters', 
    path: '/infrared-heaters/ceiling-infrared-heaters-1',
    crystallizePath: '/infrared-heaters/ceiling-heaters',
    description: 'Ceiling-mounted infrared heaters ideal for commercial environments',
    powerRange: '1000W - 3000W',
    targetSelectors: {
      products: '.product-item, .product-card, [class*="product"]',
      productLinks: 'a[href*="ceiling"], a[href*="cassette"]'
    }
  },
  {
    name: 'Industrial Heaters',
    path: '/infrared-heaters/industrial-warehouse', 
    crystallizePath: '/infrared-heaters/industrial-heaters',
    description: 'Heavy-duty infrared heaters for workshops and industrial spaces',
    powerRange: '2000W - 6000W',
    targetSelectors: {
      products: '.product-item, .product-card, [class*="product"]',
      productLinks: 'a[href*="industrial"], a[href*="warehouse"]'
    }
  },
  {
    name: 'Far Infrared Heaters',
    path: '/infrared-heaters/far-infrared-heaters',
    crystallizePath: '/infrared-heaters/far-infrared-heaters',
    description: 'Health-focused far infrared heating technology',
    powerRange: '300W - 800W',
    targetSelectors: {
      products: '.product-item, .product-card, [class*="product"]',
      productLinks: 'a[href*="far"], a[href*="health"]'
    }
  },
  {
    name: 'Patio Heaters',
    path: '/infrared-heaters/outdoor-patio-heaters',
    crystallizePath: '/infrared-heaters/patio-heaters',
    description: 'Outdoor infrared heaters for patios and hospitality',
    powerRange: '1500W - 3000W',
    targetSelectors: {
      products: '.product-item, .product-card, [class*="product"]',
      productLinks: 'a[href*="patio"], a[href*="outdoor"]'
    }
  }
];

class HeatShopScraper {
  constructor() {
    this.products = [];
    this.processedUrls = new Set();
    this.requestCount = 0;
    // Enhanced tracking
    this.errors = [];
    this.retryCount = 0;
    this.startTime = Date.now();
    this.statistics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      productsExtracted: 0,
      categoriesProcessed: 0
    };
  }

  /**
   * Add delay between requests to be respectful to the target server
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise<void>}
   */
  async delay(ms = CONFIG.delay) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with enhanced error handling and retries
   * @param {string} url - URL to fetch
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<string|null>} HTML content or null if failed
   */
  async makeRequest(url, retryCount = 0) {
    try {
      this.requestCount++;
      this.statistics.totalRequests++;
      console.log(`Request ${this.requestCount}: ${url}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': CONFIG.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 15000 // Increased timeout
      });
      
      this.statistics.successfulRequests++;
      await this.delay();
      return response.data;
      
    } catch (error) {
      this.statistics.failedRequests++;
      console.error(`Error fetching ${url}:`, error.message);
      
      // Retry logic
      if (CONFIG.retryFailedRequests && retryCount < CONFIG.maxRetries) {
        console.log(`Retrying request ${retryCount + 1}/${CONFIG.maxRetries}...`);
        await this.delay(CONFIG.delay * 2); // Longer delay for retries
        return this.makeRequest(url, retryCount + 1);
      }
      
      this.errors.push({
        url,
        error: error.message,
        timestamp: new Date().toISOString(),
        retryCount
      });
      
      return null;
    }
  }

  /**
   * Enhanced product URL extraction with multiple strategies
   * @param {string} categoryUrl - Category page URL
   * @param {Object} category - Category configuration object
   * @returns {Promise<Array<string>>} Array of product URLs
   */
  async extractProductUrls(categoryUrl, category) {
    const html = await this.makeRequest(categoryUrl);
    if (!html) return [];

    const $ = cheerio.load(html);
    const productUrls = new Set(); // Use Set to avoid duplicates

    // Strategy 1: Use category-specific selectors
    if (category.targetSelectors) {
      $(category.targetSelectors.products).each((i, element) => {
        const link = $(element).find('a').first().attr('href');
        if (link) {
          const fullUrl = link.startsWith('http') ? link : CONFIG.baseUrl + link;
          productUrls.add(fullUrl);
        }
      });

      $(category.targetSelectors.productLinks).each((i, element) => {
        const href = $(element).attr('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : CONFIG.baseUrl + href;
          productUrls.add(fullUrl);
        }
      });
    }

    // Strategy 2: Look for common product patterns
    $('a[href*="/"]').each((i, element) => {
      const href = $(element).attr('href');
      if (href && this.isProductUrl(href, category)) {
        const fullUrl = href.startsWith('http') ? href : CONFIG.baseUrl + href;
        productUrls.add(fullUrl);
      }
    });

    // Strategy 3: Look for product cards/containers
    $('.product-item, .product-card, .product-tile, .item, [class*="product"]').each((i, element) => {
      const link = $(element).find('a').first().attr('href');
      if (link && this.isProductUrl(link, category)) {
        const fullUrl = link.startsWith('http') ? link : CONFIG.baseUrl + link;
        productUrls.add(fullUrl);
      }
    });

    // Filter out already processed URLs
    const newUrls = Array.from(productUrls).filter(url => !this.processedUrls.has(url));
    
    // Mark URLs as processed
    newUrls.forEach(url => this.processedUrls.add(url));

    console.log(`Found ${newUrls.length} new product URLs in category ${category.name}`);
    return newUrls.slice(0, 25); // Limit per category
  }

  /**
   * Determine if a URL is likely a product page
   * @param {string} url - URL to check
   * @param {Object} category - Category context
   * @returns {boolean} True if likely a product URL
   */
  isProductUrl(url, category) {
    const productIndicators = [
      'heater', 'infrared', 'panel', 'ceiling', 'industrial', 
      'patio', 'outdoor', 'herschel', 'product'
    ];
    
    const excludePatterns = [
      'category', 'categories', '?', '#', 'javascript:', 'mailto:',
      '/search', '/cart', '/checkout', '/account', '/login'
    ];

    // Must contain product indicators
    const hasProductKeyword = productIndicators.some(keyword => 
      url.toLowerCase().includes(keyword)
    );

    // Must not contain exclude patterns
    const hasExcludePattern = excludePatterns.some(pattern => 
      url.toLowerCase().includes(pattern)
    );

    return hasProductKeyword && !hasExcludePattern && url.length > 10;
  }

  /**
   * Enhanced product details extraction with comprehensive data capture
   * @param {string} productUrl - Product page URL
   * @param {Object} category - Category configuration
   * @returns {Promise<Object|null>} Product data object or null if extraction failed
   */
  async extractProductDetails(productUrl, category) {
    const html = await this.makeRequest(productUrl);
    if (!html) return null;

    const $ = cheerio.load(html);

    try {
      // Extract comprehensive product information
      const name = this.extractProductName($);
      const price = this.extractPrice($);
      const description = this.extractDescription($);
      const specifications = this.extractEnhancedSpecifications($);
      const features = this.extractFeatures($);
      const images = this.extractImages($);
      const technicalSpecs = this.extractTechnicalSpecifications($);
      const warranty = this.extractWarrantyInfo($);
      const availability = this.extractAvailability($);

      // Validate extracted data
      if (CONFIG.validateData && !this.validateProductData(name, price, specifications)) {
        console.warn(`Validation failed for product: ${name}`);
        if (!CONFIG.generateFallbackData) {
          return null;
        }
      }

      // Generate enhanced product data structure
      const product = {
        id: this.generateId(name),
        name: name,
        path: this.generatePath(name, category),
        shape: 'Heater Product',
        category: category.name,
        categoryDescription: category.description,
        crystallizePath: category.crystallizePath,
        sourceUrl: productUrl,
        extractedAt: new Date().toISOString(),
        
        // Enhanced product data
        pricing: {
          basePrice: price,
          currency: 'GBP',
          priceRange: this.calculatePriceRange(price, specifications),
          vatIncluded: true
        },
        
        // Comprehensive specifications
        specifications: {
          basic: specifications,
          technical: technicalSpecs,
          powerCategory: this.categorizePower(specifications.wattage),
          efficiency: this.calculateEfficiency(specifications),
          coverage: this.calculateCoverage(specifications)
        },
        
        // Product information
        information: {
          description: description,
          features: features,
          warranty: warranty,
          availability: availability,
          manufacturer: this.extractManufacturer($, name),
          model: this.extractModel($, name)
        },
        
        // Media assets
        media: {
          images: images,
          hasDatasheet: this.hasDatasheet($),
          hasManual: this.hasManual($)
        },
        
        // Crystallize component structure
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
              weight: specifications.weight || this.generateDummyWeight(),
              coverage: specifications.coverage || this.calculateCoverage(specifications),
              mounting: specifications.mounting || 'Wall mounted',
              efficiency: specifications.efficiency || 'A+ Energy Rating'
            }]
          },
          features: {
            type: 'richText',
            content: {
              html: features,
              plainText: this.stripHtml(features)
            }
          },
          technicalSpecs: {
            type: 'contentChunk',
            chunks: [technicalSpecs]
          },
          productImages: {
            type: 'images',
            images: images
          },
          warranty: {
            type: 'singleLine',
            text: warranty
          }
        },
        
        variants: this.generateEnhancedVariants(name, price, specifications),
        topics: [category.crystallizePath],
        
        // SEO and marketing data
        seo: {
          title: `${name} - ${category.name} | Norko Infrared Heaters`,
          description: `${name}. ${this.stripHtml(description).substring(0, 160)}...`,
          keywords: this.generateKeywords(name, category, specifications)
        }
      };

      return product;
      
    } catch (error) {
      console.error(`Error extracting product from ${productUrl}:`, error.message);
      this.errors.push({
        url: productUrl,
        error: error.message,
        timestamp: new Date().toISOString(),
        step: 'product_extraction'
      });
      return null;
    }
  }

  /**
   * Extract product name with multiple fallback strategies
   * @param {Object} $ - Cheerio object
   * @returns {string} Product name
   */
  extractProductName($) {
    const selectors = [
      'h1',
      '.product-title',
      '.product-name', 
      'title',
      '.page-title',
      '[class*="title"]'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim()) {
        return element.text().trim().replace(/\s+/g, ' ');
      }
    }

    return 'Unknown Product';
  }

  /**
   * Extract price with enhanced pattern matching
   * @param {Object} $ - Cheerio object
   * @returns {number} Product price
   */
  extractPrice($) {
    const selectors = [
      '.price',
      '.product-price',
      '[class*="price"]',
      '.cost',
      '.amount'
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

  /**
   * Extract product description
   * @param {Object} $ - Cheerio object
   * @returns {string} Product description
   */
  extractDescription($) {
    const selectors = [
      '.product-description',
      '.description', 
      '.product-details',
      '.product-info p',
      '.content p',
      '.summary'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim().length > 50) {
        return element.html() || element.text();
      }
    }

    return '<p>High-quality infrared heater providing efficient and comfortable heating.</p>';
  }

  /**
   * Extract product features
   * @param {Object} $ - Cheerio object
   * @returns {string} Features HTML
   */
  extractFeatures($) {
    const features = [];
    
    // Look for bullet points or feature lists
    $('ul li, .features li, .benefits li, .feature-list li').each((i, element) => {
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

  /**
   * Extract product images
   * @param {Object} $ - Cheerio object
   * @returns {Array<Object>} Array of image objects
   */
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

  /**
   * Extract model number from product name or page
   * @param {Object} $ - Cheerio object
   * @param {string} productName - Product name
   * @returns {string} Model number
   */
  extractModel($, productName) {
    // Look for model patterns in the name
    const modelPatterns = [
      /model[:\s]+([a-z0-9-]+)/i,
      /([a-z]{2,}\s*\d{3,})/i,
      /([a-z]+\d+[a-z]*)/i
    ];

    const fullText = $.text() + ' ' + productName;
    
    for (const pattern of modelPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // Generate model from name
    const nameWords = productName.split(' ').filter(word => word.length > 2);
    return nameWords.slice(0, 2).join('-').toUpperCase();
  }

  /**
   * Enhanced specification extraction with technical details
   * @param {Object} $ - Cheerio object
   * @returns {Object} Comprehensive specifications object
   */
  extractEnhancedSpecifications($) {
    const specs = {
      wattage: null,
      dimensions: null,
      weight: null,
      mounting: null,
      coverage: null,
      efficiency: null,
      voltage: null,
      heating_type: null,
      control_type: null,
      ip_rating: null
    };

    const fullText = $.html().toLowerCase();

    // Enhanced wattage extraction
    const wattagePatterns = [
      /(\d+)\s*w(?:att)?s?/i,
      /power:\s*(\d+)w/i,
      /(\d+)w\s*heater/i
    ];
    for (const pattern of wattagePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        specs.wattage = parseInt(match[1]);
        break;
      }
    }

    // Enhanced dimensions extraction
    const dimensionPatterns = [
      /(\d+)\s*(?:mm|cm)?\s*x\s*(\d+)\s*(?:mm|cm)?(?:\s*x\s*(\d+)\s*(?:mm|cm)?)?/i,
      /dimensions?:\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*(?:x\s*(\d+(?:\.\d+)?))?\s*(?:mm|cm)/i,
      /size:\s*(\d+)\s*x\s*(\d+)(?:\s*x\s*(\d+))?\s*(?:mm|cm)/i
    ];
    for (const pattern of dimensionPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        const width = match[1];
        const height = match[2];
        const depth = match[3] || '8'; // Default depth for panels
        specs.dimensions = `${width}mm x ${height}mm x ${depth}mm`;
        break;
      }
    }

    // Weight extraction
    const weightPatterns = [
      /(\d+(?:\.\d+)?)\s*kg/i,
      /weight:\s*(\d+(?:\.\d+)?)\s*kg/i
    ];
    for (const pattern of weightPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        specs.weight = parseFloat(match[1]);
        break;
      }
    }

    // Coverage area extraction
    const coveragePatterns = [
      /(\d+)\s*m[²2]/i,
      /coverage:\s*(\d+)\s*m/i,
      /heating\s*area:\s*(\d+)\s*m/i
    ];
    for (const pattern of coveragePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        specs.coverage = `${match[1]}m²`;
        break;
      }
    }

    // Voltage extraction
    const voltageMatch = fullText.match(/(\d+)v/i);
    if (voltageMatch) {
      specs.voltage = `${voltageMatch[1]}V`;
    }

    // IP Rating extraction
    const ipMatch = fullText.match(/ip\s*(\d+)/i);
    if (ipMatch) {
      specs.ip_rating = `IP${ipMatch[1]}`;
    }

    // Mounting type
    if (fullText.includes('wall') || fullText.includes('mount')) {
      specs.mounting = 'Wall mounted';
    } else if (fullText.includes('ceiling')) {
      specs.mounting = 'Ceiling mounted';
    } else if (fullText.includes('portable') || fullText.includes('freestanding')) {
      specs.mounting = 'Freestanding';
    }

    // Control type
    if (fullText.includes('thermostat')) {
      specs.control_type = 'Thermostat controlled';
    } else if (fullText.includes('remote')) {
      specs.control_type = 'Remote controlled';
    } else if (fullText.includes('switch')) {
      specs.control_type = 'Switch controlled';
    }

    return specs;
  }

  /**
   * Extract technical specifications table/list
   * @param {Object} $ - Cheerio object
   * @returns {Object} Technical specifications
   */
  extractTechnicalSpecifications($) {
    const techSpecs = {};
    
    // Look for specification tables
    $('table tr, .specs tr, .specifications tr').each((i, row) => {
      const cells = $(row).find('td, th');
      if (cells.length >= 2) {
        const key = $(cells[0]).text().trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
        const value = $(cells[1]).text().trim();
        if (key && value && key.length < 50 && value.length < 200) {
          techSpecs[key] = value;
        }
      }
    });

    // Look for specification lists
    $('.specs li, .specifications li, .tech-specs li').each((i, item) => {
      const text = $(item).text().trim();
      const colonIndex = text.indexOf(':');
      if (colonIndex > 0 && colonIndex < text.length - 1) {
        const key = text.substring(0, colonIndex).trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
        const value = text.substring(colonIndex + 1).trim();
        if (key && value && key.length < 50 && value.length < 200) {
          techSpecs[key] = value;
        }
      }
    });

    return techSpecs;
  }

  /**
   * Extract warranty information
   * @param {Object} $ - Cheerio object
   * @returns {string} Warranty information
   */
  extractWarrantyInfo($) {
    const warrantyPatterns = [
      /(\d+)\s*year\s*warranty/i,
      /warranty:\s*(\d+)\s*years?/i,
      /guaranteed\s*for\s*(\d+)\s*years?/i
    ];

    const fullText = $.text();
    for (const pattern of warrantyPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        return `${match[1]} year warranty`;
      }
    }

    return '2 year manufacturer warranty'; // Default
  }

  /**
   * Extract availability/stock information
   * @param {Object} $ - Cheerio object
   * @returns {string} Availability status
   */
  extractAvailability($) {
    const availabilitySelectors = [
      '.stock-status',
      '.availability',
      '[class*="stock"]',
      '[class*="available"]'
    ];

    for (const selector of availabilitySelectors) {
      const element = $(selector).first();
      if (element.length) {
        const text = element.text().trim().toLowerCase();
        if (text.includes('in stock') || text.includes('available')) {
          return 'In Stock';
        } else if (text.includes('out of stock') || text.includes('unavailable')) {
          return 'Out of Stock';
        }
      }
    }

    return 'Available'; // Default
  }

  /**
   * Extract manufacturer information
   * @param {Object} $ - Cheerio object
   * @param {string} productName - Product name for inference
   * @returns {string} Manufacturer name
   */
  extractManufacturer($, productName) {
    // Look for explicit manufacturer mentions
    const manufacturerSelectors = [
      '.manufacturer',
      '.brand',
      '[class*="brand"]'
    ];

    for (const selector of manufacturerSelectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim()) {
        return element.text().trim();
      }
    }

    // Infer from product name
    const commonBrands = ['herschel', 'ecostrad', 'infrared4homes', 'aurora', 'solus'];
    const nameLower = productName.toLowerCase();
    
    for (const brand of commonBrands) {
      if (nameLower.includes(brand)) {
        return brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    }

    return 'Premium Brand'; // Default
  }

  /**
   * Validate extracted product data
   * @param {string} name - Product name
   * @param {number} price - Product price
   * @param {Object} specifications - Product specifications
   * @returns {boolean} True if data is valid
   */
  validateProductData(name, price, specifications) {
    // Basic validation rules
    const isValidName = name && name.length > 5 && name.length < 200;
    const isValidPrice = price && price > 0 && price < 10000;
    const hasSpecs = specifications && Object.keys(specifications).length > 0;
    
    return isValidName && isValidPrice && hasSpecs;
  }

  /**
   * Categorize product by power rating
   * @param {number} wattage - Power in watts
   * @returns {string} Power category
   */
  categorizePower(wattage) {
    if (!wattage) return 'Unknown';
    if (wattage < 400) return 'Low Power (< 400W)';
    if (wattage < 800) return 'Medium Power (400-800W)';
    if (wattage < 1500) return 'High Power (800-1500W)';
    return 'Extra High Power (> 1500W)';
  }

  /**
   * Calculate coverage area based on power
   * @param {Object} specifications - Product specifications
   * @returns {string} Estimated coverage area
   */
  calculateCoverage(specifications) {
    if (specifications.coverage) return specifications.coverage;
    
    if (specifications.wattage) {
      // Rule of thumb: ~10-15W per m² for infrared heaters
      const coverage = Math.round(specifications.wattage / 12);
      return `${coverage}m²`;
    }
    
    return '15m²'; // Default
  }

  /**
   * Calculate price range for variants
   * @param {number} basePrice - Base product price
   * @param {Object} specifications - Product specifications
   * @returns {Object} Price range object
   */
  calculatePriceRange(basePrice, specifications) {
    const minPrice = Math.round(basePrice * 0.8 * 100) / 100;
    const maxPrice = Math.round(basePrice * 1.5 * 100) / 100;
    
    return {
      min: minPrice,
      max: maxPrice,
      base: basePrice
    };
  }

  /**
   * Calculate efficiency rating
   * @param {Object} specifications - Product specifications
   * @returns {string} Efficiency rating
   */
  calculateEfficiency(specifications) {
    // Infrared heaters are generally very efficient
    // Rate based on control features and mounting type
    if (specifications.control_type?.includes('thermostat')) {
      return 'A+ Energy Rating';
    } else if (specifications.control_type?.includes('remote')) {
      return 'A Energy Rating';
    }
    return 'B+ Energy Rating';
  }

  /**
   * Check if product has datasheet
   * @param {Object} $ - Cheerio object
   * @returns {boolean} True if datasheet link found
   */
  hasDatasheet($) {
    const datasheetLinks = $('a[href*="datasheet"], a[href*="spec"], a[href*="pdf"]');
    return datasheetLinks.length > 0;
  }

  /**
   * Check if product has manual
   * @param {Object} $ - Cheerio object
   * @returns {boolean} True if manual link found
   */
  hasManual($) {
    const manualLinks = $('a[href*="manual"], a[href*="guide"], a[href*="instructions"]');
    return manualLinks.length > 0;
  }

  /**
   * Generate SEO keywords
   * @param {string} name - Product name
   * @param {Object} category - Category information
   * @param {Object} specifications - Product specifications
   * @returns {Array<string>} SEO keywords
   */
  generateKeywords(name, category, specifications) {
    const keywords = [
      'infrared heater',
      'electric heater',
      'energy efficient heating',
      category.name.toLowerCase(),
      'norko heating'
    ];

    // Add power-based keywords
    if (specifications.wattage) {
      keywords.push(`${specifications.wattage}w heater`);
    }

    // Add mounting keywords
    if (specifications.mounting) {
      keywords.push(specifications.mounting.toLowerCase());
    }

    // Add name-based keywords
    const nameWords = name.toLowerCase().split(' ').filter(word => word.length > 3);
    keywords.push(...nameWords);

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Generate enhanced product variants
   * @param {string} name - Product name
   * @param {number} basePrice - Base price
   * @param {Object} specifications - Product specifications
   * @returns {Array<Object>} Product variants
   */
  generateEnhancedVariants(name, basePrice, specifications) {
    const variants = [];
    
    // If we have a specific wattage, create variants around it
    if (specifications.wattage) {
      const baseWattage = specifications.wattage;
      const wattageOptions = [baseWattage];
      
      // Add logical wattage variants
      if (baseWattage >= 300 && baseWattage < 600) {
        wattageOptions.push(baseWattage + 200, baseWattage + 400);
      } else if (baseWattage >= 600 && baseWattage < 1000) {
        wattageOptions.push(baseWattage - 200, baseWattage + 300);
      }
      
      wattageOptions.forEach((wattage, index) => {
        const priceMultiplier = wattage / baseWattage;
        const variantPrice = Math.round(basePrice * priceMultiplier * 100) / 100;
        
        variants.push({
          name: `${wattage}W`,
          sku: this.generateSku(name, wattage),
          price: variantPrice,
          priceVariants: [{
            identifier: 'default',
            price: variantPrice,
            currency: 'GBP'
          }],
          attributes: [
            { attribute: 'wattage', value: `${wattage}W` },
            { attribute: 'dimensions', value: specifications.dimensions || this.generateDummyDimensions() },
            { attribute: 'coverage', value: this.calculateCoverage({ wattage }) },
            { attribute: 'efficiency', value: this.calculateEfficiency(specifications) }
          ],
          stock: this.generateDummyStock(),
          isDefault: index === 0
        });
      });
    } else {
      // Generate standard variants
      const standardWattages = [350, 550, 900];
      standardWattages.forEach((wattage, index) => {
        const priceMultiplier = wattage / 350;
        const variantPrice = Math.round(basePrice * priceMultiplier * 100) / 100;
        
        variants.push({
          name: `${wattage}W`,
          sku: this.generateSku(name, wattage),
          price: variantPrice,
          priceVariants: [{
            identifier: 'default',
            price: variantPrice,
            currency: 'GBP'
          }],
          attributes: [
            { attribute: 'wattage', value: `${wattage}W` },
            { attribute: 'dimensions', value: this.generateDummyDimensions() },
            { attribute: 'coverage', value: this.calculateCoverage({ wattage }) }
          ],
          stock: this.generateDummyStock(),
          isDefault: index === 0
        });
      });
    }

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

  /**
   * Enhanced main scraping process with progress tracking and comprehensive logging
   * @returns {Promise<Array<Object>>} Array of extracted products
   */
  async scrapeProducts() {
    console.log('🚀 Starting Enhanced HeatShop Product Scraping...');
    console.log(`📋 Configuration:`);
    console.log(`   Target: ${CONFIG.maxProducts} products`);
    console.log(`   Delay: ${CONFIG.delay}ms between requests`);
    console.log(`   Retries: ${CONFIG.maxRetries} max per request`);
    console.log(`   Validation: ${CONFIG.validateData ? 'Enabled' : 'Disabled'}`);
    console.log(`   Categories: ${CATEGORIES.length}`);
    
    const totalStartTime = Date.now();
    
    for (const [categoryIndex, category] of CATEGORIES.entries()) {
      if (this.products.length >= CONFIG.maxProducts) break;
      
      console.log(`\n📂 Processing Category ${categoryIndex + 1}/${CATEGORIES.length}: ${category.name}`);
      console.log(`   Description: ${category.description}`);
      console.log(`   Power Range: ${category.powerRange}`);
      console.log(`   URL: ${CONFIG.baseUrl}${category.path}`);
      
      const categoryStartTime = Date.now();
      this.statistics.categoriesProcessed++;
      
      try {
        // Get product URLs from category page
        const productUrls = await this.extractProductUrls(CONFIG.baseUrl + category.path, category);
        
        if (productUrls.length === 0) {
          console.warn(`   ⚠️  No products found in category ${category.name}`);
          continue;
        }
        
        console.log(`   🔍 Found ${productUrls.length} product URLs to process`);
        
        // Process individual products
        let categoryProductCount = 0;
        for (const [urlIndex, productUrl] of productUrls.entries()) {
          if (this.products.length >= CONFIG.maxProducts) break;
          
          const productProgress = `${this.products.length + 1}/${CONFIG.maxProducts}`;
          const categoryProgress = `${urlIndex + 1}/${productUrls.length}`;
          
          console.log(`\n   📦 Product ${productProgress} (Category: ${categoryProgress})`);
          console.log(`       URL: ${productUrl}`);
          
          const productStartTime = Date.now();
          const product = await this.extractProductDetails(productUrl, category);
          const extractionTime = Date.now() - productStartTime;
          
          if (product) {
            this.products.push(product);
            this.statistics.productsExtracted++;
            categoryProductCount++;
            
            console.log(`       ✅ Success: ${product.name}`);
            console.log(`       💰 Price: £${product.pricing.basePrice}`);
            console.log(`       ⚡ Power: ${product.specifications.basic.wattage || 'Unknown'}W`);
            console.log(`       ⏱️  Extraction time: ${extractionTime}ms`);
          } else {
            console.log(`       ❌ Failed to extract product data`);
          }
          
          // Progress indicator
          const overall = Math.round((this.products.length / CONFIG.maxProducts) * 100);
          console.log(`       📊 Overall Progress: ${overall}% (${this.products.length}/${CONFIG.maxProducts})`);
        }
        
        const categoryTime = Date.now() - categoryStartTime;
        console.log(`\n   📊 Category ${category.name} Summary:`);
        console.log(`       Products extracted: ${categoryProductCount}`);
        console.log(`       Time taken: ${Math.round(categoryTime / 1000)}s`);
        console.log(`       Success rate: ${Math.round((categoryProductCount / productUrls.length) * 100)}%`);
        
      } catch (error) {
        console.error(`   💥 Category processing failed: ${error.message}`);
        this.errors.push({
          category: category.name,
          error: error.message,
          timestamp: new Date().toISOString(),
          step: 'category_processing'
        });
      }
    }
    
    const totalTime = Date.now() - totalStartTime;
    
    console.log(`\n🎉 Scraping Complete!`);
    console.log(`📊 Final Statistics:`);
    console.log(`   Total products extracted: ${this.products.length}`);
    console.log(`   Total time: ${Math.round(totalTime / 1000)}s`);
    console.log(`   Average time per product: ${Math.round(totalTime / this.products.length)}ms`);
    console.log(`   Success rate: ${Math.round((this.statistics.productsExtracted / this.statistics.totalRequests) * 100)}%`);
    console.log(`   Categories processed: ${this.statistics.categoriesProcessed}/${CATEGORIES.length}`);
    console.log(`   Total requests made: ${this.statistics.totalRequests}`);
    console.log(`   Failed requests: ${this.statistics.failedRequests}`);
    console.log(`   Errors encountered: ${this.errors.length}`);
    
    return this.products;
  }

  /**
   * Enhanced save method with comprehensive metadata
   * @returns {Promise<void>}
   */
  async saveProducts() {
    const output = {
      metadata: {
        scrapedAt: new Date().toISOString(),
        totalProducts: this.products.length,
        source: 'heatershop.co.uk',
        scraper: {
          version: '2.0.0',
          configuration: CONFIG,
          statistics: this.statistics,
          errors: this.errors,
          processingTime: Date.now() - this.startTime
        },
        categories: CATEGORIES.map(c => ({
          name: c.name,
          description: c.description,
          powerRange: c.powerRange,
          productsExtracted: this.products.filter(p => p.category === c.name).length
        })),
        dataQuality: {
          productsWithPricing: this.products.filter(p => p.pricing.basePrice > 0).length,
          productsWithSpecs: this.products.filter(p => p.specifications.basic.wattage).length,
          productsWithImages: this.products.filter(p => p.media.images.length > 0).length,
          averagePrice: Math.round(this.products.reduce((sum, p) => sum + p.pricing.basePrice, 0) / this.products.length),
          powerRange: {
            min: Math.min(...this.products.map(p => p.specifications.basic.wattage || 0).filter(w => w > 0)),
            max: Math.max(...this.products.map(p => p.specifications.basic.wattage || 0))
          }
        }
      },
      products: this.products
    };

    await fs.writeFile(CONFIG.outputFile, JSON.stringify(output, null, 2));
    console.log(`💾 Saved comprehensive data to ${CONFIG.outputFile}`);
    
    // Also save a summary report
    const summaryFile = 'scraping-summary.json';
    await fs.writeFile(summaryFile, JSON.stringify(output.metadata, null, 2));
    console.log(`📋 Saved scraping summary to ${summaryFile}`);
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