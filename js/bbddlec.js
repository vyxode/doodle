// Lecciones de Bases de datos (UD02 y UD03), cada una con diagramas que cambian al tocar y preguntas al final.
// Ejemplos propios; reglas y notación, las de clase.
import { figura, esquema, preguntas, cablearPreguntas, sel, esc } from './bbdd.js';

export const cuanto = (min, max) => ({ '01': 'cero o una', '0N': 'cero o muchas', '11': 'exactamente una', '1N': 'una o muchas' })[`${min}${max}`];
const clave = (n) => 'cod_' + String(n).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_');
const M = (n) => String(n).toUpperCase();

// ---------- tablas de una relación binaria A —R— B (cada A con amin..amax B; cada B con bmin..bmax A) ----------
export function binaria(A, R, B, amin, amax, bmin, bmax) {
  const ka = clave(A), kb = clave(B), perd = [];
  const ent = (X, kx, extra = '', pie = '') => `${X} (${kx}, nombre${extra})\n   PK:  ${kx}${pie}`;
  let txt, regla;
  if (amax === 'N' && bmax === 'N') {
    regla = 'N:M: se crea una tabla nueva con las dos claves. Juntas forman la PK y cada una es FK hacia su tabla.';
    txt = `${ent(A, ka)}\n\n${ent(B, kb)}\n\n${M(R)} (${ka}, ${kb})\n   PK:  (${ka}, ${kb})\n   FK:  ${ka} → ${A}\n   FK:  ${kb} → ${B}`;
    if (amin === '1') perd.push(`«Todo ${A} tiene al menos un ${B}»: nada obliga a que cada ${A} tenga filas en ${M(R)}.`);
    if (bmin === '1') perd.push(`«Todo ${B} tiene al menos un ${A}»: nada obliga a que cada ${B} tenga filas en ${M(R)}.`);
  } else if (amax === '1' && bmax === '1') {
    if (amin === '1' && bmin === '1') {
      regla = '1:1 obligatoria en los dos lados: se pueden fundir en una sola tabla; la clave de la otra queda como UK obligatoria.';
      txt = `${A} (${ka}, nombre, ${kb}, nombre_${B.toLowerCase()})\n   PK:  ${ka}\n   UK:  ${kb}\n   VNN: ${kb}`;
    } else if (amin === '1' || bmin === '1') {
      const [O, ko, X, kx] = amin === '1' ? [A, ka, B, kb] : [B, kb, A, ka];
      regla = `1:1 con un lado obligatorio: la FK va en ${O}, que siempre tiene pareja. UK para que no se repita y VNN porque no puede faltar.`;
      txt = `${ent(X, kx)}\n\n${ent(O, ko, ', ' + kx, `\n   UK:  ${kx}\n   FK:  ${kx} → ${X}\n   VNN: ${kx}`)}`;
    } else {
      regla = '1:1 opcional en los dos lados: tabla nueva con una clave como PK y la otra como UK obligatoria (así no hay nulos). También valdría una FK con UK que admita nulos.';
      txt = `${ent(A, ka)}\n\n${ent(B, kb)}\n\n${M(R)} (${ka}, ${kb})\n   PK:  ${ka}\n   UK:  ${kb}\n   FK:  ${ka} → ${A}\n   FK:  ${kb} → ${B}\n   VNN: ${kb}`;
    }
  } else {
    const [N, kn, nmin, U, ku, umin] = amax === '1' ? [A, ka, amin, B, kb, bmin] : [B, kb, bmin, A, ka, amin];
    regla = `1:N: no hay tabla nueva. La clave del lado 1 (${U}) viaja como FK a la tabla del lado N (${N}).${nmin === '1' ? ` Como todo ${N} tiene su ${U}, la FK lleva VNN.` : ` Puede quedar a NULL: un ${N} puede no tener ${U}.`}`;
    txt = `${ent(U, ku)}\n\n${ent(N, kn, ', ' + ku, `\n   FK:  ${ku} → ${U}${nmin === '1' ? `\n   VNN: ${ku}` : ''}`)}`;
    if (umin === '1') perd.push(`«Todo ${U} tiene al menos un ${N}»: la FK está en ${N} y nada obliga a que cada ${U} aparezca.`);
  }
  const tipo = amax === 'N' && bmax === 'N' ? 'N:M' : amax === '1' && bmax === '1' ? '1:1' : `1:N · el lado «1» es ${amax === '1' ? B : A} y el lado «N» es ${amax === '1' ? A : B}`;
  return { txt, regla, perd, tipo };
}
export const spBinaria = (A, R, B, amin, amax, bmin, bmax) => ({
  e: { [A]: { x: 0, y: 100, a: ['#' + clave(A), 'nombre'] }, [B]: { x: 430, y: 100, a: ['#' + clave(B), 'nombre'] } },
  r: [{ n: R, x: 215, y: 90, con: [[A, `(${bmin},${amax === 'N' && bmax === 'N' ? 'N' : bmax})`], [B, `(${amin},${amax === 'N' && bmax === 'N' ? 'M' : amax})`]] }],
});
const MIN = [['0', '0 (opcional)'], ['1', '1 (obligatorio)']], MAX = [['1', '1'], ['N', 'muchas (N)']];

