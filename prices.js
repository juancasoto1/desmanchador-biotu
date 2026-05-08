/**
 * prices.js — Precios dinámicos desde Shopify Storefront API
 *
 * - Lee el atributo [data-price-id] de cada elemento (ej: "lavaloza_atom_500ml")
 * - Mapea ese ID a un { slug, variante } de Shopify usando PRODUCT_MAP
 * - Llama a /api/productos/:slug y busca la variante correspondiente
 * - Reemplaza el textContent con el precio real (preserva <small>COP</small>)
 *
 * Diagnóstico visual: agrega ?prices-debug a la URL
 *   ej: landing-lavaloza.html?prices-debug
 */

// ── Configuración ─────────────────────────────────────────────────────────────
const _ph = window.location.hostname;
const API_URL = (_ph===''||_ph==='localhost'||_ph==='127.0.0.1')
  ? 'http://localhost:3000/api'
  : '/api';

const WHATSAPP_NUMBER = '+573166152899';
const DEBUG = location.search.includes('prices-debug');

// ── Mapa: data-price-id → { slug Shopify, nombre de variante exacta } ─────────
// Convención HTML → Shopify:
//   bolsa  → Doypack          caja → BagBox            atom → Atomizador
//   tarro  → Colapsible       repuesto → Repuesto      garrafa → Garrafa
//   dispensador (lavaloza/lavpro/jabón) → Dispensador
const PRODUCT_MAP = {

  // ─── DETERGENTE ROPA BLANCA (slug con _) ──────────────
  'detblanca_bolsa_500ml':       { slug: 'detergente_liquido_ropa_blanca_biotu', variante: 'Doypack / 500ml' },
  'detblanca_bolsa_1l':          { slug: 'detergente_liquido_ropa_blanca_biotu', variante: 'Doypack / 1L' },
  'detblanca_caja_4l':           { slug: 'detergente_liquido_ropa_blanca_biotu', variante: 'BagBox / 4L' },
  'detblanca_caja_20l':          { slug: 'detergente_liquido_ropa_blanca_biotu', variante: 'BagBox / 20L' },
  'detblanca_repuesto_4l':       { slug: 'detergente_liquido_ropa_blanca_biotu', variante: 'Repuesto / 4L' },
  'detblanca_repuesto_20l':      { slug: 'detergente_liquido_ropa_blanca_biotu', variante: 'Repuesto / 20L' },
  'detblanca_garrafa_4l':        { slug: 'detergente_liquido_ropa_blanca_biotu', variante: 'Garrafa / 4L' },
  'detblanca_garrafa_20l':       { slug: 'detergente_liquido_ropa_blanca_biotu', variante: 'Garrafa / 20L' },

  // ─── DETERGENTE ROPA COLOR (slug con _) ───────────────
  'detcolor_bolsa_500ml':        { slug: 'detergente_liquido_ropa_color_biotu', variante: 'Doypack / 500ml' },
  'detcolor_bolsa_1l':           { slug: 'detergente_liquido_ropa_color_biotu', variante: 'Doypack / 1L' },
  'detcolor_caja_4l':            { slug: 'detergente_liquido_ropa_color_biotu', variante: 'BagBox / 4L' },
  'detcolor_caja_20l':           { slug: 'detergente_liquido_ropa_color_biotu', variante: 'BagBox / 20L' },
  'detcolor_repuesto_4l':        { slug: 'detergente_liquido_ropa_color_biotu', variante: 'Repuesto / 4L' },
  'detcolor_repuesto_20l':       { slug: 'detergente_liquido_ropa_color_biotu', variante: 'Repuesto / 20L' },
  'detcolor_garrafa_4l':         { slug: 'detergente_liquido_ropa_color_biotu', variante: 'Garrafa / 4L' },
  'detcolor_garrafa_20l':        { slug: 'detergente_liquido_ropa_color_biotu', variante: 'Garrafa / 20L' },

  // ─── DETERGENTE ROPA DELICADA (slug con _) ────────────
  'detdelicada_bolsa_500ml':     { slug: 'detergente_liquido_ropa_delicada_biotu', variante: 'Doypack / 500ml' },
  'detdelicada_bolsa_1l':        { slug: 'detergente_liquido_ropa_delicada_biotu', variante: 'Doypack / 1L' },
  'detdelicada_caja_4l':         { slug: 'detergente_liquido_ropa_delicada_biotu', variante: 'BagBox / 4L' },
  'detdelicada_caja_20l':        { slug: 'detergente_liquido_ropa_delicada_biotu', variante: 'BagBox / 20L' },
  'detdelicada_repuesto_4l':     { slug: 'detergente_liquido_ropa_delicada_biotu', variante: 'Repuesto / 4L' },
  'detdelicada_repuesto_20l':    { slug: 'detergente_liquido_ropa_delicada_biotu', variante: 'Repuesto / 20L' },
  'detdelicada_garrafa_4l':      { slug: 'detergente_liquido_ropa_delicada_biotu', variante: 'Garrafa / 4L' },
  'detdelicada_garrafa_20l':     { slug: 'detergente_liquido_ropa_delicada_biotu', variante: 'Garrafa / 20L' },

  // ─── DETERGENTE MULTIUSOS (slug con -) ────────────────
  'multiusos_bolsa_500ml':       { slug: 'detergente-liquido-multiusos-biotu', variante: 'Doypack / 500ml' },
  'multiusos_bolsa_1l':          { slug: 'detergente-liquido-multiusos-biotu', variante: 'Doypack / 1L' },
  'multiusos_caja_4l':           { slug: 'detergente-liquido-multiusos-biotu', variante: 'BagBox / 4L' },
  'multiusos_caja_20l':          { slug: 'detergente-liquido-multiusos-biotu', variante: 'BagBox / 20L' },
  'multiusos_repuesto_4l':       { slug: 'detergente-liquido-multiusos-biotu', variante: 'Repuesto / 4L' },
  'multiusos_repuesto_20l':      { slug: 'detergente-liquido-multiusos-biotu', variante: 'Repuesto / 20L' },
  'multiusos_garrafa_4l':        { slug: 'detergente-liquido-multiusos-biotu', variante: 'Garrafa / 4L' },
  'multiusos_garrafa_20l':       { slug: 'detergente-liquido-multiusos-biotu', variante: 'Garrafa / 20L' },

  // ─── SUAVIZANTE DE ROPA (slug con _) ──────────────────
  'suavizante_bolsa_500ml':      { slug: 'suavizante_ropa_liquido_biotu', variante: 'Doypack / 500ml' },
  'suavizante_bolsa_1l':         { slug: 'suavizante_ropa_liquido_biotu', variante: 'Doypack / 1L' },
  'suavizante_caja_4l':          { slug: 'suavizante_ropa_liquido_biotu', variante: 'BagBox / 4L' },
  'suavizante_caja_20l':         { slug: 'suavizante_ropa_liquido_biotu', variante: 'BagBox / 20L' },
  'suavizante_repuesto_4l':      { slug: 'suavizante_ropa_liquido_biotu', variante: 'Repuesto / 4L' },
  'suavizante_repuesto_20l':     { slug: 'suavizante_ropa_liquido_biotu', variante: 'Repuesto / 20L' },
  'suavizante_garrafa_4l':       { slug: 'suavizante_ropa_liquido_biotu', variante: 'Garrafa / 4L' },
  'suavizante_garrafa_20l':      { slug: 'suavizante_ropa_liquido_biotu', variante: 'Garrafa / 20L' },

  // ─── AMBIENTADOR LIMPIAPISOS (slug con -) ─────────────
  'ambientador_bolsa_500ml':     { slug: 'ambientador-y-limpia-pisos-biotu', variante: 'Doypack / 500ml' },
  'ambientador_bolsa_1l':        { slug: 'ambientador-y-limpia-pisos-biotu', variante: 'Doypack / 1L' },
  'ambientador_caja_4l':         { slug: 'ambientador-y-limpia-pisos-biotu', variante: 'BagBox / 4L' },
  'ambientador_caja_20l':        { slug: 'ambientador-y-limpia-pisos-biotu', variante: 'BagBox / 20L' },
  'ambientador_repuesto_4l':     { slug: 'ambientador-y-limpia-pisos-biotu', variante: 'Repuesto / 4L' },
  'ambientador_repuesto_20l':    { slug: 'ambientador-y-limpia-pisos-biotu', variante: 'Repuesto / 20L' },
  'ambientador_garrafa_4l':      { slug: 'ambientador-y-limpia-pisos-biotu', variante: 'Garrafa / 4L' },
  'ambientador_garrafa_20l':     { slug: 'ambientador-y-limpia-pisos-biotu', variante: 'Garrafa / 20L' },

  // ─── LIMPIAVIDRIOS (slug con _) ───────────────────────
  'vidrios_atom_500ml':          { slug: 'limpiavidrios_biotu', variante: 'Atomizador / 500ml' },
  'vidrios_bolsa_500ml':         { slug: 'limpiavidrios_biotu', variante: 'Doypack / 500ml' },
  'vidrios_bolsa_1l':            { slug: 'limpiavidrios_biotu', variante: 'Doypack / 1L' },
  'vidrios_caja_4l':             { slug: 'limpiavidrios_biotu', variante: 'BagBox / 4L' },
  'vidrios_caja_20l':            { slug: 'limpiavidrios_biotu', variante: 'BagBox / 20L' },
  'vidrios_repuesto_4l':         { slug: 'limpiavidrios_biotu', variante: 'Repuesto / 4L' },
  'vidrios_repuesto_20l':        { slug: 'limpiavidrios_biotu', variante: 'Repuesto / 20L' },
  'vidrios_garrafa_4l':          { slug: 'limpiavidrios_biotu', variante: 'Garrafa / 4L' },
  'vidrios_garrafa_20l':         { slug: 'limpiavidrios_biotu', variante: 'Garrafa / 20L' },

  // ─── DESENGRASANTE COCINA (slug con _, no tiene Doypack 500ml) ──
  'descocina_atom_500ml':        { slug: 'desengrasante_de_cocina_biotu', variante: 'Atomizador / 500ml' },
  'descocina_bolsa_1l':          { slug: 'desengrasante_de_cocina_biotu', variante: 'Botella Pead / 1L' },
  'descocina_caja_4l':           { slug: 'desengrasante_de_cocina_biotu', variante: 'BagBox / 4L' },
  'descocina_caja_20l':          { slug: 'desengrasante_de_cocina_biotu', variante: 'BagBox / 20L' },
  'descocina_repuesto_4l':       { slug: 'desengrasante_de_cocina_biotu', variante: 'Repuesto / 4L' },
  'descocina_repuesto_20l':      { slug: 'desengrasante_de_cocina_biotu', variante: 'Repuesto / 20L' },
  'descocina_garrafa_4l':        { slug: 'desengrasante_de_cocina_biotu', variante: 'Garrafa / 4L' },
  'descocina_garrafa_20l':       { slug: 'desengrasante_de_cocina_biotu', variante: 'Garrafa / 20L' },

  // ─── DESMANCHADOR JUNTAS Y BAÑOS (slug con -) ─────────
  'desmanchador_atom_500ml':     { slug: 'desmanchador-de-juntas-y-banos', variante: 'Atomizador / 500ml' },
  'desmanchador_bolsa_1l':       { slug: 'desmanchador-de-juntas-y-banos', variante: 'Botella Pead / 1L' },
  'desmanchador_caja_4l':        { slug: 'desmanchador-de-juntas-y-banos', variante: 'BagBox / 4L' },
  'desmanchador_caja_20l':       { slug: 'desmanchador-de-juntas-y-banos', variante: 'BagBox / 20L' },
  'desmanchador_repuesto_4l':    { slug: 'desmanchador-de-juntas-y-banos', variante: 'Repuesto / 4L' },
  'desmanchador_repuesto_20l':   { slug: 'desmanchador-de-juntas-y-banos', variante: 'Repuesto / 20L' },
  'desmanchador_garrafa_4l':     { slug: 'desmanchador-de-juntas-y-banos', variante: 'Garrafa / 4L' },
  'desmanchador_garrafa_20l':    { slug: 'desmanchador-de-juntas-y-banos', variante: 'Garrafa / 20L' },

  // ─── ELIMINADOR DE OLORES (slug con _) ────────────────
  'eliminador_atom_500ml':       { slug: 'eliminador_de_olores_biotu', variante: 'Atomizador / 500ml' },
  'eliminador_bolsa_500ml':      { slug: 'eliminador_de_olores_biotu', variante: 'Doypack / 500ml' },
  'eliminador_bolsa_1l':         { slug: 'eliminador_de_olores_biotu', variante: 'Doypack / 1L' },
  'eliminador_caja_4l':          { slug: 'eliminador_de_olores_biotu', variante: 'BagBox / 4L' },
  'eliminador_caja_20l':         { slug: 'eliminador_de_olores_biotu', variante: 'BagBox / 20L' },
  'eliminador_repuesto_4l':      { slug: 'eliminador_de_olores_biotu', variante: 'Repuesto / 4L' },
  'eliminador_repuesto_20l':     { slug: 'eliminador_de_olores_biotu', variante: 'Repuesto / 20L' },
  'eliminador_garrafa_4l':       { slug: 'eliminador_de_olores_biotu', variante: 'Garrafa / 4L' },
  'eliminador_garrafa_20l':      { slug: 'eliminador_de_olores_biotu', variante: 'Garrafa / 20L' },

  // ─── LAVALOZA ANTIBACTERIAL (slug con -) ──────────────
  // Nota: HTML "atom_500ml" mapea a la variante real "Dispensador / 500ml"
  'lavaloza_atom_500ml':         { slug: 'lavaloza-antibacterial', variante: 'Dispensador / 500ml' },
  'lavaloza_bolsa_500ml':        { slug: 'lavaloza-antibacterial', variante: 'Doypack / 500ml' },
  'lavaloza_bolsa_1l':           { slug: 'lavaloza-antibacterial', variante: 'Doypack / 1L' },
  'lavaloza_caja_4l':            { slug: 'lavaloza-antibacterial', variante: 'BagBox / 4L' },
  'lavaloza_caja_20l':           { slug: 'lavaloza-antibacterial', variante: 'BagBox / 20L' },
  'lavaloza_repuesto_4l':        { slug: 'lavaloza-antibacterial', variante: 'Repuesto / 4L' },
  'lavaloza_repuesto_20l':       { slug: 'lavaloza-antibacterial', variante: 'Repuesto / 20L' },
  'lavaloza_garrafa_4l':         { slug: 'lavaloza-antibacterial', variante: 'Garrafa / 4L' },
  'lavaloza_garrafa_20l':        { slug: 'lavaloza-antibacterial', variante: 'Garrafa / 20L' },

  // ─── LAVALOZA PRO MAX (slug con -) ────────────────────
  'lavpro_atom_500ml':           { slug: 'lavaloza-liquido-antibacterial-pro-max', variante: 'Dispensador / 500ml' },
  'lavpro_bolsa_500ml':          { slug: 'lavaloza-liquido-antibacterial-pro-max', variante: 'Doypack / 500ml' },
  'lavpro_bolsa_1l':             { slug: 'lavaloza-liquido-antibacterial-pro-max', variante: 'Doypack / 1L' },
  'lavpro_caja_4l':              { slug: 'lavaloza-liquido-antibacterial-pro-max', variante: 'BagBox / 4L' },
  'lavpro_caja_20l':             { slug: 'lavaloza-liquido-antibacterial-pro-max', variante: 'BagBox / 20L' },
  'lavpro_repuesto_4l':          { slug: 'lavaloza-liquido-antibacterial-pro-max', variante: 'Repuesto / 4L' },
  'lavpro_repuesto_20l':         { slug: 'lavaloza-liquido-antibacterial-pro-max', variante: 'Repuesto / 20L' },
  'lavpro_garrafa_4l':           { slug: 'lavaloza-liquido-antibacterial-pro-max', variante: 'Garrafa / 4L' },
  'lavpro_garrafa_20l':          { slug: 'lavaloza-liquido-antibacterial-pro-max', variante: 'Garrafa / 20L' },

  // ─── LIMPIADOR DESINFECTANTE (slug con _) ─────────────
  'desinfectante_atom_500ml':    { slug: 'limpiador_desinfectante_de_superficies_biotu', variante: 'Atomizador / 500ml' },
  'desinfectante_bolsa_500ml':   { slug: 'limpiador_desinfectante_de_superficies_biotu', variante: 'Doypack / 500ml' },
  'desinfectante_bolsa_1l':      { slug: 'limpiador_desinfectante_de_superficies_biotu', variante: 'Doypack / 1L' },
  'desinfectante_caja_4l':       { slug: 'limpiador_desinfectante_de_superficies_biotu', variante: 'BagBox / 4L' },
  'desinfectante_caja_20l':      { slug: 'limpiador_desinfectante_de_superficies_biotu', variante: 'BagBox / 20L' },
  'desinfectante_repuesto_4l':   { slug: 'limpiador_desinfectante_de_superficies_biotu', variante: 'Repuesto / 4L' },
  'desinfectante_repuesto_20l':  { slug: 'limpiador_desinfectante_de_superficies_biotu', variante: 'Repuesto / 20L' },
  'desinfectante_garrafa_4l':    { slug: 'limpiador_desinfectante_de_superficies_biotu', variante: 'Garrafa / 4L' },
  'desinfectante_garrafa_20l':   { slug: 'limpiador_desinfectante_de_superficies_biotu', variante: 'Garrafa / 20L' },

  // ─── DESENGRASANTE PROFESIONAL (slug con _, "tarro" → Colapsible) ──
  'despro_tarro_500ml':          { slug: 'desengrasante_profesional_biotu', variante: 'Colapsible / 500ml' },
  'despro_bolsa_500ml':          { slug: 'desengrasante_profesional_biotu', variante: 'Doypack / 500ml' },
  'despro_bolsa_1l':             { slug: 'desengrasante_profesional_biotu', variante: 'Doypack / 1L' },
  'despro_caja_4l':              { slug: 'desengrasante_profesional_biotu', variante: 'BagBox / 4L' },
  'despro_caja_20l':             { slug: 'desengrasante_profesional_biotu', variante: 'BagBox / 20L' },
  'despro_repuesto_4l':          { slug: 'desengrasante_profesional_biotu', variante: 'Repuesto / 4L' },
  'despro_repuesto_20l':         { slug: 'desengrasante_profesional_biotu', variante: 'Repuesto / 20L' },
  'despro_garrafa_4l':           { slug: 'desengrasante_profesional_biotu', variante: 'Garrafa / 4L' },
  'despro_garrafa_20l':          { slug: 'desengrasante_profesional_biotu', variante: 'Garrafa / 20L' },

  // ─── DESENGRASANTE MOTORES (slug con _) ───────────────
  'motores_bolsa_500ml':         { slug: 'desengrasante_de_motores_biotu', variante: 'Doypack / 500ml' },
  'motores_bolsa_1l':            { slug: 'desengrasante_de_motores_biotu', variante: 'Doypack / 1L' },
  'motores_caja_4l':             { slug: 'desengrasante_de_motores_biotu', variante: 'BagBox / 4L' },
  'motores_caja_20l':            { slug: 'desengrasante_de_motores_biotu', variante: 'BagBox / 20L' },
  'motores_repuesto_4l':         { slug: 'desengrasante_de_motores_biotu', variante: 'Repuesto / 4L' },
  'motores_repuesto_20l':        { slug: 'desengrasante_de_motores_biotu', variante: 'Repuesto / 20L' },
  'motores_garrafa_4l':          { slug: 'desengrasante_de_motores_biotu', variante: 'Garrafa / 4L' },
  'motores_garrafa_20l':         { slug: 'desengrasante_de_motores_biotu', variante: 'Garrafa / 20L' },

  // ─── SHAMPOO VEHÍCULOS (slug con _) ───────────────────
  'shampoo_bolsa_500ml':         { slug: 'shampoo_para_vehiculos_biotu', variante: 'Doypack / 500ml' },
  'shampoo_bolsa_1l':            { slug: 'shampoo_para_vehiculos_biotu', variante: 'Doypack / 1L' },
  'shampoo_caja_4l':             { slug: 'shampoo_para_vehiculos_biotu', variante: 'BagBox / 4L' },
  'shampoo_caja_20l':            { slug: 'shampoo_para_vehiculos_biotu', variante: 'BagBox / 20L' },
  'shampoo_repuesto_4l':         { slug: 'shampoo_para_vehiculos_biotu', variante: 'Repuesto / 4L' },
  'shampoo_repuesto_20l':        { slug: 'shampoo_para_vehiculos_biotu', variante: 'Repuesto / 20L' },
  'shampoo_garrafa_4l':          { slug: 'shampoo_para_vehiculos_biotu', variante: 'Garrafa / 4L' },
  'shampoo_garrafa_20l':         { slug: 'shampoo_para_vehiculos_biotu', variante: 'Garrafa / 20L' },

  // ─── JABÓN MANOS Y CUERPO (slug con _, 3 aromas + dispensador) ──
  // Default "jabon_dispensador_500ml" → aroma Aconcagua
  'jabon_dispensador_500ml':     { slug: 'jabon_liquido_manos_y_cuerpo_biotu', variante: 'Dispensador / 500ml / Aconcagua' },
  'jabon_aconcagua_500ml':       { slug: 'jabon_liquido_manos_y_cuerpo_biotu', variante: 'Doypack / 500ml / Aconcagua' },
  'jabon_aconcagua_1l':          { slug: 'jabon_liquido_manos_y_cuerpo_biotu', variante: 'Doypack / 1L / Aconcagua' },
  'jabon_amanecer_500ml':        { slug: 'jabon_liquido_manos_y_cuerpo_biotu', variante: 'Doypack / 500ml / Amanecer' },
  'jabon_amanecer_1l':           { slug: 'jabon_liquido_manos_y_cuerpo_biotu', variante: 'Doypack / 1L / Amanecer' },
  'jabon_coco_500ml':            { slug: 'jabon_liquido_manos_y_cuerpo_biotu', variante: 'Doypack / 500ml / Coco y Avena' },
  'jabon_coco_1l':               { slug: 'jabon_liquido_manos_y_cuerpo_biotu', variante: 'Doypack / 1L / Coco y Avena' },
};

