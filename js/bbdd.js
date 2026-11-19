// Bases de datos: lecciones interactivas del modelo E/R y del relacional (UD02 y UD03) y un banco de ejercicios
// para hacer el E/R en el editor de diagramas y pasarlo a tablas. Lo usan Doodle y Repaso: quien lo monta dice
// dónde se guarda (leer/guardar) y cómo se navega (ir). Convenio de clase: el par (mín, máx) junto a una entidad
// dice con cuántas instancias de ESA entidad se relaciona una instancia de la otra; esquema con PK, FK, UK y VNN.
import { svgExportable, montarDiagrama, tam } from './diagrama.js';
import { LECCIONES } from './bbddlec.js';
import { EJERCICIOS_BD } from './bbddej.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
// nombres comparables: sin tildes, en mayúsculas, con _ y sin plural (CLIENTES = CLIENTE)
export const norm = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')
  .replace(/(?<=[RLNDZJ])ES$/, '').replace(/(?<=...[^S])S$/, '');

// ---------- diagramas de Chen a partir de una descripción corta (con el mismo dibujo que el editor) ----------
// { e: { CLIENTE: { x, y, a: ['#cod', 'nombre', '*telefono', '~edad', 'dir(calle,num)'], d: débil, ab: atributos debajo } },
//   r: [{ n: 'realiza', x, y, d, con: [['CLIENTE', '(0,N)', rol]], a: [...] }], h: [{ x, y, sup, sub: [], T, S }],
//   g: [{ n: 'REPARTO', x, y, w, h }] }  # = clave, * = multivaluado, ~ = derivado, % = discriminador
export function chen(sp) {
  const nodos = [], aristas = [];
  let k = 0;
  const id = () => 'n' + k++;
  const atrs = (dueno, lista = [], abajo) => {
    const t = tam(dueno), cx = dueno.x + t.w / 2;
    const ns = lista.map((a) => { const m = a.match(/^([#*~%]?)(.*)$/); return { id: id(), tipo: 'atributo', texto: m[2].replace(/\(.*\)$/, '') + (m[1] === '%' ? ' (discr.)' : ''), comp: (m[2].match(/\((.+)\)$/) || [])[1], clave: m[1] === '#', multivaluado: m[1] === '*', derivado: m[1] === '~' }; });
    const ws = ns.map((n) => tam(n).w), paso = Math.max(...ws, 80) + 12;
    ns.forEach((n, i) => {
      n.x = Math.round(cx + (i - (ns.length - 1) / 2) * paso - ws[i] / 2);
      n.y = abajo ? dueno.y + t.h + 34 : dueno.y - 72;
      // compuesto: «direccion(calle,numero,ciudad)» lleva sus partes encima (o debajo)
      const comp = n.comp; delete n.comp;
      nodos.push(n); aristas.push({ id: id(), de: n.id, a: dueno.id, estilo: 'linea' });
      if (comp) {
        const partes = comp.split(',').map((t) => ({ id: id(), tipo: 'atributo', texto: t.trim() })), pw = partes.map((x) => tam(x).w), pp = Math.max(...pw) + 10, pcx = n.x + tam(n).w / 2;
        partes.forEach((x, j) => { x.x = Math.round(pcx + (j - (partes.length - 1) / 2) * pp - pw[j] / 2); x.y = abajo ? n.y + 62 : n.y - 62; nodos.push(x); aristas.push({ id: id(), de: x.id, a: n.id, estilo: 'linea' }); });
      }
    });
  };
  for (const g of sp.g || []) nodos.push({ id: 'E_' + g.n, tipo: 'agregacion', texto: g.n, x: g.x, y: g.y, w: g.w, h: g.h });
  for (const [n, o] of Object.entries(sp.e || {})) { const e = { id: 'E_' + n, tipo: o.d ? 'debil' : 'entidad', texto: n, x: o.x, y: o.y }; nodos.push(e); atrs(e, o.a, o.ab); }
  for (const r of sp.r || []) {
    const n = { id: id(), tipo: r.d ? 'relacion-debil' : 'relacion', texto: r.n, x: r.x, y: r.y };
    nodos.push(n);
    for (const [ent, card, rol] of r.con) aristas.push({ id: id(), de: n.id, a: 'E_' + ent, estilo: 'linea', etA: card || '', etiqueta: rol || '' });
    atrs(n, r.a, r.ab !== false);
  }
  for (const h of sp.h || []) {
    const n = { id: id(), tipo: 'isa', texto: '', total: !!h.T, solapada: !!h.S, x: h.x, y: h.y };
    nodos.push(n); aristas.push({ id: id(), de: 'E_' + h.sup, a: n.id, estilo: 'linea' });
    for (const s of h.sub) aristas.push({ id: id(), de: n.id, a: 'E_' + s, estilo: 'linea' });
  }
  return { notacion: 'er', nodos, aristas, vista: { x: 40, y: 40, z: 1 } };
}
export const figura = (sp, pie = '') => `<figure class="bd-fig">${svgExportable(chen(sp), true)}${pie ? `<figcaption>${pie}</figcaption>` : ''}</figure>`;
// esquema relacional con PK / FK / UK / VNN resaltados
export const esquema = (t) => `<pre class="bd-esq">${esc(t.trim()).replace(/^(\s*)(PK|FK|UK|VNN)(\s*:)/gm, '$1<b class="bd-$2">$2</b>$3').replace(/^([A-ZÁÉÍÓÚÑ_0-9]+)(?= ?\()/gm, '<b>$1</b>')}</pre>`;

// preguntas de opción múltiple: { p, o: [...], ok: índice, x: explicación }
export const preguntas = (lista) => `<div class="bd-quiz">${lista.map((q, i) => `<fieldset class="bd-q" data-q="${i}"><legend>${esc(q.p)}</legend>${q.o.map((o, j) => `<button type="button" class="bd-op" data-j="${j}">${esc(o)}</button>`).join('')}<p class="bd-x" hidden></p></fieldset>`).join('')}</div>`;
export function cablearPreguntas(cont, lista, alTerminar) {
  cont.querySelectorAll('.bd-q').forEach((f) => f.addEventListener('click', (ev) => {
    const b = ev.target.closest('.bd-op'); if (!b || f.dataset.hecha) return;
    const q = lista[+f.dataset.q], bien = +b.dataset.j === q.ok;
    f.dataset.hecha = bien ? 'bien' : 'mal';
    f.querySelectorAll('.bd-op').forEach((x) => { x.disabled = true; if (+x.dataset.j === q.ok) x.classList.add('ok'); });
    if (!bien) b.classList.add('mal');
    const x = f.querySelector('.bd-x'); x.hidden = false; x.innerHTML = `<b>${bien ? 'Bien.' : 'No es esa.'}</b> ${esc(q.x)}`;
    const todas = [...cont.querySelectorAll('.bd-q')];
    if (alTerminar && todas.every((y) => y.dataset.hecha)) alTerminar(todas.filter((y) => y.dataset.hecha === 'bien').length, todas.length);
  }));
}
export const sel = (cls, opciones, val) => `<select class="${cls}">${opciones.map(([v, t]) => `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;

// ---------- leer lo que ha hecho: su E/R (del editor) y su esquema (texto) ----------
const maxDe = (et) => { const m = String(et || '').match(/,\s*([^)\s]+)\s*\)/); return m ? (m[1] === '1' ? '1' : 'N') : null; };
const minDe = (et) => { const m = String(et || '').match(/\(\s*([^,\s]+)\s*,/); return m ? m[1] : null; };
export function leerEr(d) {
  const N = new Map((d?.nodos || []).map((n) => [n.id, n])), esEnt = (n) => n && ['entidad', 'debil', 'agregacion'].includes(n.tipo) && n.texto;
  const ents = (d?.nodos || []).filter(esEnt).map((n) => ({ n: norm(n.texto), t: n.tipo, texto: n.texto }));
  const rels = (d?.nodos || []).filter((n) => n.tipo === 'relacion' || n.tipo === 'relacion-debil').map((r) => ({
    n: r.texto, d: r.tipo === 'relacion-debil',
    lados: (d.aristas || []).filter((e) => e.de === r.id || e.a === r.id).map((e) => { const o = N.get(e.de === r.id ? e.a : e.de); return { o, et: e.a === o?.id ? e.etA : e.etDe }; })
      .filter((l) => esEnt(l.o)).map((l) => ({ ent: norm(l.o.texto), max: maxDe(l.et), min: minDe(l.et) })),
  }));
  const isa = (d?.nodos || []).filter((n) => n.tipo === 'isa').length;
  return { ents, rels, isa };
}
// pistas comparando con la solución; sin dar los nombres de lo que falta
export function revisarEr(d, sol) {
  const u = leerEr(d), s = leerEr(chen(sol.er)), alias = (n) => (sol.alias || {})[n] || [];
  const tiene = (n) => u.ents.find((e) => e.n === n || alias(n).map(norm).includes(e.n));
  const pistas = [];
  const faltan = s.ents.filter((e) => !tiene(e.n));
  if (faltan.length) pistas.push(['mal', `Te ${faltan.length === 1 ? 'falta 1 entidad' : `faltan ${faltan.length} entidades`} (o tienen otro nombre).`]);
  const nombres = new Set(s.ents.flatMap((e) => [e.n, ...alias(e.n).map(norm)]));
  for (const e of u.ents.filter((x) => !nombres.has(x.n))) pistas.push(['mal', `${e.texto} no está en la solución como entidad: ¿es un atributo o una relación?`]);
  for (const e of s.ents.filter((x) => x.t === 'debil')) { const v = tiene(e.n); if (v && v.t !== 'debil') pistas.push(['mal', `${v.texto} debería ser una entidad débil.`]); }
  if (s.isa && !u.isa) pistas.push(['mal', 'Falta una jerarquía (triángulo): hay entidades que son un tipo de otra.']);
  if (s.ents.some((e) => e.t === 'agregacion') && !u.ents.some((e) => e.t === 'agregacion')) pistas.push(['mal', 'Falta una agregación (caja discontinua): hay una relación que se relaciona con otra entidad.']);
  const canon = (n) => { const v = tiene(n); return v ? v.n : '¿' + n; };
  for (const r of s.rels) {
    const clave = r.lados.map((l) => canon(l.ent)).sort().join('|');
    const v = u.rels.find((x) => x.lados.map((l) => l.ent).sort().join('|') === clave);
    const quien = [...new Set(r.lados.map((l) => tiene(l.ent)?.texto || '?'))].join(', ');
    if (!v) { if (!clave.includes('¿')) pistas.push(['mal', `Falta una relación entre ${quien}${r.lados.length > 2 ? ' (las tres juntas)' : r.lados.length === 2 && r.lados[0].ent === r.lados[1].ent ? ' (reflexiva)' : ''}.`]); continue; }
    if (v.lados.some((l) => !l.max)) { pistas.push(['mal', `${v.n || 'La relación'} (${quien}): pon el par (mín, máx) junto a cada entidad.`]); continue; }
    const maxS = r.lados.map((l) => canon(l.ent) + l.max).sort().join(), maxU = v.lados.map((l) => l.ent + l.max).sort().join();
    const minS = r.lados.map((l) => canon(l.ent) + (l.min === '0' ? 0 : 1)).sort().join(), minU = v.lados.map((l) => l.ent + (l.min === '0' ? 0 : 1)).sort().join();
    if (maxS !== maxU) pistas.push(['mal', `${v.n} (${quien}): revisa los máximos. Lee cada lado con «cada … se relaciona con … como mucho».`]);
    else if (minS !== minU && r.lados.length === 2) pistas.push(['medio', `${v.n} (${quien}): los máximos están bien; revisa algún mínimo (¿es obligatorio u opcional?).`]);
    else pistas.push(['bien', `${v.n} (${quien}): bien.`]);
  }
  if (!pistas.some((p) => p[0] !== 'bien')) pistas.unshift(['bien', 'Coincide con la solución en entidades, relaciones y cardinalidades.']);
  return pistas;
}

export function leerEsquema(t) {
  const T = [];
  let cur = null;
  const cols = (x) => x.replace(/[()]/g, '').split(',').map((y) => y.trim().replace(/\*$/, '')).filter(Boolean);
  for (const l of String(t || '').split('\n')) {
    const m = l.match(/^\s*([A-Za-zÁÉÍÓÚÑáéíóúñ_][\wÁÉÍÓÚÑáéíóúñ]*)\s*\(([^)]*)\)/);
    if (m) { cur = { n: m[1], k: norm(m[1]), cols: cols(m[2]), pk: [], fk: [], uk: [], vnn: [] }; T.push(cur); continue; }
    const r = l.match(/^\s*(PK|FK|UK|VNN)\s*:\s*(.+)$/i);
    if (!r || !cur) continue;
    const tipo = r[1].toUpperCase(), v = r[2].trim();
    if (tipo === 'FK') { const f = v.split(/→|->/); cur.fk.push({ cols: cols(f[0]), ref: norm(f[1] || '') }); }
    else if (tipo === 'VNN') cur.vnn.push(...cols(v));
    else cur[tipo.toLowerCase()].push(cols(v));
  }
  return T;
}
function compararEsquema(u, s, sol) {
  const pistas = [], ents = new Set(Object.keys(sol.er.e || {}).map(norm)), usadas = new Set();
  const refs = (x) => x.fk.map((f) => f.ref).sort().join('|');
  const porNombre = (t) => u.find((x) => !usadas.has(x) && (x.k === t.k || (sol.alias?.[t.n] || sol.alias?.[t.k] || []).map(norm).includes(x.k)));
  const pares = s.map((t) => { const v = porNombre(t); if (v) usadas.add(v); return [t, v]; });
  // las tablas de relaciones se llaman como cada uno quiera: se emparejan por sus claves ajenas
  for (const p of pares) if (!p[1] && !ents.has(p[0].k)) { const v = u.find((x) => !usadas.has(x) && x.fk.length && refs(x) === refs(p[0])); if (v) { usadas.add(v); p[1] = v; } }
  for (const [t, v] of pares) {
    if (!v) { pistas.push(['mal', ents.has(t.k) ? `Falta la tabla de la entidad ${t.n}.` : 'Falta una tabla que no sale de una entidad: ¿una N:M, una ternaria, un multivaluado o una 1:1 sin nulos?']); continue; }
    const fallos = [];
    const pkS = (t.pk[0] || []).length, pkU = (v.pk[0] || []).length;
    if (!pkU) fallos.push('no tiene PK');
    else if (pkS !== pkU) fallos.push(`la PK debería tener ${pkS} columna${pkS === 1 ? '' : 's'}`);
    if (refs(t) !== refs(v)) {
      const sobra = v.fk.filter((f) => !t.fk.some((g) => g.ref === f.ref)).map((f) => f.ref), falta = t.fk.filter((f) => !v.fk.some((g) => g.ref === f.ref)).length;
      if (falta) fallos.push(`le falta${falta > 1 ? 'n' : ''} ${falta} clave${falta > 1 ? 's' : ''} ajena${falta > 1 ? 's' : ''}`);
      if (sobra.length) fallos.push(`sobra la clave ajena hacia ${sobra.join(', ')}`);
      if (!falta && !sobra.length) fallos.push('revisa cuántas claves ajenas van a cada tabla');
    } else {
      const obl = (x, f) => f.cols.every((c) => x.vnn.includes(c) || (x.pk[0] || []).includes(c));
      const uni = (x, f) => x.uk.some((k) => k.join() === f.cols.join()) || (x.pk[0] || []).join() === f.cols.join();
      const libres = [...v.fk];
      for (const f of t.fk) {
        const g = libres.find((y) => y.ref === f.ref && y.cols.length === f.cols.length) || libres.find((y) => y.ref === f.ref);
        libres.splice(libres.indexOf(g), 1);
        if (g.cols.length !== f.cols.length) fallos.push(`la clave ajena hacia ${f.ref} es compuesta: ${f.cols.length} columnas`);
        else if (obl(t, f) !== obl(v, g)) fallos.push(`¿la clave ajena hacia ${f.ref} puede faltar? Revisa el VNN`);
        else if (uni(t, f) !== uni(v, g)) fallos.push(`¿la clave ajena hacia ${f.ref} puede repetirse? Revisa la UK`);
      }
    }
    if (t.uk.length > v.uk.length && !fallos.some((f) => f.includes('UK'))) fallos.push('le falta una clave alternativa (UK)');
    pistas.push(fallos.length ? ['mal', `${v.n}: ${fallos.join('; ')}.`] : ['bien', `${v.n}: bien.`]);
  }
  for (const v of u.filter((x) => !usadas.has(x))) pistas.push(['mal', `${v.n} no está en la solución: ¿es una 1:N que debería ir como clave ajena, o tiene otro nombre?`]);
  return pistas;
}
export function revisarEsquema(texto, sol) {
  const u = leerEsquema(texto);
  if (!u.length) return [['mal', 'Escribe las tablas como TABLA (col1, col2) y debajo PK:, FK:, UK: y VNN:.']];
  // con varias soluciones válidas, la más parecida a la suya
  const pistas = [sol.rel, ...(sol.alt || [])].map((r) => compararEsquema(u, leerEsquema(r), sol)).sort((a, b) => a.filter((p) => p[0] !== 'bien').length - b.filter((p) => p[0] !== 'bien').length)[0];
  if (!pistas.some((p) => p[0] !== 'bien')) pistas.unshift(['bien', 'Las tablas, las claves primarias y las claves ajenas coinciden con la solución.']);
  return pistas;
}
const listaPistas = (p) => `<ul class="bd-pistas">${p.map(([c, t]) => `<li class="${c}">${esc(t)}</li>`).join('')}</ul>`;

// ---------- vistas ----------
const estadoEj = (v) => (v?.ok ? '<span class="chip ok">✓ Resuelto</span>' : v?.sol ? '<span class="chip">Solución vista</span>' : v?.er || v?.rel ? '<span class="chip info">Empezado</span>' : '');
function indice(cont, ctx) {
  const hechas = LECCIONES.filter((l) => ctx.leer('L-' + l.id)?.visto).length, resueltos = EJERCICIOS_BD.filter((e) => ctx.leer('E-' + e.id)?.ok).length;
  cont.innerHTML = `<header class="bd-hero"><div><h2>Bases de datos: del E/R a las tablas</h2>
      <p class="suave">Lecciones con diagramas que cambian al tocar y un banco de ejercicios para hacer tú el E/R y el modelo relacional. Notación de clase: Chen, el par (mín, máx) junto a la entidad que se cuenta y el esquema con PK, FK, UK y VNN.</p></div>
      <div class="bd-cuenta"><b>${hechas}/${LECCIONES.length}</b><small>lecciones</small><b>${resueltos}/${EJERCICIOS_BD.length}</b><small>ejercicios</small></div></header>
    <section class="bd-bloque"><h3>Lecciones</h3><div class="bd-lecciones">${LECCIONES.map((l, i) => `<button type="button" class="bd-lec ${ctx.leer('L-' + l.id)?.visto ? 'vista' : ''}" data-ir="l-${l.id}">
      <span class="bd-lec-n">${i + 1}</span><span><b>${esc(l.t)}</b><small>${esc(l.d)}</small></span>${ctx.leer('L-' + l.id)?.visto ? '<span class="chip ok">✓</span>' : ''}</button>`).join('')}</div></section>
    <section class="bd-bloque"><h3>Banco de ejercicios</h3><p class="suave">Lee el enunciado, dibuja el E/R en el editor, escribe las tablas y pulsa «Revisar». La solución está oculta hasta que la pidas.</p>
      <div class="bd-ejs">${EJERCICIOS_BD.map((e) => `<button type="button" class="bd-ej" data-ir="e-${e.id}"><span class="bd-dif d${e.dif}" title="Dificultad ${e.dif} de 3">${'●'.repeat(e.dif)}${'○'.repeat(3 - e.dif)}</span>
        <span><b>${esc(e.t)}</b><small>${esc(e.temas)}</small></span>${estadoEj(ctx.leer('E-' + e.id))}</button>`).join('')}</div></section>`;
  cont.onclick = (ev) => { const b = ev.target.closest('[data-ir]'); if (b) ctx.ir(b.dataset.ir); };
}

function leccion(cont, ctx, l) {
  const i = LECCIONES.indexOf(l), sig = LECCIONES[i + 1];
  cont.innerHTML = `<nav class="bd-migas"><button type="button" class="boton mini" data-ir="">← Bases de datos</button><span class="suave">Lección ${i + 1} de ${LECCIONES.length}</span>
      ${sig ? `<button type="button" class="boton mini" data-ir="l-${sig.id}">${esc(sig.t)} →</button>` : '<span></span>'}</nav>
    <header class="bd-cab"><h2>${esc(l.t)}</h2><p class="suave">${esc(l.d)}</p></header><div class="bd-cuerpo"></div>`;
  cont.onclick = (ev) => { const b = ev.target.closest('[data-ir]'); if (b && cont.contains(b) && !b.closest('.bd-cuerpo')) ctx.ir(b.dataset.ir); };
  l.montar(cont.querySelector('.bd-cuerpo'), { ...ctx, terminar: (bien, total) => ctx.guardar('L-' + l.id, { ...ctx.leer('L-' + l.id), visto: true, bien, total }) });
  if (!ctx.leer('L-' + l.id)?.visto) ctx.guardar('L-' + l.id, { visto: true });
}

function ejercicio(cont, ctx, e) {
  const clave = 'E-' + e.id, yo = () => ctx.leer(clave) || {}, poner = (c) => ctx.guardar(clave, { ...yo(), ...c });
  const i = EJERCICIOS_BD.indexOf(e), sig = EJERCICIOS_BD[i + 1];
  cont.innerHTML = `<nav class="bd-migas"><button type="button" class="boton mini" data-ir="">← Bases de datos</button><span class="suave">Ejercicio ${i + 1} de ${EJERCICIOS_BD.length}</span>
      ${sig ? `<button type="button" class="boton mini" data-ir="e-${sig.id}">Siguiente →</button>` : '<span></span>'}</nav>
    <header class="bd-cab"><h2>${esc(e.t)}</h2><p class="suave">${esc(e.temas)} · <span class="bd-dif d${e.dif}">${'●'.repeat(e.dif)}${'○'.repeat(3 - e.dif)}</span></p></header>
    <article class="bd-enun">${e.enun.trim().split(/\n\s*\n/).map((p) => `<p>${esc(p.trim())}</p>`).join('')}</article>
    <div class="bd-tabs" role="tablist"><button type="button" role="tab" data-tab="er" aria-selected="true">1 · Diagrama E/R</button><button type="button" role="tab" data-tab="rel" aria-selected="false">2 · Modelo relacional</button><button type="button" role="tab" data-tab="sol" aria-selected="false">Solución</button></div>
    <section class="bd-panel" data-p="er"><div class="bd-editor"></div><div class="bd-acciones"><button type="button" class="boton principal" data-a="rev-er">Revisar mi diagrama</button><span class="suave">Pon el par (mín, máx) junto a cada entidad: selecciona la línea y escríbelo en su extremo.</span></div><div class="bd-res" data-r="er"></div></section>
    <section class="bd-panel" data-p="rel" hidden><textarea class="bd-rel" spellcheck="false" placeholder="CLIENTE (cod_cliente, nombre)\n   PK:  cod_cliente\n\nPEDIDO (num_pedido, fecha, cod_cliente)\n   PK:  num_pedido\n   FK:  cod_cliente → CLIENTE\n   VNN: cod_cliente">${esc(yo().rel || '')}</textarea>
      <div class="bd-acciones"><button type="button" class="boton principal" data-a="rev-rel">Revisar mis tablas</button><span class="suave">Una tabla por línea y, debajo, PK:, FK: (con → o ->), UK: y VNN:.</span></div><div class="bd-res" data-r="rel"></div></section>
    <section class="bd-panel" data-p="sol" hidden></section>`;
  let editor = null;
  const montarEd = () => { editor = montarDiagrama(cont.querySelector('.bd-editor'), yo().er, (d) => poner({ er: d }), { notacion: 'er', titulo: e.t }); };
  const solucion = () => {
    const p = cont.querySelector('[data-p=sol]');
    if (!yo().sol) {
      p.innerHTML = `<div class="bd-oculta"><p>La solución está oculta. Inténtalo antes: «Revisar» te da pistas sin destripar nada.</p><button type="button" class="boton" data-a="ver-sol">Ver la solución</button></div>`;
      return;
    }
    p.innerHTML = `${figura(e.er)}<h3>Modelo relacional</h3>${esquema(e.rel)}${e.notas ? `<h3>Por qué</h3><ul class="bd-notas">${e.notas.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}`;
  };
  const tab = (t) => {
    cont.querySelectorAll('.bd-tabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === t));
    cont.querySelectorAll('.bd-panel').forEach((p) => (p.hidden = p.dataset.p !== t));
    if (t === 'sol') solucion();
  };
  const marcarOk = () => { const v = yo(); if (v.okEr && v.okRel && !v.ok) poner({ ok: true }); };
  let armado = 0, t;
  cont.onclick = (ev) => {
    const b = ev.target.closest('button'); if (!b || !cont.contains(b)) return;
    if (b.dataset.ir !== undefined && b.closest('.bd-migas')) return ctx.ir(b.dataset.ir);
    if (b.dataset.tab) return tab(b.dataset.tab);
    if (b.dataset.a === 'rev-er') { const p = revisarEr(yo().er, e); cont.querySelector('[data-r=er]').innerHTML = listaPistas(p); poner({ okEr: p.every((x) => x[0] === 'bien') }); marcarOk(); }
    if (b.dataset.a === 'rev-rel') { clearTimeout(t); poner({ rel: cont.querySelector('.bd-rel').value }); const p = revisarEsquema(yo().rel, e); cont.querySelector('[data-r=rel]').innerHTML = listaPistas(p); poner({ okRel: p.every((x) => x[0] === 'bien') }); marcarOk(); }
    if (b.dataset.a === 'ver-sol') {
      if (!armado) { b.textContent = '¿Seguro? Pulsa otra vez'; armado = setTimeout(() => { armado = 0; b.textContent = 'Ver la solución'; }, 3000); return; }
      clearTimeout(armado); poner({ sol: true }); solucion();
    }
  };
  cont.querySelector('.bd-rel').addEventListener('input', (ev) => { clearTimeout(t); t = setTimeout(() => poner({ rel: ev.target.value }), 500); });
  montarEd();
  return () => editor?.destruir();
}

// ctx: { sub: '' | 'l-<id>' | 'e-<id>', leer(id), guardar(id, valor), ir(sub) }
export function montarBbdd(cont, ctx) {
  cont.classList.add('bd');
  const sub = ctx.sub || '';
  const l = sub.startsWith('l-') && LECCIONES.find((x) => x.id === sub.slice(2)), e = sub.startsWith('e-') && EJERCICIOS_BD.find((x) => x.id === sub.slice(2));
  if (l) return leccion(cont, ctx, l);
  if (e) return ejercicio(cont, ctx, e);
  return indice(cont, ctx);
}
