// Prueba del robot contra un Aules simulado + cifrado. Además regenera js/demo.js (datos de ejemplo de la web).
// Uso: node test.js
import http from 'node:http';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { cifrar, descifrar } from './js/cripto.js';
import { nombreModulo } from './js/aules.js';
import { sentencias, adaptarMysql, revisarHtml } from './js/herramientas.js';
import { aDrawio, svgExportable, columna, tam } from './js/diagrama.js';
import { parsearTema, montarCatalogo, llaves } from './js/temas.js';
import { mkdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';

// --- cifrado ---
const sobre = await cifrar('clave', { a: 'ñ€', n: [1, 2] });
assert.deepEqual(await descifrar('clave', sobre), { a: 'ñ€', n: [1, 2] });
await assert.rejects(descifrar('otra', sobre));

// --- Aules simulado ---
const H = Math.floor(Date.now() / 1000), D = 86400;
// Nombres como los pone Aules de verdad (en valenciano y con códigos de grupo)
const MODULOS = [
  ["Programació'-'1CFSG,1CFSF", 'PRG'], ['Bases de Dades 1 DAM A', 'BD'], ['Sistemes informàtics - 1CFSF - DAM-A', 'SI'],
  ["Lenguajes de marcas y sistemas de gestión de la información'-'1CFSG,1CFSF", 'LM'], ['Entorns de Desenrotllament 1 DAM A/B', 'ED'], ["Itinerari personal per a l'ocupabilitat I'-'1CFSF", 'IPO'],
];
const TAREAS = {
  1: [['Práctica T2: condicionales', -30, 8.5], ['Práctica T3: bucles', -16, 7.25], ['Práctica T4: arrays y structs', 3, null, 'draft'], ['Examen práctico T1-T3', -9, 6.8]],
  2: [['Exercici 2.06: Biblioteca', -20, 9], ['Exercici 2.20: Quidditch', 1, null], ['Paso a modelo relacional', 5, null], ['Normalización', 12, null]],
  3: [['Instalación de Windows Server', -12, 7], ['Scripts en Bash', 1, null, 'submitted'], ['Tarea 01.07 - Casos Prácticos', -40, null]],
  4: [['XML bien formado', -18, 10], ['DTD de una agenda', -2, null, 'new'], ['XSD', 9, null]],
  5: [['Exercises software engineering', -25, 8], ['Actividades Tema 3: requisitos', 6, null], ['Pruebas unitarias con JUnit', 20, null]],
  6: [['Autoconocimiento y DAFO', -10, 6.5]],
};
let aid = 100;
const asign = Object.fromEntries(Object.entries(TAREAS).map(([c, ts]) => [c, ts.map(([n, d, nota, st]) => ({
  id: ++aid, cmid: aid + 1000, name: n, intro: `<p>Entrega en Aules la tarea <b>${n}</b>.</p><p>Formato: ZIP con el proyecto.</p>`,
  duedate: H + d * D, allowsubmissionsfromdate: H + (d - 14) * D, cutoffdate: 0, _nota: nota, _st: st || (nota != null ? 'submitted' : 'new'),
}))]));
const todas = Object.values(asign).flat();
const resp = {
  core_webservice_get_site_info: () => ({ sitename: 'Aules FP (simulado)', fullname: 'Fran García', userid: 7 }),
  core_enrol_get_users_courses: () => MODULOS.map(([n, c], i) => ({ id: i + 1, fullname: n, shortname: c, progress: [62, 48, 55, 70, 40, 30][i] })),
  mod_assign_get_assignments: () => ({ courses: Object.entries(asign).map(([id, a]) => ({ id: +id, assignments: a })) }),
  core_course_get_contents: (p) => [1, 2, 3, 4].map((t) => ({
    name: `Tema ${t}`, summary: `<p>Contenidos del tema ${t}.</p>`,
    modules: [{ id: p.courseid * 100 + t, name: `Apuntes tema ${t}`, modname: 'resource', url: 'https://aules.example/mod/resource/view.php?id=1', contents: [{ type: 'file', filename: `tema${t}.pdf`, fileurl: 'https://aules.example/x?token=SECRETO' }] },
      { id: p.courseid * 100 + t + 50, name: `Cuestionario tema ${t}`, modname: 'quiz', url: 'https://aules.example/mod/quiz/view.php?id=2' }],
  })),
  gradereport_user_get_grade_items: (p) => {
    const it = (asign[p.courseid] || []).map((a) => ({ itemname: a.name, itemtype: 'mod', itemmodule: 'assign', iteminstance: a.id, cmid: a.cmid, graderaw: a._nota, grademax: 10, grademin: 0, gradeformatted: a._nota == null ? '-' : String(a._nota).replace('.', ','), weightformatted: '', feedback: a._nota ? '<p>Buen trabajo.</p>' : '' }));
    const ns = it.filter((i) => i.graderaw != null).map((i) => i.graderaw);
    const media = ns.length ? ns.reduce((a, b) => a + b) / ns.length : null;
    return { usergrades: [{ gradeitems: [...it, { itemtype: 'course', graderaw: media, grademax: 10, gradeformatted: media == null ? '-' : media.toFixed(2) }] }] };
  },
  mod_assign_get_submission_status: (p) => { const a = todas.find((x) => x.id === +p.assignid); return { lastattempt: { submission: { status: a._st, timemodified: a._st === 'new' ? 0 : a.duedate - D } } }; },
  core_calendar_get_action_events_by_timesort: () => ({ events: [
    { name: 'Cuestionario tema 4 se cierra', timesort: H + 4 * D, course: { id: 1 }, modulename: 'quiz', url: 'https://aules.example/mod/quiz/view.php?id=2' },
    { name: 'Examen teórico Bases de Datos', timesort: H + 15 * D, course: { id: 2 }, modulename: 'quiz', url: '' },
  ] }),
};
const recibidos = [];
const srv = http.createServer((req, res) => {
  let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
    const f = new URLSearchParams(b), fn = f.get('wsfunction');
    const p = {}; for (const [k, v] of f) p[k] = v;
    recibidos.push(p);
    res.setHeader('content-type', 'application/json');
    if (f.get('wstoken') !== 'TOKEN-PRUEBA') return res.end(JSON.stringify({ exception: 'x', errorcode: 'invalidtoken', message: 'Token no válido' }));
    res.end(JSON.stringify(resp[fn] ? resp[fn](p) : { exception: 'x', errorcode: 'nofunc', message: 'No disponible: ' + fn }));
  });
}).listen(0);
const URL_AULES = `http://127.0.0.1:${srv.address().port}/fp/course/view.php?id=3`; // URL de una página cualquiera: se normaliza
const run = (token) => promisify(execFile)('node', ['sync/aules.mjs'], { env: { ...process.env, AULES_URL: URL_AULES, AULES_TOKEN: token, CLAVE_MAESTRA: 'demo' } });

