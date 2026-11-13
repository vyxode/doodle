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
const verPagina = (texto) => { const n = paginaDe(texto); return n ? `<button type="button" class="boton mini" data-ir="${n}">${ico('libro')}Ver en el resumen · pág. ${n}</button>` : ''; };
const LETRAS = 'ABCDEF';
const barra = (hechas, total, extra = '') => `<div class="progreso"><span>${hechas} de ${total}${extra}</span><div class="barra-p"><i style="width:${total ? hechas / total * 100 : 0}%"></i></div></div>`;
const anillo = (ok, total, titulo, botones) => {
  const p = Math.round(ok / total * 100), c = p >= 80 ? 'var(--ok)' : p >= 50 ? 'var(--ojo)' : 'var(--rojo)';
  const frase = p === 100 ? '¡Perfecto!' : p >= 80 ? '¡Muy bien!' : p >= 50 ? 'Vas bien, repasa lo fallado' : 'Toca repasar: vuelve a las falladas';
  return `<div class="resultado">${ico('trofeo')}<div class="anillo" style="--p:${p};--c:${c}"><b>${p}%</b></div><h2 style="margin:0">${frase}</h2><p class="suave" style="margin:0">${titulo}: ${ok} de ${total}</p><div class="pub-fila">${botones}</div></div>`;
};

function estudio(p) {
  if (p === 'notas') return verNotas();
  if (!A.pags.length) { $('p-' + p).innerHTML = `<div class="vacio">${ico('libro')}Espera a que cargue el resumen…</div>`; return; }
  const tipo = { examen: 'p', tarjetas: 't', huecos: 'h' }[p];
  if (!banco(tipo).length) { $('p-' + p).innerHTML = `<div class="vacio">${ico(p)}Este resumen aún no tiene de esto.</div>`; return; }
  $('p-' + p).innerHTML = { examen: vistaExamen, tarjetas: vistaTarjetas, huecos: vistaHuecos }[p]();
}
let exN = 10;
const inicio = (tipo, icono, titulo, texto, acc, extra = '') => {
  const total = banco(tipo).length, f = banco(tipo).filter((id) => fallos()[id]).length;
  const tamanos = [10, 20, 30].filter((n) => n < total);
  if (tipo === 'p' && !tamanos.includes(exN)) exN = tamanos[0] || total;
  return `<div class="inicio"><h2>${ico(icono)}${titulo}</h2><p>${texto}</p>
    <div class="historial"><span class="chip gris">${total} en total</span>${f ? `<span class="chip mal">${f} por repasar</span>` : '<span class="chip ok">Nada pendiente</span>'}</div>
    ${tipo === 'p' ? `<div class="chips-n" role="group" aria-label="Número de preguntas">${[...tamanos, total].map((n, i) => `<button type="button" data-acc="ex-n" data-v="${n}" aria-pressed="${n === exN}">${i === tamanos.length ? 'Todas' : n}</button>`).join('')}</div>` : ''}
    <div class="pub-fila"><button type="button" class="boton principal" data-acc="${acc}">${ico('azar')}Empezar al azar</button>
    <button type="button" class="boton" data-acc="${acc}" data-fallos="1" ${f ? '' : 'disabled'}>${ico('repetir')}Solo lo fallado (${f})</button></div>${extra}</div>`;
};

