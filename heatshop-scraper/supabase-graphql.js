/**
 * Supabase GraphQL Queries and Mutations for Image Management
 * 
 * This module contains all GraphQL operations for managing product images
 * in Supabase using the auto-generated pg_graphql API. All operations follow
 * Supabase GraphQL conventions for type-safe, efficient data access.
 * 
 * Features:
 * - Auto-generated GraphQL schema from PostgreSQL tables
 * - Relay-style cursor pagination
 * - Advanced filtering with and/or/not operators
 * - Single round-trip query resolution
 * - Row Level Security (RLS) integration
 * 
 * @author Norko Development Team
 * @version 1.1.0
 * @since 2025-07-06
 */

/**
 * GraphQL Mutations
 */
const MUTATIONS = {
  /**
   * Create new image metadata record
   */
  CREATE_IMAGE_METADATA: `
    mutation CreateImageMetadata($input: product_imagesInsertInput!) {
      insertIntoproduct_imagesCollection(objects: [$input]) {
        records {
          id
          product_id
          product_name
          filename
          storage_path
          file_size
          content_type
          alt_text
          upload_status
          created_at
          updated_at
        }
        affectedCount
      }
    }
  `,

  /**
   * Update image metadata
   */
  UPDATE_IMAGE_METADATA: `
    mutation UpdateImageMetadata($id: UUID!, $input: product_imagesUpdateInput!) {
      updateproduct_imagesCollection(filter: { id: { eq: $id } }, set: $input) {
        records {
          id
          storage_path
          upload_status
          updated_at
        }
        affectedCount
      }
    }
  `,

  /**
   * Delete image metadata
   */
  DELETE_IMAGE_METADATA: `
    mutation DeleteImageMetadata($id: UUID!) {
      deleteFromproduct_imagesCollection(filter: { id: { eq: $id } }) {
        records {
          id
          storage_path
        }
        affectedCount
      }
    }
  `,

  /**
   * Batch create multiple images
   */
  BATCH_CREATE_IMAGES: `
    mutation BatchCreateImages($inputs: [product_imagesInsertInput!]!) {
      insertIntoproduct_imagesCollection(objects: $inputs) {
        records {
          id
          product_id
          filename
          storage_path
          created_at
        }
        affectedCount
      }
    }
  `,

  /**
   * Batch update multiple images with different data
   */
  BATCH_UPDATE_IMAGES: `
    mutation BatchUpdateImages($updates: [product_imagesUpdateInput!]!, $ids: [UUID!]!) {
      updateproduct_imagesCollection(
        filter: { id: { in: $ids } }
        set: $updates
        atMost: 100
      ) {
        records {
          id
          filename
          alt_text
          upload_status
          updated_at
        }
        affectedCount
      }
    }
  `,

  /**
   * Update image upload status
   */
  UPDATE_UPLOAD_STATUS: `
    mutation UpdateUploadStatus($id: UUID!, $status: String!, $errorMessage: String) {
      updateproduct_imagesCollection(
        filter: { id: { eq: $id } }
        set: { 
          upload_status: $status
          updated_at: "now()"
        }
        atMost: 1
      ) {
        records {
          id
          upload_status
          updated_at
        }
        affectedCount
      }
    }
  `,

  /**
   * Delete multiple images by product ID
   */
  DELETE_PRODUCT_IMAGES: `
    mutation DeleteProductImages($productId: String!) {
      deleteFromproduct_imagesCollection(
        filter: { product_id: { eq: $productId } }
        atMost: 50
      ) {
        records {
          id
          filename
          storage_path
        }
        affectedCount
      }
    }
  `
};

/**
 * GraphQL Queries
 */
