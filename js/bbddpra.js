// Práctica a medida: cada respuesta (lecciones, ejercicios y la propia práctica) se apunta por concepto, y la
// práctica genera preguntas nuevas al azar, más de lo que más se falla. Se guarda en 'S' con lo demás de cada uno.
import { figura, esquema, preguntas, cablearPreguntas, esc } from './bbdd.js';
import { binaria, spBinaria, cuanto } from './bbddlec.js';

export const TAGS = {
  card: 'Leer cardinalidades (máximos)', minimos: 'Mínimos: obligatorio u opcional', '1N': 'Relaciones 1:N a tablas', NM: 'Relaciones N:M a tablas', 11: 'Relaciones 1:1 a tablas',
  vnn: 'Cuándo poner VNN', uk: 'Cuándo poner UK', pk: 'Claves primarias', fk: 'Dónde van las claves ajenas', debil: 'Entidades débiles', reflexiva: 'Reflexivas',
  ternaria: 'Ternarias', agregacion: 'Agregación o ternaria', jerarquia: 'Jerarquías', atributos: 'Atributos compuestos y multivaluados', entidades: 'Entidad, atributo o relación', inversa: 'Leer tablas al revés',
};
// por concepto, una media de los fallos que pesa más lo reciente (r: 0 = todo bien, 1 = todo mal) y cuántas veces
export function anotar(ctx, tags, bien) {
  const S = { ...(ctx.leer('S') || {}) }, t = { ...(S.c || {}) }; // «c»: Doodle usa «t» para la fecha del cambio
  for (const k of tags) { if (!TAGS[k]) continue; const v = t[k] || { r: 0.5, n: 0 }; t[k] = { r: +(v.n ? v.r * 0.7 + (bien ? 0 : 0.3) : bien ? 0 : 1).toFixed(3), n: v.n + 1 }; }
  ctx.guardar('S', { ...S, c: t });
}
const peso = (v) => 0.15 + (v ? v.r : 0.5); // lo no visto pesa como un 50 % de fallos: también sale
export function elegirTag(t, evitar = []) {
  const ks = Object.keys(GEN).filter((k) => !evitar.includes(k)), ws = ks.map((k) => peso(t[k]));
  let x = Math.random() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < ks.length; i++) if ((x -= ws[i]) <= 0) return ks[i];
  return ks[ks.length - 1];
}

// ---------- generadores: cada uno hace una pregunta nueva de su concepto ----------
const azar = (a) => a[Math.floor(Math.random() * a.length)];
const barajar = (o, ok) => { const u = [...new Set(o)], i = u.map((_, j) => j).sort(() => Math.random() - 0.5); return { o: i.map((j) => u[j]), ok: i.indexOf(u.indexOf(o[ok])) }; };
const PARES = [['AUTOR', 'escribe', 'LIBRO'], ['CLIENTE', 'alquila', 'COCHE'], ['PROFESOR', 'tutoriza', 'GRUPO'], ['TIENDA', 'vende', 'PRODUCTO'], ['MEDICO', 'atiende', 'PACIENTE'], ['EMPRESA', 'contrata', 'EMPLEADO'],
  ['USUARIO', 'publica', 'FOTO'], ['PAIS', 'tiene', 'CIUDAD'], ['ALUMNO', 'entrega', 'TAREA'], ['EQUIPO', 'ficha', 'JUGADOR'], ['SOCIO', 'reserva', 'PISTA'], ['CANTANTE', 'graba', 'DISCO']];
function caso(tipo) {
  const [A, R, B] = azar(PARES), m = () => azar(['0', '1']);
  const [amax, bmax] = tipo === 'NM' ? ['N', 'N'] : tipo === '11' ? ['1', '1'] : tipo === '1N' ? azar([['1', 'N'], ['N', '1']]) : [azar(['1', 'N']), azar(['1', 'N'])];
  return { A, R, B, amin: m(), amax, bmin: m(), bmax };
}
const frases = (c) => `Cada ${c.A} se relaciona con ${cuanto(c.amin, c.amax)} ${c.B} y cada ${c.B} con ${cuanto(c.bmin, c.bmax)} ${c.A}.`;
const tablas = (c, cambio = {}) => { const x = { ...c, ...cambio }; return binaria(x.A, x.R, x.B, x.amin, x.amax, x.bmin, x.bmax).txt; };
const PARES_TXT = ['(0,1)', '(1,1)', '(0,N)', '(1,N)'];
const conFig = (c) => figura(spBinaria(c.A, c.R, c.B, c.amin, c.amax, c.bmin, c.bmax));

