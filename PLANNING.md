# Norko E-Commerce Platform - Project Planning

## 🚀 **Current Project Status** (Updated: 2025-07-06)

### **MVP Progress: 85% Complete** ✅

#### **WORKING SYSTEMS**
- ✅ **Web Scraper**: 36 infrared heater products extracted with full metadata
- ✅ **Railway GraphQL API**: Deployed and serving with authentication  
- ✅ **Crystallize Authentication**: Confirmed working (VAT operations successful)
- ✅ **Frontend Base**: Remix app with Railway integration and fallback mechanisms

#### **CURRENT BLOCKER**
- 🔧 **Crystallize Product Import**: SHAPE_NOT_FOUND error
- **Solution Ready**: Manual shape creation guide prepared (`CRYSTALLIZE-SHAPE-GUIDE.md`)
- **Time to Resolve**: 15-30 minutes of manual shape creation

#### **NEXT SESSION PRIORITY**
1. Create product shape in Crystallize PIM using prepared guide
2. Test and complete product import (36 products)
3. Validate end-to-end frontend integration
4. **MVP Complete**: Estimated 1-2 hours

## 🎯 **Project Goal**
Create a functional, top-tier e-commerce demo store for infrared heaters using modern web technologies and headless commerce architecture.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Remix Store   │────│   Railway API    │────│   Crystallize   │
│ TypeScript/React│    │   GraphQL API    │    │   Headless CMS  │
│ Frontend UI     │    │   Authentication │    │   Product Data  │
│ localhost:3018  │    │   Business Logic │    │   + Asset CDN   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Supabase      │
                                               │   Storage       │ 
                                               │   (Free Tier)   │
                                               │   Image Backup  │
                                               └─────────────────┘
```

## 🛠️ **Tech Stack**

### **Core Technologies**
- **Frontend**: Remix (React Router v7) + TypeScript
- **CMS**: Crystallize (Headless Commerce Platform)
- **API**: Custom GraphQL server hosted on Railway
- **Infrastructure**: Railway hosting platform

### **Development Tools**
- **Package Manager**: npm/yarn
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest/Vitest
- **Version Control**: Git + GitHub

### **Styling & UI**
- **Current**: Tailwind CSS
- **Future**: Enhanced with Astro or AI-generated designs (MidJourney)

## 📁 **Project Structure**

```
norko/
├── 📄 README.md                    # Project documentation
├── 📄 PLANNING.md                  # This file - architecture & goals
├── 📄 TASK.md                      # Task tracking and progress
├── 📄 claude.md                    # AI assistant directives
├── 📄 .gitignore                   # Git ignore rules
├── 📁 heatshop-scraper/            # Data scraping utilities
│   ├── scrape-heatshop.js          # Web scraper for product data
│   ├── crystallize-import.json     # Crystallize import configuration
│   └── package.json                # Scraper dependencies
├── 📁 norko-graphql-api/           # Railway-hosted GraphQL API
│   ├── server.js                   # Express + GraphQL server
│   ├── crystallize-products.json   # Cached product data
│   └── package.json                # API dependencies
└── 📁 norko-crystallize-frontend/  # Main Remix e-commerce app
    └── application/                # Remix application root
        ├── src/
        │   ├── routes/             # Page routes and loaders
        │   ├── ui/                 # React components
        │   └── use-cases/          # Business logic
        ├── package.json            # Frontend dependencies
        └── .env                    # Environment configuration
```

## 🎯 **Development Phases**

### **Phase 1: Foundation** ✅ *COMPLETED*
- [x] Remix frontend with fallback content system
- [x] Railway GraphQL API integration ready
- [x] Crystallize CMS connection configured
- [x] Modern responsive UI with product categories
- [x] TypeScript support and error handling
- [x] Environment configuration and security
- [x] GitHub repository setup

### **Phase 2: Data Integration** ✅ *COMPLETED*
- [x] Web scraping for infrared heater product data
- [x] Enhanced image capture and processing system
- [x] Railway API enhancement with scraped data
- [ ] Frontend integration with Railway data
- [ ] Crystallize content population (products, categories)
- [ ] Dynamic content loading and caching

### **Phase 3: Core E-Commerce Features** 🔄 *PLANNED*
- [ ] Product catalog and detail pages
- [ ] Shopping cart functionality
- [ ] User authentication system
- [ ] Checkout and order processing
- [ ] Search and filtering capabilities

### **Phase 4: Advanced Features** 🔮 *FUTURE*
- [ ] Product configurator for heater selection
- [ ] B2B features and bulk pricing
- [ ] Admin dashboard and content management
- [ ] Performance optimization and SEO

### **Phase 5: Premium UI/UX** 🎨 *FUTURE*
- [ ] Design system implementation
- [ ] AI-generated design assets (MidJourney)
- [ ] Astro integration for performance
- [ ] Mobile-first responsive design
- [ ] Accessibility compliance (WCAG 2.1)

## 📐 **Design Principles**

### **Code Quality**
- **Type Safety**: Full TypeScript coverage
- **Modularity**: Components under 500 lines
- **Testing**: Unit tests for all features
- **Documentation**: JSDoc for all functions

### **Performance**
- **Fast Loading**: Optimized assets and lazy loading
- **Caching**: Strategic data caching with Crystallize
- **SEO**: Server-side rendering with Remix

### **User Experience**
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliance
- **Progressive Enhancement**: Works without JavaScript

## 🔄 **Data Flow Strategy**

### **Content Sources**
1. **Scraped Data** → Initial product information from third-party sites
2. **Crystallize CMS** → Structured product data, categories, content
3. **Railway API** → Dynamic data, user sessions, custom business logic

### **Content Pipeline**
```
Web Scraping → Data Processing → Crystallize Import → Frontend Display
     ↓              ↓                 ↓              ↓
