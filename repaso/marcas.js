// Subrayado con notas y búsqueda dentro del resumen abierto. Las marcas guardan su página y sus
// rectángulos en proporción a la página (0-1), así se ven igual en cualquier pantalla.
const COLORES = { a: ['amarillo', '#ffd54a'], v: ['verde', '#7ee08a'], r: ['rosa', '#ff8fb1'] };
const marcasDoc = () => ((D.docs[A.r.f] ||= { marcas: [] }).marcas);
// la marca que se está editando, buscada de nuevo por si una fusión con otro dispositivo la ha cambiado de sitio
const marcaViva = (m) => marcasDoc().find((x) => x.i === m.i) || m;

// la selección actual, recortada a la página donde empieza
function seleccion() {
  const s = getSelection();
  if (!s.rangeCount || s.isCollapsed) return null;
  const rg = s.getRangeAt(0), hoja = (rg.startContainer.nodeType === 1 ? rg.startContainer : rg.startContainer.parentElement)?.closest('.hoja');
  if (!hoja?.querySelector('.textLayer').contains(rg.startContainer)) return null;
  const c = hoja.getBoundingClientRect(), r = [];
  for (const x of [...rg.getClientRects()].sort((a, b) => a.top - b.top || a.left - b.left)) {
    const l = Math.max(x.left, c.left), t = Math.max(x.top, c.top), w = Math.min(x.right, c.right) - l, h = Math.min(x.bottom, c.bottom) - t;
    if (w < 1 || h < 2) continue;
    const n = [(l - c.left) / c.width, (t - c.top) / c.height, w / c.width, h / c.height].map((v) => Math.round(v * 1e4) / 1e4), u = r[r.length - 1];
    // junta los trozos de una misma línea
    if (u && Math.abs(u[1] - n[1]) < 0.004 && n[0] <= u[0] + u[2] + 0.01) { u[2] = Math.max(u[0] + u[2], n[0] + n[2]) - u[0]; u[3] = Math.max(u[3], n[3]); } else r.push(n);
  }
  const trozos = rg.cloneContents().querySelectorAll('span'); // un trozo por línea: se juntan con espacio
  const t = (trozos.length ? [...trozos].map((x) => x.textContent).join(' ') : s.toString()).replace(/\s+/g, ' ').trim();
  return r.length && t ? { p: +hoja.dataset.p, r, t: t.slice(0, 200) } : null;
}

function pintarMarcas(p) {
  const hoja = A?.hojas[p - 1];
  if (!hoja) return;
  hoja.querySelectorAll('.marcas, .avisos').forEach((x) => x.remove());
  const capa = document.createElement('div'), avisos = document.createElement('div');
  capa.className = 'marcas'; avisos.className = 'avisos';
  for (const m of marcasDoc().filter((m) => m.p === p)) {
    for (const [x, y, w, h] of m.r) capa.insertAdjacentHTML('beforeend', `<i style="left:${x * 100}%;top:${y * 100}%;width:${w * 100}%;height:${h * 100}%;background:${COLORES[m.c][1]}"></i>`);
    // la nota se marca en el margen derecho, a la altura del subrayado, para no tapar texto
    if (m.n) avisos.insertAdjacentHTML('beforeend', `<button type="button" class="aviso" data-m="${m.i}" style="top:${m.r[0][1] * 100}%" aria-label="Ver nota: ${esc(m.n)}">✎</button>`);
  }
  hoja.prepend(capa); hoja.append(avisos);
}

// barra para subrayar al seleccionar texto (ratón y dedo)
let pendiente = null;
function mirarSeleccion() {
  pendiente = $('dentro').hidden ? null : seleccion();
  const b = $('barra');
  b.hidden = !pendiente;
  if (!pendiente) return;
  const r = getSelection().getRangeAt(0).getBoundingClientRect();
  b.style.left = Math.max(8, Math.min(innerWidth - b.offsetWidth - 8, r.left + r.width / 2 - b.offsetWidth / 2)) + 'px';
  b.style.top = (r.top > 60 ? r.top - b.offsetHeight - 8 : r.bottom + 8) + 'px';
}
let tic = 0;
document.addEventListener('selectionchange', () => { clearTimeout(tic); tic = setTimeout(mirarSeleccion, 250); });
$('barra').onmousedown = (e) => e.preventDefault(); // que pulsar la barra no quite la selección
$('barra').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b || !pendiente) return;
  const m = { i: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...pendiente, c: b.dataset.c || 'a', n: '', u: Date.now() };
  marcasDoc().push(m); guardar(); pintarMarcas(m.p);
  getSelection().removeAllRanges(); $('barra').hidden = true;
  if (b.dataset.nota) editar(m, b.getBoundingClientRect());
};

