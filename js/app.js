// Doodle: todo el curso de DAM en una web.
// - Aules: la web descarga tus datos desde tu navegador (token guardado cifrado en este dispositivo).
// - Todo se guarda cifrado con tu contraseña: en este navegador y, si configuras GitHub, en el repo
//   (data/curso.enc y data/progreso.enc) para tenerlo igual en todos tus dispositivos.
import { cifrar, descifrar } from './cripto.js';
import { descargarAules, raizAules, nombreModulo } from './aules.js';
import { crearEditor, montarSql, montarWeb, montarKanban, montarJava } from './herramientas.js';
import { montarDiagrama } from './diagrama.js';

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
function progVacio() { return { ej: {}, tareas: {}, ejPropios: {}, trabajos: {} }; }
const guardarCfg = () => LS.set('doodle-cfg', S.cfg);
const aplicarTema = () => { // sin elegir: sigue al sistema
  const t = { claro: 'light', oscuro: 'dark' }[S.cfg.tema];
  if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
};
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
// ---------- colores por módulo (automáticos; el rojo queda reservado para lo urgente) ----------
const PALETA = ['var(--texto)']; // estilo monocromo: los módulos se distinguen por el nombre, no por el color
function colorDe(modulo) {
  const i = cursos().findIndex((c) => nombreModulo(c.nombre) === modulo);
  if (i >= 0) return PALETA[i % PALETA.length];
  let h = 0; for (const ch of modulo || '') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETA[h % PALETA.length];
}

