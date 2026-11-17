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
    <div class="barra-lab"><button type="button" class="boton principal" data-cs="ejecutar">▶ Ejecutar</button>${pruebas ? `<button type="button" class="boton" data-cs="comprobar">Comprobar (${pruebas.length} prueba${pruebas.length === 1 ? '' : 's'})</button>` : ''}<label class="cs-args" hidden><span class="suave">Argumentos</span><input type="text" placeholder="p. ej. 3 4" autocomplete="off" spellcheck="false" aria-label="Argumentos de la línea de comandos (args)"></label><button type="button" class="boton mini sutil" data-cs="reiniciar" title="Borra tu código y vuelve a la plantilla">Empezar de cero</button></div>
    <div class="editor"><div class="cod-cab"><span class="cod-fichero">Program.cs</span><span class="atajo"><kbd>Ctrl</kbd> + <kbd>Intro</kbd> ejecuta</span><span class="estado-guardado" aria-live="polite"></span></div></div>
    <div class="consola-caja"><div class="con-cab"><span>Consola</span><button type="button" data-cs="limpiar">Limpiar</button></div><div class="consola" tabindex="-1" aria-label="Consola del programa"><span class="vacia">Pulsa Ejecutar para lanzar el programa.</span></div></div>
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
  const vaciar = () => { consola.innerHTML = '<span class="vacia">Pulsa Ejecutar para lanzar el programa.</span>'; lugar.textContent = ''; ed.limpiar(); };
  cont.querySelector('[data-cs=limpiar]').addEventListener('click', vaciar);
  // borrar el código pide una segunda pulsación (sin ventanas de confirmación)
  const br = cont.querySelector('[data-cs=reiniciar]'); let armado = 0;
  br.addEventListener('click', () => {
    if (!armado) { br.textContent = '¿Seguro? Pulsa otra vez'; br.classList.add('peligro'); armado = setTimeout(() => { armado = 0; br.textContent = 'Empezar de cero'; br.classList.remove('peligro'); }, 3000); return; }
    clearTimeout(armado); armado = 0; br.textContent = 'Empezar de cero'; br.classList.remove('peligro');
    ed.set(PLANTILLA); verArgs(PLANTILLA); alCambiar({ codigo: PLANTILLA }); estado.textContent = estadoGuardado(); vaciar(); ed.foco();
  });
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

