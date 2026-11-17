// Resúmenes de solo lectura: cada persona tiene su contraseña, que abre su llave (en llaves.json o, si se registró con Google, en nube.gs)
// (dentro va su nombre y la clave de los PDF). Los PDF se descifran en memoria y se pintan en canvas;
// nunca hay un PDF que descargar. Encima van el subrayado y las notas (marcas.js) y el estudio (estudio.js).
// Lo de cada lector (subrayado, notas, fallos y resultados) se guarda cifrado con el secreto de su llave en la
// aplicación web de Apps Script de nube.gs, que también apunta quién entra; además queda copia en el navegador.
const NUBE = 'https://script.google.com/macros/s/AKfycbzj2gsQfRnNVXM5x4KDJvWXMyJwpRK-82KHzD5t9xKy_hOGThiUhHnkAuIu1TNf186VOg/exec'; // aplicación web de nube.gs
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const $ = (id) => document.getElementById(id);
const bytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)), b64 = (u) => btoa(String.fromCharCode(...u));
const abrir = (clave, datos) => { const x = datos instanceof Uint8Array ? datos : new Uint8Array(datos); return crypto.subtle.decrypt({ name: 'AES-GCM', iv: x.subarray(0, 12) }, clave, x.subarray(12)); };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
let yo = null; // { n: nombre, k: clave de los PDF, s: su secreto, nk: clave de sus datos, id: dónde se guardan }
let D = null; // sus datos: { ts, docs: { [f]: { marcas: [] } }, fallos: { [módulo]: { 'p:3': 1 } }, notas: [], borradas: { [marca]: 1 }, prog: { [ejercicio]: { c: código, ok, u } } }
let A = null; // el resumen abierto: { r, mod, pags: [texto por página], hojas: [div por página] }

const registrar = (que) => NUBE && yo.id && fetch(NUBE, { method: 'POST', body: JSON.stringify({ t: 'log', id: yo.id, n: yo.n, que }) }).catch(() => {});
const huella = async (txt) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt)))].map((x) => x.toString(16).padStart(2, '0')).join('');

// Dos sitios con llaves: llaves.json (las que das en Doodle; se prueban aquí) y la hoja de nube.gs (quien se registra
// con Google). Esas no se publican: de la contraseña salen una clave (abre su llave) y un verificador, que se manda
// a nube.gs; si coincide, devuelve su llave. Así nadie puede bajarse las llaves y probar contraseñas sin conexión.
const GOOGLE_ID = '707295569533-6fs54g7vdcduqpv7hfu93p09qql2kk1k.apps.googleusercontent.com'; // id de cliente OAuth de Google (web); vacío = sin «Iniciar sesión con Google»
const derivar = async (clave, sal, iter, uso) => crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(sal), iterations: iter, hash: 'SHA-256' },
  await crypto.subtle.importKey('raw', new TextEncoder().encode(clave.trim()), 'PBKDF2', false, ['deriveKey']), { name: 'AES-GCM', length: 256 }, false, [uso]);
