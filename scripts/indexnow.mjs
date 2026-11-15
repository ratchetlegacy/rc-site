// Ratchet Legacy — signale les pages du site à Bing (et aux moteurs IndexNow)
// Lit sitemap.xml et sitemap-wiki.xml, puis envoie la liste à IndexNow.
// Lancé chaque nuit par .github/workflows/build-vault.yml, après publication.
import fs from 'node:fs';
const KEY = '58f8629bef9fe1a58fff49fa1bc2c893';
const urls = ['sitemap.xml', 'sitemap-wiki.xml']
  .filter(f => fs.existsSync(f))
  .flatMap(f => [...fs.readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'ratchetlegacy.com', key: KEY, keyLocation: `https://ratchetlegacy.com/${KEY}.txt`, urlList: urls.slice(0, 10000) })
});
console.log(`IndexNow : ${urls.length} adresses envoyées, réponse HTTP ${res.status}`);
