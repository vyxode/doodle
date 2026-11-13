// Resúmenes de solo lectura: cada persona tiene su contraseña, que abre su llave en llaves.json
// (dentro va su nombre y la clave de los PDF). Los PDF se descifran en memoria y se pintan en canvas;
// nunca hay un PDF que descargar. Encima van el subrayado y las notas (marcas.js) y el estudio (estudio.js).
// Lo de cada lector (subrayado, notas, fallos y resultados) se guarda cifrado con el secreto de su llave en la
// aplicación web de Apps Script de nube.gs, que también apunta quién entra; además queda copia en el navegador.
const NUBE = ''; // https://script.google.com/macros/s/<id>/exec
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const $ = (id) => document.getElementById(id);
const bytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)), b64 = (u) => btoa(String.fromCharCode(...u));
const abrir = (clave, datos) => { const x = datos instanceof Uint8Array ? datos : new Uint8Array(datos); return crypto.subtle.decrypt({ name: 'AES-GCM', iv: x.subarray(0, 12) }, clave, x.subarray(12)); };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
let yo = null; // { n: nombre, k: clave de los PDF, s: su secreto, nk: clave de sus datos, id: dónde se guardan }
let D = null; // sus datos: { ts, docs: { [f]: { marcas: [] } }, fallos: { [módulo]: { 'p:3': 1 } }, notas: [], borradas: { [marca]: 1 } }
let A = null; // el resumen abierto: { r, mod, pags: [texto por página], hojas: [div por página] }

const registrar = (que) => NUBE && yo.id && fetch(NUBE, { method: 'POST', body: JSON.stringify({ t: 'log', id: yo.id, n: yo.n, que }) }).catch(() => {});
const huella = async (txt) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt)))].map((x) => x.toString(16).padStart(2, '0')).join('');

async function entrar(clave) {
  clave = clave.trim();
  const L = await (await fetch('llaves.json', { cache: 'no-cache' })).json();
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(clave), 'PBKDF2', false, ['deriveKey']);
  const pk = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(L.sal), iterations: L.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  for (const l of L.llaves) {
    const llave = await abrir(pk, bytes(l)).then((d) => JSON.parse(new TextDecoder().decode(d)), () => null);
    if (!llave) continue;
    // la clave y el sitio de sus datos salen de su secreto (aleatorio, el mismo aunque le cambien la contraseña);
    // las llaves de antes de los secretos no tienen: leen, pero no guardan hasta que se rehagan en Doodle
    if (!llave.s) return { ...llave, nk: null, id: null };
    const nk = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(llave.s + ':clave'));
    return { ...llave, nk: b64(new Uint8Array(nk)), id: await huella(llave.s + ':id') };
  }
  throw new Error('Contraseña incorrecta');
}

// ---------- sus datos: copia en el navegador y en Apps Script; dos dispositivos se fusionan ----------
const claveDatos = () => crypto.subtle.importKey('raw', bytes(yo.nk), 'AES-GCM', false, ['encrypt', 'decrypt']);
const local = { get: () => { try { return localStorage.getItem('doodle-datos-' + yo.id); } catch { return null; } }, set: (v) => { try { localStorage.setItem('doodle-datos-' + yo.id, v); } catch { /* sin almacenamiento */ } } };
const vacio = () => ({ ts: 0, docs: {}, fallos: {}, notas: [], borradas: {} });
async function descifrarDatos(s) { return s ? { ...vacio(), ...JSON.parse(new TextDecoder().decode(await abrir(await claveDatos(), bytes(s)))) } : vacio(); }
async function cifrarDatos() {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return b64(new Uint8Array([...iv, ...new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await claveDatos(), new TextEncoder().encode(JSON.stringify(D))))]));
}
// junta dos versiones: se queda con todo lo de las dos, lo borrado en cualquiera se borra y cada marca, en su versión más nueva
function juntar(a, b) {
  const borradas = { ...a.borradas, ...b.borradas }, docs = {};
  for (const f of new Set([...Object.keys(a.docs), ...Object.keys(b.docs)])) {
    const m = new Map();
    for (const x of [...(a.docs[f]?.marcas || []), ...(b.docs[f]?.marcas || [])]) if (!borradas[x.i] && (x.u || 0) >= (m.get(x.i)?.u || 0)) m.set(x.i, x);
    docs[f] = { marcas: [...m.values()] };
  }
  const notas = [...new Map([...a.notas, ...b.notas].map((n) => [n.f + n.fecha, n])).values()].sort((x, y) => x.fecha - y.fecha);
  return { ts: Math.max(a.ts, b.ts), docs, fallos: (a.ts >= b.ts ? a : b).fallos, notas, borradas };
}
async function deLaNube() {
  if (!NUBE) return vacio();
  const r = await (await fetch(`${NUBE}?id=${yo.id}`, { cache: 'no-store' })).json();
  return descifrarDatos(r.d);
}
async function cargarDatos() {
  D = vacio();
  if (!yo.id) return nube('Tus notas no se guardarán hasta que te den la llave nueva');
  D = juntar(await descifrarDatos(local.get()).catch(vacio), await deLaNube().catch(() => (nube('Sin conexión: se guarda en este navegador'), vacio())));
}
// trae lo hecho en otro dispositivo (al volver a la pestaña) y lo pinta
async function traer() {
  if (!yo?.id || !NUBE || porSubir) return;
  try { const antes = JSON.stringify(D); D = juntar(D, await deLaNube()); if (JSON.stringify(D) !== antes) repintar(); } catch { /* sin conexión: ya se fusionará */ }
}
let espera = 0, porSubir = false;
function guardar() {
  if (!yo?.id) return;
  D.ts = Date.now(); porSubir = true; nube('Guardando…');
  clearTimeout(espera); espera = setTimeout(subir, 700);
}
async function subir(alCerrar) {
  clearTimeout(espera);
  if (!porSubir || !yo?.id) return;
  porSubir = false;
  if (!alCerrar && NUBE) try { D = juntar(D, await deLaNube()); repintar(); } catch { /* se sube lo que hay */ }
  const s = await cifrarDatos();
  local.set(s);
  if (!NUBE) return nube('Guardado en este navegador');
  try {
    const r = await (await fetch(NUBE, { method: 'POST', body: JSON.stringify({ id: yo.id, d: s }), keepalive: alCerrar && s.length < 60000 })).json();
    nube(r.ok ? 'Guardado' : 'Guardado solo en este navegador: ' + r.error);
  } catch { nube('Sin conexión: guardado en este navegador'); }
}
document.addEventListener('visibilitychange', () => (document.hidden ? subir(true) : traer()));
addEventListener('pagehide', () => subir(true));
const nube = (t) => { $('nube').textContent = t; };

