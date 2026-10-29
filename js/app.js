// Doodle: todo el curso en una web. Lee data/curso.enc (lo genera el robot desde Aules),
// guarda tu progreso cifrado en este navegador y, si configuras GitHub, en el repo (data/progreso.enc).
import { cifrar, descifrar } from './cripto.js';

const D = 86400;
const ahora = () => Math.floor(Date.now() / 1000);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* idem */ } },
};
const app = document.getElementById('app');

const S = {
  pass: null, pat: null, demo: false, curso: null, sobreCurso: null,
  prog: progVacio(), cfg: LS.get('doodle-cfg') || {},
  remoto: { sha: null, salt: null, estado: '' }, sync: '',
  filtro: { modulo: '', estado: 'todos' }, verEntregadas: false,
};
function progVacio() { return { ej: {}, tareas: {}, ejPropios: {} }; }

// ---------- formato ----------
const FMT_DIA = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const FMT_CORTA = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
const FMT_HORA = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });
const fDia = (ts) => FMT_DIA.format(ts * 1000);
const fCorta = (ts) => (ts ? FMT_CORTA.format(ts * 1000) : '—');
const fHora = (ts) => FMT_HORA.format(ts * 1000);
const fNota = (n) => (n == null || isNaN(n) ? '—' : n.toLocaleString('es-ES', { maximumFractionDigits: 2 }));
function hace(ms) {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 1) return 'ahora mismo'; if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} días`;
}
function quedan(ts) {
  const d = Math.floor(ts / D) - Math.floor(ahora() / D); // días naturales (UTC; suficiente para "hoy/mañana")
  if (d < 0) return `hace ${-d} ${d === -1 ? 'día' : 'días'}`;
  return d === 0 ? 'hoy' : d === 1 ? 'mañana' : `en ${d} días`;
}
const sinAcentos = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const nombreModulo = (n) => (n || '').replace(/^\s*[\dA-Z]{3,6}\s*[-–·:]\s*/, '');

// ---------- datos derivados ----------
function cursos() { return (S.curso && S.curso.cursos) || []; }
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
function agenda() {
  const items = tareas().filter((t) => t.entrega).map((t) => ({
    fecha: t.entrega, nombre: t.nombre, modulo: t.modulo, url: t.url, tarea: t,
    chip: t.hecha ? (t.nota10 != null ? ['ok', 'Nota ' + fNota(t.nota10)] : ['ok', 'Entregada'])
      : t.entrega < ahora() ? ['mal', 'Sin entregar'] : t.estado === 'draft' ? ['ojo', 'Borrador'] : ['info', t.tipo === 'examen' ? 'Examen' : 'Pendiente'],
  }));
  const porId = Object.fromEntries(cursos().map((c) => [c.id, nombreModulo(c.nombre)]));
  for (const e of (S.curso && S.curso.eventos) || []) {
    if (e.tipo === 'assign') continue; // ya salen como tareas
    items.push({ fecha: e.fecha, nombre: e.nombre, modulo: porId[e.curso] || '', url: e.url, chip: ['info', e.tipo === 'quiz' ? 'Cuestionario' : 'Evento'] });
  }
  return items.sort((a, b) => a.fecha - b.fecha);
}

// ---------- progreso: local + GitHub ----------
function mezclar(a, b) {
  const out = progVacio();
  for (const sec of Object.keys(out)) {
    out[sec] = { ...(a[sec] || {}) };
    for (const [k, v] of Object.entries((b && b[sec]) || {})) if (!out[sec][k] || (v.t || 0) > (out[sec][k].t || 0)) out[sec][k] = v;
  }
  return out;
}
const claveLocal = () => (S.demo ? 'doodle-prog-demo' : 'doodle-prog');
let tLocal, tRemoto;
function cambiar(sec, id, cambio) {
  S.prog[sec][id] = { ...S.prog[sec][id], ...cambio, t: Date.now() };
  clearTimeout(tLocal); tLocal = setTimeout(guardarLocal, 600);
  if (S.pat && !S.demo) { clearTimeout(tRemoto); tRemoto = setTimeout(() => subir().catch(errSync), 4000); estadoSync('Guardando…', 'ambar'); }
}
async function guardarLocal() {
  if (S.demo) return LS.set(claveLocal(), S.prog);
  const prev = LS.get(claveLocal());
  LS.set(claveLocal(), await cifrar(S.pass, S.prog, prev && prev.salt));
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
  if (r.status === 401) throw new Error('GitHub rechaza la clave (401). Revisa la clave de acceso en Ajustes.');
  return r;
}
async function bajar() {
  const r = await gh('/contents/data/progreso.enc');
  if (r.status === 404) { S.remoto.sha = null; return null; }
  if (!r.ok) throw new Error('GitHub respondió ' + r.status + ' al leer tu progreso.');
  const j = await r.json();
  S.remoto.sha = j.sha;
  const sobre = JSON.parse(atob(j.content.replace(/\n/g, '')));
  S.remoto.salt = sobre.salt;
  try { return await descifrar(S.pass, sobre); } catch (e) { throw new Error('El progreso guardado en GitHub usa otra contraseña.'); }
}
async function subir(reintento) {
  const sobre = await cifrar(S.pass, S.prog, S.remoto.salt);
  S.remoto.salt = sobre.salt;
  const r = await gh('/contents/data/progreso.enc', { method: 'PUT', body: JSON.stringify({
    message: 'Progreso ' + new Date().toISOString().slice(0, 16), content: btoa(JSON.stringify(sobre)), ...(S.remoto.sha ? { sha: S.remoto.sha } : {}),
  }) });
  if ((r.status === 409 || r.status === 422) && !reintento) { // otro dispositivo guardó antes: mezclar y repetir
    const rem = await bajar(); if (rem) S.prog = mezclar(S.prog, rem);
    return subir(true);
  }
  if (!r.ok) throw new Error('GitHub respondió ' + r.status + ' al guardar tu progreso.');
  S.remoto.sha = (await r.json()).content.sha;
  estadoSync('Progreso sincronizado', 'si');
}
function errSync(e) { estadoSync(e.message, 'no'); }
function estadoSync(txt, ok) { S.remoto.estado = [txt, ok]; const el = document.getElementById('estado-progreso'); if (el) { el.textContent = txt; el.dataset.ok = ok; } }

async function sincronizarAules(boton) {
  boton.disabled = true; S.sync = 'Pidiendo a GitHub que descargue Aules…'; pintarCabecera();
  try {
    const desde = new Date().toISOString();
    const r = await gh('/actions/workflows/sincronizar.yml/dispatches', { method: 'POST', body: JSON.stringify({ ref: 'main' }) });
    if (r.status !== 204) throw new Error('No se pudo lanzar la sincronización (GitHub ' + r.status + ').');
    for (let i = 0; i < 40; i++) { // hasta ~10 min
      await new Promise((ok) => setTimeout(ok, 15000));
      const runs = await (await gh('/actions/workflows/sincronizar.yml/runs?per_page=1&event=workflow_dispatch')).json();
      const run = (runs.workflow_runs || [])[0];
      if (!run || run.created_at < desde.slice(0, 19)) { S.sync = 'En cola…'; pintarCabecera(); continue; }
      if (run.status !== 'completed') { S.sync = 'Descargando de Aules y publicando…'; pintarCabecera(); continue; }
      if (run.conclusion !== 'success') throw new Error('La sincronización falló. Mira el detalle en GitHub → Actions.');
      const sobre = await (await fetch('data/curso.enc?' + Date.now(), { cache: 'no-store' })).json();
      S.sobreCurso = sobre; S.curso = await descifrar(S.pass, sobre); S.sync = '';
      return render();
    }
    throw new Error('La sincronización tarda demasiado. Recarga la página en unos minutos.');
  } catch (e) { S.sync = e.message; pintarCabecera(); } finally { boton.disabled = false; }
}

// ---------- entrada ----------
async function arrancar() {
  try { const r = await fetch('data/curso.enc', { cache: 'no-store' }); if (r.ok) S.sobreCurso = await r.json(); } catch (e) { /* sin datos todavía */ }
  if (!S.sobreCurso && !location.hostname.endsWith('.github.io')) return entrarDemo(); // vista previa fuera de GitHub Pages
  const recordada = LS.get('doodle-recordar');
  if (recordada) { try { return await entrar(recordada); } catch (e) { LS.del('doodle-recordar'); } }
  pintarBloqueo();
}
async function entrar(pass) {
  const curso = S.sobreCurso ? await descifrar(pass, S.sobreCurso) : { cursos: [], eventos: [], avisos: [] };
  const local = LS.get('doodle-prog');
  S.prog = local ? await descifrar(pass, local) : progVacio(); // sin datos de Aules, esto comprueba la contraseña
  S.pass = pass; S.curso = curso; S.demo = false;
  if (S.cfg.patSobre) { try { S.pat = (await descifrar(pass, S.cfg.patSobre)).pat; } catch (e) { S.pat = null; } }
  render();
  if (S.pat) {
    estadoSync('Leyendo progreso de GitHub…', 'ambar');
    try { const rem = await bajar(); if (rem) { S.prog = mezclar(S.prog, rem); guardarLocal(); render(); } estadoSync('Progreso sincronizado', 'si'); } catch (e) { errSync(e); }
  }
}
function entrarDemo() {
  const curso = JSON.parse(JSON.stringify(window.DEMO));
  const delta = ahora() - Math.floor(Date.parse(curso.generado) / 1000); // las fechas de ejemplo se mueven a hoy
  (function mover(o) { for (const [k, v] of Object.entries(o)) { if (v && typeof v === 'object') mover(v); else if (['entrega', 'apertura', 'enviada', 'fecha'].includes(k) && v > 0) o[k] = v + delta; } })(curso);
  curso.generado = new Date(Date.now() - 2 * 3600e3).toISOString();
  S.demo = true; S.curso = curso; S.pass = null; S.pat = null;
  S.prog = mezclar(progVacio(), LS.get('doodle-prog-demo'));
  render();
}

function pintarBloqueo(error) {
  const hay = !!S.sobreCurso;
  app.innerHTML = `
  <div class="bloqueo cuadriculado envoltura"><form class="tarjeta" id="f-entrar">
    <div class="marca-app">Dood<span>le</span></div>
    <p class="suave" style="margin:0">${hay ? 'Tu curso de Aules está cifrado. Escribe tu contraseña para abrirlo.' : 'Todavía no hay datos de Aules publicados. Puedes entrar igualmente para guardar tus ejercicios y tareas, o ver la app con datos de ejemplo.'}</p>
    <label class="campo"><span>Contraseña</span><input type="password" id="pass" autocomplete="current-password" required autofocus></label>
    <label class="casilla"><input type="checkbox" id="recordar"> Recordarla en este dispositivo (solo si es tuyo)</label>
    ${error ? `<p class="error-txt" role="alert">${esc(error)}</p>` : ''}
    <div class="fila-botones"><button class="boton principal" id="b-entrar">Entrar</button>
    <button type="button" class="boton" id="b-demo">Ver con datos de ejemplo</button></div>
  </form></div>`;
  document.getElementById('f-entrar').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const pass = document.getElementById('pass').value, b = document.getElementById('b-entrar');
    b.disabled = true; b.textContent = 'Abriendo…';
    try { await entrar(pass); } // render() guarda la contraseña si se marcó "Recordarla"
    catch (e) { S.recordar = false; return pintarBloqueo('Contraseña incorrecta. Es la que pusiste en el secreto CLAVE_MAESTRA de GitHub.'); }
  });
  document.getElementById('recordar').addEventListener('change', (ev) => { S.recordar = ev.target.checked; });
  document.getElementById('b-demo').addEventListener('click', entrarDemo);
}

// ---------- marco ----------
const VISTAS = [['inicio', 'Inicio'], ['modulos', 'Módulos'], ['calendario', 'Calendario'], ['notas', 'Notas'], ['ejercicios', 'Ejercicios'], ['ajustes', 'Ajustes']];
function render() {
  if (S.recordar && S.pass) { LS.set('doodle-recordar', S.pass); S.recordar = false; }
  const v = location.hash.slice(1) || 'inicio';
  const base = v.startsWith('modulo-') ? 'modulos' : v;
  app.innerHTML = `
  ${S.demo ? '<div class="demo-banda"><div class="envoltura">Estás viendo <b>datos de ejemplo</b>. Nada de esto es tuyo; lo que marques se queda solo en este navegador. <a href="#" id="salir-demo">Salir</a></div></div>' : ''}
  <header class="cabecera cuadriculado"><div class="envoltura">
    <div style="display:grid;gap:6px"><span class="antetitulo">${esc(S.curso.sitio ? S.curso.sitio.nombre : 'DAM · 1.º')}</span><h1>Dood<span>le</span></h1></div>
    <div class="estado-sync" id="estado-sync"></div>
  </div></header>
  <nav class="pestanas" aria-label="Secciones"><div class="envoltura">
    ${VISTAS.map(([id, t]) => `<a href="#${id}" ${id === base ? 'aria-current="page"' : ''}>${t}</a>`).join('')}
  </div></nav>
  <main><div class="envoltura" id="vista"></div></main>`;
  pintarCabecera();
  const vista = document.getElementById('vista');
  if (v.startsWith('modulo-')) vista.innerHTML = vistaModulo(+v.slice(7));
  else vista.innerHTML = ({ inicio: vistaInicio, modulos: vistaModulos, calendario: vistaCalendario, notas: vistaNotas, ejercicios: vistaEjercicios, ajustes: vistaAjustes }[v] || vistaInicio)();
  if (v === 'ejercicios') montarEjercicios();
  const sd = document.getElementById('salir-demo');
  if (sd) sd.addEventListener('click', (ev) => { ev.preventDefault(); S.demo = false; S.curso = null; location.hash = ''; pintarBloqueo(); });
}
function pintarCabecera() {
  const el = document.getElementById('estado-sync'); if (!el) return;
  const g = S.curso.generado;
  el.innerHTML = `
    <span class="punto" data-ok="${g ? (Date.now() - Date.parse(g) < 12 * 3600e3 ? 'si' : 'ambar') : 'no'}">${g ? 'Aules actualizado ' + hace(Date.parse(g)) : 'Sin datos de Aules'}</span>
    ${S.pat || S.demo ? `<span class="punto" id="estado-progreso" data-ok="${S.demo ? '' : esc(S.remoto.estado[1] || '')}">${S.demo ? 'Progreso en este navegador' : esc(S.remoto.estado[0] || 'Progreso en GitHub')}</span>` : '<span class="punto">Progreso solo en este dispositivo</span>'}
    ${S.sync ? `<span>${esc(S.sync)}</span>` : ''}
    ${S.pat ? '<button class="boton mini" id="b-sync">Sincronizar ahora</button>' : ''}`;
  const b = document.getElementById('b-sync'); if (b) b.addEventListener('click', () => sincronizarAules(b));
}
window.addEventListener('hashchange', () => { if (S.curso) { render(); window.scrollTo(0, 0); } });

// ---------- piezas ----------
function entradaAgenda(i, conDia) {
  const t = i.tarea, vencida = t && !t.hecha && i.fecha < ahora();
  const titulo = i.url ? `<a href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.nombre)}</a>` : `<strong>${esc(i.nombre)}</strong>`;
  const propia = t && t.origen === 'propia' ? `
    <div class="fila-botones" style="margin-top:4px">
      <label class="casilla"><input type="checkbox" data-acc="hecha" data-id="${esc(t.clave)}" ${t.hecha ? 'checked' : ''}> Hecha</label>
      <label class="casilla">Nota <input type="number" min="0" step="0.01" style="width:80px;padding:4px 6px" data-acc="nota" data-id="${esc(t.clave)}" value="${t.nota ?? ''}"> / ${t.max || 10}</label>
      <button class="boton mini peligro" data-acc="borrar-tarea" data-id="${esc(t.clave)}">Borrar</button>
    </div>` : '';
  return `<div class="entrada ${vencida ? 'vencida' : ''}">
    <span class="hora">${conDia ? fCorta(i.fecha) + '<br>' : ''}${fHora(i.fecha)}</span>
    <div class="que">${titulo}<small>${esc(i.modulo)} · ${quedan(i.fecha)}${t && t.origen === 'propia' ? ' · añadida por ti' : ''}</small>${propia}</div>
    <span class="chip ${i.chip[0]}">${esc(i.chip[1])}</span>
  </div>`;
}
const cifra = (valor, texto) => `<div class="cifra"><b>${valor}</b><small>${texto}</small></div>`;
function graficoNotas(filas) {
  if (!filas.length) return '<p class="vacio">Aún no hay notas.</p>';
  return `<div class="grafico" role="img" aria-label="Notas sobre 10">
    ${filas.map(([n, v]) => `<div class="g-fila"><span class="nombre" title="${esc(n)}">${esc(n)}</span>
      <div class="g-pista"><i class="${v < 5 ? 'susp' : ''}" style="width:${Math.max(0, Math.min(10, v)) * 10}%"></i></div><b>${fNota(v)}</b></div>`).join('')}
    <div class="g-eje" aria-hidden="true"><span></span><div><span>0</span><span>5</span><span>10</span></div><span></span></div>
  </div>`;
}

// ---------- vistas ----------
function vistaInicio() {
  const T = tareas(), ag = agenda(), h = ahora();
  const vencidas = T.filter((t) => !t.hecha && t.entrega && t.entrega < h).sort((a, b) => a.entrega - b.entrega);
  const proximas = ag.filter((i) => i.fecha >= h && i.fecha <= h + 14 * D && !(i.tarea && i.tarea.hecha));
  const medias = cursos().map(mediaCurso).filter((m) => m != null);
  const cat = catalogo(), hechos = cat.filter((e) => (S.prog.ej[e.id] || {}).hecho).length;
  const notas = T.filter((t) => t.nota10 != null).sort((a, b) => (b.entrega || 0) - (a.entrega || 0)).slice(0, 5);
  const nombre = (S.curso.usuario || '').split(' ')[0];
  return `
  <section class="bloque"><header><h2>${nombre ? 'Hola, ' + esc(nombre[0] + nombre.slice(1).toLowerCase()) : 'Tu curso'}</h2><span class="suave">${fDia(h)}</span></header>
    <div class="cifras">
      ${cifra(medias.length ? fNota(medias.reduce((a, b) => a + b) / medias.length) : '—', 'Media de los módulos (sobre 10)')}
      ${cifra(`${T.filter((t) => t.hecha).length}<span class="suave" style="font-size:18px"> / ${T.length}</span>`, 'Tareas entregadas')}
      ${cifra(`${proximas.length}`, 'Entregas en los próximos 14 días')}
      ${cifra(`${hechos}<span class="suave" style="font-size:18px"> / ${cat.length}</span>`, 'Ejercicios hechos')}
    </div></section>
  ${vencidas.length ? `<section class="bloque"><header><h2>Sin entregar</h2><span class="chip mal">${vencidas.length} con la fecha pasada</span></header>
    <div class="agenda">${vencidas.map((t) => entradaAgenda(agenda().find((i) => i.tarea && i.tarea.clave === t.clave), true)).join('')}</div></section>` : ''}
  <section class="bloque"><header><h2>Próximas entregas</h2><a href="#calendario">Ver calendario</a></header>
    <div class="agenda">${proximas.length ? proximas.map((i) => entradaAgenda(i, true)).join('') : '<p class="vacio">Nada en las dos próximas semanas.</p>'}</div></section>
  <section class="bloque"><header><h2>Últimas notas</h2><a href="#notas">Todas las notas</a></header>
    ${notas.length ? `<div class="tabla-caja"><table><thead><tr><th>Tarea</th><th>Módulo</th><th style="text-align:right">Nota</th></tr></thead><tbody>
      ${notas.map((t) => `<tr><td>${esc(t.nombre)}</td><td>${esc(t.modulo)}</td><td class="n"><span class="chip ${t.nota10 >= 5 ? 'ok' : 'mal'}">${fNota(t.nota10)}</span></td></tr>`).join('')}
    </tbody></table></div>` : '<p class="vacio">Aún no hay notas.</p>'}</section>
  ${(S.curso.avisos || []).length ? `<section class="bloque"><header><h2>Avisos de la sincronización</h2></header><div class="panel"><p class="suave">Aules no dejó leer estas partes; el resto está al día.</p><ul>${S.curso.avisos.map((a) => `<li class="mono">${esc(a)}</li>`).join('')}</ul></div></section>` : ''}`;
}

function vistaModulos() {
  if (!cursos().length) return `<section class="bloque"><header><h2>Módulos</h2></header><p class="vacio">Cuando el robot sincronice Aules, aquí aparecerán tus módulos. Mientras, puedes usar Ejercicios y Calendario.</p></section>`;
  const T = tareas();
  return `<section class="bloque"><header><h2>Módulos</h2><span class="suave">${cursos().length} en Aules</span></header><div class="modulos">
    ${cursos().map((c) => {
      const m = mediaCurso(c), ts = T.filter((t) => t.cursoId === c.id), pend = ts.filter((t) => !t.hecha).length;
      return `<a class="modulo" href="#modulo-${c.id}">
        <span class="codigo">${esc(c.corto)}</span><h3>${esc(nombreModulo(c.nombre))}</h3>
        ${c.progreso != null ? `<div class="barra" title="Progreso en Aules: ${Math.round(c.progreso)}%"><i style="width:${c.progreso}%"></i></div>` : ''}
        <div class="pie"><span>${ts.length - pend}/${ts.length} tareas · ${pend ? `<b style="color:var(--ambar)">${pend} pendientes</b>` : 'al día'}</span>
        <span class="nota-grande" style="color:${m == null ? 'var(--suave)' : m >= 5 ? 'var(--verde)' : 'var(--rojo)'}">${fNota(m)}</span></div>
      </a>`;
    }).join('')}</div></section>`;
}

function vistaModulo(id) {
  const c = cursos().find((x) => x.id === id);
  if (!c) return '<p class="vacio">Ese módulo no está en los datos de Aules. <a href="#modulos">Volver a módulos</a></p>';
  const ts = tareas().filter((t) => t.cursoId === id).sort((a, b) => (a.entrega || 9e9) - (b.entrega || 9e9));
  const mod = modulosCatalogo().find((m) => cursoDeModulo(m) === c);
  return `
  <section class="bloque"><header><div style="display:grid;gap:4px"><a href="#modulos" class="antetitulo" style="text-decoration:none">← Módulos · ${esc(c.corto)}</a><h2>${esc(nombreModulo(c.nombre))}</h2></div>
    <a class="boton" href="${esc(c.url)}" target="_blank" rel="noopener">Abrir en Aules ↗</a></header>
    <div class="cifras">${cifra(fNota(mediaCurso(c)), 'Media (sobre 10)')}${cifra(`${ts.filter((t) => t.hecha).length}/${ts.length}`, 'Tareas entregadas')}${c.progreso != null ? cifra(Math.round(c.progreso) + '%', 'Progreso en Aules') : ''}</div>
    ${mod ? `<p style="margin:0"><a href="#ejercicios" data-acc="ir-ejercicios" data-modulo="${esc(mod)}">Ver los ejercicios de ${esc(mod)} →</a></p>` : ''}
  </section>
  <section class="bloque"><header><h2>Tareas</h2></header>
    ${ts.length ? `<div class="tabla-caja"><table><thead><tr><th>Tarea</th><th>Fecha límite</th><th>Estado</th><th style="text-align:right">Nota</th></tr></thead><tbody>
    ${ts.map((t) => { const i = agenda().find((x) => x.tarea && x.tarea.clave === t.clave); const chip = i ? i.chip : ['', 'Sin fecha'];
      return `<tr><td><a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.nombre)}</a>${t.comentario ? `<small>${esc(t.comentario)}</small>` : ''}</td>
      <td class="num" style="white-space:nowrap">${t.entrega ? fCorta(t.entrega) + ' ' + fHora(t.entrega) : '—'}</td><td><span class="chip ${chip[0]}">${esc(chip[1])}</span></td>
      <td class="n">${t.nota != null ? fNota(t.nota) + ' / ' + fNota(t.notaMax) : '—'}</td></tr>`; }).join('')}
    </tbody></table></div>` : '<p class="vacio">Este módulo no tiene tareas en Aules.</p>'}</section>
  <section class="bloque"><header><h2>Calificaciones</h2>${c.notaCurso ? `<span class="suave">Total del curso: <b>${esc(c.notaCurso.texto)}</b></span>` : ''}</header>
    ${c.notas.length ? `<div class="tabla-caja"><table><thead><tr><th>Elemento</th><th>Peso</th><th style="text-align:right">Nota</th></tr></thead><tbody>
    ${c.notas.map((n) => `<tr><td>${esc(n.nombre)}${n.comentario ? `<small>${esc(n.comentario)}</small>` : ''}</td><td class="num">${esc(n.peso || '—')}</td><td class="n">${esc(n.texto || '—')}${n.nota != null ? ` <span class="suave">/ ${fNota(n.max)}</span>` : ''}</td></tr>`).join('')}
    </tbody></table></div>` : '<p class="vacio">Aules no muestra calificaciones de este módulo.</p>'}</section>
  <section class="bloque"><header><h2>Contenido</h2></header>
    ${c.secciones.filter((s) => s.elementos.length || s.resumen).map((s, i) => `<details class="seccion" ${i === c.secciones.length - 1 ? 'open' : ''}><summary>${esc(s.nombre || 'General')} <span class="suave">· ${s.elementos.length}</span></summary>
      ${s.resumen ? `<p class="suave" style="margin:0;padding:0 14px 8px;white-space:pre-line">${esc(s.resumen)}</p>` : ''}
      <ul>${s.elementos.map((e) => `<li>${e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.nombre)}</a>` : esc(e.nombre)} <small>· ${esc(TIPOS[e.tipo] || e.tipo)}${e.archivos.length ? ' · ' + esc(e.archivos.join(', ')) : ''}</small></li>`).join('')}</ul>
    </details>`).join('') || '<p class="vacio">Sin contenido.</p>'}</section>`;
}
const TIPOS = { resource: 'archivo', assign: 'tarea', quiz: 'cuestionario', forum: 'foro', url: 'enlace', page: 'página', folder: 'carpeta', label: 'etiqueta', h5pactivity: 'H5P', choice: 'consulta', lesson: 'lección', workshop: 'taller', glossary: 'glosario', feedback: 'encuesta', book: 'libro', scorm: 'SCORM' };

