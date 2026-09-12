/* Ratchet Legacy — shared site enhancements
   Logo injection · scroll fade-in · subtle logo glow */
(function(){
  const LOGO='https://ratchetlegacy.github.io/rc-tracker/Ratchet%20Legacy.jpg';

  // ---- Inject styles ----
  const css=`
  .nav-logo .mark{overflow:hidden;padding:0!important}
  .nav-logo .mark img{width:100%;height:100%;object-fit:cover;border-radius:9px}
  .rl-glow{animation:rlGlow 3.4s ease-in-out infinite}
  @keyframes rlGlow{
    0%,100%{box-shadow:0 4px 16px -4px rgba(123,79,212,.5)}
    50%{box-shadow:0 6px 26px -2px rgba(255,107,26,.7),0 0 0 1px rgba(255,200,90,.25)}
  }
  /* scroll reveal */
  .reveal{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.2,.7,.3,1),transform .7s cubic-bezier(.2,.7,.3,1)}
  .reveal.in{opacity:1;transform:none}
  @media(prefers-reduced-motion:reduce){.reveal{opacity:1!important;transform:none!important}}
  /* strengthen hover on interactive cards & buttons */
  .uni-card,.listing,.char,.guide-card,.cvcat-card,.card,.stat-cell{transition:transform .2s cubic-bezier(.2,.7,.3,1),box-shadow .2s,border-color .2s}
  .btn{transition:transform .18s cubic-bezier(.2,.7,.3,1),box-shadow .18s,background .18s!important}
  .btn:hover{transform:translateY(-2px)}
  .nav-cta:hover{box-shadow:0 8px 24px -6px rgba(255,107,26,.6)}
  .nav-insta-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);font-size:1.05rem;text-decoration:none;flex-shrink:0;transition:transform .15s}
  .nav-insta-btn:hover{transform:translateY(-2px) scale(1.05)}
  /* Keep ALL page names visible in the header — horizontal scroll on small screens, never hidden */
  .nav-burger{display:none!important}
  .nav-links{display:flex!important}
  @media(max-width:900px){
    .nav{padding:12px 14px;gap:8px}
    .nav-logo{font-size:.82rem;gap:8px}
    .nav-logo .mark{width:32px;height:32px}
    .nav-links{overflow-x:auto;flex-wrap:nowrap;gap:2px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    .nav-links::-webkit-scrollbar{display:none}
    .nav-links a{padding:7px 10px;font-size:.8rem;white-space:nowrap;flex-shrink:0}
  }
  /* ── Mobile refinements (phones) ── */
  @media(max-width:600px){
    .page-hero,.hero{padding-left:16px;padding-right:16px}
    .page-hero h1,.hero h1{font-size:1.9rem!important;line-height:1.15}
    .page-hero p,.hero p{font-size:.92rem}
    .wrap,.layout{padding-left:16px!important;padding-right:16px!important}
    /* grids collapse to 2 or 1 columns */
    .chars{grid-template-columns:1fr 1fr!important;gap:12px!important}
    .uni-grid,.uni-cards{grid-template-columns:1fr!important}
    .cat-menu,.admin-cards{grid-template-columns:1fr 1fr!important;gap:12px!important}
    .grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))!important}
    .guides,.news-grid,.listings{grid-template-columns:1fr!important}
    .wiki-hub{grid-template-columns:1fr 1fr!important;gap:12px!important}
    .vault-stats{gap:18px!important}
    .vs-item b{font-size:1.3rem!important}
    /* modals full-width-ish */
    .cd-inner,.pmodal-box,.fmodal-box,.lb-inner{max-width:94vw!important}
    .cd-top{grid-template-columns:1fr!important}
    .chapter{grid-template-columns:1fr!important}
    /* buttons easier to tap */
    .btn{padding:12px 18px}
    /* tables/rows wrap */
    .guide-row{flex-wrap:wrap}
    /* about section stacks */
    .about{flex-direction:column!important;text-align:center}
    .about-avatar{margin:0 auto}
    /* map taller on phones so it's usable */
    .map-stage{aspect-ratio:1/1!important;max-height:none!important}
    .gal-tabs{gap:6px}
    .gal-tab{padding:8px 14px;font-size:.72rem}
    /* story side nav becomes horizontal scroll */
    .story-nav{position:static!important;flex-direction:row!important;overflow-x:auto;max-height:none!important;padding-bottom:8px}
    /* picker (arcade) stacks */
    .picker{grid-template-columns:1fr!important}
  }
  @media(max-width:400px){
    .chars,.cat-menu,.admin-cards,.wiki-hub{grid-template-columns:1fr!important}
  }
  /* ── Mobile hamburger menu ── */
  .rl-burger{display:none;background:none;border:none;color:var(--text,#EEF0F8);font-size:1.5rem;cursor:pointer;padding:4px 8px;flex-shrink:0}
  @media(max-width:820px){
    .nav-links{display:none!important}
    .rl-burger{display:block}
    .nav-insta-btn,.nav-cta{display:none!important}
    .nav-burger{display:none!important}
  }
  .rl-mobile-menu{position:fixed;inset:0;z-index:2000;background:rgba(10,11,20,.98);backdrop-filter:blur(10px);display:none;flex-direction:column;padding:80px 24px 24px;overflow-y:auto}
  .rl-mobile-menu.open{display:flex}
  .rl-mobile-menu a{padding:16px 8px;font-family:'Orbitron',sans-serif;font-size:1.1rem;font-weight:600;color:var(--text,#EEF0F8);border-bottom:1px solid rgba(255,255,255,.08);text-decoration:none}
  .rl-mobile-menu a:active{color:var(--purple-light,#9B6FF4)}
  .rl-mobile-close{position:absolute;top:20px;right:22px;background:rgba(255,255,255,.1);border:none;color:#fff;width:42px;height:42px;border-radius:12px;font-size:1.3rem;cursor:pointer}
  .rl-mobile-menu .rl-mm-cta{background:linear-gradient(135deg,var(--purple,#7B4FD4),var(--orange,#FF6B1A));color:#fff;border-radius:12px;text-align:center;margin-top:18px;border:none}
  .rl-mobile-menu .rl-mm-insta{background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:#fff;border-radius:12px;text-align:center;margin-top:10px;border:none}
  `;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }

  ready(function(){
    // ---- Replace nav-logo emoji with the logo image + glow ----
    document.querySelectorAll('.nav-logo .mark').forEach(m=>{
      m.classList.add('rl-glow');
      m.innerHTML='<img src="'+LOGO+'" alt="Ratchet Legacy" onerror="this.parentNode.textContent=\'🔧\'"/>';
    });

    // ---- Hero: add the logo above the eyebrow (only on the homepage hero) ----
    const heroInner=document.querySelector('.hero-inner');
    if(heroInner && !heroInner.querySelector('.rl-hero-logo')){
      const wrap=document.createElement('div');
      wrap.className='rl-hero-logo';
      wrap.style.cssText='width:96px;height:96px;border-radius:22px;overflow:hidden;margin:0 auto 24px;box-shadow:0 10px 40px -8px rgba(123,79,212,.6);border:1px solid rgba(255,255,255,.1)';
      wrap.classList.add('rl-glow');
      wrap.innerHTML='<img src="'+LOGO+'" alt="Ratchet Legacy" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.style.display=\'none\'"/>';
      heroInner.insertBefore(wrap, heroInner.firstChild);
    }

    // ---- Footer: add the logo above the foot-logo text ----
    document.querySelectorAll('.foot-logo').forEach(fl=>{
      if(fl.querySelector('.rl-foot-logo')) return;
      const img=document.createElement('div');
      img.className='rl-foot-logo';
      img.style.cssText='width:52px;height:52px;border-radius:12px;overflow:hidden;margin:0 auto 12px;opacity:.9';
      img.innerHTML='<img src="'+LOGO+'" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.style.display=\'none\'"/>';
      fl.parentNode.insertBefore(img, fl);
    });

    // ---- Scroll reveal: mark sensible blocks, then observe ----
    const targets=document.querySelectorAll(
      'section, .uni-card, .app-show, .stats-band, .trade-box, .about, '+
      '.game, .lore-card, .how-step, .listing, .guide-card, .chapter, .sec-head'
    );
    targets.forEach(t=>{ if(!t.closest('.hero')) t.classList.add('reveal'); });

    if('IntersectionObserver' in window){
      const io=new IntersectionObserver((entries)=>{
        entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
      },{threshold:0.08, rootMargin:'0px 0px -40px 0px'});
      targets.forEach(t=>io.observe(t));
      // safety: reveal anything still hidden after 2.5s
      setTimeout(()=>document.querySelectorAll('.reveal:not(.in)').forEach(el=>{
        if(el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      }),2500);
    } else {
      targets.forEach(t=>t.classList.add('in'));
    }

    // ---- Homepage: fill universe cards with real images from the database ----
    injectUniverseImages();
    injectHeroImage();
    buildMobileMenu();
    injectAppCarousel();
  });

  async function injectAppCarousel(){
    const screen=document.getElementById('app-carousel-screen');
    if(!screen || !window.supabase) return;
    try{
      const sb=window.supabase.createClient(
        'https://ihucxnmqnhevfvlamgwc.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlodWN4bm1xbmhldmZ2bGFtZ3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDQ5ODcsImV4cCI6MjA5NzI4MDk4N30.RhH778it6rcz44fdqdMLz7v-j8BWyKGGIJN4vHauhgU'
      );
      const {data}=await sb.from('site_settings').select('key,value').in('key',['app_shot_1','app_shot_2','app_shot_3','app_shot_4','app_shot_5']);
      if(!data) return;
      const S={}; data.forEach(r=>{ S[r.key]=r.value; });
      const shots=['app_shot_1','app_shot_2','app_shot_3','app_shot_4','app_shot_5'].map(k=>S[k]).filter(u=>u&&u.trim());
      if(!shots.length) return; // keep the mockup if no screenshots
      // replace phone content with a carousel
      const st=document.createElement('style');
      st.textContent='#app-carousel-screen{padding:0!important;overflow:hidden;position:relative}'
        +'.ac-track{display:flex;transition:transform .5s cubic-bezier(.3,.7,.3,1);height:100%}'
        +'.ac-slide{min-width:100%;height:100%}'
        +'.ac-slide img{width:100%;height:100%;object-fit:cover;display:block}'
        +'.ac-dots{position:absolute;bottom:10px;left:0;right:0;display:flex;gap:6px;justify-content:center;z-index:2}'
        +'.ac-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.4)}'
        +'.ac-dot.on{background:#fff;width:18px;border-radius:100px}';
      document.head.appendChild(st);
      screen.innerHTML='<div class="ac-track" id="ac-track">'
        + shots.map(u=>'<div class="ac-slide"><img src="'+u+'" alt=""/></div>').join('')
        + '</div><div class="ac-dots" id="ac-dots">'
        + shots.map((_,i)=>'<div class="ac-dot'+(i===0?' on':'')+'"></div>').join('')
        + '</div>';
      let idx=0;
      setInterval(()=>{
        idx=(idx+1)%shots.length;
        document.getElementById('ac-track').style.transform='translateX(-'+(idx*100)+'%)';
        document.querySelectorAll('#ac-dots .ac-dot').forEach((d,i)=>d.classList.toggle('on',i===idx));
      }, 2800);
    }catch(e){}
  }

  function buildMobileMenu(){
    const nav=document.querySelector('.nav');
    const links=document.querySelector('.nav-links');
    if(!nav || !links || document.querySelector('.rl-burger')) return;
    // burger button
    const burger=document.createElement('button');
    burger.className='rl-burger'; burger.setAttribute('aria-label','Menu'); burger.innerHTML='☰';
    nav.appendChild(burger);
    // overlay menu
    const menu=document.createElement('div');
    menu.className='rl-mobile-menu';
    let html='<button class="rl-mobile-close" aria-label="Close">✕</button>';
    links.querySelectorAll('a').forEach(a=>{
      const cls = a.classList.contains('nav-cta') ? 'rl-mm-cta' : (a.classList.contains('nav-insta-btn') ? 'rl-mm-insta' : '');
      let label=a.textContent.trim();
      if(a.classList.contains('nav-insta-btn')) label='📸 Instagram';
      html+='<a href="'+a.getAttribute('href')+'"'+(a.target?' target="'+a.target+'"':'')+(cls?' class="'+cls+'"':'')+'>'+label+'</a>';
    });
    menu.innerHTML=html;
    document.body.appendChild(menu);
    burger.addEventListener('click',()=>{ menu.classList.add('open'); document.body.style.overflow='hidden'; });
    menu.querySelector('.rl-mobile-close').addEventListener('click',()=>{ menu.classList.remove('open'); document.body.style.overflow=''; });
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{ menu.classList.remove('open'); document.body.style.overflow=''; }));
  }

  async function injectHeroImage(){
    const hero=document.querySelector('.page-hero, .hero');
    if(!hero || !window.supabase) return;
    // page key from filename (index, wiki, story, news, guides, trades, database, map, arcade)
    let page=(location.pathname.split('/').pop()||'index.html').replace('.html','');
    if(!page) page='index';
    try{
      const sb=window.supabase.createClient(
        'https://ihucxnmqnhevfvlamgwc.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlodWN4bm1xbmhldmZ2bGFtZ3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDQ5ODcsImV4cCI6MjA5NzI4MDk4N30.RhH778it6rcz44fdqdMLz7v-j8BWyKGGIJN4vHauhgU'
      );
      const {data}=await sb.from('site_settings').select('value').eq('key','hero_img_'+page).maybeSingle();
      const url=data&&data.value;
      if(url){
        hero.style.backgroundImage='linear-gradient(to bottom,rgba(10,11,20,.72),rgba(10,11,20,.92)),url('+url+')';
        hero.style.backgroundSize='cover';
        hero.style.backgroundPosition='center';
      }
    }catch(e){}
  }

  async function injectUniverseImages(){
    if(!window.supabase) return;
    try{
      const sb=window.supabase.createClient(
        'https://ihucxnmqnhevfvlamgwc.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlodWN4bm1xbmhldmZ2bGFtZ3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDQ5ODcsImV4cCI6MjA5NzI4MDk4N30.RhH778it6rcz44fdqdMLz7v-j8BWyKGGIJN4vHauhgU'
      );
      const {data}=await sb.from('site_settings').select('key,value');
      if(!data) return;
      const S={}; data.forEach(r=>{ S[r.key]=r.value; });
      const cards=document.querySelectorAll('.uni-card');
      if(S.home_img_games && cards[0]) setCardBg(cards[0], S.home_img_games);
      if(S.home_img_characters && cards[1]) setCardBg(cards[1], S.home_img_characters);
      if(S.home_img_lore && cards[2]) setCardBg(cards[2], S.home_img_lore);
      // About image
      const aboutLogo=document.getElementById('about-logo');
      if(S.home_img_about && aboutLogo){
        aboutLogo.textContent='';
        aboutLogo.innerHTML='<img src="'+S.home_img_about+'" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.textContent=\'🦊\'"/>';
      }
    }catch(e){ /* silent */ }
  }
  function setCardBg(card, url){
    const shade=card.querySelector('.shade');
    card.style.backgroundImage='linear-gradient(to top,rgba(10,11,20,.95) 10%,rgba(10,11,20,.4) 60%,rgba(10,11,20,.2)),url('+url+')';
    card.style.backgroundSize='cover';
    card.style.backgroundPosition='center';
    const ic=card.querySelector('.ic'); if(ic) ic.style.opacity='.5';
  }
})();
