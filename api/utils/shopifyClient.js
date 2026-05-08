/**
 * Shopify Storefront API client (GraphQL)
 *
 * Documentación: https://shopify.dev/docs/api/storefront
 * Endpoint: https://{store}.myshopify.com/api/{version}/graphql.json
 */

const axios = require('axios');

const STORE = process.env.SHOPIFY_STORE_URL;
const VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

const SHOPIFY_STOREFRONT_URL = `https://${STORE}/api/${VERSION}/graphql.json`;

const shopifyClient = axios.create({
  baseURL: SHOPIFY_STOREFRONT_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': TOKEN,
  },
  timeout: 10000,
});

// ── GraphQL Queries ───────────────────────────────────────────────────────────
const GET_ALL_PRODUCTS_QUERY = `
  query {
    products(first: 250) {
      edges {
        node {
          id
          title
          handle
          description
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                sku
              }
            }
          }
        }
      }
    }
  }
`;

const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      description
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            quantityAvailable
            sku
          }
        }
      }
    }
  }
`;

const GET_SHOP_INFO_QUERY = `
  { shop { name primaryDomain { url } } }
`;

// ── Normalizador de slugs ─────────────────────────────────────────────────────
// Algunos productos en Shopify usan handles con underscores y otros con hyphens.
// NO transformamos: usamos el slug exacto que viene del frontend.
const normalizeSlug = (slug) => slug;

// ── Ejecutor genérico de queries ──────────────────────────────────────────────
const executeQuery = async (query, variables = {}) => {
  try {
    const response = await shopifyClient.post('', { query, variables });

    if (response.data.errors) {
      throw new Error(`Shopify Error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data.data;
  } catch (error) {
    console.error('Shopify API Error:', error.message);
    throw error;
  }
};

// ── Formateador de productos ──────────────────────────────────────────────────
const formatProduct = (product) => {
  if (!product) return null;

  const variants = product.variants.edges.map((edge) => ({
    id: edge.node.id,
    nombre: edge.node.title,
    precio: parseFloat(edge.node.price.amount),
    moneda: edge.node.price.currencyCode,
    stock: edge.node.availableForSale ? (edge.node.quantityAvailable || 0) : 0,
    disponible: edge.node.availableForSale,
    sku: edge.node.sku,
  }));

  const precios = variants.length ? variants.map((v) => v.precio) : [0];
  const precioBajo = Math.min(...precios);
  const precioAlto = Math.max(...precios);
  const stockTotal = variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    id: product.id,
    nombre: product.title,
    slug: product.handle,
    descripcion: product.description,
    imagenPrincipal: product.images.edges[0]?.node?.url || null,
    imagenes: product.images.edges.map((edge) => edge.node.url),
    precioBajo,
    precioAlto,
    stockTotal,
    variantes: variants,
  };
};

// ── Funciones públicas ────────────────────────────────────────────────────────
const getAllProducts = async () => {
  try {
    const data = await executeQuery(GET_ALL_PRODUCTS_QUERY);
    return data.products.edges.map((edge) => formatProduct(edge.node));
  } catch (error) {
    console.error('Error getting all products:', error);
    throw error;
  }
};

const getProductByHandle = async (handle) => {
  try {
    handle = normalizeSlug(handle);
    const data = await executeQuery(GET_PRODUCT_BY_HANDLE_QUERY, { handle });

    if (!data.productByHandle) {
      throw new Error('Producto no encontrado');
    }

    return formatProduct(data.productByHandle);
  } catch (error) {
    console.error(`Error getting product ${handle}:`, error);
    throw error;
  }
};

const getShopInfo = async () => {
  const data = await executeQuery(GET_SHOP_INFO_QUERY);
  return data.shop;
};

module.exports = {
  getAllProducts,
  getProductByHandle,
  getShopInfo,
  executeQuery,
};
