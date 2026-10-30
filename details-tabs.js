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
.rd-game.has-guide{grid-template-columns:52px 1fr auto}
.rd-guide{align-self:center;display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,rgba(123,79,212,.25),rgba(255,176,32,.18));border:1px solid rgba(255,176,32,.45);color:var(--text);text-decoration:none;font-size:1.4rem;transition:.18s;min-width:74px}
.rd-guide span{font:700 .68rem Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}
.rd-guide:hover{transform:translateY(-2px);border-color:var(--gold);box-shadow:0 8px 20px -8px rgba(255,176,32,.55)}
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
.rd-lk{color:inherit;text-decoration:none;border-bottom:1px dashed rgba(255,176,32,.6);cursor:pointer;transition:.15s}
.rd-lk:hover{color:var(--gold);border-bottom-style:solid}
.rd-chip.lk,.al-chip.lk{cursor:pointer;transition:.15s}
.al-chip.lk:hover{border-color:var(--gold)!important;color:var(--text)!important}
.rd-chip.lk:hover{border-color:var(--gold);color:var(--text);transform:translateY(-1px)}
[data-k="game"]{cursor:pointer}
.rd-cv[data-k]:hover .ph{outline:2px solid var(--gold);outline-offset:2px}
.rd-gh[data-k]:hover{color:var(--gold)}
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
.rd-lvl{margin-bottom:22px}
.lv-games{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.lv-g{background:var(--bg3);border:1px solid var(--line);color:var(--text-mid);border-radius:100px;padding:5px 12px;font:600 .76rem Inter,sans-serif;cursor:pointer}
.lv-g.on{border-color:var(--gold);color:var(--text);background:rgba(255,176,32,.12)}
.lv-one{font-size:.78rem;color:var(--text-dim);margin-bottom:10px}
.lv-stage{display:grid;grid-template-columns:190px 1fr;gap:20px;align-items:center;background:radial-gradient(circle at 20% 30%,rgba(123,79,212,.22),transparent 60%),var(--bg3);border:1px solid var(--line);border-radius:18px;padding:18px;position:relative;overflow:hidden;transition:border-color .3s}
.lv-stage.evo{border-color:rgba(255,176,32,.6);background:radial-gradient(circle at 20% 30%,rgba(255,176,32,.25),transparent 60%),var(--bg3)}
.lv-img{position:relative;height:170px;display:flex;align-items:center;justify-content:center;font-size:3rem}
.lv-img img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 10px 20px rgba(0,0,0,.5));transition:transform .3s}
.lv-badge{position:absolute;right:-4px;bottom:-4px;font:800 1.1rem Orbitron,sans-serif;background:linear-gradient(135deg,var(--purple,#7B4FD4),var(--gold,#FFB020));color:#fff;border-radius:12px;padding:6px 11px;box-shadow:0 6px 16px rgba(0,0,0,.45)}
.lv-name{font:700 1.15rem Orbitron,sans-serif;margin-bottom:12px}
.lv-tag{display:inline-block;vertical-align:middle;font:700 .62rem Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#1a1200;background:var(--gold);border-radius:100px;padding:3px 8px;margin-left:6px}
.lv-stat{display:grid;grid-template-columns:90px 1fr 70px;align-items:center;gap:10px;font-size:.8rem;color:var(--text-mid);margin-bottom:8px}
.lv-stat b{text-align:right;color:var(--text);font-variant-numeric:tabular-nums}
.lv-bar{height:9px;background:rgba(255,255,255,.07);border-radius:9px;overflow:hidden}
.lv-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--purple,#7B4FD4),var(--gold,#FFB020));border-radius:9px;transition:width .6s cubic-bezier(.2,.8,.2,1)}
.lv-gold{color:#ffd24a;font-weight:700;text-shadow:0 0 10px rgba(255,200,60,.45)}
.lv-xp{font-size:.78rem;color:var(--text-dim);margin-top:4px}
.lv-dots{display:flex;gap:6px;margin:14px 0 12px;flex-wrap:wrap}
.lv-dot{width:22px;height:8px;border-radius:5px;border:0;background:rgba(255,255,255,.12);cursor:pointer;padding:0}
.lv-dot.on{background:var(--purple-light,#a07ef0)}
.lv-dot.up.on{background:var(--gold)}
.lv-ctrl{display:flex;gap:8px}
.lv-ctrl button{border:1px solid var(--gold);background:linear-gradient(135deg,rgba(123,79,212,.35),rgba(255,176,32,.25));color:var(--text);font:700 .8rem Inter,sans-serif;border-radius:10px;padding:8px 16px;cursor:pointer}
.lv-ctrl .lv-step{background:var(--bg2);border-color:var(--line)}
.lv-ctrl button:disabled{opacity:.4;cursor:default}
.lv-stage.pulse .lv-badge{animation:lvPop .45s ease}
.lv-stage.pulse .lv-img img{animation:lvBump .45s ease}
.lv-stage.boom:after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 25% 45%,rgba(255,220,120,.85),transparent 55%);animation:lvFlash .9s ease forwards;pointer-events:none}
.lv-stage.boom .lv-img img{animation:lvEvo .9s ease}
@keyframes lvPop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
@keyframes lvBump{40%{transform:translateY(-6px) scale(1.04)}}
@keyframes lvFlash{0%{opacity:1}100%{opacity:0}}
@keyframes lvEvo{0%{transform:scale(.6) rotate(-8deg);filter:brightness(3)}60%{transform:scale(1.12)}100%{transform:none}}
@media(max-width:640px){.lv-stage{grid-template-columns:1fr;gap:10px}.lv-img{height:130px}.lv-stat{grid-template-columns:76px 1fr 56px}}
.fm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.fm-card{background:var(--bg3);border:1px solid var(--line);border-radius:14px;padding:12px;font-size:.84rem}
.fm-row{display:flex;align-items:center;gap:6px;margin-bottom:8px}
.fm-im{flex:1;height:96px;display:flex;align-items:center;justify-content:center;font-size:2rem;background:radial-gradient(circle,rgba(123,79,212,.18),transparent 70%);border-radius:10px}
.fm-im img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 6px 12px rgba(0,0,0,.45))}
.fm-arr{color:var(--gold);font-size:1.1rem}
.fm-up{color:var(--gold);font-size:.76rem;font-weight:600;margin-top:2px}
.fm-g{color:var(--text-mid);font-size:.76rem;margin-top:4px}
.fm-g:hover{color:var(--gold)}
.fm-k{color:var(--text-dim);font-size:.74rem;margin-top:2px}
.tl-row{display:grid;grid-template-columns:48px 1fr;gap:12px;align-items:start;padding:10px 0;border-top:1px dashed var(--line);font-size:.86rem;color:var(--text-mid)}
.tl-row img{width:48px;height:48px;object-fit:contain}
.tl-row b{color:var(--text)}
.tl-row small{display:block;color:var(--text-dim);margin-top:2px}
.gm-row{display:grid;grid-template-columns:56px 1fr;gap:14px;padding:14px 0;border-top:1px dashed var(--line)}
.gm-row.noi,.tl-row.noi{grid-template-columns:1fr}
.gm-row:first-child{border-top:0;padding-top:2px}
.gm-row img{width:56px;height:56px;object-fit:contain}
.gm-h{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;margin-bottom:4px}
.gm-h b{font:700 .95rem Orbitron,sans-serif;color:var(--text)}
.gm-h span{font-size:.74rem;color:var(--gold)}
.gm-t{font-size:.86rem;color:var(--text-mid);line-height:1.5}
.gm-m{font-size:.78rem;color:var(--text-dim);margin-top:6px}
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
  .rd-game.has-guide{grid-template-columns:52px 1fr}
  .rd-game.has-guide .rd-guide{grid-column:1/-1;flex-direction:row;justify-content:center;padding:9px;font-size:1.1rem}
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

  // ── Widget « Level up » ──
  const LVL={}; let LVN=0;
  function initWidgets(root){ root.querySelectorAll('.rd-lvl[data-lvl]').forEach(el=>{ const d=LVL[el.dataset.lvl]; if(d&&!el.dataset.on){ el.dataset.on='1'; levelUp(el,d); } }); }
  function levelUp(el,D){
    let gi_=Math.max(0,D.games.findIndex(x=>list(x.levels).length>1)), lv=0, timer=null;
    const fmt=v=>v==null?'—':Number(v).toLocaleString('en-US');
    function steps(g){
      // Avec donnees : un pas par niveau. Sans : forme de base puis forme amelioree.
      if(list(g.levels).length>1) return g.levels.map(x=>Object.assign({},x,{evo:!!(g.evolve_at&&x.lv>=g.evolve_at&&g.upgrade)}));
      return [{lv:null,evo:false},{lv:null,evo:true}];
    }
    function render(){
      const g=D.games[gi_], S=steps(g), st=S[lv], evo=st.evo;
      const maxP=Math.max(1,...S.map(x=>x.power||0)), maxA=Math.max(1,...S.map(x=>x.ammo||0));
      const base=g.base_image||D.entry.image_url, img=evo?(g.upgrade_image||((D.ev.image&&(!g.upgrade||g.upgrade===D.ev.to))?D.ev.image:null)||base):base;
      const name=evo?(g.upgrade||D.ev.to||g.base_name||D.entry.name):(g.base_name||D.entry.name);
      const label=st.lv!=null?'V'+st.lv:(evo?'MAX':'BASE');
      const bar=(k,ic,lab,max)=>st[k]!=null?'<div class="lv-stat"><span>'+ic+' '+lab+'</span><div class="lv-bar"><i style="width:'+Math.round(st[k]/max*100)+'%"></i></div><b>'+fmt(st[k])+'</b></div>':'';
      el.innerHTML='<div class="rd-sub" style="margin-top:0">⬆️ Level up</div>'
        +(D.games.length>1?'<div class="lv-games">'+D.games.map((x,i)=>'<button class="lv-g'+(i===gi_?' on':'')+'" data-i="'+i+'">'+esc(gi(x.game)[0])+'</button>').join('')+'</div>':'<div class="lv-one">'+esc(gi(g.game)[0])+'</div>')
        +'<div class="lv-stage'+(evo?' evo':'')+'"><div class="lv-img">'+(img?'<img src="'+esc(img)+'" alt="" onerror="this.remove()"/>':'🔫')+'<span class="lv-badge">'+label+'</span></div>'
        +'<div class="lv-info"><div class="lv-name">'+esc(name)+(evo?' <span class="lv-tag">Upgraded</span>':'')+'</div>'
        +bar('power','💥','Damage',maxP)+bar('ammo','🎯','Ammo',maxA)
        +(st.exp!=null?'<div class="lv-xp">XP to next level: <b>'+fmt(st.exp)+'</b></div>':'')
        +(st.mod?'<div class="lv-xp">Mod at this level: <b>'+esc(st.mod)+'</b></div>':'')
        +(evo&&g.upgrade_price&&!(list(g.levels).length>1)?'<div class="lv-xp">Upgrade price: <b style="color:var(--gold)">'+fmt(String(g.upgrade_price).replace(/\D/g,''))+' bolts</b>'+(g.upgrade_gold_bolts?' + <b class="lv-gold">🔩 '+esc(g.upgrade_gold_bolts)+' gold bolts</b>':'')+'</div>'+(g.upgrade_where?'<div class="lv-xp">Where: '+lk(g.upgrade_where)+'</div>':''):'')
        +'<div class="lv-dots">'+S.map((x,i)=>'<button class="lv-dot'+(i<=lv?' on':'')+(x.evo?' up':'')+'" data-s="'+i+'" title="'+(x.lv!=null?'V'+x.lv:(x.evo?'Upgraded':'Base'))+'"></button>').join('')+'</div>'
        +'<div class="lv-ctrl"><button class="lv-play">'+(timer?'⏸ Pause':(lv>=S.length-1?'↺ Replay':'▶ Level up'))+'</button><button class="lv-step" '+(lv>=S.length-1?'disabled':'')+'>+1</button></div>'
        +'</div></div>';
      el.querySelectorAll('.lv-g').forEach(b=>b.onclick=()=>{ stop(); gi_=+b.dataset.i; lv=0; render(); });
      el.querySelectorAll('.lv-dot').forEach(b=>b.onclick=()=>{ stop(); go(+b.dataset.s); });
      el.querySelector('.lv-play').onclick=()=>{ if(timer){ stop(); render(); return; } if(lv>=S.length-1) lv=0; play(); };
      el.querySelector('.lv-step').onclick=()=>{ stop(); go(lv+1); };
    }
    function go(n){
      const S=steps(D.games[gi_]); n=Math.max(0,Math.min(S.length-1,n));
      const wasEvo=S[lv].evo; lv=n; render();
      const stg=el.querySelector('.lv-stage'); if(!stg) return;
      stg.classList.add(S[lv].evo&&!wasEvo?'boom':'pulse');
    }
    function play(){ timer=setInterval(()=>{ const S=steps(D.games[gi_]); if(lv>=S.length-1){ stop(); render(); return; } go(lv+1); },900); go(lv); }
    function stop(){ if(timer){ clearInterval(timer); timer=null; } }
    D.games.forEach(x=>[x.upgrade_image,x.base_image].forEach(u=>{ if(u){ const im=new Image(); im.src=u; } }));
    render();
  }

  // ── Liens : chaque nom connu (fiche, personnage, lieu, jeu) devient cliquable ──
  let SB=null, IDX=null, RX=null;
  const NAMES={};
  function loadIndex(){
    if(IDX) return IDX;
    if(!SB) return Promise.resolve();
    const add=(name,k,extra)=>{ name=(name||'').trim(); if(name.length<4) return; const key=name.toLowerCase(); if(!NAMES[key]) NAMES[key]={k,n:name,x:extra}; };
    IDX=Promise.all([
      SB.from('site_wiki_entries').select('id,type,name'),
      SB.from('site_characters').select('name'),
      SB.from('site_locations').select('name,planet_id')
    ]).then(([e,c,l])=>{
      const pl={}; (e.data||[]).forEach(r=>{ if(r.type==='planet') pl[r.id]=r.name; });
      (e.data||[]).forEach(r=>add(r.name,r.type));
      (c.data||[]).forEach(r=>add(r.name,'character'));
      (l.data||[]).forEach(r=>add(r.name,'location',pl[r.planet_id]||''));
      const keys=Object.keys(NAMES).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
      if(keys.length) RX=new RegExp('(^|[^A-Za-z0-9])('+keys.join('|')+')(?![A-Za-z0-9])','gi');
    }).catch(()=>{});
    return IDX;
  }
  // Echappe le texte et entoure les noms connus d'un lien
  function lk(t){
    t=String(t==null?'':t);
    if(!RX) return esc(t);
    let out='',last=0; RX.lastIndex=0; let m;
    while((m=RX.exec(t))){
      const st=m.index+m[1].length, hit=NAMES[m[2].toLowerCase()];
      out+=esc(t.slice(last,st))+'<a class="rd-lk" data-k="'+hit.k+'" data-n="'+esc(hit.n)+'"'+(hit.x?' data-x="'+esc(hit.x)+'"':'')+'>'+esc(m[2])+'</a>';
      last=st+m[2].length;
    }
    return out+esc(t.slice(last));
  }
  // chip cliquable si elle contient au moins un lien
  const chip=(cls,ic,t)=>{ const h=lk(t); return '<span class="rd-chip'+(cls?' '+cls:'')+(h.indexOf('rd-lk')>=0?' lk':'')+'">'+ic+' '+h+'</span>'; };
  // Transforme en liens les textes marques data-al d'un bloc deja affiche
  function autoLink(root,sb){
    if(!root) return; if(sb) SB=SB||sb;
    loadIndex().then(()=>{
      root.querySelectorAll('[data-al]').forEach(el=>{
        if(el.dataset.done) return; el.dataset.done='1';
        const h=lk(el.textContent);
        if(h.indexOf('rd-lk')<0) return;
        el.innerHTML=h;
        const c=el.closest('.al-chip'); if(c) c.classList.add('lk');
      });
    });
  }
  // Ouverture : la page peut fournir RCD.onOpen(kind,name,extra) ; sinon on change de page
  function openLink(k,n,x){
    if(window.RCD&&RCD.onOpen&&RCD.onOpen(k,n,x)) return;
    const e=encodeURIComponent;
    if(k==='location') location.href='map.html#loc='+e(n);
    else if(k==='game') location.href='wiki.html#game='+e(n);
    else if(k==='character') location.href='wiki.html#char='+e(n);
    else location.href='wiki.html#entry='+e(k)+':'+e(n);
  }
  document.addEventListener('click',ev=>{
    const t=ev.target.closest&&ev.target.closest('.rd-pane [data-k], .rd-pane .rd-chip.lk, [data-al] .rd-lk, .al-chip.lk');
    if(!t) return;
    const a=t.dataset.k?t:t.querySelector('[data-k]'); if(!a) return;
    ev.preventDefault(); ev.stopPropagation();
    openLink(a.dataset.k,a.dataset.n,a.dataset.x);
  });

  // Monte une barre d'onglets. tabs: [{key,label,count,html?:string,load?:async()=>string}]
  function mount(bar,pane,tabs,onShown){
    bar.className='rd-tabs';
    bar.innerHTML=tabs.map((t,i)=>'<button class="rd-tab'+(i?'':' on')+'" data-i="'+i+'">'+esc(t.label)+(t.count!=null?'<span class="n">'+t.count+'</span>':'')+'</button>').join('');
    const show=async i=>{
      bar.querySelectorAll('.rd-tab').forEach((b,j)=>b.classList.toggle('on',j===i));
      const t=tabs[i];
      if(t.html!=null){ pane.innerHTML='<div class="rd-pane">'+t.html+'</div>'; initWidgets(pane); onShown&&onShown(t.key,pane); return; }
      pane.innerHTML='<div class="rd-pane"><div class="rd-load"><i></i>Loading…</div></div>';
      try{ await loadIndex(); t.html=await t.load(); }catch(e){ pane.innerHTML='<div class="rd-pane"><div class="rd-empty">Could not load this tab. Try again.</div></div>'; return; }
      if(bar.querySelector('.rd-tab.on')!==bar.children[i]) return;
      pane.innerHTML='<div class="rd-pane">'+t.html+'</div>'; initWidgets(pane); onShown&&onShown(t.key,pane);
    };
    bar.querySelectorAll('.rd-tab').forEach(b=>b.onclick=()=>show(+b.dataset.i));
    show(0);
  }

  const GUIDES=['Ratchet & Clank (2002)','Going Commando','Up Your Arsenal','Deadlocked','Size Matters','Tools of Destruction','Secret Agent Clank','Quest for Booty','A Crack in Time','All 4 One','Full Frontal Assault','Into the Nexus','Ratchet & Clank (2016)','Rift Apart'];
  const guideBtn=g=>GUIDES.includes(g)?'<a class="rd-guide" href="guides.html#game='+encodeURIComponent(g)+'" title="Open the '+esc(gi(g)[0])+' guide">📗<span>Guide</span></a>':'';
  const gameBlock=(g,inner,guide)=>'<div class="rd-game'+(guide&&GUIDES.includes(g.game)?' has-guide':'')+'"><div data-k="game" data-n="'+esc(g.game)+'" title="Open the game sheet">'+cover(g.game)+'</div><div><div class="rd-gh" data-k="game" data-n="'+esc(g.game)+'">'+esc(gi(g.game)[0])+'<span>'+esc(gi(g.game)[1])+'</span></div>'+inner+'</div>'+(guide?guideBtn(g.game):'')+'</div>';
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
      return gameBlock(g,h,true);
    }).join('');
  }
  function planetEnemies(d){
    const gs=list(d&&d.games).filter(g=>list(g.enemies).length);
    if(!gs.length) return empty('No enemy list for this world yet.');
    return gs.map(g=>gameBlock(g,'<div class="rd-chips">'+g.enemies.map(e=>{
      const b=BOSS.test(e); return chip(b?'boss':'',b?'👑':'👾',e);
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
      if(list(g.equipment).length) h+='<div class="rd-sub">Weapons & gadgets found here</div><div class="rd-chips">'+g.equipment.map(s=>chip('','🎒',s)).join('')+'</div>';
      return gameBlock(g,h);
    }).join('');
  }
  // Onglets de planete. first: onglet d'ouverture deja rendu (aperçu ou lieux).
  function planetTabs(sb,entry,bar,pane,first,onShown){ SB=sb;
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
      return '<div class="rd-cv" data-k="game" data-n="'+esc(n)+'"><div class="ph">'+(g[2]?cover(n,'x'):'🎮')+'</div><b>'+esc(g[0])+'</b>'+esc(g[1])+'</div>';
    }).join('')+'</div>';
    let h='<div class="rd-sub" style="margin-top:0">Appears in · '+a.length+' game'+(a.length>1?'s':'')+'</div>'+grid(sorted);
    const m=list(d&&d.mentioned_in);
    if(m.length) h+='<div class="rd-sub" style="margin-top:18px">Mentioned in</div><div class="rd-chips">'+m.map(n=>'<span class="rd-chip lk" data-k="game" data-n="'+esc(n)+'">💬 '+esc(gi(n)[0])+'</span>').join('')+'</div>';
    return h;
  }
  function weaponEvolution(d,entry){
    const ev=d&&d.evolution;
    const ups=[]; list(d&&d.games).forEach(g=>{ if(g.upgrade) ups.push(g); });
    const fam=list(d&&d.family);
    if(!ev&&!ups.length&&!fam.length) return empty('This item has no upgraded form.');
    let h='';
    if(fam.length){
      const pic=(u,alt)=>'<div class="fm-im">'+(u?'<img src="'+esc(u)+'" alt="'+esc(alt)+'" loading="lazy" onerror="this.remove()"/>':'🔫')+'</div>';
      const fg=list(d&&d.games).filter(g=>list(g.levels).length>1||g.upgrade).map(g=>{ const f=fam.find(x=>x.name===g.model)||fam.find(x=>x.game===g.game)||{}; return Object.assign({},g,{base_image:f.image,base_name:g.model||f.name,upgrade_image:g.upgrade_image||f.upgrade_image}); });
      if(fg.length){ const id='lv'+(++LVN); LVL[id]={entry,ev:{},games:fg}; h+='<div class="rd-lvl" data-lvl="'+id+'"></div>'; }
      h+='<div class="rd-sub" style="margin-top:'+(fg.length?'20px':'0')+'">One model per game</div><div class="fm-grid">'+fam.map(x=>'<div class="fm-card"><div class="fm-row">'+pic(x.image,x.name)+(x.upgrade?'<span class="fm-arr">➜</span>'+pic(x.upgrade_image||x.image,x.upgrade):'')+'</div><b>'+esc(x.name)+'</b>'+(x.upgrade?'<div class="fm-up">⬆️ '+esc(x.upgrade)+'</div>':'')+'<div class="fm-g" data-k="game" data-n="'+esc(x.game)+'">'+esc(gi(x.game)[0])+' · '+esc(gi(x.game)[1])+'</div>'+(x.kind?'<div class="fm-k">'+esc(x.kind)+'</div>':'')+'</div>').join('')+'</div>';
      return h;
    }
    // Animation de montee de niveau : un jeu a la fois
    const lvGames=list(d&&d.games).filter(g=>list(g.levels).length>1||g.upgrade);
    if(lvGames.length){
      const id='lv'+(++LVN);
      LVL[id]={entry,ev:ev||{},games:lvGames};
      h+='<div class="rd-lvl" data-lvl="'+id+'"></div>';
    }
    if(ups.length){
      h+='<div class="rd-sub" style="margin-top:20px">Upgrade in each game</div><table class="rd-shop"><thead><tr><th>Game</th><th>Becomes</th><th>Upgrade price</th></tr></thead><tbody>'
        +ups.map(g=>'<tr><td><div class="gc" data-k="game" data-n="'+esc(g.game)+'">'+cover(g.game,'x')+esc(gi(g.game)[0])+'</div></td><td>'+(g.upgrade_image?'<img src="'+esc(g.upgrade_image)+'" alt="" loading="lazy" onerror="this.remove()" style="width:44px;height:44px;object-fit:contain;vertical-align:middle;margin-right:8px"/>':'')+esc(g.upgrade)+(g.upgrade_where?'<div style="font-size:.74rem;color:var(--text-dim);margin-top:3px">📍 '+lk(g.upgrade_where)+'</div>':'')+'</td><td>'+(g.upgrade_price?'<span class="rd-price">'+num(g.upgrade_price)+' bolts</span>':'—')+(g.upgrade_gold_bolts?'<div class="lv-gold" style="margin-top:3px">+ 🔩 '+esc(g.upgrade_gold_bolts)+' gold bolts</div>':'')+'</td></tr>').join('')
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
        return '<tr><td><div class="gc">'+cover(g.game,'x')+'<div><a class="rd-lk" data-k="game" data-n="'+esc(g.game)+'">'+esc(gi(g.game)[0])+'</a>'+(g.model?'<div style="color:var(--gold);font-size:.74rem;font-weight:600">'+esc(g.model)+'</div>':'')+'</div></div></td><td>'+(lk(g.where)||'—')+'</td><td>'+(g.price?'<span class="rd-price">'+num(g.price)+' bolts</span>':'<span style="color:var(--text-dim)">Free / found</span>')+'</td><td>'+ammo+'</td></tr>';
      }).join('')+'</tbody></table>';
  }
  function weaponTabs(sb,entry,bar,pane,first,onShown){ SB=sb;
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
    if(facts.length) h+='<div class="rd-chips" style="margin-bottom:6px">'+facts.map(r=>'<span class="rd-chip">'+r[3]+' <b style="color:var(--text)">'+r[1]+'</b> '+lk([].concat(d[r[0]]).join(', '))+'</span>').join('')+'</div>';
    rows.filter(r=>r[2]==='l'&&d&&list(d[r[0]]).length).forEach(r=>{
      h+='<div class="rd-sub">'+r[1]+'</div><div class="rd-chips">'+d[r[0]].map(x=>chip('',r[3],x)).join('')+'</div>';
    });
    list(d&&d.obtained).forEach((o,i)=>{ if(!i) h+='<div class="rd-sub">How to get it</div>'; h+=gameBlock(o,'<div style="font-size:.88rem;color:var(--text-mid)">'+lk(o.where)+'</div>'); });
    return h||empty('No profile information yet.');
  }
  const CREATURE=[['homeworld','Homeworld','l','🪐'],['leader','Leader','l','👑'],['headquarters','Headquarters','l','🏯'],['organization','Organization','l','🏢'],['locations','Where to find them','l','📍'],['members','Notable members','l','👤'],['attacks','Attacks','l','⚔️'],['defense','Defense','l','🛡️'],['allies','Allies','l','🤝'],['enemies','Enemies','l','💢']];
  const VEHICLE=[['kind','Type','t','🚀'],['manufacturer','Maker','t','🏭'],['organization','Used by','t','🏢'],['owner','Owner','t','👤'],['role','Role','t','🎯'],['weapon','Weapons','t','💥'],['homeworld','Origin','t','🪐'],['usable_at','Where you drive it','l','🕹️'],['seen_at','Also seen at','l','👀']];
  function simpleTabs(kind){ return function(sb,entry,bar,pane,first,onShown){ SB=sb;
    let p=null; const get=()=>p||(p=fetchDetails(sb,entry.id));
    mount(bar,pane,[first,
      {key:'games',label:'🎮 Games',load:async()=>weaponGames(await get())},
      kind==='creature'?{key:'profile',label:'🧬 Profile',load:async()=>profile(await get(),CREATURE)}
                      :{key:'specs',label:'⚙️ Specs',load:async()=>profile(await get(),VEHICLE)}
    ],onShown);
  }; }
  // ── Personnages ──