Raw Product    Structured JSON    CMS Storage    User Interface
   Data           Format           & GraphQL       Rendering
```

## 🚀 **Deployment Strategy**

### **Current Setup**
- **Frontend**: Local development (localhost:3018)
- **API**: Railway hosting (production-ready)
- **CMS**: Crystallize cloud (production-ready)

### **Production Deployment**
- **Frontend**: Railway static hosting or Vercel
- **API**: Railway (already configured)
- **CDN**: Crystallize asset delivery
- **Domain**: Custom domain configuration

## 🔒 **Security & Environment**

### **Environment Variables**
- `CRYSTALLIZE_TENANT_IDENTIFIER`
- `CRYSTALLIZE_ACCESS_TOKEN_ID` 
- `CRYSTALLIZE_ACCESS_TOKEN_SECRET`
- `RAILWAY_API_URL`
- `RAILWAY_API_KEY`
- `SUPABASE_URL` (optional - for image backup)
- `SUPABASE_ANON_KEY` (optional)
- `SUPABASE_SERVICE_KEY` (optional)

### **Security Measures**
- Environment variable isolation
- API rate limiting
- Input validation and sanitization
- HTTPS enforcement in production

## 📊 **Success Metrics**

### **Technical Goals**
- [ ] 100% TypeScript coverage
- [ ] <3s page load times
- [ ] 95%+ Lighthouse scores
- [ ] Zero runtime errors

### **Business Goals**
- [ ] Complete product catalog
- [ ] Functional checkout flow
- [ ] Professional design quality
- [ ] Demo-ready presentation

## 🤝 **Collaboration Workflow**

### **Git Strategy**
- `main` branch for production-ready code
- Feature branches for development
- Descriptive commit messages
- Code review process

### **Development Process**
1. Check `TASK.md` for current objectives
2. Create feature branch for new work
3. Implement with tests and documentation
4. Update `TASK.md` with progress
5. Commit and push to GitHub
6. Merge to main when complete

## 🖼️ **Image Strategy & Asset Management**

### **Image Capture & Processing Pipeline**
```
Web Scraping → Image Filtering → Crystallize Upload → Asset CDN → Frontend Display
     ↓              ↓                    ↓           ↓           ↓
  Raw URLs     Product Images       CMS Storage   Built-in CDN  User Interface
   Extract      Validation         + Supabase     Optimization   Rendering
                                   (Backup)
```

### **Image Processing Features**
- **Smart Filtering**: Automatically excludes logos, icons, banners, social media images
- **Quality Detection**: Prioritizes high-resolution product images (>200x200px)
- **Crystallize Primary**: Direct upload to Crystallize CMS with built-in CDN
- **Supabase Backup**: Optional backup storage for redundancy (1GB free)
- **Cost Optimization**: Zero additional costs using existing Crystallize plan
- **Performance**: Built-in CDN optimization via Crystallize's asset delivery

### **Image Validation Criteria**
- **Include**: URLs containing "product", "heater", "panel", "infrared", product name keywords
- **Exclude**: Logos, icons, banners, social media, payment badges, awards, delivery graphics
- **Format Support**: JPG, PNG, WebP with Crystallize's automatic optimization
- **Quality Filters**: Minimum dimensions (200x200px), reasonable file sizes

### **Deployment Strategy**
- **Development**: Crystallize development tenant with test images
- **Production**: Crystallize production CDN (included in CMS plan)
- **Backup**: Optional Supabase storage for image redundancy (1GB free tier)
- **Performance**: Native CDN optimization via Crystallize's global infrastructure