await assert.rejects(run('MALO'), /Aules no acepta el token/); // token incorrecto: falla y no publica
const { stdout } = await run('TOKEN-PRUEBA');
srv.close();
assert.match(stdout, /OK: 6 cursos, 18 tareas, 2 eventos, 0 avisos/);
assert.ok(recibidos.some((p) => p['courseids[5]'] === '6'), 'arrays en formato Moodle');
const crudo = await readFile('data/curso.enc', 'utf8');
assert.ok(!crudo.includes('Programación') && !crudo.includes('SECRETO'), 'el fichero publicado va cifrado');
const curso = await descifrar('demo', JSON.parse(crudo));
assert.equal(curso.cursos.length, 6);
assert.ok(!JSON.stringify(curso).includes('SECRETO'), 'no se guardan enlaces con token');
assert.equal(curso.cursos[0].secciones[0].elementos[0].archivos[0].nombre, 'tema1.pdf');
const t4 = curso.cursos[0].tareas[2];
assert.equal(t4.estado, 'draft'); assert.equal(t4.nota, null);
assert.equal(curso.cursos[0].tareas[0].nota, 8.5);
assert.match(curso.cursos[0].tareas[0].enunciado, /^Entrega en Aules la tarea Práctica T2: condicionales\.\n/);

// --- nombres de módulo ---
assert.deepEqual(curso.cursos.map((c) => nombreModulo(c.nombre)), ['Programación', 'Bases de Datos', 'Sistemas Informáticos', 'Lenguajes de Marcas', 'Entornos de Desarrollo', 'Itinerario para la Empleabilidad I']);
assert.equal(nombreModulo("Professional English I- DAM A"), 'Inglés Profesional');
assert.equal(nombreModulo('Projecte intermodular 1 DAM A'), 'Proyecto Intermodular');
assert.equal(nombreModulo('Química aplicada - 1CFSF'), 'Química aplicada');