// ---------- 1. cardinalidades ----------
const CASOS = [
  ['SOCIO', 'tiene_prestado', 'LIBRO', '0', 'N', '0', '1', 'Un socio puede tener varios libros prestados a la vez, o ninguno. Un libro está prestado, como mucho, a un socio.'],
  ['JUGADOR', 'juega_en', 'EQUIPO', '1', '1', '1', 'N', 'Todo jugador juega en un único equipo. Un equipo tiene al menos un jugador, normalmente muchos.'],
  ['PACIENTE', 'atendido_por', 'MEDICO', '1', 'N', '0', 'N', 'A cada paciente le ha atendido al menos un médico, y pueden ser varios. Un médico atiende a muchos pacientes; uno recién llegado aún no ha atendido a ninguno.'],
  ['COCHE', 'lleva', 'MATRICULA', '1', '1', '1', '1', 'Todo coche lleva exactamente una matrícula y cada matrícula es de exactamente un coche.'],
  ['EMPLEADO', 'ocupa', 'PLAZA', '0', '1', '0', '1', 'Un empleado puede tener una plaza de garaje o ninguna; una plaza puede estar libre o ser de un empleado.'],
  ['PELICULA', 'dirigida_por', 'DIRECTOR', '1', '1', '1', 'N', 'Cada película tiene exactamente un director. Un director ha dirigido al menos una película, a veces muchas.'],
  ['CANCION', 'esta_en', 'LISTA', '0', 'N', '1', 'N', 'Una canción puede estar en muchas listas o en ninguna. Una lista tiene al menos una canción.'],
  ['LICENCIA', 'pertenece_a', 'TAXISTA', '1', '1', '0', '1', 'Toda licencia de taxi pertenece a un taxista. Un taxista tiene como mucho una licencia (los asalariados no tienen).'],
];
function cardinalidades(c, ctx) {
  let v = { A: 'CLIENTE', R: 'realiza', B: 'PEDIDO', amin: '0', amax: 'N', bmin: '1', bmax: '1' }, caso = null;
  c.innerHTML = `<p>Una relación se lee desde cada lado: «cada CLIENTE realiza <i>de … a …</i> PEDIDOS» y «cada PEDIDO lo realiza <i>de … a …</i> CLIENTES». En clase el par se escribe <b>junto a la entidad que se cuenta</b>: el par de al lado de PEDIDO dice cuántos pedidos tiene un cliente.</p>
    <div class="bd-lab"><div class="bd-ctrl">
      <div class="bd-fila"><label>Entidad A<input class="i-A" value="CLIENTE" maxlength="16"></label><label>Relación<input class="i-R" value="realiza" maxlength="18"></label><label>Entidad B<input class="i-B" value="PEDIDO" maxlength="16"></label></div>
      <p class="bd-frase">Cada <b class="o-A"></b> se relaciona con ${sel('s-amin', MIN, v.amin)} a ${sel('s-amax', MAX, v.amax)} <b class="o-B"></b></p>
      <p class="bd-frase">Cada <b class="o-B"></b> se relaciona con ${sel('s-bmin', MIN, v.bmin)} a ${sel('s-bmax', MAX, v.bmax)} <b class="o-A"></b></p>
    </div><div class="bd-salida"></div></div>
    <h3>Ponte a prueba</h3><div class="bd-reto"></div>`;
  const salida = c.querySelector('.bd-salida');
  const pintar = () => {
    for (const k of ['A', 'R', 'B']) v[k] = (c.querySelector('.i-' + k).value.trim() || k).replace(/\s+/g, '_');
    v.A = M(v.A); v.B = M(v.B);
    for (const k of ['amin', 'amax', 'bmin', 'bmax']) v[k] = c.querySelector('.s-' + k).value;
    c.querySelectorAll('.o-A').forEach((x) => (x.textContent = v.A)); c.querySelectorAll('.o-B').forEach((x) => (x.textContent = v.B));
    const t = binaria(v.A, v.R, v.B, v.amin, v.amax, v.bmin, v.bmax);
    salida.innerHTML = figura(spBinaria(v.A, v.R, v.B, v.amin, v.amax, v.bmin, v.bmax), `Junto a ${esc(v.B)}: cuántos ${esc(v.B)} tiene un ${esc(v.A)}. Junto a ${esc(v.A)}: cuántos ${esc(v.A)} tiene un ${esc(v.B)}.`) +
      `<p class="bd-tipo"><b>Tipo:</b> ${esc(t.tipo)}</p><ul class="bd-lectura"><li>Cada ${esc(v.A)} se relaciona con ${cuanto(v.amin, v.amax)} instancia(s) de ${esc(v.B)}.</li><li>Cada ${esc(v.B)} se relaciona con ${cuanto(v.bmin, v.bmax)} instancia(s) de ${esc(v.A)}.</li></ul>
      <details class="bd-tablas" open><summary>Así queda en tablas (UD03)</summary><p>${esc(t.regla)}</p>${esquema(t.txt)}${t.perd.map((p) => `<p class="bd-perdida"><b>Pérdida semántica:</b> ${esc(p)}</p>`).join('')}</details>`;
  };
  c.querySelector('.bd-ctrl').addEventListener('input', pintar);
  pintar();
  const reto = c.querySelector('.bd-reto');
  const nuevo = () => {
    caso = CASOS[(CASOS.indexOf(caso) + 1 + Math.floor(Math.random() * (CASOS.length - 1))) % CASOS.length];
    const [A, R, B] = caso;
    reto.innerHTML = `<p class="bd-caso">${esc(caso[7])}</p>
      <p class="bd-frase">Cada <b>${A}</b> con ${sel('r-amin', [['', '¿mín?'], ...MIN], '')} a ${sel('r-amax', [['', '¿máx?'], ...MAX], '')} <b>${B}</b></p>
      <p class="bd-frase">Cada <b>${B}</b> con ${sel('r-bmin', [['', '¿mín?'], ...MIN], '')} a ${sel('r-bmax', [['', '¿máx?'], ...MAX], '')} <b>${A}</b></p>
      <div class="bd-acciones"><button type="button" class="boton principal" data-r="ok">Comprobar</button><button type="button" class="boton" data-r="otro">Otro caso</button></div><div class="bd-res"></div>`;
  };
  reto.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-r]'); if (!b) return;
    if (b.dataset.r === 'otro') return nuevo();
    const [A, R, B, ...ok] = caso, ks = ['amin', 'amax', 'bmin', 'bmax'];
    let bien = 0;
    ks.forEach((k, i) => { const s = reto.querySelector('.r-' + k), x = s.value === ok[i]; s.classList.toggle('ok', x); s.classList.toggle('mal', !x); bien += x; });
    ctx.anotar(['card'], reto.querySelector('.r-amax').value === ok[1] && reto.querySelector('.r-bmax').value === ok[3]);
    ctx.anotar(['minimos'], reto.querySelector('.r-amin').value === ok[0] && reto.querySelector('.r-bmin').value === ok[2]);
    reto.querySelector('.bd-res').innerHTML = (bien === 4 ? '<p class="bd-bien">¡Las cuatro bien!</p>' : `<p class="bd-mal">${bien} de 4. Lee la frase desde cada lado: «cada ${A}…» y «cada ${B}…».</p>`) + figura(spBinaria(A, R, B, ...ok.slice(0, 4)));
    if (bien === 4) ctx.terminar(1, 1);
  });
  nuevo();
}

