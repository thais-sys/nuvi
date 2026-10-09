// Service worker da Nuvi: deixa o app abrir offline.
// Ao publicar uma versão nova, troque o número em V para forçar a atualização.
const V = 'nuvi-v2';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Páginas: tenta a internet primeiro (pega versão nova) e cai no cache se estiver offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Demais arquivos (ícones, fontes): cache primeiro.
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const cp = res.clone(); caches.open(V).then(c => c.put(e.request, cp)); return res;
  }).catch(() => r)));
});