// ---------- datos derivados ----------
const CONVALIDADOS = new Set(['Itinerario para la Empleabilidad I']); // no se muestran en ninguna parte
// sin tareas ni notas (p. ej. Tutoría) no es un módulo que seguir
const cursos = () => ((S.curso && S.curso.cursos) || []).filter((c) => !CONVALIDADOS.has(nombreModulo(c.nombre)) && (c.tareas.length || c.notas.length));
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
// Lo que importa de una tarea es si todavía se puede entregar:
// hecha · futura (aún no abre) · cerrada (pasó el cierre o Aules ya no deja) · retraso (venció pero se admite)
// · antigua (venció hace más de 2 semanas: fechas que el profesor no actualizó de otros cursos) · pendiente.
const ATRASADA = 14 * D;
function situacion(t) {
  const h = ahora();
  if (t.hecha) return 'hecha';
  if (t.apertura && t.apertura > h) return 'futura';
  if ((t.cierre && t.cierre < h) || (t.editable === false && t.entrega && t.entrega < h)) return 'cerrada';
  if (t.entrega && t.entrega < h) return h - t.entrega >= ATRASADA ? 'antigua' : 'retraso';
  return 'pendiente';
}
const porHacer = (t) => ['pendiente', 'retraso'].includes(situacion(t));
const urgente = (t) => situacion(t) === 'retraso' || (situacion(t) === 'pendiente' && !!t.entrega && t.entrega - ahora() <= URGENTE);
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
const cursoDeModulo = (m) => cursos().find((c) => nombreModulo(c.nombre) === m);
const hecho = (e) => !!(S.prog.ej[e.id] || {}).hecho;
// Etiqueta solo cuando aporta algo: una tarea pendiente normal no lleva chip.
function estadoTarea(t) {
  const s = situacion(t);
  if (s === 'hecha') return t.nota10 != null ? ['ok', fNota(t.nota10) + ' / 10'] : ['ok', 'Entregada'];
  if (s === 'futura') return ['info', 'Se abre ' + fCorta(t.apertura)];
  if (s === 'cerrada') return ['gris', 'Cerrada'];
  if (s === 'antigua') return ['gris', 'Antigua'];
  if (s === 'retraso') return ['mal', 'Con retraso'];
  if (t.estado === 'draft') return ['ojo', 'Borrador'];
  if (t.tipo === 'examen') return ['info', 'Examen'];
  return urgente(t) ? ['mal', 'Urgente'] : null;
}
function agenda() {
  const items = tareas().filter((t) => t.entrega).map((t) => ({ fecha: t.entrega, nombre: t.nombre, modulo: t.modulo, url: t.url, tarea: t, chip: estadoTarea(t) }));
  const porId = Object.fromEntries(cursos().map((c) => [c.id, nombreModulo(c.nombre)]));
  for (const e of (S.curso && S.curso.eventos) || []) {
    if (e.tipo === 'assign' || (e.curso && !porId[e.curso])) continue; // las tareas ya salen; lo de módulos ocultos, no
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

const LOGO = '<span class="logo">Doodle</span>';
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

function render(forzar) {
  const v = location.hash.slice(1) || 'inicio';
  // shortcut: con un trabajo abierto, los repintados (sincronizar, etc.) no lo vuelven a montar para no perder deshacer y selección
  if (v === 'trabajo-' + S.montado && document.getElementById('taller') && !forzar) return pintarEstado();
  S.montado = null;
  const base = v.startsWith('modulo-') || v.startsWith('tarea-') ? 'modulos' : v.startsWith('trabajo-') ? 'ejercicios' : v;
  const baseMovil = ['notas', 'ajustes'].includes(base) ? 'mas' : base;
  app.innerHTML = `
  <div class="marco">
    <aside class="lateral">
      <a href="#inicio" class="lateral-logo">${LOGO}<small>DAM, primer curso</small></a>
      <nav aria-label="Secciones">${NAV.map(([id, t]) => `<a href="#${id}" ${id === base ? 'aria-current="page"' : ''}>${icono(id)}<span>${t}</span></a>`).join('')}</nav>
      <div class="lateral-pie" id="estado-pc"></div>
    </aside>
    <div class="principal">
      <header class="barra-sup">${LOGO}<div class="estado-movil" id="estado-movil"></div></header>
      ${S.demo ? '<div class="demo-banda">Estás viendo datos de ejemplo. <a href="#" id="salir-demo">Salir</a></div>' : ''}
      <main class="vista" id="vista"></main>
    </div>
    <nav class="inferior" aria-label="Secciones">${NAV_MOVIL.map(([id, t]) => `<a href="#${id}" ${id === baseMovil ? 'aria-current="page"' : ''}>${icono(id)}<span>${t}</span></a>`).join('')}</nav>
  </div>`;
  pintarEstado();
  const vista = document.getElementById('vista');
  document.body.classList.toggle('en-taller', v.startsWith('trabajo-'));
  vista.innerHTML = v.startsWith('modulo-') ? vistaModulo(+v.slice(7)) : v.startsWith('tarea-') ? vistaTarea(v.slice(6)) : v.startsWith('trabajo-') ? vistaTrabajo(v.slice(8))
    : ({ inicio: vistaInicio, modulos: vistaModulos, calendario: vistaCalendario, notas: vistaNotas, ejercicios: vistaEjercicios, ajustes: vistaAjustes, mas: vistaMas }[v] || vistaInicio)();
  if (v.startsWith('trabajo-')) montarTrabajo(v.slice(8));
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
window.addEventListener('hashchange', () => { if (S.curso) { render(true); window.scrollTo(0, 0); } });

// ---------- piezas ----------
const cabecera = (titulo, extra = '', ante = '') => `<header class="cab-vista">${ante ? `<span class="antetitulo">${ante}</span>` : ''}<h1>${titulo}</h1>${extra ? `<div class="cab-extra">${extra}</div>` : ''}</header>`;
const cifra = (valor, texto, clase = '') => `<div class="cifra corte ${clase}"><b>${valor}</b><small>${texto}</small></div>`;
const vacio = (t) => `<p class="vacio">${t}</p>`;
// Fecha en palabras: «Hoy a las 23:59», «Jueves a las 08:01», «Hace 3 días», «mié, 11 nov a las 18:25».
const F_SEMANA = F({ weekday: 'long' }), F_DIA_MES = F({ day: 'numeric', month: 'short' });
const inicioDia = (ts) => new Date(ts * 1000).setHours(0, 0, 0, 0) / 1000;
function cuando(ts) {
  const dd = Math.round((inicioDia(ts) - inicioDia(ahora())) / D), hora = fHora(ts);
  if (dd === 0) return 'Hoy a las ' + hora;
  if (dd === 1) return 'Mañana a las ' + hora;
  if (dd === -1) return 'Ayer a las ' + hora;
  if (dd < 0) return `Hace ${-dd} días`;
  if (dd < 7) { const w = F_SEMANA.format(ts * 1000); return w[0].toUpperCase() + w.slice(1) + ' a las ' + hora; }
  return F_DIA_MES.format(ts * 1000) + ' a las ' + hora;
}
function fila(i) {
  const t = i.tarea, s = t ? situacion(t) : 'evento', urg = t && urgente(t);
  const titulo = t ? `<a href="#tarea-${esc(t.clave)}">${esc(i.nombre)}</a>` : i.url ? `<a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.nombre)} ↗</a>` : `<strong>${esc(i.nombre)}</strong>`;
  const propia = t && t.origen === 'propia' ? `
    <div class="fila-propia">
      <label class="casilla"><input type="checkbox" data-acc="hecha" data-id="${esc(t.clave)}" ${t.hecha ? 'checked' : ''}> Hecha</label>
      <label class="casilla">Nota <input type="number" min="0" step="0.01" class="nota-in" data-acc="nota" data-id="${esc(t.clave)}" value="${t.nota ?? ''}"> / ${t.max || 10}</label>
      <button class="boton mini peligro" data-acc="borrar-tarea" data-id="${esc(t.clave)}">Borrar</button>
    </div>` : '';
  return `<div class="fila corte s-${s} ${urg ? 'urgente' : ''}" style="--mod:${colorDe(i.modulo)}">
    <span class="cuando">${cuando(i.fecha)}</span>
    <div class="que">${titulo}<small><i class="punto-mod"></i>${esc(i.modulo || '—')}${t && t.origen === 'propia' ? ', añadida por ti' : ''}</small>${propia}</div>
    ${i.chip ? `<span class="chip ${i.chip[0]}">${esc(i.chip[1])}</span>` : '<span></span>'}
  </div>`;
}
// Varias tareas del mismo módulo el mismo día (p. ej. 10 ejercicios de BD) se juntan en una fila desplegable.
function listaFilas(items, vacioTxt) {
  if (!items.length) return vacio(vacioTxt);
  const grupos = [];
  for (const i of items) {
    const k = claveDia(i.fecha) + '|' + i.modulo, g = grupos.find((x) => x.k === k);
    if (g) g.items.push(i); else grupos.push({ k, items: [i] });
  }
  return `<div class="lista">${grupos.map((g) => {
    if (g.items.length < 3) return g.items.map(fila).join('');
    const i0 = g.items[0], urg = g.items.some((i) => i.tarea && urgente(i.tarea));
    return `<details class="grupo-filas corte ${urg ? 'urgente' : ''}" style="--mod:${colorDe(i0.modulo)}">
      <summary class="fila"><span class="cuando">${cuando(i0.fecha)}</span>
        <div class="que"><strong>${g.items.length} tareas de ${esc(i0.modulo)}</strong><small>${esc(g.items.slice(0, 3).map((i) => i.nombre.replace(/^(Exercic?i|Ejercicio|Tasca|Tarea)\s*/i, '')).join(', '))}${g.items.length > 3 ? '…' : ''}</small></div>
        <span class="chip ${urg ? 'mal' : 'info'}">Ver ${g.items.length}</span></summary>
      <div class="lista">${g.items.map(fila).join('')}</div></details>`;
  }).join('')}</div>`;
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
  if (!cursos().length && !T.length) return cabecera('Inicio') + `<section class="bloque bienvenida corte"><div class="lineas-velocidad" aria-hidden="true"></div>
    <h2>Conecta tu Aules</h2><p>Doodle trae tus tareas, fechas de entrega y notas de Aules. Solo hay que hacerlo una vez en cada dispositivo.</p>
    <div class="fila-botones"><a class="boton principal" href="#ajustes">Conectar Aules</a><a class="boton" href="#ejercicios">Ir a los ejercicios</a></div></section>`;
  const urg = ag.filter((i) => i.tarea && urgente(i.tarea));
  const proximas = ag.filter((i) => i.fecha >= h && i.fecha <= h + 14 * D && (i.tarea ? porHacer(i.tarea) && !urgente(i.tarea) : true));
  const siguiente = ag.find((i) => i.tarea && porHacer(i.tarea) && i.fecha >= h);
  const medias = cursos().map(mediaCurso).filter((m) => m != null);
  const pendientes = T.filter(porHacer).length;
  const notas = T.filter((t) => t.nota10 != null).sort((a, b) => (b.enviada || b.entrega || 0) - (a.enviada || a.entrega || 0)).slice(0, 5);
  const hoy = fDia(h);
  const frase = urg.length ? `Tienes <span class="rojo">${urg.length} ${urg.length === 1 ? 'entrega urgente' : 'entregas urgentes'}</span>.`
    : siguiente ? `Nada urgente. Lo siguiente es <a href="#tarea-${esc(siguiente.tarea.clave)}">${esc(siguiente.nombre)}</a>, ${cuando(siguiente.fecha).toLowerCase()}.`
    : 'No tienes entregas pendientes.';
  return `
  <header class="portada"><p class="fecha">${hoy[0].toUpperCase() + hoy.slice(1)}</p><h1>${frase}</h1></header>
  ${urg.length ? `<section class="bloque bloque-urgente"><header><h2>Urgente</h2><span class="suave">Vence en 3 días o ya ha vencido y aún se admite</span></header>${listaFilas(urg, '')}</section>` : ''}
  <div class="cifras">
    ${cifra(medias.length ? fNota(medias.reduce((a, b) => a + b) / medias.length) : '—', 'Media general')}
    ${cifra(pendientes, pendientes === 1 ? 'Entrega pendiente' : 'Entregas pendientes', pendientes ? '' : 'bien')}
    ${cifra(T.filter((t) => t.hecha).length, 'Entregadas')}
  </div>
  <div class="dos-col">
    <section class="bloque"><header><h2>Próximas dos semanas</h2><a href="#calendario">Calendario</a></header>
      ${listaFilas(proximas, 'Nada más en las próximas dos semanas.')}</section>
    <div class="columna">
      <section class="bloque"><header><h2>Módulos</h2><a href="#modulos">Ver todos</a></header>
        <div class="mini-mods">${cursos().map((c) => { const m = mediaCurso(c), pend = T.filter((t) => t.cursoId === c.id && porHacer(t)).length;
          return `<a class="mini-mod" href="#modulo-${c.id}" style="--mod:${colorDe(nombreModulo(c.nombre))}"><span class="mm-nombre">${esc(nombreModulo(c.nombre))}</span>
            <span class="mm-pend ${pend ? '' : 'suave'}">${pend ? pend + ' por entregar' : 'Al día'}</span><b style="color:${notaColor(m)}">${fNota(m)}</b></a>`; }).join('')}</div></section>
      <section class="bloque"><header><h2>Últimas notas</h2><a href="#notas">Todas</a></header>
        ${notas.length ? `<div class="lista">${notas.map((t) => `<a class="nota-fila" href="#tarea-${esc(t.clave)}" style="--mod:${colorDe(t.modulo)}"><span class="nf-nombre">${esc(t.nombre)}<small>${esc(t.modulo)}</small></span><b class="${t.nota10 < 5 ? 'susp' : ''}">${fNota(t.nota10)}</b></a>`).join('')}</div>` : vacio('Aún no hay notas.')}</section>
    </div>
  </div>`;
}

function vistaModulos() {
  if (!cursos().length) return cabecera('Módulos') + vacio('Cuando conectes Aules en <a href="#ajustes">Ajustes</a>, aquí aparecerán tus módulos.');
  const T = tareas();
  return cabecera('Módulos', '<span class="suave">Tareas, notas y apuntes de cada asignatura</span>') + `<div class="modulos">
    ${cursos().map((c) => {
      const m = mediaCurso(c), ts = T.filter((t) => t.cursoId === c.id), pend = ts.filter(porHacer), urg = pend.filter(urgente).length, hechas = ts.filter((t) => t.hecha).length;
      return `<a class="modulo corte trama-esquina" href="#modulo-${c.id}" style="--mod:${colorDe(nombreModulo(c.nombre))}">
        <span class="codigo">${esc(c.corto)}</span><h3>${esc(nombreModulo(c.nombre))}</h3>
        <div class="mod-nota"><b style="color:${notaColor(m)}">${fNota(m)}</b><small>/ 10</small></div>
        <div class="mod-pie"><span>${hechas} entregada${hechas === 1 ? '' : 's'}</span>${urg ? `<span class="chip mal">${urg} urgente${urg > 1 ? 's' : ''}</span>` : pend.length ? `<span class="chip info">${pend.length} por entregar</span>` : '<span class="chip ok">Al día</span>'}</div>
      </a>`;
    }).join('')}</div>`;
}

const TABS_MOD = [['todo', 'Resumen'], ['tareas', 'Tareas'], ['notas', 'Notas'], ['ejercicios', 'Trabajar'], ['contenido', 'Apuntes']];
const TIPOS = { resource: 'archivo', assign: 'tarea', quiz: 'cuestionario', forum: 'foro', url: 'enlace', page: 'página', folder: 'carpeta', label: 'etiqueta', h5pactivity: 'H5P', choice: 'consulta', lesson: 'lección', workshop: 'taller', glossary: 'glosario', feedback: 'encuesta', book: 'libro', scorm: 'SCORM' };
function vistaModulo(id) {
  const c = cursos().find((x) => x.id === id);
  if (!c) return cabecera('Módulo') + vacio('Ese módulo no está en los datos de Aules. <a href="#modulos">Volver</a>');
  const nombre = nombreModulo(c.nombre), color = colorDe(nombre), tab = S.tabModulo;
  const ts = tareas().filter((t) => t.cursoId === id).sort((a, b) => (a.entrega || 9e9) - (b.entrega || 9e9));
  const item = (t) => ({ fecha: t.entrega, nombre: t.nombre, modulo: nombre, url: t.url, tarea: t, chip: estadoTarea(t) });
  const conFecha = (f) => ts.filter((t) => t.entrega && f(t)).map(item);
  const sinFecha = ts.filter((t) => !t.entrega && !t.hecha);
  const hechas = conFecha((t) => t.hecha).reverse(), perdidas = conFecha((t) => ['cerrada', 'antigua'].includes(situacion(t))).reverse();
  const plegado = (titulo, items) => (items.length ? `<details class="plegable"><summary>${titulo} <span class="suave">(${items.length})</span></summary>${listaFilas(items, '')}</details>` : '');
  const secTareas = `<section class="bloque"><header><h2>Por entregar</h2></header>
      ${listaFilas(conFecha((t) => porHacer(t) || situacion(t) === 'futura'), 'Nada pendiente en este módulo.')}
      ${sinFecha.length ? `<p class="suave">Sin fecha: ${sinFecha.map((t) => `<a href="#tarea-${esc(t.clave)}">${esc(t.nombre)}</a>`).join(', ')}</p>` : ''}
      ${plegado('Entregadas', hechas)}${plegado('Cerradas o antiguas sin entregar', perdidas)}</section>`;
  const conNota = c.notas.filter((n) => n.nota != null && n.max);
  const secNotas = `<section class="bloque"><header><h2>Calificaciones</h2><span class="suave">Media ${fNota(mediaCurso(c))} / 10</span></header>
    ${barras(conNota.map((n) => [n.nombre, n.nota / n.max * 10, color]))}
    ${c.notas.some((n) => n.comentario) ? `<div class="lista">${c.notas.filter((n) => n.comentario).map((n) => `<div class="panel corte"><b>${esc(n.nombre)}</b><p class="suave pre">${esc(n.comentario)}</p></div>`).join('')}</div>` : ''}</section>`;
  const secContenido = `<section class="bloque"><header><h2>Contenido</h2><a href="${esc(c.url)}" target="_blank" rel="noopener">Abrir en Aules ↗</a></header>
    ${c.secciones.filter((s) => s.elementos.length || s.resumen).map((s, i, arr) => `<details class="seccion corte" ${i === arr.length - 1 ? 'open' : ''}><summary>${esc(s.nombre || 'General')} <span class="suave">· ${s.elementos.length}</span></summary>
      ${s.resumen ? `<p class="suave pre">${esc(s.resumen)}</p>` : ''}
      <ul>${s.elementos.map((e) => `<li>${e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.nombre)}</a>` : esc(e.nombre)} <small>${esc(TIPOS[e.tipo] || e.tipo)}${e.archivos.length ? ': ' + esc(e.archivos.join(', ')) : ''}</small></li>`).join('')}</ul>
    </details>`).join('') || vacio('Sin contenido.')}</section>`;
  const secEj = `<section class="bloque"><header><h2>Ejercicios y trabajos</h2><a href="#ejercicios" data-acc="ir-ejercicios" data-modulo="${esc(nombre)}">Abrir en Ejercicios</a></header>${listaEjercicios(nombre)}</section>`;
  const cuerpo = { tareas: secTareas, notas: secNotas, contenido: secContenido, ejercicios: secEj }[tab]
    || `<div class="cifras">${cifra(fNota(mediaCurso(c)), 'Media')}${cifra(ts.filter(porHacer).length, 'Por entregar', ts.some(urgente) ? 'alerta' : '')}${cifra(ts.filter((t) => t.hecha).length, 'Entregadas')}</div>` + secTareas + secNotas;
  return `<div class="cab-modulo corte trama-esquina" style="--mod:${color}">
      <a href="#modulos" class="antetitulo">← Módulos</a><h1>${esc(nombre)}</h1>
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
      <span>${d}</span><span class="puntos">${its.slice(0, 4).map((i) => `<i style="--mod:${colorDe(i.modulo)}" class="${i.tarea && !porHacer(i.tarea) ? 'tenue' : ''}"></i>`).join('')}${its.length > 4 ? `<b>+${its.length - 4}</b>` : ''}</span></button>`;
  }
  const sel = porDia[S.diaSel] || [];
  const selFecha = new Date(Math.floor(S.diaSel / 10000), Math.floor(S.diaSel / 100) % 100 - 1, S.diaSel % 100, 12);
  const mods = [...new Set([...cursos().map((c) => nombreModulo(c.nombre)), ...modulosCatalogo()])];
  const proximas = agenda().filter((i) => i.fecha >= ahora() && i.fecha <= ahora() + 7 * D && (!i.tarea || porHacer(i.tarea)));
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
        ${listaFilas(sel, 'Nada este día.')}</section>
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
  <section class="bloque"><header><h2>Por entregar esta semana</h2></header>${listaFilas(proximas, 'Semana libre.')}</section>`;
}

function vistaNotas() {
  const T = tareas();
  const porModulo = cursos().map((c) => [nombreModulo(c.nombre), mediaCurso(c), colorDe(nombreModulo(c.nombre))]).filter(([, m]) => m != null);
  const propias = T.filter((t) => t.origen === 'propia' && t.nota10 != null);
  return cabecera('Notas', '<span class="suave">Todas las notas sobre 10. La línea vertical marca el 5.</span>') + `
  <section class="bloque"><header><h2>Media por módulo</h2></header>${barras(porModulo)}</section>
  <div class="rejilla-notas">${cursos().map((c) => {
    const ns = c.notas.filter((n) => n.nota != null && n.max), nombre = nombreModulo(c.nombre);
    return ns.length ? `<section class="bloque"><header><h2 class="h-mod" style="--mod:${colorDe(nombre)}"><i class="punto-mod"></i>${esc(nombre)}</h2><a href="#modulo-${c.id}">Detalle</a></header>
      ${barras(ns.map((n) => [n.nombre, n.nota / n.max * 10, colorDe(nombre)]))}</section>` : '';
  }).join('')}</div>
  ${propias.length ? `<section class="bloque"><header><h2>Notas que has añadido tú</h2></header>${barras(propias.map((t) => [t.modulo + ': ' + t.nombre, t.nota10, colorDe(t.modulo)]))}</section>` : ''}`;
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
      ${(S.curso.avisos || []).length ? `<details class="plegable"><summary>Aules no dejó leer ${S.curso.avisos.length} cosa${S.curso.avisos.length === 1 ? '' : 's'} en la última sincronización</summary><ul class="mono">${S.curso.avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></details>` : ''}
      <p>Doodle descarga tus tareas, entregas y notas desde este navegador. Se actualiza al abrir la app si los datos tienen más de 2 horas, y cuando pulsas <b>Sincronizar</b>.</p>
      <p class="suave">El token se saca abriendo <span class="mono">aules.edu.gva.es/fp/login/token.php?service=moodle_mobile_app&amp;username=…&amp;password=…</span> y copiando el valor de <span class="mono">"token"</span>. Se guarda cifrado con tu contraseña en este dispositivo.</p>
      ${demo || `<form id="f-aules" class="rejilla-form">
        <label class="campo"><span>Dirección de Aules</span><input type="text" id="a-url" value="${esc(S.aules ? S.aules.url : 'https://aules.edu.gva.es/fp')}" required></label>
        <label class="campo"><span>Token</span><input type="password" id="a-token" autocomplete="off" placeholder="${S.aules ? 'Ya guardado. Pega otro para cambiarlo' : '32 letras y números'}" ${S.aules ? '' : 'required'}></label>
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
        <label class="campo"><span>Clave de GitHub</span><input type="password" id="p-pat" autocomplete="off" placeholder="${S.pat ? 'Ya guardada. Pega otra para cambiarla' : 'github_pat_…'}" ${S.pat ? '' : 'required'}></label>
        <div class="campo campo-boton"><div class="fila-botones"><button class="boton principal">Guardar</button>${S.pat ? '<button type="button" class="boton peligro" data-acc="quitar-pat">Quitar</button>' : ''}</div></div>
      </form><p class="suave" id="pat-estado" role="status"></p>`}
    </div></section>
  <section class="bloque"><header><h2>Apariencia</h2></header>
    <div class="panel corte"><div class="seg" role="group" aria-label="Tema">
      ${[['', 'Como el sistema'], ['claro', 'Claro'], ['oscuro', 'Oscuro']].map(([k, t]) => `<button type="button" data-acc="tema" data-v="${k}" aria-pressed="${(S.cfg.tema || '') === k}">${t}</button>`).join('')}</div></div></section>
  <section class="bloque"><header><h2>Copia de seguridad</h2></header>
    <div class="panel corte"><p>Descarga tu progreso en un archivo (sin cifrar) o recupéralo de una copia. Al recuperar se mezcla con lo que ya tienes.</p>
      <div class="fila-botones"><button class="boton" data-acc="exportar">Descargar copia</button>
      <label class="boton">Recuperar copia<input type="file" id="importar" accept="application/json,.json" hidden></label></div></div></section>
  <section class="bloque"><header><h2>Sesión</h2></header>
    <div class="panel corte"><p>${LS.get('doodle-recordar') ? 'Este dispositivo recuerda tu contraseña.' : 'Este dispositivo te pide la contraseña cada vez.'}</p>
      <div class="fila-botones"><button class="boton peligro" data-acc="bloquear">Cerrar sesión${LS.get('doodle-recordar') ? ' y olvidar la contraseña' : ''}</button></div></div></section>`;
}

// ---------- herramientas de trabajo ----------
const HERR = { diagrama: 'Diagrama', sql: 'SQL', java: 'Java', csharp: 'C#', web: 'HTML/CSS', kanban: 'Tablero', notas: 'Notas' };
// Herramienta (y notación de diagrama) más probable según el módulo y el nombre de la tarea.
function herramientaPara(modulo, nombre = '') {
  const n = sinAcentos(nombre), m = sinAcentos(modulo);
  if (m.includes('bases de datos')) {
    if (/\bsql\b|consult|select|insert|ddl|dml/.test(n)) return { tipo: 'sql' };
    if (/relacional|\bmr\b|model relacional|pas a model|paso a modelo|normaliz/.test(n)) return { tipo: 'diagrama', notacion: 'relacional' };
    return { tipo: 'diagrama', notacion: 'er' };
  }
  if (m.includes('entornos')) {
    if (/java|junit|test|prueba|codigo|code/.test(n)) return { tipo: 'java' };
    if (/requisit|requirement|trello|jira|kanban|scrum|backlog|histori|stor/.test(n)) return { tipo: 'kanban' };
    if (/uml|clase|class|diagram/.test(n)) return { tipo: 'diagrama', notacion: 'uml' };
    return { tipo: 'notas' };
  }
  if (m.includes('programacion')) return { tipo: 'csharp' };
  if (m.includes('marcas')) return /xml|dtd|xsd|json/.test(n) ? { tipo: 'notas' } : { tipo: 'web' };
  if (m.includes('proyecto')) return /caso|histori|uso/.test(n) ? { tipo: 'diagrama', notacion: 'casos' } : { tipo: 'kanban' };
  return { tipo: 'notas' };
}
const trabajos = () => Object.entries(S.prog.trabajos).filter(([, t]) => !t.borrado).map(([id, t]) => ({ ...t, id }));
const trabajoDeTarea = (clave) => trabajos().find((t) => t.tarea === clave);
function crearTrabajo(datos) {
  const id = 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  cambiar('trabajos', id, { datos: {}, ...datos });
  return id;
}
function trabajarEnTarea(clave) {
  const t = tareas().find((x) => x.clave === clave); if (!t) return;
  const ya = trabajoDeTarea(clave);
  if (ya) { location.hash = 'trabajo-' + ya.id; return; }
  const h = herramientaPara(t.modulo, t.nombre);
  location.hash = 'trabajo-' + crearTrabajo({ titulo: t.nombre, modulo: t.modulo, tarea: clave, tipo: h.tipo, notacion: h.notacion });
}

// C#: el simulador del tema 4 en un Worker, para que un bucle infinito no congele la página.
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
const PLANTILLA = 'using System;\n\nclass Program {\n\tpublic static void Main() {\n\t\t\n\t}\n}\n';
function montarCsharp(cont, datos, alCambiar) {
  cont.innerHTML = `<div class="hz hz-cs">
    <div class="barra-lab"><button type="button" class="boton principal" data-cs="ejecutar">▶ Ejecutar</button><span class="suave atajo">Ctrl + Intro ejecuta. Admite lo visto hasta el tema 4.</span><span class="estado-guardado" aria-live="polite"></span></div>
    <div class="editor"></div>
    <div class="consola" tabindex="-1" aria-label="Consola del programa"><span class="vacia">Pulsa Ejecutar para lanzar el programa.</span></div>
    <div class="cs-aviso" aria-live="polite"></div></div>`;
  const estado = cont.querySelector('.estado-guardado'), btn = cont.querySelector('[data-cs]'), consola = cont.querySelector('.consola'), lugar = cont.querySelector('.cs-aviso');
  let entradas = [], semilla = 1, ocupado = false;
  const ed = crearEditor(cont.querySelector('.editor'), (datos && datos.codigo) || PLANTILLA, {
    modo: 'text/x-csharp', etiqueta: 'Código C#', alEjecutar: () => lanzar([]),
    alCambiar: (v) => { alCambiar({ codigo: v }); estado.textContent = S.demo ? 'Guardado en este navegador' : S.pat ? 'Guardado. Se sincroniza en unos segundos' : 'Guardado en este dispositivo'; },
  });
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
    b.textContent = (r.status === 'compile' ? 'Error de compilación en la línea ' + r.line : r.status === 'exception' ? 'El programa se ha parado en la línea ' + r.line : 'Programa detenido' + (r.line ? ' (línea ' + r.line + ')' : '')) + (r.code && r.code !== 'SIM' ? ' (' + r.code + ')' : '');
    const m = document.createElement('span'); m.textContent = r.error;
    aviso.append(b, m);
    if (r.line) { const ir = document.createElement('button'); ir.type = 'button'; ir.className = 'boton mini'; ir.textContent = 'Ir a la línea ' + r.line; ir.addEventListener('click', () => ed.ir(r.line)); aviso.append(ir); ed.marcar(r.line); }
    lugar.append(aviso);
  }
  btn.addEventListener('click', () => lanzar([]));
  return { foco: () => ed.foco() };
}
function montarNotas(cont, datos, alCambiar, titulo) {
  cont.innerHTML = `<div class="hz hz-notas"><div class="barra-lab"><button type="button" class="boton mini" data-notas="bajar">Descargar .md</button><span class="suave">Respuestas, apuntes o borradores. Se guarda solo.</span><span class="estado-guardado"></span></div><div class="editor"></div></div>`;
  const ed = crearEditor(cont.querySelector('.editor'), (datos && datos.texto) || '', { modo: 'text/plain', numeros: false, etiqueta: 'Notas', alCambiar: (v) => { alCambiar({ texto: v }); cont.querySelector('.estado-guardado').textContent = 'Guardado'; } });
  cont.querySelector('[data-notas]').addEventListener('click', () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ed.get()], { type: 'text/markdown' })); a.download = (titulo || 'notas').replace(/[^\wáéíóúñ -]+/gi, '').trim() + '.md';
    document.body.append(a); a.click(); a.remove();
  });
  return { foco: () => ed.foco() };
}

// ---------- ficha de una tarea ----------
function vistaTarea(clave) {
  const t = tareas().find((x) => x.clave === clave);
  if (!t) return cabecera('Tarea') + vacio('Esa tarea ya no está en Aules. <a href="#inicio">Volver</a>');
  const c = t.cursoId && cursos().find((x) => x.id === t.cursoId), est = estadoTarea(t), tr = trabajoDeTarea(clave), h = herramientaPara(t.modulo, t.nombre);
  const fecha = (et, ts) => (ts ? `<div><dt>${et}</dt><dd>${fCorta(ts)}, ${fHora(ts)}</dd></div>` : '');
  return `<div class="cab-modulo corte trama-esquina" style="--mod:${colorDe(t.modulo)}">
      <a href="${c ? '#modulo-' + c.id : '#calendario'}" class="antetitulo">← ${esc(t.modulo)}</a><h1>${esc(t.nombre)}</h1>
      ${est ? `<span class="chip ${est[0]}">${esc(est[1])}</span>` : ''}</div>
    <div class="aviso-tarea s-${situacion(t)}" style="--mod:${colorDe(t.modulo)}">${{
      hecha: `Entregada${t.enviada ? ' el ' + fCorta(t.enviada) : ''}${t.nota10 != null ? '. Nota: ' + fNota(t.nota10) + ' sobre 10' : '. Aún sin nota'}.`,
      futura: `Aún no se puede entregar: se abre el ${fCorta(t.apertura)} a las ${fHora(t.apertura)}.`,
      cerrada: 'Cerrada: Aules ya no admite entregas de esta tarea.',
      antigua: `Venció hace más de dos semanas (${fCorta(t.entrega)}). Si aún cuenta, pregunta al profesor.`,
      retraso: `Venció ${cuando(t.entrega).toLowerCase()}, pero Aules todavía la admite${t.cierre ? ' hasta el ' + fCorta(t.cierre) + ' a las ' + fHora(t.cierre) : ''}.`,
      pendiente: t.entrega ? `Entrega: ${cuando(t.entrega).toLowerCase()}${t.cierre && t.cierre > t.entrega ? ' (se admite hasta el ' + fCorta(t.cierre) + ')' : ''}.` : 'Sin fecha de entrega.',
    }[situacion(t)]}
      ${t.url && porHacer(t) ? `<a class="boton principal" href="${esc(t.url)}" target="_blank" rel="noopener">Entregar en Aules ↗</a>` : ''}</div>
    <div class="dos-col">
      <section class="bloque"><header><h2>Enunciado</h2>${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">Abrir en Aules ↗</a>` : ''}</header>
        <div class="panel corte"><p class="pre">${t.enunciado ? esc(t.enunciado) : '<span class="suave">Esta tarea no tiene enunciado escrito en Aules.</span>'}</p>
        ${(t.adjuntos || []).length ? `<p class="suave">Adjuntos en Aules: ${t.adjuntos.map(esc).join(', ')}</p>` : ''}</div></section>
      <div class="columna">
        <section class="bloque trabajar corte">
          <div class="lineas-velocidad" aria-hidden="true"></div>
          <header><h2>Trabajar en Doodle</h2></header>
          ${tr ? `<p>Ya lo tienes empezado con <b>${esc(HERR[tr.tipo])}</b>. Lo que hagas se guarda solo; cuando acabes, descárgalo y súbelo a Aules.</p><div class="fila-botones"><a class="boton principal" href="#trabajo-${tr.id}">Seguir trabajando</a></div>`
            : `<p>Se abrirá <b>${esc(HERR[h.tipo])}</b>${h.notacion ? ' (' + esc({ er: 'E/R en notación Chen', relacional: 'modelo relacional', uml: 'UML', casos: 'casos de uso' }[h.notacion]) + ')' : ''}. Si no es la herramienta que necesitas, puedes cambiarla dentro.</p><div class="fila-botones"><button type="button" class="boton principal" data-acc="trabajar" data-v="${esc(clave)}">Empezar a trabajar</button></div>`}
        </section>
        <section class="bloque"><header><h2>Datos</h2></header>
          <dl class="datos-tarea panel corte">${fecha('Entrega', t.entrega)}${fecha('Se abre', t.apertura)}${fecha('Cierre', t.cierre)}${t.hecha ? fecha('Enviada', t.enviada) : ''}
            <div><dt>Nota</dt><dd>${t.nota10 != null ? `<b>${fNota(t.nota10)}</b> / 10` : '—'}</dd></div></dl></section>
        ${t.comentario ? `<section class="bloque"><header><h2>Comentario del profesor</h2></header><div class="panel corte"><p class="pre">${esc(t.comentario)}</p></div></section>` : ''}
      </div>
    </div>`;
}

// ---------- espacio de trabajo ----------
function vistaTrabajo(id) {
  const w = S.prog.trabajos[id];
  if (!w || w.borrado) return cabecera('Trabajo') + vacio('Este trabajo no existe. <a href="#ejercicios">Volver</a>');
  const t = w.tarea && tareas().find((x) => x.clave === w.tarea);
  return `<div class="taller" id="taller" style="--mod:${colorDe(w.modulo)}">
    <header class="taller-cab corte">
      <a class="boton mini" href="${t ? '#tarea-' + esc(w.tarea) : '#ejercicios'}">←</a>
      <div class="taller-titulo"><span class="antetitulo">${esc(w.modulo || 'Sin módulo')}${t && t.entrega ? ', entrega el ' + fCorta(t.entrega) : ''}</span><input type="text" id="w-titulo" value="${esc(w.titulo)}" aria-label="Nombre del trabajo"></div>
      <select id="w-tipo" aria-label="Herramienta">${Object.entries(HERR).map(([k, v]) => `<option value="${k}" ${k === w.tipo ? 'selected' : ''}>${v}</option>`).join('')}</select>
      ${t && t.enunciado ? '<button type="button" class="boton mini" data-acc="enunciado" aria-expanded="false">Enunciado</button>' : ''}
    </header>
    ${t && t.enunciado ? `<aside class="taller-enun panel corte" hidden><p class="pre">${esc(t.enunciado)}</p></aside>` : ''}
    <div class="taller-herr" id="taller-herr"></div>
  </div>`;
}
function montarTrabajo(id) {
  const w = S.prog.trabajos[id], caja = document.getElementById('taller-herr');
  if (!w || !caja) return;
  S.montado = id;
  const guardar = (datos) => { const act = S.prog.trabajos[id]; cambiar('trabajos', id, { datos: { ...act.datos, [act.tipo]: datos } }); };
  const datos = (w.datos || {})[w.tipo];
  const h = { diagrama: () => montarDiagrama(caja, datos, guardar, { notacion: w.notacion, titulo: w.titulo }), sql: () => montarSql(caja, datos, guardar), java: () => montarJava(caja, datos, guardar),
    csharp: () => montarCsharp(caja, datos, guardar), web: () => montarWeb(caja, datos, guardar), kanban: () => montarKanban(caja, datos, guardar), notas: () => montarNotas(caja, datos, guardar, w.titulo) }[w.tipo] || (() => montarNotas(caja, datos, guardar, w.titulo));
  h();
}

// ---------- ejercicios y trabajos por módulo ----------
function modulosTaller() {
  const ms = [...modulosCatalogo(), ...cursos().map((c) => nombreModulo(c.nombre)), ...trabajos().map((t) => t.modulo).filter(Boolean)];
  return [...new Set(ms)].filter((m) => m !== 'Tutoría');
}
function vistaEjercicios() {
  const mods = modulosTaller();
  // de entrada, el módulo con más cosas por entregar
  if (!mods.includes(S.filtro.modulo)) { const T = tareas().filter(porHacer); S.filtro.modulo = [...mods].sort((a, b) => T.filter((t) => t.modulo === b).length - T.filter((t) => t.modulo === a).length)[0] || ''; }
  const m = S.filtro.modulo;
  return cabecera('Ejercicios', '<span class="suave">Haz aquí las tareas: diagramas, SQL, Java, C#, web… Todo se guarda solo.</span>') + `
  <div class="chips-mod" role="group" aria-label="Módulo">${mods.map((x) => `<button type="button" data-acc="filtro-mod" data-v="${esc(x)}" aria-pressed="${x === m}" style="--mod:${colorDe(x)}"><i class="punto-mod"></i>${esc(x)}</button>`).join('')}</div>
  <details class="panel corte"><summary>+ Nuevo trabajo libre</summary>
    <form id="f-trabajo" class="rejilla-form">
      <label class="campo"><span>Nombre</span><input type="text" id="w-nombre" required placeholder="Práctica de normalización"></label>
      <label class="campo"><span>Módulo</span><input type="text" id="w-modulo" list="lista-mods-ej" value="${esc(m)}" required></label>
      <label class="campo"><span>Herramienta</span><select id="w-herr">${Object.entries(HERR).map(([k, v]) => `<option value="${k}" ${k === herramientaPara(m).tipo ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <div class="campo campo-boton"><button class="boton principal">Crear</button></div>
      <datalist id="lista-mods-ej">${mods.map((x) => `<option value="${esc(x)}">`).join('')}</datalist>
    </form></details>
  ${(window.EJERCICIOS || []).some((x) => x.modulo === m) || Object.values(S.prog.ejPropios).some((e) => e.modulo === m) ? `<details class="panel corte"><summary>+ Añadir un ejercicio de C# al catálogo</summary>
    <form id="f-ej" class="rejilla-form">
      <label class="campo"><span>Tema</span><input type="text" id="e-tema" required placeholder="Tema 5: funciones"></label>
      <label class="campo"><span>Número</span><input type="text" id="e-n" placeholder="5.1.1"></label>
      <label class="campo campo-ancho"><span>Enunciado</span><textarea id="e-texto" required></textarea></label>
      <div class="campo campo-boton"><button class="boton principal">Añadir ejercicio</button></div>
    </form></details>` : ''}
  ${listaEjercicios(m)}`;
}
function listaEjercicios(modulo) {
  const color = colorDe(modulo);
  const conTrabajo = (t) => trabajoDeTarea(t.clave);
  const ts = tareas().filter((t) => t.modulo === modulo && t.origen === 'aules');
  const libres = trabajos().filter((w) => w.modulo === modulo && !w.tarea).sort((a, b) => (b.t || 0) - (a.t || 0));
  let html = '';
  const filaEj = (t) => { const est = estadoTarea(t), w = conTrabajo(t);
    return `<div class="ej ej-t corte s-${situacion(t)}"><span class="ej-num">${t.entrega ? cuando(t.entrega).replace(/ a las .*/, '') : 'Sin fecha'}</span>
      <a class="ej-txt ej-tarea" href="#tarea-${esc(t.clave)}">${esc(t.nombre)}</a>
      ${est ? `<span class="chip ${est[0]}">${esc(est[1])}</span>` : '<span></span>'}
      <div class="ej-acc">${w ? `<a class="boton mini principal" href="#trabajo-${w.id}">Seguir (${esc(HERR[w.tipo])})</a>` : `<button type="button" class="boton mini" data-acc="trabajar" data-v="${esc(t.clave)}">Empezar</button>`}</div></div>`; };
  const orden = (a, b) => (a.entrega || 9e9) - (b.entrega || 9e9);
  const activas = ts.filter((t) => porHacer(t) || situacion(t) === 'futura' || conTrabajo(t) && !t.hecha).sort(orden), resto = ts.filter((t) => !activas.includes(t)).sort((a, b) => orden(b, a));
  if (ts.length) html += `<section class="bloque" style="--mod:${color}"><header><h2>Tareas de Aules</h2></header>
    <div class="lista">${activas.map(filaEj).join('') || vacio('No tienes nada pendiente aquí.')}</div>
    ${resto.length ? `<details class="plegable"><summary>Entregadas, cerradas y antiguas <span class="suave">(${resto.length})</span></summary><div class="lista">${resto.map(filaEj).join('')}</div></details>` : ''}</section>`;
  if (libres.length) html += `<section class="bloque" style="--mod:${color}"><header><h2>Trabajos libres</h2></header><div class="lista">${libres.map((w) => `<div class="ej ej-t corte"><span class="ej-num">${esc(HERR[w.tipo])}</span><a class="ej-txt ej-tarea" href="#trabajo-${w.id}">${esc(w.titulo)}</a><span></span>
    <div class="ej-acc"><button type="button" class="boton mini peligro" data-acc="borrar-trabajo" data-v="${w.id}">Borrar</button><a class="boton mini principal" href="#trabajo-${w.id}">Abrir</a></div></div>`).join('')}</div></section>`;
  const lista = catalogo().filter((e) => e.modulo === modulo);
  for (const t of [...new Set(lista.map((e) => e.tema))]) {
    const del = lista.filter((e) => e.tema === t), n = del.filter(hecho).length;
    let grupo = null;
    html += `<details class="bloque tema corte" style="--mod:${color}">
      <summary><span class="tema-nombre">${esc(t)}</span><span class="suave num">${n} de ${del.length} hechos</span><div class="barra"><i style="width:${n / del.length * 100}%"></i></div></summary>
      <div class="lista">${del.map((e) => {
        const g = e.grupo && e.grupo !== grupo ? `<p class="grupo">${esc((grupo = e.grupo))}</p>` : '';
        return g + `<div class="ej corte ${hecho(e) ? 'hecho' : ''}" data-id="${esc(e.id)}">
          <label class="ej-check" title="Marcar como hecho"><input type="checkbox" data-acc="ej-hecho" ${hecho(e) ? 'checked' : ''}><span class="sr">Hecho</span></label>
          <span class="ej-num">${esc(e.n || '·')}</span>
          <p class="ej-txt">${esc(e.texto)}</p>
          <div class="ej-acc">${e.propio ? '<button type="button" class="boton mini peligro" data-acc="borrar-ej">Borrar</button>' : ''}
            <button type="button" class="boton mini principal" data-acc="abrir-lab">${e.lenguaje === 'csharp' ? 'Programar ▸' : 'Notas ▸'}</button></div>
        </div>`;
      }).join('')}</div></details>`;
  }
  return html || vacio('Aún no hay nada en este módulo. Crea un trabajo libre arriba.');
}

// Ejercicio del catálogo a pantalla completa: enunciado a la izquierda, código y consola a la derecha.
function abrirLab(id) {
  const todos = catalogo(), e0 = todos.find((e) => e.id === id); if (!e0) return;
  const lista = todos.filter((x) => x.modulo === e0.modulo), pos = lista.findIndex((x) => x.id === id), e = lista[pos];
  const g = S.prog.ej[id] || {};
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
      <section class="lab-enun"><span class="antetitulo">${esc(e.grupo || e.modulo)}</span><p class="pre">${esc(e.texto)}</p>${e.ejemplo ? `<pre class="consola">${esc(e.ejemplo)}</pre>` : ''}</section>
      <section class="lab-trabajo" id="lab-trabajo"></section>
    </div>`;
  document.body.classList.add('con-lab');
  capa.hidden = false;
  const caja = capa.querySelector('#lab-trabajo');
  const h = e.lenguaje === 'csharp' ? montarCsharp(caja, g, (d) => cambiar('ej', id, { codigo: d.codigo })) : montarNotas(caja, { texto: g.codigo }, (d) => cambiar('ej', id, { codigo: d.texto }), e.n);
  h.foco();
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
  else if (acc === 'trabajar') trabajarEnTarea(el.dataset.v);
  else if (acc === 'enunciado') { const a = document.querySelector('.taller-enun'), abierto = el.getAttribute('aria-expanded') === 'true'; a.hidden = abierto; el.setAttribute('aria-expanded', String(!abierto)); }
  else if (acc === 'borrar-trabajo') { if (el.dataset.confirmar !== 'si') { el.dataset.confirmar = 'si'; el.textContent = '¿Seguro?'; return; } cambiar('trabajos', el.dataset.v, { borrado: true }); render(); }
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
  else if (el.id === 'w-tipo') { cambiar('trabajos', S.montado, { tipo: el.value }); render(true); }
  else if (el.id === 'w-titulo') cambiar('trabajos', S.montado, { titulo: el.value.trim() || 'Sin nombre' });
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
    cambiar('ejPropios', 'e' + Date.now().toString(36), { modulo: S.filtro.modulo, tema: val('e-tema'), n: val('e-n'), texto: val('e-texto'), lenguaje: 'csharp' });
    render();
  } else if (f.id === 'f-trabajo') {
    const tipo = val('w-herr'), modulo = val('w-modulo');
    location.hash = 'trabajo-' + crearTrabajo({ titulo: val('w-nombre'), modulo, tipo, notacion: tipo === 'diagrama' ? herramientaPara(modulo).notacion : undefined });
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
