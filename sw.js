// Ratchet Legacy — service worker du site
//
// Son role principal est de rendre le site installable : Chrome et Edge
// exigent un service worker enregistre, avec un gestionnaire 'fetch',
// avant de proposer l'installation.
//
// Le cache reste volontairement leger : le site change souvent, et un
// visiteur doit toujours voir la derniere version.

const CACHE = 'rc-site-v1';

self.addEventListener('install', () => {
  // On prend la main tout de suite, sans attendre la fermeture des onglets.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // On ne touche a rien qui vienne d'un autre domaine. Les bibliotheques
  // des CDN et les images Cloudinary sont mieux gerees par le navigateur,
  // qui a ses propres reprises et son cache HTTP. S'en melanger, c'est
  // risquer de bloquer le chargement d'un script au moindre hoquet reseau.
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  // Reseau d'abord, cache en secours. Le site prime sur sa copie locale.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copie = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copie));
        }
        return res;
      })
      .catch(async () => {
        // caches.match renvoie undefined si la ressource n'a jamais ete
        // mise en cache. Repondre undefined fait echouer la navigation et
        // affiche une page blanche muette : on ne le fait jamais.
        const enCache = await caches.match(req);
        if (enCache) return enCache;

        if (req.mode === 'navigate') {
          const accueil = await caches.match('/index.html');
          if (accueil) return accueil;
        }

        return new Response('Hors ligne, et cette page n’est pas en cache.', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
  );
});
