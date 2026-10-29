# Doodle

Mi curso de DAM en una web: tareas, entregas y notas de Aules, calendario, estadísticas y ejercicios con editor y simulador de C#.

- **Web**: GitHub Pages (`index.html`, `css/`, `js/`). Pide la contraseña y descifra los datos en el navegador.
- **Robot**: `.github/workflows/sincronizar.yml` ejecuta `sync/aules.mjs` 4 veces al día (y con el botón *Sincronizar ahora*), descarga Aules con la API de Moodle y publica `data/curso.enc` cifrado (AES-256-GCM, clave derivada de `CLAVE_MAESTRA`).
- **Progreso**: se guarda cifrado en el navegador y, si configuras una clave de GitHub en *Ajustes*, en `data/progreso.enc` para tenerlo igual en todos tus dispositivos.

## Puesta en marcha

1. **Settings → Pages → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions**, tres secretos: `AULES_URL` (`https://aules.edu.gva.es/fp`), `AULES_TOKEN`, `CLAVE_MAESTRA`.
3. **Actions → Sincronizar con Aules y publicar → Run workflow.**

## Añadir ejercicios

En la web (*Ejercicios → Añadir un ejercicio*) o en `js/ejercicios.js` para que formen parte del catálogo.

## Pruebas

`node test.js` prueba el robot contra un Aules simulado y el cifrado, y regenera los datos de ejemplo (`js/demo.js`).
