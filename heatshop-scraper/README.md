# 🕷️ Enhanced HeatShop Scraper with Cloud Image Integration

A production-ready web scraper that extracts infrared heater product data and uploads images to **Crystallize CMS** and **Supabase Storage** for cost-effective, scalable image hosting.

## 🎯 **Features**

### **Core Scraping**
- ✅ Respectful web scraping with rate limiting
- ✅ Comprehensive product data extraction
- ✅ TypeScript-like data validation
- ✅ Error handling and retry logic
- ✅ Crystallize-formatted output

### **Enhanced Image Processing**
- 🖼️ **Crystallize CMS Integration** (Primary host with built-in CDN)
- 💾 **Supabase Storage Backup** (1GB free tier)
- 🎯 **Smart Image Filtering** (excludes logos, banners, icons)
- ⚡ **CDN Optimization** (automatic via Crystallize)
- 💰 **Cost-Effective Strategy** ($0 for typical usage)

### **Production Ready**
- 🔒 Environment variable configuration
- 📊 Comprehensive statistics tracking
- 🧪 Test mode for development
- 📝 Detailed logging and error reporting
- 🔄 Automatic retry and fallback handling

## 🚀 **Quick Start**

### **1. Installation**
```bash
npm install
```

### **2. Environment Setup**
```bash
# Copy environment template
npm run setup

# Edit .env with your credentials
code .env
```

### **3. Configure Credentials**
Add to `.env`:
```env
# Crystallize CMS (Required for image upload)
CRYSTALLIZE_TENANT_IDENTIFIER=your-tenant-name
CRYSTALLIZE_ACCESS_TOKEN_ID=your-access-token-id
CRYSTALLIZE_ACCESS_TOKEN_SECRET=your-access-token-secret

# Supabase Storage (Optional backup)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

### **4. Test Setup**
```bash
# Test image upload service
npm run test-images

