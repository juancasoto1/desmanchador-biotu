'use strict';

// ── Zonas de envío por municipio ──────────────────────────────────────────────
// cost en COP, zone = etiqueta interna para tracking/reportes

const EXACT_ZONES = new Map([
  // Cali – envío propio
  ['cali',                  { cost: 9000,  zone: 'cali' }],
  ['cali colombia',         { cost: 9000,  zone: 'cali' }],

  // Municipios Valle del Cauca aledaños a Cali — tarifa media
  ['yumbo',                 { cost: 17500, zone: 'valle_cercano' }],
  ['jamundi',               { cost: 17500, zone: 'valle_cercano' }],
  ['jamundí',               { cost: 17500, zone: 'valle_cercano' }],
  ['palmira',               { cost: 17500, zone: 'valle_cercano' }],

  // Otros municipios Valle del Cauca — tarifa estándar Valle
  ['buenaventura',          { cost: 18000, zone: 'valle' }],
  ['buga',                  { cost: 18000, zone: 'valle' }],
  ['guadalajara de buga',   { cost: 18000, zone: 'valle' }],
  ['tulua',                 { cost: 18000, zone: 'valle' }],
  ['tuluá',                 { cost: 18000, zone: 'valle' }],
  ['cartago',               { cost: 18000, zone: 'valle' }],
  ['zarzal',                { cost: 18000, zone: 'valle' }],
  ['roldanillo',            { cost: 18000, zone: 'valle' }],
  ['roldanillo',            { cost: 18000, zone: 'valle' }],
  ['la union',              { cost: 18000, zone: 'valle' }],
  ['la unión',              { cost: 18000, zone: 'valle' }],
  ['sevilla',               { cost: 18000, zone: 'valle' }],
  ['caicedonia',            { cost: 18000, zone: 'valle' }],
  ['vijes',                 { cost: 18000, zone: 'valle' }],
  ['dagua',                 { cost: 18000, zone: 'valle' }],
  ['la cumbre',             { cost: 18000, zone: 'valle' }],
  ['el cerrito',            { cost: 18000, zone: 'valle' }],
  ['candelaria',            { cost: 18000, zone: 'valle' }],
  ['florida',               { cost: 18000, zone: 'valle' }],
  ['pradera',               { cost: 18000, zone: 'valle' }],
  ['ginebra',               { cost: 18000, zone: 'valle' }],
  ['guacari',               { cost: 18000, zone: 'valle' }],
  ['guacarí',               { cost: 18000, zone: 'valle' }],
  ['obando',                { cost: 18000, zone: 'valle' }],
  ['ansermanuevo',          { cost: 18000, zone: 'valle' }],
  ['ulloa',                 { cost: 18000, zone: 'valle' }],
  ['alcala',                { cost: 18000, zone: 'valle' }],
  ['alcalá',                { cost: 18000, zone: 'valle' }],
  ['argelia',               { cost: 18000, zone: 'valle' }],
  ['bolivar',               { cost: 18000, zone: 'valle' }],
  ['bolívar',               { cost: 18000, zone: 'valle' }],
  ['bugalagrande',          { cost: 18000, zone: 'valle' }],
  ['calima',                { cost: 18000, zone: 'valle' }],
  ['el aguila',             { cost: 18000, zone: 'valle' }],
  ['el cairo',              { cost: 18000, zone: 'valle' }],
  ['el dovio',              { cost: 18000, zone: 'valle' }],
  ['restrepo',              { cost: 18000, zone: 'valle' }],
  ['rio frio',              { cost: 18000, zone: 'valle' }],
  ['riofrio',               { cost: 18000, zone: 'valle' }],
  ['riofrío',               { cost: 18000, zone: 'valle' }],
  ['san pedro',             { cost: 18000, zone: 'valle' }],
  ['toro',                  { cost: 18000, zone: 'valle' }],
  ['trujillo',              { cost: 18000, zone: 'valle' }],
  ['versalles',             { cost: 18000, zone: 'valle' }],
  ['yotoco',                { cost: 18000, zone: 'valle' }],
]);

/**
 * Normaliza una cadena para comparación flexible:
 * - toLowerCase
 * - trim
 * - colapsa espacios múltiples
 * - elimina tildes
 */
function normalize(str) {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Busca la zona de envío para una ciudad.
 * Estrategia:
 *   1. Match exacto normalizado (con y sin tildes).
 *   2. Si no hay match exacto, busca si alguna clave del mapa
 *      está CONTENIDA en el input (permite "Cali, Valle del Cauca").
 * Retorna { cost, zone } o null si no hay cobertura.
 */
function resolveZone(city) {
  const norm = normalize(city);
  if (!norm) return null;

  // 1. Búsqueda exacta
  if (EXACT_ZONES.has(norm)) return EXACT_ZONES.get(norm);

  // 2. Búsqueda por contenido (el nombre del mapa aparece dentro del input)
  for (const [key, value] of EXACT_ZONES) {
    if (norm.includes(normalize(key))) return value;
  }

  return null; // Fuera de cobertura
}

// ── Handler ───────────────────────────────────────────────────────────────────
/**
 * POST /api/shipping/calculate-by-postal-code
 * Body: { city: string, weight?: number }
 * Respuesta OK:    { cost: number, zone: string }
 * Sin cobertura:   { cost: null,   zone: null, message: string }
 * Error validación: 400
 */
const calculateByPostalCode = (req, res) => {
  const { city, weight } = req.body;

  if (!city || typeof city !== 'string' || !city.trim()) {
    return res.status(400).json({
      error: 'El campo "city" es requerido y debe ser un texto válido.',
    });
  }

  if (weight !== undefined) {
    const w = Number(weight);
    if (isNaN(w) || w <= 0) {
      return res.status(400).json({
        error: 'El campo "weight" debe ser un número positivo.',
      });
    }
  }

  const result = resolveZone(city);

  if (!result) {
    return res.status(200).json({
      cost: null,
      zone: null,
      message: `Sin cobertura para "${city.trim()}". Comunícate por WhatsApp para coordinar envío.`,
    });
  }

  return res.status(200).json({
    cost: result.cost,
    zone: result.zone,
    city: city.trim(),
    ...(weight !== undefined && { weight: Number(weight) }),
  });
};

module.exports = { calculateByPostalCode };
