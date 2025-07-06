# Image Upload Setup Guide

## 🖼️ **Crystallize & Supabase Image Integration**

This guide walks through setting up the cost-effective image hosting strategy using Crystallize CMS (primary) and Supabase Storage (backup).

## 🎯 **Strategy Overview**

```
Web Scraping → Image Processing → Crystallize Upload → Supabase Backup → Frontend Display
     ↓              ↓                    ↓              ↓              ↓
  Raw URLs     Validation/Filter    CMS Storage     Free Storage    CDN URLs
   Extract      Quality Check       + Built-in CDN   (1GB Free)     Optimized
```

## ⚙️ **Setup Steps**

### **1. Crystallize CMS Configuration**

1. **Get Your Crystallize Credentials:**
   - Login to your Crystallize tenant
   - Go to Settings → API Tokens
   - Create a new API token with file upload permissions
   - Note down your tenant identifier, access token ID, and secret

2. **Configure File Upload Permissions:**
   - Ensure your API token has `file:create` and `file:read` permissions
   - Test the connection using the Crystallize API explorer

### **2. Supabase Storage Configuration (Optional Backup)**

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project (free tier includes 1GB storage)
   - Note your project URL and API keys

2. **Create Storage Bucket:**
   ```sql
   -- Run in Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('product-images', 'product-images', true);
   ```

3. **Set Storage Policies (Optional - for public access):**
   ```sql
   -- Allow public read access
   CREATE POLICY "Public read access" ON storage.objects
   FOR SELECT USING (bucket_id = 'product-images');
   
   -- Allow authenticated uploads (if using service key)
   CREATE POLICY "Authenticated upload access" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'product-images');
   ```

### **3. Environment Configuration**

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your credentials in `.env`:**
   ```env
   # Crystallize CMS Configuration (Required)
   CRYSTALLIZE_TENANT_IDENTIFIER=your-tenant-name
   CRYSTALLIZE_ACCESS_TOKEN_ID=your-access-token-id
   CRYSTALLIZE_ACCESS_TOKEN_SECRET=your-access-token-secret

   # Supabase Configuration (Optional Backup)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-role-key
   ```

## 🧪 **Testing the Setup**

### **Test 1: Image Upload Service**
```bash
node test-image-upload.js
```

**Expected Output:**
- ✅ Crystallize authentication successful
- ✅ Supabase client initialized
- ✅ Image uploads working
- 📊 Success rate statistics

### **Test 2: Enhanced Scraper**
```bash
node enhanced-scraper.js
```

**Expected Output:**
- 🕷️ Scraping products with image upload
- ☁️ Images uploaded to Crystallize and Supabase
- 💾 Output saved with CDN URLs

## 📊 **Cost Analysis**

### **Crystallize CMS (Primary)**
- **Storage**: Included in CMS plan
- **CDN**: Built-in global CDN included
- **Cost**: $0 additional (uses existing plan)
- **Bandwidth**: Unlimited with CDN optimization

### **Supabase Storage (Backup)**
- **Storage**: 1GB free tier
- **Bandwidth**: 2GB free tier monthly
- **Cost**: $0 for typical demo usage
- **Upgrade**: $20/month for 100GB if needed

### **Total Monthly Cost: $0** 
*(for typical demo/development usage)*

## 🔧 **Troubleshooting**

### **Issue: Crystallize Authentication Failed**
```
⚠️ Crystallize authentication failed: Request failed with status code 404
```

**Solutions:**
1. Check your tenant identifier is correct
2. Verify API token has file upload permissions
3. Ensure access token ID and secret are valid
4. Test with Crystallize API explorer first

### **Issue: Supabase Upload Failed**
```
⚠️ Supabase upload failed: Invalid JWT
```

**Solutions:**
1. Check your Supabase URL format (should include https://)
2. Verify you're using the service role key for uploads
3. Ensure the storage bucket exists
4. Check storage policies allow uploads

### **Issue: Image Validation Failed**
```
⚠️ Image validation failed: Image too small
```

**Solutions:**
1. Adjust `minImageSize` in configuration
2. Check image URLs are accessible
3. Verify image format is supported (JPG, PNG, WebP)

## 📝 **Configuration Options**

### **Image Processing Settings**
```javascript
const IMAGE_CONFIG = {
  processing: {
    maxFileSize: 5 * 1024 * 1024, // 5MB max
    minFileSize: 10 * 1024,       // 10KB min
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    compressionQuality: 85,        // JPEG quality
  },
  
  strategy: {
    primaryHost: 'crystallize',    // Primary image host
    backupHost: 'supabase',        // Backup host
    retryAttempts: 3,              // Upload retry count
    validateImages: true,          // Enable validation
  }
}
```

### **Scraper Settings**
```javascript
const ENHANCED_CONFIG = {
  enableImageUpload: true,         // Enable cloud upload
  maxImagesPerProduct: 5,          // Limit per product
  imageQualityThreshold: 50000,    // Min size for quality
  testMode: true,                  // Start with test mode
}
```

## 🚀 **Production Deployment**

### **1. Update Railway API**
- Remove static image serving (no longer needed)
- Update product queries to use Crystallize CDN URLs
- Add image metadata to GraphQL schema

### **2. Update Frontend**
- Configure image components to use CDN URLs
- Add loading states and error handling for images
- Implement lazy loading for performance

### **3. Monitor Usage**
- Track Crystallize storage usage in dashboard
- Monitor Supabase storage/bandwidth in project settings
- Set up alerts for approaching limits

## 📋 **Next Steps**

1. **Configure Environment Variables** ✅
2. **Test Image Upload Service** ✅ 
3. **Run Enhanced Scraper** 🔄
4. **Integrate with Railway API** 📝
5. **Update Frontend Components** 📝
6. **Deploy to Production** 📝

## 🔗 **Useful Links**

- [Crystallize API Documentation](https://crystallize.com/learn/developer-guides/api-overview)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)

---

**💡 Pro Tip:** Start with test mode enabled and a few products to validate the setup before running full scraping operations.