// ── Caché en memoria para no repetir fetches a la misma slug ─────────────────
const productCache = new Map();

async function getProduct(slug) {
  if (productCache.has(slug)) return productCache.get(slug);
  const res = await fetch(`${API_URL}/productos/${slug}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} en /productos/${slug}`);
  const data = await res.json();
  productCache.set(slug, data.producto);
  return data.producto;
}

// ── Format precio en COP ──────────────────────────────────────────────────────
function formatCOP(amount) {
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
}

// ── Buscar variante por nombre exacto ─────────────────────────────────────────
function findVariant(producto, nombreVariante) {
  return producto.variantes.find((v) => v.nombre === nombreVariante);
}

// ── Actualizar un único elemento [data-price-id] ──────────────────────────────
async function updatePriceElement(el, priceId) {
  const mapping = PRODUCT_MAP[priceId];
  if (!mapping) {
    console.warn(`⚠️ Sin mapeo para: ${priceId}`);
    return { ok: false, reason: 'no-mapping', priceId };
  }

  try {
    const producto = await getProduct(mapping.slug);
    const variante = findVariant(producto, mapping.variante);
    if (!variante) {
      console.warn(`⚠️ Variante no encontrada: ${priceId} → ${mapping.slug} / ${mapping.variante}`);
      return { ok: false, reason: 'no-variant', priceId, mapping };
    }

    // Preservar <small> (ej: "COP") si existe dentro del elemento
    const small = el.querySelector('small');
    el.textContent = formatCOP(variante.precio);
    if (small) el.appendChild(small);

    return { ok: true, priceId, precio: variante.precio };
  } catch (err) {
    console.error(`❌ Error actualizando ${priceId}:`, err.message);
    return { ok: false, reason: 'error', priceId, error: err.message };
  }
}

