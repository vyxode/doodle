// Subrayado con notas y búsqueda dentro del resumen abierto. Las marcas guardan su página y sus
// rectángulos en proporción a la página (0-1), así se ven igual en cualquier pantalla.
// Herramientas: leer (no selecciona), marcar (lo seleccionado se subraya en el color elegido) y borrar
// (toca un subrayado o pasa por encima seleccionando). Una zona solo tiene un subrayado: el nuevo se funde con los que pisa.
const COLORES = { a: ['amarillo', '#ffd54a'], v: ['verde', '#7ee08a'], r: ['rosa', '#ff8fb1'] };
const marcasDoc = () => ((D.docs[A.r.f] ||= { marcas: [] }).marcas);
// la marca que se está editando, buscada de nuevo por si una fusión con otro dispositivo la ha cambiado de sitio
const marcaViva = (m) => marcasDoc().find((x) => x.i === m.i) || m;
const nuevaId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// herramienta y color elegidos (se recuerdan en este navegador)
let H0 = { h: 'marcar', c: 'a' };
try { H0 = { ...H0, ...JSON.parse(localStorage.getItem('doodle-herramienta')) }; } catch { /* por defecto */ }
function herramienta(h, c) {
  H0 = { h: h || H0.h, c: c || H0.c };
  try { localStorage.setItem('doodle-herramienta', JSON.stringify(H0)); } catch { /* sin almacenamiento */ }
  $('dentro').className = 'lector modo-' + H0.h;
  for (const b of document.querySelectorAll('#dock .herr')) b.setAttribute('aria-pressed', b.dataset.h === H0.h);
  for (const b of document.querySelectorAll('#dock .color')) b.setAttribute('aria-pressed', b.dataset.c === H0.c);
  $('dentro').style.setProperty('--color-sel', H0.h === 'borrar' ? 'rgba(212,76,71,.25)' : COLORES[H0.c][1] + '88');
  if (H0.h === 'leer') getSelection().removeAllRanges();
}
$('dock').addEventListener('click', (e) => { const b = e.target.closest('.herr, .color'); if (b) herramienta(b.dataset.h || (b.dataset.c && 'marcar'), b.dataset.c); });

// junta los trozos de una misma línea que se tocan
function unirLineas(lista) {
  const r = [];
  for (const n of lista.map((x) => x.slice()).sort((a, b) => a[1] - b[1] || a[0] - b[0])) {
    const u = r.find((u) => Math.abs(u[1] - n[1]) < 0.004 && n[0] <= u[0] + u[2] + 0.01 && u[0] <= n[0] + n[2] + 0.01);
    if (u) { const x = Math.min(u[0], n[0]); u[2] = Math.max(u[0] + u[2], n[0] + n[2]) - x; u[0] = x; u[3] = Math.max(u[3], n[3]); } else r.push(n);
  }
  return r;
}
const cruza = (a, b) => a.some(([x, y, w, h]) => b.some(([X, Y, W, H]) => x < X + W - 0.002 && X < x + w - 0.002 && y < Y + H - 0.002 && Y < y + h - 0.002));

// la selección actual, recortada a la página donde empieza
function seleccion() {
  const s = getSelection();
  if (!s.rangeCount || s.isCollapsed) return null;
  const rg = s.getRangeAt(0), hoja = (rg.startContainer.nodeType === 1 ? rg.startContainer : rg.startContainer.parentElement)?.closest('.hoja');
  if (!hoja?.querySelector('.textLayer').contains(rg.startContainer)) return null;
  const c = hoja.getBoundingClientRect(), r = [];
  for (const x of rg.getClientRects()) {
    const l = Math.max(x.left, c.left), t = Math.max(x.top, c.top), w = Math.min(x.right, c.right) - l, h = Math.min(x.bottom, c.bottom) - t;
    if (w >= 1 && h >= 2) r.push([(l - c.left) / c.width, (t - c.top) / c.height, w / c.width, h / c.height].map((v) => Math.round(v * 1e4) / 1e4));
  }
  const trozos = rg.cloneContents().querySelectorAll('span'); // un trozo por línea: se juntan con espacio
  const t = (trozos.length ? [...trozos].map((x) => x.textContent).join(' ') : s.toString()).replace(/\s+/g, ' ').trim();
  return r.length && t ? { p: +hoja.dataset.p, r: unirLineas(r), t: t.slice(0, 300) } : null;
}

