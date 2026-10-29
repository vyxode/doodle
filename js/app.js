// Doodle: todo el curso de DAM en una web.
// - Aules: la web descarga tus datos desde tu navegador (token guardado cifrado en este dispositivo).
// - Todo se guarda cifrado con tu contraseña: en este navegador y, si configuras GitHub, en el repo
//   (data/curso.enc y data/progreso.enc) para tenerlo igual en todos tus dispositivos.
import { cifrar, descifrar } from './cripto.js';
import { descargarAules, raizAules } from './aules.js';

const D = 86400;
const URGENTE = 3 * D; // a menos de 3 días: en rojo
const VIEJO = 2 * 3600e3; // datos de Aules con más de 2 h: se actualizan al entrar
const ahora = () => Math.floor(Date.now() / 1000);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* idem */ } },
};
const app = document.getElementById('app');

const S = {
  pass: null, pat: null, aules: null, demo: false, curso: null, sobreCurso: null,
  prog: progVacio(), cfg: LS.get('doodle-cfg') || {},
  remoto: { sha: null, salt: null, shaCurso: null, estado: ['', ''] }, sync: '', sincronizando: false,
  filtro: { modulo: '' }, tabModulo: 'todo', mes: null, diaSel: null, recordar: false,
};
function progVacio() { return { ej: {}, tareas: {}, ejPropios: {} }; }
const guardarCfg = () => LS.set('doodle-cfg', S.cfg);
const aplicarTema = () => { document.documentElement.dataset.theme = S.cfg.tema === 'claro' ? 'light' : 'dark'; };
aplicarTema();

// ---------- formato ----------
const F = (o) => new Intl.DateTimeFormat('es-ES', o);
const F_DIA = F({ weekday: 'long', day: 'numeric', month: 'long' }), F_CORTA = F({ weekday: 'short', day: 'numeric', month: 'short' });
const F_HORA = F({ hour: '2-digit', minute: '2-digit' }), F_MES = F({ month: 'long', year: 'numeric' });
const fDia = (ts) => F_DIA.format(ts * 1000);
const fCorta = (ts) => (ts ? F_CORTA.format(ts * 1000) : '—');
const fHora = (ts) => F_HORA.format(ts * 1000);
const fNota = (n) => (n == null || isNaN(n) ? '—' : n.toLocaleString('es-ES', { minimumFractionDigits: n % 1 ? 1 : 0, maximumFractionDigits: 2 }));
function hace(ms) {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 1) return 'ahora mismo'; if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60); return h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} d`;
}
// Cuenta atrás compacta: "2d 5h", "5h 20m", "−1d 3h" si ya pasó.
function cuenta(ts) {
  const s = ts - ahora(), a = Math.abs(s), d = Math.floor(a / D), h = Math.floor((a % D) / 3600), m = Math.floor((a % 3600) / 60);
  return (s < 0 ? '−' : '') + (d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`);
}
const claveDia = (ts) => { const d = new Date(ts * 1000); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
const sinAcentos = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const nombreModulo = (n) => (n || '').replace(/^\s*[\dA-Z]{3,6}\s*[-–·:]\s*/, '');

// ---------- colores por módulo (automáticos; el rojo queda reservado para lo urgente) ----------
const PALETA = ['#3D8BFF', '#2ED47A', '#FFB020', '#B26BFF', '#FF5FA2', '#22D3C5', '#FF7A1A', '#D9D24A'];
function colorDe(modulo) {
  const i = cursos().findIndex((c) => nombreModulo(c.nombre) === modulo || sinAcentos(c.nombre).includes(sinAcentos(modulo)));
  if (i >= 0) return PALETA[i % PALETA.length];
  let h = 0; for (const ch of modulo || '') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETA[h % PALETA.length];
}

// ---------- datos derivados ----------
const cursos = () => (S.curso && S.curso.cursos) || [];
function tareas() {
  const out = [];
  for (const c of cursos()) for (const t of c.tareas) {
    out.push({ ...t, clave: 'a' + t.id, origen: 'aules', modulo: nombreModulo(c.nombre), cursoId: c.id,
      hecha: t.estado === 'submitted' || t.nota != null, nota10: t.nota != null && t.notaMax ? t.nota / t.notaMax * 10 : null });
  }
  for (const [id, t] of Object.entries(S.prog.tareas)) {
    if (t.borrado) continue;
    out.push({ ...t, clave: id, origen: 'propia', nota10: t.nota != null && t.nota !== '' ? t.nota / (t.max || 10) * 10 : null });
  }
  return out;
}
const urgente = (t) => !t.hecha && t.entrega && t.entrega - ahora() <= URGENTE;
function mediaCurso(c) {
  if (c.notaCurso && c.notaCurso.nota != null && c.notaCurso.max) return c.notaCurso.nota / c.notaCurso.max * 10;
  const ns = c.notas.filter((n) => n.nota != null && n.max).map((n) => n.nota / n.max * 10);
  return ns.length ? ns.reduce((a, b) => a + b) / ns.length : null;
}
function catalogo() {
  const out = [];
  for (const m of window.EJERCICIOS || []) for (const e of m.ejercicios) out.push({ ...e, modulo: m.modulo, lenguaje: e.lenguaje || m.lenguaje });
  for (const [id, e] of Object.entries(S.prog.ejPropios)) if (!e.borrado) out.push({ ...e, id, propio: true });
  return out;
}
const modulosCatalogo = () => [...new Set(catalogo().map((e) => e.modulo))];
const cursoDeModulo = (m) => cursos().find((c) => sinAcentos(c.nombre).includes(sinAcentos(m)));
const hecho = (e) => !!(S.prog.ej[e.id] || {}).hecho;
function estadoTarea(t) {
  if (t.hecha) return t.nota10 != null ? ['ok', fNota(t.nota10) + ' / 10'] : ['ok', 'Entregada'];
  if (t.entrega && t.entrega < ahora()) return ['mal', 'Sin entregar'];
  if (t.estado === 'draft') return ['ojo', 'Borrador'];
  return [urgente(t) ? 'mal' : 'info', t.tipo === 'examen' ? 'Examen' : 'Pendiente'];
}
function agenda() {
  const items = tareas().filter((t) => t.entrega).map((t) => ({ fecha: t.entrega, nombre: t.nombre, modulo: t.modulo, url: t.url, tarea: t, chip: estadoTarea(t) }));
  const porId = Object.fromEntries(cursos().map((c) => [c.id, nombreModulo(c.nombre)]));
  for (const e of (S.curso && S.curso.eventos) || []) {
    if (e.tipo === 'assign') continue; // ya salen como tareas
    items.push({ fecha: e.fecha, nombre: e.nombre, modulo: porId[e.curso] || '', url: e.url, chip: ['info', e.tipo === 'quiz' ? 'Cuestionario' : 'Evento'] });
  }
  return items.sort((a, b) => a.fecha - b.fecha);
}

// ---------- guardado: local + GitHub ----------
function mezclar(a, b) {
  const out = progVacio();
  for (const sec of Object.keys(out)) {
    out[sec] = { ...((a && a[sec]) || {}) };
    for (const [k, v] of Object.entries((b && b[sec]) || {})) if (!out[sec][k] || (v.t || 0) > (out[sec][k].t || 0)) out[sec][k] = v;
  }
  return out;
}
let tLocal, tRemoto;
function cambiar(sec, id, cambio) {
  S.prog[sec][id] = { ...S.prog[sec][id], ...cambio, t: Date.now() };
  clearTimeout(tLocal); tLocal = setTimeout(guardarLocal, 600);
  if (S.pat && !S.demo) { clearTimeout(tRemoto); tRemoto = setTimeout(() => subirProgreso().catch(errSync), 4000); estadoSync('Guardando…', 'ambar'); }
}
async function guardarLocal() {
  if (S.demo) return LS.set('doodle-prog-demo', S.prog);
  const prev = LS.get('doodle-prog');
  LS.set('doodle-prog', await cifrar(S.pass, S.prog, prev && prev.salt));
}

function repo() {
  const h = location.hostname;
  if (h.endsWith('.github.io')) return h.split('.')[0] + '/' + (location.pathname.split('/')[1] || h);
  return S.cfg.repo || '';
}
async function gh(ruta, opt = {}) {
  const r = await fetch('https://api.github.com/repos/' + repo() + ruta, {
    cache: 'no-store', ...opt,
    headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + S.pat, ...(opt.body ? { 'Content-Type': 'application/json' } : {}) },
  });
  if (r.status === 401) throw new Error('GitHub rechaza la clave. Revisa la clave de GitHub en Ajustes.');
  return r;
}
async function leerArchivo(ruta) {
  const r = await gh('/contents/' + ruta);
  if (r.status === 404) return { sha: null, sobre: null };
  if (!r.ok) throw new Error('GitHub respondió ' + r.status + ' al leer ' + ruta + '.');
  const j = await r.json();
  // más de 1 MB: la API no trae el contenido y hay que pedirlo aparte
  const crudo = j.content ? atob(j.content.replace(/\n/g, '')) : await (await fetch(j.download_url, { cache: 'no-store' })).text();
  return { sha: j.sha, sobre: JSON.parse(crudo) };
}
async function escribirArchivo(ruta, sobre, sha) {
  const r = await gh('/contents/' + ruta, { method: 'PUT', body: JSON.stringify({ message: 'Doodle: ' + ruta.split('/').pop() + ' ' + new Date().toISOString().slice(0, 16), content: btoa(JSON.stringify(sobre)), ...(sha ? { sha } : {}) }) });
  if (r.status === 409 || r.status === 422) return null; // otro dispositivo escribió antes
  if (!r.ok) throw new Error('GitHub respondió ' + r.status + ' al guardar ' + ruta + '.');
  return (await r.json()).content.sha;
}
async function bajarProgreso() {
  const { sha, sobre } = await leerArchivo('data/progreso.enc');
  S.remoto.sha = sha; if (!sobre) return null;
  S.remoto.salt = sobre.salt;
  try { return await descifrar(S.pass, sobre); } catch (e) { throw new Error('El progreso guardado en GitHub usa otra contraseña.'); }
}
async function subirProgreso(reintento) {
  const sobre = await cifrar(S.pass, S.prog, S.remoto.salt);
  S.remoto.salt = sobre.salt;
  const sha = await escribirArchivo('data/progreso.enc', sobre, S.remoto.sha);
  if (!sha) {
    if (reintento) throw new Error('No se pudo guardar el progreso en GitHub; se reintentará con el próximo cambio.');
    const rem = await bajarProgreso(); if (rem) S.prog = mezclar(S.prog, rem);
    return subirProgreso(true);
  }
  S.remoto.sha = sha; estadoSync('Sincronizado', 'si');
}
async function subirCurso(sobre) {
  for (let i = 0; i < 2; i++) {
    if (!S.remoto.shaCurso) S.remoto.shaCurso = (await leerArchivo('data/curso.enc')).sha;
    const sha = await escribirArchivo('data/curso.enc', sobre, S.remoto.shaCurso);
    if (sha) { S.remoto.shaCurso = sha; return; }
    S.remoto.shaCurso = null; // sha antiguo: se vuelve a leer y se sobrescribe (lo nuevo manda)
  }
}
function errSync(e) { estadoSync(e.message, 'no'); }
function estadoSync(txt, ok) { S.remoto.estado = [txt, ok]; pintarEstado(); }

