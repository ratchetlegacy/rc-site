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
  });

  async function injectUniverseImages(){
    const cards=document.querySelectorAll('.uni-card');
    if(!cards.length || !window.supabase) return;
    try{
      const sb=window.supabase.createClient(
        'https://ihucxnmqnhevfvlamgwc.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlodWN4bm1xbmhldmZ2bGFtZ3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDQ5ODcsImV4cCI6MjA5NzI4MDk4N30.RhH778it6rcz44fdqdMLz7v-j8BWyKGGIJN4vHauhgU'
      );
      const [{data:games},{data:chars}]=await Promise.all([
        sb.from('site_games').select('image_url').not('image_url','is',null).limit(1),
        sb.from('site_characters').select('image_url').not('image_url','is',null).limit(1)
      ]);
      const gImg=games&&games[0]&&games[0].image_url;
      const cImg=chars&&chars[0]&&chars[0].image_url;
      // card 0 = Games, card 1 = Characters (per the homepage order)
      if(gImg && cards[0]) setCardBg(cards[0], gImg);
      if(cImg && cards[1]) setCardBg(cards[1], cImg);
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