// 512 bits de la contraseña: la primera mitad es la clave AES de su llave; de la segunda sale el verificador
async function deClave(clave, sal, iter) {
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: bytes(sal), iterations: iter, hash: 'SHA-256' },
    await crypto.subtle.importKey('raw', new TextEncoder().encode(clave.trim()), 'PBKDF2', false, ['deriveBits']), 512));
  return { aes: await crypto.subtle.importKey('raw', bits.slice(0, 32), 'AES-GCM', false, ['encrypt', 'decrypt']), v: await huella(b64(bits.slice(32)) + ':verificador') };
}
async function todasLasLlaves() {
  const L = await (await fetch('llaves.json', { cache: 'no-cache' })).json();
  const G = NUBE ? await fetch(NUBE + '?t=llaves', { cache: 'no-store' }).then((r) => r.json()).catch(() => null) : null;
  return { L, G: G && G.sal ? G : { migradas: [] } };
}
// las de llaves.json (lectores de antes, contraseñas que diste en Doodle)
async function llaveDeDoodle(clave, L) {
  if (!L.llaves.length) return null;
  const pk = await derivar(clave, L.sal, L.iter, 'decrypt');
  for (const l of L.llaves) { const llave = await abrir(pk, bytes(l)).then((d) => JSON.parse(new TextDecoder().decode(d)), () => null); if (llave) return llave; }
  return null;
}
// la clave y el sitio de sus datos salen de su secreto (aleatorio, el mismo aunque cambie la contraseña);
// las llaves de antes de los secretos no tienen: leen, pero no guardan hasta que se rehagan en Doodle
async function desdeLlave(llave) {
  if (!llave.s) return { ...llave, nk: null, id: null };
  const nk = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(llave.s + ':clave'));
  return { n: llave.n, k: llave.k, s: llave.s, nk: b64(new Uint8Array(nk)), id: await huella(llave.s + ':id') };
}
async function entrar(clave) {
  const T = await todasLasLlaves(), vieja = await llaveDeDoodle(clave, T.L);
  if (vieja) {
    const quien = await desdeLlave(vieja);
    if (quien.id && T.G.migradas.includes(await huella(quien.id))) throw new Error('Esa contraseña ya no vale: entra con la tuya o con Google');
    // lector de antes: tiene que poner su contraseña propia y vincular Google (si el registro con Google está activo)
    return { ...quien, antiguo: !!GOOGLE_ID && !!T.G.sal && !!quien.s };
  }
  if (!T.G.sal) throw new Error('Contraseña incorrecta');
  const { aes, v } = await deClave(clave, T.G.sal, T.G.iter), r = await (await fetch(NUBE, { method: 'POST', body: JSON.stringify({ t: 'entrar', v }) })).json();
  if (r.error) throw new Error(r.error);
  return desdeLlave(JSON.parse(new TextDecoder().decode(await abrir(aes, bytes(r.llave)))));
}

