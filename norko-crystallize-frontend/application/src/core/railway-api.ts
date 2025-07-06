/**
 * Railway GraphQL API Integration for Norko Frontend
 * Fetches enhanced product data from our Railway deployment
 */

export interface RailwayProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  specifications: {
    wattage: number;
    dimensions: string;
    weight: number;
    coverage: string;
    mounting: string;
    efficiency: string;
  };
  images: Array<{
    url: string;
    altText: string;
  }>;
  sourceUrl?: string;
  warranty: string;
}

/**
 * Fetch products from Railway GraphQL API
 */
export async function fetchRailwayProducts(options: {
  first?: number;
  category?: string;
  searchTerm?: string;
} = {}): Promise<RailwayProduct[]> {
  const { first = 20, category, searchTerm } = options;
  
  const RAILWAY_API_URL = process.env.RAILWAY_API_URL || "https://norko-graphql-api-production.up.railway.app/graphql";
  const RAILWAY_API_KEY = process.env.RAILWAY_API_KEY;

  let query = `
    query GetProducts($first: Int) {
      products(first: $first) {
        id
        name
        category
        price
        currency
        specifications {
          wattage
          dimensions
          weight
          coverage
          mounting
          efficiency
        }
        images {
          url
          altText
        }
        sourceUrl
        warranty
      }
    }
  `;

  // Use search query if search term provided
  if (searchTerm) {
    query = `
      query SearchProducts($query: String!) {
        searchProducts(query: $query) {
          id
          name
          category
          price
          currency
          specifications {
            wattage
            dimensions
            weight
            coverage
            mounting
            efficiency
          }
          images {
            url
            altText
          }
          sourceUrl
          warranty
        }
      }
    `;
  }

  // Use category filter if category provided
  if (category && !searchTerm) {
    query = `
      query GetProductsByCategory($category: String!) {
        productsByCategory(category: $category) {
          id
          name
          category
          price
          currency
          specifications {
            wattage
            dimensions
            weight
            coverage
            mounting
            efficiency
          }
          images {
            url
            altText
          }
          sourceUrl
          warranty
        }
      }
    `;
  }

  const variables = searchTerm 
    ? { query: searchTerm }
    : category 
      ? { category }
      : { first };

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication if API key is provided
    if (RAILWAY_API_KEY) {
      headers['Authorization'] = `Bearer ${RAILWAY_API_KEY}`;
    }

    const response = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`Railway API responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('Railway API GraphQL errors:', data.errors);
      throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Extract products from the appropriate field
    const products = data.data?.products || data.data?.searchProducts || data.data?.productsByCategory || [];
    
    return products;

  } catch (error) {
    console.error('Failed to fetch from Railway API:', error);
    throw error;
  }
}

/**
 * Get Railway API health status
 */
export async function getRailwayApiHealth(): Promise<{ status: string; products: number }> {
  const RAILWAY_API_URL = process.env.RAILWAY_API_URL || "https://norko-graphql-api-production.up.railway.app/graphql";
  const RAILWAY_API_KEY = process.env.RAILWAY_API_KEY;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (RAILWAY_API_KEY) {
      headers['Authorization'] = `Bearer ${RAILWAY_API_KEY}`;
    }

    const response = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `
          query {
            health
            metadata {
              totalProducts
              source
              scrapedAt
            }
          }
        `
      })
    });

    const data = await response.json();
    
    return {
      status: data.data?.health || 'unknown',
      products: data.data?.metadata?.totalProducts || 0
    };

  } catch (error) {
    console.error('Failed to get Railway API health:', error);
    throw error;
  }
}

/**
 * Get available categories from Railway API
 */
export async function getRailwayCategories(): Promise<string[]> {
  const RAILWAY_API_URL = process.env.RAILWAY_API_URL || "https://norko-graphql-api-production.up.railway.app/graphql";
  const RAILWAY_API_KEY = process.env.RAILWAY_API_KEY;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (RAILWAY_API_KEY) {
      headers['Authorization'] = `Bearer ${RAILWAY_API_KEY}`;
    }

    const response = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `
          query {
            categories
          }
        `
      })
    });

    const data = await response.json();
    
    return data.data?.categories || [];

  } catch (error) {
    console.error('Failed to get Railway categories:', error);
    return [];
  }
}