// ---------- examen ----------
function vistaExamen() {
  const hechas = D.notas.filter((n) => n.f === A.r.f).slice(-5).reverse();
  if (!E) return inicio('p', 'examen', 'Examen tipo test', 'Preguntas del tema al azar. Cada una se corrige al momento, con su explicación y la página del resumen donde se ve.', 'ex-empezar',
    hechas.length ? `<div class="historial"><span class="suave">Últimos:</span>${hechas.map((n) => `<span class="chip ${n.ok / n.total >= 0.8 ? 'ok' : n.ok / n.total >= 0.5 ? 'ojo' : 'mal'}" title="${new Date(n.fecha).toLocaleString('es-ES')}">${n.ok}/${n.total}</span>`).join('')}</div>` : '');
  const resp = E.qs.filter((q) => q.r != null), ok = resp.filter((q) => q.r === item(q.id).c).length, fin = resp.length === E.qs.length;
  const mal = E.qs.filter((q) => q.r != null && q.r !== item(q.id).c).length;
  return (fin ? anillo(ok, E.qs.length, 'Aciertos', `${mal ? `<button type="button" class="boton principal" data-acc="ex-empezar" data-fallos="1">${ico('repetir')}Repetir lo fallado</button>` : ''}<button type="button" class="boton" data-acc="ex-otro">${ico('azar')}Otro examen</button>`) : barra(resp.length, E.qs.length, ` · ${ok} bien · ${resp.length - ok} mal`))
    + E.qs.map((q, n) => {
      const x = item(q.id);
      return `<div class="pregunta ${E.ultima === n ? 'recien' : ''}" id="q${n}"><p class="repaso-p"><span class="num">${n + 1}</span><span>${esc(x.p)}</span></p><div class="repaso-ops">${q.orden.map((i, k) => {
        const cls = q.r == null ? '' : i === x.c ? 'bien' : i === q.r ? 'mal' : '';
        return `<button type="button" class="repaso-op ${cls}" data-acc="ex-resp" data-q="${n}" data-v="${i}" ${q.r != null ? 'disabled' : ''}><span class="letra">${cls === 'bien' ? ico('bien') : cls === 'mal' ? ico('cerrar') : LETRAS[k]}</span>${esc(x.o[i])}</button>`;
      }).join('')}</div>${q.r == null ? '' : `<div class="explica ${q.r === x.c ? 'ok' : 'mal'}">${ico('idea')}<span><b>${q.r === x.c ? 'Correcto.' : 'No.'}</b> ${esc(x.x)}</span></div><div>${verPagina(x.p + ' ' + x.o[x.c] + ' ' + x.x)}</div>`}</div>`;
    }).join('');
}

// ---------- tarjetas ----------
function vistaTarjetas() {
  if (!T) return inicio('t', 'tarjetas', 'Tarjetas', 'Piensa la respuesta, toca la tarjeta para darle la vuelta y di si la sabías. Las que no, se guardan para repasarlas.', 't-empezar');
  if (!T.cola.length) return anillo(T.bien, T.total, 'Las sabías', `<button type="button" class="boton principal" data-acc="t-otra">${ico('repetir')}Volver a empezar</button>`);
  const x = item(T.cola[0]);
  return barra(T.total - T.cola.length, T.total, ` · ${T.bien} sabidas`) + `<div class="escena"><div class="carta ${T.ver ? 'vuelta' : ''}" data-acc="t-ver" role="button" tabindex="0" aria-label="Dar la vuelta">
    <div class="cara"><span>${esc(x.f)}</span><small>${ico('girar')}Toca para ver la respuesta</small></div>
    <div class="cara atras"><span>${esc(x.b)}</span></div></div></div>
    <div class="botones-carta" ${T.ver ? '' : 'hidden'}><button type="button" class="boton si" data-acc="t-resp" data-v="1">${ico('bien')}La sabía</button><button type="button" class="boton no" data-acc="t-resp" data-v="0">${ico('cerrar')}No la sabía</button>${verPagina(x.f + ' ' + x.b)}</div>`;
}

// ---------- huecos ----------
const correcto = (sol, v) => sol.split('|').some((a) => normal(a).replace(/\s+/g, '') === normal(v || '').replace(/\s+/g, '').replace(/\.$/, ''));
function vistaHuecos() {
  if (!H) return inicio('h', 'huecos', 'Completar huecos', 'Escribe la palabra que falta y pulsa Enter: se corrige al momento y te enseña la solución.', 'h-empezar');
  if (!H.cola.length) return anillo(H.bien, H.total, 'Frases perfectas', `<button type="button" class="boton principal" data-acc="h-otra">${ico('repetir')}Volver a empezar</button>`);
  const x = item(H.cola[0]), partes = x.split(/\[([^\]]+)\]/), ok = H.ok; // impares = huecos
  return barra(H.total - H.cola.length, H.total, ` · ${H.bien} perfectas`) + `<form id="f-hueco" class="pregunta ${ok ? 'recien' : ''}" autocomplete="off">
    <p class="repaso-p hueco-texto">${partes.map((s, i) => {
      if (i % 2 === 0) return esc(s);
      const n = (i - 1) / 2;
      return `<input type="text" class="hueco ${ok ? (ok[n] ? 'bien' : 'mal') : ''}" id="h${n}" size="12" spellcheck="false" aria-label="Hueco ${n + 1}" value="${esc(H.val?.[n] || '')}" ${ok ? 'readonly' : ''}>${ok && !ok[n] ? `<small class="hueco-sol">${esc(s.split('|')[0])}</small>` : ''}`;
    }).join('')}</p>
    ${ok ? `<div class="explica ${ok.every(Boolean) ? 'ok' : 'mal'}">${ico(ok.every(Boolean) ? 'bien' : 'idea')}<b>${ok.every(Boolean) ? '¡Todo bien!' : 'En verde, la solución de lo que falló.'}</b></div><div class="pub-fila"><button type="button" class="boton principal" data-acc="h-sig" id="h-sig">${ico('ir')}Siguiente</button>${verPagina(x.replace(/[[\]|]/g, ' '))}</div>`
    : `<div class="pub-fila"><button class="boton principal">${ico('bien')}Comprobar</button></div>`}</form>`;
}

