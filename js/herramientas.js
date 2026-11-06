// Herramientas de trabajo de Doodle: editor de código común, SQL (SQLite en el navegador),
// HTML/CSS con vista previa, tablero Kanban y Java real (CheerpJ). Cada una se monta en un contenedor
// con montarX(cont, datos, alCambiar) y guarda su estado como JSON a través de alCambiar.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CDN_CM = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/';
const scripts = {};
export function cargarScript(src) {
  if (!scripts[src]) scripts[src] = new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => { delete scripts[src]; mal(new Error('No se pudo cargar ' + src)); }; document.head.append(s); });
  return scripts[src];
}
// Los modos de resaltado extra se cargan solo cuando hacen falta; sin ellos el editor funciona igual.
const MODOS = { 'text/x-sql': ['mode/sql/sql.min.js'], htmlmixed: ['mode/xml/xml.min.js', 'mode/javascript/javascript.min.js', 'mode/css/css.min.js', 'mode/htmlmixed/htmlmixed.min.js'], css: ['mode/css/css.min.js'] };
async function cargarModo(modo) { if (window.CodeMirror && MODOS[modo]) for (const f of MODOS[modo]) await cargarScript(CDN_CM + f).catch(() => {}); }

// Editor de código: CodeMirror si cargó; si no, un textarea con tabulador.
export function crearEditor(caja, valor, { modo = 'text/plain', alCambiar = () => {}, alEjecutar = () => {}, etiqueta = 'Editor', numeros = true } = {}) {
  if (window.CodeMirror) {
    const cm = window.CodeMirror(caja, {
      value: valor, mode: modo, lineNumbers: numeros, indentUnit: 4, tabSize: 4, indentWithTabs: true, lineWrapping: modo === 'text/plain',
      matchBrackets: true, autoCloseBrackets: modo !== 'text/plain', screenReaderLabel: etiqueta,
      extraKeys: { 'Ctrl-Enter': () => alEjecutar(), 'Cmd-Enter': () => alEjecutar() },
    });
    cargarModo(modo).then(() => cm.setOption('mode', modo));
    let marcada = null;
    cm.on('change', () => alCambiar(cm.getValue()));
    return {
      get: () => cm.getValue(), set: (v) => cm.setValue(v), seleccion: () => cm.getSelection(),
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
  return { get: () => ta.value, set: (v) => { ta.value = v; }, seleccion: () => ta.value.slice(ta.selectionStart, ta.selectionEnd), marcar() {}, limpiar() {}, ir() { ta.focus(); }, foco() { ta.focus(); } };
}
function descargar(nombre, texto, tipo = 'text/plain') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([texto], { type: tipo })); a.download = nombre;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

// ======================= SQL (SQLite con sql.js) =======================
let sqlJs = null;
async function motorSql() {
  if (!sqlJs) sqlJs = cargarScript(new URL('vendor/sql-wasm.js', import.meta.url).href).then(() => window.initSqlJs({ locateFile: (f) => new URL('vendor/' + f, import.meta.url).href }));
  return sqlJs;
}
// Separa el script en sentencias respetando cadenas y comentarios, para saber en qué sentencia falla.
export function sentencias(sql) {
  const out = []; let act = '', i = 0, linea = 1, inicio = 1;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'" || ch === '"' || ch === '`') { const fin = sql.indexOf(ch, i + 1); const tramo = fin < 0 ? sql.slice(i) : sql.slice(i, fin + 1); act += tramo; linea += (tramo.match(/\n/g) || []).length; i += tramo.length; continue; }
    if (ch === '-' && sql[i + 1] === '-') { const fin = sql.indexOf('\n', i); i = fin < 0 ? sql.length : fin; continue; }
    if (ch === '/' && sql[i + 1] === '*') { const fin = sql.indexOf('*/', i + 2); const tramo = fin < 0 ? sql.slice(i) : sql.slice(i, fin + 2); linea += (tramo.match(/\n/g) || []).length; i += tramo.length; continue; }
    if (ch === ';') { if (act.trim()) out.push({ sql: act.trim(), linea: inicio }); act = ''; i++; continue; }
    if (!act.trim() && /\S/.test(ch)) inicio = linea;
    if (ch === '\n') linea++;
    act += ch; i++;
  }
  if (act.trim()) out.push({ sql: act.trim(), linea: inicio });
  return out;
}
// Adapta lo más habitual de MySQL a SQLite para que los scripts de clase funcionen tal cual.
export function adaptarMysql(s) {
  return s.replace(/\bAUTO_INCREMENT\b/gi, '').replace(/\bENGINE\s*=\s*\w+/gi, '').replace(/\b(DEFAULT\s+)?CHARSET\s*=\s*\w+/gi, '').replace(/\bCOLLATE\s*=?\s*\w+/gi, '')
    .replace(/\bUNSIGNED\b/gi, '')
    .replace(/^(\s*)(USE\s|SET\s|(CREATE|DROP)\s+(DATABASE|SCHEMA)\b)[^;]*/gim, '$1SELECT 1 WHERE 0'); // sin efecto en SQLite (una sola base de datos)
}
const EJEMPLO_SQL = `-- Escribe aquí tu script y pulsa Ejecutar (Ctrl+Intro).\n-- Motor: SQLite. Lo típico de MySQL (AUTO_INCREMENT, ENGINE…) se adapta solo.\nCREATE TABLE cliente (\n  id INTEGER PRIMARY KEY,\n  nombre VARCHAR(50) NOT NULL,\n  ciudad VARCHAR(40)\n);\n\nINSERT INTO cliente (nombre, ciudad) VALUES ('Ana', 'Valencia'), ('Luis', 'Alicante');\n\nSELECT * FROM cliente WHERE ciudad = 'Valencia';\n`;
export function montarSql(cont, datos, alCambiar) {
  const d = { codigo: (datos && datos.codigo) ?? EJEMPLO_SQL };
  cont.innerHTML = `<div class="hz hz-sql">
    <div class="barra-lab"><button type="button" class="boton principal" data-sql="todo">▶ Ejecutar</button><button type="button" class="boton mini" data-sql="sel">Ejecutar selección</button><button type="button" class="boton mini" data-sql="bajar">Descargar .sql</button><span class="estado-guardado"></span></div>
    <div class="editor"></div>
    <div class="sql-salida" aria-live="polite"><p class="suave">Los resultados aparecerán aquí. Cada ejecución empieza con la base de datos vacía y ejecuta todo el script.</p></div>
  </div>`;
  const ed = crearEditor(cont.querySelector('.editor'), d.codigo, { modo: 'text/x-sql', etiqueta: 'Script SQL', alCambiar: (v) => { d.codigo = v; alCambiar({ ...d }); cont.querySelector('.estado-guardado').textContent = 'Guardado'; }, alEjecutar: () => ejecutar(false) });
  const salida = cont.querySelector('.sql-salida');
  async function ejecutar(soloSel) {
    salida.innerHTML = '<p class="suave">Ejecutando…</p>';
    let SQL;
    try { SQL = await motorSql(); } catch (e) { salida.innerHTML = `<div class="aviso error"><b>No se pudo cargar el motor SQL</b><span>${esc(e.message)}</span></div>`; return; }
    const db = new SQL.Database(), html = [];
    const texto = soloSel && ed.seleccion().trim() ? ed.seleccion() : ed.get();
    let ok = 0;
    for (const st of sentencias(adaptarMysql(texto))) {
      try {
        const res = db.exec(st.sql);
        ok++;
        for (const r of res) {
          html.push(`<div class="sql-res"><p class="sql-q mono">${esc(st.sql.length > 90 ? st.sql.slice(0, 90) + '…' : st.sql)}</p><div class="tabla-caja"><table><thead><tr>${r.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
            <tbody>${r.values.map((f) => `<tr>${f.map((v) => `<td class="${typeof v === 'number' ? 'n' : ''}">${v === null ? '<span class="suave">NULL</span>' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="suave">${r.values.length} fila${r.values.length === 1 ? '' : 's'}</p></div>`);
        }
      } catch (e) {
        html.push(`<div class="aviso error"><b>Error en la sentencia de la línea ${st.linea}</b><span class="mono">${esc(e.message)}</span><button type="button" class="boton mini" data-linea="${st.linea}">Ir a la línea ${st.linea}</button></div>`);
        ed.marcar(st.linea);
        break;
      }
    }
    // resumen de tablas tras ejecutar, como el panel de un gestor de BD
    let tablas = [];
    try { tablas = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0]?.values.map((v) => v[0]) || []; } catch (e) { /* nada */ }
    const esquema = tablas.map((t) => {
      const cols = db.exec(`PRAGMA table_info("${t.replace(/"/g, '""')}")`)[0]?.values || [];
      const n = db.exec(`SELECT COUNT(*) FROM "${t.replace(/"/g, '""')}"`)[0].values[0][0];
      return `<li><b>${esc(t)}</b> <span class="suave">(${n} fila${n === 1 ? '' : 's'})</span>: ${cols.map((c) => (c[5] ? `<u>${esc(c[1])}</u>` : esc(c[1])) + ` <span class="suave">${esc(c[2])}</span>`).join(', ')}</li>`;
    }).join('');
    db.close();
    salida.innerHTML = (html.length ? html.join('') : '') + `<div class="aviso ${html.some((h) => h.includes('aviso error')) ? 'espera' : 'ok'}"><span>${ok} sentencia${ok === 1 ? '' : 's'} ejecutada${ok === 1 ? '' : 's'} correctamente.</span></div>` + (esquema ? `<details class="panel corte" open><summary>Tablas</summary><ul class="sql-esquema">${esquema}</ul></details>` : '');
  }
  cont.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-sql]'); const l = ev.target.closest('[data-linea]');
    if (l) return ed.ir(+l.dataset.linea);
    if (!b) return;
    if (b.dataset.sql === 'todo') { ed.limpiar(); ejecutar(false); }
    else if (b.dataset.sql === 'sel') { ed.limpiar(); ejecutar(true); }
    else descargar('script.sql', ed.get(), 'application/sql');
  });
  return { foco: () => ed.foco() };
}

