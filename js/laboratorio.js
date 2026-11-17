// Laboratorio de C#: el editor con «Ejecutar» y «Comprobar» sobre el simulador (js/csharp.js, temas 1 a 5).
// Lo usan Doodle y la página de Repaso de los lectores. Necesita window.CSharpFactory (js/csharp.js) cargado antes.
import { crearEditor, comprobarCaso, conMainDePrueba } from './herramientas.js';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// C#: el simulador (temas 1 a 5) en un Worker, para que un bucle infinito no congele la página.
let worker = null, workerRoto = false, cola = Promise.resolve();
function crearWorker() {
  if (workerRoto || typeof Worker === 'undefined' || typeof window.CSharpFactory !== 'function') return null;
  try {
    const codigo = '(' + window.CSharpFactory.toString() + ')(self);\nself.onmessage = function (e) { self.postMessage(self.CSharp.run(e.data.src, e.data.inputs, e.data.seed, e.data.args)); };';
    return new Worker(URL.createObjectURL(new Blob([codigo], { type: 'text/javascript' })));
  } catch (e) { workerRoto = true; return null; }
}
function simular(req) {
  cola = cola.then(() => new Promise((resolve) => {
    if (!worker) worker = crearWorker();
    if (!worker) { resolve(window.CSharp.run(req.src, req.inputs, req.seed, req.args)); return; }
    let fin = false;
    const terminar = (r) => { if (fin) return; fin = true; clearTimeout(reloj); resolve(r); };
    const reloj = setTimeout(() => { worker.terminate(); worker = null; terminar({ status: 'halt', segs: [], error: 'El programa ha tardado demasiado y se ha detenido.' }); }, 15000);
    worker.onmessage = (e) => terminar(e.data);
    worker.onerror = (ev) => { if (ev && ev.preventDefault) ev.preventDefault(); worker = null; workerRoto = true; terminar(window.CSharp.run(req.src, req.inputs, req.seed, req.args)); };
    worker.postMessage(req);
  }));
  return cola;
}
export const PLANTILLA = 'using System;\n\nclass Program {\n\tpublic static void Main() {\n\t\t\n\t}\n}\n';
export function montarCsharp(cont, datos, alCambiar, pruebas, alAprobar, estadoGuardado = () => 'Guardado') {
  cont.innerHTML = `<div class="hz hz-cs">
    <div class="barra-lab"><button type="button" class="boton principal" data-cs="ejecutar">▶ Ejecutar</button>${pruebas ? `<button type="button" class="boton" data-cs="comprobar">Comprobar (${pruebas.length} prueba${pruebas.length === 1 ? '' : 's'})</button>` : ''}<label class="cs-args" hidden><span class="suave">Argumentos</span><input type="text" placeholder="p. ej. 3 4" autocomplete="off" spellcheck="false" aria-label="Argumentos de la línea de comandos (args)"></label><span class="suave atajo">Ctrl + Intro ejecuta. Admite lo visto hasta el tema 5.</span><span class="estado-guardado" aria-live="polite"></span></div>
    <div class="editor"></div>
    <div class="consola" tabindex="-1" aria-label="Consola del programa"><span class="vacia">Pulsa Ejecutar para lanzar el programa.</span></div>
    <div class="cs-aviso" aria-live="polite"></div></div>`;
  const estado = cont.querySelector('.estado-guardado'), btn = cont.querySelector('[data-cs]'), consola = cont.querySelector('.consola'), lugar = cont.querySelector('.cs-aviso');
  let entradas = [], semilla = 1, ocupado = false;
  // si Main recibe string[] args, aparece una casilla para escribir los argumentos de la línea de comandos
  const cajaArgs = cont.querySelector('.cs-args'), inArgs = cajaArgs.querySelector('input');
  const verArgs = (v) => { cajaArgs.hidden = !/Main\s*\(\s*string\s*\[\s*\]/.test(v); };
  const args = () => (cajaArgs.hidden ? [] : (inArgs.value.match(/"[^"]*"|\S+/g) || []).map((x) => x.replace(/^"|"$/g, '')));
  const ed = crearEditor(cont.querySelector('.editor'), (datos && datos.codigo) || PLANTILLA, {
    modo: 'text/x-csharp', etiqueta: 'Código C#', alEjecutar: () => lanzar([]),
    alCambiar: (v) => { verArgs(v); alCambiar({ codigo: v }); estado.textContent = estadoGuardado(); },
  });
  async function lanzar(ent, misma) {
    if (ocupado) return; ocupado = true; btn.disabled = true;
    if (!misma) semilla = Math.floor(Math.random() * 1e9);
    entradas = ent.slice();
    const r = await simular({ src: ed.get(), inputs: entradas, seed: semilla, args: args() });
    ocupado = false; btn.disabled = false; pintar(r);
  }
  verArgs(ed.get());
  function pintar(r) {
    consola.textContent = ''; ed.limpiar(); lugar.textContent = '';
    for (const s of r.segs) { const p = document.createElement('pre'); if (s.t !== 'out') p.className = 'tecleado'; p.textContent = s.s; consola.append(p); }
    const aviso = document.createElement('div');
    if (r.status === 'input') {
      const inp = document.createElement('input'); inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false; inp.setAttribute('aria-label', 'Escribe la respuesta y pulsa Intro');
      consola.append(inp);
      inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); lanzar(entradas.concat([inp.value]), true); } });
      aviso.className = 'aviso espera'; aviso.textContent = 'El programa espera a que escribas en la consola y pulses Intro.';
      lugar.append(aviso); consola.scrollTop = consola.scrollHeight; inp.focus({ preventScroll: true });
      return;
    }
    if (!r.segs.length) { const v = document.createElement('span'); v.className = 'vacia'; v.textContent = r.status === 'compile' ? 'No se ha ejecutado porque el programa tiene un error.' : '(el programa no ha escrito nada)'; consola.append(v); }
    consola.scrollTop = consola.scrollHeight;
    if (r.status === 'done') { aviso.className = 'aviso ok'; aviso.textContent = 'Programa terminado' + (r.exit !== undefined && r.exit !== null ? ' con el código ' + r.exit + (r.exit === 0 ? ' (sin errores)' : '') : '') + '.'; lugar.append(aviso); return; }
    aviso.className = 'aviso error';
    const b = document.createElement('b');
    b.textContent = (r.status === 'compile' ? 'Error de compilación en la línea ' + r.line : r.status === 'exception' ? 'El programa se ha parado en la línea ' + r.line : 'Programa detenido' + (r.line ? ' (línea ' + r.line + ')' : '')) + (r.code && r.code !== 'SIM' ? ' (' + r.code + ')' : '');
    const m = document.createElement('span'); m.textContent = r.error;
    aviso.append(b, m);
    if (r.line) { const ir = document.createElement('button'); ir.type = 'button'; ir.className = 'boton mini'; ir.textContent = 'Ir a la línea ' + r.line; ir.addEventListener('click', () => ed.ir(r.line)); aviso.append(ir); ed.marcar(r.line); }
    lugar.append(aviso);
  }
  btn.addEventListener('click', () => lanzar([]));
  const bc = cont.querySelector('[data-cs=comprobar]');
  if (bc) bc.addEventListener('click', async () => {
    bc.disabled = true; lugar.textContent = '';
    const res = [];
    for (const p of pruebas) {
      const caso = { e: [], ...p };
      res.push({ caso, ...comprobarCaso(await simular({ src: caso.codigo ? conMainDePrueba(ed.get(), caso.codigo) : ed.get(), inputs: caso.e, seed: 1, args: caso.args || [] }), caso) });
    }
    bc.disabled = false;
    const bien = res.filter((x) => x.ok).length, todo = bien === res.length;
    lugar.innerHTML = `<div class="aviso ${todo ? 'ok' : 'error'}"><b>${todo ? 'Todas las pruebas pasan' : `${bien} de ${res.length} pruebas pasan`}</b>
      <ul class="pruebas">${res.map((x) => `<li class="${x.ok ? 'ok' : 'mal'}">${x.ok ? '✓' : '✗'} ${x.caso.codigo ? 'Prueba: <code>' + esc(x.caso.codigo) + '</code>' : x.caso.args ? 'Argumentos: <code>' + esc(x.caso.args.join(' ') || '(ninguno)') + '</code>' : x.caso.e.length ? 'Entrada: <code>' + esc(x.caso.e.join(' ⏎ ')) + '</code>' : 'Sin datos de entrada'}${x.ok ? '' : `<br><span>${esc(x.motivo)}</span>`}</li>`).join('')}</ul></div>`;
    if (todo && alAprobar) alAprobar();
  });
  return { foco: () => ed.foco(), get: () => ed.get(), poner: (v) => { ed.set(v); verArgs(v); alCambiar({ codigo: v }); } };
}
