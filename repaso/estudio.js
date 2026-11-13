// Estudio dentro de cada resumen: examen aleatorio, tarjetas y huecos con las preguntas de su módulo
// (js/repaso.js), corrección al momento, repaso de lo fallado y enlace a la página donde se explica.
// RESUMENES puede limitar las preguntas con desde: { p, t, h } (primera posición de cada banco que es de ese resumen).
const BANCOS = { p: 'REPASO', t: 'TARJETAS', h: 'HUECOS' };
let E = null, T = null, H = null; // examen, tarjetas y huecos en curso

const banco = (tipo) => (window[BANCOS[tipo]]?.[A.mod] || []).map((q, i) => (q && i >= (A.r.desde?.[tipo] || 0) ? tipo + ':' + i : null)).filter(Boolean);
const item = (id) => window[BANCOS[id[0]]][A.mod][+id.slice(2)];
const fallos = () => (D.fallos[A.mod] ||= {});
const fallado = (id, si) => { if (si) fallos()[id] = 1; else delete fallos()[id]; guardar(); };
const barajar = (l) => l.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

// página del resumen que más se parece a un texto: palabras en común, pesando más las raras
function paginaDe(texto) {
  if (A.idx?.length !== A.pags.length) {
    A.idx = A.pags.map((p) => new Set(palabras(p)));
    A.df = {}; for (const s of A.idx) for (const w of s) A.df[w] = (A.df[w] || 0) + 1;
  }
  let mejor = 0, punt = 0;
  const ws = [...new Set(palabras(texto))];
  A.idx.forEach((s, i) => { let t = 0; for (const w of ws) if (s.has(w)) t += Math.log(A.pags.length / A.df[w]); if (t > punt) { punt = t; mejor = i + 1; } });
  return mejor;
}
const palabras = (s) => normal(s).match(/[a-z0-9][a-z0-9.+#-]{2,}/g) || [];
const verPagina = (texto) => { const n = paginaDe(texto); return n ? `<button type="button" class="boton mini" data-ir="${n}">Ver en el resumen (pág. ${n})</button>` : ''; };

function estudio(p) {
  if (p === 'notas') return verNotas();
  if (!A.pags.length) { $('p-' + p).innerHTML = '<p class="suave">Espera a que cargue el resumen…</p>'; return; }
  const tipo = { examen: 'p', tarjetas: 't', huecos: 'h' }[p];
  if (!banco(tipo).length) { $('p-' + p).innerHTML = '<p class="suave">Este resumen aún no tiene de esto.</p>'; return; }
  $('p-' + p).innerHTML = { examen: vistaExamen, tarjetas: vistaTarjetas, huecos: vistaHuecos }[p]();
}
const inicio = (tipo, texto, acc) => {
  const total = banco(tipo).length, f = banco(tipo).filter((id) => fallos()[id]).length;
  return `<div class="panel repaso"><p>${texto} ${total} en total.</p><div class="pub-fila">
    ${tipo === 'p' ? `<label class="pub-fila">Preguntas <select id="ex-n">${[10, 20, 30].filter((n) => n < total).map((n) => `<option>${n}</option>`).join('')}<option value="${total}">Todas</option></select></label>` : ''}
    <button type="button" class="boton principal" data-acc="${acc}">Empezar al azar</button>
    <button type="button" class="boton" data-acc="${acc}" data-fallos="1" ${f ? '' : 'disabled'}>Solo las falladas (${f})</button></div></div>`;
};

// ---------- examen ----------
function vistaExamen() {
  const hechas = D.notas.filter((n) => n.f === A.r.f).slice(-5).reverse();
  if (!E) return inicio('p', 'Examen tipo test con las preguntas del tema, corregidas al momento.', 'ex-empezar')
    + (hechas.length ? `<p class="suave">Últimos: ${hechas.map((n) => `${n.ok}/${n.total} (${new Date(n.fecha).toLocaleDateString('es-ES')})`).join(' · ')}</p>` : '');
  const resp = E.qs.filter((q) => q.r != null), ok = resp.filter((q) => q.r === item(q.id).c).length;
  return `<p class="suave">Respondidas ${resp.length} de ${E.qs.length} · ${ok} bien</p>${E.qs.map((q, n) => {
    const x = item(q.id);
    return `<div class="panel repaso"><p class="repaso-p">${n + 1}. ${esc(x.p)}</p><div class="repaso-ops">${q.orden.map((i) => {
      const cls = q.r == null ? '' : i === x.c ? 'bien' : i === q.r ? 'mal' : '';
      return `<button type="button" class="repaso-op ${cls}" data-acc="ex-resp" data-q="${n}" data-v="${i}" ${q.r != null ? 'disabled' : ''}>${esc(x.o[i])}</button>`;
    }).join('')}</div>${q.r == null ? '' : `<p class="repaso-x"><b>${q.r === x.c ? 'Correcto.' : 'No.'}</b> ${esc(x.x)}</p>${verPagina(x.p + ' ' + x.o[x.c] + ' ' + x.x)}`}</div>`;
  }).join('')}${resp.length === E.qs.length ? `<div class="panel repaso"><p class="repaso-p">Nota: ${ok} de ${E.qs.length} (${Math.round(ok / E.qs.length * 100)} %)</p><button type="button" class="boton principal" data-acc="ex-otro">Otro examen</button></div>` : ''}`;
}

// ---------- tarjetas ----------
function vistaTarjetas() {
  if (!T) return inicio('t', 'Tarjetas: piensa la respuesta y dale la vuelta.', 't-empezar');
  if (!T.cola.length) return `<div class="panel repaso"><p class="repaso-p">Hecho: ${T.bien} de ${T.total} las sabías.</p><button type="button" class="boton principal" data-acc="t-otra">Volver a empezar</button></div>`;
  const x = item(T.cola[0]);
  return `<div class="panel repaso"><div class="suave repaso-meta">Quedan ${T.cola.length}</div><p class="repaso-p">${esc(x.f)}</p>
    ${T.ver ? `<p class="tarjeta-b">${esc(x.b)}</p>${verPagina(x.f + ' ' + x.b)}<div class="pub-fila"><button type="button" class="boton principal" data-acc="t-resp" data-v="1">La sabía</button><button type="button" class="boton" data-acc="t-resp" data-v="0">No la sabía</button></div>`
    : '<button type="button" class="boton principal" data-acc="t-ver">Ver respuesta</button>'}</div>`;
}

// ---------- huecos ----------
const correcto = (sol, v) => sol.split('|').some((a) => normal(a).replace(/\s+/g, '') === normal(v || '').replace(/\s+/g, '').replace(/\.$/, ''));
function vistaHuecos() {
  if (!H) return inicio('h', 'Frases para completar, corregidas una a una.', 'h-empezar');
  if (!H.cola.length) return `<div class="panel repaso"><p class="repaso-p">Hecho: ${H.bien} de ${H.total} frases perfectas.</p><button type="button" class="boton principal" data-acc="h-otra">Volver a empezar</button></div>`;
  const x = item(H.cola[0]), partes = x.split(/\[([^\]]+)\]/), ok = H.ok; // impares = huecos
  return `<form id="f-hueco" class="panel repaso" autocomplete="off"><div class="suave repaso-meta">Quedan ${H.cola.length}</div>
    <p class="repaso-p hueco-texto">${partes.map((s, i) => {
      if (i % 2 === 0) return esc(s);
      const n = (i - 1) / 2;
      return `<input type="text" class="hueco ${ok ? (ok[n] ? 'bien' : 'mal') : ''}" id="h${n}" size="12" spellcheck="false" aria-label="Hueco ${n + 1}" value="${esc(H.val?.[n] || '')}" ${ok ? 'readonly' : ''}>${ok && !ok[n] ? `<small class="hueco-sol">${esc(s.split('|')[0])}</small>` : ''}`;
    }).join('')}</p>
    ${ok ? `<p class="repaso-x"><b>${ok.every(Boolean) ? 'Todo bien.' : 'Revisa los huecos en rojo.'}</b></p>${verPagina(x.replace(/[[\]|]/g, ' '))}<button type="button" class="boton principal" data-acc="h-sig">Siguiente</button>`
    : '<button class="boton principal">Comprobar</button>'}</form>`;
}

// ---------- acciones ----------
const cola = (tipo, soloFallos) => barajar(banco(tipo).filter((id) => !soloFallos || fallos()[id]));
$('lector').addEventListener('click', (e) => {
  const b = e.target.closest('[data-acc], [data-ir]');
  if (!b) return;
  if (b.dataset.ir) return irPagina(+b.dataset.ir);
  const acc = b.dataset.acc, sf = !!b.dataset.fallos;
  if (acc === 'ex-empezar') E = { qs: cola('p', sf).slice(0, sf ? undefined : +$('ex-n').value).map((id) => ({ id, orden: barajar(item(id).o.map((_, i) => i)), r: null })) };
  if (acc === 'ex-resp') {
    const q = E.qs[+b.dataset.q];
    if (q.r != null) return;
    q.r = +b.dataset.v; fallado(q.id, q.r !== item(q.id).c);
    if (E.qs.every((q) => q.r != null)) { D.notas.push({ f: A.r.f, fecha: Date.now(), ok: E.qs.filter((q) => q.r === item(q.id).c).length, total: E.qs.length }); guardar(); }
  }
  if (acc === 'ex-otro') E = null;
  if (acc === 't-empezar') { const c = cola('t', sf); T = { cola: c, total: c.length, bien: 0, ver: false }; }
  if (acc === 't-ver') T.ver = true;
  if (acc === 't-resp') { const id = T.cola.shift(), si = b.dataset.v === '1'; T.bien += si; T.ver = false; fallado(id, !si); }
  if (acc === 't-otra') T = null;
  if (acc === 'h-empezar') { const c = cola('h', sf); H = { cola: c, total: c.length, bien: 0 }; }
  if (acc === 'h-sig') { H.cola.shift(); H.ok = H.val = null; }
  if (acc === 'h-otra') H = null;
  const p = b.closest('.pestana').id.slice(2), y = scrollY;
  estudio(p); scrollTo(0, y); // repintar sin saltar arriba
  if (acc === 'ex-empezar' || acc.endsWith('-otro') || acc.endsWith('-otra')) $('p-' + p).scrollIntoView({ block: 'start' });
});
$('lector').addEventListener('submit', (e) => {
  if (e.target.id !== 'f-hueco') return;
  e.preventDefault();
  const id = H.cola[0], sols = item(id).match(/\[[^\]]+\]/g).map((s) => s.slice(1, -1));
  H.val = sols.map((_, n) => $('h' + n).value);
  H.ok = sols.map((s, n) => correcto(s, H.val[n]));
  const todo = H.ok.every(Boolean); H.bien += todo; fallado(id, !todo);
  estudio('huecos');
});
