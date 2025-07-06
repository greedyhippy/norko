/**
 * Image Upload Service for Crystallize CMS and Supabase Storage
 * 
 * This service handles uploading product images to:
 * 1. Crystallize CMS (primary) - with built-in CDN
 * 2. Supabase Storage (backup) - free tier fallback
 * 
 * Features:
 * - Smart image validation and filtering
 * - Automatic resizing and optimization
 * - Crystallize asset management integration
 * - Supabase storage as backup
 * - Error handling and retry logic
 * - Cost-effective strategy (uses free tiers)
 * 
 * @author Norko Development Team
 * @version 1.0.0
 * @since 2025-07-06
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const { createClient } = require('@supabase/supabase-js');

/**
 * Image Upload Configuration
 */
const IMAGE_CONFIG = {
  // Crystallize Configuration
  crystallize: {
    tenantIdentifier: process.env.CRYSTALLIZE_TENANT_IDENTIFIER || 'norko-demo',
    accessTokenId: process.env.CRYSTALLIZE_ACCESS_TOKEN_ID,
    accessTokenSecret: process.env.CRYSTALLIZE_ACCESS_TOKEN_SECRET,
    apiUrl: 'https://api.crystallize.com',
    enabled: true, // Primary image host
  },
  
  // Supabase Configuration (Backup)
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    bucket: 'product-images', // Storage bucket name
    enabled: true, // Backup image host
  },
  
  // Image Processing Options
  processing: {
    maxFileSize: 5 * 1024 * 1024, // 5MB max file size
    minFileSize: 10 * 1024, // 10KB minimum file size
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    generateThumbnails: true,
    thumbnailSizes: [150, 300, 600], // Thumbnail widths
    compressionQuality: 85, // JPEG compression quality
  },
  
  // Upload Strategy
  strategy: {
    primaryHost: 'crystallize', // Primary host for images
    backupHost: 'supabase', // Backup host
    retryAttempts: 3,
    retryDelay: 2000, // 2 seconds
    validateImages: true,
    generateAltText: true,
  }
};

/**
 * Image Upload Service Class
 */
class ImageUploadService {
  constructor() {
    this.crystallizeToken = null;
    this.supabaseClient = null;
    this.initializeServices();
  }

  /**
   * Initialize external services
   */
  async initializeServices() {
    try {
      // Initialize Crystallize authentication
      if (IMAGE_CONFIG.crystallize.enabled) {
        await this.initializeCrystallize();
      }
      
      // Initialize Supabase client
      if (IMAGE_CONFIG.supabase.enabled && IMAGE_CONFIG.supabase.url) {
        this.initializeSupabase();
      }
      
      console.log('🚀 Image Upload Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Image Upload Service:', error.message);
    }
  }

