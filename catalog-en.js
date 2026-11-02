// Display-only English labels for catalog values that are stored in French.
// The database keeps its original values (the tracker uses them as keys);
// the site shows the English version. name_en / description_en override
// name / description when they are filled in.
(function(){
  const PLATFORM={
    'Affiches':'Posters','Peluche':'Plush','Porte-clé peluche':'Plush Keychain',
    'Shirt - Pull':'Shirts & Sweaters','Goodie divers':'Misc Goodies',
    'Figurine Vinyle':'Vinyl Figure','Vinyles':'Vinyl Records','Cartes':'Cards',
    'Papeterie':'Stationery','Roman':'Novel','Carte mémoire':'Memory Card',
    'Blue-Ray':'Blu-ray','Cap - Hat':'Caps & Hats','Kit - pencil case':'Pencil Case Kit',
    'Playstation 2':'PlayStation 2','Playstation 3':'PlayStation 3',
    'Playstation 4':'PlayStation 4','Playstation 5':'PlayStation 5'
  };
  const EDITION={
    'Classique':'Standard','Divers':'Misc','Impression Exclusive':'Exclusive Print',
    'Limitée':'Limited','Démo Only':'Demo Only','Non Commercialisé':'Not for Sale',
    'Dématérialisé':'Digital','Employés Only':'Employees Only','Serie 1':'Series 1',
    'Serie 2':'Series 2','Playstation Hit':'PlayStation Hits'
  };
  const REGION={'JAP (NTSC-J)':'JP (NTSC-J)'};
  function loc(c){
    if(!c||c._loc) return c;
    const o=Object.assign({},c,{_loc:true,_raw:c});
    if(c.name_en) o.name=c.name_en;
    if(c.description_en) o.description=c.description_en;
    if(PLATFORM[c.platform]) o.platform=PLATFORM[c.platform];
    if(EDITION[c.edition]) o.edition=EDITION[c.edition];
    if(REGION[c.region]) o.region=REGION[c.region];
    return o;
  }
  window.RCEN={loc,PLATFORM,EDITION,REGION};
})();