// ---------- 2. débiles y reflexivas ----------
function debiles(c) {
  let modo = 'ID', filas = null;
  c.innerHTML = `<p>Una entidad débil no puede existir sin otra (su propietaria). Se dibuja con rectángulo doble y su relación con rombo doble. La pregunta que decide cómo se identifica:</p>
    <p class="bd-frase">¿El número de habitación se repite en hoteles distintos? ${sel('s-modo', [['ID', 'Sí: la 101 está en todos los hoteles'], ['E', 'No: cada habitación tiene un código único en toda la cadena']], 'ID')}</p>
    <div class="bd-salida"></div>
    <h3>Prueba a insertar una fila en HABITACION</h3><div class="bd-insertar"></div>
    <h3>Relaciones reflexivas</h3><p>Una entidad relacionada consigo misma. La clave aparece dos veces, cada una con el nombre de su <b>rol</b>.</p>
    <p class="bd-frase">${sel('s-refl', [['1N', '1:N · TRABAJADOR supervisa TRABAJADOR'], ['11', '1:1 · PERSONA casada con PERSONA'], ['NM', 'N:M · USUARIO sigue a USUARIO']], '1N')}</p><div class="bd-refl"></div>`;
  const hotel = { e: { HOTEL: { x: 0, y: 110, a: ['#cod_hotel', 'nombre'] } } };
  const pintar = () => {
    modo = c.querySelector('.s-modo').value;
    filas = modo === 'ID' ? [['H1', '101', '1'], ['H1', '102', '1'], ['H2', '101', '1']] : [['1001', '1', 'H1'], ['1002', '1', 'H1'], ['2001', '1', 'H2']];
    const sp = { e: { ...hotel.e, HABITACION: { x: 440, y: 110, d: true, a: modo === 'ID' ? ['%num', 'planta'] : ['#cod_hab', 'planta'] } },
      r: [{ n: modo === 'ID' ? 'tiene (ID)' : 'tiene (E)', d: true, x: 215, y: 100, con: [['HOTEL', '(1,1)'], ['HABITACION', '(1,N)']] }] };
    c.querySelector('.bd-salida').innerHTML = figura(sp, modo === 'ID' ? 'Débil por identificación: num solo distingue dentro de su hotel (discriminador).' : 'Débil por existencia: tiene identificador propio, pero no existe sin su hotel.') +
      esquema(modo === 'ID' ? 'HOTEL (cod_hotel, nombre)\n   PK:  cod_hotel\n\nHABITACION (cod_hotel, num, planta)\n   PK:  (cod_hotel, num)\n   FK:  cod_hotel → HOTEL' : 'HOTEL (cod_hotel, nombre)\n   PK:  cod_hotel\n\nHABITACION (cod_hab, planta, cod_hotel)\n   PK:  cod_hab\n   FK:  cod_hotel → HOTEL\n   VNN: cod_hotel') +
      `<p>${modo === 'ID' ? 'La PK es compuesta: la clave del propietario más el discriminador. cod_hotel es a la vez parte de la PK y FK, así que ya es obligatoria.' : 'La PK es su propio código. La dependencia se ve en el VNN: no hay habitaciones sin hotel.'}</p>`;
    insertar();
  };
  const insertar = () => {
    const cab = modo === 'ID' ? ['cod_hotel (PK, FK)', 'num (PK)', 'planta'] : ['cod_hab (PK)', 'planta', 'cod_hotel (FK, VNN)'];
    c.querySelector('.bd-insertar').innerHTML = `<p class="suave">HOTEL tiene H1 y H2. Escribe una fila y mira si el SGBD la aceptaría.</p>
      <table class="bd-datos"><thead><tr>${cab.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${filas.map((f) => `<tr>${f.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody>
      <tfoot><tr>${cab.map((h, i) => `<td><input class="f${i}" aria-label="${h}" placeholder="${i === 0 ? (modo === 'ID' ? 'H3' : '1003') : ''}"></td>`).join('')}</tr></tfoot></table>
      <div class="bd-acciones"><button type="button" class="boton principal" data-a="ins">Insertar</button></div><p class="bd-res" aria-live="polite"></p>`;
  };
  c.addEventListener('change', (ev) => { if (ev.target.matches('.s-modo')) pintar(); if (ev.target.matches('.s-refl')) refl(); });
  c.addEventListener('click', (ev) => {
    if (!ev.target.closest('[data-a=ins]')) return;
    const f = [0, 1, 2].map((i) => c.querySelector('.f' + i).value.trim()), res = c.querySelector('.bd-insertar .bd-res');
    const hoteles = ['H1', 'H2'];
    let err = '';
    if (modo === 'ID') {
      if (!f[0] || !f[1]) err = 'Rechazada: la PK (cod_hotel, num) no puede tener nulos.';
      else if (!hoteles.includes(f[0])) err = `Rechazada por la FK: el hotel ${f[0]} no existe en HOTEL.`;
      else if (filas.some((x) => x[0] === f[0] && x[1] === f[1])) err = `Rechazada por la PK: la pareja (${f[0]}, ${f[1]}) ya existe.`;
    } else {
      if (!f[0]) err = 'Rechazada: cod_hab es la PK y no puede ser nulo.';
      else if (filas.some((x) => x[0] === f[0])) err = `Rechazada por la PK: ya hay una habitación ${f[0]}.`;
      else if (!f[2]) err = 'Rechazada por el VNN: toda habitación tiene que tener hotel.';
      else if (!hoteles.includes(f[2])) err = `Rechazada por la FK: el hotel ${f[2]} no existe en HOTEL.`;
    }
    if (err) { res.className = 'bd-res bd-mal'; res.textContent = err; return; }
    filas.push(f); insertar();
    const r2 = c.querySelector('.bd-insertar .bd-res'); r2.className = 'bd-res bd-bien'; r2.textContent = 'Aceptada.' + (modo === 'ID' && filas.filter((x) => x[1] === f[1]).length > 1 ? ` El número ${f[1]} se repite, pero la pareja no.` : '');
  });
  const REFL = {
    '1N': { e: 'TRABAJADOR', r: 'supervisa', roles: [['supervisor', '(0,1)'], ['supervisado', '(0,N)']], txt: 'TRABAJADOR (cod_trab, nombre, cod_supervisor)\n   PK:  cod_trab\n   FK:  cod_supervisor → TRABAJADOR', p: 'Como una 1:N cualquiera, pero la FK apunta a su propia tabla. Admite NULL: quien está arriba del todo no tiene supervisor.' },
    11: { e: 'PERSONA', r: 'casada_con', roles: [['cónyuge', '(0,1)'], ['cónyuge', '(0,1)']], txt: 'PERSONA (dni, nombre, dni_conyuge)\n   PK:  dni\n   UK:  dni_conyuge\n   FK:  dni_conyuge → PERSONA', p: 'Como una 1:1 opcional: FK hacia la misma tabla con UK, para que nadie tenga dos cónyuges. (También valdría una tabla aparte con PK y UK.)' },
    NM: { e: 'USUARIO', r: 'sigue_a', roles: [['seguidor', '(0,N)'], ['seguido', '(0,M)']], txt: 'USUARIO (id_usuario, alias)\n   PK:  id_usuario\n\nSIGUE (id_seguidor, id_seguido)\n   PK:  (id_seguidor, id_seguido)\n   FK:  id_seguidor → USUARIO\n   FK:  id_seguido → USUARIO', p: 'Como una N:M: tabla nueva con la clave dos veces, una por rol. Nada impide seguirse a uno mismo: haría falta una regla de fila (id_seguidor <> id_seguido).' },
  };
  const refl = () => {
    const r = REFL[c.querySelector('.s-refl').value];
    c.querySelector('.bd-refl').innerHTML = figura({ e: { [r.e]: { x: 0, y: 100, a: ['#' + (r.e === 'PERSONA' ? 'dni' : r.e === 'USUARIO' ? 'id_usuario' : 'cod_trab'), r.e === 'USUARIO' ? 'alias' : 'nombre'] } },
      r: [{ n: r.r, x: 430, y: 90, con: r.roles.map(([rol, card]) => [r.e, card, rol]) }] }) + esquema(r.txt) + `<p>${esc(r.p)}</p>`;
  };
  pintar(); refl();
}

// ---------- 3. ternarias, agregación y especialización ----------
function avanzadas(c, ctx) {
  c.innerHTML = `<div class="bd-tabs" role="tablist"><button type="button" role="tab" data-t="ter" aria-selected="true">Ternaria</button><button type="button" role="tab" data-t="agr" aria-selected="false">Agregación</button><button type="button" role="tab" data-t="esp" aria-selected="false">Especialización</button></div><div class="bd-sub"></div>`;
  const sub = c.querySelector('.bd-sub');
  let actual = null; // el repintado de la pestaña abierta
  sub.addEventListener('change', () => actual?.());
  const ternaria = () => {
    const E = ['ENTRENADOR', 'EQUIPO', 'TEMPORADA'], K = ['cod_entrenador', 'cod_equipo', 'anio'];
    sub.innerHTML = `<p>Una ternaria une tres entidades en un mismo hecho: «este entrenador dirige a este equipo en esta temporada». Para cada entidad se fija una pareja de las otras dos y se pregunta cuántas hay de ella.</p>
      <div class="bd-ctrl">${E.map((e, i) => { const o = E.filter((_, j) => j !== i); return `<p class="bd-frase">Para una pareja (${o.join(', ')}) hay ${sel('t' + i, [['1', 'como mucho un'], ['N', 'varios']], i === 0 ? '1' : 'N')} <b>${e}</b></p>`; }).join('')}</div><div class="bd-salida"></div>`;
    const pintar = () => {
      const m = [0, 1, 2].map((i) => sub.querySelector('.t' + i).value), unos = m.map((x, i) => (x === '1' ? i : -1)).filter((i) => i >= 0), enes = [0, 1, 2].filter((i) => !unos.includes(i));
      let pk, uks = [], vnn = [];
      if (unos.length === 0) pk = [0, 1, 2];
      else if (unos.length === 1) { pk = enes; vnn = unos; }
      else if (unos.length === 2) { pk = [enes[0], unos[0]].sort(); uks = [[enes[0], unos[1]].sort()]; vnn = [unos[1]]; }
      else { pk = [0, 1]; uks = [[0, 2], [1, 2]]; }
      const col = (is) => (is.length > 1 ? `(${is.map((i) => K[i]).join(', ')})` : K[is[0]]);
      const txt = `DIRIGE (${K.join(', ')})\n   PK:  ${col(pk)}${uks.map((u) => `\n   UK:  ${col(u)}`).join('')}\n${K.map((k, i) => `   FK:  ${k} → ${E[i]}`).join('\n')}${vnn.length ? `\n   VNN: ${vnn.map((i) => K[i]).join(', ')}` : ''}`;
      const tipo = [...m].sort().join(':').replace(/N:N:N/, 'N:M:P');
      sub.querySelector('.bd-salida').innerHTML = figura({ e: { ENTRENADOR: { x: 0, y: 70, a: ['#cod_entrenador'] }, EQUIPO: { x: 470, y: 70, a: ['#cod_equipo'] }, TEMPORADA: { x: 240, y: 300, a: ['#anio'], ab: true } },
        r: [{ n: 'dirige', x: 235, y: 60, con: E.map((e, i) => [e, m[i] === '1' ? '(1,1)' : '(0,N)']), ab: false }] }) +
        `<p class="bd-tipo"><b>Tipo:</b> ${tipo}. Una ternaria siempre da una tabla nueva con las tres claves; lo que cambia es la PK.</p>${esquema(txt)}
        <p>${unos.length === 0 ? 'Todo es «varios»: hacen falta las tres claves para que una fila no se repita.' : unos.length === 1 ? `Basta la pareja de los lados N para saber el ${E[unos[0]]}: esa pareja es la PK y ${K[unos[0]]} va con VNN.` : unos.length === 2 ? `Dos lados son «1»: la PK es el lado N con uno de ellos, y la otra combinación es UK.` : 'Cualquier pareja determina la tercera: una es PK y las otras dos, UK.'}</p>`;
    };
    actual = pintar; pintar();
  };
  const agregacion = () => {
    sub.innerHTML = `<p>Un ACTOR participa en PELÍCULAS (N:M, con su papel). Algunas de esas participaciones se doblan al castellano y las dobla un DOBLADOR. Se dobla la participación, no el actor ni la película por separado.</p>
      <p class="bd-frase">¿Puede existir «este actor en esta película» sin doblador? ${sel('s-ag', [['si', 'Sí: no todas se doblan'], ['no', 'No: los tres van siempre juntos']], 'si')}</p>
      <p class="bd-frase bd-s">Cada participación la dobla ${sel('s-sn', [['1', 'como mucho un'], ['N', 'varios (un idioma cada uno)']], '1')} doblador</p><div class="bd-salida"></div>`;
    const pintar = () => {
      const ag = sub.querySelector('.s-ag').value === 'si', n = sub.querySelector('.s-sn').value;
      sub.querySelector('.bd-s').hidden = !ag;
      sub.querySelector('.bd-salida').innerHTML = ag
        ? figura({ g: [{ n: 'REPARTO', x: -30, y: 20, w: 640, h: 180 }], e: { ACTOR: { x: 0, y: 110, a: ['#cod_actor'] }, PELICULA: { x: 440, y: 110, a: ['#cod_peli'] }, DOBLADOR: { x: 220, y: 400, a: ['#cod_doblador'], ab: true } },
          r: [{ n: 'participa', x: 220, y: 100, con: [['ACTOR', '(1,N)'], ['PELICULA', '(0,M)']], a: ['papel'], ab: false }, { n: 'dobla', x: 215, y: 260, con: [['REPARTO', '(0,N)'], ['DOBLADOR', n === '1' ? '(0,1)' : '(0,N)']], ab: false }] }, 'La caja discontinua es la agregación: la relación participa, con sus dos entidades, actúa como una entidad.') +
          esquema(`ACTOR (cod_actor, nombre)\n   PK:  cod_actor\n\nPELICULA (cod_peli, titulo)\n   PK:  cod_peli\n\nDOBLADOR (cod_doblador, nombre)\n   PK:  cod_doblador\n\n` + (n === '1'
            ? 'PARTICIPA (cod_actor, cod_peli, papel, cod_doblador)\n   PK:  (cod_actor, cod_peli)\n   FK:  cod_actor → ACTOR\n   FK:  cod_peli → PELICULA\n   FK:  cod_doblador → DOBLADOR'
            : 'PARTICIPA (cod_actor, cod_peli, papel)\n   PK:  (cod_actor, cod_peli)\n   FK:  cod_actor → ACTOR\n   FK:  cod_peli → PELICULA\n\nDOBLA (cod_actor, cod_peli, cod_doblador)\n   PK:  (cod_actor, cod_peli, cod_doblador)\n   FK:  (cod_actor, cod_peli) → PARTICIPA\n   FK:  cod_doblador → DOBLADOR')) +
          `<p>${n === '1' ? 'Primero se pasa la N:M de dentro (PARTICIPA). Luego la agregación se trata como una entidad: dobla es 1:N, así que la clave del doblador viaja a PARTICIPA y admite NULL.' : 'dobla es N:M: tabla nueva cuya FK apunta a PARTICIPA entera (compuesta). Así solo se puede doblar una participación que existe.'}</p>`
        : figura({ e: { ACTOR: { x: 0, y: 90, a: ['#cod_actor'] }, PELICULA: { x: 470, y: 90, a: ['#cod_peli'] }, DOBLADOR: { x: 235, y: 300, a: ['#cod_doblador'], ab: true } },
          r: [{ n: 'participa', x: 235, y: 80, con: [['ACTOR', '(0,N)'], ['PELICULA', '(0,N)'], ['DOBLADOR', '(0,N)']], ab: false }] }, 'Si los tres solo tienen sentido juntos, es una ternaria.') +
          '<p>Con una ternaria no se podría guardar un actor en una película sin doblador: cada fila necesita las tres claves. Por eso, si la pareja existe sola, se usa agregación.</p>';
    };
    actual = pintar; pintar();
  };
  const especializacion = () => {
    sub.innerHTML = `<p>VEHICULO se especializa en TURISMO, MOTO y CAMION. El triángulo lleva dos marcas: <b>T/P</b> (¿todo vehículo es de algún subtipo?) y <b>D/S</b> (¿puede ser de varios a la vez?).</p>
      <p class="bd-frase">${sel('s-t', [['T', 'Total: todo vehículo es de algún tipo'], ['P', 'Parcial: hay vehículos sin subtipo (furgonetas…)']], 'P')} ${sel('s-s', [['D', 'Disjunta: como mucho un subtipo'], ['S', 'Solapada: puede ser de varios']], 'D')}</p><div class="bd-salida"></div>`;
    const pintar = () => {
      const T = sub.querySelector('.s-t').value === 'T', S = sub.querySelector('.s-s').value === 'S', cC = T && !S;
      const A = S ? 'VEHICULO (matricula, marca, es_turismo, plazas, es_moto, cilindrada, es_camion, tara)\n   PK:  matricula\n   VNN: es_turismo, es_moto, es_camion' : `VEHICULO (matricula, marca, tipo, plazas, cilindrada, tara)\n   PK:  matricula${T ? '\n   VNN: tipo' : ''}`;
      const B = 'VEHICULO (matricula, marca)\n   PK:  matricula\n\nTURISMO (matricula, plazas)\n   PK:  matricula\n   FK:  matricula → VEHICULO\n\nMOTO (matricula, cilindrada)\n   PK:  matricula\n   FK:  matricula → VEHICULO\n\nCAMION (matricula, tara)\n   PK:  matricula\n   FK:  matricula → VEHICULO';
      const C = 'TURISMO (matricula, marca, plazas)\n   PK:  matricula\n\nMOTO (matricula, marca, cilindrada)\n   PK:  matricula\n\nCAMION (matricula, marca, tara)\n   PK:  matricula';
      sub.querySelector('.bd-salida').innerHTML = figura({ e: { VEHICULO: { x: 220, y: 70, a: ['#matricula', 'marca'] }, TURISMO: { x: 0, y: 330, a: ['plazas'], ab: true }, MOTO: { x: 220, y: 330, a: ['cilindrada'], ab: true }, CAMION: { x: 440, y: 330, a: ['tara'], ab: true } },
        h: [{ x: 245, y: 190, sup: 'VEHICULO', sub: ['TURISMO', 'MOTO', 'CAMION'], T, S }] }) +
        `<div class="bd-estrategias">
          <section class="ok"><h4>B · Supertipo y una tabla por subtipo <span class="chip ok">Siempre vale</span></h4>${esquema(B)}<p>La clave del supertipo es PK y FK en cada subtipo. Es la opción por defecto.</p></section>
          <section class="ok"><h4>A · Tabla única <span class="chip ok">Vale</span></h4>${esquema(A)}<p>${S ? 'Solapada: una columna «tipo» no basta, hace falta un indicador por subtipo.' : 'Disjunta: basta una columna tipo.'} Muchos NULL en las columnas de los demás subtipos.</p></section>
          <section class="${cC ? 'ok' : 'no'}"><h4>C · Solo los subtipos <span class="chip ${cC ? 'ok' : 'mal'}">${cC ? 'Vale' : 'No vale'}</span></h4>${esquema(C)}<p>${cC ? 'Total y disjunta: cada vehículo cae en una sola tabla.' : !T ? 'Parcial: un vehículo sin subtipo no tendría tabla donde guardarse.' : 'Solapada: un vehículo de dos tipos se repetiría en dos tablas.'}</p></section></div>`;
    };
    actual = pintar; pintar();
  };
  const ver = { ter: ternaria, agr: agregacion, esp: especializacion };
  c.querySelector('.bd-tabs').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-t]'); if (!b) return;
    c.querySelectorAll('.bd-tabs [data-t]').forEach((x) => x.setAttribute('aria-selected', x === b));
    ver[b.dataset.t]();
  });
  ternaria();
  const q = [
    { tag: 'agregacion', p: 'Un ALUMNO hace prácticas en una EMPRESA y algunas de esas prácticas tienen un TUTOR de empresa asignado. ¿Qué uses?', o: ['Ternaria ALUMNO-EMPRESA-TUTOR', 'Agregación de «hace prácticas» unida a TUTOR', 'Dos 1:N independientes'], ok: 1, x: 'Las prácticas existen aunque no tengan tutor: la pareja alumno-empresa existe sola, así que es agregación.' },
    { tag: 'ternaria', p: 'Ternaria con ENTRENADOR (1,1), EQUIPO (0,N) y TEMPORADA (0,N). ¿Cuál es la PK?', o: ['(cod_entrenador, cod_equipo, anio)', '(cod_equipo, anio)', 'cod_entrenador'], ok: 1, x: 'Es 1:N:N: las claves de los lados N forman la PK y la del lado 1 lleva VNN.' },
    { tag: 'jerarquia', p: 'Jerarquía parcial y solapada. ¿Qué estrategia NO vale?', o: ['Supertipo y subtipos', 'Tabla única con indicadores', 'Solo los subtipos'], ok: 2, x: 'Solo subtipos exige total y disjunta.' },
  ];
  c.insertAdjacentHTML('beforeend', `<h3>Ponte a prueba</h3>${preguntas(q)}`);
  cablearPreguntas(c, q, ctx.terminar, ctx.anotar);
}

// ---------- 4. las 9 reglas de paso a tablas ----------
const REGLAS = [
  { t: 'Entidad fuerte', r: 'Cada entidad fuerte es una tabla. Sus atributos simples son columnas, su identificador es la PK y otros identificadores son UK con VNN.',
    sp: { e: { SOCIO: { x: 0, y: 100, a: ['#num_socio', 'dni', 'nombre'] } } }, rel: 'SOCIO (num_socio, dni, nombre)\n   PK:  num_socio\n   UK:  dni\n   VNN: dni',
    q: { tag: 'uk', p: 'dni también identifica a cada socio. ¿Cómo queda?', o: ['Solo PK: num_socio', 'UK: dni y VNN: dni', 'PK: (num_socio, dni)'], ok: 1, x: 'Una clave candidata que no es la PK es UK, y obligatoria: sin valor no identificaría a nadie.' } },
  { t: 'Entidad débil', r: 'Por identificación: PK compuesta (clave del propietario + discriminador), y la del propietario es FK. Por existencia: PK propia y FK obligatoria (VNN) al propietario.',
    sp: { e: { EDIFICIO: { x: 0, y: 100, a: ['#cod_edif'] }, PLANTA: { x: 440, y: 100, d: true, a: ['%num_planta', 'superficie'] } }, r: [{ n: 'tiene (ID)', d: true, x: 215, y: 90, con: [['EDIFICIO', '(1,1)'], ['PLANTA', '(1,N)']] }] },
    rel: 'EDIFICIO (cod_edif, nombre)\n   PK:  cod_edif\n\nPLANTA (cod_edif, num_planta, superficie)\n   PK:  (cod_edif, num_planta)\n   FK:  cod_edif → EDIFICIO',
    q: { tag: 'debil', p: 'La planta 2 existe en muchos edificios. ¿Cuál es la PK de PLANTA?', o: ['num_planta', '(cod_edif, num_planta)', 'cod_edif'], ok: 1, x: 'El discriminador solo distingue dentro de su edificio: se le añade la clave del propietario.' } },
  { t: 'Compuestos y multivaluados', r: 'El compuesto se despliega en sus partes. El multivaluado sale a una tabla nueva con la clave de la entidad y el propio valor como PK.',
    sp: { e: { CLIENTE: { x: 160, y: 100, a: ['#cod_cliente', 'nombre', '*email'] } } }, rel: 'CLIENTE (cod_cliente, nombre)\n   PK:  cod_cliente\n\nEMAIL (cod_cliente, email)\n   PK:  (cod_cliente, email)\n   FK:  cod_cliente → CLIENTE',
    q: { tag: 'atributos', p: 'Un cliente puede tener varios email. ¿Por qué no una columna email en CLIENTE?', o: ['Porque una celda guarda un solo valor', 'Porque email no es clave', 'Sí se puede, separándolos con comas'], ok: 0, x: 'Cada celda guarda un valor atómico: los valores repetidos van en otra tabla.' } },
  { t: 'Relación 1:N', r: 'Sin tabla nueva: la clave del lado 1 viaja como FK al lado N. Si el lado N siempre tiene pareja (mínimo 1 junto al lado 1), la FK lleva VNN. Los atributos de la relación viajan con ella.',
    sp: spBinaria('DEPARTAMENTO', 'trabaja', 'EMPLEADO', '1', 'N', '1', '1'), rel: binaria('DEPARTAMENTO', 'trabaja', 'EMPLEADO', '1', 'N', '1', '1').txt,
    q: { tag: 'vnn', p: 'Todo empleado está en un departamento. ¿Dónde va la FK y cómo?', o: ['En DEPARTAMENTO, con UK', 'En EMPLEADO, con VNN', 'En una tabla nueva'], ok: 1, x: 'La clave viaja al lado N (EMPLEADO). Como es obligatorio, VNN.' } },
  { t: 'Relación N:M', r: 'Tabla nueva con las dos claves: juntas son la PK y cada una es FK. Los atributos de la relación van a esta tabla.',
    sp: { ...spBinaria('ALUMNO', 'cursa', 'CURSO', '1', 'N', '0', 'N'), r: [{ ...spBinaria('ALUMNO', 'cursa', 'CURSO', '1', 'N', '0', 'N').r[0], a: ['nota'] }] }, rel: 'ALUMNO (cod_alumno, nombre)\n   PK:  cod_alumno\n\nCURSO (cod_curso, nombre)\n   PK:  cod_curso\n\nCURSA (cod_alumno, cod_curso, nota)\n   PK:  (cod_alumno, cod_curso)\n   FK:  cod_alumno → ALUMNO\n   FK:  cod_curso → CURSO',
    q: { tag: 'NM', p: '¿Dónde va la nota?', o: ['En ALUMNO', 'En CURSO', 'En CURSA'], ok: 2, x: 'La nota depende de la pareja alumno-curso, no de uno solo.' } },
  { t: 'Relación 1:1', r: 'Opcional en los dos lados: tabla nueva (PK una clave, UK la otra) o FK con UK que admite NULL. Obligatoria en un lado: FK en ese lado con UK y VNN. Obligatoria en los dos: se pueden fundir.',
    sp: spBinaria('PERSONA', 'tiene', 'PASAPORTE', '0', '1', '1', '1'), rel: binaria('PERSONA', 'tiene', 'PASAPORTE', '0', '1', '1', '1').txt,
    q: { tag: 'uk', p: 'Sin la UK en la FK de PASAPORTE, ¿qué permitiría la tabla?', o: ['Pasaportes sin persona', 'Una persona con varios pasaportes', 'Nada distinto'], ok: 1, x: 'La UK es lo que convierte la FK en «1:1»: sin ella sería una 1:N.' } },
  { t: 'Reflexiva', r: 'Como una binaria con la misma entidad en los dos lados. La clave aparece dos veces, con el nombre de cada rol. 1:N: FK a la propia tabla. N:M: tabla nueva con las dos copias.',
    sp: { e: { TEMA: { x: 0, y: 100, a: ['#cod_tema', 'titulo'] } }, r: [{ n: 'requiere', x: 430, y: 90, con: [['TEMA', '(0,N)', 'previo'], ['TEMA', '(0,M)', 'posterior']] }] },
    rel: 'TEMA (cod_tema, titulo)\n   PK:  cod_tema\n\nREQUIERE (cod_tema, cod_tema_previo)\n   PK:  (cod_tema, cod_tema_previo)\n   FK:  cod_tema → TEMA\n   FK:  cod_tema_previo → TEMA',
    q: { tag: 'reflexiva', p: 'Reflexiva 1:N «un tema tiene un tema padre». ¿Cuántas tablas nuevas?', o: ['Ninguna: FK cod_padre en TEMA', 'Una tabla PADRE', 'Dos tablas'], ok: 0, x: 'Una 1:N no crea tabla: la FK va en la propia tabla, con otro nombre.' } },
  { t: 'Ternaria', r: 'Siempre tabla nueva con las tres claves (cada una FK). La PK depende de las cardinalidades: N:M:P, las tres; 1:N:N, los dos lados N (el 1 con VNN); 1:1:N, el N con un 1 y el otro par como UK.',
    sp: { e: { MEDICO: { x: 0, y: 70, a: ['#cod_medico'] }, PACIENTE: { x: 470, y: 70, a: ['#cod_paciente'] }, FECHA: { x: 240, y: 300, a: ['#dia'], ab: true } }, r: [{ n: 'cita', x: 235, y: 60, con: [['MEDICO', '(1,1)'], ['PACIENTE', '(0,N)'], ['FECHA', '(0,N)']], ab: false }] },
    rel: 'CITA (cod_paciente, dia, cod_medico)\n   PK:  (cod_paciente, dia)\n   FK:  cod_medico → MEDICO\n   FK:  cod_paciente → PACIENTE\n   FK:  dia → FECHA\n   VNN: cod_medico',
    q: { tag: 'ternaria', p: 'Un paciente, en un día, tiene cita con un solo médico. ¿Qué lleva VNN?', o: ['cod_paciente', 'dia', 'cod_medico'], ok: 2, x: 'MEDICO es el lado 1: no está en la PK y no puede faltar.' } },
  { t: 'Jerarquía', r: 'B (por defecto): tabla del supertipo y una por subtipo, cuya PK es la del supertipo y también FK. A: tabla única con tipo o indicadores. C: solo subtipos, únicamente si es total y disjunta.',
    sp: { e: { PERSONA: { x: 220, y: 70, a: ['#dni', 'nombre'] }, ALUMNO: { x: 60, y: 330, a: ['curso'], ab: true }, DOCENTE: { x: 380, y: 330, a: ['materia'], ab: true } }, h: [{ x: 245, y: 190, sup: 'PERSONA', sub: ['ALUMNO', 'DOCENTE'], T: false, S: true }] },
    rel: 'PERSONA (dni, nombre)\n   PK:  dni\n\nALUMNO (dni, curso)\n   PK:  dni\n   FK:  dni → PERSONA\n\nDOCENTE (dni, materia)\n   PK:  dni\n   FK:  dni → PERSONA',
    q: { tag: 'jerarquia', p: 'En la opción B, ¿qué es dni en ALUMNO?', o: ['Solo PK', 'Solo FK', 'PK y FK a la vez'], ok: 2, x: 'Cada fila de ALUMNO «es» una persona: misma clave, que además apunta a PERSONA.' } },
];
function reglas(c, ctx) {
  let i = 0;
  const hechas = new Set();
  c.innerHTML = `<p>Para pasar un E/R a tablas se aplican siempre las mismas reglas, en este orden: primero entidades y atributos, luego relaciones y al final jerarquías. Elige una regla, mira el dibujo y el resultado y responde la pregunta.</p>
    <nav class="bd-reglas">${REGLAS.map((r, j) => `<button type="button" data-i="${j}">${j + 1}. ${esc(r.t)}</button>`).join('')}</nav><div class="bd-regla"></div>`;
  const pintar = () => {
    const r = REGLAS[i];
    c.querySelectorAll('.bd-reglas button').forEach((b) => { b.setAttribute('aria-pressed', +b.dataset.i === i); b.classList.toggle('hecha', hechas.has(+b.dataset.i)); });
    const caja = c.querySelector('.bd-regla');
    caja.innerHTML = `<h3>${i + 1}. ${esc(r.t)}</h3><p class="bd-norma">${esc(r.r)}</p><div class="bd-dos">${figura(r.sp)}${esquema(r.rel)}</div>${preguntas([r.q])}
      <div class="bd-acciones">${i ? '<button type="button" class="boton" data-m="-1">← Anterior</button>' : ''}${i < REGLAS.length - 1 ? '<button type="button" class="boton principal" data-m="1">Siguiente regla →</button>' : ''}</div>`;
    cablearPreguntas(caja, [r.q], (bien) => { if (bien) hechas.add(i); c.querySelector(`.bd-reglas [data-i="${i}"]`).classList.toggle('hecha', hechas.has(i)); if (hechas.size === REGLAS.length) ctx.terminar(hechas.size, REGLAS.length); }, ctx.anotar);
  };
  c.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-i], [data-m]'); if (!b) return;
    i = b.dataset.i !== undefined ? +b.dataset.i : i + +b.dataset.m; pintar();
    c.querySelector('.bd-regla').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  pintar();
}

// ---------- 5. leer tablas al revés ----------
// Para cada FK: ¿puede repetirse su valor? (no si es UK o es toda la PK) ¿puede faltar? (no si es VNN o parte de la PK).
const INVERSOS = [
  { t: 'Gimnasio', rel: 'SOCIO (id_socio, nombre, dni)\n   PK:  id_socio\n   UK:  dni\n   VNN: dni\n\nTARJETA (num_tarjeta, caducidad, id_socio)\n   PK:  num_tarjeta\n   UK:  id_socio\n   FK:  id_socio → SOCIO\n   VNN: id_socio\n\nMONITOR (id_monitor, nombre, id_jefe)\n   PK:  id_monitor\n   FK:  id_jefe → MONITOR\n\nCLASE (cod_clase, nombre, id_monitor)\n   PK:  cod_clase\n   FK:  id_monitor → MONITOR\n   VNN: id_monitor',
    er: { e: { SOCIO: { x: 0, y: 90 }, TARJETA: { x: 430, y: 90 }, MONITOR: { x: 0, y: 330 }, CLASE: { x: 430, y: 330 } }, r: [{ n: 'tiene', x: 215, y: 80, con: [['SOCIO', '(1,1)'], ['TARJETA', '(0,1)']] }, { n: 'imparte', x: 215, y: 320, con: [['MONITOR', '(1,1)'], ['CLASE', '(0,N)']] }, { n: 'dirige', x: 0, y: 500, con: [['MONITOR', '(0,1)', 'jefe'], ['MONITOR', '(0,N)', 'subordinado']] }] } },
  { t: 'Tienda online', rel: 'CLIENTE (id_cliente, nombre)\n   PK:  id_cliente\n\nPEDIDO (num_pedido, fecha, id_cliente)\n   PK:  num_pedido\n   FK:  id_cliente → CLIENTE\n   VNN: id_cliente\n\nPRODUCTO (cod_producto, nombre, precio)\n   PK:  cod_producto\n\nLINEA (num_pedido, num_linea, cantidad, cod_producto)\n   PK:  (num_pedido, num_linea)\n   FK:  num_pedido → PEDIDO\n   FK:  cod_producto → PRODUCTO\n   VNN: cod_producto',
    er: { e: { CLIENTE: { x: 0, y: 90 }, PEDIDO: { x: 430, y: 90 }, LINEA: { x: 430, y: 330, d: true, a: ['%num_linea', 'cantidad'], ab: true }, PRODUCTO: { x: 0, y: 330 } }, r: [{ n: 'hace', x: 215, y: 80, con: [['CLIENTE', '(1,1)'], ['PEDIDO', '(0,N)']] }, { n: 'tiene (ID)', d: true, x: 430, y: 200, con: [['PEDIDO', '(1,1)'], ['LINEA', '(0,N)']] }, { n: 'de', x: 215, y: 320, con: [['PRODUCTO', '(1,1)'], ['LINEA', '(0,N)']] }] },
    nota: 'LINEA tiene PK compuesta (num_pedido, num_linea) y num_pedido es FK: es débil por identificación respecto a PEDIDO.' },
  { t: 'Academia', rel: 'ALUMNO (id_alumno, nombre)\n   PK:  id_alumno\n\nCURSO (cod_curso, titulo)\n   PK:  cod_curso\n\nINSCRIPCION (id_alumno, cod_curso, fecha)\n   PK:  (id_alumno, cod_curso)\n   FK:  id_alumno → ALUMNO\n   FK:  cod_curso → CURSO\n\nAULA (num_aula, plazas, cod_curso)\n   PK:  num_aula\n   UK:  cod_curso\n   FK:  cod_curso → CURSO',
    er: { e: { ALUMNO: { x: 0, y: 90 }, CURSO: { x: 430, y: 90 }, AULA: { x: 430, y: 330 } }, r: [{ n: 'inscripcion', x: 215, y: 80, con: [['ALUMNO', '(0,N)'], ['CURSO', '(0,M)']], a: ['fecha'] }, { n: 'se_da_en', x: 430, y: 200, con: [['CURSO', '(0,1)'], ['AULA', '(0,1)']] }] },
    nota: 'INSCRIPCION no es una entidad: su PK son dos FK, así que viene de una N:M (con el atributo fecha).' },
];
const fks = (txt) => { const out = []; let t = ''; for (const l of txt.split('\n')) { const m = l.match(/^(\w+) \(([^)]*)\)/); if (m) t = m[1]; const f = l.match(/^\s*FK:\s*(\w+) → (\w+)/); if (f) out.push({ t, col: f[1], ref: f[2] }); } return out; };
function respuestas(txt, f) {
  const bloque = txt.split('\n\n').find((b) => b.startsWith(f.t + ' ')), pk = (bloque.match(/PK:\s*\(?([^)\n]+)/) || [])[1].split(',').map((x) => x.trim());
  const uk = [...bloque.matchAll(/UK:\s*(\w+)/g)].map((m) => m[1]), vnn = ((bloque.match(/VNN:\s*(.+)/) || [])[1] || '').split(',').map((x) => x.trim());
  return { repite: !(uk.includes(f.col) || (pk.length === 1 && pk[0] === f.col)), falta: !(vnn.includes(f.col) || pk.includes(f.col)) };
}
function alReves(c, ctx) {
  let k = 0;
  const hechos = new Set();
  c.innerHTML = `<p>Te dan las tablas y tienes que sacar el E/R. Para cada clave ajena haz dos preguntas:</p>
    <ul class="bd-lectura"><li><b>¿Puede repetirse su valor en la tabla?</b> Si es UK o es toda la PK, no: cada referenciado aparece como mucho una vez (máx 1). Si no, sí (máx N).</li>
    <li><b>¿Puede faltar?</b> Si lleva VNN o es parte de la PK, no: cada fila tiene siempre su referenciado (mín 1). Si no, sí (mín 0).</li></ul>
    <nav class="bd-reglas">${INVERSOS.map((x, j) => `<button type="button" data-k="${j}">${esc(x.t)}</button>`).join('')}</nav><div class="bd-inv"></div>`;
  const pintar = () => {
    const x = INVERSOS[k], F = fks(x.rel);
    c.querySelectorAll('[data-k]').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.k === k));
    c.querySelector('.bd-inv').innerHTML = `<div class="bd-dos">${esquema(x.rel)}<div><table class="bd-datos bd-fks"><thead><tr><th>Clave ajena</th><th>¿Puede repetirse?</th><th>¿Puede faltar?</th></tr></thead>
      <tbody>${F.map((f, j) => `<tr><td><b>${f.t}</b>.${f.col} → ${f.ref}</td><td>${sel('p-r' + j, [['', '…'], ['si', 'Sí'], ['no', 'No']], '')}</td><td>${sel('p-f' + j, [['', '…'], ['si', 'Sí'], ['no', 'No']], '')}</td></tr>`).join('')}</tbody></table>
      <div class="bd-acciones"><button type="button" class="boton principal" data-a="comp">Comprobar y ver el E/R</button></div><div class="bd-res"></div></div></div>`;
  };
  c.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-k], [data-a=comp]'); if (!b) return;
    if (b.dataset.k !== undefined) { k = +b.dataset.k; return pintar(); }
    const x = INVERSOS[k], F = fks(x.rel);
    let bien = 0;
    const filas = F.map((f, j) => {
      const r = respuestas(x.rel, f), sr = c.querySelector('.p-r' + j), sf = c.querySelector('.p-f' + j), okR = sr.value === (r.repite ? 'si' : 'no'), okF = sf.value === (r.falta ? 'si' : 'no');
      sr.classList.toggle('ok', okR); sr.classList.toggle('mal', !okR); sf.classList.toggle('ok', okF); sf.classList.toggle('mal', !okF); bien += okR + okF;
      return `<li>${f.t}.${f.col}: cada ${f.t} tiene ${r.falta ? '0' : '1'} o 1 ${f.ref} → junto a ${f.ref} va (${r.falta ? 0 : 1},1). Cada ${f.ref} aparece en ${r.repite ? 'muchas filas' : 'una fila como mucho'} → junto a ${f.t} va (0,${r.repite ? 'N' : 1}).</li>`;
    });
    ctx.anotar(['inversa'], bien === F.length * 2);
    if (bien === F.length * 2) { hechos.add(k); if (hechos.size === INVERSOS.length) ctx.terminar(hechos.size, INVERSOS.length); }
    c.querySelector('.bd-inv .bd-res').innerHTML = `<p class="${bien === F.length * 2 ? 'bd-bien' : 'bd-mal'}">${bien} de ${F.length * 2} respuestas bien.</p><ul class="bd-lectura">${filas.join('')}</ul>${figura(x.er, 'El E/R del que salen estas tablas. Los mínimos del otro lado (¿todo cliente tiene pedidos?) no se pueden saber por las tablas: se suponen 0.')}${x.nota ? `<p>${esc(x.nota)}</p>` : ''}`;
  });
  pintar();
}

export const LECCIONES = [
  { id: 'card', t: 'Laboratorio de cardinalidades', d: 'Elige mínimos y máximos y mira cómo cambian el diagrama, las frases y las tablas.', montar: cardinalidades },
  { id: 'debil', t: 'Entidades débiles y reflexivas', d: 'Identificación o existencia, prueba a insertar filas y relaciones de una entidad consigo misma.', montar: debiles },
  { id: 'avanz', t: 'Ternarias, agregación y especialización', d: 'Qué PK lleva una ternaria, cuándo agregar y qué estrategias valen para una jerarquía.', montar: avanzadas },
  { id: 'reglas', t: 'Las 9 reglas para pasar a tablas', d: 'Cada regla con su dibujo, su esquema y una pregunta.', montar: reglas },
  { id: 'reves', t: 'Leer tablas al revés', d: 'De un esquema relacional al E/R: dos preguntas por cada clave ajena.', montar: alReves },
];