const GEN = {
  card() {
    const c = caso(), ok = `(${c.amin},${c.amax})`;
    return { p: `${frases(c)} ¿Qué par va junto a ${c.B}?`, ...barajar(PARES_TXT, PARES_TXT.indexOf(ok)), x: `Junto a ${c.B} se cuenta cuántos ${c.B} tiene cada ${c.A}: ${cuanto(c.amin, c.amax)}, o sea ${ok}.` };
  },
  minimos() {
    const c = caso(), o = ['0: es opcional', '1: es obligatorio'];
    return { p: `${frases(c)} ¿Qué mínimo va junto a ${c.A}?`, o, ok: +c.bmin, x: `Junto a ${c.A} se cuenta cuántos ${c.A} tiene cada ${c.B}: ${cuanto(c.bmin, c.bmax)}. El mínimo es ${c.bmin}.` };
  },
  '1N'() {
    const c = caso('1N'), N = c.amax === '1' ? 'a' : 'b';
    const o = [tablas(c), tablas(c, { amax: c.bmax, bmax: c.amax, amin: c.bmin, bmin: c.amin }), tablas(c, { amax: 'N', bmax: 'N' }), tablas(c, { [N + 'min']: c[N + 'min'] === '1' ? '0' : '1' })];
    return { fig: conFig(c), p: `${frases(c)} ¿Cómo queda en tablas?`, ...barajar(o, 0), x: binaria(c.A, c.R, c.B, c.amin, c.amax, c.bmin, c.bmax).regla };
  },
  NM() {
    const c = caso('NM'), ok = tablas(c), ka = 'cod_' + c.A.toLowerCase(), kb = 'cod_' + c.B.toLowerCase();
    const o = [ok, tablas(c, { amax: '1' }), tablas(c, { bmax: '1' }), ok.replace(`PK:  (${ka}, ${kb})`, `PK:  ${ka}`)];
    return { fig: conFig(c), p: `${frases(c)} ¿Cómo queda en tablas?`, ...barajar(o, 0), x: 'N:M: tabla nueva con las dos claves; juntas forman la PK y cada una es FK.' };
  },
  11() {
    const c = caso('11'), o = [tablas(c), ...[['0', '0'], ['1', '0'], ['0', '1'], ['1', '1']].map(([a, b]) => tablas(c, { amin: a, bmin: b })), tablas(c, { amax: 'N' })];
    return { fig: conFig(c), p: `${frases(c)} ¿Cómo queda en tablas?`, ...barajar(o.slice(0, 5), 0), x: binaria(c.A, c.R, c.B, c.amin, c.amax, c.bmin, c.bmax).regla };
  },
  vnn() {
    const c = caso('1N'), [N, U, nmin] = c.amax === '1' ? [c.A, c.B, c.amin] : [c.B, c.A, c.bmin];
    return { fig: conFig(c), p: `${frases(c)} La clave de ${U} va como FK a ${N}. ¿Lleva VNN?`, o: ['Sí', 'No'], ok: nmin === '1' ? 0 : 1, x: nmin === '1' ? `Todo ${N} tiene su ${U} (mínimo 1 junto a ${U}): no puede faltar.` : `Un ${N} puede no tener ${U} (mínimo 0 junto a ${U}): admite NULL.` };
  },
  uk() {
    const uno = Math.random() < 0.5, c = uno ? { ...caso('11'), amin: '1', bmin: '0' } : caso('1N'), dueno = uno ? c.A : c.amax === '1' ? c.A : c.B;
    return { fig: conFig(c), p: `${frases(c)} La FK va en ${dueno}. ¿Lleva UK?`, o: ['Sí', 'No'], ok: uno ? 0 : 1, x: uno ? 'Es 1:1: sin UK, el mismo valor podría repetirse y sería una 1:N.' : 'Es 1:N: el valor de la FK se repite en muchas filas; con UK no podría.' };
  },
  fk() {
    const c = caso(azar(['1N', '1N', 'NM', '11']));
    if (c.amax === '1' && c.bmax === '1' && c.amin === '1') c.bmin = '0'; // sin el caso de fundir las dos tablas
    const t = binaria(c.A, c.R, c.B, c.amin, c.amax, c.bmin, c.bmax), bl = t.txt.split('\n\n');
    return { fig: conFig(c), p: `${frases(c)} ¿Dónde va la clave ajena?`, o: [`En ${c.A}`, `En ${c.B}`, `En una tabla nueva ${c.R.toUpperCase()}`, 'En las dos'], ok: bl.length === 3 ? 2 : bl[1].startsWith(c.A + ' ') ? 0 : 1, x: t.regla };
  },
  pk() {
    const q = azar([
      { p: 'Una LINEA de factura se numera dentro de cada FACTURA (la línea 1 está en todas). ¿Cuál es la PK de LINEA?', o: ['num_linea', '(num_factura, num_linea)', 'num_factura', '(num_linea, cantidad)'], ok: 1, x: 'Débil por identificación: clave del propietario más el discriminador.' },
      { p: 'ACTOR participa en PELICULA (N:M). ¿Cuál es la PK de la tabla PARTICIPA?', o: ['cod_actor', 'cod_peli', '(cod_actor, cod_peli)', 'Un id nuevo sin más'], ok: 2, x: 'En una N:M la PK son las dos claves juntas.' },
      { p: 'Un SOCIO tiene varios teléfonos. ¿Cuál es la PK de la tabla TELEFONO?', o: ['telefono', 'num_socio', '(num_socio, telefono)', 'No tiene PK'], ok: 2, x: 'Multivaluado: la clave de la entidad más el propio valor.' },
      { p: 'ALUMNO es subtipo de PERSONA (opción B). ¿Cuál es la PK de ALUMNO?', o: ['Un código propio del alumno', 'dni, que además es FK a PERSONA', '(dni, curso)', 'No tiene PK'], ok: 1, x: 'Cada subtipo usa la clave del supertipo, que es PK y FK a la vez.' },
      { p: 'Un ALUMNO puede repetir el mismo MODULO en varias convocatorias, y se guarda cada nota. ¿PK de CURSA?', o: ['(nia, cod_modulo)', '(nia, cod_modulo, convocatoria)', 'nia', '(cod_modulo, convocatoria)'], ok: 1, x: 'La pareja se repite: se añade a la PK lo que distingue las repeticiones.' },
    ]);
    return { ...q, ...barajar(q.o, q.ok) };
  },
  ternaria() {
    const [E, K] = azar([[['PROFESOR', 'MODULO', 'GRUPO'], ['dni', 'cod_modulo', 'cod_grupo']], [['MEDICO', 'PACIENTE', 'DIA'], ['cod_medico', 'cod_paciente', 'dia']], [['JUGADOR', 'EQUIPO', 'TEMPORADA'], ['licencia', 'cod_equipo', 'anio']], [['CONDUCTOR', 'AUTOBUS', 'TURNO'], ['dni', 'matricula', 'cod_turno']]]);
    const m = [0, 1, 2].map(() => azar(['1', 'N'])), unos = [0, 1, 2].filter((i) => m[i] === '1'), enes = [0, 1, 2].filter((i) => m[i] === 'N');
    const par = (a, b) => `(${K[a]}, ${K[b]})`, todas = `(${K.join(', ')})`;
    let ok, malas;
    if (!unos.length) { ok = todas; malas = [par(0, 1), par(1, 2), K[0]]; }
    else if (unos.length === 1) { ok = par(...enes); malas = [todas, par(unos[0], enes[0]), K[unos[0]]]; }
    else if (unos.length === 2) { ok = par(enes[0], unos[0]); malas = [todas, par(unos[0], unos[1]), K[enes[0]]]; }
    else { ok = par(0, 1); malas = [todas, K[0], K[2]]; }
    const card = m.map((x, i) => `${E[i]} ${x === '1' ? '(1,1)' : '(0,N)'}`).join(', ');
    return { p: `Ternaria con ${card}. ¿Cuál puede ser la PK de la tabla?`, ...barajar([ok, ...malas], 0), x: !unos.length ? 'N:M:P: las tres claves.' : unos.length === 1 ? 'Con un lado 1, la PK son los dos lados N y el lado 1 va con VNN.' : unos.length === 2 ? 'Con dos lados 1, la PK es el lado N con uno de los 1; la otra combinación es UK.' : '1:1:1: cualquier pareja; las otras dos combinaciones son UK.' };
  },
  debil() {
    const [P, D, k, d, repite] = azar([['EDIFICIO', 'PLANTA', 'cod_edif', 'num_planta', true], ['LIBRO', 'EJEMPLAR', 'isbn', 'num_ejemplar', true], ['FACTURA', 'LINEA', 'num_factura', 'num_linea', true], ['CLIENTE', 'PEDIDO', 'cod_cliente', 'num_pedido', false], ['HOTEL', 'HABITACION', 'cod_hotel', 'cod_hab', false], ['CURSO', 'TEMA', 'cod_curso', 'num_tema', true]]);
    const o = [`ID · PK: (${k}, ${d}) y ${k} es FK`, `E · PK: ${d} y FK ${k} con VNN`, `Fuerte · PK: ${d} y FK ${k} sin VNN`, `ID · PK: ${d} y FK ${k}`];
    return { p: `${D} no existe sin su ${P}. El valor de ${d} ${repite ? `empieza en 1 en cada ${P}` : 'es único en toda la base de datos'}. ¿Cómo es?`, ...barajar(o, repite ? 0 : 1), x: repite ? 'Si el identificador se repite entre propietarios, es por identificación: PK compuesta.' : 'Si tiene identificador propio, es por existencia: su PK y una FK obligatoria.' };
  },
  reflexiva() {
    const [E, R, t] = azar([['PERSONA', 'es tutor legal de', '1N'], ['TRABAJADOR', 'supervisa a', '1N'], ['USUARIO', 'sigue a', 'NM'], ['PERSONA', 'está casada con', '11'], ['TEMA', 'requiere', 'NM'], ['EQUIPO', 'juega contra', 'NM'], ['CARPETA', 'contiene a', '1N']]);
    const o = ['Ninguna tabla nueva: FK hacia la propia tabla', 'Ninguna tabla nueva: FK con UK hacia la propia tabla', 'Una tabla nueva con la clave dos veces como PK', 'Dos tablas nuevas, una por rol'], ok = { '1N': 0, 11: 1, NM: 2 }[t];
    return { p: `${E} ${R} ${E}, y es una reflexiva ${t === '1N' ? '1:N' : t === '11' ? '1:1' : 'N:M'}. ¿Qué sale en tablas?`, ...barajar(o, ok), x: ['Como una 1:N: la FK va en la misma tabla, con el nombre del rol.', 'Como una 1:1: FK a la misma tabla con UK (o una tabla con PK y UK).', 'Como una N:M: tabla nueva con la clave dos veces, una por rol.'][ok] };
  },
  agregacion() {
    const [p, ag] = azar([['Un ALUMNO hace un PROYECTO y algunos proyectos tienen un TUTOR externo.', 1], ['Un PROFESOR imparte un MODULO a un GRUPO.', 0], ['Un CLIENTE contrata un SEGURO y algunos contratos los gestiona un MEDIADOR.', 1], ['Un MEDICO receta un MEDICAMENTO a un PACIENTE.', 0], ['Un JUGADOR juega en un EQUIPO durante una TEMPORADA.', 0], ['Un ACTOR participa en una PELICULA y algunas participaciones reciben un PREMIO.', 1], ['Un ESTUDIANTE se matricula en una ASIGNATURA y algunas matrículas tienen BECA.', 1]]);
    return { p: `${p} ¿Cómo lo modelas?`, o: ['Ternaria', 'Agregación de la primera relación, unida a la tercera entidad', 'Dos relaciones 1:N sueltas'], ok: ag, x: ag ? 'La pareja existe sin la tercera: se agrega.' : 'Los tres solo tienen sentido juntos: ternaria.' };
  },
  jerarquia() {
    const T = Math.random() < 0.5, S = Math.random() < 0.5, [sup, a, b] = azar([['VEHICULO', 'TURISMO', 'MOTO'], ['PERSONA', 'ALUMNO', 'PROFESOR'], ['PRODUCTO', 'LIBRO', 'DISCO'], ['CUENTA', 'AHORRO', 'CORRIENTE']]);
    const o = ['A, B y C', 'Solo A y B', 'Solo B', 'Solo C'];
    return { fig: figura({ e: { [sup]: { x: 160, y: 60 }, [a]: { x: 0, y: 300 }, [b]: { x: 320, y: 300 } }, h: [{ x: 185, y: 170, sup, sub: [a, b], T, S }] }), p: `Jerarquía (${T ? 'T' : 'P'}, ${S ? 'S' : 'D'}). ¿Qué estrategias de paso a tablas valen? (A: tabla única · B: supertipo y subtipos · C: solo subtipos)`, o, ok: T && !S ? 0 : 1, x: T && !S ? 'Total y disjunta: valen las tres.' : `C (solo subtipos) exige total y disjunta; esta es ${T ? 'total' : 'parcial'} y ${S ? 'solapada' : 'disjunta'}.` };
  },
  atributos() {
    const [p, ok] = azar([['Un CLIENTE puede tener varios correos.', 0], ['La dirección de un SOCIO tiene calle, número y ciudad.', 1], ['La edad de un ALUMNO se calcula con su fecha de nacimiento.', 2], ['Un LIBRO puede tener varios autores escritos como texto (sin más datos de cada autor).', 0], ['El nombre completo de un EMPLEADO se divide en nombre y apellidos.', 1]]);
    return { p: `${p} ¿Cómo queda en tablas?`, o: ['Tabla aparte con la clave de la entidad y el valor, las dos como PK', 'Una columna por cada parte, en la misma tabla', 'No se guarda: se calcula cuando hace falta', 'Una columna con los valores separados por comas'], ok, x: ['Multivaluado: tabla aparte.', 'Compuesto: se despliega en sus partes.', 'Derivado: se calcula, no se guarda.'][ok] };
  },
  entidades() {
    const [p, o, ok] = azar([['En un gimnasio, los socios reservan clases; de cada socio se guarda su teléfono.', ['SOCIO', 'CLASE', 'teléfono'], 2], ['En una biblioteca, los lectores piden préstamos de libros; cada préstamo tiene fecha de devolución.', ['LECTOR', 'LIBRO', 'fecha_devolucion'], 2], ['Una tienda vende productos de varias marcas; de cada marca se guarda su país y su web.', ['PRODUCTO', 'MARCA', 'web'], 2], ['Los pacientes tienen citas con médicos; de cada cita se guarda la hora.', ['PACIENTE', 'MEDICO', 'hora']]]);
    return { p: `${p} ¿Cuál es un atributo y no una entidad?`, ...barajar(o, ok ?? 2), x: `${o[ok ?? 2]} describe algo; no tiene datos propios ni se relaciona por sí mismo.` };
  },
  inversa() {
    const [T, Rf, c] = azar([['PEDIDO', 'CLIENTE', 'id_cliente'], ['TARJETA', 'SOCIO', 'id_socio'], ['EMPLEADO', 'DEPARTAMENTO', 'cod_dep'], ['COCHE', 'PROPIETARIO', 'dni'], ['MATRICULA', 'ALUMNO', 'nia']]);
    const uk = Math.random() < 0.4, vnn = Math.random() < 0.6;
    const txt = `${T} (id_${T.toLowerCase()}, ${c})\n   PK:  id_${T.toLowerCase()}${uk ? `\n   UK:  ${c}` : ''}\n   FK:  ${c} → ${Rf}${vnn ? `\n   VNN: ${c}` : ''}`;
    const op = (v, u) => `Cada ${T} tiene ${v ? 'exactamente un' : 'cero o un'} ${Rf}; cada ${Rf} está en ${u ? 'cero o un' : 'cero o muchos'} ${T}`;
    return { fig: esquema(txt), p: '¿Qué dicen estas restricciones?', ...barajar([op(vnn, uk), op(!vnn, uk), op(vnn, !uk), op(!vnn, !uk)], 0), x: `${vnn ? 'Con VNN no puede faltar' : 'Sin VNN puede faltar'}; ${uk ? 'con UK no se repite' : 'sin UK se repite'}.` };
  },
};
export const pregunta = (tag) => ({ ...GEN[tag](), tag });

