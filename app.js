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
// v17 « Restons en contact » prospect form (modal). Endpoint empty -> prefilled mailto fallback.
(function(){
  var dlg=document.getElementById('nl');if(!dlg)return;
  var H=document.documentElement,f=dlg.querySelector('form'),opener=null;
  var ep=(f.getAttribute('data-endpoint')||'').trim();
  function L(){return H.dataset.lang==='en'?'en':'fr'}
  function opts(){[].forEach.call(f.querySelectorAll('option[data-fr]'),function(o){o.textContent=o.dataset[L()]});[].forEach.call(f.querySelectorAll('[data-ph-fr]'),function(i){i.placeholder=i.getAttribute('data-ph-'+L())})}
  opts();new MutationObserver(opts).observe(H,{attributes:true,attributeFilter:['data-lang']});
  function msg(k){[].forEach.call(f.querySelectorAll('.nl-msg [data-k]'),function(p){p.hidden=p.dataset.k!==k})}
  function err(id,on){var e=document.getElementById('nl-err-'+id),i=document.getElementById('nl-'+id);e.hidden=!on;if(on)i.setAttribute('aria-invalid','true');else i.removeAttribute('aria-invalid')}
  function open(b){opener=b||null;msg('');err('email',false);err('consent',false);
    if(dlg.showModal){dlg.showModal()}else{dlg.setAttribute('open','')}document.body.style.overflow='hidden';
    setTimeout(function(){f.elements.name.focus()},30)}
  function close(){if(dlg.close){dlg.close()}else{dlg.removeAttribute('open')}}
  dlg.addEventListener('close',function(){document.body.style.overflow='';if(opener)opener.focus()});
  [].forEach.call(document.querySelectorAll('.nl-open'),function(b){b.addEventListener('click',function(){open(b)})});
  dlg.querySelector('.nl-x').addEventListener('click',close);
  dlg.addEventListener('click',function(e){if(e.target===dlg)close()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&dlg.hasAttribute('open')&&!dlg.showModal)close()});
  var RE=/^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
  f.elements.email.addEventListener('input',function(){if(RE.test(this.value.trim()))err('email',false)});
  f.elements.consent.addEventListener('change',function(){if(this.checked)err('consent',false)});
  window.gcNlMailto=function(d){
    var en=d.lang==='en';
    var sub=(en?'Let’s stay in touch':'Restons en contact')+' — Génie Culturel';
    var body=(en?'Name':'Nom')+': '+d.name+'\n'+'Organisation: '+d.organisation+'\n'+'E-mail: '+d.email+'\n'+
      (en?'Topic':'Sujet')+': '+d.topic+'\n'+(en?'Other useful information':'Autre information utile')+': '+d.message+'\n\n'+
      (en?'Consent: yes, Génie Culturel may send me documentation and contact me again.':'Consentement : oui, Génie Culturel peut m’envoyer de la documentation et me recontacter.')+'\n'+
      (en?'Language':'Langue')+': '+d.lang+' · '+(en?'Page':'Page')+': '+d.page+'\n';
    return 'mailto:info@genieculturel.ch?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(body);
  };
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var email=f.elements.email.value.trim(),okE=RE.test(email),okC=f.elements.consent.checked;
    err('email',!okE);err('consent',!okC);
    if(!okE){f.elements.email.focus();return}
    if(!okC){f.elements.consent.focus();return}
    if(f.elements._gotcha.value){msg(ep?'ok':'mail');f.reset();return}  // honeypot: bots get a fake success
    var sel=f.elements.topic,d={name:f.elements.name.value.trim(),organisation:f.elements.organisation.value.trim(),email:email,topic:sel.value||'—',message:f.elements.message.value.trim(),
      consent:true,lang:L(),page:location.href.split('#')[0].split('?')[0],submitted_at:new Date().toISOString()};
    if(!ep){window.location.href=window.gcNlMailto(d);msg('mail');return}
    var btn=f.querySelector('.nl-send');btn.disabled=true;msg('busy');
    var gs=/script\.google\.com|\/exec$/.test(ep);  // Google Apps Script: simple request (no CORS preflight)
    fetch(ep,{method:'POST',headers:{'Content-Type':gs?'text/plain;charset=utf-8':'application/json','Accept':'application/json'},body:JSON.stringify(d)})
      .then(function(r){if(!r.ok)throw new Error(r.status);msg('ok');f.reset();opts()})
      .catch(function(){msg('err')})
      .then(function(){btn.disabled=false});
  });
})();
