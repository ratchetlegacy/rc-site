// Ratchet Legacy — générateur des pages statiques du wiki et des articles
// Dépôt : rc-site
//
// Le wiki (wiki.html) et les actus (news.html) se remplissent en JavaScript
// depuis Supabase : Google n'y voit qu'une coquille vide et une seule adresse.
// Ce script fabrique une vraie page HTML par entrée, lisible sans JavaScript :
//   wiki/games/<slug>.html       jeux
//   wiki/characters/<slug>.html  personnages
//   wiki/weapons/<slug>.html     armes      (et gadgets, planets, bosses,
//   …                            creatures, vehicles)
//   wiki/index.html              sommaire de toutes les entrées
//   news/<slug>.html             articles écrits sur le site (News et Lombax Voices)
// plus sitemap-wiki.xml, déclaré dans robots.txt.
//
// Tourne chaque nuit avec les pages du Vault (.github/workflows/build-vault.yml).
// Lancement à la main : node scripts/build-wiki.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://ratchetlegacy.com';
const SB_URL = 'https://ihucxnmqnhevfvlamgwc.supabase.co';
const SB_KEY = process.env.SB_KEY || (fs.readFileSync(path.join(ROOT, 'database.html'), 'utf8').match(/SB_KEY='([^']+)'/) || [])[1];
const TODAY = new Date().toISOString().slice(0, 10);
// Même feuille de style que les fiches du Vault, pour un rendu identique.
const CSS = (fs.readFileSync(path.join(ROOT, 'scripts', 'build-vault.mjs'), 'utf8').match(/const CSS = `([\s\S]*?)`;/) || [])[1] || '';
const LOGO = 'https://res.cloudinary.com/dmfq8hkvu/image/upload/c_pad,w_1200,h_630,b_rgb:0A0B14/v1788954181/Ratchet_Legacy_ikwdp6.jpg';