// ---------- Google: registrarse con el enlace, entrar si se olvida la contraseña y pasar a contraseña propia ----------
const codigoAlta = (() => { const m = location.hash.match(/alta=([\w-]+)/); if (m) { try { sessionStorage.setItem('doodle-alta', m[1]); } catch { /* nada */ } history.replaceState(null, '', location.pathname); } try { return m?.[1] || sessionStorage.getItem('doodle-alta'); } catch { return m?.[1]; } })();
let G = null; // { token, n, k, s } mientras elige nombre y contraseña
// este navegador ya entró con Google: al abrir la página se intenta entrar solo (sin guardar nada secreto)
const recuerdaGoogle = (si) => { try { if (si !== undefined) localStorage.setItem('doodle-google', si ? '1' : ''); return localStorage.getItem('doodle-google') === '1'; } catch { return false; } };
const pedir = async (cuerpo) => { const r = await (await fetch(NUBE, { method: 'POST', body: JSON.stringify(cuerpo) })).json(); if (r.error) throw new Error(r.error); return r; };
function botonGoogle(sitio) {
  if (!GOOGLE_ID || !NUBE) return;
  const oscuro = matchMedia('(prefers-color-scheme: dark)').matches;
  const pintar = () => {
    // auto_select: quien ya entró con Google en este navegador entra solo al abrir la página, sin contraseña
    google.accounts.id.initialize({ client_id: GOOGLE_ID, callback: (r) => conGoogle(r.credential), auto_select: true, cancel_on_tap_outside: true, use_fedcm_for_prompt: true, context: 'signin' });
    google.accounts.id.renderButton($(sitio), { theme: oscuro ? 'filled_black' : 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width: Math.min(366, $(sitio).clientWidth || 366), locale: 'es' });
    if (sitio === 'e-google' && !yo && (recuerdaGoogle() || codigoAlta)) google.accounts.id.prompt();
  };
  if (window.google?.accounts) return pintar();
  const sc = document.createElement('script'); sc.src = 'https://accounts.google.com/gsi/client'; sc.onload = pintar; document.head.append(sc);
}
async function conGoogle(token) {
  const err = yo?.antiguo ? $('m-error') : $('error');
  err.textContent = 'Comprobando con Google…'; err.classList.add('info');
  try {
    const r = await pedir({ t: 'google', token, codigo: codigoAlta, antiguo: yo?.antiguo ? { n: yo.n, s: yo.s } : undefined });
    G = { token, n: r.n || yo?.n || '', k: r.k, s: r.s };
    err.textContent = ''; err.classList.remove('info');
    recuerdaGoogle(true);
    if (r.existe && r.llave && !yo?.antiguo) return dentro(await desdeLlave(G)); // ya tenía cuenta: entra sin contraseña
    pantallaClave();
  } catch (e) { err.classList.remove('info'); err.textContent = e.message; }
}
function pantallaClave() {
  $('entrada').hidden = true; $('migrar').hidden = true; $('alta').hidden = false;
  $('a-nombre').value = G.n; $('a-nombre').closest('label').hidden = !!yo?.antiguo; $('a-paso').textContent = yo?.antiguo ? 'Paso 2 de 2' : 'Último paso';
  ($('a-nombre').closest('label').hidden || G.n ? $('a-clave') : $('a-nombre')).focus();
}
$('form-alta').onsubmit = async (e) => {
  e.preventDefault();
  const n = $('a-nombre').value.trim() || G.n, c = $('a-clave').value, c2 = $('a-clave2').value, err = $('a-error');
  if (c.trim().length < 8) return (err.textContent = 'La contraseña tiene que tener al menos 8 caracteres.');
  if (c !== c2) return (err.textContent = 'Las dos contraseñas no coinciden.');
  if (!n) return (err.textContent = 'Escribe tu nombre.');
  err.textContent = ''; $('b-alta').disabled = true; $('b-alta').textContent = 'Guardando…';
  try {
    // si su nombre es el de un lector de antes que aún no se ha pasado, se queda con su secreto (y sus notas)
    if (!yo?.antiguo) G.s = (await pedir({ t: 'nombre', token: G.token, n }).catch(() => ({ s: G.s }))).s || G.s; // sin esto en nube.gs: sigue como nuevo
    const T = await todasLasLlaves(), vieja = await llaveDeDoodle(c, T.L);
    // para entrar solo se usa la contraseña: no puede abrir la llave de otra persona (las de nube.gs lo comprueba nube.gs)
    if (vieja && vieja.s !== G.s) throw new Error('Esa contraseña no se puede usar: elige otra.');
    const iv = crypto.getRandomValues(new Uint8Array(12)), llave = { n, k: G.k, s: G.s }, { aes, v } = await deClave(c, T.G.sal, T.G.iter);
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, new TextEncoder().encode(JSON.stringify(llave))));
    await pedir({ t: 'llave', token: G.token, n, v, llave: b64(new Uint8Array([...iv, ...ct])) });
    $('a-clave').value = $('a-clave2').value = ''; err.textContent = '';
    try { sessionStorage.removeItem('doodle-alta'); } catch { /* nada */ }
    dentro(await desdeLlave(llave));
  } catch (e2) { err.textContent = e2.message; } finally { $('b-alta').disabled = false; $('b-alta').textContent = 'Guardar y entrar'; }
};
// requisito de longitud en vivo y botón para ver la contraseña
$('a-clave').addEventListener('input', (e) => { const ok = e.target.value.trim().length >= 8; $('a-req').classList.toggle('ok', ok); $('a-req').textContent = ok ? '✓ Longitud correcta' : 'Al menos 8 caracteres'; });
for (const b of document.querySelectorAll('[data-ver]')) b.onclick = () => { const i = $(b.dataset.ver), ver = i.type === 'password'; i.type = ver ? 'text' : 'password'; b.setAttribute('aria-pressed', ver); b.setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña'); i.focus(); };
async function dentro(quien) {
  yo = quien; G = null;
  try { sessionStorage.setItem('doodle-lector', JSON.stringify(yo)); } catch { /* sin almacenamiento: se pide otra vez */ }
  $('alta').hidden = $('migrar').hidden = true;
  if (yo.antiguo) { $('entrada').hidden = true; $('migrar').hidden = false; botonGoogle('m-google'); return; }
  await cargarDatos(); registrar('entrada'); mostrar();
}

// ---------- sus datos: copia en el navegador y en Apps Script; dos dispositivos se fusionan ----------
const claveDatos = () => crypto.subtle.importKey('raw', bytes(yo.nk), 'AES-GCM', false, ['encrypt', 'decrypt']);
const local = { get: () => { try { return localStorage.getItem('doodle-datos-' + yo.id); } catch { return null; } }, set: (v) => { try { localStorage.setItem('doodle-datos-' + yo.id, v); } catch { /* sin almacenamiento */ } } };
const vacio = () => ({ ts: 0, docs: {}, fallos: {}, notas: [], borradas: {}, prog: {} });
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
  // ejercicios de programación: el código más reciente de cada uno; superado, si lo está en cualquiera de los dos
  const prog = { ...a.prog };
  for (const [k, v] of Object.entries(b.prog || {})) { const x = prog[k]; prog[k] = !x || (v.u || 0) > (x.u || 0) ? { ...v, ok: v.ok || x?.ok } : { ...x, ok: x.ok || v.ok }; }
  return { ts: Math.max(a.ts, b.ts), docs, fallos: (a.ts >= b.ts ? a : b).fallos, notas, borradas, prog };
}
async function deLaNube() {
  if (!NUBE) return vacio();
  const r = await (await fetch(`${NUBE}?id=${yo.id}`, { cache: 'no-store' })).json();
  return descifrarDatos(r.d);
}
async function cargarDatos() {
  D = vacio();
  if (!yo.id) return nube('Tus notas no se guardarán hasta que te den la llave nueva');
  nube(NUBE ? 'Guardado' : 'En este navegador');
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
// estado del guardado, con su icono: va (guardando), ok, local (solo en este navegador) o mal
function nube(t, estado = /^Guardando/.test(t) ? 'va' : t === 'Guardado' ? 'ok' : /no válido|no se guardar/.test(t) ? 'mal' : 'local') {
  $('nube').className = 'nube ' + estado; $('nube').title = t;
  $('nube').innerHTML = ico(estado === 'ok' || estado === 'va' ? 'nube' : 'sinnube') + `<span>${esc(estado === 'local' ? 'En este navegador' : t)}</span>`;
}

// ---------- pantalla ----------
function mostrar() {
  $('entrada').hidden = !!yo; $('dentro').hidden = !yo; $('e-google').hidden = $('e-o').hidden = $('e-olvido').hidden = !GOOGLE_ID;
  if (!yo) return;
  $('hola').textContent = yo.n; $('avatar').parentNode.title = yo.n;
  $('avatar').textContent = yo.n.trim()[0]?.toUpperCase() || '·';
  $('docs').innerHTML = '';
  for (const [mod, lista] of Object.entries(window.RESUMENES || {})) for (const r of lista) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'doc'; b.setAttribute('aria-pressed', A?.r === r);
    b.innerHTML = `${ico('archivo')}<span><small>${esc(mod)}</small>${esc(r.t)}</span>`;
    b.onclick = () => { for (const x of $('docs').children) x.setAttribute('aria-pressed', x === b); leer(r, mod); };
    $('docs').append(b);
    fetch(r.f + '.enc', { method: 'HEAD', cache: 'no-cache' }).then((res) => { if (!res.ok) b.remove(); }, () => {}); // aún sin subir: no se enseña
  }
}
function pestana(p) {
  for (const b of document.querySelectorAll('#pestanas button')) b.setAttribute('aria-pressed', b.dataset.p === p);
  for (const s of document.querySelectorAll('.pestana')) s.hidden = s.id !== 'p-' + p;
  if (p !== 'leer') estudio(p);
}
function repintar() { A?.hojas.forEach((_, i) => pintarMarcas(i + 1)); if (A && !$('p-notas').hidden) verNotas(); if (!$('s-prog').hidden) window.verProgramacion?.(true); }
// claro u oscuro: por defecto, el del sistema; lo que elija se recuerda en este navegador (el <head> lo aplica antes de pintar)
const oscuroSistema = matchMedia('(prefers-color-scheme: dark)');
const temaActual = () => document.documentElement.dataset.theme || (oscuroSistema.matches ? 'dark' : 'light');
function pintarTema() {
  const o = temaActual() === 'dark';
  for (const b of document.querySelectorAll('.cambia-tema')) { b.innerHTML = ico(o ? 'sol' : 'luna'); b.title = o ? 'Modo claro' : 'Modo oscuro'; b.setAttribute('aria-label', b.title); }
}
for (const b of document.querySelectorAll('.cambia-tema')) b.onclick = () => {
  const t = temaActual() === 'dark' ? 'light' : 'dark', poner = () => { document.documentElement.dataset.theme = t; pintarTema(); };
  try { localStorage.setItem('repaso-tema', t); } catch {}
  document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches ? document.startViewTransition(poner) : poner();
};
oscuroSistema.addEventListener('change', pintarTema);
pintarTema();
// secciones de dentro: resúmenes o programación
function seccion(s) {
  for (const b of document.querySelectorAll('.secciones button')) b.setAttribute('aria-pressed', b.dataset.s === s);
  $('s-resumenes').hidden = s !== 'resumenes'; $('s-prog').hidden = s !== 'prog';
  if (s === 'prog') window.verProgramacion?.();
}
for (const b of document.querySelectorAll('.secciones button')) b.onclick = () => seccion(b.dataset.s);
// página que se está leyendo, en la barra de herramientas
let tPag = 0;
addEventListener('scroll', () => {
  if (tPag || !A?.hojas.length) return;
  tPag = requestAnimationFrame(() => {
    tPag = 0;
    const tope = $('dock').getBoundingClientRect().bottom + 20, n = A.hojas.findIndex((h) => h.getBoundingClientRect().bottom > tope) + 1;
    $('pagina').textContent = `${n || A.hojas.length} / ${A.total || A.hojas.length}`;
  });
}, { passive: true });
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
function irPagina(n) { $('resultados').innerHTML = ''; pestana('leer'); A.hojas[n - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

let lectura = 0; // cada clic empieza una lectura nueva; la anterior deja de pintar (si no, dos clics duplican las páginas)
async function leer(r, mod, volverA) {
  const esta = ++lectura;
  A = { r, mod, pags: [], hojas: [] };
  E = T = H = null; // lo de estudio era del resumen anterior
  A.ancho = $('hojas').clientWidth;
  $('lector').hidden = false; pestana('leer');
  $('hojas').innerHTML = ''; $('resultados').innerHTML = ''; $('buscar').value = ''; $('estado').textContent = 'Abriendo…';
  try {
    const k = await crypto.subtle.importKey('raw', bytes(yo.k), 'AES-GCM', false, ['decrypt']);
    const res = await fetch(r.f + '.enc', { cache: 'no-cache' });
    if (!res.ok) throw new Error('No se encuentra el resumen');
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await abrir(k, await res.arrayBuffer())) }).promise;
    if (esta !== lectura) return doc.destroy();
    registrar(r.t); A.total = doc.numPages; $('pagina').textContent = `1 / ${doc.numPages}`;
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
    $('estado').textContent = `${r.t} · ${doc.numPages} páginas · elige el rotulador y selecciona texto para subrayarlo`;
  } catch (e) { $('estado').textContent = e.message || 'No se ha podido abrir'; }
}

