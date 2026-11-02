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
const java = (...a) => promisify(execFile)('java', ['-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8', '-cp', dir + '/out', 'doodle.Lanzador', ...a]).then((r) => r.stdout);
assert.match(await java('Calc'), /^Hola Fran\n42\n\u0000FIN/);
const salTests = await java('--tests', 'CalcTest', 'ViejoTest');
assert.match(salTests, /\u0000OK CalcTest\.bien/); assert.match(salTests, /\u0000OK CalcTest\.lanza/); assert.match(salTests, /\u0000OK ViejoTest\.excepcion/);
assert.match(salTests, /\u0000MAL CalcTest\.mal\u0001suma ==> esperado <5> pero fue <4>/);
assert.match(salTests, /\u0000RESUMEN 4 1/);
await writeFile('/str/doodle-entrada.txt', '');
assert.match(await java('Calc'), /pidió más datos/);

await writeFile('js/demo.js', '// Datos de ejemplo (generados por test.js con un Aules simulado). La web desplaza las fechas al día de hoy.\nwindow.DEMO = ' + JSON.stringify(curso) + ';\n');
console.log('Todas las pruebas OK · js/demo.js regenerado');
