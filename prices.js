/**
 * prices.js — Precios dinámicos desde Google Sheets
 *
 * FORMATO DE LA COLUMNA DE PRECIOS EN GOOGLE SHEETS:
 *   ► La columna B (price) DEBE estar en formato TEXTO PLANO.
 *   ► En Google Sheets: selecciona la columna B →
 *     Formato → Número → Texto sin formato
 *   ► Escribe el precio exactamente así: $5.800
 *     (con signo $ y punto como separador de miles)
 *   ► Si la columna está en formato Número o Moneda, Google la convierte
 *     al exportar y el precio se mostrará mal en el sitio.
 *
 * CONFIGURACIÓN:
 *   1. Columna A: id      (ej: lavaloza_atom_500ml)
 *      Columna B: price   (ej: $5.800)  ← formato Texto sin formato
 *      Columna C: descripcion (opcional, solo para tu referencia)
 *   2. Archivo → Compartir → Publicar en la web
 *      → Selecciona la hoja → CSV → Publicar → copia la URL
 *   3. Pega la URL en SHEET_CSV_URL abajo.
 */

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSr2pT9wKPefcXti8cOQZKR-lvAHS64L8YdpT89QdNECcKSkmM8DOuuiOyLQqC9gfPC5pQfrrNd-jau/pub?gid=828131088&single=true&output=csv';

// ── Diagnóstico visual ───────────────────────────────────────────────────────
// Agrega ?prices-debug a la URL para ver el panel de estado.
// Ejemplo: landing-lavaloza.html?prices-debug
const DEBUG = location.search.includes('prices-debug');

function dbgPanel(lines, ok) {
  if (!DEBUG) return;
  const panel = document.createElement('div');
  panel.style.cssText = [
    'position:fixed', 'top:12px', 'right:12px', 'z-index:99999',
    'background:' + (ok === false ? '#b91c1c' : ok === true ? '#15803d' : '#1e40af'),
    'color:#fff', 'padding:14px 18px', 'border-radius:10px',
    'font:13px/1.6 monospace', 'max-width:420px',
    'box-shadow:0 4px 20px rgba(0,0,0,.4)', 'white-space:pre-wrap'
  ].join(';');
  panel.textContent = '🔍 prices-debug\n' + lines.join('\n');
  document.body.appendChild(panel);
}

// ── Parser CSV robusto ────────────────────────────────────────────────────────
function parseCSVRow(row) {
  const cols = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      cols.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cols.push(current.trim());
  return cols;
}

// ── Carga de precios ──────────────────────────────────────────────────────────
(async function loadPrices() {
  if (!SHEET_CSV_URL || SHEET_CSV_URL.startsWith('PEGA')) {
    dbgPanel(['❌ SHEET_CSV_URL no configurada.'], false);
    return;
  }

  let csv;
  try {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) {
      dbgPanel(['❌ HTTP ' + res.status + ' al cargar el Sheet.',
                'URL: ' + SHEET_CSV_URL], false);
      console.error('Precios Biotú: HTTP ' + res.status);
      return;
    }
    csv = await res.text();
  } catch (err) {
    dbgPanel(['❌ Error de red: ' + err.message,
              '',
              'Posibles causas:',
              '• El archivo se abre como file:// y el',
              '  navegador bloquea la petición.',
              '• Sin conexión a internet.',
              '',
              'Solución: abre el archivo desde un',
              'servidor local o sube el sitio a hosting.'], false);
    console.error('Precios Biotú: no se pudo cargar el Sheet.', err);
    return;
  }

  // Omitir primera fila (encabezado)
  const rows = csv.trim().split('\n').slice(1);
  let updated = 0;
  const noMatch = [];

  rows.forEach(function(row) {
    if (!row.trim()) return;
    const cols  = parseCSVRow(row);
    const id    = cols[0] || '';
    const price = cols[1] || '';
    if (!id || !price) return;

    const els = document.querySelectorAll('[data-price-id="' + id + '"]');
    if (els.length === 0) {
      noMatch.push(id);
      return;
    }
    els.forEach(function(el) {
      const small = el.querySelector('small');
      el.textContent = price;
      if (small) el.appendChild(small);
      updated++;
    });
  });

  // Panel de diagnóstico
  if (DEBUG) {
    const lines = [
      '✅ Sheet cargado (' + rows.length + ' filas)',
      '✅ Precios actualizados: ' + updated,
    ];
    if (noMatch.length) {
      lines.push('');
      lines.push('⚠️ IDs sin coincidencia en esta página:');
      noMatch.slice(0, 10).forEach(function(id) { lines.push('   • ' + id); });
      if (noMatch.length > 10) lines.push('   … y ' + (noMatch.length - 10) + ' más');
      lines.push('');
      lines.push('(Normal: cada página solo usa algunos IDs)');
    }
    if (updated === 0 && rows.length > 0) {
      lines.push('');
      lines.push('⚠️ Primer valor leído del Sheet:');
      lines.push('   id    = "' + (parseCSVRow(rows[0])[0] || '') + '"');
      lines.push('   price = "' + (parseCSVRow(rows[0])[1] || '') + '"');
      lines.push('');
      lines.push('Revisa que la columna B esté en');
      lines.push('formato Texto sin formato en Sheets.');
    }
    dbgPanel(lines, updated > 0);
  }

  if (updated === 0 && !DEBUG) {
    console.warn(
      'Precios Biotú: Sheet leído (' + rows.length + ' filas) pero 0 precios actualizados.\n' +
      'Abre la página con ?prices-debug para ver el diagnóstico completo.\n' +
      'Ejemplo: ' + location.pathname + '?prices-debug'
    );
  }
})();