// ======================= HTML / CSS con vista previa =======================
const EJEMPLO_HTML = '<!DOCTYPE html>\n<html lang="es">\n<head>\n\t<meta charset="UTF-8">\n\t<title>Mi página</title>\n\t<link rel="stylesheet" href="estilos.css">\n</head>\n<body>\n\t<h1>Hola, mundo</h1>\n\t<p>Edita el HTML y el CSS: la vista previa se actualiza sola.</p>\n</body>\n</html>\n';
const EJEMPLO_CSS = 'body {\n\tfont-family: system-ui, sans-serif;\n\tmargin: 2rem;\n}\n\nh1 {\n\tcolor: crimson;\n}\n';
// Comprobaciones básicas de HTML: etiquetas sin cerrar o cerradas de más (el validador del W3C es más completo).
export function revisarHtml(html) {
  const vacias = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', '!doctype']);
  const opcionales = new Set(['li', 'p', 'td', 'th', 'tr', 'option', 'dt', 'dd', 'thead', 'tbody', 'tfoot', 'html', 'head', 'body']);
  const pila = [], avisos = [];
  const limpio = html.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' ')).replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (m) => m.replace(/[^\n]/g, ' '));
  const re = /<\/?([a-zA-Z!][\w-]*)[^>]*?(\/?)>/g; let m;
  while ((m = re.exec(limpio))) {
    const tag = m[1].toLowerCase(), linea = limpio.slice(0, m.index).split('\n').length;
    if (vacias.has(tag) || m[2] === '/') continue;
    if (m[0][1] !== '/') { pila.push({ tag, linea }); continue; }
    const i = pila.map((p) => p.tag).lastIndexOf(tag);
    if (i < 0) { avisos.push({ linea, txt: `</${tag}> cierra una etiqueta que no está abierta` }); continue; }
    for (const p of pila.splice(i).slice(1)) if (!opcionales.has(p.tag)) avisos.push({ linea: p.linea, txt: `<${p.tag}> no se cierra` });
  }
  for (const p of pila) if (!opcionales.has(p.tag)) avisos.push({ linea: p.linea, txt: `<${p.tag}> no se cierra` });
  if (!/<!doctype html>/i.test(html)) avisos.unshift({ linea: 1, txt: 'Falta <!DOCTYPE html> al principio' });
  if (!/<title>[^<]+<\/title>/i.test(html)) avisos.push({ linea: 1, txt: 'Falta un <title> con texto' });
  if (/<img\b(?![^>]*\balt=)[^>]*>/i.test(html)) avisos.push({ linea: limpio.search(/<img\b(?![^>]*\balt=)/i) >= 0 ? limpio.slice(0, limpio.search(/<img\b(?![^>]*\balt=)/i)).split('\n').length : 1, txt: 'Hay <img> sin atributo alt' });
  return avisos;
}
export function montarWeb(cont, datos, alCambiar) {
  const d = { html: (datos && datos.html) ?? EJEMPLO_HTML, css: (datos && datos.css) ?? EJEMPLO_CSS, pestaña: 'html' };
  cont.innerHTML = `<div class="hz hz-web">
    <div class="barra-lab"><div class="seg" role="tablist"><button type="button" data-web="html" aria-pressed="true">index.html</button><button type="button" data-web="css" aria-pressed="false">estilos.css</button></div>
      <button type="button" class="boton mini" data-web="bajar-html">Descargar HTML</button><button type="button" class="boton mini" data-web="bajar-css">Descargar CSS</button><span class="estado-guardado"></span></div>
    <div class="web-cuerpo"><div class="editor"></div><div class="web-previa"><iframe title="Vista previa" sandbox="allow-scripts allow-modals"></iframe></div></div>
    <ul class="web-avisos" aria-live="polite"></ul>
  </div>`;
  const caja = cont.querySelector('.editor'), iframe = cont.querySelector('iframe'), avisos = cont.querySelector('.web-avisos');
  let ed = null, t = null;
  const previa = () => {
    // el CSS enlazado como estilos.css se inyecta en la página para verlo sin servidor
    const css = `<style>${d.css}</style>`;
    iframe.srcdoc = /<link[^>]+estilos\.css[^>]*>/i.test(d.html) ? d.html.replace(/<link[^>]+estilos\.css[^>]*>/i, css) : d.html.replace(/<\/head>/i, css + '</head>');
    const av = revisarHtml(d.html);
    avisos.innerHTML = av.length ? av.slice(0, 8).map((a) => `<li><button type="button" class="boton mini" data-linea="${a.linea}">L${a.linea}</button> ${esc(a.txt)}</li>`).join('') : '<li class="ok">Sin errores básicos en el HTML.</li>';
  };
  function abrir(cual) {
    d.pestaña = cual; caja.innerHTML = '';
    cont.querySelectorAll('[data-web="html"],[data-web="css"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.web === cual)));
    ed = crearEditor(caja, d[cual], { modo: cual === 'html' ? 'htmlmixed' : 'css', etiqueta: cual === 'html' ? 'HTML' : 'CSS', alCambiar: (v) => {
      d[cual] = v; alCambiar({ html: d.html, css: d.css }); cont.querySelector('.estado-guardado').textContent = 'Guardado';
      clearTimeout(t); t = setTimeout(previa, 350);
    } });
  }
  cont.addEventListener('click', (ev) => {
    const l = ev.target.closest('[data-linea]'); if (l) { if (d.pestaña !== 'html') abrir('html'); return ed.ir(+l.dataset.linea); }
    const b = ev.target.closest('[data-web]'); if (!b) return;
    const a = b.dataset.web;
    if (a === 'html' || a === 'css') abrir(a);
    else if (a === 'bajar-html') descargar('index.html', d.html, 'text/html');
    else if (a === 'bajar-css') descargar('estilos.css', d.css, 'text/css');
  });
  abrir('html'); previa();
  return { foco: () => ed && ed.foco() };
}

// ======================= Tablero Kanban (requisitos, historias de usuario) =======================
const TIPOS_TARJETA = { rf: 'Req. funcional', rnf: 'Req. no funcional', hu: 'Historia de usuario', tarea: 'Tarea', bug: 'Error' };
export const kanbanVacio = () => ({ columnas: [{ id: 'c1', nombre: 'Por hacer' }, { id: 'c2', nombre: 'En curso' }, { id: 'c3', nombre: 'Hecho' }], tarjetas: [] });
export function montarKanban(cont, datos, alCambiar) {
  const d = datos && datos.columnas ? JSON.parse(JSON.stringify(datos)) : kanbanVacio();
  let editando = null;
  const guardar = () => alCambiar(JSON.parse(JSON.stringify(d)));
  const id = () => Math.random().toString(36).slice(2, 8);
  function pintar() {
    cont.innerHTML = `<div class="hz kanban">
      <div class="barra-lab"><button type="button" class="boton principal mini" data-kb="nueva">+ Tarjeta</button><button type="button" class="boton mini" data-kb="columna">+ Columna</button>
        <button type="button" class="boton mini" data-kb="exportar">Exportar a Markdown</button><span class="suave">${d.tarjetas.length} tarjetas</span></div>
      <div class="kb-columnas">${d.columnas.map((c, ci) => {
        const ts = d.tarjetas.filter((t) => t.col === c.id);
        return `<section class="kb-col corte" data-col="${c.id}">
          <header><input type="text" class="kb-nombre" data-kb-col="${c.id}" value="${esc(c.nombre)}" aria-label="Nombre de la columna"><span class="suave num">${ts.length}</span>${d.columnas.length > 1 && !ts.length ? `<button type="button" class="boton mini" data-kb="borrar-col" data-id="${c.id}" title="Quitar columna">×</button>` : ''}</header>
          <div class="kb-lista">${ts.map((t) => `<article class="kb-tarjeta tipo-${t.tipo}" draggable="true" data-tarjeta="${t.id}">
            <span class="kb-tipo">${esc(TIPOS_TARJETA[t.tipo] || '')}${t.prioridad ? ' · ' + esc(t.prioridad) : ''}</span><b>${esc(t.titulo)}</b>${t.desc ? `<p>${esc(t.desc)}</p>` : ''}
            <div class="kb-acc">${ci > 0 ? `<button type="button" class="boton mini" data-kb="mover" data-id="${t.id}" data-v="-1" aria-label="Mover a la columna anterior">‹</button>` : ''}<button type="button" class="boton mini" data-kb="editar" data-id="${t.id}">Editar</button>${ci < d.columnas.length - 1 ? `<button type="button" class="boton mini" data-kb="mover" data-id="${t.id}" data-v="1" aria-label="Mover a la columna siguiente">›</button>` : ''}</div>
          </article>`).join('') || '<p class="suave kb-vacia">Arrastra aquí</p>'}</div></section>`;
      }).join('')}</div>
      ${editando ? formulario() : ''}
    </div>`;
  }
  function formulario() {
    const t = d.tarjetas.find((x) => x.id === editando) || { titulo: '', desc: '', tipo: 'hu', prioridad: '' };
    return `<form class="panel corte kb-form" data-kb-form>
      <label class="campo"><span>Título</span><input type="text" name="titulo" required value="${esc(t.titulo)}" placeholder="Como usuario quiero…"></label>
      <label class="campo"><span>Tipo</span><select name="tipo">${Object.entries(TIPOS_TARJETA).map(([k, v]) => `<option value="${k}" ${k === t.tipo ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <label class="campo"><span>Prioridad</span><select name="prioridad">${['', 'Alta', 'Media', 'Baja'].map((p) => `<option ${p === t.prioridad ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
      <label class="campo campo-ancho"><span>Descripción / criterios de aceptación</span><textarea name="desc" rows="4">${esc(t.desc)}</textarea></label>
      <div class="fila-botones"><button class="boton principal">Guardar</button><button type="button" class="boton" data-kb="cancelar">Cancelar</button>${d.tarjetas.some((x) => x.id === editando) ? '<button type="button" class="boton peligro" data-kb="borrar">Borrar</button>' : ''}</div>
    </form>`;
  }
  cont.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-kb]'); if (!b) return;
    const a = b.dataset.kb;
    if (a === 'nueva') { editando = 'nueva'; pintar(); cont.querySelector('[name=titulo]').focus(); }
    else if (a === 'editar') { editando = b.dataset.id; pintar(); cont.querySelector('[data-kb-form]').scrollIntoView({ block: 'nearest' }); }
    else if (a === 'cancelar') { editando = null; pintar(); }
    else if (a === 'borrar') { if (b.dataset.confirmar !== 'si') { b.dataset.confirmar = 'si'; b.textContent = '¿Seguro?'; return; } d.tarjetas = d.tarjetas.filter((t) => t.id !== editando); editando = null; pintar(); guardar(); }
    else if (a === 'columna') { d.columnas.push({ id: 'c' + id(), nombre: 'Nueva columna' }); pintar(); guardar(); }
    else if (a === 'borrar-col') { d.columnas = d.columnas.filter((c) => c.id !== b.dataset.id); pintar(); guardar(); }
    else if (a === 'mover') {
      const t = d.tarjetas.find((x) => x.id === b.dataset.id), i = d.columnas.findIndex((c) => c.id === t.col);
      t.col = d.columnas[Math.max(0, Math.min(d.columnas.length - 1, i + +b.dataset.v))].id; pintar(); guardar();
    } else if (a === 'exportar') {
      descargar('tablero.md', d.columnas.map((c) => `## ${c.nombre}\n\n` + d.tarjetas.filter((t) => t.col === c.id).map((t) => `- **${t.titulo}** (${TIPOS_TARJETA[t.tipo]}${t.prioridad ? ', prioridad ' + t.prioridad : ''})${t.desc ? '\n  ' + t.desc.replace(/\n/g, '\n  ') : ''}`).join('\n')).join('\n\n'), 'text/markdown');
    }
  });
  cont.addEventListener('submit', (ev) => {
    if (!ev.target.matches('[data-kb-form]')) return;
    ev.preventDefault();
    const f = new FormData(ev.target), datosF = { titulo: f.get('titulo').trim(), tipo: f.get('tipo'), prioridad: f.get('prioridad'), desc: f.get('desc').trim() };
    if (editando === 'nueva') d.tarjetas.push({ id: id(), col: d.columnas[0].id, ...datosF }); else Object.assign(d.tarjetas.find((x) => x.id === editando), datosF);
    editando = null; pintar(); guardar();
  });
  cont.addEventListener('change', (ev) => { const c = ev.target.dataset.kbCol; if (c) { d.columnas.find((x) => x.id === c).nombre = ev.target.value; guardar(); } });
  // arrastrar y soltar en PC (en el móvil se usan los botones ‹ ›)
  cont.addEventListener('dragstart', (ev) => { const t = ev.target.closest('[data-tarjeta]'); if (t) ev.dataTransfer.setData('text/plain', t.dataset.tarjeta); });
  cont.addEventListener('dragover', (ev) => { if (ev.target.closest('[data-col]')) ev.preventDefault(); });
  cont.addEventListener('drop', (ev) => {
    const col = ev.target.closest('[data-col]'); if (!col) return;
    ev.preventDefault();
    const t = d.tarjetas.find((x) => x.id === ev.dataTransfer.getData('text/plain'));
    if (t) { t.col = col.dataset.col; pintar(); guardar(); }
  });
  pintar();
  return { foco() {} };
}

// ======================= Java real (CheerpJ: una JVM en el navegador) =======================
// javac de OpenJDK 8 (tools.jar) compila en el navegador; la entrada por teclado se escribe antes de ejecutar.
// LIB_JAVA se compila en js/vendor/doodle-lib.jar al ejecutar `node test.js` (el /str/ de CheerpJ no admite carpetas).
// Mini JUnit propio: las anotaciones y asserts de JUnit 4 y 5 más usados, para escribir tests sin librerías externas.
export const LIB_JAVA = {
  'org/junit/Test.java': 'package org.junit; import java.lang.annotation.*; @Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD) public @interface Test { Class<? extends Throwable> expected() default None.class; class None extends Throwable {} }',
  'org/junit/Before.java': 'package org.junit; import java.lang.annotation.*; @Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD) public @interface Before {}',
  'org/junit/After.java': 'package org.junit; import java.lang.annotation.*; @Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD) public @interface After {}',
  'org/junit/Assert.java': `package org.junit; public class Assert {
 public static void fail(String m){ throw new AssertionError(m); }
 public static void fail(){ fail("fallo forzado"); }
 public static void assertTrue(boolean c){ assertTrue("se esperaba true", c); }
 public static void assertTrue(String m, boolean c){ if(!c) fail(m); }
 public static void assertFalse(boolean c){ assertFalse("se esperaba false", c); }
 public static void assertFalse(String m, boolean c){ if(c) fail(m); }
 public static void assertNull(Object o){ if(o!=null) fail("se esperaba null y es " + o); }
 public static void assertNotNull(Object o){ if(o==null) fail("se esperaba un valor distinto de null"); }
 public static void assertEquals(Object e, Object a){ assertEquals(null, e, a); }
 public static void assertEquals(String m, Object e, Object a){ if(e==null ? a!=null : !e.equals(a)) fail((m!=null?m+": ":"") + "esperado <" + e + "> pero fue <" + a + ">"); }
 public static void assertEquals(long e, long a){ assertEquals(null, (Object)e, (Object)a); }
 public static void assertEquals(String m, long e, long a){ assertEquals(m, (Object)e, (Object)a); }
 public static void assertEquals(double e, double a, double d){ assertEquals(null, e, a, d); }
 public static void assertEquals(String m, double e, double a, double d){ if(Math.abs(e-a)>d) fail((m!=null?m+": ":"") + "esperado <" + e + "> pero fue <" + a + ">"); }
 public static void assertNotEquals(Object e, Object a){ if(e==null ? a==null : e.equals(a)) fail("no se esperaba <" + a + ">"); }
 public static void assertSame(Object e, Object a){ if(e!=a) fail("se esperaba el mismo objeto"); }
 public static void assertArrayEquals(int[] e, int[] a){ if(!java.util.Arrays.equals(e,a)) fail("arrays distintos: esperado " + java.util.Arrays.toString(e) + " pero fue " + java.util.Arrays.toString(a)); }
 public static void assertArrayEquals(Object[] e, Object[] a){ if(!java.util.Arrays.equals(e,a)) fail("arrays distintos: esperado " + java.util.Arrays.toString(e) + " pero fue " + java.util.Arrays.toString(a)); }
}`,
  'org/junit/jupiter/api/Test.java': 'package org.junit.jupiter.api; import java.lang.annotation.*; @Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD) public @interface Test {}',
  'org/junit/jupiter/api/BeforeEach.java': 'package org.junit.jupiter.api; import java.lang.annotation.*; @Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD) public @interface BeforeEach {}',
  'org/junit/jupiter/api/AfterEach.java': 'package org.junit.jupiter.api; import java.lang.annotation.*; @Retention(RetentionPolicy.RUNTIME) @Target(ElementType.METHOD) public @interface AfterEach {}',
  'org/junit/jupiter/api/DisplayName.java': 'package org.junit.jupiter.api; import java.lang.annotation.*; @Retention(RetentionPolicy.RUNTIME) public @interface DisplayName { String value(); }',
  'org/junit/jupiter/api/function/Executable.java': 'package org.junit.jupiter.api.function; public interface Executable { void execute() throws Throwable; }',
  'org/junit/jupiter/api/Assertions.java': `package org.junit.jupiter.api; import org.junit.jupiter.api.function.Executable; public class Assertions {
 static String p(String m){ return m!=null ? m + " ==> " : ""; }
 public static void fail(String m){ throw new AssertionError(m); }
 public static void assertTrue(boolean c){ assertTrue(c, null); }
 public static void assertTrue(boolean c, String m){ if(!c) fail(p(m) + "se esperaba true"); }
 public static void assertFalse(boolean c){ assertFalse(c, null); }
 public static void assertFalse(boolean c, String m){ if(c) fail(p(m) + "se esperaba false"); }
 public static void assertNull(Object o){ if(o!=null) fail("se esperaba null y es " + o); }
 public static void assertNotNull(Object o){ if(o==null) fail("se esperaba un valor distinto de null"); }
 public static void assertEquals(Object e, Object a){ assertEquals(e, a, (String)null); }
 public static void assertEquals(Object e, Object a, String m){ if(e==null ? a!=null : !e.equals(a)) fail(p(m) + "esperado <" + e + "> pero fue <" + a + ">"); }
 public static void assertEquals(long e, long a){ assertEquals((Object)e, (Object)a, (String)null); }
 public static void assertEquals(long e, long a, String m){ assertEquals((Object)e, (Object)a, m); }
 public static void assertEquals(int e, int a){ assertEquals((Object)e, (Object)a, (String)null); }
 public static void assertEquals(int e, int a, String m){ assertEquals((Object)e, (Object)a, m); }
 public static void assertEquals(double e, double a){ assertEquals(e, a, 0.0); }
 public static void assertEquals(double e, double a, double d){ if(Math.abs(e-a)>d) fail("esperado <" + e + "> pero fue <" + a + ">"); }
 public static void assertNotEquals(Object e, Object a){ if(e==null ? a==null : e.equals(a)) fail("no se esperaba <" + a + ">"); }
 public static void assertArrayEquals(int[] e, int[] a){ if(!java.util.Arrays.equals(e,a)) fail("arrays distintos: esperado " + java.util.Arrays.toString(e) + " pero fue " + java.util.Arrays.toString(a)); }
 public static void assertArrayEquals(Object[] e, Object[] a){ if(!java.util.Arrays.equals(e,a)) fail("arrays distintos: esperado " + java.util.Arrays.toString(e) + " pero fue " + java.util.Arrays.toString(a)); }
 public static <T extends Throwable> T assertThrows(Class<T> t, Executable x){ try { x.execute(); } catch(Throwable e){ if(t.isInstance(e)) return t.cast(e); fail("se esperaba " + t.getSimpleName() + " pero se lanzó " + e.getClass().getSimpleName()); } fail("se esperaba " + t.getSimpleName() + " y no se lanzó nada"); return null; }
 public static void assertDoesNotThrow(Executable x){ try { x.execute(); } catch(Throwable e){ fail("no se esperaba " + e); } }
}`,
  'doodle/Lanzador.java': `package doodle; import java.lang.reflect.*; import java.util.*;
public class Lanzador {
 public static void main(String[] a) throws Throwable {
  System.setIn(new java.io.FileInputStream("/str/doodle-entrada.txt"));
  if (a[0].equals("--tests")) { tests(Arrays.copyOfRange(a, 1, a.length)); return; }
  try { Class.forName(a[0]).getMethod("main", String[].class).invoke(null, (Object) new String[0]); }
  catch (InvocationTargetException e) { Throwable c = e.getCause(); if (c instanceof NoSuchElementException) System.out.println("\\n[Doodle] El programa pidió más datos de los que escribiste en «Entrada»."); else c.printStackTrace(); }
  System.out.flush(); System.out.println("\\u0000FIN");
 }
 static boolean anotado(Method m, String... nombres){ for (java.lang.annotation.Annotation an : m.getAnnotations()) for (String n : nombres) if (an.annotationType().getName().equals(n)) return true; return false; }
 static void tests(String[] clases) throws Throwable {
  int ok = 0, mal = 0;
  for (String n : clases) {
   Class<?> c = Class.forName(n);
   List<Method> antes = new ArrayList<>(), despues = new ArrayList<>(), pruebas = new ArrayList<>();
   for (Method m : c.getDeclaredMethods()) { m.setAccessible(true);
    if (anotado(m, "org.junit.Test", "org.junit.jupiter.api.Test")) pruebas.add(m);
    else if (anotado(m, "org.junit.Before", "org.junit.jupiter.api.BeforeEach")) antes.add(m);
    else if (anotado(m, "org.junit.After", "org.junit.jupiter.api.AfterEach")) despues.add(m); }
   pruebas.sort(Comparator.comparing(Method::getName));
   for (Method m : pruebas) {
    Object o; Constructor<?> k = c.getDeclaredConstructor(); k.setAccessible(true); o = k.newInstance();
    Class<?> esperada = null; org.junit.Test t4 = m.getAnnotation(org.junit.Test.class); if (t4 != null && t4.expected() != org.junit.Test.None.class) esperada = t4.expected();
    String fallo = null;
    try { for (Method b : antes) b.invoke(o); m.invoke(o); if (esperada != null) fallo = "se esperaba " + esperada.getSimpleName(); }
    catch (InvocationTargetException e) { Throwable x = e.getCause(); if (esperada == null || !esperada.isInstance(x)) fallo = (x instanceof AssertionError) ? x.getMessage() : x.toString(); }
    finally { for (Method b : despues) try { b.invoke(o); } catch (Throwable ig) {} }
    if (fallo == null) { ok++; System.out.println("\\u0000OK " + c.getSimpleName() + "." + m.getName()); } else { mal++; System.out.println("\\u0000MAL " + c.getSimpleName() + "." + m.getName() + "\\u0001" + fallo); }
   }
  }
  System.out.println("\\u0000RESUMEN " + ok + " " + mal); System.out.println("\\u0000FIN");
 }
}`,
};
const EJEMPLO_JAVA = [{ nombre: 'Main.java', codigo: 'import java.util.Scanner;\n\npublic class Main {\n\tpublic static void main(String[] args) {\n\t\tScanner sc = new Scanner(System.in);\n\t\tSystem.out.print("¿Cómo te llamas? ");\n\t\tString nombre = sc.nextLine();\n\t\tSystem.out.println("Hola, " + nombre + "!");\n\t}\n}\n' }];
const EJEMPLO_TEST = (clase) => `import org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\npublic class ${clase}Test {\n\t@Test\n\tvoid ejemplo() {\n\t\tassertEquals(4, 2 + 2);\n\t}\n}\n`;
const jvm = { promesa: null };
async function arrancarJvm(aviso) {
  if (jvm.promesa) return jvm.promesa;
  jvm.promesa = (async () => {
    aviso('Descargando Java (solo la primera vez, unos 30 MB)…');
    await cargarScript('https://cjrtnc.leaningtech.com/4.3/loader.js');
    // CheerpJ escribe la salida estándar en #console: un único elemento que se mueve a cada editor
    if (!document.getElementById('console')) { const c = document.createElement('pre'); c.id = 'console'; c.hidden = true; document.body.append(c); }
    await window.cheerpjInit({ status: 'none', version: 8 });
    aviso('Java listo.');
  })();
  jvm.promesa.catch(() => { jvm.promesa = null; });
  return jvm.promesa;
}
const rutaApp = (f) => '/app' + new URL('vendor/' + f, import.meta.url).pathname;
const nombreClase = (f) => { const pk = (f.codigo.match(/^\s*package\s+([\w.]+)\s*;/m) || [])[1]; const n = f.nombre.replace(/\.java$/, ''); return pk ? pk + '.' + n : n; };
const esTest = (f) => /@Test\b/.test(f.codigo);
const tieneMain = (f) => /public\s+static\s+void\s+main\s*\(/.test(f.codigo);
export function montarJava(cont, datos, alCambiar) {
  const d = { archivos: (datos && datos.archivos && datos.archivos.length ? datos.archivos : EJEMPLO_JAVA).map((a) => ({ ...a })), entrada: (datos && datos.entrada) ?? '', activo: 0 };
  const guardar = () => { alCambiar({ archivos: d.archivos, entrada: d.entrada }); cont.querySelector('.estado-guardado').textContent = 'Guardado'; };
  cont.innerHTML = `<div class="hz hz-java">
    <div class="barra-lab"><button type="button" class="boton principal" data-j="ejecutar">▶ Ejecutar</button><button type="button" class="boton mini" data-j="tests">Ejecutar tests</button>
      <button type="button" class="boton mini" data-j="nuevo">+ Archivo</button><button type="button" class="boton mini" data-j="test">+ Test</button><button type="button" class="boton mini" data-j="bajar">Descargar .java</button><span class="estado-guardado"></span></div>
    <div class="java-pestanas" role="tablist"></div>
    <div class="editor"></div>
    <div class="java-io">
      <label class="campo"><span>Entrada (lo que escribirías por teclado, una línea por dato)</span><textarea class="java-entrada" rows="3" spellcheck="false" placeholder="Ana&#10;25">${esc(d.entrada)}</textarea></label>
      <div><span class="antetitulo">Salida</span><div class="consola java-salida"><span class="vacia">Pulsa Ejecutar. La primera vez Java tarda unos segundos en arrancar.</span></div></div>
    </div>
    <div class="java-tests" aria-live="polite"></div>
  </div>`;
  const caja = cont.querySelector('.editor'), salida = cont.querySelector('.java-salida'), resTests = cont.querySelector('.java-tests');
  let ed = null, ocupado = false;
  function pestañas() {
    cont.querySelector('.java-pestanas').innerHTML = d.archivos.map((a, i) => `<button type="button" role="tab" data-j="abrir" data-i="${i}" aria-selected="${i === d.activo}">${esc(a.nombre)}${d.archivos.length > 1 ? `<span class="java-x" data-j="quitar" data-i="${i}" title="Quitar archivo">×</span>` : ''}</button>`).join('');
  }
  function abrir(i) {
    d.activo = i; caja.innerHTML = ''; pestañas();
    ed = crearEditor(caja, d.archivos[i].codigo, { modo: 'text/x-java', etiqueta: d.archivos[i].nombre, alCambiar: (v) => { d.archivos[d.activo].codigo = v; guardar(); }, alEjecutar: () => ejecutar(false) });
  }
  async function compilar(extra = []) {
    const enc = new TextEncoder();
    for (const a of d.archivos) window.cheerpjAddStringFile('/str/' + a.nombre, enc.encode(a.codigo));
    window.cheerpjAddStringFile('/str/doodle-entrada.txt', enc.encode(d.entrada.endsWith('\n') || !d.entrada ? d.entrada : d.entrada + '\n'));
    const lib = rutaApp('doodle-lib.jar') + ':/files/';
    const codigo = await window.cheerpjRunMain('com.sun.tools.javac.Main', rutaApp('tools.jar') + ':' + lib, '-encoding', 'UTF-8', '-nowarn', '-d', '/files/', '-cp', lib, ...d.archivos.map((a) => '/str/' + a.nombre), ...extra);
    return { codigo, cp: lib };
  }
  // CheerpJ escribe la salida en #console, que vive oculto en <body> y no se toca: aquí solo se copia a la vista.
  const consola = () => document.getElementById('console');
  const limpia = (t) => t.split('\n').filter((l) => !l.startsWith('\u0000')).join('\n').replace(/\u0000FIN/g, '').replace(/\/str\//g, '');
  // Espera la marca de fin que escribe el lanzador (CheerpJ no avisa de otra forma), mostrando la salida según llega.
  function esperarFin(pre, limite) {
    return new Promise((ok) => {
      const c = consola(), t0 = Date.now();
      const mira = () => {
        pre.textContent = limpia(c.textContent);
        if (c.textContent.includes('\u0000FIN') || Date.now() - t0 > limite) return ok(Date.now() - t0 > limite);
        setTimeout(mira, 150);
      };
      mira();
    });
  }
  async function ejecutar(tests) {
    if (ocupado) return; ocupado = true;
    const btns = cont.querySelectorAll('[data-j="ejecutar"],[data-j="tests"]'); btns.forEach((b) => { b.disabled = true; });
    resTests.innerHTML = ''; ed.limpiar();
    const aviso = (t) => { salida.innerHTML = `<span class="vacia">${esc(t)}</span>`; };
    try {
      if (!d.archivos.some((a) => (tests ? esTest(a) : tieneMain(a)))) throw new Error(tests ? 'No hay ninguna clase con @Test. Añade una con «+ Test».' : 'Ninguna clase tiene «public static void main(String[] args)».');
      await arrancarJvm(aviso);
      aviso('Compilando…');
      const c = consola(); c.textContent = '';
      const { codigo, cp } = await compilar();
      const pre = document.createElement('pre'); salida.innerHTML = ''; salida.append(pre);
      if (codigo !== 0) {
        const lin = (c.textContent.match(/\/str\/([\w.]+\.java):(\d+):/) || []);
        pre.textContent = limpia(c.textContent);
        const nombre = lin[1], n = +lin[2];
        if (nombre) { const i = d.archivos.findIndex((a) => a.nombre === nombre); if (i >= 0 && i !== d.activo) abrir(i); ed.marcar(n); }
        salida.insertAdjacentHTML('beforeend', '<div class="aviso error"><b>Error de compilación</b><span>Revisa el mensaje de arriba: indica el archivo y la línea.</span></div>');
        return;
      }
      c.textContent = '';
      const args = tests ? ['--tests', ...d.archivos.filter(esTest).map(nombreClase)] : [nombreClase(d.archivos.find(tieneMain))];
      window.cheerpjRunMain('doodle.Lanzador', cp, ...args);
      const agotado = await esperarFin(pre, tests ? 60000 : 30000);
      const texto = c.textContent;
      if (tests) {
        const filas = texto.split('\n').filter((l) => l.startsWith('\u0000OK ') || l.startsWith('\u0000MAL '));
        const res = (texto.match(/\u0000RESUMEN (\d+) (\d+)/) || []);
        resTests.innerHTML = `<div class="aviso ${+res[2] ? 'error' : 'ok'}"><b>${res[1] || 0} tests correctos · ${res[2] || 0} fallidos</b></div><ul class="java-lista-tests">${filas.map((l) => {
          const ok = l.startsWith('\u0000OK '), [nom, msg] = l.replace(/^\u0000(OK|MAL) /, '').split('\u0001');
          return `<li class="${ok ? 'ok' : 'mal'}"><b>${ok ? '✓' : '✗'} ${esc(nom)}</b>${msg ? `<span>${esc(msg)}</span>` : ''}</li>`;
        }).join('')}</ul>`;
      }
      if (!pre.textContent.trim()) pre.remove();
      if (agotado) salida.insertAdjacentHTML('beforeend', '<div class="aviso error"><b>El programa no ha terminado</b><span>¿Un bucle infinito o espera más datos? Recarga la página para pararlo.</span></div>');
      else if (!tests) salida.insertAdjacentHTML('beforeend', '<div class="aviso ok">Programa terminado.</div>');
    } catch (e) { salida.innerHTML = `<div class="aviso error"><b>No se pudo ejecutar</b><span>${esc(e.message)}</span></div>`; }
    finally { ocupado = false; btns.forEach((b) => { b.disabled = false; }); }
  }
  cont.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-j]'); if (!b) return;
    const a = b.dataset.j, i = +b.dataset.i;
    if (a === 'quitar') { ev.stopPropagation(); if (b.dataset.confirmar !== 'si') { b.dataset.confirmar = 'si'; b.textContent = '¿?'; return; } d.archivos.splice(i, 1); abrir(0); guardar(); }
    else if (a === 'abrir') abrir(i);
    else if (a === 'ejecutar') ejecutar(false);
    else if (a === 'tests') ejecutar(true);
    else if (a === 'nuevo' || a === 'test') {
      const base = a === 'test' ? (nombreClase(d.archivos.find(tieneMain) || d.archivos[0]).split('.').pop()) : 'Clase' + (d.archivos.length + 1);
      let nombre = a === 'test' ? base + 'Test' : base; while (d.archivos.some((x) => x.nombre === nombre + '.java')) nombre += '2';
      d.archivos.push({ nombre: nombre + '.java', codigo: a === 'test' ? EJEMPLO_TEST(base) : `public class ${nombre} {\n\t\n}\n` });
      abrir(d.archivos.length - 1); guardar();
    } else if (a === 'bajar') descargar(d.archivos[d.activo].nombre, d.archivos[d.activo].codigo, 'text/x-java');
  });
  cont.querySelector('.java-entrada').addEventListener('input', (ev) => { d.entrada = ev.target.value; guardar(); });
  // el nombre del archivo sigue a la clase pública, como exige Java
  cont.addEventListener('focusout', () => {
    const a = d.archivos[d.activo], m = a && a.codigo.match(/public\s+(?:final\s+|abstract\s+)*(?:class|interface|enum)\s+(\w+)/);
    if (m && a.nombre !== m[1] + '.java' && !d.archivos.some((x) => x.nombre === m[1] + '.java')) { a.nombre = m[1] + '.java'; pestañas(); guardar(); }
  });
  abrir(0);
  return { foco: () => ed && ed.foco() };
}