async function charDetails(sb,id){
  if(('c'+id) in CACHE) return CACHE['c'+id];
  const {data,error}=await sb.from('site_characters').select('details').eq('id',id).maybeSingle();
  if(error) throw error;
  return CACHE['c'+id]=(data&&data.details)||null;
}
const ORDER_G=Object.keys(GAMES);
function charGames(c,d){
  const all=[...new Set([].concat(list(c.games),list(d&&d.games)))].filter(g=>GAMES[g]);
  return all.sort((a,b)=>ORDER_G.indexOf(a)-ORDER_G.indexOf(b));
}
const SRC='<div class="rd-sub" style="margin-top:18px;text-transform:none;letter-spacing:0;font-weight:500">Source: Ratchet &amp; Clank Wiki (Fandom), CC BY-SA.</div>';
function charStory(c,d){
  const st=list(d&&d.story);
  if(!st.length) return (c.description?'<p class="cd-desc" style="margin-top:0">'+lk(c.description)+'</p>':'')+empty('No game-by-game story for this character yet.');
  return st.map(x=>gameBlock({game:x.game},'<div style="font-size:.88rem;color:var(--text-mid);line-height:1.55">'+lk(x.text)+'</div>')).join('')+SRC;
}
function charProfile(c,d){
  let h='';
  [['family','Family','👪'],['affiliation','Affiliation','🏢'],['residence','Residence','🏠']].forEach(r=>{
    const v=list(d&&d[r[0]]); if(v.length) h+='<div class="rd-sub"'+(h?'':' style="margin-top:0"')+'>'+r[1]+'</div><div class="rd-chips">'+v.map(x=>chip('',r[2],x)).join('')+'</div>';
  });
  const tal=list(d&&d.talents);
  if(tal.length) h+='<div class="rd-sub"'+(h?'':' style="margin-top:0"')+'>Talents (Ranger Rumble)</div>'+tal.map(t=>'<div class="tl-row"><img src="'+esc(t.icon)+'" alt="" loading="lazy" onerror="this.remove()"/><div><b>'+esc(t.name)+'</b><div>'+lk(t.text)+'</div>'+(t.effect?'<small>'+esc(t.effect)+'</small>':'')+'</div></div>').join('');
  const sk=list(d&&d.skins);
  if(sk.length) h+='<div class="rd-sub">Skins (Ranger Rumble)</div><div class="rd-covers">'+sk.map(x=>'<div class="rd-cv"><div class="ph" style="background:var(--bg3)"><img src="'+esc(x.icon)+'" alt="" loading="lazy" style="object-fit:contain" onerror="this.remove()"/></div><b>'+esc(x.name)+'</b></div>').join('')+'</div>';
  return h||empty('No profile information yet.');
}
// ── Fiche d'un jeu (modes, heros, economie + armes, gadgets, planetes, persos) ──
const GKEY=n=>{ n=String(n||''); if(n==='Ratchet & Clank') return 'Ratchet & Clank (2002)'; n=n.replace(/^Ratchet & Clank: /,''); return n; };
const ico=u=>u?'<img src="'+esc(u)+'" alt="" loading="lazy" onerror="this.remove()"/>':'';
function gameTabs(sb,g,bar,pane){ SB=sb;
  const d=g.details||{}, tabs=[], key=GKEY(g.name);
  const src=d.source?'<div class="rd-sub" style="margin-top:18px;text-transform:none;letter-spacing:0;font-weight:500">Source: '+esc(d.source)+'.</div>':'';
  const mapLk=m=>'<a class="rd-lk" data-k="location" data-n="'+esc(m)+'">'+esc(m)+'</a>';
  if(list(d.modes).length) tabs.push({key:'modes',label:'🎮 Game modes',count:d.modes.length,html:d.modes.map(m=>'<div class="gm-row'+(m.icon?'':' noi')+'">'+ico(m.icon)+'<div><div class="gm-h"><b>'+esc(m.name)+'</b><span>'+esc(m.info||'')+'</span></div><div class="gm-t">'+lk(m.text)+'</div>'+(list(m.maps).length?'<div class="gm-m">🗺️ '+m.maps.map(mapLk).join(' · ')+'</div>':'')+'</div></div>').join('')+src});
  if(list(d.heroes).length) tabs.push({key:'heroes',label:'🦸 '+(d.heroes_label||'Heroes'),count:d.heroes.length,load:async()=>{
    const {data}=await sb.from('site_characters').select('name,role,image_url').in('name',d.heroes);
    const by={}; (data||[]).forEach(c=>by[c.name]=c);
    return '<div class="rd-covers">'+d.heroes.map(n=>{ const c=by[n]||{}; return '<div class="rd-cv" data-k="character" data-n="'+esc(n)+'" style="cursor:pointer"><div class="ph">'+(c.image_url?'<img src="'+esc(c.image_url)+'" alt="" loading="lazy" style="object-position:top" onerror="this.remove()"/>':'🦸')+'</div><b>'+esc(n.replace(/ \((Ranger Rumble|Quest for Booty)\)/,''))+'</b>'+esc((c.role||'').split(' · ')[0])+'</div>'; }).join('')+'</div>';
  }});
  if(list(d.economy).length||list(d.progression).length) tabs.push({key:'eco',label:'💰 Economy',html:(list(d.economy).length?'<div class="rd-sub" style="margin-top:0">Currencies & collectibles</div>'+d.economy.map(e=>'<div class="tl-row'+(e.icon?'':' noi')+'">'+ico(e.icon)+'<div><b>'+esc(e.name)+'</b><div>'+lk(e.text)+'</div></div></div>').join(''):'')+(list(d.progression).length?'<div class="rd-sub">Progression</div><ol class="rd-tl">'+d.progression.map(t=>'<li>'+lk(t)+'</li>').join('')+'</ol>':'')+src});
  // Listes tirees de la base : tout ce qui est rattache a ce jeu
  const grid=(rows,k)=>'<div class="rd-covers">'+rows.map(r=>'<div class="rd-cv" data-k="'+k+'" data-n="'+esc(r.name)+'" style="cursor:pointer"><div class="ph" style="background:var(--bg3)">'+(r.image_url?'<img src="'+esc(r.image_url)+'" alt="" loading="lazy" style="object-fit:contain" onerror="this.remove()"/>':'')+'</div><b>'+esc(r.name)+'</b>'+esc(r.subtitle||'')+'</div>').join('')+'</div>';
  const fromWiki=(type,cat,lbl,k)=>({key:type+(cat||''),label:lbl,load:async()=>{
    let q=sb.from('site_wiki_entries').select('name,subtitle,image_url').eq('type',type).contains('games',[key]).order('sort_order').order('name');
    if(cat) q=q.eq('category',cat);
    const {data,error}=await q; if(error) throw error;
    return (data&&data.length)?grid(data,k):empty('Nothing listed for this game yet.');
  }});
  tabs.push(fromWiki('weapon','weapon','🔫 Weapons','weapon'));
  tabs.push(fromWiki('weapon','gadget','🛠️ Gadgets','weapon'));
  tabs.push(fromWiki('planet',null,'🪐 Planets','planet'));
  tabs.push({key:'chars',label:'👥 Characters',load:async()=>{
    const {data,error}=await sb.from('site_characters').select('name,role,image_url').contains('games',[key]).order('name');
    if(error) throw error;
    return (data&&data.length)?'<div class="rd-covers">'+data.map(c=>'<div class="rd-cv" data-k="character" data-n="'+esc(c.name)+'" style="cursor:pointer"><div class="ph">'+(c.image_url?'<img src="'+esc(c.image_url)+'" alt="" loading="lazy" style="object-position:top" onerror="this.remove()"/>':'👤')+'</div><b>'+esc(c.name)+'</b>'+esc((c.role||'').split(' · ')[0])+'</div>').join('')+'</div>':empty('No characters listed for this game yet.');
  }});
  mount(bar,pane,tabs);
}
function charTabs(sb,c,bar,pane,first,onShown){ SB=sb;
  let p=null; const get=()=>p||(p=charDetails(sb,c.id));
  mount(bar,pane,[first,
    {key:'games',label:'🎮 Games',load:async()=>{ const g=charGames(c,await get()); return g.length?weaponGames({appears_in:g}):empty('No game list yet.'); }},
    {key:'story',label:'📜 Story',load:async()=>charStory(c,await get())},
    {key:'profile',label:'🧬 Profile',load:async()=>charProfile(c,await get())}
  ],onShown);
}
window.RCD={openLink,autoLink,planetTabs,weaponTabs,creatureTabs:simpleTabs('creature'),vehicleTabs:simpleTabs('vehicle'),charTabs,gameTabs,mount};
})();
