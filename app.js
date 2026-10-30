// v47 light/dark theme toggle (LIGHT is the default; choice applied in <head> before paint, persisted in localStorage 'gc-theme'; ?theme=light|dark also sets it)
(function(){
  var H=document.documentElement;
  function lab(){var l=H.getAttribute('data-theme')==='light';[].forEach.call(document.querySelectorAll('.theme-t'),function(b){
    var fr=l?'Passer au thème sombre':'Passer au thème clair',en=l?'Switch to dark theme':'Switch to light theme';
    var s=H.dataset.lang==='en'?en:fr;b.setAttribute('aria-label',s);b.title=s;b.setAttribute('aria-pressed',l?'true':'false')})}
  [].forEach.call(document.querySelectorAll('.theme-t'),function(b){b.addEventListener('click',function(){
    var n=H.getAttribute('data-theme')==='light'?'dark':'light';H.setAttribute('data-theme',n);try{localStorage.setItem('gc-theme',n)}catch(e){}lab()})});
  new MutationObserver(lab).observe(H,{attributes:true,attributeFilter:['data-lang']});lab();
})();
// v46 Mockup access gate (code checked against its SHA-256; unlock remembered in localStorage 'gc-mk')
(function(){
  var H=document.documentElement,HASH='0fb6f3b74421092bb15436234b1d835043420249b4300d2323b5a889d7c9a2c8';
  var home=!H.hasAttribute('data-mk'),pre=home?'':'../',idx=pre+'chez-vous/index.html';
  function ok(){try{return localStorage.getItem('gc-mk')==='1'}catch(e){return false}}
  function hex(b){return [].map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}
  function sha(s){if(window.crypto&&crypto.subtle&&window.TextEncoder)return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(hex);return Promise.reject()}
  function T(fr,en){return '<span lang="fr">'+fr+'</span><span lang="en">'+en+'</span>'}
  var box=null,target=null;
  function build(locked){
    box=document.createElement('div');box.className='mk-gate'+(locked?' mk-hard':'');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','mk-t');
    box.innerHTML='<form class="mk-card" novalidate>'+(locked?'':'<button type="button" class="mk-x" aria-label="Fermer / Close">×</button>')+
      '<p class="mk-ic">'+document.querySelector('.mk-link .ic-lock').outerHTML+'</p>'+
      '<p class="mk-k">Mockup</p><h2 id="mk-t">'+T('Accès réservé','Restricted access')+'</h2>'+
      '<p class="mk-p">'+T('Entrez votre code pour découvrir nos propositions.','Enter your code to view our proposals.')+'</p>'+
      '<label class="mk-sr" for="mk-in">Code</label><div class="mk-row"><input id="mk-in" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Code" required>'+
      '<button type="submit" class="btn mk-go">'+T('Entrer','Enter')+'</button></div>'+
      '<p class="mk-err" role="alert" hidden>'+T('Code incorrect.','Incorrect code.')+'</p>'+
      '<p class="mk-foot">'+(locked?'<a href="'+pre+'index.html">'+T('← Retour au site','← Back to the site')+'</a> · ':'')+T('Pas de code ? ','No code? ')+'<a href="mailto:info@genieculturel.ch">info@genieculturel.ch</a></p></form>';
    document.body.appendChild(box);
    var f=box.querySelector('form'),inp=box.querySelector('input'),err=box.querySelector('.mk-err');
    f.addEventListener('submit',function(e){e.preventDefault();var v=(inp.value||'').trim().toLowerCase();if(!v){inp.focus();return}
      sha(v).then(function(h){if(h===HASH){try{localStorage.setItem('gc-mk','1')}catch(x){}
          if(target){location.href=target}else{H.classList.remove('mk-locked');close();try{window.dispatchEvent(new Event('resize'))}catch(x){}}}
        else{err.hidden=false;f.classList.remove('mk-shake');void f.offsetWidth;f.classList.add('mk-shake');inp.select()}},
        function(){err.hidden=false})});
    var x=box.querySelector('.mk-x');if(x)x.addEventListener('click',close);
    if(!locked)box.addEventListener('click',function(e){if(e.target===box)close()});
  }
  function open(t,locked){target=t||null;if(!box)build(locked);box.hidden=false;if(!locked)document.body.style.overflow='hidden';setTimeout(function(){box.querySelector('input').focus()},30)}
  function close(){if(box&&!box.classList.contains('mk-hard')){box.hidden=true;document.body.style.overflow=''}else if(box&&!H.classList.contains('mk-locked')){box.remove();box=null}}
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&box&&!box.hidden)close()});
  [].forEach.call(document.querySelectorAll('.mk-link'),function(a){a.addEventListener('click',function(e){if(ok())return;e.preventDefault();open(a.href,false)})});
  if(!home&&H.classList.contains('mk-locked'))open(null,true);
  // old home links (#chez-vous / #cv-list) now lead to the locked Mockup page
  if(home&&/^#(chez-vous|cv-list)$/.test(location.hash)){if(ok())location.replace(idx);else{history.replaceState(null,'',location.pathname+location.search);open(idx,false)}}
})();
// v56 per-concept access (Mockup cards): each « Découvrir le concept » asks its own password (SHA-256 only) + mandatory confidentiality checkbox; unlock kept in sessionStorage 'gc-cv-<slug>'
(function(){
  var links=document.querySelectorAll('a[data-cv]');if(!links.length)return;
  var H=document.documentElement,K={
    'europe-memoires-vivantes':'2416cf75830de98f6f3112e910960adb9ba2976fd69aa13825a31e20fe2af376',
    'chronoscope-xr':'4b2fec575fa262b89766e8d0267320569ef383e6e3f3d251d711f022a0031be4',
    'opera-liege':'3586c42d6b76677710e8c73c6088b9cc09f3495fc4b491da7e63079504267f65',
    'espace-gutenberg':'a988c7936031c1fec85904ec8bfb11dfd3199b3a68d34458afe811a87944156b'};
  function hex(b){return [].map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}
  function sha(s){if(window.crypto&&crypto.subtle&&window.TextEncoder)return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(hex);return Promise.reject()}
  function T(fr,en){return '<span lang="fr">'+fr+'</span><span lang="en">'+en+'</span>'}
  function ok(k){try{return sessionStorage.getItem('gc-cv-'+k)==='1'}catch(e){return false}}
  var box=null,slug=null,href=null;
  function build(){
    box=document.createElement('div');box.className='mk-gate cv-gate';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','cv-t');
    var lock=document.querySelector('.mk-link .ic-lock');
    box.innerHTML='<form class="mk-card" novalidate><button type="button" class="mk-x" aria-label="Fermer / Close">×</button>'+
      '<p class="mk-ic">'+(lock?lock.outerHTML:'')+'</p>'+
      '<p class="mk-k">'+T('Concept protégé','Protected concept')+'</p><h2 id="cv-t" class="cv-name"></h2>'+
      '<p class="mk-p">'+T('Entrez le mot de passe de ce concept pour y accéder.','Enter this concept’s password to access it.')+'</p>'+
      '<label class="cv-ck"><input type="checkbox" id="cv-ok" required><span>'+T(
        'Je reconnais que les contenus accessibles via ce lien sont des propositions confidentielles, propriété de Génie Culturel, protégées par le droit d’auteur. Toute reproduction, diffusion, adaptation ou exploitation, totale ou partielle, sans accord écrit préalable est interdite.',
        'I acknowledge that the content accessible via this link consists of confidential proposals, the property of Génie Culturel, protected by copyright. Any reproduction, distribution, adaptation or use, in whole or in part, without prior written consent is prohibited.')+'</span></label>'+
      '<label class="mk-sr" for="cv-in">'+T('Mot de passe','Password')+'</label><div class="mk-row"><input id="cv-in" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="••••••">'+
      '<button type="submit" class="btn mk-go cv-go is-off" aria-disabled="true">'+T('Valider','Confirm')+'</button></div>'+
      '<p class="mk-err cv-err-ck" role="alert" hidden>'+T('Veuillez cocher la case ci-dessus pour continuer.','Please tick the box above to continue.')+'</p>'+
      '<p class="mk-err cv-err-pw" role="alert" hidden>'+T('Mot de passe incorrect pour ce concept.','Incorrect password for this concept.')+'</p>'+
      '<p class="mk-foot">'+T('Pas de mot de passe ? ','No password? ')+'<a href="mailto:info@genieculturel.ch">info@genieculturel.ch</a></p></form>';
    document.body.appendChild(box);
    var f=box.querySelector('form'),inp=box.querySelector('#cv-in'),ck=box.querySelector('#cv-ok'),go=box.querySelector('.cv-go'),e1=box.querySelector('.cv-err-ck'),e2=box.querySelector('.cv-err-pw');
    function sync(){go.classList.toggle('is-off',!ck.checked);go.setAttribute('aria-disabled',ck.checked?'false':'true');if(ck.checked)e1.hidden=true}
    ck.addEventListener('change',sync);
    function shake(){f.classList.remove('mk-shake');void f.offsetWidth;f.classList.add('mk-shake')}
    f.addEventListener('submit',function(e){e.preventDefault();e2.hidden=true;
      if(!ck.checked){e1.hidden=false;box.querySelector('.cv-ck').classList.add('cv-need');shake();return}
      var v=(inp.value||'').trim().toLowerCase();if(!v){inp.focus();return}
      var want=K[slug];
      sha(v).then(function(h){if(h===want){try{sessionStorage.setItem('gc-cv-'+slug,'1')}catch(x){}location.href=href}
        else{e2.hidden=false;shake();inp.select()}},function(){e2.hidden=false})});
    box.querySelector('.mk-x').addEventListener('click',close);
    box.addEventListener('click',function(e){if(e.target===box)close()});
    box._reset=function(){inp.value='';ck.checked=false;e1.hidden=true;e2.hidden=true;box.querySelector('.cv-ck').classList.remove('cv-need');sync()};
  }
  function open(a){slug=a.getAttribute('data-cv');href=a.href;if(!box)build();box._reset();
    var card=a.closest('.cvcard'),h=card&&card.querySelector('h3');box.querySelector('.cv-name').innerHTML=h?h.innerHTML:'';
    box.hidden=false;document.body.style.overflow='hidden';setTimeout(function(){box.querySelector('#cv-in').focus()},30)}
  function close(){if(box){box.hidden=true;document.body.style.overflow=''}}
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&box&&!box.hidden)close()});
  [].forEach.call(links,function(a){a.addEventListener('click',function(e){var k=a.getAttribute('data-cv');if(ok(k))return;e.preventDefault();open(a)})});
  // arriving from a guarded concept page (?cv=<slug>): reopen that card's prompt
  try{var q=new URLSearchParams(location.search).get('cv');if(q&&K[q]&&!ok(q)&&!H.classList.contains('mk-locked')){var a=document.querySelector('a.btn[data-cv="'+q+'"]');if(a)setTimeout(function(){open(a)},60)}}catch(e){}
})();
(function(){
  var H=document.documentElement;
  var q=new URLSearchParams(location.search).get('lang');
  var lang=q||localStorage.getItem('gc-lang')||((navigator.language||'fr').slice(0,2)==='fr'?'fr':'en');
  function setLang(l){H.dataset.lang=l;H.lang=l;try{localStorage.setItem('gc-lang',l)}catch(e){}}
  setLang(lang==='en'?'en':'fr');
  document.querySelectorAll('[data-set]').forEach(function(b){b.onclick=function(){setLang(b.dataset.set)}});
  // lazy autoplay videos only when visible (iOS-safe)
  var vids=[].slice.call(document.querySelectorAll('video[data-src]'));
  function prep(v){v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.setAttribute('autoplay','');}
  function tryPlay(v){prep(v);if(!v.getAttribute('src')){v.src=v.dataset.src;v.load();}
    var p=v.play();if(p&&p.then){p.then(function(){v.parentNode.classList.remove('vtap')}).catch(function(){v.parentNode.classList.add('vtap')})}}
  vids.forEach(function(v){prep(v);v.addEventListener('playing',function(){v.parentNode.classList.remove('vtap')});
    v.addEventListener('click',function(){if(v.paused){tryPlay(v)}});});
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;v._vis=e.isIntersecting;
    if(e.isIntersecting){tryPlay(v)}else if(v.getAttribute('src')){v.pause()}})},{threshold:.2});
    vids.forEach(function(v){io.observe(v)});}else{vids.forEach(tryPlay)}
  // first touch anywhere unlocks playback (iOS low power mode / blocked autoplay)
  function unlock(){vids.forEach(function(v){if(v._vis&&v.paused)tryPlay(v)})}
  ['touchend','click'].forEach(function(t){document.addEventListener(t,unlock,{passive:true})});
  // youtube click-to-load
  document.querySelectorAll('.yt').forEach(function(b){b.onclick=function(){
    b.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';}});
  // lightbox
  var lb=document.querySelector('.lb'),img=lb.querySelector('img'),cap=lb.querySelector('figcaption'),set=[],idx=0;
  function show(i){idx=(i+set.length)%set.length;var b=set[idx];img.src=b.dataset.src;cap.textContent=b.dataset[H.dataset.lang]||'';}
  document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('.g');if(!b)return;(function(){set=[].slice.call(document.querySelectorAll('.g[data-gal="'+b.dataset.gal+'"]:not(.clone)'));show(+b.dataset.i);lb.hidden=false;document.body.style.overflow='hidden'})()});
  function close(){lb.hidden=true;img.src='';document.body.style.overflow=''}
  lb.querySelector('.lb-x').onclick=close;
  lb.querySelector('.lb-p').onclick=function(e){e.stopPropagation();show(idx-1)};
  lb.querySelector('.lb-n').onclick=function(e){e.stopPropagation();show(idx+1)};
  lb.onclick=function(e){if(e.target===lb)close()};
  document.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(idx-1);if(e.key==='ArrowRight')show(idx+1)});

  // auto-scrolling photo carousels (swipeable, pause on hover/touch, seamless loop)
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.gallery').forEach(function(g){
    var items=[].slice.call(g.children);if(items.length<3)return;
    var wrap=document.createElement('div');wrap.className='gcar';g.parentNode.insertBefore(wrap,g);wrap.appendChild(g);
    items.forEach(function(b){var c=b.cloneNode(true);c.classList.add('clone');c.setAttribute('aria-hidden','true');c.tabIndex=-1;g.appendChild(c)});
    var p=document.createElement('button'),n=document.createElement('button');p.className='gc-b gc-p';n.className='gc-b gc-n';p.innerHTML='&#8249;';n.innerHTML='&#8250;';p.setAttribute('aria-label','prev');n.setAttribute('aria-label','next');wrap.appendChild(p);wrap.appendChild(n);
    var pos=0,last=0,vis=false,hold=0,anim=null;
    var firstClone=g.children[items.length];function half(){return firstClone.offsetLeft-items[0].offsetLeft}
    function wrapPos(){var h=half();if(pos>=h)pos-=h;if(pos<0)pos+=h;g.scrollLeft=pos}
    function jump(d){hold=performance.now()+4000;var from=pos,to=pos+d,t0=performance.now();anim=function(now){var k=Math.min(1,(now-t0)/450);k=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;pos=from+(to-from)*k;wrapPos();if(k>=1)anim=null}}
    p.onclick=function(){jump(-g.clientWidth*.7)};n.onclick=function(){jump(g.clientWidth*.7)};
    g.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')hold=Infinity});
    g.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')hold=performance.now()+600});
    g.addEventListener('touchstart',function(){hold=Infinity},{passive:true});
    g.addEventListener('touchend',function(){hold=performance.now()+3000},{passive:true});
    g.addEventListener('scroll',function(){if(Math.abs(g.scrollLeft-pos)>2&&!anim){pos=g.scrollLeft;if(hold!==Infinity)hold=performance.now()+3000}},{passive:true});
    new IntersectionObserver(function(es){vis=es[0].isIntersecting},{threshold:.1}).observe(g);
    function tick(now){var dt=Math.min(50,now-(last||now));last=now;
      if(anim)anim(now);else if(vis&&!RM&&lb.hidden&&now>hold){if(Math.abs(g.scrollLeft-pos)>2)pos=g.scrollLeft;pos+=dt*0.035;wrapPos()}
      requestAnimationFrame(tick)}
    requestAnimationFrame(tick);
  });
  var x0=null;lb.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)show(idx+(dx<0?1:-1));x0=null});
})();
// v10 tabs: Catalogue / Chez vous / Portfolio / Distinctions & Presse (hash-routed, deep-linkable)
(function(){
  var panels=[].slice.call(document.querySelectorAll('.tabpanel'));if(!panels.length)return;
  var tabs=[].slice.call(document.querySelectorAll('[data-tab]'));
  var anchor=document.getElementById('tabs-anchor');
  function show(id){
    panels.forEach(function(p){p.hidden=(p.id!==id)});
    tabs.forEach(function(t){var on=t.dataset.tab===id;t.classList.toggle('on',on);t.setAttribute('aria-selected',on?'true':'false')});
    try{window.dispatchEvent(new Event('resize'))}catch(e){}
  }
  function toTabs(){var y=anchor.getBoundingClientRect().top+window.pageYOffset-(document.querySelector('.top')||{offsetHeight:0}).offsetHeight;window.scrollTo(0,Math.max(0,y))}
  function route(initial){
    var h=decodeURIComponent(location.hash.slice(1));h=({presse:'press',media:'press',medias:'press',awards:'prix',distinction:'distinctions','prix-distinctions':'distinctions','distinctions-presse':'distinctions'})[h]||h;
    var p=panels.filter(function(x){return x.id===h})[0];
    if(p){show(h);if(initial)window.scrollTo(0,0);else toTabs();return}
    var el=h&&document.getElementById(h),pp=el&&el.closest('.tabpanel');
    if(pp){show(pp.id);requestAnimationFrame(function(){el.scrollIntoView()});return}
    if(initial)show('catalogue');
  }
  window.addEventListener('hashchange',function(){route(false)});
  route(true);
})();
// v18 « Restons en contact » modal: Sender embed (form b68PWn). Sender shows its own thank-you message after submit.
(function(){
  var dlg=document.getElementById('nl');if(!dlg)return;
  var FORM_SRC='https://stats.sender.net/forms/b68PWn/view';
  var opener=null,loaded=false,box=dlg.querySelector('.sender-form-field'),
      loading=dlg.querySelector('.nl-loading');
  function rendered(){return !!box.querySelector('input,select,textarea,iframe')}
  function isOpen(){return !!(dlg.open||dlg.hasAttribute('open'))}
  // Relabel Sender's "Select item" placeholder (embed mode: the form renders in a same-origin iframe; cross-origin iframe mode: skipped)
  function roots(){var r=[box];[].forEach.call(box.querySelectorAll('iframe'),function(f){try{if(f.contentDocument&&f.contentDocument.body)r.push(f.contentDocument.body)}catch(e){}});return r}
  function relabel(){var lab=document.documentElement.dataset.lang==='en'?'Choose a topic':'Choisir un sujet';
    roots().forEach(function(root){[].forEach.call(root.querySelectorAll('option'),function(o){if(/^\s*select item\s*$/i.test(o.textContent)||o.dataset.gcPh){o.dataset.gcPh=1;if(o.textContent!==lab)o.textContent=lab}})})}
  var watched=[];
  function watch(){roots().forEach(function(root){if(watched.indexOf(root)<0){watched.push(root);new MutationObserver(relabel).observe(root,{childList:true,subtree:true})}});relabel()}
  function resetForm(){var f=box&&box.querySelector('iframe.nl-iframe');if(f){f.src=FORM_SRC}else{loaded=false;if(box)box.innerHTML='';if(loading)loading.hidden=false}}
  function close(){
    try{if(typeof dlg.close==='function')dlg.close();else dlg.removeAttribute('open')}catch(e){dlg.removeAttribute('open')}
    document.body.style.overflow='';
    resetForm();
  }
  function bindFrame(f){
    if(f._gcBound)return;
    f._gcBound=1;
    f.addEventListener('load',function(){watch();if(loading)loading.hidden=true});
  }
  new MutationObserver(function(){if(rendered()&&loading)loading.hidden=true;watch();
    [].forEach.call(box.querySelectorAll('iframe'),bindFrame)}).observe(box,{childList:true,subtree:true});
  new MutationObserver(relabel).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});
  function iframe(){if(rendered())return;
    var f=document.createElement('iframe');f.className='nl-iframe';f.src=FORM_SRC;
    f.title='Restons en contact — Génie Culturel';bindFrame(f);box.appendChild(f)}
  function load(){if(loaded)return;loaded=true;
    var tpl=document.getElementById('sender-loader');
    if(dlg.dataset.mode==='embed'&&tpl){document.body.appendChild(document.importNode(tpl.content,true));setTimeout(iframe,8000)}
    else{iframe()}}
  function open(b){opener=b||null;if(!box.querySelector('iframe.nl-iframe')){loaded=false}load();
    if(dlg.showModal){dlg.showModal()}else{dlg.setAttribute('open','')}document.body.style.overflow='hidden';
    setTimeout(function(){var x=dlg.querySelector('.nl-x');if(x)x.focus()},30)}
  dlg.addEventListener('close',function(){document.body.style.overflow='';if(opener)opener.focus()});
  [].forEach.call(document.querySelectorAll('.nl-open'),function(b){b.addEventListener('click',function(){open(b)})});
  var xbtn=dlg.querySelector('.nl-x');if(xbtn)xbtn.addEventListener('click',close);
  var bk=dlg.querySelector('.nl-back');if(bk)bk.addEventListener('click',close);
  dlg.addEventListener('click',function(e){if(e.target===dlg)close()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen()&&!dlg.showModal)close()});
})();

// Keep category ribbons below the fixed header and wrapping main tabs.
(function(){
  var bar=document.querySelector('.tabbar');if(!bar)return;
  function categoryOffset(){var top=parseFloat(getComputedStyle(bar).top)||60;document.documentElement.style.setProperty('--category-sticky-top',(top+bar.offsetHeight)+'px')}
  categoryOffset();window.addEventListener('resize',categoryOffset);
  if('ResizeObserver' in window)new ResizeObserver(categoryOffset).observe(bar);
})();