// ---------- pantalla ----------
function mostrar() {
  $('entrada').hidden = !!yo; $('dentro').hidden = !yo;
  if (!yo) return;
  $('hola').textContent = 'Hola, ' + yo.n;
  $('docs').innerHTML = '';
  for (const [mod, lista] of Object.entries(window.RESUMENES || {})) for (const r of lista) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'boton'; b.textContent = `${mod} · ${r.t}`;
    b.onclick = () => leer(r, mod);
    $('docs').append(b);
  }
}
function pestana(p) {
  for (const b of document.querySelectorAll('#pestanas button')) b.setAttribute('aria-pressed', b.dataset.p === p);
  for (const s of document.querySelectorAll('.pestana')) s.hidden = s.id !== 'p-' + p;
  if (p !== 'leer') estudio(p);
}
function repintar() { A?.hojas.forEach((_, i) => pintarMarcas(i + 1)); if (A && !$('p-notas').hidden) verNotas(); }
// si cambia el ancho (girar el móvil, otra ventana), se vuelve a pintar en la misma página
let reajuste = 0;
addEventListener('resize', () => {
  clearTimeout(reajuste);
  reajuste = setTimeout(() => {
    if (!A || $('p-leer').hidden || Math.abs($('hojas').clientWidth - A.ancho) < 40) return;
    const vista = A.hojas.findIndex((h) => h.getBoundingClientRect().bottom > 80) + 1;
    leer(A.r, A.mod, vista);
  }, 400);
});
// lleva a una página del resumen, desde las notas, la búsqueda o una pregunta
function irPagina(n) { pestana('leer'); A.hojas[n - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

let lectura = 0; // cada clic empieza una lectura nueva; la anterior deja de pintar (si no, dos clics duplican las páginas)
async function leer(r, mod, volverA) {
  const esta = ++lectura;
  A = { r, mod, pags: [], hojas: [] };
  E = T = H = null; // lo de estudio era del resumen anterior
  A.ancho = $('hojas').clientWidth;
  $('lector').hidden = false; pestana('leer');
  $('hojas').innerHTML = ''; $('estado').textContent = 'Abriendo…';
  try {
    const k = await crypto.subtle.importKey('raw', bytes(yo.k), 'AES-GCM', false, ['decrypt']);
    const res = await fetch(r.f + '.enc', { cache: 'no-cache' });
    if (!res.ok) throw new Error('No se encuentra el resumen');
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await abrir(k, await res.arrayBuffer())) }).promise;
    if (esta !== lectura) return doc.destroy();
    registrar(r.t);
    // shortcut: el tamaño se fija al abrir; si se gira el móvil o cambia la ventana, hay que volver a abrirlo
    const ancho = Math.min($('hojas').clientWidth || 800, 860), dpr = Math.min(devicePixelRatio || 1, 2);
    for (let i = 1; i <= doc.numPages; i++) {
      $('estado').textContent = `Página ${i} de ${doc.numPages}…`;
      const pag = await doc.getPage(i), vp = pag.getViewport({ scale: ancho / pag.getViewport({ scale: 1 }).width });
      const hoja = document.createElement('div'), c = document.createElement('canvas'), capa = document.createElement('div'), texto = await pag.getTextContent();
      hoja.className = 'hoja'; hoja.dataset.p = i; hoja.style.width = vp.width + 'px'; hoja.style.height = vp.height + 'px';
      c.width = Math.floor(vp.width * dpr); c.height = Math.floor(vp.height * dpr);
      c.setAttribute('aria-label', `${r.t}, página ${i}`); c.setAttribute('role', 'img');
      capa.className = 'textLayer'; capa.style.setProperty('--scale-factor', vp.scale);
      await pag.render({ canvasContext: c.getContext('2d'), viewport: vp, transform: dpr === 1 ? null : [dpr, 0, 0, dpr, 0, 0] }).promise;
      await pdfjsLib.renderTextLayer({ textContentSource: texto, container: capa, viewport: vp, textDivs: [] }).promise;
      if (esta !== lectura) return doc.destroy();
      hoja.append(c, capa);
      $('hojas').append(hoja);
      A.hojas.push(hoja); A.pags.push(texto.items.map((x) => x.str).join(' '));
      pintarMarcas(i);
      if (i === volverA) hoja.scrollIntoView({ block: 'start' });
    }
    await doc.destroy();
    $('estado').textContent = `${r.t} · ${doc.numPages} páginas · selecciona texto para subrayarlo`;
  } catch (e) { $('estado').textContent = e.message || 'No se ha podido abrir'; }
}

