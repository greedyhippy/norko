# Norko Project - Architecture Decisions Record (ADR)

## 🏗️ **Architecture Decision Record**

### **ADR-001: Frontend Framework Selection**
- **Date**: 2025-07-04
- **Status**: Accepted
- **Decision**: Use Remix (React Router v7) for frontend
- **Rationale**: 
  - Superior SSR performance for e-commerce
  - Simpler data loading patterns than Next.js
  - Better TypeScript integration
  - Excellent developer experience
- **Consequences**: 
  - Learning curve for team members familiar with Next.js
  - Smaller ecosystem compared to Next.js
  - Better performance and maintainability

### **ADR-002: Headless CMS Selection**
- **Date**: 2025-07-04
- **Status**: Accepted
- **Decision**: Use Crystallize as headless CMS
- **Rationale**:
  - E-commerce specific features (PIM, cart, checkout)
  - GraphQL API for efficient data fetching
  - Built-in CDN and image optimization
  - Product variant management
- **Consequences**:
  - Vendor lock-in to Crystallize ecosystem
  - Learning curve for Crystallize-specific concepts
  - Powerful e-commerce capabilities out of the box

### **ADR-003: API Layer Architecture**
- **Date**: 2025-07-04
- **Status**: Accepted
- **Decision**: Custom GraphQL API on Railway + Crystallize API
- **Rationale**:
  - Custom business logic not available in Crystallize
  - User authentication and session management
  - Integration with third-party services
  - Flexibility for custom features
- **Consequences**:
  - Additional complexity with two API layers
  - More maintenance overhead
  - Greater flexibility and customization options

### **ADR-004: Hosting Strategy**
- **Date**: 2025-07-04
- **Status**: Accepted
- **Decision**: Railway for API hosting, TBD for frontend
- **Rationale**:
  - Railway simplifies deployment and scaling
  - Built-in database options
  - GitHub integration for CI/CD
  - Competitive pricing for small projects
- **Consequences**:
  - Vendor lock-in to Railway platform
  - Learning curve for Railway-specific features
  - Simplified deployment and operations

### **ADR-005: Data Sourcing Strategy**
- **Date**: 2025-07-06
- **Status**: Accepted  
- **Decision**: Web scraping + manual curation → Crystallize
- **Rationale**:
  - No direct API from product manufacturers
  - Need comprehensive product specifications
  - Manual quality control required
  - Crystallize provides structured storage
- **Consequences**:
  - Initial setup effort for scraping
  - Ongoing maintenance of scraper scripts
  - High-quality, comprehensive product data

### **ADR-006: Fallback Content Strategy**
- **Date**: 2025-07-04
- **Status**: Accepted
- **Decision**: Comprehensive fallback system for missing CMS content
- **Rationale**:
  - Development continuity when CMS is empty
  - Better user experience during content migration
  - Reduced dependency on external services
  - Demo-ready presentation at any time
- **Consequences**:
  - Additional code complexity
  - Maintenance of parallel content systems
  - Robust development and demo experience

### **ADR-007: TypeScript Adoption**
- **Date**: 2025-07-04
- **Status**: Accepted
- **Decision**: Full TypeScript implementation across all projects
- **Rationale**:
  - Better developer experience and IDE support
  - Catch errors at compile time
  - Improved code documentation through types
  - Better refactoring capabilities
- **Consequences**:
  - Initial setup overhead
  - Learning curve for team members
  - Significantly improved code quality and maintainability

## 🔄 **Decision Review Schedule**
- **Quarterly Review**: Re-evaluate major architectural decisions
- **Issue-Driven**: Review decisions when problems arise
- **Performance-Driven**: Review when performance metrics decline
- **Feature-Driven**: Review when adding major new features

## 📝 **Decision Template**
```markdown
### **ADR-XXX: [Decision Title]**
- **Date**: YYYY-MM-DD
- **Status**: [Proposed/Accepted/Deprecated/Superseded]
- **Decision**: [What was decided]
- **Rationale**: [Why this was decided]
- **Consequences**: [Positive and negative outcomes]
```
