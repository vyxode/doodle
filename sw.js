// Doodle sin conexión: la página se pide primero a la red (para tener siempre la última versión)
// y, si no hay red, sale de la caché. Los demás recursos propios y de cdnjs se sirven de la caché y se refrescan detrás.
const CACHE = 'doodle-v1'; // el despliegue cambia este nombre en cada publicación
const NO_CACHEAR = [/\/vendor\/tools\.jar/, /leaningtech\.com/, /api\.github\.com/, /aules\.edu\.gva\.es/];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', (e) => {
  const r = e.request, url = new URL(r.url);
  if (r.method !== 'GET' || NO_CACHEAR.some((re) => re.test(r.url)) || r.headers.has('range')) return;
  if (url.origin !== location.origin && url.hostname !== 'cdnjs.cloudflare.com') return;
  if (r.mode === 'navigate' || url.pathname.endsWith('/data/curso.enc')) {
    e.respondWith(fetch(r).then((res) => { const c = res.clone(); caches.open(CACHE).then((k) => k.put(r, c)); return res; })
      .catch(() => caches.match(r, { ignoreSearch: r.mode === 'navigate' })));
    return;
  }
  e.respondWith(caches.match(r).then((hit) => {
    const red = fetch(r).then((res) => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then((k) => k.put(r, c)); } return res; }).catch(() => hit);
    return hit || red;
  }));
});
