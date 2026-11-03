// Ratchet Legacy — générateur des pages fiches du Megacorp Vault
// Dépôt : rc-site
//
// Fabrique une vraie page HTML par fiche du catalogue (vault/<slug>.html),
// une page index qui les liste toutes (vault/index.html), un fichier
// vault/slugs.json (id → adresse, utilisé par database.html) et le sitemap.
//
// Tourne tout seul chaque nuit via .github/workflows/build-vault.yml.
// Lancement à la main : node scripts/build-vault.mjs
// Test hors ligne     : node scripts/build-vault.mjs --data fichier.json
//
// Règles respectées :
//  - seule la description validée (description_en sinon description) est publiée,
//    jamais description_attente ni les notes « À vérifier » ;
//  - les ventes réussies n'affichent que le prix et la date, sans lien.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://ratchetlegacy.com';
const SB_URL = 'https://ihucxnmqnhevfvlamgwc.supabase.co';
// Clé publique « anon » (lecture seule), déjà présente dans database.html.
const SB_KEY = process.env.SB_KEY || (fs.readFileSync(path.join(ROOT, 'database.html'), 'utf8').match(/SB_KEY='([^']+)'/) || [])[1];
const OUT = path.join(ROOT, 'vault');
const TODAY = new Date().toISOString().slice(0, 10);

// ── Libellés anglais : même fichier que le site (catalog-en.js) ──
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'catalog-en.js'), 'utf8'), ctx);
const loc = ctx.window.RCEN.loc;

const CAT_ORDER = ['Game', 'Console/Pack', 'Figure', 'Plush', 'Press Kit', 'Goodie', 'Clothing', 'Print', 'Book', 'Guide', 'Media', 'Music', 'Misc'];
const CAT_ICON = { 'Game': '🎮', 'Console/Pack': '📦', 'Figure': '🎯', 'Plush': '🧸', 'Goodie': '🎁', 'Press Kit': '📰', 'Clothing': '👕', 'Print': '🖼️', 'Book': '📖', 'Guide': '📗', 'Media': '🎬', 'Music': '🎵', 'Misc': '📌' };
const CAT_LABEL = { 'Game': 'Games', 'Console/Pack': 'Consoles & bundles', 'Figure': 'Figures', 'Plush': 'Plush', 'Goodie': 'Goodies', 'Press Kit': 'Press kits', 'Clothing': 'Clothing', 'Print': 'Prints', 'Book': 'Books', 'Guide': 'Strategy guides', 'Media': 'Media', 'Music': 'Music', 'Misc': 'Misc' };
const CONSOLES = ['playstation 2', 'psp', 'playstation 3', 'ps vita', 'playstation 4', 'playstation 5'];