async function sbAll(table, select, extra = '') {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${SB_URL}/rest/v1/${table}?select=${select}${extra}`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, Range: `${from}-${from + 999}` }
    });
    if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slugify = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…'; };
const paras = s => String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').split(/\n\s*\n|\n/).map(p => p.trim()).filter(Boolean).map(p => `<p class="desc">${esc(p)}</p>`).join('');
const nice = k => String(k).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());

// Sections du wiki : dossier, libellés, icône, type schema.org
const SECTIONS = {
  game:      { dir: 'games',      one: 'Game',      many: 'Games',      icon: '🎮' },
  character: { dir: 'characters', one: 'Character', many: 'Characters', icon: '🧑‍🚀' },
  weapon:    { dir: 'weapons',    one: 'Weapon',    many: 'Weapons',    icon: '🔫' },
  gadget:    { dir: 'gadgets',    one: 'Gadget',    many: 'Gadgets',    icon: '🔧' },
  planet:    { dir: 'planets',    one: 'Planet',    many: 'Planets',    icon: '🪐' },
  boss:      { dir: 'bosses',     one: 'Boss',      many: 'Bosses',     icon: '👾' },
  creature:  { dir: 'creatures',  one: 'Creature',  many: 'Creatures',  icon: '🦎' },
  vehicle:   { dir: 'vehicles',   one: 'Vehicle',   many: 'Vehicles',   icon: '🚀' }
};
const ORDER = ['game', 'character', 'weapon', 'gadget', 'planet', 'boss', 'creature', 'vehicle'];

// ── Mise en page ──
function page({ title, description, canonical, image, jsonld, body, active = 'wiki' }) {
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
<meta property="og:type" content="${active === 'news' ? 'article' : 'website'}"/>
<meta property="og:site_name" content="Ratchet Legacy"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:url" content="${esc(canonical)}"/>
<meta property="og:image" content="${esc(image || LOGO)}"/>
<meta property="og:locale" content="en_GB"/>
<meta name="twitter:card" content="summary_large_image"/>
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>${CSS}
.facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin:18px 0}
.fact{background:var(--bg2);border:1px solid var(--line);border-radius:12px;padding:10px 14px}
.fact b{display:block;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text-dim);margin-bottom:3px}
.fact span{font-size:.9rem;color:var(--text)}
.blk{margin:22px 0}.blk h2{font-family:'Orbitron',sans-serif;font-size:1rem;margin-bottom:10px}
.blk li{margin:0 0 6px 18px;color:var(--text-mid)}
.hero-img{max-width:100%;max-height:420px;border-radius:16px;display:block;margin:6px 0 18px;background:var(--bg2)}
.open-wiki{display:inline-block;margin-top:22px;padding:11px 18px;border-radius:12px;background:linear-gradient(135deg,var(--purple),var(--orange));color:#fff;font-weight:700}
.idx-grid{columns:3 240px;column-gap:24px}.idx-grid li{break-inside:avoid;margin:0 0 5px 16px;color:var(--text-mid)}
.idx-grid a:hover{color:var(--purple-light)}
</style>
</head>
<body>
<nav class="nav">
  <a href="/" class="nav-logo"><span class="mark">🔧</span> RATCHET LEGACY</a>
  <div class="nav-links">
    <a href="/">Home</a>
    <a href="/wiki/"${active === 'wiki' ? ' class="active"' : ''}>Wiki</a>
    <a href="/vault/">Megacorp Vault</a>
    <a href="/guides.html">Guides</a>
    <a href="/news.html"${active === 'news' ? ' class="active"' : ''}>News</a>
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
const crumbsLd = list => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: list.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url })) });

// Transforme le champ « details » (JSON libre) en blocs lisibles
const EMPTY = v => v == null || /^(n\/a|unknown|none|-|—)?$/i.test(String(v).trim());
const flat = v => Array.isArray(v) ? v.filter(x => typeof x !== 'object').join(', ') : (typeof v === 'object' ? '' : String(v));
function objLine(x) {
  const head = [x.name || x.game || x.lv && ('Level ' + x.lv), x.info ? `(${x.info})` : ''].filter(Boolean).join(' ');
  const text = x.text || x.description || x.where || '';
  const rest = Object.entries(x).filter(([k, v]) => !['name', 'game', 'info', 'text', 'description', 'where', 'image', 'upgrade_image', 'lv', 'levels'].includes(k) && !EMPTY(flat(v)) && flat(v))
    .map(([k, v]) => `${nice(k)}: ${flat(v)}`).join(' · ');
  if (!head && !text && !rest) return '';
  return `<li>${head ? `<b>${esc(head)}</b>${text || rest ? ' — ' : ''}` : ''}${esc(text)}${rest ? `<br><span style="color:var(--text-dim);font-size:.85rem">${esc(rest)}</span>` : ''}</li>`;
}
function detailsHtml(d) {
  if (!d || typeof d !== 'object') return { facts: [], blocks: '' };
  const facts = [], blocks = [];
  for (const [k, v] of Object.entries(d)) {
    if (k === 'source' || k === 'games' && Array.isArray(v) && v.every(x => typeof x === 'string') || /_label$/.test(k)) continue;
    if (typeof v === 'string' || typeof v === 'number') { if (!EMPTY(v) && !/^https?:/.test(v)) facts.push([nice(d[k + '_label'] || k), String(v)]); continue; }
    if (Array.isArray(v) && v.length) {
      if (v.every(x => typeof x === 'string' || typeof x === 'number')) {
        const vals = v.filter(x => !EMPTY(x));
        if (!vals.length) continue;
        if (vals.join(', ').length < 90) facts.push([nice(d[k + '_label'] || k), vals.join(', ')]);
        else blocks.push(`<div class="blk"><h2>${esc(nice(k))}</h2><ul>${vals.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`);
      } else {
        const li = v.filter(x => x && typeof x === 'object').map(objLine).join('');
        if (li) blocks.push(`<div class="blk"><h2>${esc(nice(k === 'story' ? 'In the games' : k))}</h2><ul>${li}</ul></div>`);
      }
    } else if (v && typeof v === 'object' && v.to) facts.push([nice(k), String(v.to)]);
  }
  return { facts, blocks: blocks.join('') };
}
const factsHtml = facts => facts.length ? `<div class="facts">${facts.map(([k, v]) => `<div class="fact"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>` : '';

// ── Données ──
// Test hors ligne : node scripts/build-wiki.mjs --data fichier.json ({games,characters,entries,news})
const _di = process.argv.indexOf('--data');
const [games, characters, entries, news] = _di > 0 ? (d => [d.games || [], d.characters || [], d.entries || [], d.news || []])(JSON.parse(fs.readFileSync(process.argv[_di + 1], 'utf8'))) : await Promise.all([
  sbAll('site_games', 'id,name,year,platform,synopsis,anecdote,image_url,story,details,release_order', '&order=release_order'),
  sbAll('site_characters', 'id,name,role,description,image_url,species,height,age,homeworld,first_appearance,weapons,quote,voice_actor,category,games,details', '&order=sort_order'),
  sbAll('site_wiki_entries', 'id,type,category,name,subtitle,description,image_url,galaxy,dimension,main_location,inhabitants,first_appearance,notable_locations,notable_events,system,details,games', '&order=sort_order'),
  sbAll('site_news', 'id,kind,title,summary,body,image_url,date_label,author,rating,source,source_url,url,created_at', '&order=created_at.desc')
]);
if (!games.length && !characters.length && !entries.length) throw new Error('Wiki vide : rien n\u2019est écrit, pour ne pas effacer les pages existantes.');

// Une entrée unifiée par fiche du wiki
const all = [];
const used = {};
function add(kind, raw, extra) {
  const S = SECTIONS[kind];
  let slug = slugify(raw.name) || String(raw.id).slice(0, 8);
  const key = S.dir + '/' + slug;
  if (used[key]) slug += '-' + String(raw.id).slice(0, 4);   // deux entrées du même nom
  used[S.dir + '/' + slug] = 1;
  all.push({ kind, raw, slug, url: `${SITE}/wiki/${S.dir}/${slug}.html`, path: `wiki/${S.dir}/${slug}.html`, ...extra });
}
games.forEach(g => add('game', g, { sub: [g.platform, g.year].filter(Boolean).join(' · ') }));
characters.forEach(c => add('character', c, { sub: c.role || c.species || '' }));
entries.forEach(e => {
  const kind = e.type === 'weapon' && e.category === 'gadget' ? 'gadget' : (SECTIONS[e.type] ? e.type : null);
  if (kind) add(kind, e, { sub: e.subtitle || '' });
});

// Liens croisés : un nom de jeu cité dans « games » renvoie à la page du jeu
const gameUrl = {};
all.filter(x => x.kind === 'game').forEach(x => { const u = `/wiki/games/${x.slug}.html`; gameUrl[x.raw.name.toLowerCase()] = u; if (x.raw.year) gameUrl[`${x.raw.name} (${x.raw.year})`.toLowerCase()] = u; });
const gameLinks = list => (list || []).filter(Boolean).map(n => {
  const u = gameUrl[String(n).toLowerCase()];
  return u ? `<a href="${u}" style="color:var(--purple-light)">${esc(n)}</a>` : esc(n);
}).join(', ');

function entryPage(x) {
  const S = SECTIONS[x.kind], r = x.raw;
  const facts = [];
  const pushF = (k, v) => { if (!EMPTY(v)) facts.push([k, String(v)]); };
  let text = '', extraBlocks = '';
  if (x.kind === 'game') {
    pushF('Platform', r.platform); pushF('Year', r.year);
    text = paras(r.synopsis) + (r.story ? `<div class="blk"><h2>Story</h2>${paras(r.story)}</div>` : '')
      + (r.anecdote ? `<div class="blk"><h2>Did you know?</h2>${paras(r.anecdote)}</div>` : '');
  } else if (x.kind === 'character') {
    pushF('Role', r.role); pushF('Species', r.species); pushF('Homeworld', r.homeworld); pushF('Age', r.age);
    pushF('Height', r.height); pushF('First appearance', r.first_appearance); pushF('Weapons', r.weapons); pushF('Voice actor', r.voice_actor);
    text = (!EMPTY(r.quote) ? `<p class="desc" style="font-style:italic;color:var(--gold)">${esc(/^[“"]/.test(r.quote) ? r.quote : '“' + r.quote + '”')}</p>` : '') + paras(r.description);
  } else {
    pushF('Galaxy', r.galaxy); pushF('Dimension', r.dimension); pushF('System', r.system); pushF('Main location', r.main_location);
    pushF('Inhabitants', r.inhabitants); pushF('First appearance', r.first_appearance);
    text = paras(r.description);
    if (r.notable_locations) extraBlocks += `<div class="blk"><h2>Notable locations</h2>${paras(r.notable_locations)}</div>`;
    if (r.notable_events) extraBlocks += `<div class="blk"><h2>Notable events</h2>${paras(r.notable_events)}</div>`;
  }
  const det = detailsHtml(r.details);
  const gl = gameLinks(r.games);
  const descSrc = r.synopsis || r.description || r.story || '';
  const title = `${r.name} — Ratchet & Clank ${S.one}${x.kind === 'game' ? '' : ' Wiki'} | Ratchet Legacy`;
  const description = clip(`${r.name}${x.sub ? ' (' + x.sub + ')' : ''} — ${descSrc || `Ratchet & Clank ${S.one.toLowerCase()}: facts, appearances and details.`}`, 158);
  const crumbs = [['Ratchet Legacy', SITE + '/'], ['Wiki', SITE + '/wiki/'], [S.many, `${SITE}/wiki/#${S.dir}`], [r.name, x.url]];
  const ld = x.kind === 'game'
    ? { '@context': 'https://schema.org', '@type': 'VideoGame', name: r.name, url: x.url, description: clip(descSrc, 300) || undefined,
        image: r.image_url || undefined, gamePlatform: r.platform || undefined, datePublished: r.year ? String(r.year) : undefined,
        author: r.details && r.details.developer ? { '@type': 'Organization', name: r.details.developer } : undefined }
    : { '@context': 'https://schema.org', '@type': 'Thing', name: r.name, url: x.url, description: clip(descSrc, 300) || undefined, image: r.image_url || undefined };
  const body = `<div class="crumbs"><a href="/">Home</a>›<a href="/wiki/">Wiki</a>›<a href="/wiki/#${S.dir}">${S.many}</a>›<span>${esc(r.name)}</span></div>
<h1>${S.icon} ${esc(r.name)}</h1>
${x.sub ? `<p style="color:var(--text-dim);margin:-4px 0 14px">${esc(x.sub)}</p>` : ''}
${r.image_url ? `<img class="hero-img" src="${esc(r.image_url)}" alt="${esc(r.name)} — Ratchet & Clank ${S.one.toLowerCase()}" loading="eager"/>` : ''}
${factsHtml([...facts, ...det.facts])}
${text}${extraBlocks}
${gl ? `<div class="blk"><h2>Appears in</h2><p class="desc">${gl}</p></div>` : ''}
${det.blocks}
<a class="open-wiki" href="/wiki.html">Explore the interactive wiki →</a>`;
  return page({ title, description, canonical: x.url, image: r.image_url, jsonld: [ld, crumbsLd(crumbs)], body });
}

function indexPage() {
  const by = {}; all.forEach(x => (by[x.kind] = by[x.kind] || []).push(x));
  const sections = ORDER.filter(k => by[k]).map(k => {
    const S = SECTIONS[k];
    const list = k === 'game' ? by[k] : by[k].slice().sort((a, b) => a.raw.name.localeCompare(b.raw.name));
    return `<section id="${S.dir}" class="blk"><h2>${S.icon} ${S.many} <span style="color:var(--text-dim);font-size:.8rem">(${list.length})</span></h2>
<ul class="idx-grid">${list.map(x => `<li><a href="/${x.path}">${esc(x.raw.name)}</a></li>`).join('')}</ul></section>`;
  }).join('');
  const url = SITE + '/wiki/';
  return page({
    title: 'Ratchet & Clank Wiki — All Games, Characters, Weapons & Planets | Ratchet Legacy',
    description: clip(`Every Ratchet & Clank game, character, weapon, gadget, planet, boss, creature and vehicle on one page: ${all.length} wiki entries from the whole series.`, 158),
    canonical: url, image: LOGO,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Ratchet & Clank Wiki', url, inLanguage: 'en', isPartOf: { '@type': 'WebSite', name: 'Ratchet Legacy', url: SITE + '/' } },
      crumbsLd([['Ratchet Legacy', SITE + '/'], ['Wiki', url]])],
    body: `<div class="crumbs"><a href="/">Home</a>›<span>Wiki</span></div>
<h1>Ratchet &amp; Clank Wiki</h1>
<p class="desc">${all.length} entries covering the whole series, from the 2002 original to Rift Apart and Ranger Rumble. Pick a page below, or open the <a href="/wiki.html" style="color:var(--purple-light)">interactive wiki</a> with search and comparisons.</p>
${sections}`
  });
}

// ── Articles écrits sur le site ──
const articles = news.filter(n => n.body && n.body.trim()).map(n => {
  const slug = (slugify(n.title).slice(0, 70) || 'article') + '-' + String(n.id).slice(0, 6);
  return { n, slug, url: `${SITE}/news/${slug}.html`, path: `news/${slug}.html` };
});
function articlePage(a) {
  const n = a.n, voice = n.kind === 'voices';
  const crumbs = [['Ratchet Legacy', SITE + '/'], ['News', SITE + '/news.html'], [n.title, a.url]];
  const ld = { '@context': 'https://schema.org', '@type': voice && n.rating ? 'Review' : 'Article', headline: clip(n.title, 110), url: a.url,
    image: n.image_url || undefined, datePublished: n.created_at || undefined,
    author: { '@type': voice ? 'Person' : 'Organization', name: voice ? (n.author || 'Ratchet Legacy community') : 'Ratchet Legacy' },
    publisher: { '@type': 'Organization', name: 'Ratchet Legacy', url: SITE + '/' } };
  if (ld['@type'] === 'Review') {
    const m = String(n.rating).match(/([\d.,]+)\s*\/\s*([\d.,]+)/);
    if (m) ld.reviewRating = { '@type': 'Rating', ratingValue: m[1].replace(',', '.'), bestRating: m[2].replace(',', '.') };
    else ld['@type'] = 'Article';
    ld.itemReviewed = { '@type': 'Thing', name: n.title };
  }
  const body = `<div class="crumbs"><a href="/">Home</a>›<a href="/news.html${voice ? '?tab=voices' : ''}">${voice ? 'Lombax Voices' : 'News'}</a>›<span>${esc(clip(n.title, 60))}</span></div>
<h1>${esc(n.title)}</h1>
<p style="color:var(--text-dim);margin:-4px 0 16px">${esc([n.date_label, voice ? 'By ' + (n.author || 'a fan') : n.source, voice && n.rating ? n.rating : ''].filter(Boolean).join(' · '))}</p>
${n.image_url ? `<img class="hero-img" src="${esc(n.image_url)}" alt="${esc(n.title)}"/>` : ''}
${String(n.body).split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p class="desc">${esc(p)}</p>`).join('')}
${voice ? `<p class="desc" style="font-size:.85rem;color:var(--text-dim)">🗣️ Lombax Voices — written by ${esc(n.author || 'a member of the community')} as a volunteer. The opinions here are the author's own.</p>` : ''}
${(n.source_url || n.url) && !voice ? `<p class="desc" style="font-size:.85rem">Originally reported by <a href="${esc(n.source_url || n.url)}" rel="noopener" style="color:var(--purple-light)">${esc(n.source || 'the source')} →</a></p>` : ''}
<a class="open-wiki" href="/news.html">All news →</a>`;
  return page({ title: `${clip(n.title, 70)} | Ratchet Legacy`, description: clip(n.summary || n.body, 158), canonical: a.url,
    image: n.image_url, jsonld: [ld, crumbsLd(crumbs)], body, active: 'news' });
}

// ── Écriture ──
// On repart de dossiers vides : une entrée supprimée dans l'admin disparaît aussi du site.
for (const d of ['wiki', 'news']) fs.rmSync(path.join(ROOT, d), { recursive: true, force: true });
for (const x of all) {
  fs.mkdirSync(path.dirname(path.join(ROOT, x.path)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, x.path), entryPage(x));
}
fs.writeFileSync(path.join(ROOT, 'wiki', 'index.html'), indexPage());
if (articles.length) fs.mkdirSync(path.join(ROOT, 'news'), { recursive: true });
for (const a of articles) fs.writeFileSync(path.join(ROOT, a.path), articlePage(a));
// table id → adresse, pour que news.html et wiki.html puissent pointer vers ces pages
fs.writeFileSync(path.join(ROOT, 'wiki', 'slugs.json'), JSON.stringify(Object.fromEntries(all.map(x => [x.raw.id, '/' + x.path]))));

const u = (loc, pr, cf) => `  <url><loc>${loc}</loc><lastmod>${TODAY}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`;
fs.writeFileSync(path.join(ROOT, 'sitemap-wiki.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  [u(SITE + '/wiki/', '0.8', 'weekly'),
   ...all.map(x => u(x.url, x.kind === 'game' ? '0.7' : '0.5', 'monthly')),
   ...articles.map(a => u(a.url, '0.5', 'monthly'))].join('\n') + '\n</urlset>\n');
console.log(`${all.length} pages wiki + ${articles.length} articles générés · sitemap-wiki.xml : ${all.length + articles.length + 1} adresses`);
