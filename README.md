# Doodle

Mi curso de DAM en una web: tareas, entregas y notas de Aules, calendario, estadísticas y herramientas para hacer los ejercicios sin salir de la web.

- **Aules**: la web descarga tus datos desde tu navegador con el token de la app de Moodle (Ajustes → Conexión con Aules). Aules no acepta conexiones desde los servidores de GitHub.
- **Cifrado**: todo se guarda cifrado (AES-256-GCM, clave derivada de tu contraseña) en el navegador y, si pones una clave de GitHub en Ajustes, en `data/curso.enc` y `data/progreso.enc` para tenerlo igual en todos tus dispositivos.
- **Repaso** (sección propia; en el móvil, en Más): preguntas de test, tarjetas y frases para completar huecos con cajas de Leitner, 10 exámenes fijos de 30 preguntas (fácil, medio, difícil y mixto) y exámenes al azar, con test y desarrollo. Todo sale de `js/repaso.js`; añade preguntas siempre al final de cada módulo para no descolocar el progreso.
- **Publicación**: `.github/workflows/sincronizar.yml` publica la web en GitHub Pages en cada push.

## Herramientas (Ejercicios → una tarea → Empezar)

| Herramienta | Para | Notas |
|---|---|---|
| Diagrama | E/R (Chen extendido), modelo relacional, UML de clases, casos de uso | Exporta a `.drawio`, PNG y SVG |
| SQL | Bases de Datos | SQLite en el navegador (`js/vendor/sql-wasm.*`); adapta lo típico de MySQL |
| Java | Entornos | Java 8 real con CheerpJ + `javac` de OpenJDK (`js/vendor/tools.jar`); mini JUnit 4/5 incluido |
| C# | Programación | Simulador de los temas 1–4 |
| HTML/CSS | Lenguajes de Marcas | Vista previa en directo y avisos básicos |
| Tablero | Requisitos e historias de usuario | Kanban, exporta a Markdown |
| Notas | Todo lo demás | Texto libre, exporta a `.md` |

## Pruebas

- `node test.js`: cifrado, descarga de Aules contra un Aules simulado, nombres de módulos, SQL real, revisor HTML, exportación a draw.io/SVG y el mini JUnit con un `javac` real. Regenera los datos de ejemplo (`js/demo.js`).

Licencias de terceros: sql.js (MIT, `js/vendor/sql.js-LICENSE`), `tools.jar` de OpenJDK 8 (GPLv2 + Classpath Exception, tomado de JavaFiddle de Leaning Technologies), CheerpJ (se carga desde su CDN; uso personal gratuito).
