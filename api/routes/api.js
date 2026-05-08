const express = require('express');
const router = express.Router();
const shopifyController = require('../controllers/shopifyController');

// ── Health check ─────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    store: process.env.SHOPIFY_STORE_URL,
    whatsapp: process.env.NUMERO_WHATSAPP,
  });
});

// ── Diagnóstico Shopify (verifica conexión Storefront API) ────────────────────
router.get('/shopify-test', async (req, res, next) => {
  try {
    const shopifyClient = require('../utils/shopifyClient');
    const shop = await shopifyClient.getShopInfo();
    res.json({ ok: true, shop });
  } catch (err) {
    next(err);
  }
});

// ── Productos ────────────────────────────────────────────────────────────────
router.get('/productos',                      shopifyController.getAllProducts);
router.get('/productos/:slug',                shopifyController.getProductBySlug);
router.get('/productos/:slug/variantes',      shopifyController.getProductVariants);

// ── Webhooks (invalidación de caché) ──────────────────────────────────────────
router.post('/webhooks/products/update',      shopifyController.handleProductUpdate);
router.post('/webhooks/inventory/change',     shopifyController.handleInventoryChange);

module.exports = router;