// --- SQL: troceo, adaptación de MySQL y ejecución real con sql.js ---
const st = sentencias("CREATE TABLE t (a INT); -- coment; no corta\nINSERT INTO t VALUES ('x;y');\n/* ; */ SELECT * FROM t");
assert.equal(st.length, 3); assert.equal(st[1].linea, 2); assert.equal(st[2].linea, 3);
// sql-wasm.js es CommonJS y el paquete es "type": "module": se carga a mano como CommonJS
const modSql = { exports: {} };
new Function('module', 'exports', 'require', '__dirname', '__filename', await readFile('js/vendor/sql-wasm.js', 'utf8'))(modSql, modSql.exports, createRequire(import.meta.url), new URL('./js/vendor', import.meta.url).pathname, 'sql-wasm.js');
const initSqlJs = modSql.exports;
const SQL = await initSqlJs({ locateFile: (f) => new URL('./js/vendor/' + f, import.meta.url).pathname });
const db = new SQL.Database();
const mysql = "CREATE DATABASE tienda;\nUSE tienda;\nCREATE TABLE cliente (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(50)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\nINSERT INTO cliente (nombre) VALUES ('Ana'),('Luis');\nSELECT COUNT(*) FROM cliente;";
let ultimo; for (const x of sentencias(adaptarMysql(mysql))) ultimo = db.exec(x.sql);
assert.equal(ultimo[0].values[0][0], 2, 'el script de MySQL funciona en SQLite');
db.close();
{ // las soluciones de la práctica de SQL funcionan y se comparan bien
  const { BD_PRACTICA, mismoResultado, EJ_SQL } = await import('./js/herramientas.js');
  const db2 = new SQL.Database(); db2.exec(BD_PRACTICA);
  const q = (x) => db2.exec(x)[0];
  assert.ok(mismoResultado(q("SELECT nombre FROM cliente WHERE ciudad = 'Valencia'"), q("SELECT nombre FROM cliente WHERE ciudad LIKE 'Valencia' ORDER BY nombre DESC"), false));
  assert.ok(!mismoResultado(q('SELECT nombre, precio FROM producto WHERE precio < 20 ORDER BY precio DESC'), q('SELECT nombre, precio FROM producto WHERE precio < 20 ORDER BY precio'), true));
  assert.equal(q("SELECT p.nombre FROM linea l JOIN producto p ON p.id = l.id_producto GROUP BY p.id ORDER BY SUM(l.cantidad) DESC LIMIT 1").values[0][0], 'Cuaderno A4');
  assert.equal(q('SELECT COUNT(*) FROM cliente WHERE id NOT IN (SELECT id_cliente FROM pedido)').values[0][0], 1);
  for (const ej of EJ_SQL) assert.ok(q(ej.solucion).values.length > 0, ej.titulo + ' devuelve filas');
  db2.close();
}

// --- HTML ---
assert.deepEqual(revisarHtml('<!DOCTYPE html><html><head><title>a</title></head><body><p>x<li>y</body></html>').map((a) => a.txt), []);
const av = revisarHtml('<html><head></head><body>\n<div><span>hola</div>\n<img src="a.png"></body>').map((a) => a.txt);
assert.ok(av.includes('Falta <!DOCTYPE html> al principio') && av.includes('<span> no se cierra') && av.includes('Hay <img> sin atributo alt'), av.join(' | '));