// Descarga Aules desde este navegador, lo guarda cifrado aquí y, si hay GitHub, en el repo.
async function sincronizarAules() {
  if (!S.aules || S.sincronizando) return;
  S.sincronizando = true; S.sync = 'Descargando de Aules…'; pintarEstado();
  try {
    const curso = await descargarAules(S.aules.url, S.aules.token);
    S.curso = curso;
    const sobre = await cifrar(S.pass, curso);
    LS.set('doodle-curso', sobre);
    S.sync = '';
    render();
    if (S.pat) { S.sync = 'Subiendo a GitHub…'; pintarEstado(); await subirCurso(sobre); S.sync = ''; }
  } catch (e) { S.sync = e.message; }
  finally { S.sincronizando = false; pintarEstado(); }
}

// ---------- entrada ----------
async function arrancar() {
  try { const r = await fetch('data/curso.enc', { cache: 'no-store' }); if (r.ok) S.sobreCurso = await r.json(); } catch (e) { /* aún no publicado */ }
  const hayAlgo = S.sobreCurso || LS.get('doodle-curso') || LS.get('doodle-prog');
  if (!hayAlgo && !location.hostname.endsWith('.github.io')) return entrarDemo(); // vista previa fuera de GitHub Pages
  const recordada = LS.get('doodle-recordar');
  if (recordada) { try { return await entrar(recordada); } catch (e) { LS.del('doodle-recordar'); } }
  pintarBloqueo();
}
async function masNuevo(pass, sobres) {
  let mejor = null;
  for (const s of sobres) if (s) { const c = await descifrar(pass, s); if (!mejor || (c.generado || '') > (mejor.generado || '')) mejor = c; }
  return mejor;
}
async function entrar(pass) {
  const curso = await masNuevo(pass, [S.sobreCurso, LS.get('doodle-curso')]); // lanza error si la contraseña no es la buena
  const local = LS.get('doodle-prog');
  S.prog = local ? mezclar(progVacio(), await descifrar(pass, local)) : progVacio();
  S.pass = pass; S.curso = curso || { cursos: [], eventos: [], avisos: [] }; S.demo = false;
  S.pat = S.cfg.patSobre ? (await descifrar(pass, S.cfg.patSobre).catch(() => ({}))).pat || null : null;
  S.aules = S.cfg.aulesSobre ? await descifrar(pass, S.cfg.aulesSobre).catch(() => null) : null;
  if (S.recordar) { LS.set('doodle-recordar', pass); S.recordar = false; }
  render();
  if (S.pat) {
    estadoSync('Leyendo GitHub…', 'ambar');
    try {
      const rem = await bajarProgreso(); if (rem) { S.prog = mezclar(S.prog, rem); guardarLocal(); }
      const c = await leerArchivo('data/curso.enc'); S.remoto.shaCurso = c.sha;
      if (c.sobre) { const nuevo = await masNuevo(pass, [c.sobre]); if ((nuevo.generado || '') > (S.curso.generado || '')) { S.curso = nuevo; LS.set('doodle-curso', c.sobre); } }
      estadoSync('Sincronizado', 'si'); render();
    } catch (e) { errSync(e); }
  }
  if (S.aules && (!S.curso.generado || Date.now() - Date.parse(S.curso.generado) > VIEJO)) sincronizarAules();
}
function entrarDemo() {
  const curso = JSON.parse(JSON.stringify(window.DEMO));
  const delta = ahora() - Math.floor(Date.parse(curso.generado) / 1000); // las fechas de ejemplo se mueven a hoy
  (function mover(o) { for (const [k, v] of Object.entries(o)) { if (v && typeof v === 'object') mover(v); else if (['entrega', 'apertura', 'enviada', 'fecha'].includes(k) && v > 0) o[k] = v + delta; } })(curso);
  curso.generado = new Date(Date.now() - 40 * 60e3).toISOString();
  S.demo = true; S.curso = curso; S.pass = S.pat = S.aules = null;
  S.prog = mezclar(progVacio(), LS.get('doodle-prog-demo'));
  render();
}