function vistaCalendario() {
  const h = ahora(), hoyDia = Math.floor(h / D);
  const items = agenda().filter((i) => (i.tarea && !i.tarea.hecha) || i.fecha >= h - D).filter((i) => S.verEntregadas || !(i.tarea && i.tarea.hecha));
  const vencidas = items.filter((i) => i.fecha < h && i.tarea && !i.tarea.hecha);
  const futuras = items.filter((i) => !vencidas.includes(i));
  let dia = null, html = '';
  for (const i of futuras) {
    const d = new Date(i.fecha * 1000).toDateString();
    if (d !== dia) { dia = d; html += `<div class="dia ${Math.floor(i.fecha / D) === hoyDia ? 'hoy' : ''}">${fDia(i.fecha)}</div>`; }
    html += entradaAgenda(i);
  }
  const mods = [...new Set([...cursos().map((c) => nombreModulo(c.nombre)), ...modulosCatalogo()])];
  return `
  <section class="bloque"><header><h2>Calendario</h2>
    <label class="casilla"><input type="checkbox" data-acc="ver-entregadas" ${S.verEntregadas ? 'checked' : ''}> Mostrar también lo entregado</label></header>
    <details class="panel"><summary style="cursor:pointer;font-weight:600">Añadir una tarea o examen propio</summary>
      <form id="f-tarea" class="rejilla-form" style="margin-top:12px">
        <label class="campo"><span>Qué es</span><input type="text" id="t-nombre" required placeholder="Examen tema 4"></label>
        <label class="campo"><span>Módulo</span><input type="text" id="t-modulo" list="lista-mods" required placeholder="Programación"></label>
        <label class="campo"><span>Tipo</span><select id="t-tipo"><option value="tarea">Tarea</option><option value="examen">Examen</option></select></label>
        <label class="campo"><span>Fecha</span><input type="date" id="t-fecha" required></label>
        <label class="campo"><span>Hora</span><input type="time" id="t-hora" value="23:59"></label>
        <div class="campo" style="align-self:end"><button class="boton principal">Añadir</button></div>
        <datalist id="lista-mods">${mods.map((m) => `<option value="${esc(m)}">`).join('')}</datalist>
      </form></details>
  </section>
  ${vencidas.length ? `<section class="bloque"><header><h2>Con la fecha pasada</h2></header><div class="agenda">${vencidas.map((i) => entradaAgenda(i, true)).join('')}</div></section>` : ''}
  <section class="bloque"><header><h2>Lo que viene</h2></header><div class="agenda">${html || '<p class="vacio">No hay nada programado.</p>'}</div></section>`;
}