// --- diagramas ---
assert.deepEqual(columna('PK FK id_cliente'), { pk: true, fk: true, texto: 'id_cliente' });
assert.deepEqual(columna('*autor'), { pk: false, fk: true, texto: 'autor' });
const dg = { notacion: 'er', nodos: [
  { id: 'a', tipo: 'entidad', x: 0, y: 0, texto: 'LIBRO' }, { id: 'b', tipo: 'relacion', x: 200, y: 0, texto: 'escribe', card: 'N:M' },
  { id: 'c', tipo: 'atributo', x: 0, y: 100, texto: 'ISBN', clave: true }, { id: 'd', tipo: 'tabla', x: 400, y: 0, texto: 'AUTOR & <cía>', columnas: 'PK id\nnombre\nFK id_libro' },
], aristas: [{ id: 'e1', de: 'a', a: 'b', estilo: 'doble', etDe: '(1,N)' }, { id: 'e2', de: 'a', a: 'c', estilo: 'linea' }] };
assert.ok(tam(dg.nodos[3]).h >= 32 + 3 * 22);
const xml = aDrawio(dg, 'prueba');
assert.equal((xml.match(/<mxCell /g) || []).length, 2 + 4 + 2 + 1, 'raíz + nodos + aristas + etiqueta');
assert.ok(xml.includes('source="na"') && xml.includes('shape=link'));
await writeFile('/tmp/doodle-prueba.drawio', xml); await writeFile('/tmp/doodle-prueba.svg', svgExportable(dg));
await promisify(execFile)('python3', ['-c', 'import xml.dom.minidom as m; m.parse("/tmp/doodle-prueba.drawio"); m.parse("/tmp/doodle-prueba.svg")']); // XML bien formado