// ---------- a la izquierda del editor: enunciado y chuleta de C# en pestañas (Doodle y Repaso) ----------
const TOK = /(\/\/[^\n]*)|(\$?@?"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(\d+(?:\.\d+)?)\b|\b(using|class|static|void|public|private|int|double|float|string|char|bool|long|decimal|var|if|else|switch|case|default|break|continue|for|foreach|in|while|do|return|new|true|false|null|const|ref|out|struct|enum|try|catch|finally|throw|params)\b|\b(Console|Convert|Math|Random|String|Array|Char|Int32|Double|DateTime|Exception|FormatException|StringSplitOptions)\b/g;
export function resaltar(src) {
  let out = '', i = 0;
  for (const m of String(src).matchAll(TOK)) {
    out += esc(src.slice(i, m.index)) + `<span class="sx-${m[1] ? 'com' : m[2] ? 'str' : m[3] ? 'num' : m[4] ? 'kw' : 'ty'}">${esc(m[0])}</span>`;
    i = m.index + m[0].length;
  }
  return out + esc(src.slice(i));
}
const conCodigo = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
const sinAcentos = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const numTema = (s) => (String(s || '').match(/Tema\s*(\d+)/i) || [])[1] || '';

// La primera prueba de «Comprobar», contada como ejemplo para probarlo a mano.
export function ejemploPrueba(pruebas) {
  const p = (pruebas || [])[0]; if (!p) return '';
  const como = p.codigo ? `Se llama así: <code>${esc(p.codigo)}</code>` : p.args ? `Con los argumentos <code>${esc(p.args.join(' ') || '(ninguno)')}</code>` : (p.e || []).length ? `Si escribes ${p.e.map((x) => `<kbd>${esc(x)}</kbd>`).join(' ⏎ ')}` : 'Sin escribir nada';
  const debe = [...(p.n || []).map((v) => String([].concat(v)[0]).replace('.', ',')), ...(p.t || []).map((t) => [].concat(t)[0])];
  return `<div class="lab-prueba"><b>Para probarlo</b><p>${como}${debe.length ? `, debería mostrar ${debe.map((x) => `<code>${esc(x)}</code>`).join(', ')}${p.orden && debe.length > 1 ? ', en ese orden' : ''}` : ''}.</p></div>`;
}

export function montarLado(cont, enunciado, { tema = '' } = {}) {
  const hay = Array.isArray(window.CHULETA) && window.CHULETA.length;
  cont.innerHTML = `${hay ? `<div class="lado-tabs" role="tablist" aria-label="Enunciado o chuleta">
      <button type="button" role="tab" data-lado="enun" aria-selected="true">Enunciado</button><button type="button" role="tab" data-lado="chuleta" aria-selected="false">Chuleta de C#</button></div>` : ''}
    <div class="lado-enun">${enunciado}</div>
    ${hay ? `<div class="lado-chuleta" hidden><input type="search" class="chu-q" placeholder="Busca: switch, Substring, ref…" autocomplete="off" aria-label="Buscar en la chuleta">
      <div class="chu-temas" role="group" aria-label="Tema"><span>Tema</span>${['', ...window.CHULETA.map((tm) => numTema(tm.tema))].map((n) => `<button type="button" data-t="${n}" aria-pressed="false">${n || 'Todos'}</button>`).join('')}</div>
      <div class="chu-lista"></div></div>` : ''}`;
  if (!hay) return { ver() {} };
  const q = cont.querySelector('.chu-q'), lista = cont.querySelector('.chu-lista');
  let t = window.CHULETA.some((tm) => numTema(tm.tema) === String(tema)) ? String(tema) : '';
  const pintar = () => {
    for (const b of cont.querySelectorAll('.chu-temas button')) b.setAttribute('aria-pressed', b.dataset.t === t);
    const k = sinAcentos(q.value).split(/\s+/).filter(Boolean), abierta = k.length > 0;
    const temas = window.CHULETA.filter((tm) => !t || numTema(tm.tema) === t).map((tm) => ({ tema: tm.tema, fichas: tm.fichas.filter((f) => { const x = sinAcentos([tm.tema, f.t, f.d, f.c].join(' ')); return k.every((p) => x.includes(p)); }) })).filter((tm) => tm.fichas.length);
    lista.innerHTML = temas.length ? temas.map((tm) => `<section><h4>${esc(tm.tema)}</h4>${tm.fichas.map((f, i) => `<details class="chu-ficha" ${abierta ? 'open' : ''}><summary>${esc(f.t)}</summary><p>${conCodigo(f.d)}</p>
        ${f.c ? `<div class="chu-cod"><pre>${resaltar(f.c)}</pre><button type="button" class="chu-copiar" data-i="${esc(tm.tema)}|${i}">Copiar</button></div>` : ''}</details>`).join('')}</section>`).join('')
      : `<p class="suave">Nada coincide${t ? ' en este tema. Prueba en «Todos»' : '. Prueba con otra palabra'}.</p>`;
  };
  const ver = (lado) => {
    for (const b of cont.querySelectorAll('.lado-tabs button')) b.setAttribute('aria-selected', b.dataset.lado === lado);
    cont.querySelector('.lado-enun').hidden = lado !== 'enun'; cont.querySelector('.lado-chuleta').hidden = lado !== 'chuleta';
    cont.classList.toggle('con-chuleta', lado === 'chuleta');
    if (lado === 'chuleta') { if (!lista.innerHTML) pintar(); q.focus({ preventScroll: true }); }
  };
  cont.addEventListener('click', (ev) => {
    const b = ev.target.closest('button'); if (!b || !cont.contains(b)) return;
    if (b.dataset.lado) ver(b.dataset.lado);
    else if (b.dataset.t !== undefined) { t = b.dataset.t; pintar(); }
    else if (b.classList.contains('chu-copiar')) {
      const [tm, i] = b.dataset.i.split('|'), f = window.CHULETA.find((x) => x.tema === tm).fichas[+i];
      (navigator.clipboard ? navigator.clipboard.writeText(f.c) : Promise.reject()).then(() => { b.textContent = 'Copiado ✓'; }, () => { b.textContent = 'No se pudo copiar'; })
        .finally(() => setTimeout(() => { b.textContent = 'Copiar'; }, 1600));
    }
  });
  q.addEventListener('input', pintar);
  return { ver };
}
