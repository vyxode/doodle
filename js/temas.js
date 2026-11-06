// Lee en tu dispositivo los temas de Programación (los PDF de Aules y las diapositivas de los temas 1 y 2)
// y saca de ellos los apartados, los ejemplos con su código y los ejercicios propuestos.
// Nada de ese contenido se guarda en el repositorio: se descarga con tu token y se queda en tu navegador.
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs';
export const DIAPOS = 'https://nachoiborraies.github.io/csharp/docs/es/slides/';
export const DIAPOS_TEMAS = ['01a', '01b', '01c', '02a', '02b', '02c', '02d'];

// ---------- PDF → líneas con posición, tipo de letra y espacios del código ----------
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', n: 'ⁿ' };
export async function lineasPdf(buf) {
  const lib = await import(PDFJS);
  lib.GlobalWorkerOptions.workerSrc = PDFJS.replace('pdf.min', 'pdf.worker.min');
  const doc = await lib.getDocument({ data: buf }).promise, L = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const c = await (await doc.getPage(p)).getTextContent();
    let cur = null;
    for (const it of c.items) {
      const y = it.transform[5];
      if (cur && y - cur.y > 2 && y - cur.y < 8 && /^\s*[0-9n]\s*$/.test(it.str)) { cur.items.push({ x: it.transform[4], s: SUP[it.str.trim()], w: it.width, mono: false }); continue; }
      if (!cur || Math.abs(y - cur.y) > 2) { cur = { p, y, items: [] }; L.push(cur); }
      if (it.str) cur.items.push({ x: it.transform[4], s: it.str, w: it.width, mono: (c.styles[it.fontName] || {}).fontFamily === 'monospace' });
    }
  }
  return L.map(linea).filter((l) => l.s.trim());
}
export function linea({ p, y, items }) {
  const llenos = items.filter((i) => i.s.trim()), largo = (a) => a.reduce((n, i) => n + i.s.length, 0);
  const mono = llenos.length > 0 && largo(llenos.filter((i) => i.mono)) * 2 >= largo(llenos);
  const x0 = llenos.length ? Math.min(...llenos.map((i) => i.x)) : 0;
  const ms = items.filter((i) => i.mono && i.s.length && i.w > 0), cw = ms.length ? ms.reduce((n, i) => n + i.w, 0) / largo(ms) : 5.5;
  let s = '';
  if (mono) for (const i of items) { const col = Math.round((i.x - x0) / cw); if (col > s.length) s += ' '.repeat(col - s.length); s += i.s; }
  else s = items.map((i) => i.s).join('');
  return { p, y: Math.round(y), x: Math.round(x0), mono, cw, s: s.replace(/\s+$/, '') };
}

// ---------- líneas del PDF → tema ----------
const RUIDO = /^(Introducción a la programación con C#, por Nacho Cabanes|Revisión \d{4}.*Página \d+)$/;
const VIÑETA = /^[\uf000-\uf0ff•▪◦]\s*/;
const mayor = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { const x = a[i] ?? -1, y = b[i] ?? -1; if (x !== y) return x > y; } return false; };

// Cuenta llaves fuera de cadenas, caracteres y comentarios ("{0}" no cuenta).
export function llaves(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '/' && s[i + 1] === '/') break;
    if (c === '"' || c === "'") { const verbatim = c === '"' && s[i - 1] === '@'; i++; while (i < s.length && s[i] !== c) { if (s[i] === '\\' && !verbatim) i++; i++; } continue; }
    if (c === '{') n++; else if (c === '}') n--;
  }
  return n;
}