// --- corrección automática de C# con soluciones de referencia ---
{
  const { comprobarCaso } = await import('./js/herramientas.js');
  globalThis.window = globalThis.window || {};
  new Function('window', await readFile('js/csharp.js', 'utf8'))(globalThis.window);
  new Function('window', await readFile('js/pruebas.js', 'utf8'))(globalThis.window);
  const P = globalThis.window.PRUEBAS_CS, run = (src, e) => globalThis.window.CSharp.run(src, e, 1);
  const main = (cuerpo) => `using System;\nclass P { static void Main() {\n${cuerpo}\n} }`;
  const ref = {
    'prog-4.1.1.1': main('int[] a = new int[4]; double s = 0; for (int i = 0; i < 4; i++) { Console.Write("Número {0}: ", i + 1); a[i] = Convert.ToInt32(Console.ReadLine()); s += a[i]; } Console.WriteLine("Media: {0}", s / 4); for (int i = 0; i < 4; i++) Console.Write(a[i] + " ");'),
    'prog-4.1.3.4': main('int[] d = {31,28,31,30,31,30,31,31,30,31,30,31}; Console.Write("Mes: "); int m = Convert.ToInt32(Console.ReadLine()); Console.Write("Día: "); int dia = Convert.ToInt32(Console.ReadLine()); int t = dia; for (int i = 0; i < m - 1; i++) t += d[i]; Console.WriteLine("Es el día número {0} del año", t);'),
    'prog-4.1.3.8': main('double[] v = new double[3]; double s = 0; for (int i = 0; i < 3; i++) { v[i] = Convert.ToDouble(Console.ReadLine()); s += v[i] * v[i]; } Console.WriteLine("Módulo: " + Math.Sqrt(s));'),
    'prog-4.2.5': main('int[,] m = new int[3,3]; for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) m[i,j] = Convert.ToInt32(Console.ReadLine()); int det = m[0,0]*(m[1,1]*m[2,2]-m[1,2]*m[2,1]) - m[0,1]*(m[1,0]*m[2,2]-m[1,2]*m[2,0]) + m[0,2]*(m[1,0]*m[2,1]-m[1,1]*m[2,0]); Console.WriteLine("Determinante: " + det);'),
    'prog-4.4.3.2': main('string f = Console.ReadLine(); for (int i = f.Length - 1; i >= 0; i--) Console.Write(f[i]); Console.WriteLine();'),
    'prog-4.4.4.2': main('string n = Console.ReadLine(); for (int i = 1; i <= n.Length; i++) Console.WriteLine(n.Substring(0, i));'),
    'prog-4.6.1': main('Console.Write("Nombre: "); string n = Console.ReadLine(); string a = Console.ReadLine(); int e = Convert.ToInt32(Console.ReadLine()); Console.WriteLine(n + ", " + a + ", " + e);'),
    'prog-4.7.1': main('double[] v = new double[6]; for (int i = 0; i < 6; i++) v[i] = Convert.ToDouble(Console.ReadLine()); Array.Sort(v); foreach (double x in v) Console.Write(x + " ");'),
    'prog-4.7.2': main('string[] v = new string[5]; for (int i = 0; i < 5; i++) v[i] = Console.ReadLine(); Array.Sort(v); foreach (string x in v) Console.WriteLine(x);'),
  };
  for (const [id, src] of Object.entries(ref)) for (const caso of P[id]) { const r = comprobarCaso(run(src, caso.e), caso); assert.ok(r.ok, id + ': ' + r.motivo + ' · salida: ' + JSON.stringify(r.salida)); }
  // y que un programa mal hecho no pase
  const mal = comprobarCaso(run(main('int[] a = new int[4]; for (int i = 0; i < 4; i++) a[i] = Convert.ToInt32(Console.ReadLine()); Console.WriteLine("Media: " + (a[0]+a[1]+a[2]+a[3]) / 4);'), P['prog-4.1.1.1'][1].e), P['prog-4.1.1.1'][1]);
  assert.ok(!mal.ok && /1,25/.test(mal.motivo), 'división entera detectada: ' + mal.motivo);
  assert.match(comprobarCaso(run(main('Console.ReadLine();'), []), { e: ['x'] }).motivo, /más datos/);
  // lo añadido para los temas 3 y 5: goto, enum, bases, out int x, por defecto y con nombre, args y código de salida
  const sal = (src, e = [], a) => { const r = globalThis.window.CSharp.run(src, e, 1, a); assert.equal(r.status, 'done', r.error); return r.segs.filter((x) => x.t === 'out').map((x) => x.s).join(''); };
  assert.equal(sal(main('int n = 3; switch (n) { case 1: goto case 3; case 3: Console.Write("i"); break; } for (int i = 0; i < 9; i++) if (i == 2) goto fin;\nfin: Console.Write("f");')), 'if');
  assert.equal(sal('using System;\nenum Mes { ENERO = 1, FEBRERO }\nclass P { static void Main() { Mes m = Mes.ENERO; m++; Console.Write(m + " " + (int) m); } }'), 'FEBRERO 2');
  assert.equal(sal(main('Console.Write(Convert.ToString(247, 16) + Convert.ToInt32("1a", 16) + 0b101 + 1_000 + (5).GetType());')), 'f72651000System.Int32');
  assert.equal(sal('using System;\nclass P { static int F(int a, int b = 10, char c = \'*\') { return a + b; } static void D(out int x) { x = 4; } static void Main() { D(out int y); Console.Write("" + F(1) + F(1, c: \'-\', b: 2) + y); } }'), '1134');
  const r5 = globalThis.window.CSharp.run('using System;\nclass P { static int Main(string[] args) { Console.Write(args.Length); Environment.Exit(3); return 0; } }', [], 1, ['a', 'b']);
  assert.equal(r5.exit, 3); assert.equal(r5.segs[0].s, '2');
}

// --- E/R → relacional ---
const { erARelacional } = await import('./js/diagrama.js');
const er = (nodos, aristas) => erARelacional({ notacion: 'er', nodos: nodos.map((n, i) => ({ x: i * 100, y: n.y || 0, ...n })), aristas: aristas.map((a, i) => ({ id: 'e' + i, ...a })) });
let r = er([{ id: 'c', tipo: 'entidad', texto: 'Cliente' }, { id: 'cd', tipo: 'atributo', texto: 'dni', clave: true }, { id: 'cn', tipo: 'atributo', texto: 'nombre' },
  { id: 'r', tipo: 'relacion', texto: 'realiza' }, { id: 'p', tipo: 'entidad', texto: 'Pedido' }, { id: 'pn', tipo: 'atributo', texto: 'num', clave: true }],
  [{ de: 'c', a: 'cd' }, { de: 'c', a: 'cn' }, { de: 'p', a: 'pn' }, { de: 'c', a: 'r', etDe: '(1,1)' }, { de: 'r', a: 'p', etA: '(0,N)' }]);