# Test enhanced scraper (limited products)
npm run scrape-enhanced
```

## 📁 **Files Overview**

```
heatshop-scraper/
├── 📄 enhanced-scraper.js          # Main enhanced scraper with image upload
├── 📄 image-upload-service.js      # Crystallize & Supabase image service
├── 📄 test-image-upload.js         # Test script for image uploads
├── 📄 scrape-heatshop.js          # Original scraper (legacy)
├── 📄 IMAGE-SETUP-GUIDE.md        # Detailed setup instructions
├── 📄 .env.example                # Environment template
├── 📄 package.json                # Dependencies and scripts
└── 📁 images/                     # Local backup directory (optional)
```

## 🔧 **Available Scripts**

| Script | Command | Description |
|--------|---------|-------------|
| **Enhanced Scraper** | `npm run scrape-enhanced` | Run scraper with cloud image upload |
| **Test Images** | `npm run test-images` | Test image upload functionality |
| **Setup Environment** | `npm run setup` | Copy .env template |
| **Legacy Scraper** | `npm run scrape` | Original scraper (local images only) |

## 🖼️ **Image Strategy**

### **Primary: Crystallize CMS**
- ✅ **Included in CMS plan** (no additional cost)
- ✅ **Built-in global CDN** with optimization
- ✅ **Unlimited bandwidth** 
- ✅ **Automatic image variants** (thumbnails, etc.)
- ✅ **Direct integration** with Crystallize products

### **Backup: Supabase Storage**
- ✅ **1GB free tier** (sufficient for demo)
- ✅ **2GB monthly bandwidth** free
- ✅ **Public CDN URLs** available
- ✅ **Automatic backup** if Crystallize fails
- ✅ **Easy scaling** ($20/month for 100GB)

### **Cost Analysis**
- **Development/Demo**: **$0/month** (uses free tiers)
- **Small Production**: **$0-20/month** (depending on scale)
- **Enterprise**: **Custom pricing** (contact providers)

## 📊 **Output Format**

The enhanced scraper generates a comprehensive JSON file with:

```json
{
  "metadata": {
    "scraper": "Enhanced HeatShop Scraper v3.0",
    "scrapedAt": "2025-07-06T16:30:00.000Z",
    "totalProducts": 10,
    "imageStrategy": "Crystallize CMS + Supabase Storage",
    "statistics": {
      "imagesUploaded": 45,
      "crystallizeUploads": 43,
      "supabaseUploads": 45,
      "uploadSuccessRate": "95.6%"
    }
  },
  "products": [
    {
      "id": "infrared-panel-heater-600w",
      "name": "Infrared Panel Heater 600W",
      "price": "£299.99",
      "images": [
        {
          "url": "https://media.crystallize.com/norko/product-image-1.jpg",
          "crystallizeUrl": "https://media.crystallize.com/norko/...",
          "supabaseUrl": "https://supabase.co/storage/v1/object/...",
          "altText": "Infrared Panel Heater 600W",
          "isCloudHosted": true,
          "uploadedAt": "2025-07-06T16:30:15.000Z"
        }
      ],
      "crystallize": {
        "shape": "product",
        "components": {
          "images": {
            "type": "images",
            "content": [...]
          }
        }
      }
    }
  ]
}
```

## 🧪 **Testing**

### **Test 1: Image Upload Service**
```bash
npm run test-images
```
**Validates:**
- Crystallize API authentication
- Supabase storage connection
- Image download and upload
- Error handling

### **Test 2: Enhanced Scraper (Limited)**
```bash
npm run scrape-enhanced
```
**Validates:**
- Web scraping functionality
- Image extraction and filtering
- Cloud upload integration
- Output generation

### **Test 3: Production Run**
Edit `enhanced-scraper.js`:
```javascript
const ENHANCED_CONFIG = {
  testMode: false,        // Enable full scraping
  maxProducts: 100,       // Increase product limit
  // ...
};
```

## 🔧 **Configuration**

### **Image Processing Options**
```javascript
const IMAGE_CONFIG = {
  processing: {
    maxFileSize: 5 * 1024 * 1024,     // 5MB max
    minFileSize: 10 * 1024,           // 10KB min
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    compressionQuality: 85,
  },
  
  strategy: {
    primaryHost: 'crystallize',        // Primary: Crystallize CMS
    backupHost: 'supabase',           // Backup: Supabase Storage
    retryAttempts: 3,
    validateImages: true,
  }
}
```

### **Scraper Behavior**
```javascript
const ENHANCED_CONFIG = {
  enableImageUpload: true,             // Enable cloud upload
  maxImagesPerProduct: 5,              // Limit per product
  testMode: true,                      // Start with test mode
  delay: 2000,                         // 2s between requests
}
```

## 🚨 **Troubleshooting**

### **Common Issues**

**❌ Crystallize Authentication Failed**
```
Solution: Check tenant ID, access token ID/secret in .env
```

**❌ Supabase Upload Failed**
```
Solution: Verify Supabase URL format and storage bucket exists
```

**❌ No Images Found**
```
Solution: Check image validation filters, try different products
```

**❌ Images Too Small/Large**
```
Solution: Adjust minImageSize/maxImageSize in configuration
```

### **Debug Mode**
Add to `.env`:
```env
DEBUG=true
NODE_ENV=development
```

## 📝 **Next Steps**

1. **✅ Setup Environment** (Configure .env)
2. **✅ Test Image Service** (`npm run test-images`)
3. **🔄 Run Enhanced Scraper** (`npm run scrape-enhanced`)
4. **📝 Integrate with Railway API** (Use CDN URLs)
5. **📝 Update Frontend** (Display cloud-hosted images)
6. **📝 Deploy to Production** (Scale as needed)

## 🔗 **Related Documentation**

- [`IMAGE-SETUP-GUIDE.md`](./IMAGE-SETUP-GUIDE.md) - Detailed setup instructions
- [`IMAGE-COST-ANALYSIS.md`](../IMAGE-COST-ANALYSIS.md) - Cost comparison and analysis
- [Crystallize API Docs](https://crystallize.com/learn/developer-guides/api-overview)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Test your changes with `npm run test-images`
4. Submit a pull request

---

**💡 Built for the Norko E-Commerce Platform** - A modern, cost-effective solution for infrared heater product management with scalable image hosting.