function vistaNotas() {
  const T = tareas();
  const porModulo = cursos().map((c) => [nombreModulo(c.nombre), mediaCurso(c)]).filter(([, m]) => m != null);
  const propias = T.filter((t) => t.origen === 'propia' && t.nota10 != null);
  return `
  <section class="bloque"><header><h2>Media por módulo</h2><span class="suave">Sobre 10 · la línea marca el 5</span></header>${graficoNotas(porModulo)}</section>
  ${cursos().map((c) => {
    const ns = c.notas.filter((n) => n.nota != null);
    if (!ns.length) return '';
    return `<section class="bloque"><header><h2 style="font-size:19px">${esc(nombreModulo(c.nombre))}</h2><a href="#modulo-${c.id}">Detalle</a></header>
      ${graficoNotas(ns.map((n) => [n.nombre, n.nota / n.max * 10]))}</section>`;
  }).join('')}
  ${propias.length ? `<section class="bloque"><header><h2 style="font-size:19px">Notas que has añadido tú</h2></header>${graficoNotas(propias.map((t) => [t.modulo + ' · ' + t.nombre, t.nota10]))}</section>` : ''}`;
}

function vistaAjustes() {
  const r = repo();
  return `
  <section class="bloque"><header><h2>Sincronizar entre dispositivos</h2><span class="punto" data-ok="${S.pat ? 'si' : ''}">${S.pat ? 'Activado' : 'Desactivado'}</span></header>
    <div class="panel">
      <p>Con una clave de GitHub, tu progreso (ejercicios hechos, código, tareas propias) se guarda cifrado en el repo y lo ves igual en el móvil y en el PC. También activa el botón <b>Sincronizar ahora</b> para descargar Aules al momento.</p>
      <ol>
        <li>En GitHub: <b>Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token</b>.</li>
        <li>Repository access: <b>Only select repositories → ${esc(r.split('/')[1] || 'doodle')}</b>. Expiración: la que prefieras (máximo 1 año).</li>
        <li>Permissions → Repository: <b>Contents: Read and write</b> y <b>Actions: Read and write</b>.</li>
        <li>Pega aquí la clave. Se guarda cifrada con tu contraseña en este dispositivo; repite el paso en cada dispositivo.</li>
      </ol>
      ${S.demo ? '<p class="suave">No disponible con datos de ejemplo.</p>' : `<form id="f-pat" class="rejilla-form">
        ${location.hostname.endsWith('.github.io') ? '' : `<label class="campo"><span>Repositorio</span><input type="text" id="p-repo" value="${esc(S.cfg.repo || 'vyxode/doodle')}" required></label>`}
        <label class="campo"><span>Clave de GitHub</span><input type="password" id="p-pat" autocomplete="off" placeholder="${S.pat ? 'Ya guardada · pega otra para cambiarla' : 'github_pat_…'}" ${S.pat ? '' : 'required'}></label>
        <div class="campo" style="align-self:end"><div class="fila-botones"><button class="boton principal">Guardar</button>${S.pat ? '<button type="button" class="boton peligro" data-acc="quitar-pat">Quitar</button>' : ''}</div></div>
      </form><p class="suave" id="pat-estado" role="status"></p>`}
    </div></section>
  <section class="bloque"><header><h2>Copia de seguridad</h2></header>
    <div class="panel"><p>Descarga todo tu progreso en un archivo (sin cifrar) o recupéralo de una copia. Al recuperar se mezcla con lo que ya tienes.</p>
      <div class="fila-botones"><button class="boton" data-acc="exportar">Descargar copia</button>
      <label class="boton">Recuperar copia<input type="file" id="importar" accept="application/json,.json" hidden></label></div></div></section>
  <section class="bloque"><header><h2>Sesión</h2></header>
    <div class="panel"><p>${LS.get('doodle-recordar') ? 'Este dispositivo recuerda tu contraseña.' : 'Este dispositivo te pide la contraseña cada vez.'}</p>
      <div class="fila-botones"><button class="boton peligro" data-acc="bloquear">Cerrar sesión${LS.get('doodle-recordar') ? ' y olvidar la contraseña' : ''}</button></div></div></section>
  ${S.curso.generado ? `<p class="suave" style="font-size:13px">Datos de ${esc(S.curso.sitio ? S.curso.sitio.url : 'Aules')} generados el ${new Date(S.curso.generado).toLocaleString('es-ES')}. El robot sincroniza a las 6:17, 12:17, 16:17 y 20:17.</p>` : ''}`;
}