assert.equal(r.esquema, 'CLIENTE(#dni, nombre)\nPEDIDO(#num, dni → CLIENTE)', r.esquema);
assert.equal(r.diagrama.aristas.length, 1);
r = er([{ id: 'a', tipo: 'entidad', texto: 'ALUMNO' }, { id: 'ad', tipo: 'atributo', texto: 'dni', clave: true }, { id: 'r', tipo: 'relacion', texto: 'cursa', card: 'N:M', y: 50 },
  { id: 'rn', tipo: 'atributo', texto: 'nota' }, { id: 's', tipo: 'entidad', texto: 'ASIGNATURA' }, { id: 'sc', tipo: 'atributo', texto: 'cod', clave: true },
  { id: 'tel', tipo: 'atributo', texto: 'telefono', multivaluado: true }],
  [{ de: 'a', a: 'ad' }, { de: 's', a: 'sc' }, { de: 'a', a: 'r' }, { de: 'r', a: 's' }, { de: 'r', a: 'rn' }, { de: 'a', a: 'tel' }]);
assert.equal(r.esquema, 'ALUMNO(#dni)\nASIGNATURA(#cod)\nALUMNO_TELEFONO(#dni → ALUMNO, #telefono)\nCURSA(#dni → ALUMNO, #cod → ASIGNATURA, nota)', r.esquema);
r = er([{ id: 'e', tipo: 'entidad', texto: 'Edificio' }, { id: 'ec', tipo: 'atributo', texto: 'cod', clave: true }, { id: 'r', tipo: 'relacion-debil', texto: 'tiene' },
  { id: 'au', tipo: 'debil', texto: 'Aula' }, { id: 'an', tipo: 'atributo', texto: 'num', clave: true }],
  [{ de: 'e', a: 'ec' }, { de: 'au', a: 'an' }, { de: 'e', a: 'r' }, { de: 'r', a: 'au' }]);
assert.equal(r.esquema, 'EDIFICIO(#cod)\nAULA(#num, #cod → EDIFICIO)', r.esquema);

