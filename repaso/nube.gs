// Guardado de los lectores de repaso/ en una hoja de cálculo de Google (Apps Script).
// Montaje: hoja de cálculo nueva → Extensiones → Apps Script (o un proyecto suelto en script.google.com con el
// id de la hoja en HOJA) → pega este archivo → Implementar →
// Nueva implementación → Aplicación web (ejecutar como: yo; acceso: cualquier usuario) → copia la URL
// (…/exec) en NUBE, al principio de repaso/publico.js.
// - Hoja «datos»: lo de cada lector, ya cifrado en su navegador con el secreto de su llave (aquí no se puede leer).
//   La fila se busca por un id que solo sale de ese secreto.
// - Hoja «registro»: fecha, nombre y qué abre cada lector.
// Solo guardan y apuntan los lectores que están en repaso/llaves.json (su huella en «v»): quitar a alguien en
// Doodle le cierra también esto, a los pocos minutos.
const LLAVES = 'https://vyxode.github.io/doodle/repaso/llaves.json';
const HOJA = ''; // id de la hoja de cálculo (lo que va tras /d/ en su dirección); vacío si el script está dentro de ella
const TROZO = 45000; // una celda admite 50 000 caracteres: lo largo se reparte en varias columnas
// Todo se guarda con «~» delante para que la hoja no lo tome nunca por un número o una fórmula.

function doGet(e) {
  const id = String(e.parameter.id || '');
  if (!/^[0-9a-f]{64}$/.test(id)) return salida({ d: null });
  const h = hoja('datos', ['id', 'fecha', 'datos']), f = fila(h, id);
  return salida({ d: f ? h.getRange(f, 3, 1, h.getLastColumn() - 2).getValues()[0].map((v) => String(v).slice(1)).join('') || null : null });
}

function doPost(e) {
  let m;
  try { m = JSON.parse(e.postData.contents); } catch (err) { return salida({ error: 'petición no válida' }); }
  const cerrojo = LockService.getScriptLock();
  cerrojo.waitLock(10000);
  try {
    if (!valido(m.id)) return salida({ error: 'lector no válido' });
    if (m.t === 'log') {
      hoja('registro', ['Fecha', 'Nombre', 'Qué']).appendRow([new Date(), texto(m.n, 60), texto(m.que, 120)]);
      return salida({ ok: true });
    }
    if (typeof m.d !== 'string' || !/^[A-Za-z0-9+/=]{16,2000000}$/.test(m.d)) return salida({ error: 'petición no válida' });
    const h = hoja('datos', ['id', 'fecha', 'datos']), trozos = [];
    for (let i = 0; i < m.d.length; i += TROZO) trozos.push('~' + m.d.slice(i, i + TROZO));
    const ancho = Math.max(trozos.length, h.getLastColumn() - 2);
    if (h.getMaxColumns() < ancho + 2) h.insertColumnsAfter(h.getMaxColumns(), ancho + 2 - h.getMaxColumns());
    while (trozos.length < ancho) trozos.push(''); // borra los trozos que sobraban de antes
    h.getRange(fila(h, m.id) || h.getLastRow() + 1, 1, 1, ancho + 2).setValues([['~' + m.id, new Date(), ...trozos]]);
    return salida({ ok: true });
  } finally {
    cerrojo.releaseLock();
  }
}

// el id es secreto de cada lector; llaves.json solo publica la huella (SHA-256) de cada id válido
function valido(id) {
  if (!/^[0-9a-f]{64}$/.test(String(id))) return false;
  const cache = CacheService.getScriptCache();
  let v = cache.get('v');
  if (!v) { v = JSON.stringify(JSON.parse(UrlFetchApp.fetch(LLAVES + '?t=' + Date.now()).getContentText()).v || []); cache.put('v', v, 300); }
  const h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, id, Utilities.Charset.UTF_8).map((b) => ((b + 256) % 256).toString(16).padStart(2, '0')).join('');
  return JSON.parse(v).includes(h);
}

function hoja(nombre, cabecera) {
  const libro = HOJA ? SpreadsheetApp.openById(HOJA) : SpreadsheetApp.getActiveSpreadsheet();
  let h = libro.getSheetByName(nombre);
  if (!h) { h = libro.insertSheet(nombre); h.appendRow(cabecera); }
  return h;
}
const fila = (h, id) => { const c = h.getRange('A:A').createTextFinder('~' + id).matchEntireCell(true).findNext(); return c ? c.getRow() : 0; };
// lo que escribe el lector, como texto: que no pueda colar una fórmula en tu hoja
const texto = (v, max) => { const s = String(v).slice(0, max); return /^[=+\-@]/.test(s) ? "'" + s : s; };
const salida = (o) => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
