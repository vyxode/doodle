// Editor de diagramas tipo draw.io: E/R (Chen extendido), modelo relacional, UML de clases y casos de uso.
// El diagrama es un objeto JSON { notacion, nodos, aristas, vista } que guarda Doodle; se exporta a PNG, SVG y .drawio.

export const NOTACIONES = { er: 'E/R (Chen)', relacional: 'Relacional', uml: 'UML clases', casos: 'Casos de uso' };
const FORMAS = {
  entidad: { n: 'Entidad', not: ['er'], w: 120, h: 50 },
  debil: { n: 'Entidad débil', not: ['er'], w: 130, h: 54 },
  relacion: { n: 'Relación', not: ['er'], w: 130, h: 70 },
  'relacion-debil': { n: 'Relación débil', not: ['er'], w: 140, h: 76 },
  atributo: { n: 'Atributo', not: ['er'], w: 96, h: 38 },
  isa: { n: 'Jerarquía', not: ['er'], w: 70, h: 54 },
  agregacion: { n: 'Agregación', not: ['er'], w: 340, h: 170, caja: true },
  tabla: { n: 'Tabla', not: ['relacional'], w: 170, h: 0 },
  clase: { n: 'Clase', not: ['uml'], w: 180, h: 0 },
  interfaz: { n: 'Interfaz', not: ['uml'], w: 180, h: 0 },
  actor: { n: 'Actor', not: ['casos'], w: 70, h: 92 },
  caso: { n: 'Caso de uso', not: ['casos'], w: 150, h: 56 },
  sistema: { n: 'Sistema', not: ['casos'], w: 420, h: 320, caja: true },
  nota: { n: 'Nota', not: ['er', 'relacional', 'uml', 'casos'], w: 140, h: 40 },
};
const TEXTO_INICIAL = { entidad: 'ENTIDAD', debil: 'DÉBIL', relacion: 'relación', 'relacion-debil': 'relación', atributo: 'atributo', isa: 'ES', agregacion: '', tabla: 'TABLA', clase: 'Clase', interfaz: 'Interfaz', actor: 'Actor', caso: 'Caso de uso', sistema: 'Sistema', nota: 'Nota' };
export const ESTILOS = { linea: 'Línea', doble: 'Doble (participación total)', flecha: 'Flecha', fk: 'Clave ajena →', herencia: 'Herencia (UML)', discontinua: 'Discontinua «include/extend»', composicion: 'Composición (UML)', agregacionUml: 'Agregación (UML)' };
const ESTILO_DEFECTO = { er: 'linea', relacional: 'fk', uml: 'linea', casos: 'linea' };
const FUENTE = "14px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"; // comillas simples: va dentro de style="…"
const COLORES_APP = { trazo: 'var(--texto)', relleno: 'var(--panel-2)', texto: 'var(--texto)', suave: 'var(--suave)', acento: 'var(--rojo)', fondoEt: 'var(--panel)' };
const COLORES_PAPEL = { trazo: '#111111', relleno: '#FFFFFF', texto: '#111111', suave: '#555555', acento: '#D90F1C', fondoEt: '#FFFFFF' };

export const diagramaVacio = (notacion = 'er') => ({ notacion, nodos: [], aristas: [], vista: { x: 40, y: 40, z: 1 } });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nuevoId = () => Math.random().toString(36).slice(2, 9);
const snap = (v) => Math.round(v / 10) * 10;

