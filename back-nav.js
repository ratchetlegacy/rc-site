/* Ratchet Legacy — bouton Retour
   Une fenêtre (fiche du wiki, photo agrandie, menu mobile…) ajoute une
   étape dans l'historique quand elle s'ouvre. Le bouton Retour du
   téléphone ou du navigateur la ferme, au lieu de quitter la page pour
   revenir au menu. Chargé par toutes les pages publiques. */
(function(){
  if(window.__rlBackNav) return; window.__rlBackNav=true;
  var stack=[];            // fenêtres ouvertes, la plus récente à la fin
  var ignorePop=0;         // retours déclenchés par nous-mêmes
  var base=new WeakSet();  // éléments fixes déjà visibles au chargement (fonds, décors)
  function isOverlay(el){
    if(!el||el.nodeType!==1||el===document.body||el===document.documentElement) return false;
    var cs=getComputedStyle(el);
    if(cs.position!=='fixed'||cs.display==='none'||cs.visibility==='hidden'||cs.pointerEvents==='none') return false;
    var r=el.getBoundingClientRect();
    return r.width>=innerWidth*0.6 && r.height>=innerHeight*0.6;
  }
  function closeOverlay(el){
    var btn=el.querySelector('.cd-close,.rl-mobile-close,#rl-close-mail,[aria-label="Close"],[aria-label="Fermer"],[class*="close"],[onclick*="close" i],[onclick*="Close"]');
    if(btn){ btn.click(); }
    if(isOverlay(el)){
      ['open','show','on','active','visible'].forEach(function(c){ el.classList.remove(c); });
      if(isOverlay(el) && el.style.display) el.style.display='none';
      if(isOverlay(el) && !el.id && el.parentNode===document.body) el.parentNode.removeChild(el);
    }
    document.body.style.overflow='';
  }
  function dropped(i){
    stack.splice(i,1);
    // fermée avec la croix : on retire l'étape ajoutée à l'ouverture
    if(history.state && history.state.rlOverlay){ ignorePop++; history.back(); }
  }
  function check(el){
    if(base.has(el)) return;
    var i=stack.indexOf(el), open=isOverlay(el);
    if(open && i<0){ stack.push(el); history.pushState({rlOverlay:stack.length}, ''); }
    else if(!open && i>=0) dropped(i);
  }
  function start(){
    document.querySelectorAll('body *').forEach(function(el){ if(isOverlay(el)) base.add(el); });
    new MutationObserver(function(ms){
      ms.forEach(function(m){
        if(m.type==='attributes') check(m.target);
        else {
          m.addedNodes.forEach(function(n){ if(n.nodeType===1&&n.parentNode===document.body) check(n); });
          m.removedNodes.forEach(function(n){ var i=stack.indexOf(n); if(i>=0) dropped(i); });
        }
      });
    }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','style'],childList:true});
    // capture : passe avant les autres gestionnaires de la page
    window.addEventListener('popstate',function(e){
      if(ignorePop){ ignorePop--; e.stopImmediatePropagation(); return; }
      var el=stack.pop();
      if(el){ e.stopImmediatePropagation(); closeOverlay(el); }
    },true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
