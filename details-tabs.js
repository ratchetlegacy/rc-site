// Ratchet Legacy — onglets de detail (planetes, armes)
//
// Les details (missions, ennemis, prix...) sont dans la colonne "details"
// de site_wiki_entries. Ils ne sont charges qu'au clic sur un onglet,
// pour que les pages restent legeres.
(function(){
  const CDN='https://res.cloudinary.com/dmfq8hkvu/image/upload/';
  // Jeux : nom utilise dans les details -> [nom court, annee, jaquette]
  const GAMES={
    'Ratchet & Clank (2002)':['Ratchet & Clank',2002,'v1781874919/images_ncvprf.jpg'],
    'Going Commando':['Going Commando',2003,'v1781875151/images_muw3yf.jpg'],
    'Up Your Arsenal':['Up Your Arsenal',2004,'v1781875160/images_xj3ydp.jpg'],
    'Deadlocked':['Deadlocked',2005,'v1781875111/images_aeucu5.jpg'],
    'Going Mobile':['Going Mobile',2005,'v1788965628/Ratchet__26_Clank_Going_Mobile_ic3uqq.webp'],
    'Clone Home':['Clone Home',2006,'v1788965620/MV5BMjdjNTY1MjQtYjcxMS00MjQzLWEyZDEtNzU3ZDViNjRiYjBhXkEyXkFqcGc._V1_FMjpg_UX1000__yg5fxy.jpg'],
    'Size Matters':['Size Matters',2007,'v1781875165/images_t5trs9.jpg'],
    'Tools of Destruction':['Tools of Destruction',2007,'v1788965701/Ratchet___Clank_Future_Tools_of_Destruction_North_American_cover_qpcdun.png'],
    'Secret Agent Clank':['Secret Agent Clank',2008,'v1781792947/sackpp0f_ziehxu.webp'],
    'Quest for Booty':['Quest for Booty',2008,'v1788965725/5076-jaquette-francaise-3342_y0yn5j.jpg'],
    'A Crack in Time':['A Crack in Time',2009,'v1788965751/713akjTRMOS._AC_UF894_1000_QL80__nv3ngg.jpg'],
    'All 4 One':['All 4 One',2011,'v1788965768/ratchet-et-clank-all-4-one-e47001_qabam8.jpg'],
    'Full Frontal Assault':['Full Frontal Assault',2012,'v1788965795/91dpx_xFHDL_b95zqs.jpg'],
    'Into the Nexus':['Into the Nexus',2013,'v1788965810/71jakIrUdIL._AC_UF894_1000_QL80__oloa5b.jpg'],
    'Ratchet & Clank (2016)':['Ratchet & Clank (2016)',2016,'v1781792915/download_mde7j2.jpg'],
    'Rift Apart':['Rift Apart',2021,'v1781792931/71UTxBiOajL._AC_UF1000_1000_QL80__eowxn2.jpg'],
    'Ranger Rumble':['Ranger Rumble',2026,'v1788965831/ratchet-clank-ranger-rumble_t8wp.600_dk5bk6.webp']
  };
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gi=n=>GAMES[n]||[n,'',''];
  const cover=(n,cls)=>{ const g=gi(n); const im=g[2]?'<img src="'+CDN+g[2]+'" alt="" loading="lazy" onerror="this.remove()"/>':''; return cls==='x'?im:'<div class="rd-cover">'+im+'</div>'; };
  const num=v=>{ const n=Number(String(v).replace(/[^\d.]/g,'')); return isFinite(n)&&String(v).trim()!==''?n.toLocaleString('en-US'):esc(v); };
  const list=a=>Array.isArray(a)?a.filter(Boolean):[];

  // CSS commun
  const css=`
.rd-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:0 26px;border-top:1px solid var(--line);background:rgba(0,0,0,.12)}
.rd-tabs::-webkit-scrollbar{display:none}
.rd-tab{flex:none;background:none;border:0;border-bottom:2px solid transparent;color:var(--text-dim);font:600 .82rem Inter,sans-serif;padding:14px 12px 12px;cursor:pointer;white-space:nowrap;transition:.15s}
.rd-tab:hover{color:var(--text)}
.rd-tab.on{color:var(--gold);border-bottom-color:var(--gold)}
.rd-tab .n{display:inline-block;margin-left:6px;font-size:.68rem;background:rgba(255,255,255,.07);border-radius:100px;padding:1px 7px;color:var(--text-mid)}
.rd-pane{padding:20px 26px 26px;animation:rdIn .25s ease}
@keyframes rdIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.rd-load{display:flex;align-items:center;gap:10px;color:var(--text-dim);font-size:.86rem;padding:8px 0}
.rd-load i{width:16px;height:16px;border:2px solid var(--line);border-top-color:var(--gold);border-radius:50%;animation:rdSpin .7s linear infinite}
@keyframes rdSpin{to{transform:rotate(360deg)}}
.rd-empty{color:var(--text-dim);font-size:.88rem;font-style:italic}
.rd-game{display:grid;grid-template-columns:52px 1fr;gap:14px;padding:14px 0;border-top:1px dashed var(--line)}
.rd-game:first-child{border-top:0;padding-top:4px}
.rd-cover{width:52px;height:65px;border-radius:7px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.4);background:linear-gradient(135deg,#2a1d45,#3d2410)}
.rd-cover img{width:100%;height:100%;object-fit:cover;display:block}
.rd-gh{font-family:'Orbitron',sans-serif;font-size:.82rem;letter-spacing:.04em;margin-bottom:10px}
.rd-gh span{color:var(--text-dim);font-family:Inter,sans-serif;font-size:.74rem;margin-left:6px}
.rd-tl{list-style:none;margin:0;padding:0;counter-reset:rd;position:relative}
.rd-tl li{counter-increment:rd;position:relative;padding:0 0 12px 36px;font-size:.88rem;color:var(--text)}
.rd-tl li:before{content:counter(rd);position:absolute;left:0;top:-2px;width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,var(--purple,#7B4FD4),var(--gold,#FFB020));color:#fff;font:700 .7rem Inter,sans-serif;display:flex;align-items:center;justify-content:center}
.rd-tl li:after{content:'';position:absolute;left:11px;top:22px;bottom:2px;width:2px;background:var(--line)}
.rd-tl li:last-child:after{display:none}
.rd-sub{font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text-dim);font-weight:700;margin:12px 0 8px}
.rd-chips{display:flex;flex-wrap:wrap;gap:7px}
.rd-chip{display:inline-flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--line);border-radius:100px;padding:5px 12px;font-size:.8rem;color:var(--text-mid)}
.rd-chip.boss{border-color:rgba(255,80,80,.5);color:#ff9a9a}
.rd-counters{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:6px}
.rd-count{display:flex;align-items:center;gap:10px;background:var(--bg3);border:1px solid var(--line);border-radius:12px;padding:9px 14px}
.rd-count b{font:800 1.3rem Orbitron,sans-serif;color:var(--gold)}
.rd-count span{font-size:.72rem;color:var(--text-dim);line-height:1.2}
.rd-evo{max-width:560px;margin:0 auto;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:14px;text-align:center}
.rd-evo figure{margin:0;background:var(--bg3);border:1px solid var(--line);border-radius:14px;padding:12px}
.rd-evo .im{height:150px;display:flex;align-items:center;justify-content:center;font-size:2.4rem}
.rd-evo img{max-width:100%;max-height:100%;object-fit:contain}
.rd-evo figcaption{font-weight:700;font-size:.88rem;margin-top:8px}
.rd-evo figcaption small{display:block;color:var(--text-dim);font-weight:500;font-size:.72rem}
.rd-evo .arrow{font-size:1.8rem;color:var(--gold);animation:rdPulse 1.6s ease-in-out infinite}
@keyframes rdPulse{50%{transform:translateX(4px);opacity:.6}}
.rd-shop{width:100%;border-collapse:collapse;font-size:.84rem}
.rd-shop th{text-align:left;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);padding:0 10px 8px;font-weight:700}
.rd-shop td{padding:10px;border-top:1px solid var(--line);vertical-align:top;color:var(--text-mid)}
.rd-shop td:first-child{color:var(--text);font-weight:600;white-space:nowrap}
.rd-shop .gc{display:flex;align-items:center;gap:9px}
.rd-shop .gc img{width:30px;height:38px;object-fit:cover;border-radius:4px}
.rd-price{color:var(--gold);font-weight:700;white-space:nowrap}
.rd-covers{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:12px}
.rd-cv{text-align:center;font-size:.72rem;color:var(--text-mid)}
.rd-cv .ph{aspect-ratio:4/5;border-radius:9px;overflow:hidden;background:linear-gradient(135deg,#2a1d45,#3d2410);margin-bottom:6px;box-shadow:0 6px 14px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:1.4rem}
.rd-cv .ph img{width:100%;height:100%;object-fit:cover}
.rd-cv b{display:block;color:var(--text);font-size:.74rem}
@media(max-width:640px){
  .rd-tabs{padding:0 12px}
  .rd-pane{padding:16px 18px 20px}
  .rd-shop thead{display:none}
  .rd-shop tr{display:block;border-top:1px solid var(--line);padding:10px 0}
  .rd-shop td{display:block;border:0;padding:2px 0}
  .rd-evo{grid-template-columns:1fr;gap:6px}
  .rd-evo .im{height:120px}
  .rd-evo .arrow{transform:rotate(90deg);animation:none}
}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  // Cache des details deja charges
  const CACHE={};
  async function fetchDetails(sb,id){
    if(id in CACHE) return CACHE[id];
    const {data,error}=await sb.from('site_wiki_entries').select('details').eq('id',id).maybeSingle();
    if(error) throw error;
    return CACHE[id]=(data&&data.details)||null;
  }

  // Monte une barre d'onglets. tabs: [{key,label,count,html?:string,load?:async()=>string}]
  function mount(bar,pane,tabs,onShown){
    bar.className='rd-tabs';
    bar.innerHTML=tabs.map((t,i)=>'<button class="rd-tab'+(i?'':' on')+'" data-i="'+i+'">'+esc(t.label)+(t.count!=null?'<span class="n">'+t.count+'</span>':'')+'</button>').join('');
    const show=async i=>{
      bar.querySelectorAll('.rd-tab').forEach((b,j)=>b.classList.toggle('on',j===i));
      const t=tabs[i];
      if(t.html!=null){ pane.innerHTML='<div class="rd-pane">'+t.html+'</div>'; onShown&&onShown(t.key,pane); return; }
      pane.innerHTML='<div class="rd-pane"><div class="rd-load"><i></i>Loading…</div></div>';
      try{ t.html=await t.load(); }catch(e){ pane.innerHTML='<div class="rd-pane"><div class="rd-empty">Could not load this tab. Try again.</div></div>'; return; }
      if(bar.querySelector('.rd-tab.on')!==bar.children[i]) return;
      pane.innerHTML='<div class="rd-pane">'+t.html+'</div>'; onShown&&onShown(t.key,pane);
    };
    bar.querySelectorAll('.rd-tab').forEach(b=>b.onclick=()=>show(+b.dataset.i));
    show(0);
  }

  const gameBlock=(g,inner)=>'<div class="rd-game">'+cover(g.game)+'<div><div class="rd-gh">'+esc(gi(g.game)[0])+'<span>'+esc(gi(g.game)[1])+'</span></div>'+inner+'</div></div>';
  const empty=t=>'<div class="rd-empty">'+t+'</div>';
  const BOSS=/boss|king |giant|queen|courtney gears|shellshock|gleeman|klunk|dreadship|vorselon|leviathan king/i;

  // ── Planetes ──
  function planetMissions(d){
    const gs=list(d&&d.games).filter(g=>list(g.missions).length||list(g.challenges).length);
    if(!gs.length) return empty('No mission list for this world yet.');
    return gs.map(g=>{
      let h='';
      if(list(g.missions).length) h+='<ol class="rd-tl">'+g.missions.map(m=>'<li>'+esc(m)+'</li>').join('')+'</ol>';
      if(list(g.challenges).length) h+=(h?'<div class="rd-sub">Challenges</div>':'')+'<ol class="rd-tl">'+g.challenges.map(m=>'<li>'+esc(m)+'</li>').join('')+'</ol>';
      return gameBlock(g,h);
    }).join('');
  }
  function planetEnemies(d){
    const gs=list(d&&d.games).filter(g=>list(g.enemies).length);
    if(!gs.length) return empty('No enemy list for this world yet.');
    return gs.map(g=>gameBlock(g,'<div class="rd-chips">'+g.enemies.map(e=>{
      const b=BOSS.test(e); return '<span class="rd-chip'+(b?' boss':'')+'">'+(b?'👑':'👾')+' '+esc(e)+'</span>';
    }).join('')+'</div>')).join('');
  }
  function planetCollect(d){
    const gs=list(d&&d.games).filter(g=>g.gold_bolts||g.platinum_bolts||g.titanium_bolts||g.spybots||g.lorbs||g.zurpstones||list(g.skill_points).length||list(g.trophies).length||list(g.equipment).length);
    if(!gs.length) return empty('No collectibles listed for this world yet.');
    return gs.map(g=>{
      const c=[['gold_bolts','🔩','Gold bolts'],['platinum_bolts','💠','Platinum bolts'],['titanium_bolts','⚙️','Titanium bolts'],['spybots','🛰️','Spybots'],['lorbs','📜','Lorbs'],['zurpstones','💎','Zurpstones']]
        .filter(k=>g[k[0]]).map(k=>'<div class="rd-count">'+k[1]+'<b>'+esc(g[k[0]])+'</b><span>'+k[2]+'</span></div>');
      if(list(g.skill_points).length) c.push('<div class="rd-count">⭐<b>'+g.skill_points.length+'</b><span>Skill points</span></div>');
      if(list(g.trophies).length) c.push('<div class="rd-count">🏆<b>'+g.trophies.length+'</b><span>Trophies</span></div>');
      let h=c.length?'<div class="rd-counters">'+c.join('')+'</div>':'';
      if(list(g.skill_points).length) h+='<div class="rd-sub">Skill points</div><div class="rd-chips">'+g.skill_points.map(s=>'<span class="rd-chip">⭐ '+esc(s)+'</span>').join('')+'</div>';
      if(list(g.trophies).length) h+='<div class="rd-sub">Trophies</div><div class="rd-chips">'+g.trophies.map(s=>'<span class="rd-chip">🏆 '+esc(s)+'</span>').join('')+'</div>';
      if(list(g.equipment).length) h+='<div class="rd-sub">Weapons & gadgets found here</div><div class="rd-chips">'+g.equipment.map(s=>'<span class="rd-chip">🎒 '+esc(s)+'</span>').join('')+'</div>';
      return gameBlock(g,h);
    }).join('');
  }
  // Onglets de planete. first: onglet d'ouverture deja rendu (aperçu ou lieux).
  function planetTabs(sb,entry,bar,pane,first,onShown){
    let p=null; const get=()=>p||(p=fetchDetails(sb,entry.id));
    mount(bar,pane,[first,
      {key:'missions',label:'🎯 Missions',load:async()=>planetMissions(await get())},
      {key:'enemies',label:'👾 Enemies',load:async()=>planetEnemies(await get())},
      {key:'collect',label:'🔩 Collectibles',load:async()=>planetCollect(await get())}
    ],onShown);
  }

  // ── Armes ──
  function weaponGames(d){
    const a=list(d&&d.appears_in);
    if(!a.length) return empty('No game list for this item yet.');
    const sorted=a.slice().sort((x,y)=>(gi(x)[1]||9999)-(gi(y)[1]||9999));
    const grid=arr=>'<div class="rd-covers">'+arr.slice().sort((x,y)=>(gi(x)[1]||9999)-(gi(y)[1]||9999)).map(n=>{
      const g=gi(n);
      return '<div class="rd-cv"><div class="ph">'+(g[2]?cover(n,'x'):'🎮')+'</div><b>'+esc(g[0])+'</b>'+esc(g[1])+'</div>';
    }).join('')+'</div>';
    let h='<div class="rd-sub" style="margin-top:0">Appears in · '+a.length+' game'+(a.length>1?'s':'')+'</div>'+grid(sorted);
    const m=list(d&&d.mentioned_in);
    if(m.length) h+='<div class="rd-sub" style="margin-top:18px">Mentioned in</div><div class="rd-chips">'+m.map(n=>'<span class="rd-chip">💬 '+esc(gi(n)[0])+'</span>').join('')+'</div>';
    return h;
  }
  function weaponEvolution(d,entry){
    const ev=d&&d.evolution;
    const ups=[]; list(d&&d.games).forEach(g=>{ if(g.upgrade) ups.push(g); });
    const fam=list(d&&d.family);
    if(!ev&&!ups.length&&!fam.length) return empty('This item has no upgraded form.');
    let h='';
    if(fam.length){
      h+='<div class="rd-sub" style="margin-top:0">One model per game</div><ol class="rd-tl">'+fam.map(x=>'<li><b>'+esc(x.name)+'</b> <span style="color:var(--text-dim);font-size:.8rem">· '+esc(gi(x.game)[0])+' ('+esc(gi(x.game)[1])+')</span>'+(x.kind?'<div style="color:var(--text-mid);font-size:.8rem">'+esc(x.kind)+(x.upgrade?' — upgrades to <b style="color:var(--gold)">'+esc(x.upgrade)+'</b>':'')+'</div>':'')+'</li>').join('')+'</ol>';
      return h;
    }
    if(ev){
      const a=entry.image_url?'<img src="'+esc(entry.image_url)+'" alt="" onerror="this.remove()"/>':'🔫';
      const b=ev.image?'<img src="'+esc(ev.image)+'" alt="" onerror="this.parentNode.textContent=\'✨\'"/>':'✨';
      h+='<div class="rd-evo"><figure><div class="im">'+a+'</div><figcaption>'+esc(entry.name)+'<small>Base form</small></figcaption></figure>'
        +'<div class="arrow">➜</div><figure><div class="im">'+b+'</div><figcaption>'+esc(ev.to)+'<small>Upgraded form</small></figcaption></figure></div>';
    }
    if(ups.length){
      h+='<div class="rd-sub" style="margin-top:20px">Upgrade in each game</div><table class="rd-shop"><thead><tr><th>Game</th><th>Becomes</th><th>Upgrade price</th></tr></thead><tbody>'
        +ups.map(g=>'<tr><td><div class="gc">'+cover(g.game,'x')+esc(gi(g.game)[0])+'</div></td><td>'+esc(g.upgrade)+'</td><td>'+(g.upgrade_price?'<span class="rd-price">'+num(g.upgrade_price)+' bolts</span>':'—')+'</td></tr>').join('')
        +'</tbody></table>';
    }
    return h;
  }
  function weaponShop(d){
    const gs=list(d&&d.games).filter(g=>g.where||g.price||g.ammo);
    let h='';
    const spec=[['Manufacturer',d&&d.manufacturer],['Type',d&&d.kind],['Range',d&&d.range],['Rate of fire',d&&d.rate_of_fire]].filter(r=>r[1]);
    if(spec.length) h+='<div class="rd-chips" style="margin-bottom:16px">'+spec.map(r=>'<span class="rd-chip"><b style="color:var(--text)">'+r[0]+'</b> '+esc(r[1])+'</span>').join('')+'</div>';
    if(!gs.length) return h+empty('No shop information for this item yet.');
    return h+'<table class="rd-shop"><thead><tr><th>Game</th><th>Where to get it</th><th>Price</th><th>Ammo</th></tr></thead><tbody>'
      +gs.map(g=>{
        const ammo=g.ammo?esc(g.ammo)+(g.ammo_max&&g.ammo_max!==g.ammo?' → '+esc(g.ammo_max):'')+(g.ammo_price?' <small style="color:var(--text-dim)">('+num(g.ammo_price)+' bolts each)</small>':''):'—';
        return '<tr><td><div class="gc">'+cover(g.game,'x')+'<div>'+esc(gi(g.game)[0])+(g.model?'<div style="color:var(--gold);font-size:.74rem;font-weight:600">'+esc(g.model)+'</div>':'')+'</div></div></td><td>'+(esc(g.where)||'—')+'</td><td>'+(g.price?'<span class="rd-price">'+num(g.price)+' bolts</span>':'<span style="color:var(--text-dim)">Free / found</span>')+'</td><td>'+ammo+'</td></tr>';
      }).join('')+'</tbody></table>';
  }
  function weaponTabs(sb,entry,bar,pane,first,onShown){
    let p=null; const get=()=>p||(p=fetchDetails(sb,entry.id));
    mount(bar,pane,[first,
      {key:'games',label:'🎮 Games',load:async()=>weaponGames(await get())},
      {key:'evo',label:'✨ Evolution',load:async()=>weaponEvolution(await get(),entry)},
      {key:'shop',label:'🛒 Where to buy',load:async()=>weaponShop(await get())}
    ],onShown);
  }

  // ── Creatures & vehicules ──
  function profile(d,rows){
    let h='';
    const facts=rows.filter(r=>r[2]==='t'&&d&&d[r[0]]);
    if(facts.length) h+='<div class="rd-chips" style="margin-bottom:6px">'+facts.map(r=>'<span class="rd-chip">'+r[3]+' <b style="color:var(--text)">'+r[1]+'</b> '+esc([].concat(d[r[0]]).join(', '))+'</span>').join('')+'</div>';
    rows.filter(r=>r[2]==='l'&&d&&list(d[r[0]]).length).forEach(r=>{
      h+='<div class="rd-sub">'+r[1]+'</div><div class="rd-chips">'+d[r[0]].map(x=>'<span class="rd-chip">'+r[3]+' '+esc(x)+'</span>').join('')+'</div>';
    });
    list(d&&d.obtained).forEach((o,i)=>{ if(!i) h+='<div class="rd-sub">How to get it</div>'; h+=gameBlock(o,'<div style="font-size:.88rem;color:var(--text-mid)">'+esc(o.where)+'</div>'); });
    return h||empty('No profile information yet.');
  }
  const CREATURE=[['homeworld','Homeworld','l','🪐'],['leader','Leader','l','👑'],['headquarters','Headquarters','l','🏯'],['organization','Organization','l','🏢'],['locations','Where to find them','l','📍'],['members','Notable members','l','👤'],['attacks','Attacks','l','⚔️'],['defense','Defense','l','🛡️'],['allies','Allies','l','🤝'],['enemies','Enemies','l','💢']];
  const VEHICLE=[['kind','Type','t','🚀'],['manufacturer','Maker','t','🏭'],['organization','Used by','t','🏢'],['owner','Owner','t','👤'],['role','Role','t','🎯'],['weapon','Weapons','t','💥'],['homeworld','Origin','t','🪐'],['usable_at','Where you drive it','l','🕹️'],['seen_at','Also seen at','l','👀']];
  function simpleTabs(kind){ return function(sb,entry,bar,pane,first,onShown){
    let p=null; const get=()=>p||(p=fetchDetails(sb,entry.id));
    mount(bar,pane,[first,
      {key:'games',label:'🎮 Games',load:async()=>weaponGames(await get())},
      kind==='creature'?{key:'profile',label:'🧬 Profile',load:async()=>profile(await get(),CREATURE)}
                      :{key:'specs',label:'⚙️ Specs',load:async()=>profile(await get(),VEHICLE)}
    ],onShown);
  }; }
  window.RCD={planetTabs,weaponTabs,creatureTabs:simpleTabs('creature'),vehicleTabs:simpleTabs('vehicle'),mount};
})();