// ---------- medidas ----------
let lienzo = null;
function anchoTexto(t, negrita) {
  if (!lienzo) { try { lienzo = document.createElement('canvas').getContext('2d'); } catch (e) { lienzo = false; } }
  if (!lienzo) return String(t).length * 7.5;
  lienzo.font = (negrita ? '600 ' : '') + FUENTE;
  return lienzo.measureText(t).width;
}
const lineas = (t) => String(t ?? '').split('\n');
const anchoLineas = (t, negrita) => Math.max(0, ...lineas(t).map((l) => anchoTexto(l, negrita)));
// Columna de tabla: "PK id" o "#id" clave primaria; "FK cliente" o "*cliente" clave ajena; "PK FK" ambas.
export function columna(l) {
  let s = l.trim(), pk = false, fk = false;
  for (;;) {
    if (/^(PK\s+|#)/i.test(s)) { pk = true; s = s.replace(/^(PK\s+|#)/i, ''); }
    else if (/^(FK\s+|\*)/i.test(s)) { fk = true; s = s.replace(/^(FK\s+|\*)/i, ''); }
    else break;
  }
  return { pk, fk, texto: s };
}
// Tamaño final de un nodo: las cajas guardan el suyo; el resto crece con el texto.
export function tam(n) {
  const f = FORMAS[n.tipo];
  if (f.caja) return { w: n.w || f.w, h: n.h || f.h };
  if (n.tipo === 'tabla') {
    const cols = lineas(n.columnas || '').filter((l) => l.trim());
    const w = Math.max(f.w, anchoTexto(n.texto, true) + 30, ...cols.map((c) => anchoTexto(columna(c).texto + (columna(c).fk ? ' (FK)' : '')) + 40));
    return { w: Math.ceil(w / 10) * 10, h: 32 + Math.max(1, cols.length) * 22 + 8 };
  }
  if (n.tipo === 'clase' || n.tipo === 'interfaz') {
    const at = lineas(n.atributos || '').filter((l) => l.trim()), me = lineas(n.metodos || '').filter((l) => l.trim());
    const w = Math.max(f.w, anchoTexto(n.texto, true) + 30, ...[...at, ...me].map((l) => anchoTexto(l) + 24));
    return { w: Math.ceil(w / 10) * 10, h: (n.tipo === 'interfaz' ? 50 : 34) + Math.max(1, at.length) * 20 + 10 + Math.max(1, me.length) * 20 + 10 };
  }
  const tw = anchoLineas(n.texto, n.tipo === 'entidad' || n.tipo === 'debil'), th = lineas(n.texto).length * 18;
  const k = { relacion: 1.7, 'relacion-debil': 1.75, atributo: 1.35, caso: 1.3 }[n.tipo] || 1;
  return { w: Math.max(f.w, Math.ceil((tw * k + 30) / 10) * 10), h: Math.max(f.h, th + (n.tipo === 'actor' ? 70 : 20)) };
}

// ---------- geometría ----------
const centro = (n) => { const t = tam(n); return { x: n.x + t.w / 2, y: n.y + t.h / 2 }; };
// Punto del borde de la forma en dirección hacia (px, py).
function borde(n, px, py) {
  const t = tam(n), c = centro(n), dx = px - c.x, dy = py - c.y;
  if (!dx && !dy) return c;
  const a = t.w / 2, b = t.h / 2;
  let k;
  if (n.tipo === 'atributo' || n.tipo === 'caso') k = 1 / Math.sqrt((dx * dx) / (a * a) + (dy * dy) / (b * b));
  else if (n.tipo === 'relacion' || n.tipo === 'relacion-debil') k = 1 / (Math.abs(dx) / a + Math.abs(dy) / b);
  else k = Math.min(dx ? a / Math.abs(dx) : Infinity, dy ? b / Math.abs(dy) : Infinity);
  return { x: c.x + dx * k, y: c.y + dy * k };
}
function extremos(d, e) {
  const A = d.nodos.find((n) => n.id === e.de), B = d.nodos.find((n) => n.id === e.a);
  if (!A || !B) return null;
  const ca = centro(A), cb = centro(B);
  return { p: borde(A, cb.x, cb.y), q: borde(B, ca.x, ca.y) };
}

// ---------- dibujo (SVG en texto: el mismo para la pantalla y para exportar) ----------
function textoCentrado(t, cx, cy, c, extra = '') {
  const ls = lineas(t), y0 = cy - ((ls.length - 1) * 18) / 2;
  return ls.map((l, i) => `<text x="${cx}" y="${y0 + i * 18}" text-anchor="middle" dominant-baseline="central" style="fill:${c.texto};font:${extra}${FUENTE}">${esc(l)}</text>`).join('');
}
function dibujarNodo(n, c, sel) {
  const t = tam(n), { x, y } = n, { w, h } = t, cx = x + w / 2, cy = y + h / 2;
  const st = `fill:${c.relleno};stroke:${c.trazo};stroke-width:1.6`;
  const rombo = (dx, dy) => `${cx},${y + dy} ${x + w - dx},${cy} ${cx},${y + h - dy} ${x + dx},${cy}`;
  let s = '';
  switch (n.tipo) {
    case 'entidad': s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="${st}"/>` + textoCentrado(n.texto, cx, cy, c, '600 '); break;
    case 'debil': s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="${st}"/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" style="${st}"/>` + textoCentrado(n.texto, cx, cy, c, '600 '); break;
    case 'relacion': s = `<polygon points="${rombo(0, 0)}" style="${st}"/>` + textoCentrado(n.texto, cx, cy, c); break;
    case 'relacion-debil': s = `<polygon points="${rombo(0, 0)}" style="${st}"/><polygon points="${rombo(10, 6)}" style="${st}"/>` + textoCentrado(n.texto, cx, cy, c); break;
    case 'atributo': {
      const dash = n.derivado ? ';stroke-dasharray:5 4' : '';
      s = `<ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" style="${st}${dash}"/>`;
      if (n.multivaluado) s += `<ellipse cx="${cx}" cy="${cy}" rx="${w / 2 - 4}" ry="${h / 2 - 4}" style="${st}${dash}"/>`;
      s += textoCentrado(n.texto, cx, cy, c, n.clave ? '600 ' : '');
      if (n.clave) { const tw = anchoLineas(n.texto, true); s += `<line x1="${cx - tw / 2}" x2="${cx + tw / 2}" y1="${cy + 9}" y2="${cy + 9}" style="stroke:${c.texto};stroke-width:1.3"/>`; }
      break;
    }
    case 'isa': {
      s = `<polygon points="${cx},${y} ${x + w},${y + h} ${x},${y + h}" style="${st}"/>` + textoCentrado(n.texto, cx, y + h * 0.66, c, '600 ');
      const etq = `(${n.total ? 't' : 'p'}, ${n.solapada ? 's' : 'e'})`;
      s += `<text x="${x + w + 6}" y="${cy}" dominant-baseline="central" style="fill:${c.suave};font:12px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">${etq}</text>`;
      break;
    }
    case 'agregacion': s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:none;stroke:${c.trazo};stroke-width:1.4;stroke-dasharray:8 5"/>` + (n.texto ? `<text x="${x + 8}" y="${y + 16}" style="fill:${c.suave};font:12px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">${esc(n.texto)}</text>` : ''); break;
    case 'sistema': s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:none;stroke:${c.trazo};stroke-width:1.6"/><text x="${cx}" y="${y + 20}" text-anchor="middle" style="fill:${c.texto};font:600 ${FUENTE}">${esc(n.texto)}</text>`; break;
    case 'caso': s = `<ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" style="${st}"/>` + textoCentrado(n.texto, cx, cy, c); break;
    case 'actor': {
      const hx = cx, top = y + 4;
      s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:transparent;stroke:none"/>` +
        `<g style="fill:none;stroke:${c.trazo};stroke-width:1.8;stroke-linecap:round"><circle cx="${hx}" cy="${top + 10}" r="10" style="fill:${c.relleno}"/><line x1="${hx}" y1="${top + 20}" x2="${hx}" y2="${top + 44}"/><line x1="${hx - 18}" y1="${top + 29}" x2="${hx + 18}" y2="${top + 29}"/><line x1="${hx}" y1="${top + 44}" x2="${hx - 14}" y2="${top + 62}"/><line x1="${hx}" y1="${top + 44}" x2="${hx + 14}" y2="${top + 62}"/></g>` +
        textoCentrado(n.texto, cx, y + h - 12 - (lineas(n.texto).length - 1) * 9, c);
      break;
    }
    case 'tabla': {
      const cols = lineas(n.columnas || '').filter((l) => l.trim());
      s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="${st}"/><rect x="${x}" y="${y}" width="${w}" height="30" style="fill:${c.trazo};stroke:${c.trazo};stroke-width:1.6"/>` +
        `<text x="${cx}" y="${y + 15}" text-anchor="middle" dominant-baseline="central" style="fill:${c.relleno};font:600 ${FUENTE}">${esc(n.texto)}</text>`;
      cols.forEach((l, i) => {
        const col = columna(l), ty = y + 32 + i * 22 + 13;
        s += `<text x="${x + 10}" y="${ty}" dominant-baseline="central" style="fill:${c.texto};font:${col.pk ? '600 ' : ''}${col.fk ? 'italic ' : ''}${FUENTE}">${esc(col.texto)}${col.fk ? ' (FK)' : ''}</text>`;
        if (col.pk) s += `<line x1="${x + 10}" x2="${x + 10 + anchoTexto(col.texto, true)}" y1="${ty + 9}" y2="${ty + 9}" style="stroke:${c.texto};stroke-width:1.2"/>`;
      });
      break;
    }
    case 'clase': case 'interfaz': {
      const at = lineas(n.atributos || '').filter((l) => l.trim()), me = lineas(n.metodos || '').filter((l) => l.trim());
      const cab = n.tipo === 'interfaz' ? 50 : 34, y1 = y + cab, y2 = y1 + Math.max(1, at.length) * 20 + 10;
      s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="${st}"/><line x1="${x}" x2="${x + w}" y1="${y1}" y2="${y1}" style="stroke:${c.trazo};stroke-width:1.4"/><line x1="${x}" x2="${x + w}" y1="${y2}" y2="${y2}" style="stroke:${c.trazo};stroke-width:1.4"/>`;
      if (n.tipo === 'interfaz') s += `<text x="${cx}" y="${y + 16}" text-anchor="middle" style="fill:${c.suave};font:12px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">«interface»</text>`;
      s += `<text x="${cx}" y="${y1 - 17}" text-anchor="middle" dominant-baseline="central" style="fill:${c.texto};font:600 ${n.abstracta ? 'italic ' : ''}${FUENTE}">${esc(n.texto)}</text>`;
      at.forEach((l, i) => { s += `<text x="${x + 10}" y="${y1 + 15 + i * 20}" dominant-baseline="central" style="fill:${c.texto};font:${FUENTE}">${esc(l)}</text>`; });
      me.forEach((l, i) => { s += `<text x="${x + 10}" y="${y2 + 15 + i * 20}" dominant-baseline="central" style="fill:${c.texto};font:${FUENTE}">${esc(l)}</text>`; });
      break;
    }
    case 'nota': s = `<path d="M${x} ${y}h${w - 12}l12 12v${h - 12}h${-w}z" style="fill:${c.relleno};stroke:${c.suave};stroke-width:1.2;stroke-dasharray:3 3"/>` + textoCentrado(n.texto, cx, cy, c); break;
    default: break;
  }
  if (n.tipo === 'relacion' && n.card) s += `<text x="${cx}" y="${y - 8}" text-anchor="middle" style="fill:${c.texto};font:600 13px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">${esc(n.card)}</text>`;
  const marco = sel ? `<rect class="dg-sel" x="${x - 5}" y="${y - 5}" width="${w + 10}" height="${h + 10}"/>` : '';
  return `<g class="dg-nodo" data-id="${n.id}">${s}${marco}</g>`;
}
function puntoEnSegmento(p, q, f, desplaz) {
  const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1;
  return { x: p.x + dx * f + (-dy / L) * desplaz, y: p.y + dy * f + (dx / L) * desplaz };
}
function etiqueta(t, pt, c, peso = '') {
  if (!t) return '';
  const w = anchoTexto(t, !!peso) + 8;
  return `<rect x="${pt.x - w / 2}" y="${pt.y - 10}" width="${w}" height="20" style="fill:${c.fondoEt};stroke:none" rx="2"/><text x="${pt.x}" y="${pt.y}" text-anchor="middle" dominant-baseline="central" style="fill:${c.texto};font:${peso}13px -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">${esc(t)}</text>`;
}
function dibujarArista(d, e, c, sel) {
  const ex = extremos(d, e); if (!ex) return '';
  let { p, q } = ex;
  const linea = (a, b, extra = '') => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" style="stroke:${sel ? c.acento : c.trazo};stroke-width:1.6;${extra}"/>`;
  let s = '';
  const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const punta = (cerrada, relleno, largo = 14, ancho = 7) => {
    const b = { x: q.x - ux * largo, y: q.y - uy * largo };
    const pts = `${q.x},${q.y} ${b.x + nx * ancho},${b.y + ny * ancho} ${b.x - nx * ancho},${b.y - ny * ancho}`;
    return cerrada ? `<polygon points="${pts}" style="fill:${relleno};stroke:${sel ? c.acento : c.trazo};stroke-width:1.6"/>` : `<polyline points="${b.x + nx * ancho},${b.y + ny * ancho} ${q.x},${q.y} ${b.x - nx * ancho},${b.y - ny * ancho}" style="fill:none;stroke:${sel ? c.acento : c.trazo};stroke-width:1.6"/>`;
  };
  const rombo = (relleno) => {
    const m = { x: p.x + ux * 12, y: p.y + uy * 12 }, f = { x: p.x + ux * 24, y: p.y + uy * 24 };
    return `<polygon points="${p.x},${p.y} ${m.x + nx * 6},${m.y + ny * 6} ${f.x},${f.y} ${m.x - nx * 6},${m.y - ny * 6}" style="fill:${relleno};stroke:${sel ? c.acento : c.trazo};stroke-width:1.6"/>`;
  };
  switch (e.estilo) {
    case 'doble': s = linea({ x: p.x + nx * 2.5, y: p.y + ny * 2.5 }, { x: q.x + nx * 2.5, y: q.y + ny * 2.5 }) + linea({ x: p.x - nx * 2.5, y: p.y - ny * 2.5 }, { x: q.x - nx * 2.5, y: q.y - ny * 2.5 }); break;
    case 'flecha': s = linea(p, { x: q.x - ux * 10, y: q.y - uy * 10 }) + punta(true, sel ? c.acento : c.trazo, 12, 6); break;
    case 'fk': s = linea(p, { x: q.x - ux * 10, y: q.y - uy * 10 }) + punta(true, sel ? c.acento : c.trazo, 12, 6); break;
    case 'herencia': s = linea(p, { x: q.x - ux * 14, y: q.y - uy * 14 }) + punta(true, c.relleno, 16, 9); break;
    case 'discontinua': s = linea(p, q, 'stroke-dasharray:7 5') + punta(false, '', 12, 7); break;
    case 'composicion': s = rombo(sel ? c.acento : c.trazo) + linea({ x: p.x + ux * 24, y: p.y + uy * 24 }, q); break;
    case 'agregacionUml': s = rombo(c.relleno) + linea({ x: p.x + ux * 24, y: p.y + uy * 24 }, q); break;
    default: s = linea(p, q);
  }
  s += etiqueta(e.etiqueta, puntoEnSegmento(p, q, 0.5, 0), c, e.estilo === 'discontinua' ? '' : '600 ');
  s += etiqueta(e.etDe, puntoEnSegmento(p, q, Math.min(0.3, 34 / L), -12), c);
  s += etiqueta(e.etA, puntoEnSegmento(p, q, 1 - Math.min(0.3, 34 / L), -12), c);
  // trazo ancho invisible para poder tocar la línea con el dedo
  return `<g class="dg-arista" data-arista="${e.id}"><line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" style="stroke:transparent;stroke-width:16"/>${s}</g>`;
}
function limites(d) {
  if (!d.nodos.length) return { x: 0, y: 0, w: 400, h: 300 };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const n of d.nodos) { const t = tam(n); x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y - 20); x1 = Math.max(x1, n.x + t.w + (n.tipo === 'isa' ? 50 : 0)); y1 = Math.max(y1, n.y + t.h); }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
const ordenNodos = (d) => [...d.nodos].sort((a, b) => (FORMAS[b.tipo].caja ? 1 : 0) - (FORMAS[a.tipo].caja ? 1 : 0));
export function svgExportable(d) {
  const b = limites(d), m = 30, c = COLORES_PAPEL;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(b.w + 2 * m)}" height="${Math.ceil(b.h + 2 * m)}" viewBox="${b.x - m} ${b.y - m} ${b.w + 2 * m} ${b.h + 2 * m}">` +
    `<rect x="${b.x - m}" y="${b.y - m}" width="${b.w + 2 * m}" height="${b.h + 2 * m}" fill="#FFFFFF"/>` +
    ordenNodos(d).filter((n) => FORMAS[n.tipo].caja).map((n) => dibujarNodo(n, c)).join('') +
    d.aristas.map((e) => dibujarArista(d, e, c)).join('') +
    ordenNodos(d).filter((n) => !FORMAS[n.tipo].caja).map((n) => dibujarNodo(n, c)).join('') + '</svg>';
}