// ---------- acciones ----------
const cola = (tipo, soloFallos) => barajar(banco(tipo).filter((id) => !soloFallos || fallos()[id]));
$('lector').addEventListener('click', (e) => {
  const b = e.target.closest('[data-acc], [data-ir]');
  if (!b) return;
  if (b.dataset.ir) return irPagina(+b.dataset.ir);
  const acc = b.dataset.acc, sf = !!b.dataset.fallos;
  if (acc === 'ex-n') { exN = +b.dataset.v; b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); return; }
  if (acc === 'ex-empezar') E = { qs: cola('p', sf).slice(0, sf ? undefined : exN).map((id) => ({ id, orden: barajar(item(id).o.map((_, i) => i)), r: null })) };
  if (acc === 'ex-resp') {
    const q = E.qs[+b.dataset.q];
    if (q.r != null) return;
    q.r = +b.dataset.v; E.ultima = +b.dataset.q; fallado(q.id, q.r !== item(q.id).c);
    if (E.qs.every((q) => q.r != null)) { D.notas.push({ f: A.r.f, fecha: Date.now(), ok: E.qs.filter((q) => q.r === item(q.id).c).length, total: E.qs.length }); guardar(); }
  }
  if (acc === 'ex-otro') E = null;
  if (acc === 't-empezar') { const c = cola('t', sf); T = { cola: c, total: c.length, bien: 0, ver: false }; }
  if (acc === 't-ver') { // se da la vuelta sin repintar, para que se vea el giro
    T.ver = !T.ver; b.classList.toggle('vuelta', T.ver); $('p-tarjetas').querySelector('.botones-carta').hidden = !T.ver; return;
  }
  if (acc === 't-resp') { const id = T.cola.shift(), si = b.dataset.v === '1'; T.bien += si; T.ver = false; fallado(id, !si); }
  if (acc === 't-otra') T = null;
  if (acc === 'h-empezar') { const c = cola('h', sf); H = { cola: c, total: c.length, bien: 0 }; }
  if (acc === 'h-sig') { H.cola.shift(); H.ok = H.val = null; }
  if (acc === 'h-otra') H = null;
  const p = b.closest('.pestana').id.slice(2), y = scrollY;
  estudio(p); scrollTo(0, y); // repintar sin saltar arriba
  if (acc === 'ex-empezar' || acc.endsWith('-otro') || acc.endsWith('-otra') || (E && E.qs.every((q) => q.r != null) && acc === 'ex-resp')) $('lector').scrollIntoView({ block: 'start', behavior: 'smooth' });
  else if (acc === 'ex-resp') $('q' + (E.ultima + 1))?.scrollIntoView({ block: 'center', behavior: 'smooth' }); // a la siguiente pregunta
  if (acc.startsWith('h-') && $('h0')) $('h0').focus();
});
$('lector').addEventListener('submit', (e) => {
  if (e.target.id !== 'f-hueco') return;
  e.preventDefault();
  const id = H.cola[0], sols = item(id).match(/\[[^\]]+\]/g).map((s) => s.slice(1, -1));
  H.val = sols.map((_, n) => $('h' + n).value);
  H.ok = sols.map((s, n) => correcto(s, H.val[n]));
  const todo = H.ok.every(Boolean); H.bien += todo; fallado(id, !todo);
  estudio('huecos'); $('h-sig').focus(); // Enter otra vez pasa a la siguiente
});

// teclado en tarjetas: espacio da la vuelta, 1 la sabía, 2 no
document.addEventListener('keydown', (e) => {
  if ($('p-tarjetas').hidden || !T?.cola.length || e.target.closest?.('input, textarea')) return;
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); $('p-tarjetas').querySelector('.carta')?.click(); }
  if (T.ver && (e.key === '1' || e.key === '2')) $('p-tarjetas').querySelector(`[data-acc="t-resp"][data-v="${e.key === '1' ? 1 : 0}"]`)?.click();
});