// ── Loop principal: actualizar todos los precios de la página ────────────────
async function actualizarPrecios() {
  const elementos = document.querySelectorAll('[data-price-id]');
  if (!elementos.length) {
    if (DEBUG) console.log('ℹ️ No hay elementos [data-price-id] en esta página');
    return;
  }

  console.log(`🚀 Inicializando: ${elementos.length} precios por actualizar`);

  const resultados = await Promise.all(
    Array.from(elementos).map((el) => updatePriceElement(el, el.dataset.priceId))
  );

  const ok = resultados.filter((r) => r.ok).length;
  const fail = resultados.filter((r) => !r.ok);

  console.log(`✅ ${productCache.size} productos cargados en memoria`);
  console.log(`✅ ${ok} precios actualizados en DOM`);
  if (fail.length) {
    console.warn(`⚠️ ${fail.length} fallaron:`, fail);
  }

  if (DEBUG) showDebugPanel(ok, fail, elementos.length);
}

// ── Panel de diagnóstico (?prices-debug) ─────────────────────────────────────
function showDebugPanel(ok, fail, total) {
  const panel = document.createElement('div');
  panel.style.cssText = [
    'position:fixed', 'top:12px', 'right:12px', 'z-index:99999',
    'background:' + (fail.length === 0 ? '#15803d' : '#b91c1c'),
    'color:#fff', 'padding:14px 18px', 'border-radius:10px',
    'font:13px/1.6 monospace', 'max-width:420px',
    'box-shadow:0 4px 20px rgba(0,0,0,.4)', 'white-space:pre-wrap',
  ].join(';');

  const lines = [
    `🔍 prices-debug (Shopify API)`,
    `API: ${API_URL}`,
    `Elementos: ${total} | OK: ${ok} | Fallos: ${fail.length}`,
  ];
  if (fail.length) {
    lines.push('', '⚠️ Fallos:');
    fail.slice(0, 12).forEach((f) => {
      lines.push(`  • ${f.priceId} (${f.reason})`);
    });
    if (fail.length > 12) lines.push(`  … y ${fail.length - 12} más`);
  }
  panel.textContent = lines.join('\n');
  document.body.appendChild(panel);
}