const QUERIES = {
  /**
   * Get all images for a specific product
   */
  GET_PRODUCT_IMAGES: `
    query GetProductImages($productId: String!) {
      product_imagesCollection(
        filter: { product_id: { eq: $productId } }
        orderBy: [{ image_index: AscNullsFirst }]
      ) {
        edges {
          node {
            id
            product_id
            product_name
            image_index
            filename
            storage_path
            file_size
            content_type
            alt_text
            width
            height
            tags
            upload_status
            is_public
            created_at
            updated_at
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  `,

  /**
   * Get image metadata by ID
   */
  GET_IMAGE_BY_ID: `
    query GetImageById($id: UUID!) {
      product_imagesCollection(filter: { id: { eq: $id } }) {
        edges {
          node {
            id
            product_id
            product_name
            image_index
            filename
            storage_path
            file_size
            content_type
            alt_text
            upload_status
            created_at
            updated_at
          }
        }
      }
    }
  `,

  /**
   * Get recent images across all products
   */
  GET_RECENT_IMAGES: `
    query GetRecentImages($limit: Int = 10) {
      product_imagesCollection(
        orderBy: [{ created_at: DescNullsLast }]
        first: $limit
      ) {
        edges {
          node {
            id
            product_id
            product_name
            filename
            storage_path
            file_size
            content_type
            upload_status
            created_at
          }
        }
      }
    }
  `,

  /**
   * Search images by product name or tags
   */
  SEARCH_IMAGES: `
    query SearchImages($searchTerm: String!, $limit: Int = 20) {
      product_imagesCollection(
        filter: {
          or: [
            { product_name: { ilike: $searchTerm } },
            { alt_text: { ilike: $searchTerm } },
            { filename: { ilike: $searchTerm } }
          ]
        }
        first: $limit
        orderBy: [{ created_at: DescNullsLast }]
      ) {
        edges {
          node {
            id
            product_id
            product_name
            filename
            storage_path
            alt_text
            tags
            created_at
          }
        }
      }
    }
  `,

  /**
   * Get upload statistics
   */
  GET_UPLOAD_STATS: `
    query GetUploadStats {
      successful: product_imagesCollection(
        filter: { upload_status: { eq: "uploaded" } }
      ) {
        totalCount
      }
      failed: product_imagesCollection(
        filter: { upload_status: { eq: "failed" } }
      ) {
        totalCount
      }
      total: product_imagesCollection {
        totalCount
      }
    }
  `,

  /**
   * Advanced search with filters - demonstrates complex filtering capabilities
   */
  ADVANCED_SEARCH_IMAGES: `
    query AdvancedSearchImages(
      $searchTerm: String
      $productIds: [String!]
      $minFileSize: BigInt
      $maxFileSize: BigInt
      $contentTypes: [String!]
      $uploadStatus: String
      $first: Int = 20
      $after: String
    ) {
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
            { product_id: { in: $productIds } }
            { file_size: { gte: $minFileSize } }
            { file_size: { lte: $maxFileSize } }
            { content_type: { in: $contentTypes } }
            { upload_status: { eq: $uploadStatus } }
            { is_public: { eq: true } }
          ]
        }
        orderBy: [{ created_at: DescNullsLast }]
        first: $first
        after: $after
      ) {
        edges {
          cursor
          node {
            id
            product_id
            product_name
            filename
            storage_path
            file_size
            content_type
            alt_text
            width
            height
            tags
            upload_status
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
  `,

  /**
   * Get images with pagination (Relay-style cursor pagination)
   */
  GET_IMAGES_PAGINATED: `
    query GetImagesPaginated(
      $first: Int
      $last: Int
      $after: String
      $before: String
      $orderBy: [product_imagesOrderBy!] = [{ created_at: DescNullsLast }]
    ) {
      product_imagesCollection(
        first: $first
        last: $last
        after: $after
        before: $before
        orderBy: $orderBy
      ) {
        edges {
          cursor
          node {
            id
            product_id
            product_name
            filename
            storage_path
            file_size
            content_type
            upload_status
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
  `,

  /**
   * Get image statistics and aggregates
   */
  GET_IMAGE_STATS: `
    query GetImageStats($productId: String) {
      product_imagesCollection(
        filter: { product_id: { eq: $productId } }
      ) {
        totalCount
        aggregate {
          count
          sum {
            file_size
          }
          avg {
            file_size
          }
          min {
            created_at
            file_size
          }
          max {
            created_at
            file_size
          }
        }
      }
    }
  `
};

/**
 * GraphQL Subscriptions (for real-time updates)
 */
const SUBSCRIPTIONS = {
  /**
   * Subscribe to new image uploads
   */
  SUBSCRIBE_NEW_IMAGES: `
    subscription SubscribeNewImages {
      product_imagesCollection {
        id
        product_id
        product_name
        filename
        upload_status
        created_at
      }
    }
  `,

  /**
   * Subscribe to upload status changes
   */
  SUBSCRIBE_UPLOAD_STATUS: `
    subscription SubscribeUploadStatus($productId: String!) {
      product_imagesCollection(filter: { product_id: { eq: $productId } }) {
        id
        upload_status
        updated_at
      }
    }
  `
};

/**
 * Execute GraphQL operation against Supabase
 * 
 * Follows Supabase GraphQL authentication patterns:
 * - Uses apiKey header (required for all requests)
 * - Optionally uses Authorization header for user context
 * - Handles both anon and service_role authentication
 * 
 * @param {string} operation - GraphQL query or mutation
 * @param {Object} variables - Variables for the operation
 * @param {string} endpoint - GraphQL endpoint URL (must not have trailing /)
 * @param {string} apiKey - Supabase API key (anon or service_role)
 * @param {string} [authToken] - Optional JWT token for user authentication
 * @returns {Promise<Object>} GraphQL response with success/error handling
 */