// ── Données ──
async function sbAll(table, select) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${SB_URL}/rest/v1/${table}?select=${select}`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, Range: `${from}-${from + 999}` }
    });
    if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}
async function loadData() {
  const i = process.argv.indexOf('--data');
  if (i > 0) return JSON.parse(fs.readFileSync(process.argv[i + 1], 'utf8'));
  const cols = 'id,name,name_en,category,platform,edition,region,year,languages,reference,barcode,image_url,image_back,description,description_en,sort_order';
  const [catalog, rating, sales] = await Promise.all([
    sbAll('catalog', cols),
    sbAll('market_rating', '*'),
    sbAll('catalog_sales', 'catalog_id,price,sold_on,excluded')
  ]);
  return { catalog, rating, sales };
}
async function loadFx() {
  try {
    const r = await fetch('https://api.frankfurter.dev/v1/latest?from=EUR&to=JPY,USD,GBP,KRW,AUD,BRL,MXN,CAD,HKD');
    const d = await r.json();
    return d && d.rates ? { EUR: 1, ...d.rates } : { EUR: 1 };
  } catch { return { EUR: 1 }; }
}

// ── Outils ──
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slugify = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const PLAT_SHORT = { 'playstation 2': 'ps2', 'playstation 3': 'ps3', 'playstation 4': 'ps4', 'playstation 5': 'ps5', 'ps vita': 'ps-vita', 'psp': 'psp' };
function regionShort(r) { const s = String(r || '').replace(/\s*\([^)]*\)/, '').trim(); return /^jap$/i.test(s) ? 'JP' : s; }
function editionLabel(e) {
  e = String(e || '').trim();
  if (!e || /^(classique|standard)$/i.test(e)) return '';
  return e;
}
function slugOf(raw, c) {
  const parts = [c.name, PLAT_SHORT[String(raw.platform || '').toLowerCase()] || c.platform, editionLabel(c.edition), regionShort(c.region)];
  let s = slugify(parts.filter(Boolean).join(' '));
  if (s.length > 80) s = s.slice(0, 80).replace(/-[^-]*$/, '');
  return `${s}-${raw.id}`;
}
const CUR_BY_REGION = [[/jap|ntsc-j/i, 'JPY'], [/usa|ntsc-u/i, 'USD'], [/\buk\b|royaume/i, 'GBP'], [/\bkr\b|cor[ée]e/i, 'KRW'], [/\bau\b|austral/i, 'AUD'], [/\bbr\b|br[ée]sil/i, 'BRL'], [/\bmx\b|mexi/i, 'MXN'], [/\bca\b|canad/i, 'CAD'], [/asia|hong/i, 'HKD']];
function curOf(c) { const r = String(c.region || ''); for (const [re, cur] of CUR_BY_REGION) if (re.test(r)) return cur; return 'EUR'; }
function fmtCur(v, cur) {
  const dec = (cur === 'JPY' || cur === 'KRW') ? 0 : 2;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol', minimumFractionDigits: Number.isInteger(+v) ? 0 : dec, maximumFractionDigits: dec }).format(v).replace(/[  ]/g, ' ');
}
function priceFor(eur, c, FX) {
  eur = parseFloat(eur); const cur = curOf(c);
  if (cur === 'EUR' || !FX[cur]) return { main: fmtCur(eur, 'EUR'), eur: '' };
  let v = eur * FX[cur]; if (cur === 'JPY' || cur === 'KRW') v = Math.round(v / 100) * 100;
  return { main: fmtCur(v, cur), eur: '≈ ' + fmtCur(eur, 'EUR') };
}
const fmtDate = d => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
function gtin(b) { const d = String(b || '').replace(/\D/g, ''); return [8, 12, 13, 14].includes(d.length) ? d : ''; }
function clip(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…'; }

// ── Gabarit commun ──
const CSS = `:root{--bg:#0A0B14;--bg2:#10121F;--bg3:#181B2E;--purple:#7B4FD4;--purple-light:#9B6FF4;--orange:#FF6B1A;--gold:#FFC85A;--green:#3DD68C;--text:#EEF0F8;--text-dim:#8B92AD;--text-mid:#B8BED4;--line:rgba(255,255,255,.08)}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
a{color:inherit;text-decoration:none}
.nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 28px;background:rgba(10,11,20,.85);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.nav-logo{display:flex;align-items:center;gap:11px;font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.02rem;letter-spacing:.06em;white-space:nowrap}
.nav-logo .mark{width:38px;height:38px;border-radius:9px;background:linear-gradient(135deg,var(--purple),var(--orange));display:flex;align-items:center;justify-content:center;font-size:1.15rem}
.nav-links{display:flex;gap:6px;align-items:center;overflow-x:auto;scrollbar-width:none}
.nav-links a{padding:8px 15px;border-radius:8px;font-size:.86rem;font-weight:500;color:var(--text-mid);white-space:nowrap}
.nav-links a:hover,.nav-links a.active{color:var(--text);background:rgba(255,255,255,.05)}
.nav-cta{background:linear-gradient(135deg,var(--purple),var(--orange));color:#fff!important;font-weight:700!important}
main{max-width:1060px;margin:0 auto;padding:28px 22px 60px}
.crumbs{font-size:.8rem;color:var(--text-dim);margin-bottom:18px;display:flex;flex-wrap:wrap;gap:6px}
.crumbs a:hover{color:var(--text)}
h1{font-family:'Orbitron',sans-serif;font-size:clamp(1.3rem,3.2vw,1.9rem);line-height:1.25;margin-bottom:10px}
h2{font-family:'Orbitron',sans-serif;font-size:1rem;letter-spacing:.04em;margin:28px 0 12px}
.item{display:grid;grid-template-columns:minmax(0,420px) 1fr;gap:32px;align-items:start}
@media(max-width:780px){.item{grid-template-columns:1fr}.nav{padding:12px 14px}}
.photos{display:grid;gap:12px;position:sticky;top:90px}
.photos.two{grid-template-columns:1fr 1fr}
@media(max-width:780px){.photos{position:static}}
.photos img{width:100%;height:auto;max-height:520px;object-fit:contain;border-radius:16px;background:var(--bg3);border:1px solid var(--line);display:block}
.nophoto{aspect-ratio:3/4;border-radius:16px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:4rem;opacity:.4}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.chip{font-size:.74rem;font-weight:600;background:rgba(123,79,212,.18);color:var(--purple-light);border-radius:999px;padding:3px 11px}
.desc{color:var(--text-mid);font-size:.96rem;margin-bottom:8px}
table.facts{width:100%;border-collapse:collapse;font-size:.88rem}
.facts th{text-align:left;color:var(--text-dim);font-weight:500;padding:8px 12px 8px 0;width:38%;vertical-align:top}
.facts td{padding:8px 0;border-bottom:1px solid var(--line)}
.facts th{border-bottom:1px solid var(--line)}
code{font-size:.84rem;letter-spacing:.04em}
.rating{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
.rbox{padding:14px 16px;background:rgba(61,214,140,.08);border:1px solid rgba(61,214,140,.28);border-radius:12px}
.rbox.est{background:rgba(245,185,65,.07);border-color:rgba(245,185,65,.3)}
.rlbl{font-size:.64rem;color:var(--text-dim);letter-spacing:.1em}
.rval{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.35rem;color:var(--green)}
.est .rval{color:#F5B941}
.rsub{font-size:.72rem;color:var(--text-dim)}
.sales{list-style:none;font-size:.86rem;columns:2;column-gap:28px}
.sales li{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line);break-inside:avoid}
.sales li span{color:var(--text-dim)}
.note{font-size:.76rem;color:var(--text-dim);margin-top:8px}
.note a{color:var(--purple-light)}
.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;font-weight:600;font-size:.88rem;border:1px solid var(--line);background:var(--bg3)}
.btn.main{background:linear-gradient(135deg,var(--purple),var(--orange));border:none;color:#fff}
.btn:hover{border-color:var(--purple-light)}
.versions{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.vcard{background:var(--bg2);border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:.78rem}
.vcard:hover{border-color:var(--purple)}
.vcard .vi{aspect-ratio:1;background:var(--bg3) center/contain no-repeat}
.vcard .vt{padding:8px 10px;color:var(--text-mid)}
.vcard b{display:block;color:var(--text);font-weight:600}
.list h2{display:flex;gap:8px;align-items:center}
.list h3{font-size:.86rem;color:var(--purple-light);margin:16px 0 6px}
.list ul{list-style:none;columns:2;column-gap:28px;font-size:.86rem}
.list li{padding:3px 0;break-inside:avoid}
.list li a:hover{color:var(--orange)}
.list li span{color:var(--text-dim)}
@media(max-width:640px){.list ul,.sales{columns:1}}
footer{border-top:1px solid var(--line);padding:32px 24px;text-align:center;color:var(--text-dim);font-size:.8rem}`;

function page({ title, description, canonical, image, jsonld, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<link rel="canonical" href="${esc(canonical)}"/>
<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png"/>
<link rel="apple-touch-icon" href="/icon-192.png"/>
<meta name="theme-color" content="#0A0B14"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Ratchet Legacy"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:url" content="${esc(canonical)}"/>
<meta property="og:image" content="${esc(image)}"/>
<meta property="og:locale" content="en_GB"/>
<meta name="twitter:card" content="summary_large_image"/>
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>${CSS}</style>
</head>
<body>
<nav class="nav">
  <a href="/" class="nav-logo"><span class="mark">🔧</span> RATCHET LEGACY</a>
  <div class="nav-links">
    <a href="/">Home</a>
    <a href="/wiki.html">Wiki</a>
    <a href="/database.html" class="active">Megacorp Vault</a>
    <a href="/guides.html">Guides</a>
    <a href="/news.html">News</a>
    <a href="https://tracker.ratchetlegacy.com" class="nav-cta">Open the tracker</a>
  </div>
</nav>
<main>
${body}
</main>
<footer>Made with 💜 by Ratchet Legacy · A fan project, not affiliated with Insomniac Games or Sony. · <a href="/legal.html">Terms &amp; Legal</a></footer>
<script src="/site-enhance.js"></script>
</body>
</html>
`;
}

const LOGO = 'https://res.cloudinary.com/dmfq8hkvu/image/upload/c_pad,w_1200,h_630,b_rgb:0A0B14/v1788954181/Ratchet_Legacy_ikwdp6.jpg';

// ── Page d'une fiche ──
function itemPage(it, ctx) {
  const { c, raw, slug } = it;
  const { FX, ratings, sales, versions } = ctx;
  const ed = editionLabel(c.edition);
  const reg = regionShort(c.region);
  const subtitle = [c.platform, ed, reg].filter(Boolean).join(', ');
  const title = clip(`${c.name} (${subtitle}) — Price & Info | Ratchet Legacy`, 110);
  const descText = String(c.description || '').trim();
  const r = ratings[raw.id] || {};
  const metaDesc = clip(
    `${c.name}, ${[c.platform, ed, c.region, c.year].filter(Boolean).join(' · ')}. ` +
    (r.occasion || r.neuf ? 'Market value, recent sales and collector info. ' : 'Collector info and details. ') + descText, 158);
  const canonical = `${SITE}/vault/${slug}.html`;
  const catLabel = CAT_LABEL[raw.category] || raw.category || 'Misc';

  const photos = raw.image_url
    ? `<img src="${esc(raw.image_url)}" alt="${esc(`${c.name} — ${subtitle} (front)`)}" loading="eager"/>` +
      (raw.image_back ? `<img src="${esc(raw.image_back)}" alt="${esc(`${c.name} — ${subtitle} (back)`)}" loading="lazy"/>` : '')
    : `<div class="nophoto">${CAT_ICON[raw.category] || '📦'}</div>`;

  const langs = String(c.languages || '').split(/[,;/]/).map(x => x.trim().toUpperCase()).filter(Boolean);
  const facts = [
    ['Category', catLabel], ['Platform', c.platform], ['Edition', ed || 'Standard'],
    ['Region', c.region], ['Release year', c.year], ['Languages', langs.join(', ')],
    ['Reference', c.reference ? `<code>${esc(c.reference)}</code>` : '', true],
    ['Barcode', c.barcode ? `<code>${esc(c.barcode)}</code>` : '', true]
  ].filter(f => f[1] != null && f[1] !== '')
    .map(([k, v, rawHtml]) => `<tr><th>${k}</th><td>${rawHtml ? v : esc(v)}</td></tr>`).join('');

  const rbox = (lbl, x) => {
    if (!x || x.median == null) return '';
    const p = priceFor(x.median, c, FX);
    const real = x.count > 0;
    return `<div class="rbox${real ? '' : ' est'}"><div class="rlbl">${lbl}</div><div class="rval">${real ? '' : '≈ '}${esc(p.main)}</div>` +
      (p.eur ? `<div class="rsub">${esc(p.eur)}</div>` : '') +
      `<div class="rsub">${real ? `Median of ${x.count} real price${x.count > 1 ? 's' : ''}${x.sources ? ' · ' + esc(x.sources) : ''}` : 'Estimate from current listings · no sale yet'}</div></div>`;
  };
  const ratingHtml = (r.neuf || r.occasion) ? `<h2>💰 Market value</h2><div class="rating">${rbox('NEW / SEALED', r.neuf)}${rbox('PRE-OWNED', r.occasion)}</div>
<p class="note">Values are medians of completed sales and collectors' purchase prices, updated daily. <a href="/database.html#prix">How is this calculated?</a></p>` : '';

  const sl = (sales[raw.id] || []).slice(0, 12);
  const salesHtml = sl.length ? `<h2>🧾 Recent sales</h2><ul class="sales">${sl.map(s => `<li><span>${fmtDate(s.sold_on)}</span><b>${esc(fmtCur(+s.price, 'EUR'))}</b></li>`).join('')}</ul>` : '';

  const vers = (versions[raw.name] || []).filter(v => v.raw.id !== raw.id);
  const versHtml = vers.length ? `<h2>Other versions</h2><div class="versions">${vers.map(v =>
    `<a class="vcard" href="/vault/${v.slug}.html"><div class="vi" style="${v.raw.image_url ? `background-image:url('${esc(v.raw.image_url)}')` : 'display:flex;align-items:center;justify-content:center;font-size:2rem;opacity:.4'}">${v.raw.image_url ? '' : (CAT_ICON[v.raw.category] || '📦')}</div><div class="vt"><b>${esc([v.c.platform, editionLabel(v.c.edition)].filter(Boolean).join(' · '))}</b>${esc([v.c.region, v.c.year].filter(Boolean).join(' · '))}</div></a>`).join('')}</div>` : '';

  const product = {
    // « Thing » et non « Product » : Google exige un prix de vente ou des avis
    // pour un Product, ce qui n'a pas de sens pour une fiche de catalogue.
    '@context': 'https://schema.org', '@type': 'Thing', name: `${c.name} (${subtitle})`,
    description: descText || undefined, image: [raw.image_url, raw.image_back].filter(Boolean),
    additionalType: catLabel, url: canonical,
    identifier: [c.reference, gtin(c.barcode)].filter(Boolean)
  };
  if (!product.identifier.length) delete product.identifier;
  const crumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ratchet Legacy', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Megacorp Vault', item: SITE + '/vault/' },
      { '@type': 'ListItem', position: 3, name: c.name, item: canonical }
    ]
  };

  const body = `<div class="crumbs"><a href="/">Home</a>›<a href="/vault/">Megacorp Vault</a>›<a href="/vault/#${slugify(raw.category || 'misc')}">${esc(catLabel)}</a>›<span>${esc(c.name)}</span></div>
<article class="item">
  <div class="photos${raw.image_url && raw.image_back ? ' two' : ''}">${photos}</div>
  <div>
    <h1>${esc(c.name)}</h1>
    <div class="chips">${[c.platform, ed || 'Standard edition', c.region, c.year].filter(Boolean).map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>
    ${descText ? `<p class="desc">${esc(descText)}</p>` : ''}
    <h2>Details</h2>
    <table class="facts">${facts}</table>
    ${ratingHtml}
    <div class="actions">
      <a class="btn main" href="https://tracker.ratchetlegacy.com">➕ Track it in your collection</a>
      <a class="btn" href="/database.html#item=${raw.id}">🗂️ Open in the Megacorp Vault</a>
    </div>
  </div>
</article>
${salesHtml}
${versHtml}`;

  return page({ title, description: metaDesc, canonical, image: raw.image_url || LOGO, jsonld: [product, crumbs], body });
}