// ── Helper: generar link WhatsApp con producto + variante + precio ───────────
function generarLinkWhatsApp(producto, variante = '', precio = '') {
  let mensaje = `Hola, me interesa el producto *${producto}*`;
  if (variante) mensaje += ` - Variante: *${variante}*`;
  if (precio) mensaje += ` - Precio: *${precio}*`;
  mensaje += '. ¿Está disponible y cuál es el proceso de compra?';
  const numero = WHATSAPP_NUMBER.replace(/[^\d]/g, '');
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

// ── Helper: actualizar links [data-wa-product] con WhatsApp dinámico ─────────
function actualizarBotonesWhatsApp() {
  const botones = document.querySelectorAll('[data-wa-product]');
  botones.forEach((btn) => {
    const producto = btn.dataset.waProduct;
    const variante = btn.dataset.waVariant || '';
    const precio = btn.dataset.waPrice || '';
    btn.href = generarLinkWhatsApp(producto, variante, precio);
  });
  if (botones.length) {
    console.log(`✅ ${botones.length} botones WhatsApp actualizados`);
  }
}

// ── Exponer en window para uso desde HTML ────────────────────────────────────
window.generarLinkWhatsApp = generarLinkWhatsApp;
window.actualizarPrecios = actualizarPrecios;
window.PRODUCT_MAP = PRODUCT_MAP;

// ── Inicialización ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  actualizarPrecios();
  actualizarBotonesWhatsApp();
});
