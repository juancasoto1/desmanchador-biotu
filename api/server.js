require('dotenv').config();

// ── Validación de variables de entorno ───────────────────────────────────────
const requiredEnvVars = [
  'SHOPIFY_STORE_URL',
  'SHOPIFY_STOREFRONT_TOKEN',
  'NUMERO_WHATSAPP',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Variable de entorno faltante: ${envVar}`);
    process.exit(1);
  }
});

console.log('✅ Todas las variables de entorno configuradas');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(morgan('combined'));
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'https://equoradistribuciones.com',
        'https://www.equoradistribuciones.com',
      ];
      // Sin origin = same-origin o file://
      if (!origin || origin === 'null' || allowed.includes(origin)) {
        callback(null, true);
      } else {
        // En Railway también aceptar el propio dominio de Railway
        const isRailway = origin && origin.endsWith('.railway.app');
        if (isRailway) { callback(null, true); }
        else { callback(new Error(`CORS bloqueado: ${origin}`)); }
      }
    },
    credentials: true,
  })
);

// Servir archivos estáticos del frontend (HTML/CSS/JS al lado del backend)
app.use(express.static(path.join(__dirname, '../')));

// ── Rutas API ────────────────────────────────────────────────────────────────
app.use('/api', require('./routes/api'));

// Error handler global
app.use(require('./middleware/errorHandler'));

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📍 Shopify Store: ${process.env.SHOPIFY_STORE_URL}`);
  console.log(`💬 WhatsApp: ${process.env.NUMERO_WHATSAPP}`);
  console.log(`\n📚 Endpoints disponibles:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/shopify-test`);
  console.log(`   GET  /api/productos`);
  console.log(`   GET  /api/productos/:slug`);
  console.log(`   GET  /api/productos/:slug/variantes`);
  console.log(`   POST /api/shipping/calculate-by-postal-code`);
  console.log(`   POST /api/webhooks/products/update`);
  console.log(`   POST /api/webhooks/inventory/change`);
  console.log(`\n🌐 Frontend: ${process.env.FRONTEND_URL || `http://localhost:${PORT}`}\n`);
});

module.exports = app;
