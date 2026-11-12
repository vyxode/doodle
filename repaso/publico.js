// Resúmenes de solo lectura: cada persona tiene su contraseña, que abre su llave en llaves.json
// (dentro va su nombre y la clave de los PDF). Los PDF se descifran en memoria y se pintan en canvas
// con el nombre de quien lee encima; nunca hay un PDF que descargar.
// Registro: un Formulario de Google con dos preguntas de respuesta corta (nombre y qué abre).
const REGISTRO = { form: '', nombre: '', que: '' }; // form: https://docs.google.com/forms/d/e/<id>/formResponse, nombre/que: 'entry.123'
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const $ = (id) => document.getElementById(id);
const bytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const abrir = (clave, datos) => { const x = datos instanceof Uint8Array ? datos : new Uint8Array(datos); return crypto.subtle.decrypt({ name: 'AES-GCM', iv: x.subarray(0, 12) }, clave, x.subarray(12)); };
let yo = null; // { n: nombre, k: clave de los PDF en base64 }

const registrar = (que) => REGISTRO.form && fetch(REGISTRO.form, { method: 'POST', mode: 'no-cors', body: new URLSearchParams({ [REGISTRO.nombre]: yo.n, [REGISTRO.que]: que }) }).catch(() => {});

async function entrar(clave) {
  const L = await (await fetch('llaves.json', { cache: 'no-cache' })).json();
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(clave.trim()), 'PBKDF2', false, ['deriveKey']);
  const pk = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(L.sal), iterations: L.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  for (const l of L.llaves) {
    try { return JSON.parse(new TextDecoder().decode(await abrir(pk, bytes(l)))); } catch { /* no es su llave */ }
  }
  throw new Error('Contraseña incorrecta');
}

function mostrar() {
  $('entrada').hidden = !!yo; $('dentro').hidden = !yo;
  if (!yo) return;
  $('hola').textContent = 'Hola, ' + yo.n;
  $('docs').innerHTML = '';
  for (const [mod, lista] of Object.entries(window.RESUMENES || {})) for (const r of lista) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'boton'; b.textContent = `${mod} · ${r.t}`;
    b.onclick = () => leer(r);
    $('docs').append(b);
  }
}

function marca(ctx, w, h) {
  const txt = `${yo.n} · ${new Date().toLocaleDateString('es-ES')} · Doodle`;
  ctx.save();
  ctx.globalAlpha = 0.13; ctx.fillStyle = '#d44c47'; ctx.font = `600 ${Math.round(w / 28)}px sans-serif`;
  ctx.translate(w / 2, h / 2); ctx.rotate(-Math.PI / 6);
  const paso = w / 3;
  let fila = 0;
  for (let y = -h; y < h; y += paso / 1.6, fila++) for (let x = -w; x < w; x += paso * 1.4) ctx.fillText(txt, x + (fila % 2) * paso / 2, y);
  ctx.restore();
}

let lectura = 0; // cada clic empieza una lectura nueva; la anterior deja de pintar (si no, dos clics duplican las páginas)
async function leer(r) {
  const esta = ++lectura;
  $('hojas').innerHTML = ''; $('estado').textContent = 'Abriendo…';
  try {
    const k = await crypto.subtle.importKey('raw', bytes(yo.k), 'AES-GCM', false, ['decrypt']);
    const res = await fetch(r.f + '.enc', { cache: 'no-cache' });
    if (!res.ok) throw new Error('No se encuentra el resumen');
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await abrir(k, await res.arrayBuffer())) }).promise;
    if (esta !== lectura) return doc.destroy();
    registrar(r.t);
    const ancho = Math.min($('hojas').clientWidth || 800, 860) * Math.min(devicePixelRatio || 1, 2);
    for (let i = 1; i <= doc.numPages; i++) {
      $('estado').textContent = `Página ${i} de ${doc.numPages}…`;
      const pag = await doc.getPage(i), vp = pag.getViewport({ scale: ancho / pag.getViewport({ scale: 1 }).width });
      const c = document.createElement('canvas');
      c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
      c.setAttribute('aria-label', `${r.t}, página ${i}`); c.setAttribute('role', 'img');
      const ctx = c.getContext('2d');
      await pag.render({ canvasContext: ctx, viewport: vp }).promise;
      if (esta !== lectura) return doc.destroy();
      marca(ctx, c.width, c.height);
      $('hojas').append(c);
    }
    await doc.destroy();
    $('estado').textContent = `${r.t} · ${doc.numPages} páginas · solo lectura`;
  } catch (e) { $('estado').textContent = e.message || 'No se ha podido abrir'; }
}

// pdf.js necesita su worker; desde otro dominio solo se puede crear a través de un blob
pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([`importScripts('${PDFJS}pdf.worker.min.js')`], { type: 'text/javascript' }));

$('form-entrar').onsubmit = async (e) => {
  e.preventDefault(); $('error').textContent = 'Comprobando…';
  try {
    yo = await entrar($('clave').value); $('clave').value = ''; $('error').textContent = '';
    try { sessionStorage.setItem('doodle-lector', JSON.stringify(yo)); } catch { /* sin almacenamiento: se pide otra vez */ }
    registrar('entrada'); mostrar();
  } catch (err) { $('error').textContent = err.message === 'Contraseña incorrecta' ? err.message : 'No se ha podido comprobar la contraseña'; }
};
$('salir').onclick = () => { yo = null; lectura++; try { sessionStorage.removeItem('doodle-lector'); } catch { /* nada */ } $('hojas').innerHTML = ''; $('estado').textContent = ''; mostrar(); };
try { yo = JSON.parse(sessionStorage.getItem('doodle-lector')); } catch { yo = null; }
mostrar();

// Solo lectura. shortcut: frena descargas, copias y capturas casuales; una foto al móvil o las herramientas
// del navegador siguen pudiendo, por eso cada página lleva el nombre de quien la lee.
const no = (e) => { if (e.target.closest?.('#dentro') || e.type === 'contextmenu') e.preventDefault(); };
for (const t of ['contextmenu', 'dblclick', 'selectstart', 'dragstart', 'copy', 'cut']) document.addEventListener(t, no);
document.addEventListener('mousedown', (e) => { if (e.detail > 1) e.preventDefault(); }); // sin selección con doble clic
const tapar = (si) => document.body.classList.toggle('tapado', si);
document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'c', 'a', 'u'].includes(k)) e.preventDefault();
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