// ---------- vistas ----------
const barra = (k, v) => `<div class="bd-flojo"><span>${esc(TAGS[k])}</span><i style="--p:${Math.round((v?.r ?? 0) * 100)}%"></i><small>${v ? Math.round(v.r * 100) + ' %' : '—'}</small></div>`;
export function resumenPractica(ctx) {
  const t = ctx.leer('S')?.c || {}, flojos = Object.entries(t).filter(([k, v]) => TAGS[k] && v.r >= 0.25).sort((a, b) => b[1].r - a[1].r).slice(0, 4);
  return `<section class="bd-practica"><div><h3>Tu práctica</h3><p class="suave">${flojos.length ? 'Preguntas nuevas cada vez, con más de lo que más fallas:' : 'Preguntas nuevas cada vez. Según lo que falles en lecciones, ejercicios y aquí, te saldrá más de eso.'}</p>
    ${flojos.map(([k, v]) => barra(k, v)).join('')}</div><button type="button" class="boton principal" data-ir="p">Practicar 10 preguntas</button></section>`;
}
export function practicar(cont, ctx) {
  const N = 10, hechas = [];
  const t0 = () => ctx.leer('S')?.c || {};
  const siguiente = () => {
    const ult = hechas.slice(-2).map((h) => h.tag), tag = elegirTag(t0(), ult.length === 2 && ult[0] === ult[1] ? [ult[0]] : []), q = pregunta(tag);
    cont.innerHTML = `<nav class="bd-migas"><button type="button" class="boton mini" data-ir="">← Bases de datos</button><span class="suave">Pregunta ${hechas.length + 1} de ${N}</span><span></span></nav>
      <div class="bd-barra-p"><i style="width:${(hechas.length / N) * 100}%"></i></div><span class="chip">${esc(TAGS[tag])}</span>${q.fig || ''}${preguntas([q])}<div class="bd-acciones bd-sig" hidden><button type="button" class="boton principal" data-a="sig">${hechas.length + 1 < N ? 'Siguiente →' : 'Ver resultado'}</button></div>`;
    cablearPreguntas(cont, [q], null, (tags, bien) => { anotar(ctx, tags, bien); hechas.push({ tag, bien }); cont.querySelector('.bd-sig').hidden = false; cont.querySelector('[data-a=sig]').focus(); });
  };
  const final = () => {
    const bien = hechas.filter((h) => h.bien).length, por = {};
    for (const h of hechas) (por[h.tag] ||= []).push(h.bien);
    const t = t0();
    cont.innerHTML = `<nav class="bd-migas"><button type="button" class="boton mini" data-ir="">← Bases de datos</button><span></span></nav>
      <header class="bd-cab"><h2>${bien} de ${N}</h2><p class="suave">${bien === N ? 'Todo bien. La próxima ronda buscará otros conceptos.' : 'La próxima ronda te sacará más de lo que has fallado.'}</p></header>
      <div class="bd-ronda">${Object.entries(por).map(([k, r]) => `<div class="bd-flojo"><span>${esc(TAGS[k])}</span><b>${r.filter(Boolean).length}/${r.length}</b></div>`).join('')}</div>
      <h3>Cómo vas en cada concepto</h3><p class="suave">Porcentaje de fallos reciente (pesa más lo último).</p>${Object.keys(TAGS).filter((k) => t[k]).sort((a, b) => t[b].r - t[a].r).map((k) => barra(k, t[k])).join('')}
      <div class="bd-acciones"><button type="button" class="boton principal" data-a="otra">Otra ronda</button></div>`;
  };
  cont.onclick = (ev) => {
    const b = ev.target.closest('button'); if (!b || !cont.contains(b)) return;
    if (b.dataset.ir !== undefined && b.closest('.bd-migas')) return ctx.ir(b.dataset.ir);
    if (b.dataset.a === 'sig') return hechas.length >= N ? final() : siguiente();
    if (b.dataset.a === 'otra') { hechas.length = 0; siguiente(); }
  };
  siguiente();
}
