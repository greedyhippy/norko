# 🚀 Supabase GraphQL Setup Guide for Image Storage

## Quick Setup Instructions (GraphQL-First Approach)

### **Step 1: Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose your organization (or create one)
5. Fill in project details:
   - **Name**: `norko-heaters` or similar
   - **Database Password**: Generate a secure password
   - **Region**: Choose closest to your users
6. **Configuration Selection:**
   - ✅ **Data API + Connection String** (for GraphQL access)
   - ✅ **Use public schema for Data API** (enables GraphQL endpoint)
7. Click "Create new project"
8. Wait for project setup (takes ~2 minutes)

### **Step 2: Configure GraphQL API**
1. In your Supabase dashboard, go to **Settings → API**
2. Note the **GraphQL URL**: `https://your-project-ref.supabase.co/graphql/v1`
   - ⚠️ **Important**: No trailing `/` in the URL
3. Copy the following values:
   - **Project Reference (PROJECT_REF)**: Found in Settings → General → Reference ID
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **GraphQL Endpoint**: `https://your-project-ref.supabase.co/graphql/v1`
   - **Project API keys**:
     - `anon public` key (for frontend GraphQL queries)
     - `service_role` key (for backend mutations - keep secure!)

**GraphQL Authentication:**
Every request requires the `apiKey` header:
```bash
# cURL example
curl -X POST https://your-project-ref.supabase.co/graphql/v1 \
  -H 'apiKey: your-anon-or-service-key' \
  -H 'Content-Type: application/json' \
  --data-raw '{"query": "{ __schema { queryType { name } } }"}'
```

### **Step 3: Create Image Metadata Table (GraphQL Approach)**
1. In Supabase dashboard, go to **SQL Editor**
2. Create a table for image metadata:

```sql
-- Create images table for metadata storage
CREATE TABLE public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Product Information
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  image_index INTEGER NOT NULL DEFAULT 0,
  
  -- File Information
  filename TEXT NOT NULL,
  original_url TEXT,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  
  -- Image Metadata
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  tags TEXT[],
  
  -- Status
  upload_status TEXT DEFAULT 'uploaded' CHECK (upload_status IN ('uploading', 'uploaded', 'failed')),
  is_public BOOLEAN DEFAULT true,
  
  -- Indexes
  UNIQUE(product_id, image_index)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_created_at ON public.product_images(created_at);
```