// pdf.js necesita su worker; desde otro dominio solo se puede crear a través de un blob
pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([`importScripts('${PDFJS}pdf.worker.min.js')`], { type: 'text/javascript' }));

$('form-entrar').onsubmit = async (e) => {
  e.preventDefault(); const b = $('b-entrar'); $('error').textContent = ''; b.disabled = true; b.textContent = 'Entrando…';
  try {
    const quien = await entrar($('clave').value); $('clave').value = '';
    await dentro(quien);
  } catch (err) {
    yo = null; $('clave').select();
    $('error').textContent = err.message === 'Contraseña incorrecta' ? 'Contraseña incorrecta. Revisa mayúsculas y espacios' + (GOOGLE_ID ? ', o entra con Google si la has olvidado.' : '.') : /^(Esa contraseña|Demasiados)/.test(err.message) ? err.message : 'No se ha podido comprobar la contraseña. Revisa tu conexión.';
  } finally { b.disabled = false; b.textContent = 'Entrar'; }
};
$('a-volver').onclick = () => { G = null; yo = null; $('alta').hidden = true; mostrar(); };
$('salir').onclick = async () => {
  await subir(true); yo = D = A = null; lectura++; try { sessionStorage.removeItem('doodle-lector'); } catch { /* nada */ }
  window.google?.accounts?.id.disableAutoSelect(); recuerdaGoogle(false); // al salir, no vuelve a entrar solo con Google
  $('hojas').innerHTML = ''; $('s-prog').innerHTML = ''; $('lector').hidden = true; seccion('resumenes'); mostrar();
};
for (const b of document.querySelectorAll('#pestanas button')) b.onclick = () => pestana(b.dataset.p);
try { yo = JSON.parse(sessionStorage.getItem('doodle-lector')); } catch { yo = null; }
if (yo && (!('nk' in yo) || yo.antiguo)) yo = null; // sesión de una versión anterior o a medio pasar: se vuelve a pedir
(yo ? cargarDatos() : Promise.resolve()).then(mostrar);
botonGoogle('e-google');
if (codigoAlta && GOOGLE_ID) $('e-alta').hidden = false;

// Solo lectura. shortcut: frena descargas, copias y capturas casuales; una foto al móvil o las herramientas
// del navegador siguen pudiendo (sin marca de agua, a petición: leer es más cómodo).
const editable = (t) => t.closest?.('input, textarea, .CodeMirror, #s-prog'); // escribir código sí se puede (seleccionar, copiar, pegar)
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