// ---------- exportar a draw.io (formato mxGraph) ----------
const xesc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const hesc = (s) => String(s ?? '').replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch])).replace(/\n/g, '<br>');
export function aDrawio(d, nombre = 'Diagrama') {
  const base = 'whiteSpace=wrap;html=1;fontFamily=Helvetica;';
  const est = {
    entidad: 'rounded=0;fontStyle=1;', debil: 'shape=ext;double=1;rounded=0;fontStyle=1;', relacion: 'rhombus;', 'relacion-debil': 'shape=rhombus;double=1;perimeter=rhombusPerimeter;',
    atributo: 'ellipse;', isa: 'triangle;direction=north;fontStyle=1;', agregacion: 'rounded=0;dashed=1;fillColor=none;verticalAlign=top;align=left;spacingLeft=6;',
    tabla: 'rounded=0;verticalAlign=top;align=left;spacingLeft=8;', clase: 'rounded=0;verticalAlign=top;align=left;spacingLeft=8;', interfaz: 'rounded=0;verticalAlign=top;align=left;spacingLeft=8;',
    actor: 'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;outlineConnect=0;', caso: 'ellipse;', sistema: 'rounded=0;fillColor=none;verticalAlign=top;fontStyle=1;', nota: 'shape=note;size=12;dashed=1;',
  };
  const valor = (n) => {
    if (n.tipo === 'atributo') return n.clave ? `<u>${hesc(n.texto)}</u>` : hesc(n.texto);
    if (n.tipo === 'isa') return `${hesc(n.texto)}<br><font style="font-size:10px">(${n.total ? 't' : 'p'}, ${n.solapada ? 's' : 'e'})</font>`;
    if (n.tipo === 'relacion' && n.card) return `${hesc(n.texto)}<br><b>${hesc(n.card)}</b>`;
    if (n.tipo === 'tabla') return `<div style="text-align:center"><b>${hesc(n.texto)}</b></div><hr>` + lineas(n.columnas).filter((l) => l.trim()).map((l) => { const c = columna(l); return c.pk ? `<u><b>${hesc(c.texto)}</b></u>${c.fk ? ' (FK)' : ''}` : c.fk ? `<i>${hesc(c.texto)} (FK)</i>` : hesc(c.texto); }).join('<br>');
    if (n.tipo === 'clase' || n.tipo === 'interfaz') return `<div style="text-align:center">${n.tipo === 'interfaz' ? '«interface»<br>' : ''}<b>${n.abstracta ? '<i>' : ''}${hesc(n.texto)}${n.abstracta ? '</i>' : ''}</b></div><hr>${lineas(n.atributos).filter((l) => l.trim()).map(hesc).join('<br>')}<hr>${lineas(n.metodos).filter((l) => l.trim()).map(hesc).join('<br>')}`;
    return hesc(n.texto);
  };
  const extra = (n) => (n.tipo === 'atributo' ? (n.multivaluado ? 'shape=doubleEllipse;' : '') + (n.derivado ? 'dashed=1;' : '') : '');
  const flecha = {
    linea: 'endArrow=none;', doble: 'shape=link;endArrow=none;', flecha: 'endArrow=block;endFill=1;', fk: 'endArrow=block;endFill=1;', herencia: 'endArrow=block;endFill=0;endSize=14;',
    discontinua: 'dashed=1;endArrow=open;', composicion: 'startArrow=diamondThin;startFill=1;startSize=16;endArrow=none;', agregacionUml: 'startArrow=diamondThin;startFill=0;startSize=16;endArrow=none;',
  };
  let celdas = '';
  for (const n of ordenNodos(d)) {
    const t = tam(n);
    celdas += `<mxCell id="n${xesc(n.id)}" value="${xesc(valor(n))}" style="${est[n.tipo]}${extra(n)}${base}" vertex="1" parent="1"><mxGeometry x="${Math.round(n.x)}" y="${Math.round(n.y)}" width="${Math.round(t.w)}" height="${Math.round(t.h)}" as="geometry"/></mxCell>`;
  }
  for (const e of d.aristas) {
    celdas += `<mxCell id="e${xesc(e.id)}" value="${xesc(hesc(e.etiqueta || ''))}" style="${flecha[e.estilo] || flecha.linea}html=1;rounded=0;" edge="1" parent="1" source="n${xesc(e.de)}" target="n${xesc(e.a)}"><mxGeometry relative="1" as="geometry"/></mxCell>`;
    [['etDe', -0.75], ['etA', 0.75]].forEach(([k, pos], i) => {
      if (e[k]) celdas += `<mxCell id="e${xesc(e.id)}l${i}" value="${xesc(hesc(e[k]))}" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" vertex="1" connectable="0" parent="e${xesc(e.id)}"><mxGeometry x="${pos}" y="-12" relative="1" as="geometry"><mxPoint as="offset"/></mxGeometry></mxCell>`;
    });
  }
  return `<mxfile host="Doodle"><diagram name="${xesc(nombre)}" id="doodle"><mxGraphModel dx="1000" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${celdas}</root></mxGraphModel></diagram></mxfile>`;
}