// ======================= corrección automática de C# =======================
// r es el resultado del simulador (window.CSharp.run). Se mira solo lo que el programa escribe tras el último dato.
export function comprobarCaso(r, caso) {
  const leidas = r.segs ? r.segs.filter((x) => x.t === 'in').length : 0;
  if (r.status === 'input') return { ok: false, motivo: 'El programa pidió más datos de los previstos (' + caso.e.length + ').' };
  if (r.status !== 'done') return { ok: false, motivo: r.error || 'El programa no terminó.' };
  if (leidas < caso.e.length) return { ok: false, motivo: `El programa terminó tras leer ${leidas} de ${caso.e.length} datos (debería haber seguido pidiendo).` };
  // qué parte de la salida se mira: tras el dato número «tras», todo, o (por defecto) lo escrito después del último dato
  const ins = []; r.segs.forEach((x, i) => { if (x.t === 'in') ins.push(i); });
  const desdeSeg = caso.todo ? 0 : caso.tras ? ins[caso.tras - 1] + 1 : (ins.length ? ins[ins.length - 1] + 1 : 0);
  const hastaSeg = caso.tras && ins[caso.tras] !== undefined ? ins[caso.tras] : r.segs.length;
  const salida = r.segs.slice(desdeSeg, hastaSeg).filter((x) => x.t === 'out').map((x) => x.s).join('');
  const mal = (motivo) => ({ ok: false, motivo, salida });
  if (caso.exit !== undefined && (r.exit ?? 0) !== caso.exit) return mal(`Main debería terminar con el código ${caso.exit} y termina con ${r.exit ?? 0}.`);
  const nums = (salida.match(/-?\d+(?:[.,]\d+)?/g) || []).map((x) => parseFloat(x.replace(',', '.')));
  const igual = (a, b) => Math.abs(a - b) < 0.01 + Math.abs(b) * 1e-9;
  let desde = 0;
  for (const esperado of caso.n || []) {
    const vale = [].concat(esperado), pos = nums.findIndex((x, i) => i >= (caso.orden ? desde : 0) && vale.some((v) => igual(x, v)));
    if (pos < 0) return mal(`Esperaba ver ${vale.map(String).join(' o ').replace(/\./g, ',')}${caso.orden ? ' en ese orden' : ''}.`);
    desde = pos + 1;
  }
  if (caso.exacto && nums.length !== (caso.n || []).length) return mal(`Esperaba ver solo ${(caso.n || []).length} números y salen ${nums.length}.`);
  const norm = (s) => { if (!caso.mayus) s = s.toLowerCase(); s = s.replace(/\r/g, '').split('\n').map((l) => l.trimEnd()).join('\n'); return caso.sinEspacios ? s.replace(/[ \t]+/g, '') : s; };
  const sal = norm(salida); desde = 0;
  for (const t of caso.t || []) { // un array dentro = vale cualquiera de esos textos
    const ops = [].concat(t), hit = ops.map((x) => [x, sal.indexOf(norm(x), caso.orden ? desde : 0)]).find((x) => x[1] >= 0);
    if (!hit) return mal(`Esperaba ver «${ops.map((x) => x.replace(/\n/g, '⏎')).join('» o «')}»${caso.orden ? ' en ese orden' : ''}.`);
    desde = hit[1] + norm(hit[0]).length;
  }
  const palabra = (p) => new RegExp('(^|[^\\p{L}])' + p + '($|[^\\p{L}])', 'iu').test(salida);
  for (const p of caso.pal || []) if (!palabra(p)) return mal(`Esperaba que la respuesta dijera «${p}».`);
  for (const p of caso.nopal || []) if (palabra(p)) return mal(`La respuesta no debería decir «${p}».`);
  for (const re of caso.re || []) if (!new RegExp(re, 'i').test(salida)) return mal(`El formato del resultado no es el esperado.`);
  if (caso.veces) { const [t, k] = caso.veces, n = sal.split(norm(t)).length - 1; if (n < k) return mal(`«${t}» debería salir al menos ${k} veces y sale ${n}.`); }
  return { ok: true, salida };
}
// Para probar una función del enunciado: el Main del alumno pasa a llamarse MainOriginal y se añade un Main que la llama.
export function conMainDePrueba(src, codigo) {
  const m = src.match(/((?:public|private|internal)\s+)?static\s+(?:void|int)\s+Main\s*\(/);
  if (!m) return src;
  const main = 'static void Main() {\n' + codigo + '\n}\n';
  return src.slice(0, m.index) + main + m[0].replace(/Main(\s*\()$/, 'MainOriginal$1') + src.slice(m.index + m[0].length);
}

// ======================= práctica de SQL con corrección =======================
export const BD_PRACTICA = `
CREATE TABLE cliente (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, ciudad TEXT, alta DATE);
CREATE TABLE categoria (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL);
CREATE TABLE producto (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, precio REAL NOT NULL, stock INTEGER NOT NULL, id_categoria INTEGER REFERENCES categoria(id));
CREATE TABLE pedido (id INTEGER PRIMARY KEY, id_cliente INTEGER NOT NULL REFERENCES cliente(id), fecha DATE NOT NULL);
CREATE TABLE linea (id_pedido INTEGER REFERENCES pedido(id), id_producto INTEGER REFERENCES producto(id), cantidad INTEGER NOT NULL, PRIMARY KEY (id_pedido, id_producto));
INSERT INTO cliente VALUES (1,'Ana Torres','Valencia','2025-09-14'),(2,'Luis Martí','Alicante','2025-10-02'),(3,'Marta Soler','Valencia','2026-01-20'),(4,'Pablo Ruiz','Castellón','2026-02-11'),(5,'Lucía Gil','Elche',NULL),(6,'Jorge Vidal','Valencia','2026-03-05');
INSERT INTO categoria VALUES (1,'Informática'),(2,'Papelería'),(3,'Libros'),(4,'Electrónica');
INSERT INTO producto VALUES (1,'Ratón inalámbrico',19.9,40,1),(2,'Teclado mecánico',74.5,12,1),(3,'Monitor 24"',149,7,1),(4,'Cuaderno A4',3.2,300,2),(5,'Bolígrafos (10)',4.5,150,2),(6,'Aprende SQL',29.95,18,3),(7,'Programación en C#',34,9,3),(8,'Auriculares',39.99,0,4),(9,'Memoria USB 64 GB',12.5,60,4),(10,'Mochila portátil',45,5,NULL);
INSERT INTO pedido VALUES (1,1,'2026-09-03'),(2,2,'2026-09-10'),(3,1,'2026-09-21'),(4,3,'2026-10-01'),(5,4,'2026-10-05'),(6,3,'2026-10-12'),(7,6,'2026-10-20');
INSERT INTO linea VALUES (1,1,1),(1,4,5),(2,2,1),(2,6,1),(3,9,2),(3,5,3),(4,3,1),(4,1,2),(5,7,1),(6,6,2),(6,4,10),(7,2,1),(7,9,1),(7,1,1);`;
export const EJ_SQL = [
  ['Todos los clientes', 'Muestra todos los datos de todos los clientes.', 'SELECT * FROM cliente'],
  ['Nombre y precio', 'Muestra el nombre y el precio de cada producto.', 'SELECT nombre, precio FROM producto'],
  ['Clientes de Valencia', 'Nombre de los clientes que viven en Valencia.', "SELECT nombre FROM cliente WHERE ciudad = 'Valencia'"],
  ['Productos baratos', 'Nombre y precio de los productos que cuestan menos de 20 €, del más barato al más caro.', 'SELECT nombre, precio FROM producto WHERE precio < 20 ORDER BY precio'],
  ['Sin existencias', 'Nombre de los productos con stock 0.', 'SELECT nombre FROM producto WHERE stock = 0'],
  ['Sin fecha de alta', 'Nombre de los clientes que no tienen fecha de alta.', 'SELECT nombre FROM cliente WHERE alta IS NULL'],
  ['Empiezan por M', 'Nombre de los productos cuyo nombre empieza por «M».', "SELECT nombre FROM producto WHERE nombre LIKE 'M%'"],
  ['Ciudades distintas', 'Lista de ciudades de los clientes, sin repetir y sin vacíos, en orden alfabético.', 'SELECT DISTINCT ciudad FROM cliente WHERE ciudad IS NOT NULL ORDER BY ciudad'],
  ['Precio medio', 'Precio medio de todos los productos (una sola columna).', 'SELECT AVG(precio) FROM producto'],
  ['Clientes por ciudad', 'Cuántos clientes hay en cada ciudad: ciudad y número.', 'SELECT ciudad, COUNT(*) FROM cliente GROUP BY ciudad'],
  ['Producto y categoría', 'Nombre de cada producto y el nombre de su categoría (solo los que tienen categoría).', 'SELECT p.nombre, c.nombre FROM producto p JOIN categoria c ON p.id_categoria = c.id'],
  ['Todos con su categoría', 'Igual que el anterior, pero incluyendo también los productos sin categoría.', 'SELECT p.nombre, c.nombre FROM producto p LEFT JOIN categoria c ON p.id_categoria = c.id'],
  ['Pedidos de Ana', 'Número (id) y fecha de los pedidos de «Ana Torres».', "SELECT pe.id, pe.fecha FROM pedido pe JOIN cliente c ON pe.id_cliente = c.id WHERE c.nombre = 'Ana Torres'"],
  ['Clientes con más de un pedido', 'Nombre de los clientes que han hecho más de un pedido.', 'SELECT c.nombre FROM cliente c JOIN pedido p ON p.id_cliente = c.id GROUP BY c.id HAVING COUNT(*) > 1'],
  ['Clientes sin pedidos', 'Nombre de los clientes que no han hecho ningún pedido.', 'SELECT nombre FROM cliente WHERE id NOT IN (SELECT id_cliente FROM pedido)'],
  ['Importe de cada pedido', 'Id de cada pedido y su importe total (precio × cantidad), del más caro al más barato.', 'SELECT l.id_pedido, SUM(p.precio * l.cantidad) AS total FROM linea l JOIN producto p ON p.id = l.id_producto GROUP BY l.id_pedido ORDER BY total DESC'],
  ['El más vendido', 'Nombre del producto del que más unidades se han vendido.', 'SELECT p.nombre FROM linea l JOIN producto p ON p.id = l.id_producto GROUP BY p.id ORDER BY SUM(l.cantidad) DESC LIMIT 1'],
  ['Por encima de la media', 'Nombre y precio de los productos más caros que el precio medio.', 'SELECT nombre, precio FROM producto WHERE precio > (SELECT AVG(precio) FROM producto)'],
].map(([titulo, enunciado, solucion], i) => ({ id: 'q' + (i + 1), titulo, enunciado, solucion }));
// Compara resultados: mismas filas (y en el mismo orden si la solución usa ORDER BY); los nombres de columna dan igual.
export function mismoResultado(a, b, conOrden) {
  const filas = (r) => (r ? r.values.map((f) => JSON.stringify(f.map((v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)))) : []);
  const fa = filas(a), fb = filas(b);
  if ((a ? a.columns.length : 0) !== (b ? b.columns.length : 0) || fa.length !== fb.length) return false;
  if (!conOrden) { fa.sort(); fb.sort(); }
  return fa.every((f, i) => f === fb[i]);
}
export function montarPracticaSql(cont, datos, alCambiar) {
  const d = { codigo: { ...((datos && datos.codigo) || {}) }, resueltos: { ...((datos && datos.resueltos) || {}) }, actual: (datos && datos.actual) || 'q1' };
  const guardar = () => alCambiar({ codigo: d.codigo, resueltos: d.resueltos, actual: d.actual });
  let ed = null;
  function pintar() {
    const ej = EJ_SQL.find((x) => x.id === d.actual) || EJ_SQL[0];
    cont.innerHTML = `<div class="hz practica">
      <nav class="pr-lista" aria-label="Ejercicios">${EJ_SQL.map((x, i) => `<button type="button" data-pr="ir" data-v="${x.id}" aria-current="${x.id === ej.id}"><span>${d.resueltos[x.id] ? '✓' : i + 1}</span>${esc(x.titulo)}</button>`).join('')}
        <p class="suave">${Object.keys(d.resueltos).length} de ${EJ_SQL.length} resueltos</p></nav>
      <div class="pr-trabajo">
        <div class="pr-enun"><b>${esc(ej.titulo)}</b><p>${esc(ej.enunciado)}</p></div>
        <div class="barra-lab"><button type="button" class="boton principal" data-pr="comprobar">Comprobar</button><button type="button" class="boton mini" data-pr="ejecutar">Solo ejecutar</button>
          <details class="pr-esquema"><summary>Ver las tablas</summary><pre>${esc(BD_PRACTICA.match(/CREATE TABLE[^;]+;/g).join('\n').replace(/ (INTEGER|TEXT|REAL|DATE)( NOT NULL)?/g, '').replace(/ REFERENCES \w+\(\w+\)/g, '→'))}</pre></details></div>
        <div class="editor"></div>
        <div class="sql-salida" aria-live="polite"></div>
      </div></div>`;
    ed = crearEditor(cont.querySelector('.editor'), d.codigo[ej.id] || 'SELECT ', { modo: 'text/x-sql', etiqueta: 'Tu consulta', alCambiar: (v) => { d.codigo[ej.id] = v; guardar(); }, alEjecutar: () => ejecutar(true) });
  }
  const tabla = (r) => (r ? `<div class="tabla-caja"><table><thead><tr>${r.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${r.values.map((f) => `<tr>${f.map((v) => `<td>${v === null ? '<span class="suave">NULL</span>' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="suave">(sin filas)</p>');
  async function ejecutar(comprobar) {
    const salida = cont.querySelector('.sql-salida'), ej = EJ_SQL.find((x) => x.id === d.actual);
    let SQL; try { SQL = await motorSql(); } catch (e) { salida.innerHTML = `<div class="aviso error"><b>No se pudo cargar el motor SQL</b></div>`; return; }
    const db = new SQL.Database(); db.exec(BD_PRACTICA);
    let tuyo;
    try { const sts = sentencias(ed.get()); tuyo = sts.length ? db.exec(sts[sts.length - 1].sql)[0] : null; }
    catch (e) { salida.innerHTML = `<div class="aviso error"><b>Error en la consulta</b><span class="mono">${esc(e.message)}</span></div>`; db.close(); return; }
    if (!comprobar) { salida.innerHTML = tabla(tuyo); db.close(); return; }
    const sol = db.exec(ej.solucion)[0]; db.close();
    const bien = mismoResultado(tuyo, sol, /order\s+by/i.test(ej.solucion));
    if (bien) { d.resueltos[ej.id] = true; guardar(); }
    salida.innerHTML = `<div class="aviso ${bien ? 'ok' : 'error'}"><b>${bien ? 'Correcto' : 'Todavía no'}</b>${bien ? '' : `<span>Tu resultado tiene ${tuyo ? tuyo.values.length : 0} filas y ${tuyo ? tuyo.columns.length : 0} columnas; el esperado, ${sol ? sol.values.length : 0} y ${sol ? sol.columns.length : 0}.</span>`}</div>
      ${bien ? '' : `<details class="plegable"><summary>Ver el resultado esperado</summary>${tabla(sol)}</details>`}<p class="suave">Tu resultado:</p>${tabla(tuyo)}`;
    if (bien) { const b = cont.querySelector(`[data-pr="ir"][data-v="${ej.id}"] span`); if (b) b.textContent = '✓'; }
  }
  cont.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-pr]'); if (!b) return;
    if (b.dataset.pr === 'ir') { d.actual = b.dataset.v; guardar(); pintar(); }
    else ejecutar(b.dataset.pr === 'comprobar');
  });
  pintar();
  return { foco: () => ed && ed.foco() };
}