const LOGO = '<span class="logo" aria-label="Doodle">DOOD<b>LE</b></span>';
function pintarBloqueo(error) {
  const hay = S.sobreCurso || LS.get('doodle-curso') || LS.get('doodle-prog');
  app.innerHTML = `
  <div class="bloqueo trama"><form class="tarjeta-bloqueo corte" id="f-entrar">
    <div class="lineas-velocidad" aria-hidden="true"></div>
    ${LOGO}
    <p class="suave">${hay ? 'Tu curso está cifrado. Escribe tu contraseña para abrirlo.' : 'Primera vez aquí: elige una contraseña. Con ella se cifran tus datos en este dispositivo.'}</p>
    <label class="campo"><span>Contraseña</span><input type="password" id="pass" autocomplete="current-password" required autofocus></label>
    <label class="casilla"><input type="checkbox" id="recordar"> Recordarla en este dispositivo (solo si es tuyo)</label>
    ${error ? `<p class="error-txt" role="alert">${esc(error)}</p>` : ''}
    <div class="fila-botones"><button class="boton principal" id="b-entrar">Entrar</button>
    <button type="button" class="boton" id="b-demo">Ver con datos de ejemplo</button></div>
  </form></div>`;
  document.getElementById('f-entrar').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const b = document.getElementById('b-entrar');
    S.recordar = document.getElementById('recordar').checked;
    b.disabled = true; b.textContent = 'Abriendo…';
    try { await entrar(document.getElementById('pass').value); }
    catch (e) { S.recordar = false; pintarBloqueo('Contraseña incorrecta.'); }
  });
  document.getElementById('b-demo').addEventListener('click', entrarDemo);
}

// ---------- marco: barra lateral (PC) y barra inferior (móvil) ----------
const IC = {
  inicio: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  modulos: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  calendario: '<path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5"/>',
  ejercicios: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  notas: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  ajustes: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  mas: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
};
const icono = (n) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const NAV = [['inicio', 'Inicio'], ['modulos', 'Módulos'], ['calendario', 'Calendario'], ['ejercicios', 'Ejercicios'], ['notas', 'Notas'], ['ajustes', 'Ajustes']];
const NAV_MOVIL = [['inicio', 'Inicio'], ['modulos', 'Módulos'], ['calendario', 'Calendario'], ['ejercicios', 'Ejercicios'], ['mas', 'Más']];

function render() {
  const v = location.hash.slice(1) || 'inicio';
  const base = v.startsWith('modulo-') ? 'modulos' : v;
  const baseMovil = ['notas', 'ajustes'].includes(base) ? 'mas' : base;
  app.innerHTML = `
  <div class="marco">
    <aside class="lateral">
      <a href="#inicio" class="lateral-logo">${LOGO}<small>DAM · 1.º</small></a>
      <nav aria-label="Secciones">${NAV.map(([id, t]) => `<a href="#${id}" ${id === base ? 'aria-current="page"' : ''}>${icono(id)}<span>${t}</span></a>`).join('')}</nav>
      <div class="lateral-pie" id="estado-pc"></div>
    </aside>
    <div class="principal">
      <header class="barra-sup">${LOGO}<div class="estado-movil" id="estado-movil"></div></header>
      ${S.demo ? '<div class="demo-banda">Datos de ejemplo · nada de esto es tuyo · <a href="#" id="salir-demo">Salir</a></div>' : ''}
      <main class="vista" id="vista"></main>
    </div>
    <nav class="inferior" aria-label="Secciones">${NAV_MOVIL.map(([id, t]) => `<a href="#${id}" ${id === baseMovil ? 'aria-current="page"' : ''}>${icono(id)}<span>${t}</span></a>`).join('')}</nav>
  </div>`;
  pintarEstado();
  const vista = document.getElementById('vista');
  vista.innerHTML = v.startsWith('modulo-') ? vistaModulo(+v.slice(7))
    : ({ inicio: vistaInicio, modulos: vistaModulos, calendario: vistaCalendario, notas: vistaNotas, ejercicios: vistaEjercicios, ajustes: vistaAjustes, mas: vistaMas }[v] || vistaInicio)();
  const sd = document.getElementById('salir-demo');
  if (sd) sd.addEventListener('click', (ev) => { ev.preventDefault(); S.demo = false; S.curso = null; location.hash = ''; pintarBloqueo(); });
}
function pintarEstado() {
  const g = S.curso && S.curso.generado;
  const ok = !g ? 'no' : Date.now() - Date.parse(g) < 12 * 3600e3 ? 'si' : 'ambar';
  const html = `
    <span class="punto" data-ok="${S.sincronizando ? 'ambar' : ok}">${esc(S.sync || (g ? 'Aules ' + hace(Date.parse(g)) : S.aules ? 'Sin datos de Aules' : 'Aules sin conectar'))}</span>
    ${S.pat ? `<span class="punto" data-ok="${esc(S.remoto.estado[1])}">${esc(S.remoto.estado[0] || 'GitHub')}</span>` : ''}
    ${S.aules ? `<button class="boton mini" data-acc="sync" ${S.sincronizando ? 'disabled' : ''} title="Sincronizar con Aules">${icono('sync')}<span>Sincronizar</span></button>` : ''}`;
  for (const id of ['estado-pc', 'estado-movil']) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
}
window.addEventListener('hashchange', () => { if (S.curso) { render(); window.scrollTo(0, 0); } });

// ---------- piezas ----------
const cabecera = (titulo, extra = '', ante = '') => `<header class="cab-vista">${ante ? `<span class="antetitulo">${ante}</span>` : ''}<h1>${titulo}</h1>${extra ? `<div class="cab-extra">${extra}</div>` : ''}</header>`;
const cifra = (valor, texto, clase = '') => `<div class="cifra corte ${clase}"><b>${valor}</b><small>${texto}</small></div>`;
const vacio = (t) => `<p class="vacio">${t}</p>`;
function fila(i, conFecha = true) {
  const t = i.tarea, urg = t ? urgente(t) : false, pasada = t && !t.hecha && i.fecha < ahora();
  const titulo = i.url ? `<a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.nombre)}</a>` : `<strong>${esc(i.nombre)}</strong>`;
  const propia = t && t.origen === 'propia' ? `
    <div class="fila-propia">
      <label class="casilla"><input type="checkbox" data-acc="hecha" data-id="${esc(t.clave)}" ${t.hecha ? 'checked' : ''}> Hecha</label>
      <label class="casilla">Nota <input type="number" min="0" step="0.01" class="nota-in" data-acc="nota" data-id="${esc(t.clave)}" value="${t.nota ?? ''}"> / ${t.max || 10}</label>
      <button class="boton mini peligro" data-acc="borrar-tarea" data-id="${esc(t.clave)}">Borrar</button>
    </div>` : '';
  return `<div class="fila corte ${urg ? 'urgente' : ''} ${t && t.hecha ? 'hecha' : ''}" style="--mod:${colorDe(i.modulo)}">
    <span class="cuando">${t && !t.hecha ? `<b class="${pasada ? 'pasada' : ''}">${cuenta(i.fecha)}</b>` : ''}${conFecha ? `<small>${fCorta(i.fecha)} · ${fHora(i.fecha)}</small>` : `<small>${fHora(i.fecha)}</small>`}</span>
    <div class="que">${titulo}<small><i class="punto-mod"></i>${esc(i.modulo || '—')}${t && t.origen === 'propia' ? ' · tuya' : ''}</small>${propia}</div>
    <span class="chip ${i.chip[0]}">${esc(i.chip[1])}</span>
  </div>`;
}
function barras(filas) { // [nombre, nota/10, color]
  if (!filas.length) return vacio('Aún no hay notas.');
  return `<div class="barras corte" role="img" aria-label="Notas sobre 10">
    ${filas.map(([n, v, c]) => `<div class="b-fila"><span class="b-nombre" title="${esc(n)}">${esc(n)}</span>
      <div class="b-pista"><i style="width:${Math.max(0, Math.min(10, v)) * 10}%;--mod:${c}"></i></div><b class="${v < 5 ? 'susp' : ''}">${fNota(v)}</b></div>`).join('')}
    <div class="b-eje" aria-hidden="true"><span></span><div><span>0</span><span>5</span><span>10</span></div><span></span></div>
  </div>`;
}
const notaColor = (m) => (m == null ? 'var(--suave)' : m >= 5 ? 'var(--texto)' : 'var(--rojo)');