// pdf.js necesita su worker; desde otro dominio solo se puede crear a través de un blob
pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([`importScripts('${PDFJS}pdf.worker.min.js')`], { type: 'text/javascript' }));

$('form-entrar').onsubmit = async (e) => {
  e.preventDefault(); $('error').textContent = 'Comprobando…';
  try {
    yo = await entrar($('clave').value); $('clave').value = ''; $('error').textContent = '';
    try { sessionStorage.setItem('doodle-lector', JSON.stringify(yo)); } catch { /* sin almacenamiento: se pide otra vez */ }
    await cargarDatos(); registrar('entrada'); mostrar();
  } catch (err) { yo = null; $('error').textContent = err.message === 'Contraseña incorrecta' ? err.message : 'No se ha podido comprobar la contraseña'; }
};
$('salir').onclick = async () => { await subir(true); yo = D = A = null; lectura++; try { sessionStorage.removeItem('doodle-lector'); } catch { /* nada */ } $('hojas').innerHTML = ''; $('lector').hidden = true; mostrar(); };
for (const b of document.querySelectorAll('#pestanas button')) b.onclick = () => pestana(b.dataset.p);
try { yo = JSON.parse(sessionStorage.getItem('doodle-lector')); } catch { yo = null; }
if (yo && !('nk' in yo)) yo = null; // sesión de una versión anterior: se vuelve a pedir la contraseña
(yo ? cargarDatos() : Promise.resolve()).then(mostrar);

// Solo lectura. shortcut: frena descargas, copias y capturas casuales; una foto al móvil o las herramientas
// del navegador siguen pudiendo (sin marca de agua, a petición: leer es más cómodo).
const editable = (t) => t.closest?.('input, textarea');
const no = (e) => {
  if (editable(e.target)) return;
  if (e.type === 'selectstart' && e.target.closest?.('.textLayer')) return; // seleccionar para subrayar sí
  if (e.target.closest?.('#dentro') || e.type === 'contextmenu') e.preventDefault();
};
for (const t of ['contextmenu', 'dblclick', 'selectstart', 'dragstart', 'copy', 'cut']) document.addEventListener(t, no);
document.addEventListener('mousedown', (e) => { if (e.detail > 1 && !editable(e.target)) e.preventDefault(); }); // sin selección con doble clic
const tapar = (si) => document.body.classList.toggle('tapado', si);
document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(k)) e.preventDefault();
  if ((e.ctrlKey || e.metaKey) && ['c', 'a'].includes(k) && !editable(e.target)) e.preventDefault();
  if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey)) tapar(true);
});
document.addEventListener('keyup', (e) => {
  if (e.key !== 'PrintScreen') return;
  tapar(true); navigator.clipboard?.writeText('').catch(() => {});
  setTimeout(() => tapar(false), 1500);
});
addEventListener('blur', () => tapar(true));
addEventListener('focus', () => tapar(false));
document.addEventListener('visibilitychange', () => tapar(document.hidden));
addEventListener('beforeprint', () => tapar(true));
addEventListener('afterprint', () => tapar(false));
