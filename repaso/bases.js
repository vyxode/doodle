// Bases de datos para cada lector: las mismas lecciones y el mismo banco de E/R → relacional que Doodle (js/bbdd.js).
// Lo que hace cada uno (lecciones vistas, sus diagramas y sus tablas) va en D.bbdd, cifrado y sincronizado como el resto.
// Usa lo de publico.js: $, D y guardar.
import { montarBbdd } from '../js/bbdd.js';

let sub = '';
function ver() {
  const caja = $('s-bbdd');
  caja.innerHTML = '';
  caja.className = '';
  montarBbdd(caja, {
    sub,
    leer: (id) => (D.bbdd || {})[id],
    guardar: (id, v) => { (D.bbdd ||= {})[id] = { ...v, u: Date.now() }; guardar(); },
    ir: (s) => { sub = s; ver(); scrollTo({ top: 0 }); },
  });
}
// publico.js la llama al abrir la sección y al traer datos de otro dispositivo (no repinta un ejercicio a medias)
window.verBbdd = (soloIndice) => { if (!soloIndice || !sub) ver(); };
window.verBbdd.reiniciar = () => { sub = ''; }; // al salir: el siguiente lector empieza en el índice