// tocar un subrayado (o su ✎) abre su nota
$('hojas').addEventListener('click', (e) => {
  if (!getSelection().isCollapsed) return;
  const hoja = e.target.closest('.hoja');
  if (!hoja) return;
  const aviso = e.target.closest('.aviso');
  const c = hoja.getBoundingClientRect(), x = (e.clientX - c.left) / c.width, y = (e.clientY - c.top) / c.height;
  const m = aviso ? marcasDoc().find((m) => m.i === aviso.dataset.m)
    : marcasDoc().filter((m) => m.p === +hoja.dataset.p).reverse().find((m) => m.r.some(([a, b, w, h]) => x >= a && x <= a + w && y >= b && y <= b + h));
  if (m) editar(m, { left: e.clientX, top: e.clientY, bottom: e.clientY }); else cerrarEditor();
});

let editando = null;
function editar(m, donde) {
  editando = m;
  const ed = $('editor');
  $('ed-cita').textContent = '«' + m.t + '»';
  $('ed-nota').value = m.n;
  for (const b of ed.querySelectorAll('[data-c]')) b.setAttribute('aria-pressed', b.dataset.c === m.c);
  ed.hidden = false;
  ed.style.left = Math.max(8, Math.min(innerWidth - ed.offsetWidth - 8, donde.left - ed.offsetWidth / 2)) + 'px';
  ed.style.top = Math.max(8, Math.min(innerHeight - ed.offsetHeight - 8, donde.bottom + 8)) + 'px';
  $('ed-nota').focus();
}
function cerrarEditor() { if (!editando) return; const p = editando.p; editando = null; $('editor').hidden = true; pintarMarcas(p); if (!$('p-notas').hidden) verNotas(); }
$('ed-nota').oninput = () => { editando = marcaViva(editando); editando.n = $('ed-nota').value.slice(0, 2000); editando.u = Date.now(); guardar(); };
$('editor').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b || !editando) return;
  editando = marcaViva(editando);
  if (b.dataset.c) { editando.c = b.dataset.c; editando.u = Date.now(); guardar(); for (const x of $('editor').querySelectorAll('[data-c]')) x.setAttribute('aria-pressed', x === b); pintarMarcas(editando.p); }
  if (b.id === 'ed-borrar') { const l = marcasDoc(); l.splice(l.indexOf(editando), 1); D.borradas[editando.i] = 1; guardar(); cerrarEditor(); }
  if (b.id === 'ed-cerrar') cerrarEditor();
};
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarEditor(); });
document.addEventListener('mousedown', (e) => { if (editando && !e.target.closest('#editor, .aviso, .hoja')) cerrarEditor(); });

// pestaña Mis notas: todo lo subrayado, por página
function verNotas() {
  const l = marcasDoc().slice().sort((a, b) => a.p - b.p || a.r[0][1] - b.r[0][1]);
  $('p-notas').innerHTML = l.length ? `<div class="notas-lista">${l.map((m) => `<button type="button" class="nota-item" data-ir="${m.p}" data-m="${m.i}">
    <span class="suave">Pág. ${m.p}</span><span class="nota-cita" style="border-color:${COLORES[m.c][1]}">${esc(m.t)}</span>${m.n ? `<span class="nota-texto">${esc(m.n)}</span>` : ''}</button>`).join('')}</div>`
    : '<p class="suave">Aún no has subrayado nada. Selecciona texto en el resumen para subrayarlo y añadirle una nota.</p>';
}

// búsqueda en el texto del resumen
const normal = (x) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
let busca = 0;
$('buscar').oninput = () => { clearTimeout(busca); busca = setTimeout(buscar, 250); };
function buscar() {
  const q = normal($('buscar').value.trim()), out = [];
  if (q.length > 1) A.pags.forEach((t, i) => {
    const n = normal(t);
    for (let j = n.indexOf(q); j >= 0 && out.length < 30; j = n.indexOf(q, j + q.length)) out.push(`<button type="button" class="nota-item" data-ir="${i + 1}"><span class="suave">Pág. ${i + 1}</span><span>…${esc(t.slice(Math.max(0, j - 50), j))}<mark>${esc(t.slice(j, j + q.length))}</mark>${esc(t.slice(j + q.length, j + q.length + 60))}…</span></button>`);
  });
  $('resultados').innerHTML = q.length > 1 ? (out.length ? out.join('') : '<p class="suave">No aparece en el resumen.</p>') : '';
}
