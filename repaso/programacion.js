// Programación para cada lector: el banco de ejercicios para el examen (los de js/ejercicios.js con «siempre»),
// con el mismo laboratorio de C# que Doodle (Ejecutar y Comprobar). El código y lo superado de cada uno se guarda
// con sus datos (D.prog), cifrado como el resto. Usa lo de publico.js: $, esc, ico, D, guardar.
import { montarCsharp } from '../js/laboratorio.js';

const ejercicios = () => (window.EJERCICIOS || []).filter((m) => m.siempre && m.lenguaje === 'csharp').flatMap((m) => m.ejercicios);
const prog = () => (D.prog ||= {});
const titulo = (e) => e.texto.split(':')[0];
let abierto = null; // id del ejercicio abierto

const resto = (e) => e.texto.slice(e.texto.indexOf(':') + 1).trim();
const SUPERADO = '<span class="chip ok">✓ Superado</span>';

function lista() {
  const L = ejercicios(), hechos = L.filter((e) => prog()[e.id]?.ok).length, temas = [...new Set(L.map((e) => e.grupo))];
  const estado = (e) => (prog()[e.id]?.ok ? SUPERADO : prog()[e.id]?.c ? '<span class="chip">Empezado</span>' : '');
  let i = 0;
  return `<div class="prog-cab"><div><h2>Banco de ejercicios para el examen</h2><p class="suave">C# de los temas 1 a 5. Escribe el programa, pruébalo con «Ejecutar» y pulsa «Comprobar» para corregirlo. Se guarda solo.</p></div>
    <div class="anillo peq" style="--p:${L.length ? (hechos / L.length) * 100 : 0};--c:var(--acento)" role="img" aria-label="${hechos} de ${L.length} superados"><b>${hechos}/${L.length}<small>superados</small></b></div></div>
    ${temas.map((t) => { const del = L.filter((e) => e.grupo === t); return `<section class="prog-tema"><h3>${esc(t)}<small>${del.filter((e) => prog()[e.id]?.ok).length} de ${del.length}</small></h3><div class="prog-lista">${del.map((e) => `
      <button type="button" class="prog-ej${prog()[e.id]?.ok ? ' hecho' : ''}" data-ej="${esc(e.id)}" style="--i:${i++}"><span class="prog-n">${esc(e.n)}</span><span class="prog-t">${esc(titulo(e))}</span>${estado(e)}<span class="prog-ir" aria-hidden="true">›</span></button>`).join('')}</div></section>`; }).join('')}`;
}

function ejercicio(id) {
  const L = ejercicios(), i = L.findIndex((e) => e.id === id), e = L[i], pruebas = (window.PRUEBAS_CS || {})[id];
  $('s-prog').innerHTML = `<div class="prog-barra"><button type="button" class="boton mini" data-prog="lista">← Todos los ejercicios</button>
      <span class="suave">${i + 1} de ${L.length}</span>
      ${L[i + 1] ? `<button type="button" class="boton mini" data-ej="${esc(L[i + 1].id)}">Siguiente: ${esc(L[i + 1].n)} →</button>` : '<span></span>'}</div>
    <article class="prog-lab"><div class="prog-info"><span class="antetitulo">${esc(e.grupo)}</span>
      <h2><span class="prog-n">${esc(e.n)}</span>${esc(titulo(e))}</h2><span class="prog-estado">${prog()[id]?.ok ? SUPERADO : ''}</span>
      <p class="prog-enun">${esc(resto(e))}</p>${pruebas ? '' : '<p class="suave">Este no tiene «Comprobar» (su resultado es aleatorio o depende de un menú): pruébalo tú con «Ejecutar».</p>'}</div>
      <div class="prog-trabajo"></div></article>`;
  const h = montarCsharp($('s-prog').querySelector('.prog-trabajo'), { codigo: prog()[id]?.c }, ({ codigo }) => { prog()[id] = { ...prog()[id], c: codigo, u: Date.now() }; guardar(); }, pruebas,
    () => { prog()[id] = { ...prog()[id], ok: true, u: Date.now() }; guardar(); $('s-prog').querySelector('.prog-estado').innerHTML = SUPERADO; }, () => 'Guardado');
  scrollTo({ top: 0 });
  h.foco();
}

function ver(id = abierto) {
  abierto = id;
  if (id) return ejercicio(id);
  $('s-prog').innerHTML = lista();
}
$('s-prog').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-ej], [data-prog]'); if (!b) return;
  ver(b.dataset.ej || null);
});
// publico.js la llama al abrir la sección y al traer datos de otro dispositivo (solo repinta la lista: no pisa el editor)
window.verProgramacion = (soloLista) => { if (!soloLista || !abierto) ver(); };