// ── Page index ──
function indexPage(items) {
  const byCat = {};
  items.forEach(it => { const k = it.raw.category || 'Misc'; (byCat[k] = byCat[k] || []).push(it); });
  const cats = [...CAT_ORDER.filter(c => byCat[c]), ...Object.keys(byCat).filter(c => !CAT_ORDER.includes(c))];
  const section = cat => {
    const byPlat = {};
    byCat[cat].forEach(it => { const k = it.c.platform || '—'; (byPlat[k] = byPlat[k] || []).push(it); });
    const plats = Object.keys(byPlat).sort((a, b) => {
      const ra = CONSOLES.indexOf(a.toLowerCase()), rb = CONSOLES.indexOf(b.toLowerCase());
      return ((ra < 0 ? 50 : ra) - (rb < 0 ? 50 : rb)) || a.localeCompare(b);
    });
    return `<section id="${slugify(cat)}"><h2>${CAT_ICON[cat] || '📌'} ${esc(CAT_LABEL[cat] || cat)} <span style="color:var(--text-dim);font-size:.8rem">(${byCat[cat].length})</span></h2>` +
      plats.map(p => `<h3>${esc(p)}</h3><ul>${byPlat[p].map(it =>
        `<li><a href="/vault/${it.slug}.html">${esc(it.c.name)}</a> <span>· ${esc([editionLabel(it.c.edition), regionShort(it.c.region), it.c.year].filter(Boolean).join(' · '))}</span></li>`).join('')}</ul>`).join('') + '</section>';
  };
  const body = `<div class="crumbs"><a href="/">Home</a>›<span>Megacorp Vault</span>›<span>All items</span></div>
<h1>Megacorp Vault — every Ratchet &amp; Clank collectible</h1>
<p class="desc">The full list of the ${items.length} items in the Ratchet Legacy collector's catalogue: every game edition by region, console bundles, figures, plush, press kits, goodies and more — each with its own page, details and market value. Prefer browsing by picture? <a href="/database.html" style="color:var(--purple-light)">Open the visual Vault</a>.</p>
<div class="list">${cats.map(section).join('')}</div>`;
  return page({
    title: 'All Ratchet & Clank Collectibles — Megacorp Vault | Ratchet Legacy',
    description: `The complete list of ${items.length} Ratchet & Clank games, editions, bundles, figures and merch in the Megacorp Vault, each with details and market value.`,
    canonical: `${SITE}/vault/`, image: LOGO,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Megacorp Vault — All items', url: `${SITE}/vault/`, isPartOf: { '@type': 'WebSite', name: 'Ratchet Legacy', url: SITE + '/' } }],
    body
  });
}