// --- Java: el mini JUnit y el lanzador con un javac real ---
const { LIB_JAVA } = await import('./js/herramientas.js');
const dir = '/tmp/doodle-java'; await rm(dir, { recursive: true, force: true });
for (const [ruta, src] of Object.entries(LIB_JAVA)) { await mkdir(dir + '/src/' + ruta.replace(/\/[^/]+$/, ''), { recursive: true }); await writeFile(dir + '/src/' + ruta, src); }
await writeFile(dir + '/src/Calc.java', 'public class Calc { static int suma(int a, int b){ return a + b; } public static void main(String[] x){ java.util.Scanner s = new java.util.Scanner(System.in); System.out.println("Hola " + s.nextLine()); System.out.println(s.nextInt() * 2); } }');
await writeFile(dir + '/src/CalcTest.java', 'import org.junit.jupiter.api.*; import static org.junit.jupiter.api.Assertions.*; public class CalcTest { int base; @BeforeEach void antes(){ base = 1; } @Test void bien(){ assertEquals(3, Calc.suma(base, 2)); } @Test void mal(){ assertEquals(5, Calc.suma(2, 2), "suma"); } @Test void lanza(){ assertThrows(ArithmeticException.class, () -> { int z = 1 / 0; }); } }');
await writeFile(dir + '/src/ViejoTest.java', 'import org.junit.*; public class ViejoTest { @Test(expected = IllegalStateException.class) public void excepcion(){ throw new IllegalStateException(); } @Test public void nulo(){ Assert.assertNull(null); } }');
const { stdout: fuentes } = await promisify(execFile)('find', [dir + '/src', '-name', '*.java']);
await promisify(execFile)('javac', ['--release', '8', '-nowarn', '-encoding', 'UTF-8', '-d', dir + '/out', ...fuentes.trim().split('\n')]);
await mkdir('/str', { recursive: true }); await writeFile('/str/doodle-entrada.txt', 'Fran\n21\n');
// el mini JUnit y el lanzador van precompilados en un jar que carga la web
await rm(dir + '/lib', { recursive: true, force: true });
await promisify(execFile)('javac', ['--release', '8', '-nowarn', '-encoding', 'UTF-8', '-d', dir + '/lib', ...fuentes.trim().split('\n').filter((f) => /\/src\/(org|doodle)\//.test(f))]);
await promisify(execFile)('jar', ['cf', 'js/vendor/doodle-lib.jar', '-C', dir + '/lib', '.']);
const java = (...a) => promisify(execFile)('java', ['-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8', '-cp', dir + '/out', 'doodle.Lanzador', ...a]).then((r) => r.stdout);
assert.match(await java('Calc'), /^Hola Fran\n42\n\u0000FIN/);
const salTests = await java('--tests', 'CalcTest', 'ViejoTest');
assert.match(salTests, /\u0000OK CalcTest\.bien/); assert.match(salTests, /\u0000OK CalcTest\.lanza/); assert.match(salTests, /\u0000OK ViejoTest\.excepcion/);
assert.match(salTests, /\u0000MAL CalcTest\.mal\u0001suma ==> esperado <5> pero fue <4>/);
assert.match(salTests, /\u0000RESUMEN 4 1/);
await writeFile('/str/doodle-entrada.txt', '');
assert.match(await java('Calc'), /pidió más datos/);

// --- lector de temas (con líneas inventadas: los PDF de verdad no se guardan aquí) ---
{
  let y = 800, p = 1;
  const L = (s, mono = false, x = 85, gap = 17) => ({ p, y: (y -= gap), x, mono, cw: 5.5, s });
  const lineas = [
    L('9. Tema de prueba'), L('9.1. Primer apartado'), L('9.1.1. Un apartado con título'), L('partido en dos'),
    L('// Ejemplo_09_01_01a.cs', true), L('// Saludo de prueba', true), L('// Introducción a C#, por Nacho Cabanes', true),
    L('using System;', true), L('class A', true), L('{', true), L('static void Main()', true, 107), L('{', true, 107),
    L('Console.WriteLine("{0} }", 1);', true, 129), L('}', true, 107), L('}', true),
    L('Así se ve el resultado.'), L('Ejercicios propuestos:'),
    L('(9.1.1.1) Crea una variante del ejemplo 09_01_01a que salude'), L('dos veces.'),
    L('(9.1.1.2) Amplía el ejercicio 9.1.1.1 con un "Saludar".'),
    L('Texto de teoría que no es del ejercicio.', false, 85, 52),
    L('9.1.2. structs anidados'), L('Ejercicios propuestos:'), L('Si has estudiado álgebra:'),
    L('(9.1.2.1) Usa la función "Saludar" del ejercicio 9.1.5.'),
  ];
  const t = parsearTema(lineas);
  assert.equal(t.num, 9); assert.equal(t.apartados[1].titulo, 'Un apartado con título partido en dos');
  assert.equal(t.ejemplos[0].id, 'Ejemplo_09_01_01a'); assert.equal(t.ejemplos[0].titulo, 'Saludo de prueba');
  assert.equal(t.ejemplos[0].codigo, 'using System;\nclass A\n{\n    static void Main()\n    {\n        Console.WriteLine("{0} }", 1);\n    }\n}');
  assert.deepEqual(t.ejercicios.map((e) => e.texto), ['Crea una variante del ejemplo 09_01_01a que salude dos veces.', 'Amplía el ejercicio 9.1.1.1 con un "Saludar".', 'Usa la función "Saludar" del ejercicio 9.1.5.']);
  assert.equal(t.ejercicios[2].grupo, '9.1 Primer apartado · 9.1.2 structs anidados · Si has estudiado álgebra');
  const c = montarCatalogo([], [t]);
  assert.deepEqual(c.ejercicios[0].citados, ['Ejemplo_09_01_01a']);
  assert.deepEqual(c.ejercicios[1].refs, ['prog-9.1.1.1']);
  assert.deepEqual(c.ejercicios[2].refs, ['prog-9.1.1.2']); // cita un número que no existe: se resuelve por la función entre comillas
  assert.deepEqual(c.sinResolver, []);
  assert.equal(llaves('if (a) { s = "{"; c = \'}\'; } // {'), 0);
}

await writeFile('js/demo.js', '// Datos de ejemplo (generados por test.js con un Aules simulado). La web desplaza las fechas al día de hoy.\nwindow.DEMO = ' + JSON.stringify(curso) + ';\n');
console.log('Todas las pruebas OK · js/demo.js regenerado');
