// Sincronización desde la línea de comandos (por ejemplo, desde tu PC con una tarea programada).
// Normalmente no hace falta: la web sincroniza sola desde tu navegador.
// Uso: AULES_URL=... AULES_TOKEN=... CLAVE_MAESTRA=... node sync/aules.mjs  → escribe data/curso.enc
import { writeFile, mkdir } from 'node:fs/promises';
import { cifrar } from '../js/cripto.js';
import { descargarAules } from '../js/aules.js';

const { AULES_URL, AULES_TOKEN, CLAVE_MAESTRA } = process.env;
if (!AULES_URL || !AULES_TOKEN || !CLAVE_MAESTRA) { console.error('Faltan AULES_URL, AULES_TOKEN o CLAVE_MAESTRA'); process.exit(1); }

try {
  const curso = await descargarAules(AULES_URL, AULES_TOKEN);
  await mkdir('data', { recursive: true });
  await writeFile('data/curso.enc', JSON.stringify(await cifrar(CLAVE_MAESTRA, curso)));
  console.log(`OK: ${curso.cursos.length} cursos, ${curso.cursos.reduce((n, c) => n + c.tareas.length, 0)} tareas, ${curso.eventos.length} eventos, ${curso.avisos.length} avisos`);
  for (const a of curso.avisos) console.log('aviso:', a);
} catch (e) { console.error(e.message); process.exit(1); }