// ---------- vistas ----------
function vistaInicio() {
  const T = tareas(), h = ahora(), ag = agenda();
  const urg = ag.filter((i) => i.tarea && urgente(i.tarea));
  const proximas = ag.filter((i) => i.fecha >= h && i.fecha <= h + 14 * D && !(i.tarea && (i.tarea.hecha || urgente(i.tarea))));
  const medias = cursos().map(mediaCurso).filter((m) => m != null);
  const cat = catalogo();
  const notas = T.filter((t) => t.nota10 != null).sort((a, b) => (b.entrega || 0) - (a.entrega || 0)).slice(0, 6);
  return `
  ${cabecera('Inicio', `<span class="suave">${fDia(h)}</span>`)}
  <section class="bloque bloque-urgente corte">
    <div class="lineas-velocidad" aria-hidden="true"></div>
    <header><h2>Urgente</h2><span class="chip ${urg.length ? 'mal' : 'ok'}">${urg.length ? urg.length + (urg.length === 1 ? ' entrega' : ' entregas') : 'Todo bajo control'}</span></header>
    <div class="lista">${urg.length ? urg.map((i) => fila(i)).join('') : vacio('Nada vence en los próximos 3 días.')}</div>
  </section>
  <div class="cifras">
    ${cifra(medias.length ? fNota(medias.reduce((a, b) => a + b) / medias.length) : '—', 'Media general / 10')}
    ${cifra(`${T.filter((t) => t.hecha).length}<span>/${T.length}</span>`, 'Tareas entregadas')}
    ${cifra(`${T.filter((t) => !t.hecha && t.entrega >= h).length}`, 'Pendientes')}
    ${cifra(`${cat.filter(hecho).length}<span>/${cat.length}</span>`, 'Ejercicios hechos')}
  </div>
  <div class="dos-col">
    <section class="bloque"><header><h2>Próximos 14 días</h2><a href="#calendario">Calendario</a></header>
      <div class="lista">${proximas.length ? proximas.map((i) => fila(i)).join('') : vacio('Nada más programado.')}</div></section>
    <div class="columna">
      <section class="bloque"><header><h2>Módulos</h2><a href="#modulos">Ver todos</a></header>
        ${cursos().length ? `<div class="mini-mods">${cursos().map((c) => { const m = mediaCurso(c), pend = T.filter((t) => t.cursoId === c.id && !t.hecha).length;
          return `<a class="mini-mod" href="#modulo-${c.id}" style="--mod:${colorDe(nombreModulo(c.nombre))}"><i class="punto-mod"></i><span class="mm-nombre">${esc(nombreModulo(c.nombre))}</span>
            <span class="mm-pend ${pend ? '' : 'suave'}">${pend ? pend + ' pend.' : 'al día'}</span><b style="color:${notaColor(m)}">${fNota(m)}</b></a>`; }).join('')}</div>`
        : vacio('Conecta Aules en <a href="#ajustes">Ajustes</a> para ver tus módulos.')}</section>
      <section class="bloque"><header><h2>Últimas notas</h2><a href="#notas">Todas</a></header>
        ${notas.length ? `<div class="lista">${notas.map((t) => `<div class="nota-fila" style="--mod:${colorDe(t.modulo)}"><i class="punto-mod"></i><span class="nf-nombre">${esc(t.nombre)}<small>${esc(t.modulo)}</small></span><b class="${t.nota10 < 5 ? 'susp' : ''}">${fNota(t.nota10)}</b></div>`).join('')}</div>` : vacio('Aún no hay notas.')}</section>
    </div>
  </div>
  ${(S.curso.avisos || []).length ? `<section class="bloque"><header><h2>Avisos de Aules</h2></header><div class="panel corte"><p class="suave">Aules no dejó leer estas partes; el resto está al día.</p><ul class="mono">${S.curso.avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div></section>` : ''}`;
}

function vistaModulos() {
  if (!cursos().length) return cabecera('Módulos') + vacio('Cuando conectes Aules en <a href="#ajustes">Ajustes</a>, aquí aparecerán tus módulos.');
  const T = tareas();
  return cabecera('Módulos', `<span class="suave">${cursos().length} en Aules</span>`) + `<div class="modulos">
    ${cursos().map((c) => {
      const m = mediaCurso(c), ts = T.filter((t) => t.cursoId === c.id), pend = ts.filter((t) => !t.hecha), urg = pend.filter(urgente).length;
      return `<a class="modulo corte trama-esquina" href="#modulo-${c.id}" style="--mod:${colorDe(nombreModulo(c.nombre))}">
        <span class="codigo">${esc(c.corto)}</span><h3>${esc(nombreModulo(c.nombre))}</h3>
        <div class="mod-nota"><b style="color:${notaColor(m)}">${fNota(m)}</b><small>/ 10</small></div>
        <div class="barra"><i style="width:${ts.length ? (ts.length - pend.length) / ts.length * 100 : 0}%"></i></div>
        <div class="mod-pie"><span>${ts.length - pend.length}/${ts.length} entregadas</span>${urg ? `<span class="chip mal">${urg} urgente${urg > 1 ? 's' : ''}</span>` : pend.length ? `<span class="chip info">${pend.length} pendiente${pend.length > 1 ? 's' : ''}</span>` : '<span class="chip ok">Al día</span>'}</div>
      </a>`;
    }).join('')}</div>`;
}

const TABS_MOD = [['todo', 'Todo'], ['tareas', 'Tareas'], ['notas', 'Notas'], ['contenido', 'Contenido'], ['ejercicios', 'Ejercicios']];
const TIPOS = { resource: 'archivo', assign: 'tarea', quiz: 'cuestionario', forum: 'foro', url: 'enlace', page: 'página', folder: 'carpeta', label: 'etiqueta', h5pactivity: 'H5P', choice: 'consulta', lesson: 'lección', workshop: 'taller', glossary: 'glosario', feedback: 'encuesta', book: 'libro', scorm: 'SCORM' };
function vistaModulo(id) {
  const c = cursos().find((x) => x.id === id);
  if (!c) return cabecera('Módulo') + vacio('Ese módulo no está en los datos de Aules. <a href="#modulos">Volver</a>');
  const nombre = nombreModulo(c.nombre), color = colorDe(nombre), tab = S.tabModulo;
  const ts = tareas().filter((t) => t.cursoId === id).sort((a, b) => (a.entrega || 9e9) - (b.entrega || 9e9));
  const mod = modulosCatalogo().find((m) => cursoDeModulo(m) === c);
  const secTareas = `<section class="bloque"><header><h2>Tareas</h2><span class="suave">${ts.filter((t) => t.hecha).length}/${ts.length} entregadas</span></header>
    ${ts.length ? `<div class="lista">${ts.map((t) => fila({ fecha: t.entrega, nombre: t.nombre, modulo: nombre, url: t.url, tarea: t, chip: estadoTarea(t) })).join('')}</div>` : vacio('Este módulo no tiene tareas en Aules.')}</section>`;
  const conNota = c.notas.filter((n) => n.nota != null && n.max);
  const secNotas = `<section class="bloque"><header><h2>Calificaciones</h2><span class="suave">Media ${fNota(mediaCurso(c))} / 10</span></header>
    ${barras(conNota.map((n) => [n.nombre, n.nota / n.max * 10, color]))}
    ${c.notas.some((n) => n.comentario) ? `<div class="lista">${c.notas.filter((n) => n.comentario).map((n) => `<div class="panel corte"><b>${esc(n.nombre)}</b><p class="suave pre">${esc(n.comentario)}</p></div>`).join('')}</div>` : ''}</section>`;
  const secContenido = `<section class="bloque"><header><h2>Contenido</h2><a href="${esc(c.url)}" target="_blank" rel="noopener">Abrir en Aules ↗</a></header>
    ${c.secciones.filter((s) => s.elementos.length || s.resumen).map((s, i, arr) => `<details class="seccion corte" ${i === arr.length - 1 ? 'open' : ''}><summary>${esc(s.nombre || 'General')} <span class="suave">· ${s.elementos.length}</span></summary>
      ${s.resumen ? `<p class="suave pre">${esc(s.resumen)}</p>` : ''}
      <ul>${s.elementos.map((e) => `<li>${e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.nombre)}</a>` : esc(e.nombre)} <small>· ${esc(TIPOS[e.tipo] || e.tipo)}${e.archivos.length ? ' · ' + esc(e.archivos.join(', ')) : ''}</small></li>`).join('')}</ul>
    </details>`).join('') || vacio('Sin contenido.')}</section>`;
  const secEj = `<section class="bloque"><header><h2>Ejercicios</h2>${mod ? `<a href="#ejercicios" data-acc="ir-ejercicios" data-modulo="${esc(mod)}">Abrir en Ejercicios</a>` : ''}</header>
    ${mod ? listaEjercicios(mod) : vacio('Aún no hay ejercicios de este módulo. Añádelos desde <a href="#ejercicios">Ejercicios</a>.')}</section>`;
  const cuerpo = { tareas: secTareas, notas: secNotas, contenido: secContenido, ejercicios: secEj }[tab]
    || `<div class="cifras">${cifra(fNota(mediaCurso(c)), 'Media / 10')}${cifra(`${ts.filter((t) => t.hecha).length}<span>/${ts.length}</span>`, 'Entregadas')}${cifra(ts.filter(urgente).length, 'Urgentes', ts.some(urgente) ? 'alerta' : '')}${c.progreso != null ? cifra(Math.round(c.progreso) + '%', 'Progreso en Aules') : ''}</div>` + secTareas + secNotas + secContenido + (mod ? secEj : '');
  return `<div class="cab-modulo corte trama-esquina" style="--mod:${color}">
      <a href="#modulos" class="antetitulo">← Módulos · ${esc(c.corto)}</a><h1>${esc(nombre)}</h1>
      <a class="boton mini" href="${esc(c.url)}" target="_blank" rel="noopener">Aules ↗</a></div>
    <div class="tabs" role="tablist">${TABS_MOD.map(([k, t]) => `<button type="button" role="tab" data-acc="tab-mod" data-v="${k}" aria-selected="${k === tab}">${t}</button>`).join('')}</div>
    ${cuerpo}`;
}

function vistaCalendario() {
  const hoy = new Date();
  if (!S.mes) S.mes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  if (!S.diaSel) S.diaSel = claveDia(ahora());
  const y = S.mes.getFullYear(), mo = S.mes.getMonth();
  const hueco = (new Date(y, mo, 1).getDay() + 6) % 7, dias = new Date(y, mo + 1, 0).getDate();
  const porDia = {};
  for (const i of agenda()) (porDia[claveDia(i.fecha)] = porDia[claveDia(i.fecha)] || []).push(i);
  const kHoy = claveDia(ahora());
  let celdas = '';
  for (let k = 0; k < hueco; k++) celdas += '<span class="dia-cal vacio-cal"></span>';
  for (let d = 1; d <= dias; d++) {
    const k = y * 10000 + (mo + 1) * 100 + d, its = porDia[k] || [];
    celdas += `<button type="button" class="dia-cal ${k === kHoy ? 'hoy' : ''} ${k === S.diaSel ? 'sel' : ''} ${its.some((i) => i.tarea && urgente(i.tarea)) ? 'con-urgente' : ''}" data-acc="dia" data-v="${k}" aria-label="${d}${its.length ? ', ' + its.length + ' cosas' : ''}">
      <span>${d}</span><span class="puntos">${its.slice(0, 4).map((i) => `<i style="--mod:${colorDe(i.modulo)}" class="${i.tarea && i.tarea.hecha ? 'tenue' : ''}"></i>`).join('')}</span></button>`;
  }
  const sel = porDia[S.diaSel] || [];
  const selFecha = new Date(Math.floor(S.diaSel / 10000), Math.floor(S.diaSel / 100) % 100 - 1, S.diaSel % 100, 12);
  const mods = [...new Set([...cursos().map((c) => nombreModulo(c.nombre)), ...modulosCatalogo()])];
  const proximas = agenda().filter((i) => i.fecha >= ahora() && i.fecha <= ahora() + 7 * D && !(i.tarea && i.tarea.hecha));
  return `${cabecera('Calendario')}
  <div class="cal-layout">
    <section class="calendario corte">
      <header class="cal-cab"><button type="button" class="boton mini" data-acc="mes" data-v="-1" aria-label="Mes anterior">‹</button>
        <h2>${F_MES.format(S.mes)}</h2>
        <button type="button" class="boton mini" data-acc="mes" data-v="1" aria-label="Mes siguiente">›</button>
        <button type="button" class="boton mini" data-acc="mes" data-v="0">Hoy</button></header>
      <div class="cal-semana" aria-hidden="true"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
      <div class="cal-dias">${celdas}</div>
    </section>
    <div class="columna">
      <section class="bloque"><header><h2>${esc(F_DIA.format(selFecha))}</h2></header>
        <div class="lista">${sel.length ? sel.map((i) => fila(i, false)).join('') : vacio('Nada este día.')}</div></section>
      <details class="panel corte"><summary>+ Añadir tarea o examen propio</summary>
        <form id="f-tarea" class="rejilla-form">
          <label class="campo"><span>Qué es</span><input type="text" id="t-nombre" required placeholder="Examen tema 4"></label>
          <label class="campo"><span>Módulo</span><input type="text" id="t-modulo" list="lista-mods" required placeholder="Programación"></label>
          <label class="campo"><span>Tipo</span><select id="t-tipo"><option value="tarea">Tarea</option><option value="examen">Examen</option></select></label>
          <label class="campo"><span>Fecha</span><input type="date" id="t-fecha" required value="${selFecha.toISOString().slice(0, 10)}"></label>
          <label class="campo"><span>Hora</span><input type="time" id="t-hora" value="23:59"></label>
          <div class="campo campo-boton"><button class="boton principal">Añadir</button></div>
          <datalist id="lista-mods">${mods.map((m) => `<option value="${esc(m)}">`).join('')}</datalist>
        </form></details>
    </div>
  </div>
  <section class="bloque"><header><h2>Próximos 7 días</h2></header><div class="lista">${proximas.length ? proximas.map((i) => fila(i)).join('') : vacio('Semana libre.')}</div></section>`;
}

function vistaNotas() {
  const T = tareas();
  const porModulo = cursos().map((c) => [nombreModulo(c.nombre), mediaCurso(c), colorDe(nombreModulo(c.nombre))]).filter(([, m]) => m != null);
  const propias = T.filter((t) => t.origen === 'propia' && t.nota10 != null);
  return cabecera('Notas', '<span class="suave">Todo sobre 10 · la línea marca el 5</span>') + `
  <section class="bloque"><header><h2>Media por módulo</h2></header>${barras(porModulo)}</section>
  <div class="rejilla-notas">${cursos().map((c) => {
    const ns = c.notas.filter((n) => n.nota != null && n.max), nombre = nombreModulo(c.nombre);
    return ns.length ? `<section class="bloque"><header><h2 class="h-mod" style="--mod:${colorDe(nombre)}"><i class="punto-mod"></i>${esc(nombre)}</h2><a href="#modulo-${c.id}">Detalle</a></header>
      ${barras(ns.map((n) => [n.nombre, n.nota / n.max * 10, colorDe(nombre)]))}</section>` : '';
  }).join('')}</div>
  ${propias.length ? `<section class="bloque"><header><h2>Notas que has añadido tú</h2></header>${barras(propias.map((t) => [t.modulo + ' · ' + t.nombre, t.nota10, colorDe(t.modulo)]))}</section>` : ''}`;
}

function vistaMas() {
  return cabecera('Más') + `<div class="mas-enlaces">
    <a href="#notas" class="mas-enlace corte">${icono('notas')}<span><b>Notas</b><small>Medias y calificaciones sobre 10</small></span></a>
    <a href="#ajustes" class="mas-enlace corte">${icono('ajustes')}<span><b>Ajustes</b><small>Aules, GitHub, apariencia y copia</small></span></a>
  </div>`;
}

function vistaAjustes() {
  const r = repo(), demo = S.demo ? '<p class="suave">No disponible con datos de ejemplo.</p>' : '';
  return cabecera('Ajustes') + `
  <section class="bloque"><header><h2>Conexión con Aules</h2><span class="punto" data-ok="${S.aules ? 'si' : 'no'}">${S.aules ? 'Conectado' : 'Sin conectar'}</span></header>
    <div class="panel corte">
      <p>Doodle descarga tus tareas, entregas y notas desde este navegador. Se actualiza al abrir la app si los datos tienen más de 2 horas, y cuando pulsas <b>Sincronizar</b>.</p>
      <p class="suave">El token se saca abriendo <span class="mono">aules.edu.gva.es/fp/login/token.php?service=moodle_mobile_app&amp;username=…&amp;password=…</span> y copiando el valor de <span class="mono">"token"</span>. Se guarda cifrado con tu contraseña en este dispositivo.</p>
      ${demo || `<form id="f-aules" class="rejilla-form">
        <label class="campo"><span>Dirección de Aules</span><input type="text" id="a-url" value="${esc(S.aules ? S.aules.url : 'https://aules.edu.gva.es/fp')}" required></label>
        <label class="campo"><span>Token</span><input type="password" id="a-token" autocomplete="off" placeholder="${S.aules ? 'Ya guardado · pega otro para cambiarlo' : '32 letras y números'}" ${S.aules ? '' : 'required'}></label>
        <div class="campo campo-boton"><div class="fila-botones"><button class="boton principal">Guardar y sincronizar</button>${S.aules ? '<button type="button" class="boton peligro" data-acc="quitar-aules">Quitar</button>' : ''}</div></div>
      </form><p class="suave" id="aules-estado" role="status"></p>`}
    </div></section>
  <section class="bloque"><header><h2>Sincronizar entre dispositivos</h2><span class="punto" data-ok="${S.pat ? 'si' : ''}">${S.pat ? 'Activado' : 'Desactivado'}</span></header>
    <div class="panel corte">
      <p>Con una clave de GitHub, tus datos de Aules y tu progreso (ejercicios, código, tareas propias) se guardan cifrados en el repo y los ves igual en el móvil y en el PC.</p>
      <ol>
        <li>GitHub → <b>Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token</b>.</li>
        <li>Repository access: <b>Only select repositories → ${esc(r.split('/')[1] || 'doodle')}</b>.</li>
        <li>Permissions → Repository: <b>Contents: Read and write</b>.</li>
        <li>Pega aquí la clave. Repite este paso en cada dispositivo.</li>
      </ol>
      ${demo || `<form id="f-pat" class="rejilla-form">
        ${location.hostname.endsWith('.github.io') ? '' : `<label class="campo"><span>Repositorio</span><input type="text" id="p-repo" value="${esc(S.cfg.repo || 'vyxode/doodle')}" required></label>`}
        <label class="campo"><span>Clave de GitHub</span><input type="password" id="p-pat" autocomplete="off" placeholder="${S.pat ? 'Ya guardada · pega otra para cambiarla' : 'github_pat_…'}" ${S.pat ? '' : 'required'}></label>
        <div class="campo campo-boton"><div class="fila-botones"><button class="boton principal">Guardar</button>${S.pat ? '<button type="button" class="boton peligro" data-acc="quitar-pat">Quitar</button>' : ''}</div></div>
      </form><p class="suave" id="pat-estado" role="status"></p>`}
    </div></section>
  <section class="bloque"><header><h2>Apariencia</h2></header>
    <div class="panel corte"><div class="seg" role="group" aria-label="Tema">
      <button type="button" data-acc="tema" data-v="oscuro" aria-pressed="${S.cfg.tema !== 'claro'}">Oscuro</button>
      <button type="button" data-acc="tema" data-v="claro" aria-pressed="${S.cfg.tema === 'claro'}">Claro</button></div></div></section>
  <section class="bloque"><header><h2>Copia de seguridad</h2></header>
    <div class="panel corte"><p>Descarga tu progreso en un archivo (sin cifrar) o recupéralo de una copia. Al recuperar se mezcla con lo que ya tienes.</p>
      <div class="fila-botones"><button class="boton" data-acc="exportar">Descargar copia</button>
      <label class="boton">Recuperar copia<input type="file" id="importar" accept="application/json,.json" hidden></label></div></div></section>
  <section class="bloque"><header><h2>Sesión</h2></header>
    <div class="panel corte"><p>${LS.get('doodle-recordar') ? 'Este dispositivo recuerda tu contraseña.' : 'Este dispositivo te pide la contraseña cada vez.'}</p>
      <div class="fila-botones"><button class="boton peligro" data-acc="bloquear">Cerrar sesión${LS.get('doodle-recordar') ? ' y olvidar la contraseña' : ''}</button></div></div></section>`;
}

// ---------- ejercicios ----------
function vistaEjercicios() {
  const mods = modulosCatalogo();
  if (!mods.includes(S.filtro.modulo)) S.filtro.modulo = mods[0] || '';
  const lista = catalogo().filter((e) => e.modulo === S.filtro.modulo);
  return cabecera('Ejercicios', `<span class="suave">${lista.filter(hecho).length} de ${lista.length} hechos</span>`) + `
  <div class="chips-mod" role="group" aria-label="Módulo">${mods.map((m) => `<button type="button" data-acc="filtro-mod" data-v="${esc(m)}" aria-pressed="${m === S.filtro.modulo}" style="--mod:${colorDe(m)}"><i class="punto-mod"></i>${esc(m)}</button>`).join('')}</div>
  <details class="panel corte"><summary>+ Añadir un ejercicio</summary>
    <form id="f-ej" class="rejilla-form">
      <label class="campo"><span>Módulo</span><input type="text" id="e-modulo" list="lista-mods-ej" value="${esc(S.filtro.modulo)}" required></label>
      <label class="campo"><span>Tema</span><input type="text" id="e-tema" required placeholder="Tema 5 · Funciones"></label>
      <label class="campo"><span>Número</span><input type="text" id="e-n" placeholder="5.1.1"></label>
      <label class="campo"><span>Tipo</span><select id="e-leng"><option value="csharp">C# (editor y ejecución)</option><option value="">Otro (notas)</option></select></label>
      <label class="campo campo-ancho"><span>Enunciado</span><textarea id="e-texto" required></textarea></label>
      <div class="campo campo-boton"><button class="boton principal">Añadir ejercicio</button></div>
      <datalist id="lista-mods-ej">${[...new Set([...mods, ...cursos().map((c) => nombreModulo(c.nombre))])].map((m) => `<option value="${esc(m)}">`).join('')}</datalist>
    </form></details>
  ${listaEjercicios(S.filtro.modulo)}`;
}
function listaEjercicios(modulo) {
  const lista = catalogo().filter((e) => e.modulo === modulo);
  const temas = [...new Set(lista.map((e) => e.tema))], color = colorDe(modulo);
  return temas.map((t) => {
    const del = lista.filter((e) => e.tema === t), n = del.filter(hecho).length;
    let grupo = null;
    return `<section class="bloque tema" style="--mod:${color}">
      <header><h2>${esc(t)}</h2><span class="suave num">${n}/${del.length}</span></header>
      <div class="barra"><i style="width:${n / del.length * 100}%"></i></div>
      <div class="lista">${del.map((e) => {
        const g = e.grupo && e.grupo !== grupo ? `<p class="grupo">${esc((grupo = e.grupo))}</p>` : '';
        return g + `<div class="ej corte ${hecho(e) ? 'hecho' : ''}" data-id="${esc(e.id)}">
          <label class="ej-check" title="Marcar como hecho"><input type="checkbox" data-acc="ej-hecho" ${hecho(e) ? 'checked' : ''}><span class="sr">Hecho</span></label>
          <span class="ej-num">${esc(e.n || '·')}</span>
          <p class="ej-txt">${esc(e.texto)}</p>
          <div class="ej-acc">${e.propio ? '<button type="button" class="boton mini peligro" data-acc="borrar-ej">Borrar</button>' : ''}
            <button type="button" class="boton mini principal" data-acc="abrir-lab">${e.lenguaje === 'csharp' ? 'Programar ▸' : 'Notas ▸'}</button></div>
        </div>`;
      }).join('')}</div></section>`;
  }).join('') || vacio('No hay ejercicios en este módulo. Añade el primero arriba.');
}

// Simulador en un Worker para que un bucle infinito no congele la página (igual que en el tema 4).
let worker = null, workerRoto = false, cola = Promise.resolve();
function crearWorker() {
  if (workerRoto || typeof Worker === 'undefined' || typeof window.CSharpFactory !== 'function') return null;
  try {
    const codigo = '(' + window.CSharpFactory.toString() + ')(self);\nself.onmessage = function (e) { self.postMessage(self.CSharp.run(e.data.src, e.data.inputs, e.data.seed)); };';
    return new Worker(URL.createObjectURL(new Blob([codigo], { type: 'text/javascript' })));
  } catch (e) { workerRoto = true; return null; }
}
function simular(req) {
  cola = cola.then(() => new Promise((resolve) => {
    if (!worker) worker = crearWorker();
    if (!worker) { resolve(window.CSharp.run(req.src, req.inputs, req.seed)); return; }
    let fin = false;
    const terminar = (r) => { if (fin) return; fin = true; clearTimeout(reloj); resolve(r); };
    const reloj = setTimeout(() => { worker.terminate(); worker = null; terminar({ status: 'halt', segs: [], error: 'El programa ha tardado demasiado y se ha detenido.' }); }, 15000);
    worker.onmessage = (e) => terminar(e.data);
    worker.onerror = (ev) => { if (ev && ev.preventDefault) ev.preventDefault(); worker = null; workerRoto = true; terminar(window.CSharp.run(req.src, req.inputs, req.seed)); };
    worker.postMessage(req);
  }));
  return cola;
}
function crearEditor(caja, valor, alCambiar, alEjecutar, etiqueta, csharp) {
  if (window.CodeMirror) {
    const cm = window.CodeMirror(caja, {
      value: valor, mode: csharp ? 'text/x-csharp' : 'text/plain', lineNumbers: csharp, indentUnit: 4, tabSize: 4, indentWithTabs: true, lineWrapping: !csharp,
      matchBrackets: true, autoCloseBrackets: csharp, screenReaderLabel: etiqueta,
      extraKeys: { 'Ctrl-Enter': alEjecutar, 'Cmd-Enter': alEjecutar },
    });
    let marcada = null;
    cm.on('change', () => alCambiar(cm.getValue()));
    return {
      get: () => cm.getValue(),
      marcar(n) { this.limpiar(); if (n > 0 && n <= cm.lineCount()) marcada = cm.addLineClass(n - 1, 'background', 'linea-error'); },
      limpiar() { if (marcada) { cm.removeLineClass(marcada, 'background', 'linea-error'); marcada = null; } },
      ir(n) { cm.focus(); cm.setCursor({ line: Math.max(0, n - 1), ch: 0 }); cm.scrollIntoView(null, 80); },
      foco() { cm.refresh(); cm.focus(); },
    };
  }
  const ta = document.createElement('textarea'); ta.value = valor; ta.spellcheck = false; ta.setAttribute('aria-label', etiqueta); ta.className = 'editor-plano';
  caja.append(ta);
  ta.addEventListener('input', () => alCambiar(ta.value));
  ta.addEventListener('keydown', (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); alEjecutar(); }
    else if (ev.key === 'Tab' && !ev.shiftKey) { ev.preventDefault(); document.execCommand('insertText', false, '\t'); }
  });
  return { get: () => ta.value, marcar() {}, limpiar() {}, ir() { ta.focus(); }, foco() { ta.focus(); } };
}

// Espacio de trabajo a pantalla completa: enunciado a la izquierda, editor y consola a la derecha (apilado en el móvil).
const PLANTILLA = 'using System;\n\nclass Program {\n\tpublic static void Main() {\n\t\t\n\t}\n}\n';
function abrirLab(id) {
  const lista = catalogo().filter((x) => x.modulo === (catalogo().find((e) => e.id === id) || {}).modulo);
  const pos = lista.findIndex((x) => x.id === id), e = lista[pos];
  if (!e) return;
  const csharp = e.lenguaje === 'csharp', g = S.prog.ej[id] || {};
  let capa = document.getElementById('lab');
  if (!capa) { capa = document.createElement('div'); capa.id = 'lab'; document.body.append(capa); }
  capa.className = 'lab-capa'; capa.setAttribute('role', 'dialog'); capa.setAttribute('aria-modal', 'true'); capa.setAttribute('aria-label', 'Ejercicio ' + (e.n || ''));
  capa.style.setProperty('--mod', colorDe(e.modulo));
  capa.innerHTML = `
    <header class="lab-cab">
      <button type="button" class="boton mini" data-acc="cerrar-lab">← Volver</button>
      <span class="lab-titulo"><b>${esc(e.n || '')}</b> <span class="suave">${esc(e.tema)}</span></span>
      <div class="fila-botones">
        <button type="button" class="boton mini" data-acc="lab-ir" data-v="${esc((lista[pos - 1] || {}).id || '')}" ${pos > 0 ? '' : 'disabled'} aria-label="Ejercicio anterior">‹</button>
        <button type="button" class="boton mini" data-acc="lab-ir" data-v="${esc((lista[pos + 1] || {}).id || '')}" ${pos < lista.length - 1 ? '' : 'disabled'} aria-label="Ejercicio siguiente">›</button>
        <label class="casilla"><input type="checkbox" data-acc="lab-hecho" data-id="${esc(id)}" ${g.hecho ? 'checked' : ''}> Hecho</label>
      </div>
    </header>
    <div class="lab-cuerpo">
      <section class="lab-enun"><span class="antetitulo">${esc(e.grupo || e.modulo)}</span><p class="pre">${esc(e.texto)}</p>${e.ejemplo ? `<pre class="consola">${esc(e.ejemplo)}</pre>` : ''}
        ${csharp ? '<p class="suave atajo">Ctrl + Intro ejecuta. El simulador admite lo visto hasta el tema 4.</p>' : ''}</section>
      <section class="lab-trabajo">
        <div class="barra-lab">${csharp ? '<button type="button" class="boton principal" id="lab-ejecutar">▶ Ejecutar</button>' : ''}<span class="estado-guardado" aria-live="polite"></span></div>
        <div class="editor" id="lab-editor"></div>
        ${csharp ? '<div class="consola" id="lab-consola" tabindex="-1" aria-label="Consola del programa"><span class="vacia">Pulsa Ejecutar para lanzar el programa.</span></div><div id="lab-aviso" aria-live="polite"></div>' : ''}
      </section>
    </div>`;
  document.body.classList.add('con-lab');
  capa.hidden = false;
  const estado = capa.querySelector('.estado-guardado');
  let entradas = [], semilla = 1, ocupado = false;
  const ed = crearEditor(capa.querySelector('#lab-editor'), g.codigo || (csharp ? PLANTILLA : ''),
    (v) => { cambiar('ej', id, { codigo: v }); estado.textContent = S.demo ? 'Guardado en este navegador' : S.pat ? 'Guardado · se sincroniza en unos segundos' : 'Guardado en este dispositivo'; },
    () => csharp && lanzar([]), 'Código del ejercicio ' + (e.n || ''), csharp);
  ed.foco();
  if (!csharp) return;
  const btn = capa.querySelector('#lab-ejecutar'), consola = capa.querySelector('#lab-consola'), lugar = capa.querySelector('#lab-aviso');
  async function lanzar(ent, misma) {
    if (ocupado) return; ocupado = true; btn.disabled = true;
    if (!misma) semilla = Math.floor(Math.random() * 1e9);
    entradas = ent.slice();
    const r = await simular({ src: ed.get(), inputs: entradas, seed: semilla });
    ocupado = false; btn.disabled = false; pintar(r);
  }
  function pintar(r) {
    consola.textContent = ''; ed.limpiar(); lugar.textContent = '';
    for (const s of r.segs) { const p = document.createElement('pre'); if (s.t !== 'out') p.className = 'tecleado'; p.textContent = s.s; consola.append(p); }
    const aviso = document.createElement('div');
    if (r.status === 'input') {
      const inp = document.createElement('input'); inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false; inp.setAttribute('aria-label', 'Escribe la respuesta y pulsa Intro');
      consola.append(inp);
      inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); lanzar(entradas.concat([inp.value]), true); } });
      aviso.className = 'aviso espera'; aviso.textContent = 'El programa espera a que escribas en la consola y pulses Intro.';
      lugar.append(aviso); consola.scrollTop = consola.scrollHeight; inp.focus({ preventScroll: true });
      return;
    }
    if (!r.segs.length) { const v = document.createElement('span'); v.className = 'vacia'; v.textContent = r.status === 'compile' ? 'No se ha ejecutado porque el programa tiene un error.' : '(el programa no ha escrito nada)'; consola.append(v); }
    consola.scrollTop = consola.scrollHeight;
    if (r.status === 'done') { aviso.className = 'aviso ok'; aviso.textContent = 'Programa terminado.'; lugar.append(aviso); return; }
    aviso.className = 'aviso error';
    const b = document.createElement('b');
    b.textContent = (r.status === 'compile' ? 'Error de compilación en la línea ' + r.line : r.status === 'exception' ? 'El programa se ha parado en la línea ' + r.line : 'Programa detenido' + (r.line ? ' (línea ' + r.line + ')' : '')) + (r.code && r.code !== 'SIM' ? ' · ' + r.code : '');
    const m = document.createElement('span'); m.textContent = r.error;
    aviso.append(b, m);
    if (r.line) { const ir = document.createElement('button'); ir.type = 'button'; ir.className = 'boton mini'; ir.textContent = 'Ir a la línea ' + r.line; ir.addEventListener('click', () => ed.ir(r.line)); aviso.append(ir); ed.marcar(r.line); }
    lugar.append(aviso);
  }
  btn.addEventListener('click', () => lanzar([]));
}
function cerrarLab() {
  const capa = document.getElementById('lab'); if (!capa || capa.hidden) return;
  capa.hidden = true; capa.innerHTML = ''; document.body.classList.remove('con-lab');
  if ((location.hash.slice(1) || 'inicio') === 'ejercicios' || location.hash.startsWith('#modulo-')) render();
}

// ---------- acciones (delegadas) ----------
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') cerrarLab(); });
document.addEventListener('click', async (ev) => {
  const el = ev.target.closest('[data-acc]'); if (!el || el.tagName === 'INPUT') return;
  const acc = el.dataset.acc, ej = el.closest('.ej');
  if (acc === 'abrir-lab') abrirLab(ej.dataset.id);
  else if (acc === 'cerrar-lab') cerrarLab();
  else if (acc === 'lab-ir' && el.dataset.v) abrirLab(el.dataset.v);
  else if (acc === 'sync') sincronizarAules();
  else if (acc === 'filtro-mod') { S.filtro.modulo = el.dataset.v; render(); }
  else if (acc === 'ir-ejercicios') { S.filtro.modulo = el.dataset.modulo; }
  else if (acc === 'tab-mod') { S.tabModulo = el.dataset.v; render(); }
  else if (acc === 'dia') { S.diaSel = +el.dataset.v; render(); }
  else if (acc === 'mes') { const d = +el.dataset.v, h = new Date(); S.mes = d ? new Date(S.mes.getFullYear(), S.mes.getMonth() + d, 1) : new Date(h.getFullYear(), h.getMonth(), 1); if (!d) S.diaSel = claveDia(ahora()); render(); }
  else if (acc === 'tema') { S.cfg.tema = el.dataset.v; guardarCfg(); aplicarTema(); render(); }
  else if (acc === 'borrar-ej' || acc === 'borrar-tarea') {
    if (el.dataset.confirmar !== 'si') { el.dataset.confirmar = 'si'; el.textContent = '¿Seguro? Borrar'; return; }
    if (acc === 'borrar-ej') cambiar('ejPropios', ej.dataset.id, { borrado: true }); else cambiar('tareas', el.dataset.id, { borrado: true });
    render();
  } else if (acc === 'exportar') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S.prog, null, 1)], { type: 'application/json' }));
    a.download = 'doodle-progreso-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
  } else if (acc === 'quitar-pat') { S.pat = null; delete S.cfg.patSobre; guardarCfg(); render(); }
  else if (acc === 'quitar-aules') { S.aules = null; delete S.cfg.aulesSobre; guardarCfg(); render(); }
  else if (acc === 'bloquear') { LS.del('doodle-recordar'); S.pass = S.pat = S.aules = S.curso = null; S.prog = progVacio(); location.hash = ''; pintarBloqueo(); }
});
document.addEventListener('change', async (ev) => {
  const el = ev.target, acc = el.dataset.acc;
  if (acc === 'ej-hecho') { const ej = el.closest('.ej'); cambiar('ej', ej.dataset.id, { hecho: el.checked }); render(); }
  else if (acc === 'lab-hecho') cambiar('ej', el.dataset.id, { hecho: el.checked });
  else if (acc === 'hecha') { cambiar('tareas', el.dataset.id, { hecha: el.checked }); render(); }
  else if (acc === 'nota') cambiar('tareas', el.dataset.id, { nota: el.value === '' ? null : Math.max(0, +el.value) });
  else if (el.id === 'importar' && el.files[0]) {
    try { const copia = JSON.parse(await el.files[0].text()); if (!copia || typeof copia.ej !== 'object') throw 0; S.prog = mezclar(S.prog, copia); cambiar('ej', '_importado', {}); render(); }
    catch (e) { el.closest('.panel').querySelector('p').textContent = 'Ese archivo no es una copia de Doodle.'; }
  }
});
document.addEventListener('submit', async (ev) => {
  const f = ev.target; ev.preventDefault();
  const val = (id) => document.getElementById(id).value.trim();
  if (f.id === 'f-tarea') {
    const [y, m, d] = val('t-fecha').split('-').map(Number), [hh, mm] = (val('t-hora') || '23:59').split(':').map(Number);
    cambiar('tareas', 'p' + Date.now().toString(36), { nombre: val('t-nombre'), modulo: val('t-modulo'), tipo: val('t-tipo'), entrega: Math.floor(new Date(y, m - 1, d, hh, mm).getTime() / 1000), hecha: false, nota: null, max: 10 });
    render();
  } else if (f.id === 'f-ej') {
    S.filtro.modulo = val('e-modulo');
    cambiar('ejPropios', 'e' + Date.now().toString(36), { modulo: S.filtro.modulo, tema: val('e-tema'), n: val('e-n'), texto: val('e-texto'), lenguaje: val('e-leng') });
    render();
  } else if (f.id === 'f-aules') {
    const msg = document.getElementById('aules-estado'), token = val('a-token') || (S.aules && S.aules.token);
    const nuevo = { url: raizAules(val('a-url')), token };
    if (!/^https:\/\//.test(nuevo.url)) { msg.textContent = 'La dirección debe empezar por https://'; return; }
    msg.textContent = 'Comprobando con Aules…';
    const anterior = S.aules; S.aules = nuevo;
    try {
      S.curso = await descargarAules(nuevo.url, nuevo.token);
      const sobre = await cifrar(S.pass, S.curso);
      LS.set('doodle-curso', sobre);
      S.cfg.aulesSobre = await cifrar(S.pass, nuevo); guardarCfg();
      location.hash = 'inicio'; render();
      if (S.pat) subirCurso(sobre).catch(errSync);
    } catch (e) { S.aules = anterior; msg.textContent = e.message; }
  } else if (f.id === 'f-pat') {
    const msg = document.getElementById('pat-estado'), nuevo = val('p-pat');
    if (document.getElementById('p-repo')) { S.cfg.repo = val('p-repo'); guardarCfg(); }
    const anterior = S.pat;
    if (nuevo) S.pat = nuevo;
    msg.textContent = 'Comprobando con GitHub…';
    try {
      const r = await gh('');
      if (!r.ok) throw new Error(r.status === 404 ? 'GitHub no encuentra el repositorio ' + repo() + ' con esa clave.' : 'GitHub respondió ' + r.status + '.');
      const rem = await bajarProgreso(); if (rem) S.prog = mezclar(S.prog, rem);
      await subirProgreso();
      if (S.curso.generado) await subirCurso(await cifrar(S.pass, S.curso));
      S.cfg.patSobre = await cifrar(S.pass, { pat: S.pat }); guardarCfg(); guardarLocal();
      render();
    } catch (e) { S.pat = anterior; msg.textContent = e.message; }
  }
});

arrancar();
