// Guardado de los lectores de repaso/ en una hoja de cálculo de Google (Apps Script).
// Montaje: hoja de cálculo nueva → Extensiones → Apps Script (o un proyecto suelto en script.google.com con el
// id de la hoja en HOJA) → pega este archivo → Implementar →
// Nueva implementación → Aplicación web (ejecutar como: yo; acceso: cualquier usuario) → copia la URL
// (…/exec) en NUBE, al principio de repaso/publico.js.
// - Hoja «datos»: lo de cada lector, ya cifrado en su navegador con el secreto de su llave (aquí no se puede leer).
//   La fila se busca por un id que solo sale de ese secreto.
// - Hoja «registro»: fecha, nombre y qué abre cada lector.
// - Hoja «usuarios»: quien se registra con Google (correo, nombre, su secreto, su llave cifrada con su contraseña y
//   su estado: vacío si es nuevo, «conocido» o «vetado»). Entran sin esperar; en Doodle (Ajustes → Lectores) ves
//   quién es cada uno y puedes vetarlo. Su llave no se publica: solo se entrega a quien sabe su contraseña (manda
//   un verificador que sale de ella; aquí se guarda solo su huella) y los fallos están limitados, así que no se
//   puede probar contraseñas sin conexión.
// Solo guardan y apuntan los lectores de repaso/llaves.json (su huella en «v») y los de «usuarios»: quitar a
// alguien en Doodle le cierra también esto, a los pocos minutos.
// Registro con Google: en Configuración del proyecto → Propiedades del script pon CLIENT_ID (el id de cliente OAuth
// de Google, tipo web, con el origen https://vyxode.github.io), INVITACION (el código del enlace para tu grupo)
// CLAVE_PDF y ADMIN (las dos se copian en Doodle → Ajustes → Lectores). SAL se crea sola.
const LLAVES = 'https://vyxode.github.io/doodle/repaso/llaves.json';
const HOJA = ''; // id de la hoja de cálculo (lo que va tras /d/ en su dirección); vacío si el script está dentro de ella
const TROZO = 45000; // una celda admite 50 000 caracteres: lo largo se reparte en varias columnas
// Todo se guarda con «~» delante para que la hoja no lo tome nunca por un número o una fórmula.

const P = PropertiesService.getScriptProperties();
const COLS = ['correo', 'nombre', 'secreto', 'llave', 'huella', 'fecha', 'origen', 'estado', 'verificador'];

function doGet(e) {
  if (e.parameter.t === 'llaves') return salida(llavesGoogle());
  const id = String(e.parameter.id || '');
  if (!/^[0-9a-f]{64}$/.test(id) || !valido(id)) return salida({ d: null });
  const h = hoja('datos', ['id', 'fecha', 'datos']), f = fila(h, id);
  return salida({ d: f ? h.getRange(f, 3, 1, h.getLastColumn() - 2).getValues()[0].map((v) => String(v).slice(1)).join('') || null : null });
}

function doPost(e) {
  let m;
  try { m = JSON.parse(e.postData.contents); } catch (err) { return salida({ error: 'petición no válida' }); }
  const cerrojo = LockService.getScriptLock();
  cerrojo.waitLock(10000);
  try {
    if (m.t === 'google') return salida(conGoogle(m));
    if (m.t === 'llave') return salida(guardarLlave(m));
    if (m.t === 'entrar') return salida(entrarConClave(m));
    if (m.t === 'admin') return salida(admin(m));
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
  const h = sha(id);
  if (JSON.parse(v).includes(h)) return true;
  const u = usuarios(), f = buscar(u, 5, h);
  return !!f && celda(u.getRange(f, 8).getValue()) !== 'vetado';
}
const sha = (t) => Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, t, Utilities.Charset.UTF_8).map((b) => ((b + 256) % 256).toString(16).padStart(2, '0')).join('');