function pintarMarcas(p, nueva) {
  const hoja = A?.hojas[p - 1];
  if (!hoja) return;
  hoja.querySelectorAll('.marcas, .avisos').forEach((x) => x.remove());
  const capa = document.createElement('div'), avisos = document.createElement('div');
  capa.className = 'marcas'; avisos.className = 'avisos';
  for (const m of marcasDoc().filter((m) => m.p === p)) {
    for (const [x, y, w, h] of m.r) capa.insertAdjacentHTML('beforeend', `<i data-m="${m.i}" class="${m.i === nueva ? 'nueva' : ''}" style="left:${x * 100}%;top:${y * 100}%;width:${w * 100}%;height:${h * 100}%;background:${COLORES[m.c][1]}"></i>`);
    // la nota se marca en el margen derecho, a la altura del subrayado, para no tapar texto
    if (m.n) avisos.insertAdjacentHTML('beforeend', `<button type="button" class="aviso" data-m="${m.i}" style="top:${m.r[0][1] * 100}%" title="${esc(m.n.slice(0, 120))}" aria-label="Ver nota: ${esc(m.n)}">${ico('nota')}</button>`);
  }
  hoja.prepend(capa); hoja.append(avisos);
  if ($('n-notas')) $('n-notas').textContent = marcasDoc().length || '';
}

// ---------- deshacer y avisos ----------
// guarda cómo estaban las marcas; deshacer las devuelve (con id nuevo si ya se habían borrado, para que la nube no las vuelva a quitar)
let deshacer = null;
function recordar() {
  const antes = JSON.parse(JSON.stringify(marcasDoc()));
  return () => {
    const ahora = new Set(antes.map((m) => m.i));
    for (const m of marcasDoc()) if (!ahora.has(m.i)) D.borradas[m.i] = 1;
    for (const m of antes) if (D.borradas[m.i]) m.i = nuevaId();
    D.docs[A.r.f].marcas = antes.map((m) => ({ ...m, u: Date.now() }));
    guardar(); repintar(); avisar('Deshecho');
  };
}
let tToast = 0;
function avisar(texto, acciones = []) {
  const t = $('toast');
  t.innerHTML = `<span>${esc(texto)}</span>${acciones.map((a, i) => `<button type="button" data-i="${i}">${ico(a.ico)}${esc(a.t)}</button>`).join('')}`;
  t.hidden = false; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
  t.onclick = (e) => { const b = e.target.closest('button'); if (b) { t.hidden = true; acciones[+b.dataset.i].fn(); } };
  clearTimeout(tToast); tToast = setTimeout(() => { t.hidden = true; }, acciones.length ? 5000 : 2200);
}
const conDeshacer = (texto, extra = []) => { const d = deshacer; avisar(texto, [...extra, { t: 'Deshacer', ico: 'deshacer', fn: () => { if (deshacer === d) deshacer = null; d(); } }]); };

// ---------- subrayar y borrar ----------
function subrayar(sel, conNota) {
  deshacer = recordar();
  const l = marcasDoc(), pisadas = l.filter((m) => m.p === sel.p && cruza(m.r, sel.r));
  let m;
  if (pisadas.length) { // una sola capa: el nuevo trazo se funde con lo que pisa y se queda su nota
    m = pisadas[0];
    m.r = unirLineas([...pisadas.flatMap((x) => x.r), ...sel.r]);
    m.t = [sel.t, ...pisadas.map((x) => x.t)].sort((a, b) => b.length - a.length)[0]; // shortcut: cita aproximada (el trozo más largo), basta para reconocerla
    m.n = pisadas.map((x) => x.n).filter(Boolean).join('\n');
    m.c = H0.c; m.u = Date.now();
    for (const x of pisadas.slice(1)) { l.splice(l.indexOf(x), 1); D.borradas[x.i] = 1; }
  } else l.push(m = { i: nuevaId(), ...sel, c: H0.c, n: '', u: Date.now() });
  getSelection().removeAllRanges(); $('barra').hidden = true;
  guardar(); pintarMarcas(sel.p, m.i);
  if (conNota) editar(m, A.hojas[m.p - 1].querySelector(`[data-m="${m.i}"]`).getBoundingClientRect());
  else conDeshacer(pisadas.length ? 'Subrayado unido' : 'Subrayado', [{ t: 'Nota', ico: 'nota', fn: () => editar(marcaViva(m), A.hojas[m.p - 1].querySelector(`[data-m="${m.i}"]`).getBoundingClientRect()) }]);
}
function borrar(lista) {
  if (!lista.length) return;
  deshacer = recordar();
  const l = marcasDoc(), p = new Set(lista.map((m) => m.p));
  for (const m of lista) {
    A.hojas[m.p - 1]?.querySelectorAll(`[data-m="${m.i}"]`).forEach((x) => x.classList.add('fuera'));
    l.splice(l.indexOf(m), 1); D.borradas[m.i] = 1;
  }
  guardar(); setTimeout(() => p.forEach((n) => pintarMarcas(n)), 230);
  if (!$('p-notas').hidden) verNotas();
  conDeshacer(lista.length > 1 ? `${lista.length} subrayados borrados` : 'Subrayado borrado');
}