export function parsearTema(lineas) {
  const L = lineas.filter((l) => !RUIDO.test(l.s.trim()));
  const t = { num: null, titulo: '', apartados: [], ejemplos: [], ejercicios: [] };
  let ap = null, partes = [], ej = null, emp = null, modoEj = false, ant = null, nota = '';
  const grupo = () => { const n2 = t.apartados.find((a) => a.n === partes.slice(0, 2).join('.')); return [n2, partes.length > 2 ? ap : null].filter(Boolean).map((a) => a.n + ' ' + a.titulo).join(' · '); };
  const cerrarEj = () => { if (ej) { ej.texto = ej.texto.replace(/[ \t]+\n/g, '\n').replace(/^\n+|\s+$/g, ''); delete ej.mono; delete ej.x0; t.ejercicios.push(ej); ej = null; } };
  const cerrarEmp = () => { if (emp) { if (emp.lineas.length) t.ejemplos.push({ id: emp.id, apartado: emp.apartado, titulo: emp.titulo, codigo: emp.lineas.join('\n') }); emp = null; } };
  for (const l of L) {
    const s = l.s.trim();
    if (emp) {
      if (!l.mono && emp.prof <= 0) cerrarEmp();
      else if (l.mono && /^\/\/\s*Ejemplo_\w+\.cs/.test(s)) cerrarEmp();
      else if (l.mono) {
        emp.cab++;
        if (emp.cab === 1 && s.startsWith('//')) emp.titulo = s.replace(/^\/\/\s*/, '');
        else if (!(emp.cab <= 2 && /^\/\/\s*Introducción a C#/.test(s))) {
          const col = Math.max(0, Math.round((l.x - emp.x0) / emp.cw));
          emp.lineas.push(' '.repeat(col) + l.s);
          const d = llaves(s); if (d > 0) emp.abierto = true; emp.prof += d;
          if ((emp.abierto && emp.prof <= 0) || emp.lineas.length > 400) cerrarEmp();
        }
        ant = l; continue;
      } else { ant = l; continue; }
    }
    if (l.mono && ej && !/^\/\/\s*Ejemplo_/.test(s) && (ant.p !== l.p || ant.y - l.y < 60)) { ej.texto += '\n' + ' '.repeat(Math.max(0, Math.round((l.x - ej.x0) / l.cw))) + l.s; ej.mono = true; ant = l; continue; }
    if (l.mono) {
      const m = s.match(/^\/\/\s*(Ejemplo_\w+?)\.cs/);
      if (m) { cerrarEj(); modoEj = false; emp = { id: m[1], apartado: ap ? ap.n : '', titulo: '', lineas: [], prof: 0, abierto: false, cab: 0, x0: l.x, cw: l.cw }; }
      ant = l; continue;
    }
    const h = s.match(/^((?:\d+\.)*\d+)\.?\s+([A-Za-zÁÉÍÓÚÑáéíóúñ¿¡"].*)$/);
    const hp = h && h[1].split('.').map(Number);
    if (h && t.num == null && hp.length === 1) { t.num = hp[0]; t.titulo = h[2].trim(); ant = l; continue; }
    if (h && hp[0] === t.num && hp.length >= 2 && mayor(hp, partes)) {
      cerrarEj(); modoEj = false; nota = ''; partes = hp; ap = { n: hp.join('.'), titulo: h[2].trim() }; t.apartados.push(ap); ant = l; continue;
    }
    // título de apartado partido en dos líneas: «4.1.4. Operaciones … máximo,» + «añadir, insertar, borrar»
    if (ap && ant && t.apartados.at(-1) === ap && ant.s.trim().startsWith(ap.n) && /^[a-záéíóúñ]/.test(s) && !ej) { ap.titulo += ' ' + s; ant = l; continue; }
    if (/^Ejercicios? propuestos?:?$/i.test(s)) { cerrarEj(); modoEj = true; ant = l; continue; }
    const it = modoEj && s.match(/^\(((?:\d+\.)+\d+)\)\s*(.*)$/);
    if (it && +it[1].split('.')[0] === t.num) {
      cerrarEj(); ej = { n: it[1], apartado: ap ? ap.n : '', grupo: grupo() + (nota ? ' · ' + nota : ''), texto: it[2], x0: l.x }; ant = l; continue;
    }
    if (!ej && modoEj && /:$/.test(s) && s.length < 80) { nota = s.replace(/:$/, ''); ant = l; continue; }
    if (ej) {
      if (ej.mono && /^[A-ZÁÉÍÓÚ¿(]/.test(s)) { cerrarEj(); ant = l; continue; } // tras el dibujo vuelve la teoría
      const salto = ant.p !== l.p ? (/[.?!)"»]$/.test(ant.s.trim()) && !/^[a-záéíóúñ]/.test(s)) : ant.y - l.y > 26;
      if (salto) { cerrarEj(); if (/:$/.test(s)) nota = s.replace(/:$/, ''); }
      else {
        const lista = VIÑETA.test(s), simbolos = /^[*#@=_-]+$/.test(s.replace(/\s/g, ''));
        ej.texto += (lista || simbolos || /[:]$/.test(ant.s.trim()) || /^[*#@\-=+ ]+$/.test(ant.s.trim()) ? '\n' : ' ') + (lista ? '• ' + s.replace(VIÑETA, '') : s);
      }
    }
    ant = l;
  }
  cerrarEj(); cerrarEmp();
  return t;
}

// ---------- diapositivas (HTML de reveal.js con el markdown dentro) ----------
const sinHtml = (s) => s.replace(/<pre><code[^>]*>/g, '```\n').replace(/<\/code><\/pre>/g, '\n```').replace(/<[^>]+>/g, '').replace(/&#124;/g, '|').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
export function parsearDiapo(html, clave) {
  const d = new DOMParser().parseFromString(html, 'text/html');
  const secs = [...d.querySelectorAll('section')].map((x) => sinHtml((x.querySelector('script,textarea') || x).textContent).trim()).filter(Boolean);
  const num = parseInt(clave, 10), cab = (secs[0] || '').split('\n');
  const sub = (cab.find((x) => x.startsWith('####')) || '').replace(/^#+\s*/, '');
  const out = { num, titulo: (cab[0] || '').replace(/^#+\s*/, ''), subtitulo: sub, ejemplos: [], ejercicios: [] };
  let apartado = sub, pendientes = [], k = 0;
  for (const s of secs.slice(1)) {
    const titulo = ((s.match(/^##\s+(.+)$/m) || [])[1] || '').replace(/\*/g, '').trim();
    if (/^Ejercicio propuesto/i.test(titulo)) {
      const cuerpo = s.replace(/^##.*$/m, '').trim();
      const fich = cuerpo.match(/Ejercicio_(\w+?)\.cs/);
      k++;
      out.ejercicios.push({ n: fich ? fich[1] : `${clave}.${k}`, apartado: clave, grupo: `${sub} · ${apartado}`,
        texto: cuerpo.split(/(```[\s\S]*?```)/).map((x, i) => (i % 2 ? x : x.replace(/\*\*/g, '').replace(/^\s*[-*]\s+/gm, '• '))).join('').replace(/\n{3,}/g, '\n\n').trim(), ejemplos: pendientes.slice(-3) });
      continue;
    }
    if (titulo) apartado = titulo;
    const bloques = [...s.matchAll(/```[a-z]*\n([\s\S]*?)```/g)].map((m) => m[1].replace(/\s+$/, ''));
    const sueltos = !bloques.length && /static void Main|Console\./.test(s) ? [s.split('\n').filter((x) => !/^(##|Ejemplo|\s*Analicemos)/.test(x.trim())).join('\n').trim()] : [];
    for (const codigo of [...bloques, ...sueltos]) {
      const id = `diapo-${clave}-${out.ejemplos.length + 1}`;
      out.ejemplos.push({ id, apartado: clave, titulo: titulo || sub, codigo });
      pendientes.push(id);
    }
  }
  return out;
}

// ---------- todo junto → catálogo de ejercicios con sus ejemplos ----------
const REF_EJEMPLO = /ejemplo[\s_]*(?:Ejemplo_)?(\d\d_\d\d(?:_\d\d)?[a-z]\d?)\b/gi;
const REF_EJERCICIO = /ejercicios?\s+(?:anterior\s+)?\(?(\d+(?:\.\d+)+)\)?/gi;
const REF_APARTADO = /apartados?\s+(\d+(?:\.\d+)+)/gi;
export function montarCatalogo(diapos, temas) {
  const ejemplos = {}, ejercicios = [];
  for (const d of diapos) {
    for (const e of d.ejemplos) ejemplos[e.id] = e;
    for (const e of d.ejercicios) ejercicios.push({ id: 'prog-' + e.n, tema: `Tema ${d.num} · ${d.titulo}`, grupo: e.grupo, n: e.n, texto: e.texto, ejemplos: e.ejemplos,
      refs: [...new Set([...e.texto.matchAll(/Ejercicio_(\w+?)\.cs/g)].map((m) => 'prog-' + m[1]).filter((id) => id !== 'prog-' + e.n))] });
  }
  for (const t of temas) {
    for (const e of t.ejemplos) ejemplos[e.id] = e;
    for (const e of t.ejercicios) {
      const refEj = [...e.texto.matchAll(REF_EJEMPLO)].map((m) => 'Ejemplo_' + m[1]);
      const refAp = [...e.texto.matchAll(REF_APARTADO)].flatMap((m) => t.ejemplos.filter((x) => x.apartado === m[1]).map((x) => x.id));
      const delApartado = t.ejemplos.filter((x) => x.apartado === e.apartado).map((x) => x.id);
      const refs = [...e.texto.matchAll(REF_EJERCICIO)].map((m) => 'prog-' + m[1]).filter((id) => id !== 'prog-' + e.n);
      ejercicios.push({ id: 'prog-' + e.n, tema: `Tema ${t.num} · ${t.titulo}`, grupo: e.grupo, n: e.n, texto: e.texto,
        citados: [...new Set([...refEj, ...refAp])], ejemplos: [...new Set(delApartado)], refs: [...new Set(refs)] });
    }
  }
  const orden = (e) => parseInt(e.tema.slice(5), 10);
  ejercicios.sort((a, b) => orden(a) - orden(b));
  // el libro a veces cita un número que no existe (5.7.1 por 5.7.2.1): se busca el que empieza igual o el que trata la misma función entre comillas
  const ids = new Set(ejercicios.map((e) => e.id));
  for (const e of ejercicios) e.refs = e.refs.map((r) => {
    if (ids.has(r)) return r;
    const nombres = [...e.texto.matchAll(/["“]([A-Z]\w+)["”]/g)].map((m) => m[1]).filter((n) => n !== 'Main'), mismoTema = ejercicios.filter((x) => x.tema === e.tema && x !== e);
    const conNombre = (xs) => xs.find((x) => nombres.some((n) => x.texto.includes('"' + n + '"') || x.texto.includes('“' + n + '”')));
    for (let pre = r; pre.includes('.'); pre = pre.slice(0, pre.lastIndexOf('.'))) {
      const c = mismoTema.filter((x) => x.id.startsWith(pre + '.')), hit = conNombre(c) || (pre === r && c[0]);
      if (hit) return hit.id;
    }
    return r;
  });
  // avisa de lo que se cita y no se encuentra, para revisarlo
  const sinResolver = ejercicios.flatMap((e) => [...(e.citados || []).filter((x) => !ejemplos[x]), ...e.refs.filter((x) => !ids.has(x))].map((x) => `${e.n} → ${x}`));
  return { ejercicios, ejemplos, sinResolver };
}

// Descarga y procesa todo. pdfs: [{ num, traer: () => Promise<ArrayBuffer> }]
export async function leerTemas(pdfs, diapos = DIAPOS_TEMAS) {
  const ds = [], ts = [], errores = [];
  for (const c of diapos) {
    try { const r = await fetch(DIAPOS + c + '.html'); if (!r.ok) throw new Error(r.status); ds.push(parsearDiapo(await r.text(), c)); }
    catch (e) { errores.push(`Diapositivas ${c}: ${e.message}`); }
  }
  for (const f of pdfs) {
    try { ts.push(parsearTema(await lineasPdf(await f.traer()))); }
    catch (e) { errores.push(`Tema ${f.num}: ${e.message}`); }
  }
  return { ...montarCatalogo(ds, ts), errores, fecha: Date.now() };
}