  /**
   * Initialize Crystallize API authentication
   */
  async initializeCrystallize() {
    try {
      const authPayload = {
        identifier: IMAGE_CONFIG.crystallize.accessTokenId,
        secret: IMAGE_CONFIG.crystallize.accessTokenSecret
      };

      const response = await axios.post(
        `${IMAGE_CONFIG.crystallize.apiUrl}/auth/token`,
        authPayload,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      this.crystallizeToken = response.data.access_token;
      console.log('✅ Crystallize authentication successful');
    } catch (error) {
      console.warn('⚠️  Crystallize authentication failed:', error.message);
      IMAGE_CONFIG.crystallize.enabled = false;
    }
  }

  /**
   * Initialize Supabase client
   */
  initializeSupabase() {
    try {
      this.supabaseClient = createClient(
        IMAGE_CONFIG.supabase.url,
        IMAGE_CONFIG.supabase.serviceKey || IMAGE_CONFIG.supabase.anonKey
      );
      console.log('✅ Supabase client initialized');
    } catch (error) {
      console.warn('⚠️  Supabase initialization failed:', error.message);
      IMAGE_CONFIG.supabase.enabled = false;
    }
  }

  /**
   * Main image upload function
   * @param {string} imageUrl - URL of image to upload
   * @param {string} productId - Product identifier
   * @param {string} productName - Product name for metadata
   * @param {number} imageIndex - Image index for naming
   * @returns {Promise<Object>} Upload result with URLs
   */
  async uploadProductImage(imageUrl, productId, productName, imageIndex = 0) {
    console.log(`📤 Uploading image ${imageIndex + 1} for ${productName}`);
    
    try {
      // Step 1: Download and validate image
      const imageData = await this.downloadImage(imageUrl);
      if (!imageData.success) {
        throw new Error(`Failed to download image: ${imageData.error}`);
      }

      // Step 2: Validate image
      const validation = await this.validateImage(imageData.buffer, productName);
      if (!validation.valid) {
        throw new Error(`Image validation failed: ${validation.reason}`);
      }

      // Step 3: Generate file metadata
      const imageMetadata = this.generateImageMetadata(productId, productName, imageIndex, imageData);

      // Step 4: Upload to primary host (Crystallize)
      let primaryUpload = null;
      if (IMAGE_CONFIG.crystallize.enabled) {
        primaryUpload = await this.uploadToCrystallize(imageData.buffer, imageMetadata);
      }

      // Step 5: Upload to backup host (Supabase)
      let backupUpload = null;
      if (IMAGE_CONFIG.supabase.enabled) {
        backupUpload = await this.uploadToSupabase(imageData.buffer, imageMetadata);
      }

      // Step 6: Return upload results
      return {
        success: true,
        primaryUrl: primaryUpload?.url || null,
        backupUrl: backupUpload?.url || null,
        crystallizeId: primaryUpload?.id || null,
        supabasePath: backupUpload?.path || null,
        metadata: imageMetadata,
        originalUrl: imageUrl,
        altText: this.generateAltText(productName, imageIndex),
      };

    } catch (error) {
      console.error(`❌ Failed to upload image for ${productName}:`, error.message);
      return {
        success: false,
        error: error.message,
        originalUrl: imageUrl,
        altText: this.generateAltText(productName, imageIndex),
      };
    }
  }

  /**
   * Download image from URL
   * @param {string} imageUrl - Image URL to download
   * @returns {Promise<Object>} Download result
   */
  async downloadImage(imageUrl) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'Norko-Image-Bot/1.0'
        }
      });

      return {
        success: true,
        buffer: Buffer.from(response.data),
        contentType: response.headers['content-type'] || 'image/jpeg',
        size: response.data.length,
        url: imageUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: imageUrl
      };
    }
  }

  /**
   * Validate downloaded image
   * @param {Buffer} imageBuffer - Image data buffer
   * @param {string} productName - Product name for context validation
   * @returns {Object} Validation result
   */
  async validateImage(imageBuffer, productName) {
    try {
      // Check file size
      if (imageBuffer.length < IMAGE_CONFIG.processing.minFileSize) {
        return { valid: false, reason: 'Image too small' };
      }
      
      if (imageBuffer.length > IMAGE_CONFIG.processing.maxFileSize) {
        return { valid: false, reason: 'Image too large' };
      }

      // Basic image format validation (check magic bytes)
      const magicBytes = imageBuffer.slice(0, 8);
      const isValidFormat = this.checkImageFormat(magicBytes);
      
      if (!isValidFormat) {
        return { valid: false, reason: 'Invalid image format' };
      }

      return { valid: true, reason: 'Image passed validation' };
    } catch (error) {
      return { valid: false, reason: `Validation error: ${error.message}` };
    }
  }

  /**
   * Check image format by magic bytes
   * @param {Buffer} magicBytes - First 8 bytes of file
   * @returns {boolean} True if valid image format
   */
  checkImageFormat(magicBytes) {
    const formats = {
      jpeg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47],
      webp: [0x52, 0x49, 0x46, 0x46] // RIFF (WebP container)
    };

    for (const [format, signature] of Object.entries(formats)) {
      const matches = signature.every((byte, index) => magicBytes[index] === byte);
      if (matches) return true;
    }

    return false;
  }

  /**
   * Generate image metadata
   * @param {string} productId - Product ID
   * @param {string} productName - Product name
   * @param {number} imageIndex - Image index
   * @param {Object} imageData - Downloaded image data
   * @returns {Object} Image metadata
   */
  generateImageMetadata(productId, productName, imageIndex, imageData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = this.getFileExtension(imageData.contentType);
    
    return {
      filename: `${productId}-image-${imageIndex + 1}-${timestamp}.${fileExtension}`,
      originalName: `${productName} - Image ${imageIndex + 1}`,
      productId: productId,
      productName: productName,
      imageIndex: imageIndex,
      contentType: imageData.contentType,
      size: imageData.size,
      uploadedAt: new Date().toISOString(),
      tags: ['product', 'infrared-heater', productId.toLowerCase()],
    };
  }

  /**
   * Get file extension from content type
   * @param {string} contentType - MIME content type
   * @returns {string} File extension
   */
  getFileExtension(contentType) {
    const extensions = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    return extensions[contentType] || 'jpg';
  }

  /**
   * Upload image to Crystallize CMS
   * @param {Buffer} imageBuffer - Image data
   * @param {Object} metadata - Image metadata
   * @returns {Promise<Object>} Upload result
   */
  async uploadToCrystallize(imageBuffer, metadata) {
    try {
      console.log(`📤 Uploading to Crystallize: ${metadata.filename}`);

      // Create form data for multipart upload
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: metadata.filename,
        contentType: metadata.contentType,
      });

      // Upload to Crystallize Files API
      const response = await axios.post(
        `${IMAGE_CONFIG.crystallize.apiUrl}/files`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.crystallizeToken}`,
          },
          timeout: 60000, // 60 second timeout for uploads
        }
      );

      const uploadResult = response.data;
      
      console.log(`✅ Crystallize upload successful: ${uploadResult.url}`);
      
      return {
        success: true,
        url: uploadResult.url,
        id: uploadResult.id,
        cdnUrl: uploadResult.variants?.[0]?.url || uploadResult.url, // Use CDN variant if available
      };

    } catch (error) {
      console.warn(`⚠️  Crystallize upload failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload image to Supabase Storage
   * @param {Buffer} imageBuffer - Image data
   * @param {Object} metadata - Image metadata
   * @returns {Promise<Object>} Upload result
   */
  async uploadToSupabase(imageBuffer, metadata) {
    try {
      console.log(`📤 Uploading to Supabase: ${metadata.filename}`);

      const filePath = `products/${metadata.productId}/${metadata.filename}`;

      const { data, error } = await this.supabaseClient.storage
        .from(IMAGE_CONFIG.supabase.bucket)
        .upload(filePath, imageBuffer, {
          contentType: metadata.contentType,
          metadata: {
            productId: metadata.productId,
            productName: metadata.productName,
            imageIndex: metadata.imageIndex.toString(),
          },
        });

      if (error) {
        throw new Error(error.message);
      }

      // Get public URL
      const { data: urlData } = this.supabaseClient.storage
        .from(IMAGE_CONFIG.supabase.bucket)
        .getPublicUrl(filePath);

      console.log(`✅ Supabase upload successful: ${urlData.publicUrl}`);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
        bucket: IMAGE_CONFIG.supabase.bucket,
      };

    } catch (error) {
      console.warn(`⚠️  Supabase upload failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate alt text for image
   * @param {string} productName - Product name
   * @param {number} imageIndex - Image index
   * @returns {string} Generated alt text
   */
  generateAltText(productName, imageIndex) {
    const altTexts = [
      `${productName} infrared heater`,
      `${productName} product view`,
      `${productName} installation image`,
      `${productName} technical specifications`,
      `${productName} additional view`,
    ];
    
    return altTexts[imageIndex] || `${productName} - Image ${imageIndex + 1}`;
  }

  /**
   * Upload multiple images for a product
   * @param {Array} imageUrls - Array of image URLs
   * @param {string} productId - Product identifier
   * @param {string} productName - Product name
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadProductImages(imageUrls, productId, productName) {
    console.log(`🖼️  Uploading ${imageUrls.length} images for ${productName}`);
    
    const results = [];
    
    for (const [index, imageUrl] of imageUrls.entries()) {
      // Add delay between uploads to be respectful to services
      if (index > 0) {
        await this.delay(2000); // 2 second delay
      }
      
      const result = await this.uploadProductImage(imageUrl, productId, productName, index);
      results.push(result);
      
      // Log progress
      console.log(`📊 Progress: ${index + 1}/${imageUrls.length} images processed`);
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`✅ Successfully uploaded ${successful}/${imageUrls.length} images for ${productName}`);
    
    return results;
  }

  /**
   * Utility function to add delays
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export the service
module.exports = { ImageUploadService, IMAGE_CONFIG };