### **Step 4: Create Storage Bucket**
1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Bucket details:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Enable (for CDN access)
   - **File size limit**: 50MB
   - **Allowed file types**: image/*
4. Click "Create bucket"

### **Step 5: Set Storage & GraphQL Policies**
1. Go to **Storage → Policies** and add storage policies:

**Storage Policy 1: Public Read Access**
```sql
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');
```

**Storage Policy 2: Service Role Upload Access**
```sql
CREATE POLICY "Service role upload access" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'service_role'
);
```

2. Go to **Authentication → Policies** and add table policies:

**Table Policy 1: Public Read Access** ✅ (Already exists - skip this one)
```sql
-- CREATE POLICY "Public read access" ON public.product_images
-- FOR SELECT USING (is_public = true);
-- ✅ This policy already exists, no need to create again
```

**Table Policy 2: Service Role Full Access** ✅ (Already created and working)
```sql
-- CREATE POLICY "Service role full access" ON public.product_images
-- FOR ALL USING (auth.role() = 'service_role');
-- ✅ This policy has been created and is working correctly
```

**Additional Policies for Complete Access** ✅ (Already created and working)
```sql
-- These policies are also in place and working:
-- CREATE POLICY "Authenticated users can insert" ON public.product_images FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "Anonymous users can insert" ON public.product_images FOR INSERT TO anon WITH CHECK (true);
-- ✅ All RLS policies are correctly configured and tested
```

### **Step 6: Test GraphQL Endpoint**
1. Go to **API Docs → GraphQL** → **GraphiQL** in Supabase Studio
2. The GraphiQL IDE is built directly into Supabase Studio for easy testing
3. Try this test query to verify the GraphQL API is working:

```graphql
# Basic introspection to test connection
query TestConnection {
  __schema {
    queryType {
      name
    }
    mutationType {
      name
    }
  }
}
```

4. After creating the table (Step 3), test table access:

```graphql
# Test table access (should return empty collection initially)
query TestTableAccess {
  product_imagesCollection(first: 1) {
    edges {
      node {
        id
        created_at
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "product_imagesCollection": {
      "edges": [],
      "pageInfo": {
        "hasNextPage": false,
        "hasPreviousPage": false
      }
    }
  }
}
```

### **Step 7: Update Environment Variables**
Replace the placeholder values in your `.env` file:

```env
# Supabase GraphQL Configuration
SUPABASE_URL=https://your-actual-project-ref.supabase.co
SUPABASE_GRAPHQL_URL=https://your-actual-project-ref.supabase.co/graphql/v1
SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_KEY=your-actual-service-role-key-here

# Note: Keep service_role key secure - never expose in frontend code!
# Use anon key for frontend GraphQL queries
# Use service_role key for backend operations and admin mutations
```

**Security Best Practices:**
- Store service_role key securely (environment variables, secrets manager)
- Never commit real keys to version control
- Use anon key for client-side operations only
- Implement Row Level Security policies for data protection

### **Step 8: Test the GraphQL Setup**
```bash
cd heatshop-scraper
node test-image-upload.js
```

**Expected Output:**
```
✅ Crystallize service enabled (test mode)
✅ Supabase GraphQL client initialized
📤 Test 1: Single Image Upload
📤 Uploading to Crystallize: test-heater-001-image-1-2025-07-06...
✅ Crystallize upload simulated: https://media.crystallize.com/norko/...
📤 Uploading to Supabase: test-heater-001-image-1-2025-07-06...
📊 Creating image metadata via GraphQL...
✅ Supabase upload successful: https://your-project.supabase.co/storage/v1/...
✅ Image metadata saved via GraphQL
```

### **GraphQL Integration Benefits**

1. **Automatic Schema Generation**: Supabase uses `pg_graphql` to automatically reflect your PostgreSQL schema as GraphQL types
2. **Type Safety**: Generated TypeScript types from schema introspection
3. **Efficient Queries**: Only fetch needed data with single round-trip resolution
4. **Built-in Pagination**: Relay-style cursor pagination with `first`, `last`, `before`, `after`
5. **Advanced Filtering**: Complex where clauses with `and`, `or`, `not` operators
6. **Real-time Subscriptions**: For image upload progress (future enhancement)
7. **Unified Data Layer**: Both file storage and metadata via GraphQL

### **Understanding the Generated GraphQL Schema**

When you create the `product_images` table, Supabase automatically generates:

**Types:**
- `product_images` - Main table type
- `product_imagesConnection` - Relay-style connection for pagination
- `product_imagesEdge` - Individual result wrapper with cursor
- `product_imagesFilter` - Input type for filtering
- `product_imagesOrderBy` - Input type for sorting
- `product_imagesInsertInput` - Input type for creating records
- `product_imagesUpdateInput` - Input type for updating records

**Query Fields:**
- `product_imagesCollection` - Paginated collection query
- `node(nodeId: ID!)` - Retrieve by global node ID

**Mutation Fields:**
- `insertIntoproduct_imagesCollection` - Create new records
- `updateproduct_imagesCollection` - Update existing records  
- `deleteFromproduct_imagesCollection` - Delete records

**Explore the Schema:**
Use the GraphiQL schema explorer in Supabase Studio to browse all available types and operations. The documentation panel shows field descriptions and type information.

### **Sample GraphQL Operations**

**GraphQL API Features:**
- Automatically reflects database schema using `pg_graphql`
- Supports CRUD operations (Create/Read/Update/Delete)
- Arbitrarily deep relationships among tables
- Postgres' security model including Row Level Security
- Single round-trip query resolution for fast response times

**Query Images for a Product with Pagination:**
```graphql
query GetProductImages($productId: String!, $first: Int = 10, $after: String) {
  product_imagesCollection(
    filter: { product_id: { eq: $productId } }
    orderBy: [{ image_index: AscNullsLast }]
    first: $first
    after: $after
  ) {
    edges {
      cursor
      node {
        id
        filename
        storage_path
        alt_text
        file_size
        content_type
        width
        height
        image_index
        created_at
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

**Create Image Metadata (Mutation):**
```graphql
mutation CreateImageMetadata($input: product_imagesInsertInput!) {
  insertIntoproduct_imagesCollection(objects: [$input]) {
    records {
      id
      product_id
      filename
      storage_path
      image_index
      created_at
    }
    affectedCount
  }
}
```

**Update Image Metadata:**
```graphql
mutation UpdateImageMetadata($id: UUID!, $updates: product_imagesUpdateInput!) {
  updateproduct_imagesCollection(
    filter: { id: { eq: $id } }
    set: $updates
    atMost: 1
  ) {
    records {
      id
      alt_text
      width
      height
      updated_at
    }
    affectedCount
  }
}
```

**Delete Image Metadata:**
```graphql
mutation DeleteImageMetadata($id: UUID!) {
  deleteFromproduct_imagesCollection(
    filter: { id: { eq: $id } }
    atMost: 1
  ) {
    records {
      id
      filename
    }
    affectedCount
  }
}
```

**Advanced Filtering Example:**
```graphql
query SearchImages($searchTerm: String!, $minWidth: Int) {
  product_imagesCollection(
    filter: {
      and: [
        { 
          or: [
            { product_name: { ilike: $searchTerm } }
            { alt_text: { ilike: $searchTerm } }
            { tags: { contains: $searchTerm } }
          ]
        }
        { width: { gte: $minWidth } }
        { upload_status: { eq: "uploaded" } }
      ]
    }
    orderBy: [{ created_at: DescNullsLast }]
  ) {
    edges {
      node {
        id
        product_name
        filename
        width
        height
        alt_text
        tags
      }
    }
  }
}
```

### **Local Development Setup (Optional)**

For local development, you can use the Supabase CLI to run a local instance:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize local project
supabase init

# Start local development stack
supabase start
```

This provides:
- Local PostgreSQL database with GraphQL endpoint
- Local Supabase Studio interface
- File storage emulation
- Same GraphQL API at `http://localhost:54321/graphql/v1`

**Local Development Output:**
```
Started supabase local development setup.

    GraphQL URL: http://localhost:54321/graphql/v1  <- GraphQL endpoint
         DB URL: postgresql://postgres:postgres@localhost:54322/postgres
   Studio URL: http://localhost:54323             <- Supabase Studio
     JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
       anon key: eyJhbGciOiJIUzI1...
service_role key: eyJhbGciOiJIUzI1...
```

**Benefits of Local Development:**
- No network latency for testing
- Unlimited requests during development
- Same exact environment as production
- Easy database reset and migration testing

### **Troubleshooting**

**❌ Issue: "Invalid JWT" or "Authentication failed"**
```
Solution: 
1. Check you're using the correct API key (service_role for mutations)
2. Verify the key is properly set in environment variables
3. Ensure no extra spaces or newlines in the API key
```

**❌ Issue: "GraphQL endpoint not found" or 404 error**
```
Solution:
1. Verify the GraphQL URL has no trailing slash
2. Check your PROJECT_REF is correct in the URL
3. Ensure pg_graphql extension is enabled (should be by default)
```

**❌ Issue: "Bucket not found" in storage operations**
```
Solution: 
1. Create the 'product-images' bucket in Supabase Storage
2. Make sure bucket name matches exactly in your code
3. Verify bucket is set to public if accessing images directly
```

**❌ Issue: "RLS policy violation" when querying/mutating**
```
Solution: 
1. Add the storage and table policies shown above
2. For development, you can temporarily disable RLS:
   ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;
3. Make sure you're using service_role key for admin operations
```

**❌ Issue: "File too large" during upload**
```
Solution: 
1. Check bucket file size limits in Supabase Storage settings
2. Implement image compression before upload
3. Verify content-type is set correctly for images
```

**❌ Issue: "Table not found in GraphQL schema"**
```
Solution:
1. Ensure table has a primary key (required for GraphQL exposure)
2. Check table is in public schema or add schema to search_path
3. Verify proper permissions are granted to anon/authenticated roles
```

**❌ Issue: "GraphQL query syntax errors"**
```
Solution:
1. Use GraphiQL in Supabase Studio to test queries
2. Check field names match your table schema exactly
3. Ensure filter syntax follows Supabase GraphQL conventions
```

### **Verification Steps**

1. **Test Supabase Connection:**
   ```bash
   node -e "
   require('dotenv').config();
   const { createClient } = require('@supabase/supabase-js');
   const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
   console.log('Supabase client created successfully!');
   "
   ```

2. **Test GraphQL Endpoint Directly:**
   ```bash
   curl -X POST https://your-project-ref.supabase.co/graphql/v1 \
     -H "apiKey: your-service-role-key" \
     -H "Content-Type: application/json" \
     -d '{"query": "{ __schema { queryType { name } } }"}'
   ```

3. **Verify Table Schema in GraphQL:**
   ```bash
   # Test table introspection
   curl -X POST https://your-project-ref.supabase.co/graphql/v1 \
     -H "apiKey: your-service-role-key" \
     -H "Content-Type: application/json" \
     -d '{"query": "{ __type(name: \"product_images\") { fields { name type { name } } } }"}'
   ```

4. **Check Storage Bucket:**
   - Go to Supabase Storage
   - Verify `product-images` bucket exists
   - Check bucket is public

5. **Test Complete Image Upload Pipeline:**
   ```bash
   npm run test-images
   ```

6. **Verify GraphQL Operations in Supabase Studio:**
   - Go to API Docs → GraphQL → GraphiQL
   - Run the test queries from the samples above
   - Check that both queries and mutations work correctly

### **Free Tier Limits**
- **Storage**: 1GB free
- **Bandwidth**: 2GB/month free
- **API Requests**: 50,000/month free

**Perfect for development and small demos!**

### **Production Considerations**
- Monitor usage in Supabase dashboard
- Set up alerts for approaching limits
- Consider upgrading to Pro plan ($20/month) if needed

---

## 🚀 Quick Reference Card

### **Essential URLs**
- **GraphQL Endpoint**: `https://your-project-ref.supabase.co/graphql/v1`
- **Studio**: `https://app.supabase.com/project/your-project-ref`
- **Storage**: `https://your-project-ref.supabase.co/storage/v1/object/public/product-images/`

### **Common GraphQL Operations**

**Query all images:**
```graphql
{ product_imagesCollection { edges { node { id filename storage_path } } } }
```

**Create image metadata:**
```graphql
mutation { insertIntoproduct_imagesCollection(objects: [{
  product_id: "heater-001"
  filename: "image1.jpg"
  storage_path: "heater-001/image1.jpg"
}]) { records { id } } }
```

**Filter by product:**
```graphql
{ product_imagesCollection(filter: { product_id: { eq: "heater-001" } }) 
  { edges { node { filename alt_text } } } }
```

### **Key Environment Variables**
```env
SUPABASE_GRAPHQL_URL=https://your-project-ref.supabase.co/graphql/v1
SUPABASE_SERVICE_KEY=your-service-role-key
```

### **Authentication Headers**
```bash
apiKey: your-service-role-key  # For mutations
apiKey: your-anon-key         # For queries
```

---

**📝 Once you have your Supabase credentials, update the `.env` file and run the test!**
