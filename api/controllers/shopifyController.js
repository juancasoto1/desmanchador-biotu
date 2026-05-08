const shopifyClient = require('../utils/shopifyClient');
const cacheManager = require('../utils/cache');

// ── GET /api/productos ────────────────────────────────────────────────────────
const getAllProducts = async (req, res, next) => {
  try {
    const cacheKey = 'all_products';

    let productos = cacheManager.get(cacheKey);

    if (!productos) {
      console.log('📦 Fetching productos desde Shopify...');
      productos = await shopifyClient.getAllProducts();
      cacheManager.set(cacheKey, productos, 300);
    }

    res.json({
      success: true,
      count: productos.length,
      productos,
      cacheStats: cacheManager.getStats(),
    });
  } catch (error) {
    console.error('Error en getAllProducts:', error);
    next(error);
  }
};

// ── GET /api/productos/:slug ──────────────────────────────────────────────────
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cacheKey = `product_${slug}`;

    let producto = cacheManager.get(cacheKey);

    if (!producto) {
      console.log(`📦 Fetching producto ${slug} desde Shopify...`);
      producto = await shopifyClient.getProductByHandle(slug);
      cacheManager.set(cacheKey, producto, 300);
    }

    // Meta tags para SEO
    const metaTags = {
      title: `${producto.nombre} | Equora Distribuciones`,
      description: (producto.descripcion || '').substring(0, 160),
      image: producto.imagenPrincipal,
      url: `https://equoradistribuciones.com/producto/${slug}`,
    };

    res.json({
      success: true,
      producto,
      metaTags,
    });
  } catch (error) {
    console.error('Error en getProductBySlug:', error);

    if (error.message && error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    next(error);
  }
};

// ── GET /api/productos/:slug/variantes ────────────────────────────────────────
const getProductVariants = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cacheKey = `variants_${slug}`;

    let variantes = cacheManager.get(cacheKey);

    if (!variantes) {
      console.log(`📦 Fetching variantes ${slug} desde Shopify...`);
      const producto = await shopifyClient.getProductByHandle(slug);
      variantes = producto.variantes;
      cacheManager.set(cacheKey, variantes, 300);
    }

    res.json({
      success: true,
      variantes,
    });
  } catch (error) {
    console.error('Error en getProductVariants:', error);

    if (error.message && error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    next(error);
  }
};

// ── Webhook: Producto actualizado ─────────────────────────────────────────────
const handleProductUpdate = (req, res) => {
  try {
    const { handle } = req.body;

    if (handle) {
      cacheManager.clear(`product_${handle}`);
      cacheManager.clear(`variants_${handle}`);
    }
    cacheManager.clear('all_products');

    console.log(`🔄 Producto actualizado: ${handle}`);

    res.json({ success: true, message: 'Cache invalidado' });
  } catch (error) {
    console.error('Error en handleProductUpdate:', error);
    res.status(500).json({ error: error.message });
  }
};

// ── Webhook: Cambio de inventario ─────────────────────────────────────────────
const handleInventoryChange = (req, res) => {
  try {
    const { handle } = req.body;

    if (handle) {
      cacheManager.clear(`product_${handle}`);
      cacheManager.clear(`variants_${handle}`);
    }
    cacheManager.clear('all_products');

    console.log(`📊 Inventario actualizado: ${handle}`);

    res.json({ success: true, message: 'Cache invalidado' });
  } catch (error) {
    console.error('Error en handleInventoryChange:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductBySlug,
  getProductVariants,
  handleProductUpdate,
  handleInventoryChange,
};
