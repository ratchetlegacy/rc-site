/* Ratchet Legacy — Soundtracks (wiki.html#ost)
   Albums and tracks come from the ost_albums / ost_tracks tables (admin › Musique).
   A player bar stays at the bottom of the page, so the music keeps playing
   while you browse the wiki. */
(function(){
  const $=s=>document.querySelector(s);
  const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const T=s=>{ s=Math.max(0,Math.floor(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
  const cov=u=>u?String(u).replace('/image/upload/','/image/upload/w_400,h_400,c_fill,f_auto,q_auto/'):'';
  let ALBUMS=[], cur=null, queue=[], qi=-1;
  const audio=new Audio(); audio.preload='none';

  const css=`
#ost-root .oa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:18px}
#ost-root .oa{background:var(--bg2);border:1px solid var(--line);border-radius:16px;overflow:hidden;cursor:pointer;transition:.2s;text-align:left;padding:0;color:inherit;font:inherit}
#ost-root .oa:hover{transform:translateY(-4px);border-color:var(--purple)}
#ost-root .oa .im{aspect-ratio:1;background:linear-gradient(135deg,#2a1d45,#3d2410);display:flex;align-items:center;justify-content:center;font-size:3rem}
#ost-root .oa .im img{width:100%;height:100%;object-fit:cover;display:block}
#ost-root .oa .tx{padding:12px 14px 14px}
#ost-root .oa b{display:block;font-size:.92rem;line-height:1.3}
#ost-root .oa span{display:block;color:var(--text-dim);font-size:.78rem;margin-top:4px}
#ost-root .od-back{background:none;border:1px solid var(--line);color:var(--text-mid,#cfd3e6);border-radius:10px;padding:7px 12px;cursor:pointer;font:inherit;font-size:.82rem;margin-bottom:16px}
#ost-root .od-head{display:grid;grid-template-columns:200px 1fr;gap:24px;align-items:end;margin-bottom:20px}
#ost-root .od-head img,#ost-root .od-head .ph{width:200px;height:200px;border-radius:14px;object-fit:cover;box-shadow:0 18px 40px rgba(0,0,0,.5);background:linear-gradient(135deg,#2a1d45,#3d2410);display:flex;align-items:center;justify-content:center;font-size:4rem}
#ost-root .od-head h2{font-family:'Orbitron',sans-serif;font-size:1.35rem;line-height:1.3;margin:0 0 6px}
#ost-root .od-head .meta{color:var(--text-dim);font-size:.85rem;line-height:1.6}
#ost-root .od-acts{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
#ost-root .od-acts button,#ost-root .od-acts a{border:0;border-radius:100px;padding:10px 18px;font:inherit;font-weight:700;font-size:.85rem;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
#ost-root .od-play{background:linear-gradient(135deg,var(--purple),var(--orange));color:#fff}
#ost-root .od-yt{background:rgba(255,0,0,.12);color:#ff6b6b;border:1px solid rgba(255,80,80,.35)!important}
#ost-root .od-list{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--bg2)}
#ost-root .ot{display:grid;grid-template-columns:34px 1fr auto;gap:12px;align-items:center;padding:11px 16px;border-top:1px solid var(--line);cursor:pointer;width:100%;background:none;border-left:0;border-right:0;border-bottom:0;color:inherit;font:inherit;text-align:left}
#ost-root .ot:first-child{border-top:0}
#ost-root .ot:hover{background:rgba(255,255,255,.03)}
#ost-root .ot .n{color:var(--text-dim);font-size:.8rem;text-align:right}
#ost-root .ot .d{color:var(--text-dim);font-size:.8rem}
#ost-root .ot.on{background:rgba(123,79,212,.12)}
#ost-root .ot.on .t{color:var(--gold)}
#ost-root .od-credit{color:var(--text-dim);font-size:.78rem;margin-top:12px;line-height:1.5}
#ost-root .o-empty{text-align:center;padding:40px 16px;color:var(--text-dim);border:1px dashed var(--line);border-radius:16px}
@media(max-width:640px){
  #ost-root .od-head{grid-template-columns:1fr;justify-items:center;text-align:center}
  #ost-root .od-head img,#ost-root .od-head .ph{width:180px;height:180px}
  #ost-root .od-acts{justify-content:center}
}
#ost-bar{position:fixed;left:50%;bottom:12px;transform:translate(-50%,160%);z-index:150;width:min(760px,calc(100% - 24px));background:rgba(16,18,31,.97);backdrop-filter:blur(10px);border:1px solid rgba(123,79,212,.45);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.6);padding:10px 12px;display:grid;grid-template-columns:48px 1fr auto;gap:12px;align-items:center;transition:transform .3s cubic-bezier(.2,.8,.2,1)}
#ost-bar.on{transform:translate(-50%,0)}
#ost-bar img{width:48px;height:48px;border-radius:9px;object-fit:cover;background:#2a1d45}
#ost-bar .i{min-width:0}
#ost-bar .i b{display:block;font-size:.86rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ost-bar .i small{display:block;color:var(--text-dim);font-size:.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ost-bar .sk{display:flex;align-items:center;gap:8px;margin-top:4px;font-size:.68rem;color:var(--text-dim)}
#ost-bar input[type=range]{flex:1;accent-color:#FF8A2A;height:4px;margin:0}
#ost-bar .c{display:flex;gap:4px;align-items:center}
#ost-bar .c button{background:none;border:0;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1rem}
#ost-bar .c button:hover{background:rgba(255,255,255,.08)}
#ost-bar .c .pp{background:linear-gradient(135deg,var(--purple),var(--orange));width:42px;height:42px}
#ost-bar .c .x{color:var(--text-dim);font-size:.85rem}
body.ost-playing{padding-bottom:96px}
body.ost-playing .rlt-launch{bottom:96px!important;transition:bottom .3s}
@media(max-width:520px){#ost-bar{grid-template-columns:40px 1fr auto;gap:8px;padding:8px}#ost-bar img{width:40px;height:40px}#ost-bar .c button{width:32px;height:32px}#ost-bar .c .pp{width:38px;height:38px}#ost-bar .c .pv{display:none}}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  const bar=document.createElement('div'); bar.id='ost-bar'; bar.setAttribute('role','region'); bar.setAttribute('aria-label','Music player');
  bar.innerHTML='<img alt=""/><div class="i"><b>—</b><small></small><div class="sk"><span class="tc">0:00</span><input type="range" min="0" max="1000" value="0" aria-label="Seek"/><span class="td">0:00</span></div></div>'
    +'<div class="c"><button class="pv" title="Previous" aria-label="Previous">⏮</button><button class="pp" title="Play / pause" aria-label="Play">▶</button><button class="nx" title="Next" aria-label="Next">⏭</button><button class="x" title="Close the player" aria-label="Close">✕</button></div>';
  document.body.appendChild(bar);
  const seek=bar.querySelector('input'), pp=bar.querySelector('.pp');
  let dragging=false;

  function playAt(i){
    if(i<0||i>=queue.length) return;
    qi=i; const t=queue[i];
    audio.src=t.url; audio.play().catch(()=>{});
    bar.querySelector('img').src=cov(t.album.cover_url)||'';
    bar.querySelector('b').textContent=t.title;
    bar.querySelector('small').textContent=t.album.title+(t.album.composer?' · '+t.album.composer:'');
    bar.classList.add('on'); document.body.classList.add('ost-playing');
    if('mediaSession' in navigator){
      try{ navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.album.composer||'',album:t.album.title,artwork:t.album.cover_url?[{src:cov(t.album.cover_url),sizes:'400x400'}]:[]}); }catch(e){}
    }
    mark();
  }
  function mark(){
    const t=queue[qi];
    document.querySelectorAll('#ost-root .ot').forEach(b=>b.classList.toggle('on',!!t&&b.dataset.id===t.id));
  }
  audio.addEventListener('play',()=>{ pp.textContent='⏸'; pp.setAttribute('aria-label','Pause'); });
  audio.addEventListener('pause',()=>{ pp.textContent='▶'; pp.setAttribute('aria-label','Play'); });
  audio.addEventListener('ended',()=>{ if(qi<queue.length-1) playAt(qi+1); });
  audio.addEventListener('timeupdate',()=>{
    bar.querySelector('.tc').textContent=T(audio.currentTime);
    bar.querySelector('.td').textContent=T(audio.duration||queue[qi]&&queue[qi].duration);
    if(!dragging&&audio.duration) seek.value=Math.round(audio.currentTime/audio.duration*1000);
  });
  seek.addEventListener('input',()=>{ dragging=true; if(audio.duration) bar.querySelector('.tc').textContent=T(seek.value/1000*audio.duration); });
  seek.addEventListener('change',()=>{ if(audio.duration) audio.currentTime=seek.value/1000*audio.duration; dragging=false; });
  pp.onclick=()=>{ if(!audio.src&&queue.length) return playAt(0); audio.paused?audio.play():audio.pause(); };
  bar.querySelector('.pv').onclick=()=>{ if(audio.currentTime>3) audio.currentTime=0; else playAt(Math.max(0,qi-1)); };
  bar.querySelector('.nx').onclick=()=>playAt(qi+1);
  bar.querySelector('.x').onclick=()=>{ audio.pause(); bar.classList.remove('on'); document.body.classList.remove('ost-playing'); };
  if('mediaSession' in navigator){
    try{
      navigator.mediaSession.setActionHandler('previoustrack',()=>playAt(Math.max(0,qi-1)));
      navigator.mediaSession.setActionHandler('nexttrack',()=>playAt(qi+1));
    }catch(e){}
  }

  function renderGrid(){
    const root=$('#ost-root'); cur=null;
    if(!ALBUMS.length){ root.innerHTML='<div class="o-empty">🎵 The first soundtracks are on their way. Come back soon!</div>'; return; }
    root.innerHTML='<div class="oa-grid">'+ALBUMS.map((a,i)=>'<button class="oa" data-i="'+i+'"><div class="im">'+(a.cover_url?'<img src="'+E(cov(a.cover_url))+'" alt="" loading="lazy"/>':'🎵')+'</div><div class="tx"><b>'+E(a.title)+'</b><span>'+E([a.game,a.tracks.length+' track'+(a.tracks.length>1?'s':'')].filter(Boolean).join(' · '))+'</span></div></button>').join('')+'</div>';
    root.querySelectorAll('.oa').forEach(b=>b.onclick=()=>openAlbum(+b.dataset.i));
  }
  function openAlbum(i){
    const a=ALBUMS[i]; if(!a) return; cur=a;
    const total=a.tracks.reduce((s,t)=>s+(+t.duration||0),0);
    const root=$('#ost-root');
    root.innerHTML='<button class="od-back">← All albums</button>'
      +'<div class="od-head">'+(a.cover_url?'<img src="'+E(cov(a.cover_url))+'" alt=""/>':'<div class="ph">🎵</div>')
      +'<div><h2>'+E(a.title)+'</h2><div class="meta">'+E([a.game,a.composer].filter(Boolean).join(' · '))+'<br>'+a.tracks.length+' track'+(a.tracks.length>1?'s':'')+(total?' · '+Math.round(total/60)+' min':'')+'</div>'
      +'<div class="od-acts">'+(a.tracks.length?'<button class="od-play">▶ Play the album</button>':'')+(a.youtube_url?'<a class="od-yt" href="'+E(a.youtube_url)+'" target="_blank" rel="noopener">▶ YouTube</a>':'')+'</div></div></div>'
      +(a.tracks.length?'<div class="od-list">'+a.tracks.map((t,k)=>'<button class="ot" data-k="'+k+'" data-id="'+E(t.id)+'"><span class="n">'+(k+1)+'</span><span class="t">'+E(t.title)+'</span><span class="d">'+(t.duration?T(t.duration):'')+'</span></button>').join('')+'</div>':'<div class="o-empty">No tracks in this album yet.</div>')
      +(a.credit?'<div class="od-credit">'+E(a.credit)+'</div>':'');
    root.querySelector('.od-back').onclick=renderGrid;
    const play=k=>{ queue=a.tracks.map(t=>Object.assign({album:a},t)); playAt(k); };
    const pb=root.querySelector('.od-play'); if(pb) pb.onclick=()=>play(0);
    root.querySelectorAll('.ot').forEach(b=>b.onclick=()=>play(+b.dataset.k));
    mark();
    const sec=document.getElementById('ost'); if(sec) sec.scrollIntoView({behavior:'smooth',block:'start'});
  }

  async function load(){
    if(typeof sb==='undefined') return;
    try{
      const [{data:al,error:e1},{data:tr,error:e2}]=await Promise.all([
        sb.from('ost_albums').select('id,title,game,cover_url,composer,credit,youtube_url,ordre').eq('visible',true).order('ordre').order('created_at'),
        sb.from('ost_tracks').select('id,album_id,title,url,duration,ordre').eq('visible',true).order('ordre').order('created_at')
      ]);
      if(e1||e2) throw (e1||e2);
      ALBUMS=(al||[]).map(a=>Object.assign(a,{tracks:(tr||[]).filter(t=>t.album_id===a.id)}));
    }catch(e){ ALBUMS=[]; }
    const card=document.getElementById('hub-ost');
    if(card&&ALBUMS.length){
      card.style.display='';
      setTimeout(()=>{ if(!card.style.backgroundImage&&ALBUMS[0].cover_url){
        card.style.backgroundImage='linear-gradient(to top,rgba(16,18,31,.92),rgba(16,18,31,.45)),url('+cov(ALBUMS[0].cover_url)+')';
        card.style.backgroundSize='cover'; card.style.backgroundPosition='center'; } },1500);
    }
    renderGrid();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load); else load();
})();