async function executeGraphQL(operation, variables = {}, endpoint, apiKey, authToken = null) {
  const axios = require('axios');
  
  try {
    // Validate endpoint format (Supabase requirement: no trailing slash)
    if (endpoint.endsWith('/')) {
      throw new Error('GraphQL endpoint URL must not have trailing slash');
    }

    // Prepare headers according to Supabase GraphQL documentation
    const headers = {
      'Content-Type': 'application/json',
      'apiKey': apiKey,  // Required for all Supabase GraphQL requests
    };

    // Add Authorization header for user context if provided
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await axios.post(
      endpoint,
      {
        query: operation,
        variables: variables
      },
      { headers }
    );

    // Handle GraphQL errors (application-level errors)
    if (response.data.errors) {
      console.error('GraphQL execution errors:', response.data.errors);
      return {
        success: false,
        data: response.data.data || null,
        errors: response.data.errors
      };
    }

    return {
      success: true,
      data: response.data.data,
      errors: null
    };

  } catch (error) {
    // Handle network/HTTP errors
    console.error('GraphQL request failed:', error.message);
    
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: endpoint
    };

    // Handle specific Supabase error cases
    if (error.response?.status === 401) {
      errorDetails.message = 'Authentication failed - check your API key';
    } else if (error.response?.status === 404) {
      errorDetails.message = 'GraphQL endpoint not found - verify your PROJECT_REF';
    } else if (error.response?.status === 403) {
      errorDetails.message = 'Access denied - check RLS policies and permissions';
    }

    return {
      success: false,
      data: null,
      errors: error.response?.data?.errors || [errorDetails]
    };
  }
}

/**
 * Helper function to create GraphQL client with Supabase configuration
 * 
 * @param {string} supabaseUrl - Base Supabase URL
 * @param {string} apiKey - Supabase API key
 * @returns {Object} GraphQL client with query/mutate methods
 */
function createGraphQLClient(supabaseUrl, apiKey) {
  const graphqlEndpoint = `${supabaseUrl}/graphql/v1`;
  
  return {
    endpoint: graphqlEndpoint,
    apiKey: apiKey,
    query: (operation, variables = {}) => executeGraphQL(operation, variables, graphqlEndpoint, apiKey),
    mutate: (operation, variables = {}) => executeGraphQL(operation, variables, graphqlEndpoint, apiKey),
  };
}

/**
 * Utility functions for common GraphQL patterns
 */
const UTILS = {
  /**
   * Build pagination variables for cursor-based pagination
   */
  buildPaginationVars(first = 20, after = null, last = null, before = null) {
    const vars = {};
    if (first) vars.first = first;
    if (after) vars.after = after;
    if (last) vars.last = last;
    if (before) vars.before = before;
    return vars;
  },

  /**
   * Build filter variables for image search
   */
  buildImageFilter(productId, searchTerm, uploadStatus = 'uploaded') {
    const filter = { and: [] };
    
    if (productId) {
      filter.and.push({ product_id: { eq: productId } });
    }
    
    if (searchTerm) {
      filter.and.push({
        or: [
          { product_name: { ilike: `%${searchTerm}%` } },
          { alt_text: { ilike: `%${searchTerm}%` } },
          { tags: { contains: searchTerm } }
        ]
      });
    }
    
    if (uploadStatus) {
      filter.and.push({ upload_status: { eq: uploadStatus } });
    }
    
    return filter;
  },

  /**
   * Extract pagination info from GraphQL response
   */
  extractPaginationInfo(response) {
    const pageInfo = response?.data?.product_imagesCollection?.pageInfo;
    return {
      hasNextPage: pageInfo?.hasNextPage || false,
      hasPreviousPage: pageInfo?.hasPreviousPage || false,
      startCursor: pageInfo?.startCursor,
      endCursor: pageInfo?.endCursor,
      totalCount: response?.data?.product_imagesCollection?.totalCount
    };
  }
};

/**
 * Type definitions for TypeScript support
 */
const TYPE_DEFINITIONS = `
  type ProductImage {
    id: string
    product_id: string
    product_name: string
    image_index: number
    filename: string
    original_url?: string
    storage_path: string
    file_size: number
    content_type: string
    alt_text: string
    width?: number
    height?: number
    tags: string[]
    upload_status: 'uploading' | 'uploaded' | 'failed'
    is_public: boolean
    created_at: string
    updated_at: string
  }

  type ImageUploadInput {
    product_id: string
    product_name: string
    image_index: number
    filename: string
    original_url?: string
    storage_path: string
    file_size: number
    content_type: string
    alt_text: string
    tags: string[]
    upload_status?: string
    is_public?: boolean
  }
`;

module.exports = {
  MUTATIONS,
  QUERIES,
  SUBSCRIPTIONS,
  executeGraphQL,
  createGraphQLClient,
  UTILS,
  TYPE_DEFINITIONS
};
