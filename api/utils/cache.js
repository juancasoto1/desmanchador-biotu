const NodeCache = require('node-cache');

// Caché con TTL de 5 minutos (300s) y limpieza cada 60s
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const cacheManager = {
  // Obtener valor del caché
  get: (key) => {
    const value = cache.get(key);
    if (value !== undefined) {
      console.log(`✅ Cache HIT: ${key}`);
      return value;
    }
    console.log(`❌ Cache MISS: ${key}`);
    return null;
  },

  // Guardar valor en caché
  set: (key, value, ttl = 300) => {
    cache.set(key, value, ttl);
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
  },

  // Limpiar caché específico
  clear: (key) => {
    cache.del(key);
    console.log(`🧹 Cache CLEARED: ${key}`);
  },

  // Limpiar todo el caché
  clearAll: () => {
    cache.flushAll();
    console.log('🧹 Cache CLEARED ALL');
  },

  // Estadísticas del caché (hits, misses, keys, etc.)
  getStats: () => {
    return cache.getStats();
  },
};

module.exports = cacheManager;