// ---------- ejercicios ----------
const PLANTILLA = 'using System;\n\nclass Program {\n\tpublic static void Main() {\n\t\t\n\t}\n}\n';
function vistaEjercicios() {
  const mods = modulosCatalogo();
  if (!S.filtro.modulo || !mods.includes(S.filtro.modulo)) S.filtro.modulo = mods[0] || '';
  return `
  <section class="bloque"><header><h2>Ejercicios</h2><span class="suave" id="ej-cuenta"></span></header>
    <div class="filtros">
      <select id="f-modulo" aria-label="Módulo">${mods.map((m) => `<option ${m === S.filtro.modulo ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select>
      <div class="seg" role="group" aria-label="Mostrar">${[['todos', 'Todos'], ['pendientes', 'Pendientes'], ['hechos', 'Hechos']].map(([k, t]) => `<button type="button" data-acc="filtro-estado" data-v="${k}" aria-pressed="${S.filtro.estado === k}">${t}</button>`).join('')}</div>
    </div>
    <details class="panel"><summary style="cursor:pointer;font-weight:600">Añadir un ejercicio</summary>
      <form id="f-ej" class="rejilla-form" style="margin-top:12px">
        <label class="campo"><span>Módulo</span><input type="text" id="e-modulo" list="lista-mods-ej" value="${esc(S.filtro.modulo)}" required></label>
        <label class="campo"><span>Tema</span><input type="text" id="e-tema" required placeholder="Tema 5 · Funciones"></label>
        <label class="campo"><span>Número</span><input type="text" id="e-n" placeholder="5.1.1"></label>
        <label class="campo"><span>Tipo</span><select id="e-leng"><option value="csharp">C# (con editor y ejecución)</option><option value="">Otro (con notas)</option></select></label>
        <label class="campo" style="grid-column:1/-1"><span>Enunciado</span><textarea id="e-texto" required></textarea></label>
        <div><button class="boton principal">Añadir ejercicio</button></div>
        <datalist id="lista-mods-ej">${[...new Set([...mods, ...cursos().map((c) => nombreModulo(c.nombre))])].map((m) => `<option value="${esc(m)}">`).join('')}</datalist>
      </form></details>
  </section>
  <div id="lista-ej" class="bloque"></div>`;
}
function montarEjercicios() {
  const cont = document.getElementById('lista-ej');
  const lista = catalogo().filter((e) => e.modulo === S.filtro.modulo);
  const temas = [...new Set(lista.map((e) => e.tema))];
  const hecho = (e) => !!(S.prog.ej[e.id] || {}).hecho;
  document.getElementById('ej-cuenta').textContent = `${lista.filter(hecho).length} de ${lista.length} hechos`;
  cont.innerHTML = temas.map((t) => {
    const del = lista.filter((e) => e.tema === t);
    const vis = del.filter((e) => S.filtro.estado === 'todos' || (S.filtro.estado === 'hechos') === hecho(e));
    let grupo = null;
    return `<div class="tema-cab"><h3>${esc(t)}</h3><span class="suave num">${del.filter(hecho).length}/${del.length}</span></div>
      <div class="barra"><i style="width:${del.filter(hecho).length / del.length * 100}%"></i></div>
      ${vis.map((e) => {
        const g = e.grupo && e.grupo !== grupo ? `<p class="grupo">${esc((grupo = e.grupo))}</p>` : '';
        return g + `<article class="ej ${hecho(e) ? 'hecho' : ''}" id="ej-${esc(e.id)}" data-id="${esc(e.id)}">
          <div class="ej-cab"><span class="ej-num">${esc(e.n || '·')}</span><p class="ej-txt">${esc(e.texto)}</p></div>
          ${e.ejemplo ? `<pre class="consola" style="min-height:0">${esc(e.ejemplo)}</pre>` : ''}
          <div class="ej-pie"><label class="casilla"><input type="checkbox" data-acc="ej-hecho" ${hecho(e) ? 'checked' : ''}> Hecho</label>
            <div class="fila-botones">${e.propio ? '<button type="button" class="boton mini peligro" data-acc="borrar-ej">Borrar</button>' : ''}
            <button type="button" class="boton abrir" data-acc="abrir-lab" aria-expanded="false">${e.lenguaje === 'csharp' ? 'Escribir y probar el código' : 'Mis notas'} <span class="flecha" aria-hidden="true">▾</span></button></div></div>
        </article>`;
      }).join('') || '<p class="vacio">Nada que mostrar con este filtro.</p>'}`;
  }).join('') || '<p class="vacio">No hay ejercicios en este módulo. Añade el primero arriba.</p>';
  // los editores abiertos sobreviven al repintado (marcar "Hecho" no cierra lo que estás escribiendo)
  for (const [id, lab] of Object.entries(labs)) {
    const art = document.getElementById('ej-' + id);
    if (!art || lab.caja.hidden) continue;
    art.append(lab.caja); art.querySelector('.abrir').setAttribute('aria-expanded', 'true'); lab.ed.refrescar();
  }
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
      matchBrackets: true, autoCloseBrackets: csharp, viewportMargin: Infinity, screenReaderLabel: etiqueta,
      extraKeys: { 'Ctrl-Enter': alEjecutar, 'Cmd-Enter': alEjecutar },
    });
    let marcada = null;
    cm.on('change', () => alCambiar(cm.getValue()));
    return {
      get: () => cm.getValue(),
      marcar(n) { this.limpiar(); if (n > 0 && n <= cm.lineCount()) marcada = cm.addLineClass(n - 1, 'background', 'linea-error'); },
      limpiar() { if (marcada) { cm.removeLineClass(marcada, 'background', 'linea-error'); marcada = null; } },
      ir(n) { cm.focus(); cm.setCursor({ line: Math.max(0, n - 1), ch: 0 }); cm.scrollIntoView(null, 80); },
      refrescar() { cm.refresh(); },
    };
  }
  const ta = document.createElement('textarea'); ta.value = valor; ta.spellcheck = false; ta.setAttribute('aria-label', etiqueta);
  ta.style.cssText = 'border:0;border-radius:0;min-height:240px;font:14px/1.5 var(--f-code);tab-size:4';
  caja.append(ta);
  ta.addEventListener('input', () => alCambiar(ta.value));
  ta.addEventListener('keydown', (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); alEjecutar(); }
    else if (ev.key === 'Tab' && !ev.shiftKey) { ev.preventDefault(); document.execCommand('insertText', false, '\t'); }
  });
  return { get: () => ta.value, marcar() {}, limpiar() {}, ir() { ta.focus(); }, refrescar() {} };
}
const labs = {};
function crearLab(art) {
  const id = art.dataset.id, e = catalogo().find((x) => x.id === id), csharp = e.lenguaje === 'csharp';
  const caja = document.createElement('div'); caja.className = 'lab';
  caja.innerHTML = (csharp ? '<div class="barra-lab"><button type="button" class="boton principal ejecutar">▶ Ejecutar</button><span class="estado-guardado" aria-live="polite"></span></div>' : '<div class="barra-lab"><span class="estado-guardado" aria-live="polite"></span></div>') +
    '<div class="editor"></div>' + (csharp ? '<div class="consola" tabindex="-1" aria-label="Consola del programa"><span class="vacia">Pulsa Ejecutar (o Ctrl+Intro) para lanzar el programa.</span></div><div class="aviso-lugar" aria-live="polite"></div>' : '');
  art.append(caja);
  const estado = caja.querySelector('.estado-guardado');
  const g = S.prog.ej[id] || {};
  let entradas = [], semilla = 1, ocupado = false;
  const ed = crearEditor(caja.querySelector('.editor'), g.codigo || (csharp ? PLANTILLA : ''),
    (v) => { cambiar('ej', id, { codigo: v }); estado.textContent = S.demo ? 'Guardado en este navegador' : S.pat ? 'Guardado (se sincroniza en unos segundos)' : 'Guardado en este dispositivo'; },
    () => csharp && lanzar([]), 'Código del ejercicio ' + (e.n || ''), csharp);
  if (!csharp) return { caja, ed };
  const btn = caja.querySelector('.ejecutar'), consola = caja.querySelector('.consola'), lugar = caja.querySelector('.aviso-lugar');
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
      aviso.className = 'aviso espera'; aviso.textContent = 'El programa espera a que escribas algo en la consola y pulses Intro.';
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
    if (r.line) { const ir = document.createElement('button'); ir.type = 'button'; ir.className = 'boton ir'; ir.textContent = 'Ir a la línea ' + r.line; ir.addEventListener('click', () => ed.ir(r.line)); aviso.append(ir); ed.marcar(r.line); }
    lugar.append(aviso);
  }
  btn.addEventListener('click', () => lanzar([]));
  return { caja, ed };
}

// ---------- acciones (delegadas) ----------
document.addEventListener('click', async (ev) => {
  const el = ev.target.closest('[data-acc]'); if (!el || el.tagName === 'INPUT') return;
  const acc = el.dataset.acc, art = el.closest('.ej');
  if (acc === 'abrir-lab') {
    const id = art.dataset.id, abierto = el.getAttribute('aria-expanded') === 'true';
    if (!labs[id] || !art.contains(labs[id].caja)) labs[id] = crearLab(art);
    labs[id].caja.hidden = abierto; el.setAttribute('aria-expanded', String(!abierto));
    if (!abierto) labs[id].ed.refrescar();
  } else if (acc === 'filtro-estado') { S.filtro.estado = el.dataset.v; document.querySelectorAll('[data-acc="filtro-estado"]').forEach((b) => b.setAttribute('aria-pressed', String(b === el))); montarEjercicios(); }
  else if (acc === 'ir-ejercicios') { S.filtro.modulo = el.dataset.modulo; }
  else if (acc === 'borrar-ej' || acc === 'borrar-tarea') {
    if (el.dataset.confirmar !== 'si') { el.dataset.confirmar = 'si'; el.textContent = '¿Seguro? Borrar'; return; }
    if (acc === 'borrar-ej') { cambiar('ejPropios', art.dataset.id, { borrado: true }); montarEjercicios(); } else { cambiar('tareas', el.dataset.id, { borrado: true }); render(); }
  } else if (acc === 'exportar') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S.prog, null, 1)], { type: 'application/json' }));
    a.download = 'doodle-progreso-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
  } else if (acc === 'quitar-pat') { S.pat = null; delete S.cfg.patSobre; LS.set('doodle-cfg', S.cfg); render(); }
  else if (acc === 'bloquear') { LS.del('doodle-recordar'); S.pass = S.pat = S.curso = null; S.prog = progVacio(); location.hash = ''; pintarBloqueo(); }
});
document.addEventListener('change', async (ev) => {
  const el = ev.target, acc = el.dataset.acc;
  if (acc === 'ej-hecho') { const art = el.closest('.ej'); cambiar('ej', art.dataset.id, { hecho: el.checked }); art.classList.toggle('hecho', el.checked); montarEjercicios(); }
  else if (acc === 'hecha') { cambiar('tareas', el.dataset.id, { hecha: el.checked }); render(); }
  else if (acc === 'nota') { const v = el.value === '' ? null : Math.max(0, +el.value); cambiar('tareas', el.dataset.id, { nota: v }); }
  else if (acc === 'ver-entregadas') { S.verEntregadas = el.checked; render(); }
  else if (el.id === 'f-modulo') { S.filtro.modulo = el.value; montarEjercicios(); }
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
  } else if (f.id === 'f-pat') {
    const msg = document.getElementById('pat-estado'), nuevo = val('p-pat');
    if (document.getElementById('p-repo')) { S.cfg.repo = val('p-repo'); LS.set('doodle-cfg', S.cfg); }
    const anterior = S.pat;
    if (nuevo) S.pat = nuevo;
    msg.textContent = 'Comprobando con GitHub…';
    try {
      const r = await gh('');
      if (!r.ok) throw new Error(r.status === 404 ? 'GitHub no encuentra el repositorio ' + repo() + ' con esa clave.' : 'GitHub respondió ' + r.status + '.');
      const rem = await bajar(); if (rem) S.prog = mezclar(S.prog, rem);
      await subir();
      S.cfg.patSobre = await cifrar(S.pass, { pat: S.pat }); LS.set('doodle-cfg', S.cfg); guardarLocal();
      render();
    } catch (e) { S.pat = anterior; msg.textContent = e.message; }
  }
});

arrancar();
