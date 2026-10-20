(function(){
  var H=document.documentElement;
  var q=new URLSearchParams(location.search).get('lang');
  var lang=q||localStorage.getItem('gc-lang')||((navigator.language||'fr').slice(0,2)==='fr'?'fr':'en');
  function setLang(l){H.dataset.lang=l;H.lang=l;try{localStorage.setItem('gc-lang',l)}catch(e){}}
  setLang(lang==='en'?'en':'fr');
  document.querySelectorAll('[data-set]').forEach(function(b){b.onclick=function(){setLang(b.dataset.set)}});
  // lazy autoplay videos only when visible
  var vids=document.querySelectorAll('video[data-src]');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;
    if(e.isIntersecting){if(!v.src){v.src=v.dataset.src}var p=v.play();if(p&&p.catch)p.catch(function(){})}else{v.pause()}})},{threshold:.25});
  vids.forEach(function(v){io.observe(v)});
  // youtube click-to-load
  document.querySelectorAll('.yt').forEach(function(b){b.onclick=function(){
    b.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';}});
  // lightbox
  var lb=document.querySelector('.lb'),img=lb.querySelector('img'),cap=lb.querySelector('figcaption'),set=[],idx=0;
  function show(i){idx=(i+set.length)%set.length;var b=set[idx];img.src=b.dataset.src;cap.textContent=b.dataset[H.dataset.lang]||'';}
  document.querySelectorAll('.g').forEach(function(b){b.onclick=function(){set=[].slice.call(document.querySelectorAll('.g[data-gal="'+b.dataset.gal+'"]'));show(+b.dataset.i);lb.hidden=false;document.body.style.overflow='hidden'}});
  function close(){lb.hidden=true;img.src='';document.body.style.overflow=''}
  lb.querySelector('.lb-x').onclick=close;
  lb.querySelector('.lb-p').onclick=function(e){e.stopPropagation();show(idx-1)};
  lb.querySelector('.lb-n').onclick=function(e){e.stopPropagation();show(idx+1)};
  lb.onclick=function(e){if(e.target===lb)close()};
  document.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(idx-1);if(e.key==='ArrowRight')show(idx+1)});
  var x0=null;lb.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)show(idx+(dx<0?1:-1));x0=null});
})();