// al soltar el ratón se aplica la herramienta; con el dedo, la barra pide confirmarlo
let pendiente = null, dedo = false;
document.addEventListener('pointerdown', (e) => { dedo = e.pointerType === 'touch' || e.pointerType === 'pen'; });
function aplicar(sel, conNota) {
  if (H0.h === 'marcar') subrayar(sel, conNota);
  if (H0.h === 'borrar') { borrar(marcasDoc().filter((m) => m.p === sel.p && cruza(m.r, sel.r))); getSelection().removeAllRanges(); $('barra').hidden = true; }
}
$('hojas').addEventListener('mouseup', () => { if (dedo || H0.h === 'leer') return; setTimeout(() => { const s = seleccion(); if (s) aplicar(s); }, 0); });
let tic = 0;
document.addEventListener('selectionchange', () => { clearTimeout(tic); tic = setTimeout(mirarSeleccion, 300); });
function mirarSeleccion() {
  pendiente = !dedo || $('dentro').hidden || H0.h === 'leer' ? null : seleccion();
  const b = $('barra');
  b.hidden = !pendiente;
  if (!pendiente) return;
  $('b-aplicar').lastChild.textContent = H0.h === 'borrar' ? 'Borrar aquí' : 'Subrayar';
  $('b-nota').hidden = H0.h === 'borrar';
  const r = getSelection().getRangeAt(0).getBoundingClientRect();
  b.style.left = Math.max(8, Math.min(innerWidth - b.offsetWidth - 8, r.left + r.width / 2 - b.offsetWidth / 2)) + 'px';
  b.style.top = (r.bottom + 56 < innerHeight ? r.bottom + 12 : r.top - b.offsetHeight - 12) + 'px'; // debajo: arriba sale el menú del móvil
}
$('barra').onmousedown = (e) => e.preventDefault(); // que pulsar la barra no quite la selección
$('b-aplicar').onclick = () => pendiente && aplicar(pendiente);
$('b-nota').onclick = () => pendiente && aplicar(pendiente, true);

// tocar un subrayado: con el borrador se borra; si no, se abre su nota
const enPunto = (hoja, e) => {
  const c = hoja.getBoundingClientRect(), x = (e.clientX - c.left) / c.width, y = (e.clientY - c.top) / c.height;
  return marcasDoc().filter((m) => m.p === +hoja.dataset.p).reverse().find((m) => m.r.some(([a, b, w, h]) => x >= a - 0.003 && x <= a + w + 0.003 && y >= b - 0.003 && y <= b + h + 0.003));
};
$('hojas').addEventListener('click', (e) => {
  if (!getSelection().isCollapsed) return;
  const hoja = e.target.closest('.hoja');
  if (!hoja) return;
  const aviso = e.target.closest('.aviso');
  const m = aviso ? marcasDoc().find((m) => m.i === aviso.dataset.m) : enPunto(hoja, e);
  if (!m) return cerrarEditor();
  if (H0.h === 'borrar' && !aviso) return borrar([m]);
  editar(m, { left: e.clientX, top: e.clientY, bottom: e.clientY });
});
// con el borrador, el subrayado que se va a borrar se ve antes de tocarlo
let apuntado = null;
$('hojas').addEventListener('mousemove', (e) => {
  if (H0.h !== 'borrar' || dedo) return;
  const hoja = e.target.closest('.hoja'), m = hoja && enPunto(hoja, e);
  if (m?.i === apuntado) return;
  document.querySelectorAll('.marcas i.apunta').forEach((x) => x.classList.remove('apunta'));
  apuntado = m?.i;
  if (m) hoja.querySelectorAll(`.marcas [data-m="${m.i}"]`).forEach((x) => x.classList.add('apunta'));
});