function descargar(nombre, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nombre;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function aPng(d, escala = 2) {
  const svg = svgExportable(d);
  const img = new Image();
  await new Promise((ok, mal) => { img.onload = ok; img.onerror = mal; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
  const cv = document.createElement('canvas'); cv.width = img.width * escala; cv.height = img.height * escala;
  const ctx = cv.getContext('2d'); ctx.scale(escala, escala); ctx.drawImage(img, 0, 0);
  return new Promise((ok) => cv.toBlob(ok, 'image/png'));
}

// ---------- editor ----------
export function montarDiagrama(cont, datos, alCambiar, opciones = {}) {
  const d = datos && datos.nodos ? JSON.parse(JSON.stringify(datos)) : diagramaVacio(opciones.notacion || 'er');
  if (!d.vista) d.vista = { x: 40, y: 40, z: 1 };
  const nombre = (opciones.titulo || 'diagrama').replace(/[^\w\-áéíóúñÁÉÍÓÚÑ ]+/g, '').trim().replace(/\s+/g, '-') || 'diagrama';
  let sel = null; // { tipo: 'nodo' | 'arista', id }
  let modoConectar = false, origenConectar = null;
  const historia = [], rehacer = [];
  cont.innerHTML = `
  <div class="dg">
    <div class="dg-barra">
      <select class="dg-notacion" aria-label="Tipo de diagrama">${Object.entries(NOTACIONES).map(([k, v]) => `<option value="${k}" ${k === d.notacion ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <div class="dg-paleta"></div>
      <span class="dg-sep"></span>
      <button type="button" class="boton mini dg-conectar" aria-pressed="false" title="Toca un elemento y luego otro para unirlos">Conectar</button>
      <button type="button" class="boton mini" data-dg="deshacer" title="Deshacer (Ctrl+Z)">↶</button>
      <button type="button" class="boton mini" data-dg="rehacer" title="Rehacer (Ctrl+Y)">↷</button>
      <button type="button" class="boton mini" data-dg="menos" title="Alejar">−</button>
      <button type="button" class="boton mini" data-dg="ajustar" title="Ver todo">⤢</button>
      <button type="button" class="boton mini" data-dg="mas" title="Acercar">+</button>
      <span class="dg-sep"></span>
      <button type="button" class="boton mini" data-dg="png">PNG</button>
      <button type="button" class="boton mini" data-dg="svg">SVG</button>
      <button type="button" class="boton mini principal" data-dg="drawio" title="Archivo que abre draw.io">.drawio</button>
      ${opciones.alRelacional ? '<button type="button" class="boton mini dg-relacional" data-dg="relacional" title="Crea un diagrama relacional nuevo a partir de este E/R">Pasar a relacional</button>' : ''}
    </div>
    <div class="dg-area">
      <svg class="dg-svg" tabindex="0" aria-label="Lienzo del diagrama"><defs><pattern id="dg-rejilla" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" class="dg-punto"/></pattern></defs>
        <rect class="dg-fondo" width="100%" height="100%" fill="url(#dg-rejilla)"/><g class="dg-mundo"></g><line class="dg-temporal" hidden/></svg>
      <aside class="dg-insp"></aside>
      <p class="dg-ayuda"></p>
    </div>
  </div>`;
  const svg = cont.querySelector('.dg-svg'), mundo = cont.querySelector('.dg-mundo'), insp = cont.querySelector('.dg-insp'), temporal = cont.querySelector('.dg-temporal');
  const ayuda = cont.querySelector('.dg-ayuda'), btnConectar = cont.querySelector('.dg-conectar');

  const guardar = () => alCambiar(JSON.parse(JSON.stringify(d)));
  function apuntar() { historia.push(JSON.stringify({ nodos: d.nodos, aristas: d.aristas, notacion: d.notacion })); if (historia.length > 100) historia.shift(); rehacer.length = 0; }
  function restaurar(desde, hacia) {
    if (!desde.length) return;
    hacia.push(JSON.stringify({ nodos: d.nodos, aristas: d.aristas, notacion: d.notacion }));
    Object.assign(d, JSON.parse(desde.pop())); sel = null; pintar(); pintarInsp(); guardar();
  }
  function pintarPaleta() {
    const br = cont.querySelector('.dg-relacional'); if (br) br.hidden = d.notacion !== 'er';
    cont.querySelector('.dg-paleta').innerHTML = Object.entries(FORMAS).filter(([, f]) => f.not.includes(d.notacion))
      .map(([k, f]) => `<button type="button" class="boton mini" data-forma="${k}">+ ${f.n}</button>`).join('');
  }
  function pintar() {
    const v = d.vista;
    mundo.setAttribute('transform', `translate(${v.x} ${v.y}) scale(${v.z})`);
    const n = ordenNodos(d);
    mundo.innerHTML = n.filter((x) => FORMAS[x.tipo].caja).map((x) => dibujarNodo(x, COLORES_APP, sel && sel.id === x.id)).join('') +
      d.aristas.map((e) => dibujarArista(d, e, COLORES_APP, sel && sel.id === e.id)).join('') +
      n.filter((x) => !FORMAS[x.tipo].caja).map((x) => dibujarNodo(x, COLORES_APP, sel && sel.id === x.id)).join('');
    if (sel && sel.tipo === 'nodo') {
      const x = d.nodos.find((k) => k.id === sel.id);
      if (x) {
        const t = tam(x);
        mundo.insertAdjacentHTML('beforeend', `<circle class="dg-asa" data-asa="conectar" cx="${x.x + t.w + 14}" cy="${x.y + t.h / 2}" r="9"/><text class="dg-asa-txt" x="${x.x + t.w + 14}" y="${x.y + t.h / 2}" text-anchor="middle" dominant-baseline="central">+</text>` +
          (FORMAS[x.tipo].caja ? `<rect class="dg-asa" data-asa="tam" x="${x.x + t.w - 6}" y="${x.y + t.h - 6}" width="12" height="12"/>` : ''));
      }
    }
    ayuda.textContent = !d.nodos.length ? 'Añade elementos con los botones de arriba. Arrastra para moverlos; usa el + de un elemento seleccionado (o «Conectar») para unirlos.'
      : modoConectar ? (origenConectar ? 'Ahora toca el elemento de destino.' : 'Toca el elemento de origen.') : '';
    ayuda.hidden = !ayuda.textContent;
  }
  const campo = (et, html) => `<label class="campo"><span>${et}</span>${html}</label>`;
  const casilla = (k, et, v) => `<label class="casilla"><input type="checkbox" data-prop="${k}" ${v ? 'checked' : ''}> ${et}</label>`;
  function pintarInsp() {
    insp.classList.toggle('abierto', !!sel);
    if (!sel) { insp.innerHTML = `<p class="suave">Selecciona un elemento o una línea para editarlo.</p><p class="suave dg-atajos">Supr borra · Ctrl+D duplica · Ctrl+Z deshace · rueda o pellizco para el zoom</p>`; return; }
    if (sel.tipo === 'arista') {
      const e = d.aristas.find((x) => x.id === sel.id); if (!e) { sel = null; return pintarInsp(); }
      insp.innerHTML = `<h3>Línea</h3>
        ${campo('Estilo', `<select data-prop="estilo">${Object.entries(ESTILOS).map(([k, v]) => `<option value="${k}" ${k === (e.estilo || 'linea') ? 'selected' : ''}>${v}</option>`).join('')}</select>`)}
        ${campo('Texto en el centro', `<input type="text" data-prop="etiqueta" value="${esc(e.etiqueta)}" placeholder="«include», rol…">`)}
        ${campo('Junto al origen', `<input type="text" data-prop="etDe" value="${esc(e.etDe)}" placeholder="(1,N)">`)}
        ${campo('Junto al destino', `<input type="text" data-prop="etA" value="${esc(e.etA)}" placeholder="(0,1)">`)}
        <div class="fila-botones"><button type="button" class="boton mini" data-dg="invertir">Invertir</button><button type="button" class="boton mini peligro" data-dg="borrar">Eliminar</button><button type="button" class="boton mini" data-dg="cerrar-insp">Listo</button></div>`;
      return;
    }
    const n = d.nodos.find((x) => x.id === sel.id); if (!n) { sel = null; return pintarInsp(); }
    let props = '';
    if (n.tipo === 'atributo') props = casilla('clave', 'Clave (identificador)', n.clave) + casilla('multivaluado', 'Multivaluado', n.multivaluado) + casilla('derivado', 'Derivado', n.derivado);
    if (n.tipo === 'relacion') props = campo('Cardinalidad (tipo)', `<input type="text" data-prop="card" value="${esc(n.card)}" placeholder="1:N, N:M…">`);
    if (n.tipo === 'isa') props = casilla('total', 'Total (si no, parcial)', n.total) + casilla('solapada', 'Solapada (si no, exclusiva)', n.solapada);
    if (n.tipo === 'tabla') props = campo('Columnas (una por línea)', `<textarea data-prop="columnas" rows="6" placeholder="PK id\nnombre\nFK id_cliente">${esc(n.columnas)}</textarea>`) + '<p class="suave dg-pista">PK o # = clave primaria · FK o * = clave ajena</p>';
    if (n.tipo === 'clase' || n.tipo === 'interfaz') props = campo('Atributos', `<textarea data-prop="atributos" rows="4" placeholder="- nombre: String\n- edad: int">${esc(n.atributos)}</textarea>`) + campo('Métodos', `<textarea data-prop="metodos" rows="4" placeholder="+ getNombre(): String">${esc(n.metodos)}</textarea>`) + (n.tipo === 'clase' ? casilla('abstracta', 'Abstracta', n.abstracta) : '');
    insp.innerHTML = `<h3>${FORMAS[n.tipo].n}</h3>
      ${campo(n.tipo === 'tabla' ? 'Nombre de la tabla' : n.tipo === 'agregacion' ? 'Nombre (opcional)' : 'Texto', `<textarea data-prop="texto" rows="2" class="dg-texto">${esc(n.texto)}</textarea>`)}
      ${props}
      <div class="fila-botones"><button type="button" class="boton mini" data-dg="duplicar">Duplicar</button><button type="button" class="boton mini peligro" data-dg="borrar">Eliminar</button><button type="button" class="boton mini" data-dg="cerrar-insp">Listo</button></div>`;
  }
  function añadir(tipo) {
    apuntar();
    const r = svg.getBoundingClientRect(), v = d.vista, f = FORMAS[tipo];
    // en el móvil el inspector tapa la mitad de abajo: lo nuevo aparece en la parte visible
    const cx = (r.width / 2 - v.x) / v.z, cy = (r.height * (window.matchMedia('(max-width: 760px)').matches ? 0.27 : 0.5) - v.y) / v.z;
    const n = { id: nuevoId(), tipo, x: snap(cx - f.w / 2), y: snap(cy - (f.h || 60) / 2), texto: TEXTO_INICIAL[tipo] };
    // busca un hueco libre en espiral alrededor del centro para no tapar lo que ya hay
    const choca = (m) => d.nodos.some((o) => { if (FORMAS[o.tipo].caja) return false; const a = tam(o), b = tam(m); return m.x < o.x + a.w + 10 && o.x < m.x + b.w + 10 && m.y < o.y + a.h + 10 && o.y < m.y + b.h + 10; });
    const visible = (m) => { const t = tam(m); return m.x * v.z + v.x >= 4 && m.y * v.z + v.y >= 4 && (m.x + t.w) * v.z + v.x <= r.width - 4 && (m.y + t.h) * v.z + v.y <= r.height - 4; };
    for (let i = 1, x0 = n.x, y0 = n.y; i < 120 && !FORMAS[tipo].caja && (choca(n) || !visible(n)); i++) {
      const ang = i * 0.9, rad = 20 + i * 8; n.x = snap(x0 + Math.cos(ang) * rad * 1.5); n.y = snap(y0 + Math.sin(ang) * rad);
      if (i === 119) { n.x = x0; n.y = y0; } // sin hueco visible: al centro
    }
    if (tipo === 'tabla') n.columnas = 'PK id\nnombre';
    if (tipo === 'clase') { n.atributos = '- atributo: String'; n.metodos = '+ metodo(): void'; }
    if (tipo === 'interfaz') { n.atributos = ''; n.metodos = '+ metodo(): void'; }
    d.nodos.push(n); sel = { tipo: 'nodo', id: n.id };
    pintar(); pintarInsp(); guardar();
    const t = insp.querySelector('.dg-texto'); if (t && window.matchMedia('(pointer: fine)').matches) { t.focus(); t.select(); }
  }
  function conectar(de, a) {
    if (!de || !a || de === a) return;
    apuntar();
    const e = { id: nuevoId(), de, a, estilo: ESTILO_DEFECTO[d.notacion] };
    d.aristas.push(e); sel = { tipo: 'arista', id: e.id }; pintar(); pintarInsp(); guardar();
  }
  function borrar() {
    if (!sel) return;
    apuntar();
    if (sel.tipo === 'nodo') { d.nodos = d.nodos.filter((n) => n.id !== sel.id); d.aristas = d.aristas.filter((e) => e.de !== sel.id && e.a !== sel.id); }
    else d.aristas = d.aristas.filter((e) => e.id !== sel.id);
    sel = null; pintar(); pintarInsp(); guardar();
  }
  function duplicar() {
    if (!sel || sel.tipo !== 'nodo') return;
    const n = d.nodos.find((x) => x.id === sel.id); if (!n) return;
    apuntar();
    const c = { ...n, id: nuevoId(), x: n.x + 30, y: n.y + 30 };
    d.nodos.push(c); sel = { tipo: 'nodo', id: c.id }; pintar(); pintarInsp(); guardar();
  }
  function ajustar() {
    const b = limites(d), r = svg.getBoundingClientRect();
    if (!d.nodos.length || !r.width) { d.vista = { x: 40, y: 40, z: 1 }; return pintar(); }
    const z = Math.min(1.6, Math.max(0.25, Math.min((r.width - 60) / b.w, (r.height - 60) / b.h)));
    d.vista = { z, x: (r.width - b.w * z) / 2 - b.x * z, y: (r.height - b.h * z) / 2 - b.y * z };
    pintar(); guardar();
  }
  function zoom(f, px, py) {
    const r = svg.getBoundingClientRect(), v = d.vista, z = Math.min(3, Math.max(0.2, v.z * f));
    if (px == null) { px = r.width / 2; py = r.height / 2; }
    v.x = px - (px - v.x) * (z / v.z); v.y = py - (py - v.y) * (z / v.z); v.z = z; pintar();
  }
  const mundoDe = (ev) => { const r = svg.getBoundingClientRect(), v = d.vista; return { x: (ev.clientX - r.left - v.x) / v.z, y: (ev.clientY - r.top - v.y) / v.z }; };

  // ---------- puntero: mover, conectar, desplazar, pellizcar ----------
  const punteros = new Map();
  let accion = null, pellizco = null, tGuardar = null;
  svg.addEventListener('pointerdown', (ev) => {
    svg.focus({ preventScroll: true });
    punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (punteros.size === 2) { const [a, b] = [...punteros.values()]; pellizco = { dist: Math.hypot(a.x - b.x, a.y - b.y), z: d.vista.z }; accion = null; return; }
    const asa = ev.target.closest('[data-asa]'), g = ev.target.closest('[data-id]'), ar = ev.target.closest('[data-arista]');
    const p = mundoDe(ev);
    if (asa && asa.dataset.asa === 'conectar') { accion = { tipo: 'conectar', de: sel.id }; svg.setPointerCapture(ev.pointerId); return; }
    if (asa && asa.dataset.asa === 'tam') { apuntar(); accion = { tipo: 'tam', n: d.nodos.find((x) => x.id === sel.id) }; svg.setPointerCapture(ev.pointerId); return; }
    if (g) {
      const id = g.dataset.id;
      if (modoConectar) {
        if (!origenConectar) { origenConectar = id; sel = { tipo: 'nodo', id }; insp.classList.remove('abierto'); pintar(); } // sin inspector: en el móvil taparía el destino
        else { conectar(origenConectar, id); origenConectar = null; }
        return;
      }
      const n = d.nodos.find((x) => x.id === id);
      sel = { tipo: 'nodo', id }; pintar(); pintarInsp();
      accion = { tipo: 'mover', n, dx: p.x - n.x, dy: p.y - n.y, movido: false, previo: JSON.stringify({ nodos: d.nodos, aristas: d.aristas, notacion: d.notacion }) };
      svg.setPointerCapture(ev.pointerId); return;
    }
    if (ar) { sel = { tipo: 'arista', id: ar.dataset.arista }; pintar(); pintarInsp(); return; }
    if (sel) { sel = null; pintar(); pintarInsp(); }
    accion = { tipo: 'desplazar', x: ev.clientX, y: ev.clientY, vx: d.vista.x, vy: d.vista.y };
    svg.setPointerCapture(ev.pointerId);
  });
  svg.addEventListener('pointermove', (ev) => {
    if (punteros.has(ev.pointerId)) punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (pellizco && punteros.size === 2) {
      const [a, b] = [...punteros.values()], r = svg.getBoundingClientRect();
      zoom((pellizco.z * Math.hypot(a.x - b.x, a.y - b.y) / pellizco.dist) / d.vista.z, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      return;
    }
    if (!accion) return;
    const p = mundoDe(ev);
    if (accion.tipo === 'mover') {
      const nx = snap(p.x - accion.dx), ny = snap(p.y - accion.dy);
      if (nx !== accion.n.x || ny !== accion.n.y) {
        // al mover una caja (agregación, sistema) se lleva lo que tiene dentro
        if (FORMAS[accion.n.tipo].caja) {
          const t = tam(accion.n), ddx = nx - accion.n.x, ddy = ny - accion.n.y;
          for (const o of d.nodos) if (o !== accion.n && !FORMAS[o.tipo].caja) { const c = centro(o); if (c.x > accion.n.x && c.x < accion.n.x + t.w && c.y > accion.n.y && c.y < accion.n.y + t.h) { o.x += ddx; o.y += ddy; } }
        }
        accion.n.x = nx; accion.n.y = ny; accion.movido = true; pintar();
      }
    } else if (accion.tipo === 'tam') {
      accion.n.w = Math.max(120, snap(p.x - accion.n.x)); accion.n.h = Math.max(80, snap(p.y - accion.n.y)); pintar();
    } else if (accion.tipo === 'desplazar') {
      d.vista.x = accion.vx + ev.clientX - accion.x; d.vista.y = accion.vy + ev.clientY - accion.y; pintar();
    } else if (accion.tipo === 'conectar') {
      const n = d.nodos.find((x) => x.id === accion.de), c = centro(n), v = d.vista;
      temporal.hidden = false;
      temporal.setAttribute('x1', c.x * v.z + v.x); temporal.setAttribute('y1', c.y * v.z + v.y);
      temporal.setAttribute('x2', p.x * v.z + v.x); temporal.setAttribute('y2', p.y * v.z + v.y);
    }
  });
  const soltar = (ev) => {
    punteros.delete(ev.pointerId);
    if (punteros.size < 2) pellizco = null;
    if (!accion) return;
    if (accion.tipo === 'mover' && accion.movido) { historia.push(accion.previo); rehacer.length = 0; guardar(); }
    if (accion.tipo === 'tam') guardar();
    if (accion.tipo === 'desplazar') { clearTimeout(tGuardar); tGuardar = setTimeout(guardar, 500); }
    if (accion.tipo === 'conectar') {
      temporal.hidden = true;
      const bajo = document.elementFromPoint(ev.clientX, ev.clientY), g = bajo && bajo.closest && bajo.closest('[data-id]');
      if (g) conectar(accion.de, g.dataset.id);
    }
    accion = null;
  };
  svg.addEventListener('pointerup', soltar);
  svg.addEventListener('pointercancel', soltar);
  svg.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const r = svg.getBoundingClientRect();
    if (ev.ctrlKey || ev.metaKey || Math.abs(ev.deltaY) > Math.abs(ev.deltaX) * 2) zoom(ev.deltaY < 0 ? 1.1 : 1 / 1.1, ev.clientX - r.left, ev.clientY - r.top);
    else { d.vista.x -= ev.deltaX; d.vista.y -= ev.deltaY; pintar(); }
    clearTimeout(tGuardar); tGuardar = setTimeout(guardar, 500);
  }, { passive: false });
  svg.addEventListener('dblclick', (ev) => {
    if (ev.target.closest('[data-id]')) { const t = insp.querySelector('.dg-texto'); if (t) { t.focus(); t.select(); } }
  });
  svg.addEventListener('keydown', (ev) => {
    const mod = ev.ctrlKey || ev.metaKey;
    if ((ev.key === 'Delete' || ev.key === 'Backspace') && sel) { ev.preventDefault(); borrar(); }
    else if (mod && ev.key.toLowerCase() === 'z') { ev.preventDefault(); ev.shiftKey ? restaurar(rehacer, historia) : restaurar(historia, rehacer); }
    else if (mod && ev.key.toLowerCase() === 'y') { ev.preventDefault(); restaurar(rehacer, historia); }
    else if (mod && ev.key.toLowerCase() === 'd') { ev.preventDefault(); duplicar(); }
    else if (sel && sel.tipo === 'nodo' && ev.key.startsWith('Arrow')) {
      ev.preventDefault();
      const n = d.nodos.find((x) => x.id === sel.id), paso = ev.shiftKey ? 50 : 10;
      apuntar();
      if (ev.key === 'ArrowLeft') n.x -= paso; if (ev.key === 'ArrowRight') n.x += paso; if (ev.key === 'ArrowUp') n.y -= paso; if (ev.key === 'ArrowDown') n.y += paso;
      pintar(); guardar();
    } else if (ev.key === 'Escape') { sel = null; modoConectar = false; origenConectar = null; btnConectar.setAttribute('aria-pressed', 'false'); pintar(); pintarInsp(); }
  });

  // ---------- barra e inspector ----------
  let tTexto = null, editando = false;
  insp.addEventListener('input', (ev) => {
    const k = ev.target.dataset.prop; if (!k || !sel) return;
    if (!editando) { apuntar(); editando = true; }
    const obj = sel.tipo === 'nodo' ? d.nodos.find((x) => x.id === sel.id) : d.aristas.find((x) => x.id === sel.id);
    obj[k] = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
    pintar();
    clearTimeout(tTexto); tTexto = setTimeout(() => { editando = false; guardar(); }, 400);
  });
  insp.addEventListener('change', (ev) => { if (ev.target.tagName === 'SELECT' || ev.target.type === 'checkbox') { editando = false; guardar(); } });
  cont.querySelector('.dg-notacion').addEventListener('change', (ev) => { apuntar(); d.notacion = ev.target.value; pintarPaleta(); guardar(); });
  btnConectar.addEventListener('click', () => {
    modoConectar = !modoConectar; origenConectar = null; btnConectar.setAttribute('aria-pressed', String(modoConectar)); pintar();
  });
  cont.addEventListener('click', async (ev) => {
    const f = ev.target.closest('[data-forma]'); if (f) return añadir(f.dataset.forma);
    const b = ev.target.closest('[data-dg]'); if (!b) return;
    const a = b.dataset.dg;
    if (a === 'deshacer') restaurar(historia, rehacer);
    else if (a === 'rehacer') restaurar(rehacer, historia);
    else if (a === 'mas') { zoom(1.2); guardar(); }
    else if (a === 'menos') { zoom(1 / 1.2); guardar(); }
    else if (a === 'ajustar') ajustar();
    else if (a === 'borrar') borrar();
    else if (a === 'duplicar') duplicar();
    else if (a === 'cerrar-insp') { sel = null; pintar(); pintarInsp(); }
    else if (a === 'invertir') { const e = d.aristas.find((x) => x.id === sel.id); apuntar(); [e.de, e.a] = [e.a, e.de]; [e.etDe, e.etA] = [e.etA, e.etDe]; pintar(); pintarInsp(); guardar(); }
    else if (a === 'svg') descargar(nombre + '.svg', new Blob([svgExportable(d)], { type: 'image/svg+xml' }));
    else if (a === 'drawio') descargar(nombre + '.drawio', new Blob([aDrawio(d, nombre)], { type: 'application/xml' }));
    else if (a === 'relacional') opciones.alRelacional(erARelacional(d));
    else if (a === 'png') { b.disabled = true; try { descargar(nombre + '.png', await aPng(d)); } finally { b.disabled = false; } }
  });
  pintarPaleta(); pintar(); pintarInsp();
  if (!datos || !datos.vista) requestAnimationFrame(ajustar);
  return { destruir() { cont.innerHTML = ''; } };
}

// ---------- paso de E/R (Chen) a modelo relacional ----------
// Cardinalidad junto a una entidad = cuántas de ESA entidad se relacionan con una de la otra: (0,N) junto a PEDIDO
// en CLIENTE—realiza—PEDIDO significa que un cliente tiene muchos pedidos, así que la clave ajena va en PEDIDO.
// Si faltan esas etiquetas se usa la cardinalidad del rombo («1:N», en el orden en que se conectaron) y, si tampoco hay, N:M.
export function erARelacional(d) {
  const N = new Map(d.nodos.map((n) => [n.id, n]));
  const vecinos = (id) => d.aristas.filter((e) => e.de === id || e.a === id).map((e) => ({ otro: N.get(e.de === id ? e.a : e.de), et: e.de === id ? e.etA : e.etDe })).filter((v) => v.otro);
  const limpio = (s) => String(s || '').trim().replace(/\s+/g, '_');
  const tablas = new Map(), avisos = [];
  const atributos = (id) => vecinos(id).filter((v) => v.otro.tipo === 'atributo').map((v) => v.otro);
  const columnasDe = (atrs) => atrs.filter((a) => !a.derivado && !a.multivaluado).map((a) => ({ n: limpio(a.texto), pk: !!a.clave }));
  for (const en of d.nodos.filter((n) => n.tipo === 'entidad' || n.tipo === 'debil')) tablas.set(en.id, { id: en.id, nombre: limpio(en.texto).toUpperCase(), cols: columnasDe(atributos(en.id)), x: en.x, y: en.y });
  const pks = (id) => tablas.get(id).cols.filter((c) => c.pk);
  const ajena = (destino, origenId, comoPk) => {
    const t = tablas.get(destino), ref = tablas.get(origenId);
    if (!pks(origenId).length) avisos.push(`${ref.nombre} no tiene clave: marca un atributo como clave.`);
    for (const c of pks(origenId)) {
      const nombre = t.cols.some((x) => x.n === c.n) ? c.n + '_' + ref.nombre.toLowerCase() : c.n;
      t.cols.push({ n: nombre, pk: !!comoPk, fk: ref.nombre });
    }
  };
  // jerarquías: cada subtipo lleva la clave del supertipo (el que está más arriba en el dibujo)
  for (const isa of d.nodos.filter((n) => n.tipo === 'isa')) {
    const ents = vecinos(isa.id).map((v) => v.otro).filter((o) => tablas.has(o.id)).sort((a, b) => a.y - b.y);
    for (const hijo of ents.slice(1)) ajena(hijo.id, ents[0].id, !pks(hijo.id).length);
  }
  const max = (et) => { const m = String(et || '').match(/,\s*([^)\s]+)\s*\)/); return m ? (m[1] === '1' ? 1 : 'N') : null; };
  const relaciones = d.nodos.filter((n) => n.tipo === 'relacion' || n.tipo === 'relacion-debil');
  // primero las relaciones débiles: la entidad débil necesita la clave del propietario para tener la suya
  relaciones.sort((a, b) => (b.tipo === 'relacion-debil') - (a.tipo === 'relacion-debil'));
  for (const r of relaciones) {
    const lados = vecinos(r.id).filter((v) => tablas.has(v.otro.id)), atrs = columnasDe(atributos(r.id)), nombre = limpio(r.texto).toUpperCase();
    if (lados.length < 2) { avisos.push(`La relación ${nombre} necesita al menos dos entidades conectadas.`); continue; }
    const debil = lados.find((l) => l.otro.tipo === 'debil');
    if (lados.length === 2 && (r.tipo === 'relacion-debil' || debil)) {
      const dl = debil || lados[1], fuerte = lados.find((l) => l !== dl);
      ajena(dl.otro.id, fuerte.otro.id, true); tablas.get(dl.otro.id).cols.push(...atrs); continue;
    }
    if (lados.length === 2) {
      const [A, B] = lados; let ma = max(A.et), mb = max(B.et);
      if (ma == null || mb == null) { const c = String(r.card || '').toUpperCase().split(/[:x×]/); if (c.length === 2) { ma = c[0].trim() === '1' ? 1 : 'N'; mb = c[1].trim() === '1' ? 1 : 'N'; } else { ma = mb = 'N'; avisos.push(`${nombre}: sin cardinalidades, se ha tratado como N:M.`); } }
      if (ma === 'N' && mb === 'N') {
        const t = { id: r.id, nombre, cols: [], x: r.x, y: r.y }; tablas.set(r.id, t);
        ajena(r.id, A.otro.id, true); ajena(r.id, B.otro.id, true); t.cols.push(...atrs);
      } else {
        const [lleva, apunta] = ma === 'N' ? [A, B] : [B, A]; // la clave ajena va en el lado «muchos» (o en el primero si es 1:1)
        ajena(lleva.otro.id, apunta.otro.id, false); tablas.get(lleva.otro.id).cols.push(...atrs);
      }
      continue;
    }
    const t = { id: r.id, nombre, cols: [], x: r.x, y: r.y }; tablas.set(r.id, t); // ternaria o más: tabla propia
    for (const l of lados) ajena(r.id, l.otro.id, true);
    t.cols.push(...atrs);
  }
  // atributos multivaluados: tabla aparte con la clave de la entidad
  for (const en of d.nodos.filter((n) => tablas.has(n.id) && (n.tipo === 'entidad' || n.tipo === 'debil'))) {
    for (const a of atributos(en.id).filter((x) => x.multivaluado)) {
      const id = en.id + '_' + a.id, t = { id, nombre: tablas.get(en.id).nombre + '_' + limpio(a.texto).toUpperCase(), cols: [], x: en.x, y: en.y + 1 };
      tablas.set(id, t); ajena(id, en.id, true); t.cols.push({ n: limpio(a.texto), pk: true });
    }
  }
  // dibujo: tablas en rejilla, en el orden aproximado del E/R; flechas de cada clave ajena a su tabla
  const lista = [...tablas.values()].sort((a, b) => a.y - b.y || a.x - b.x), porNombre = new Map(lista.map((t) => [t.nombre, t]));
  const col = (c) => (c.pk ? 'PK ' : '') + (c.fk ? 'FK ' : '') + c.n;
  const nodos = lista.map((t, i) => ({ id: 't' + i, tipo: 'tabla', texto: t.nombre, columnas: t.cols.map(col).join('\n'), x: 40 + (i % 3) * 280, y: 40 + Math.floor(i / 3) * 240, _t: t }));
  const aristas = [];
  for (const n of nodos) for (const ref of new Set(n._t.cols.filter((c) => c.fk).map((c) => c.fk))) {
    const dest = nodos.find((m) => m._t === porNombre.get(ref)); if (dest && dest !== n) aristas.push({ id: n.id + '-' + dest.id, de: n.id, a: dest.id, estilo: 'fk' });
  }
  nodos.forEach((n) => delete n._t);
  const esquema = lista.map((t) => `${t.nombre}(${t.cols.map((c) => (c.pk ? '#' : '') + c.n + (c.fk ? ' → ' + c.fk : '')).join(', ')})`).join('\n');
  return { diagrama: { notacion: 'relacional', nodos, aristas }, esquema, avisos };
}
