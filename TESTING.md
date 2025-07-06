# Norko Project - Testing Strategy

## 🧪 **Testing Framework & Strategy**

### **Testing Stack**
- **Unit Tests**: Jest with TypeScript support
- **Integration Tests**: Jest + Supertest for API testing
- **E2E Tests**: Playwright for full user workflows
- **Component Tests**: React Testing Library
- **API Tests**: GraphQL testing utilities

### **Test Structure**
```
norko/
├── norko-crystallize-frontend/application/
│   ├── src/
│   │   ├── components/
│   │   └── routes/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── norko-graphql-api/
│   ├── src/
│   └── tests/
│       ├── unit/
│       └── integration/
└── heatshop-scraper/
    ├── src/
    └── tests/
        └── unit/
```

### **Testing Standards**

#### **Unit Test Requirements**
- **Coverage Target**: 80% minimum
- **Test Cases Per Function**:
  - ✅ Happy path (expected use case)
  - ✅ Edge case (boundary conditions)
  - ✅ Error case (failure scenarios)

#### **Test Naming Convention**
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should handle normal case correctly', () => {});
    it('should handle edge case when parameter is null', () => {});
    it('should throw error when invalid input provided', () => {});
  });
});
```

### **Component Testing Guidelines**

#### **React Component Tests**
```typescript
/**
 * Test: ProductCard Component
 * Purpose: Verify product display functionality
 * Coverage: Props handling, user interactions, error states
 */
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Heater',
    price: 299.99,
    image: 'test-image.jpg'
  };

  it('should display product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Heater')).toBeInTheDocument();
    expect(screen.getByText('$299.99')).toBeInTheDocument();
  });

  it('should handle missing product image gracefully', () => {
    const productWithoutImage = { ...mockProduct, image: null };
    render(<ProductCard product={productWithoutImage} />);
    expect(screen.getByAltText('Product placeholder')).toBeInTheDocument();
  });

  it('should call onAddToCart when button clicked', () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct.id);
  });
});
```

### **API Testing Guidelines**

#### **GraphQL API Tests**
```typescript
/**
 * Test: Product Query API
 * Purpose: Verify product data retrieval
 * Coverage: Success cases, error handling, data validation
 */
import request from 'supertest';
import app from '../server';

describe('Product API', () => {
  describe('GET /graphql', () => {
    it('should return product list when valid query provided', async () => {
      const query = `
        query {
          products {
            id
            name
            price
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.products[0]).toHaveProperty('id');
    });

    it('should return error for invalid query', async () => {
      const invalidQuery = `query { invalidField }`;

      const response = await request(app)
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });
});
```

### **E2E Testing Guidelines**

#### **User Journey Tests**
```typescript
/**
 * Test: Product Purchase Flow
 * Purpose: Verify complete e-commerce workflow
 * Coverage: Browse → Add to Cart → Checkout → Order Confirmation
 */
import { test, expect } from '@playwright/test';

test.describe('Product Purchase Flow', () => {
  test('should complete full purchase journey', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Norko');

    // Browse products
    await page.click('[data-testid="category-panel-heaters"]');
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();

    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');

    // Proceed to checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-button"]');

    // Fill checkout form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="name"]', 'Test User');
    await page.click('[data-testid="submit-order"]');

    // Verify order confirmation
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
  });
});
```

### **Test Data Management**

#### **Fixtures and Mocks**
```typescript
// tests/fixtures/products.ts
export const mockProducts = [
  {
    id: 'heater-001',
    name: 'Panel Heater Pro 2000W',
    category: 'panel-heaters',
    price: 299.99,
    specifications: {
      power: '2000W',
      dimensions: '100x60x8cm',
      coverage: '20m²'
    }
  }
];

// tests/mocks/crystallizeApi.ts
export const mockCrystallizeResponse = {
  data: {
    product: mockProducts[0]
  }
};
```

### **Performance Testing**

#### **Load Testing Criteria**
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 500ms
- **Lighthouse Performance Score**: > 90
- **Core Web Vitals**: Green ratings

#### **Performance Test Implementation**
```typescript
test('should load homepage within performance budget', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});
```

### **CI/CD Integration**

#### **GitHub Actions Workflow**
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```

### **Test Coverage Goals**

#### **Coverage Targets by Module**
- **Business Logic**: 90%+ coverage
- **UI Components**: 80%+ coverage  
- **API Endpoints**: 95%+ coverage
- **Utils/Helpers**: 100% coverage

#### **Quality Gates**
- ✅ All tests pass before merge
- ✅ Coverage thresholds met
- ✅ No TypeScript errors
- ✅ E2E tests pass on staging
