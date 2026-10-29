// Prueba del robot contra un Aules simulado + cifrado. Además regenera js/demo.js (datos de ejemplo de la web).
// Uso: node test.js
import http from 'node:http';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { cifrar, descifrar } from './js/cripto.js';

// --- cifrado ---
const sobre = await cifrar('clave', { a: 'ñ€', n: [1, 2] });
assert.deepEqual(await descifrar('clave', sobre), { a: 'ñ€', n: [1, 2] });
await assert.rejects(descifrar('otra', sobre));

// --- Aules simulado ---
const H = Math.floor(Date.now() / 1000), D = 86400;
const MODULOS = [
  ['Programación', '0485'], ['Bases de Datos', '0484'], ['Sistemas Informáticos', '0483'],
  ['Lenguajes de Marcas y Sistemas de Gestión de Información', '0373'], ['Entornos de Desarrollo', '0487'], ['Itinerario Personal para la Empleabilidad I', '1709'],
];
const TAREAS = {
  1: [['Práctica T2: condicionales', -30, 8.5], ['Práctica T3: bucles', -16, 7.25], ['Práctica T4: arrays y structs', 3, null, 'draft'], ['Examen práctico T1-T3', -9, 6.8]],
  2: [['Modelo E/R: biblioteca', -20, 9], ['Paso a modelo relacional', 5, null], ['Normalización', 12, null]],
  3: [['Instalación de Windows Server', -12, 7], ['Scripts en Bash', 1, null, 'submitted']],
  4: [['XML bien formado', -18, 10], ['DTD de una agenda', -2, null, 'new'], ['XSD', 9, null]],
  5: [['Instalación de VS Code y Git', -25, 8], ['Depuración paso a paso', 6, null]],
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
  core_enrol_get_users_courses: () => MODULOS.map(([n, c], i) => ({ id: i + 1, fullname: `${c} - ${n}`, shortname: c, progress: [62, 48, 55, 70, 40, 30][i] })),
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

await assert.rejects(run('MALO'), /Token no válido/); // token incorrecto: falla y no publica
const { stdout } = await run('TOKEN-PRUEBA');
srv.close();
assert.match(stdout, /OK: 6 cursos, 15 tareas, 2 eventos, 0 avisos/);
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

await writeFile('js/demo.js', '// Datos de ejemplo (generados por test.js con un Aules simulado). La web desplaza las fechas al día de hoy.\nwindow.DEMO = ' + JSON.stringify(curso) + ';\n');
console.log('Todas las pruebas OK · js/demo.js regenerado');