// ── Sitemap ──
const STATIC = [['', '1.0', 'weekly'], ['database.html', '0.9', 'daily'], ['vault/', '0.9', 'daily'], ['wiki.html', '0.8', 'weekly'], ['guides.html', '0.8', 'monthly'], ['map.html', '0.7', 'monthly'], ['story.html', '0.7', 'monthly'], ['news.html', '0.7', 'weekly'], ['trades.html', '0.6', 'weekly'], ['arcade.html', '0.5', 'monthly'], ['supporters.html', '0.3', 'monthly'], ['legal.html', '0.2', 'yearly']];
function sitemap(items) {
  const u = (loc, pr, cf) => `  <url><loc>${SITE}/${loc}</loc><lastmod>${TODAY}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    STATIC.map(s => u(...s)).join('\n') + '\n' + items.map(it => u(`vault/${it.slug}.html`, '0.6', 'weekly')).join('\n') + '\n</urlset>\n';
}

// ── Assemblage ──
const data = await loadData();
const FX = await loadFx();
if (!data.catalog || !data.catalog.length) throw new Error('Catalogue vide : rien n\u2019est écrit, pour ne pas effacer les pages existantes.');

const ratings = {};
(data.rating || []).forEach(r => {
  if (r.catalog_id == null) return;
  (ratings[r.catalog_id] = ratings[r.catalog_id] || {})[r.cond] = {
    median: r.median_price != null ? parseFloat(r.median_price) : null,
    count: (+r.user_count || 0) + (+r.sale_count || 0),
    sources: r.source === 'reelle' ? String(r.sources || '').replace(/collectionneurs/g, 'collectors') : ''
  };
});
const sales = {};
(data.sales || []).filter(s => !s.excluded && s.price != null && s.sold_on).forEach(s => (sales[s.catalog_id] = sales[s.catalog_id] || []).push(s));
Object.values(sales).forEach(l => l.sort((a, b) => b.sold_on.localeCompare(a.sold_on)));

const items = data.catalog
  .slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || String(a.name).localeCompare(String(b.name)))
  .map(raw => { const c = loc(raw); return { raw, c, slug: slugOf(raw, c) }; });
const versions = {};
items.forEach(it => (versions[it.raw.name] = versions[it.raw.name] || []).push(it));

fs.mkdirSync(OUT, { recursive: true });
const keep = new Set(['index.html', 'slugs.json']);
for (const it of items) {
  fs.writeFileSync(path.join(OUT, it.slug + '.html'), itemPage(it, { FX, ratings, sales, versions }));
  keep.add(it.slug + '.html');
}
// Pages des fiches supprimées ou renommées : on les retire.
for (const f of fs.readdirSync(OUT)) if (!keep.has(f)) fs.unlinkSync(path.join(OUT, f));
fs.writeFileSync(path.join(OUT, 'index.html'), indexPage(items));
fs.writeFileSync(path.join(OUT, 'slugs.json'), JSON.stringify(Object.fromEntries(items.map(it => [it.raw.id, it.slug]))));
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap(items));
console.log(`${items.length} pages fiches générées dans vault/ · sitemap : ${items.length + STATIC.length} adresses`);