// ---------- nota de un subrayado ----------
let editando = null;
function editar(m, donde) {
  editando = m;
  const ed = $('editor');
  $('ed-cita').textContent = '«' + m.t + '»';
  ed.style.setProperty('--color-cita', COLORES[m.c][1]);
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
  if (b.dataset.c) {
    editando.c = b.dataset.c; editando.u = Date.now(); guardar(); pintarMarcas(editando.p);
    $('editor').style.setProperty('--color-cita', COLORES[b.dataset.c][1]);
    for (const x of $('editor').querySelectorAll('[data-c]')) x.setAttribute('aria-pressed', x === b);
  }
  if (b.id === 'ed-borrar') { const m = editando; editando = null; $('editor').hidden = true; borrar([m]); }
  if (b.id === 'ed-cerrar') cerrarEditor();
};
document.addEventListener('mousedown', (e) => { if (editando && !e.target.closest('#editor, .aviso, .hoja, #toast')) cerrarEditor(); });

// atajos: L/S/B herramientas, 1-3 colores, Ctrl+Z deshacer, / buscar, Esc cerrar
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { cerrarEditor(); $('resultados').innerHTML = ''; return; }
  if ($('lector').hidden || $('p-leer').hidden || e.target.closest?.('input, textarea')) return;
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); if (deshacer) { const d = deshacer; deshacer = null; d(); } return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (k === 'l') herramienta('leer'); else if (k === 's') herramienta('marcar'); else if (k === 'b') herramienta('borrar');
  else if (['1', '2', '3'].includes(k)) herramienta('marcar', 'avr'[+k - 1]);
  else if (k === '/') { e.preventDefault(); $('buscar').focus(); }
});

// ---------- pestaña Mis notas: todo lo subrayado, por página ----------
function verNotas() {
  const l = marcasDoc().slice().sort((a, b) => a.p - b.p || a.r[0][1] - b.r[0][1]);
  $('p-notas').innerHTML = l.length ? `<div class="notas-lista">${l.map((m) => `<div class="nota-item" role="button" tabindex="0" data-ir="${m.p}">
    <span class="nota-cab"><span class="chip gris">Pág. ${m.p}</span>${ico('ir')}</span>
    <span class="nota-cita" style="border-color:${COLORES[m.c][1]}">${esc(m.t)}</span>
    ${m.n ? `<span class="nota-texto">${ico('nota')}<span>${esc(m.n)}</span></span>` : ''}
    <button type="button" class="herr nota-quitar" data-quitar="${m.i}" aria-label="Borrar este subrayado" title="Borrar">${ico('papelera')}</button></div>`).join('')}</div>`
    : `<div class="vacio">${ico('marcar')}<b>Aún no has subrayado nada</b><span>En «Leer», elige un color y selecciona texto: se subraya al soltar. Tócalo después para añadirle una nota.</span></div>`;
}
$('p-notas').addEventListener('click', (e) => {
  const q = e.target.closest('[data-quitar]');
  if (q) { e.stopPropagation(); borrar(marcasDoc().filter((m) => m.i === q.dataset.quitar)); }
}, true);
$('p-notas').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset.ir) e.target.click(); });

// ---------- búsqueda en el texto del resumen ----------
const normal = (x) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
let busca = 0;
$('buscar').oninput = () => { clearTimeout(busca); busca = setTimeout(buscar, 250); };
$('buscar').onfocus = () => $('buscar').value && buscar(); // al volver a la caja, vuelven los resultados
function buscar() {
  const q = normal($('buscar').value.trim()), out = [];
  if (q.length > 1) A.pags.forEach((t, i) => {
    const n = normal(t);
    for (let j = n.indexOf(q); j >= 0 && out.length < 30; j = n.indexOf(q, j + q.length)) out.push(`<button type="button" class="nota-item" data-ir="${i + 1}"><span class="nota-cab"><span class="chip gris">Pág. ${i + 1}</span></span><span>…${esc(t.slice(Math.max(0, j - 50), j))}<mark>${esc(t.slice(j, j + q.length))}</mark>${esc(t.slice(j + q.length, j + q.length + 60))}…</span></button>`);
  });
  $('resultados').innerHTML = q.length > 1 ? (out.length ? out.join('') : `<div class="vacio">${ico('buscar')}No aparece en el resumen.</div>`) : '';
}
herramienta();
