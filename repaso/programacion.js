// Programación para cada lector: el banco de ejercicios para el examen (los de js/ejercicios.js con «siempre»),
// con el mismo laboratorio de C# que Doodle (Ejecutar y Comprobar). El código y lo superado de cada uno se guarda
// con sus datos (D.prog), cifrado como el resto. Usa lo de publico.js: $, esc, ico, D, guardar.
import { montarCsharp } from '../js/laboratorio.js';

const ejercicios = () => (window.EJERCICIOS || []).filter((m) => m.siempre && m.lenguaje === 'csharp').flatMap((m) => m.ejercicios);
const prog = () => (D.prog ||= {});
const titulo = (e) => e.texto.split(':')[0];
let abierto = null; // id del ejercicio abierto

function lista() {
  const L = ejercicios(), hechos = L.filter((e) => prog()[e.id]?.ok).length, temas = [...new Set(L.map((e) => e.grupo))];
  const estado = (e) => (prog()[e.id]?.ok ? '<span class="chip ok">✓ Superado</span>' : prog()[e.id]?.c ? '<span class="chip">Empezado</span>' : '');
  return `<div class="prog-cab"><div><h2>Banco de ejercicios para el examen</h2><p class="suave">C# de los temas 1 a 5. Escribe el programa, pruébalo con «Ejecutar» y pulsa «Comprobar» para corregirlo. Se guarda solo.</p></div>
    <div class="progreso"><span>${hechos} de ${L.length} superados</span><div class="barra-p"><i style="width:${L.length ? (hechos / L.length) * 100 : 0}%"></i></div></div></div>
    ${temas.map((t) => `<section class="prog-tema"><h3>${esc(t)}</h3><div class="prog-lista">${L.filter((e) => e.grupo === t).map((e) => `
      <button type="button" class="prog-ej" data-ej="${esc(e.id)}"><span class="prog-n">${esc(e.n)}</span><span class="prog-t">${esc(titulo(e))}</span>${estado(e)}<span class="prog-ir" aria-hidden="true">›</span></button>`).join('')}</div></section>`).join('')}`;
}

function ejercicio(id) {
  const L = ejercicios(), i = L.findIndex((e) => e.id === id), e = L[i], pruebas = (window.PRUEBAS_CS || {})[id];
  $('s-prog').innerHTML = `<div class="prog-barra"><button type="button" class="boton mini" data-prog="lista">← Todos los ejercicios</button>
      ${L[i + 1] ? `<button type="button" class="boton mini" data-ej="${esc(L[i + 1].id)}">Siguiente: ${esc(L[i + 1].n)} →</button>` : ''}</div>
    <article class="prog-lab"><span class="antetitulo">${esc(e.grupo)} · Ejercicio ${esc(e.n)}</span>
      <p class="prog-enun">${esc(e.texto)}</p>${pruebas ? '' : '<p class="suave">Este no tiene «Comprobar» (su resultado es aleatorio o depende de un menú): pruébalo tú con «Ejecutar».</p>'}
      <div class="prog-trabajo"></div></article>`;
  const h = montarCsharp($('s-prog').querySelector('.prog-trabajo'), { codigo: prog()[id]?.c }, ({ codigo }) => { prog()[id] = { ...prog()[id], c: codigo, u: Date.now() }; guardar(); }, pruebas,
    () => { prog()[id] = { ...prog()[id], ok: true, u: Date.now() }; guardar(); }, () => 'Guardado');
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