// ---------- registro e inicio de sesión con Google ----------
const usuarios = () => hoja('usuarios', COLS);
const celda = (v) => String(v).slice(1); // quita la «~»
const buscar = (h, col, valor) => { const c = h.getRange(1, col, Math.max(1, h.getLastRow()), 1).createTextFinder('~' + valor).matchEntireCell(true).findNext(); return c ? c.getRow() : 0; };
function sal() {
  let s = P.getProperty('SAL');
  if (!s) { s = Utilities.base64Encode(Utilities.getUuid() + Utilities.getUuid()).slice(0, 24); P.setProperty('SAL', s); }
  return s;
}
// lo público del registro con Google: la sal para derivar de la contraseña y las huellas de los lectores de antes
// que ya se pasaron (su contraseña antigua deja de valer). Las llaves no.
function llavesGoogle() {
  const h = usuarios(), filas = h.getLastRow() > 1 ? h.getRange(2, 1, h.getLastRow() - 1, COLS.length).getValues() : [];
  return { sal: sal(), iter: ITER, migradas: filas.filter((f) => celda(f[6]) === 'migrado').map((f) => celda(f[4])) };
}
const ITER = 300000;
// entrar con contraseña: devuelve su llave (cifrada con esa contraseña) si el verificador coincide. Como mucho
// 30 fallos cada 10 minutos entre todos: probar contraseñas a ciegas no sale a cuenta.
function entrarConClave(m) {
  const v = String(m.v || ''), cache = CacheService.getScriptCache(), fallos = +(cache.get('fallos') || 0);
  if (!/^[0-9a-f]{64}$/.test(v)) return { error: 'petición no válida' };
  if (fallos >= 30) return { error: 'Demasiados intentos fallidos. Espera unos minutos o entra con Google.' };
  const h = usuarios(), f = buscar(h, 9, sha(v));
  const fila = f ? h.getRange(f, 1, 1, COLS.length).getValues()[0] : null;
  if (!fila || celda(fila[7]) === 'vetado' || !celda(fila[3])) { cache.put('fallos', String(fallos + 1), 600); return { error: 'Contraseña incorrecta' }; }
  return { llave: celda(fila[3]) };
}
// comprueba con Google el token de «Iniciar sesión con Google»
function cuentaGoogle(token) {
  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(String(token))) return null;
  const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + token, { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return null;
  const t = JSON.parse(r.getContentText());
  const emisor = t.iss === 'accounts.google.com' || t.iss === 'https://accounts.google.com';
  return emisor && t.aud === P.getProperty('CLIENT_ID') && String(t.email_verified) === 'true' && +t.exp * 1000 > Date.now() ? String(t.email).toLowerCase() : null;
}
// entra con Google: si ya tiene cuenta, recibe su nombre y su llave; si no, se crea (con el código del enlace, o
// conservando el secreto de un lector de antes, para no perder sus notas) y después pone nombre y contraseña
function conGoogle(m) {
  const correo = cuentaGoogle(m.token), k = P.getProperty('CLAVE_PDF');
  if (!correo) return { error: 'No se ha podido comprobar tu cuenta de Google.' };
  if (!k) return { error: 'El registro aún no está configurado.' };
  const h = usuarios(), f = buscar(h, 1, correo);
  if (f) {
    const v = h.getRange(f, 1, 1, COLS.length).getValues()[0];
    // «llave»: ya eligió contraseña (con el sistema nuevo); si no, se le pide
    return celda(v[7]) === 'vetado' ? { error: 'No tienes acceso.' } : { existe: true, n: celda(v[1]), k, s: celda(v[2]), llave: !!celda(v[3]) && !!celda(v[8]) };
  }
  let s, n = '', origen = 'google';
  if (m.antiguo) {
    s = String(m.antiguo.s || ''); n = texto(m.antiguo.n || '', 40); origen = 'migrado';
    if (!/^[A-Za-z0-9+/=]{40,60}$/.test(s) || !valido(sha(s + ':id'))) return { error: 'Tu llave de antes no es válida.' };
    if (buscar(h, 3, s)) return { error: 'Tu llave de antes ya está vinculada a otra cuenta de Google.' };
  } else {
    if (!m.codigo || String(m.codigo) !== P.getProperty('INVITACION')) return { error: 'Para registrarte necesitas el enlace de invitación.' };
    s = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + Date.now()));
  }
  h.appendRow(['~' + correo, '~' + n, '~' + s, '', '~' + sha(sha(s + ':id')), new Date(), '~' + origen, origen === 'migrado' ? '~conocido' : '', '']);
  return { existe: false, n, k, s, llave: false };
}
// guarda su nombre y su llave (cifrada en su navegador con la contraseña que ha elegido)
function guardarLlave(m) {
  const correo = cuentaGoogle(m.token);
  if (!correo) return { error: 'No se ha podido comprobar tu cuenta de Google.' };
  if (typeof m.llave !== 'string' || !/^[A-Za-z0-9+/=]{40,2000}$/.test(m.llave) || !/^[0-9a-f]{64}$/.test(String(m.v))) return { error: 'petición no válida' };
  const h = usuarios(), f = buscar(h, 1, correo), otra = buscar(h, 9, sha(m.v));
  if (!f) return { error: 'Primero entra con Google.' };
  if (celda(h.getRange(f, 8).getValue()) === 'vetado') return { error: 'No tienes acceso.' };
  // para entrar solo se usa la contraseña: no puede coincidir con la de otra persona
  if (otra && otra !== f) return { error: 'Esa contraseña no se puede usar: elige otra.' };
  h.getRange(f, 9).setValue('~' + sha(m.v));
  if (m.n) h.getRange(f, 2).setValue('~' + texto(m.n, 40));
  h.getRange(f, 4).setValue('~' + m.llave);
  return { ok: true };
}

// Doodle (con la clave ADMIN): lista de registrados y cambiar su estado
function admin(m) {
  const clave = P.getProperty('ADMIN');
  if (!clave || String(m.clave) !== clave) return { error: 'Clave de administrador no válida.' };
  const h = usuarios();
  if (m.accion === 'estado') {
    const f = buscar(h, 1, String(m.correo || '').toLowerCase());
    if (!f || !['', 'conocido', 'vetado'].includes(m.estado)) return { error: 'petición no válida' };
    h.getRange(f, 8).setValue(m.estado ? '~' + m.estado : '');
  }
  const filas = h.getLastRow() > 1 ? h.getRange(2, 1, h.getLastRow() - 1, COLS.length).getValues() : [];
  return { usuarios: filas.map((f) => ({ correo: celda(f[0]), n: celda(f[1]), fecha: f[5] ? new Date(f[5]).getTime() : 0, origen: celda(f[6]), estado: celda(f[7]), clave: !!celda(f[3]) })) };
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
