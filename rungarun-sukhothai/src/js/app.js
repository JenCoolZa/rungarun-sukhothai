/* Main app. Content comes from window.TH_DATA (baked JSON) and is refreshed from /api/content (D1). */
(function(){
'use strict';
var TH=window.TH_CONTENT, ART=window.TH_ART, D=window.TH_DATA, CFG=window.TH_CONFIG||{};
var artSVG=ART.artSVG, ARTS=ART.ARTS, HERO_SCENES=ART.HERO_SCENES;
function clone(o){return JSON.parse(JSON.stringify(o))}
var ORDER=(D.home.order||[]).slice();
var HOME={eyebrow:D.home.eyebrow,title:D.home.title,lede:D.home.lede,facts:(D.home.facts||[]).slice()};
var PERIODS={};
function visible(p){p.events=(p.events||[]).filter(function(e){return !e.hidden});return p}
ORDER.forEach(function(k){PERIODS[k]=visible(clone(D.periods[k]))});
var ERAS={},EVENTS=[];

/* swap in newer content from the database */
function applyContent(doc){
  if(!doc||!doc.periods)return false;
  var changed=false;
  ORDER.forEach(function(k){
    if(!doc.periods[k])return;
    var n=visible(clone(doc.periods[k]));
    if(JSON.stringify(n)!==JSON.stringify(PERIODS[k])){PERIODS[k]=n;changed=true}
  });
  if(doc.home){
    var h={eyebrow:doc.home.eyebrow,title:doc.home.title,lede:doc.home.lede,facts:doc.home.facts||[]};
    if(JSON.stringify(h)!==JSON.stringify(HOME)){HOME=h;changed=true}
  }
  return changed;
}

function artFor(e){return e.art||ARTS[e.id]||{sky:'day',items:[['hills'],['ground']]}}

/* ---------- helpers ---------- */
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var svg=function(inner,sw){return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"'+(sw?' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"':'')+'>'+inner+'</svg>'};
var ICON={
  play:svg('<path fill="currentColor" d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.4-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6Z"/>'),
  pause:svg('<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>'),
  stop:svg('<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>'),
  next:svg('<path fill="currentColor" d="M6 6.2v11.6a.8.8 0 0 0 1.3.6l7.4-5.8a.8.8 0 0 0 0-1.2L7.3 5.6A.8.8 0 0 0 6 6.2Z"/><rect x="16" y="5.5" width="2.4" height="13" rx="1" fill="currentColor"/>'),
  prev:svg('<path fill="currentColor" d="M18 6.2v11.6a.8.8 0 0 1-1.3.6l-7.4-5.8a.8.8 0 0 1 0-1.2l7.4-5.8a.8.8 0 0 1 1.3.6Z"/><rect x="5.6" y="5.5" width="2.4" height="13" rx="1" fill="currentColor"/>'),
  close:svg('<path d="M6 6l12 12M18 6L6 18"/>',true),
  info:svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.2"/>',true)
};
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function byId(id){for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id)return EVENTS[i]}return null}
function yearLabel(e){return e.pre+' '+e.big}
function scriptOf(e){return [e.title+'. '+yearLabel(e)].concat(e.story)}

/* ---------- build timeline ---------- */
var tl=$('#tl');
function mediaSrc(v){
  if(!v||typeof v!=='string')return '';
  if(/["'<>\s]/.test(v))return '';
  if(/^https:\/\//.test(v)||/^\/[A-Za-z0-9_\-.\/]+$/.test(v))return v;
  return '';
}
function picOf(e,label){
  if(mediaSrc(e.img))return '<img class="art-img" data-eid="'+e.id+'" src="'+mediaSrc(e.img)+'" alt="'+String(label).replace(/"/g,'&quot;')+'" loading="lazy" decoding="async">';
  return artSVG(artFor(e),label);
}
document.addEventListener('error',function(ev){
  var im=ev.target;
  if(!im||!im.classList||!im.classList.contains('art-img'))return;
  var e=byId(im.dataset.eid),box=im.parentNode;
  if(!e||!box)return;
  var d=document.createElement('div');d.innerHTML=artSVG(artFor(e),'ภาพประกอบ: '+e.title);
  if(d.firstChild)box.replaceChild(d.firstChild,im);
},true);
var ELE='<svg viewBox="0 0 44 32" aria-hidden="true"><g class="lg"><rect class="f" x="9" y="20" width="5" height="10" rx="2.2"/></g><g class="lg b"><rect class="f" x="15.5" y="20" width="5" height="10" rx="2.2"/></g><g class="bd"><path class="s" d="M8.5 13Q4 15 4.5 22" stroke-width="2"/><ellipse class="f" cx="20" cy="15" rx="12.5" ry="8"/><circle class="f" cx="32.5" cy="12" r="6"/><ellipse cx="29" cy="13" rx="3.4" ry="5" fill="var(--bg)" opacity=".55"/><g class="tr"><path class="s" d="M36 14Q41.5 15 41 22Q40.7 26 37.6 25.2" stroke-width="3.6"/></g><path d="M36.5 17.5Q40 18.5 41 16.6" fill="none" stroke="var(--bg)" stroke-width="1.6" stroke-linecap="round"/><circle cx="34.6" cy="10.6" r="1" fill="var(--bg)"/></g><g class="lg b"><rect class="f" x="24" y="20" width="5" height="10" rx="2.2"/></g><g class="lg"><rect class="f" x="30" y="20" width="5" height="10" rx="2.2"/></g></svg>';
function buildTimeline(){
tl.innerHTML='';
EVENTS.forEach(function(e){
  var li=document.createElement('li');
  li.className='item e'+e.era;
  li.dataset.id=e.id;
  li.dataset.era=e.era;
  li.innerHTML=
    '<span class="dot" aria-hidden="true">'+ELE+'</span>'+
    '<div class="big" aria-hidden="true"><span class="pre">'+e.pre+'</span><span class="num'+(e.big.length>5?' txt':'')+'">'+e.big+'</span></div>'+
    '<article class="card" data-open="'+e.id+'" tabindex="0" role="button" aria-label="อ่านข้อมูลเพิ่มเติม: '+e.title.replace(/"/g,'&quot;')+'">'+
      '<div class="pic">'+picOf(e,'ภาพประกอบ: '+e.title)+'<span class="zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/></svg><b>อ่านข้อมูลเพิ่มเติม</b></span></div>'+
      '<div class="meta"><span class="year">'+yearLabel(e)+'</span><span class="tag">'+ERAS[e.era].name+'</span></div>'+
      '<h3>'+e.title+'</h3>'+
      '<p class="sum">'+e.sum+'</p>'+
      '<div class="acts">'+
        '<button class="btn sm" type="button" data-play="'+e.id+'"></button>'+
      '</div>'+
    '</article>';
  tl.appendChild(li);
});
}

/* ---------- era filter ---------- */
var chips=$('#chips'), eraNote=$('#eraNote'), curEra=0;
function buildChips(){
  chips.innerHTML='';
  var lab=document.createElement('span');lab.className='bar-label';lab.textContent='ยุค';chips.appendChild(lab);
  function mk(n,text){
    var b=document.createElement('button');b.type='button';b.className='chip e'+n;b.dataset.era=n;
    b.setAttribute('aria-pressed',n===0?'true':'false');
    b.innerHTML=(n?'<i></i>':'')+'<span>'+text+'</span>';
    if(n)b.title=ERAS[n].range;
    chips.appendChild(b);
  }
  mk(0,'ทั้งหมด');
  Object.keys(ERAS).forEach(function(k){mk(+k,ERAS[k].name)});
}
function applyFilter(){
  var idx=0;
  $$('.item',tl).forEach(function(li){
    var show=!curEra||+li.dataset.era===curEra;
    li.hidden=!show;
    if(show){li.classList.toggle('left',idx%2===0);li.classList.toggle('right',idx%2===1);idx++}
  });
  $$('.chip',chips).forEach(function(c){c.setAttribute('aria-pressed',(+c.dataset.era===curEra)?'true':'false')});
  eraNote.textContent=curEra?(ERAS[curEra].name+' · '+ERAS[curEra].range+' · '+idx+' เหตุการณ์'):('เหตุการณ์สำคัญทั้งหมด '+idx+' เรื่อง เรียงตามเวลา');
  if(S.id){var cur=$('.item[data-id="'+S.id+'"]',tl);if(cur&&cur.hidden)stopAudio()}
  activeId=undefined;buildRail();setupReveal();progress();
}
chips.addEventListener('click',function(ev){
  var b=ev.target.closest('.chip');if(!b)return;
  curEra=+b.dataset.era;applyFilter();
});
function visibleIds(){return $$('.item',tl).filter(function(li){return !li.hidden}).map(function(li){return li.dataset.id})}

/* ---------- scroll progress on spine ---------- */
var spine=$('#spine'), box=$('#tlBox'), tick=false, heroArt=$('.hero-art');
var BOAT='<svg viewBox="0 0 80 50" aria-hidden="true"><defs><linearGradient id="boatFade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".22" stop-color="#fff"/><stop offset=".78" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="boatMask" maskUnits="userSpaceOnUse" x="-6" y="0" width="92" height="52"><rect x="-6" y="0" width="92" height="52" fill="url(#boatFade)"/></mask></defs>'+
'<g mask="url(#boatMask)"><g class="wv2" opacity=".55"><path d="M-24 36Q-18 31 -12 36T0 36T12 36T24 36T36 36T48 36T60 36T72 36T84 36T96 36V50H-24Z" fill="#4C9FCF"/></g></g>'+
'<g class="hull"><path d="M5 19Q9 31 24 34H56Q71 31 75 19Q62 26 40 26Q18 26 5 19Z" fill="#9C4C30"/>'+
'<path d="M8 22.5Q22 28.5 40 28.5Q58 28.5 72 22.5" fill="none" stroke="#F0C36A" stroke-width="1.8" stroke-linecap="round"/>'+
'<path d="M4 17Q3 13 7 12Q6 16 9 18Z" fill="#9C4C30"/><path d="M76 17Q77 13 73 12Q74 16 71 18Z" fill="#9C4C30"/>'+
'<circle cx="46" cy="9" r="3.4" fill="#3A2A20"/><path d="M42.5 13Q46 11.5 49.5 13L50.5 25H41.5Z" fill="#E3A83F"/><path d="M41 12.5Q46 5.5 51 12.5Z" fill="#C2831C"/>'+
'<g class="oar"><path d="M54 20L63 42" stroke="#5A3A22" stroke-width="2.2" stroke-linecap="round"/><path d="M60.5 38L66 41Q64.5 45 61 43Z" fill="#5A3A22"/></g></g>'+
'<g mask="url(#boatMask)"><g class="wv1"><path d="M-24 35Q-18 30 -12 35T0 35T12 35T24 35T36 35T48 35T60 35T72 35T84 35T96 35V50H-24Z" fill="#2F86BC" opacity=".9"/><path d="M-24 40Q-18 36 -12 40T0 40T12 40T24 40T36 40T48 40T60 40T72 40T84 40T96 40V50H-24Z" fill="#1F6E9E" opacity=".8"/></g></g>'+
'<ellipse class="rip" cx="64" cy="42" rx="9" ry="2.5" fill="none" stroke="#fff" stroke-width="1.2"/></svg>';
var boatEl=document.createElement('span');boatEl.className='boat';boatEl.setAttribute('aria-hidden','true');boatEl.innerHTML=BOAT;spine.appendChild(boatEl);
(function(){var tm=0;function go(){document.body.classList.add('scrolling');clearTimeout(tm);tm=setTimeout(function(){document.body.classList.remove('scrolling')},220)}
window.addEventListener('scroll',go,{passive:true});window.addEventListener('wheel',go,{passive:true});})();
var tCount=$('#tCount'), tYear=$('#tYear'), tTitle=$('#tTitle'), rail=$('#rail'), barEl=$('.bar');
var view='home', activeId, lastScroll=window.scrollY, dirDown=true, io=null;
function pad(n){return n<10?'0'+n:''+n}
function buildRail(){
  rail.innerHTML='';
  visibleIds().forEach(function(id){
    var e=byId(id),b=document.createElement('button');
    b.type='button';b.className='seg e'+e.era;b.dataset.id=id;
    b.setAttribute('aria-label',e.title+' '+yearLabel(e));b.title=e.title;
    rail.appendChild(b);
  });
}
function updateTicker(idx,id,down){
  var ids=visibleIds();
  ['e1','e2','e3','e4'].forEach(function(c){barEl.classList.remove(c)});
  if(!id){
    tCount.textContent='00 / '+pad(ids.length);tYear.textContent='เริ่มต้น';tTitle.textContent='เลื่อนลงเพื่อเดินทางตามเวลา';
  }else{
    var e=byId(id);
    tCount.textContent=pad(idx+1)+' / '+pad(ids.length);tYear.textContent=yearLabel(e);tTitle.textContent=e.title;
    barEl.classList.add('e'+e.era);
  }
  barEl.classList.remove('flash');void barEl.offsetWidth;barEl.classList.add('flash');
  [tCount,tYear,tTitle].forEach(function(el){
    el.classList.remove('swap-down','swap-up');void el.offsetWidth;el.classList.add(down?'swap-down':'swap-up');
  });
}
function setActive(id){
  if(id===activeId)return;
  activeId=id;
  $$('.item',tl).forEach(function(li){li.classList.toggle('active',li.dataset.id===id)});
  var ids=visibleIds(),idx=id?ids.indexOf(id):-1;
  $$('.seg',rail).forEach(function(sg,i){sg.classList.toggle('on',i===idx);sg.classList.toggle('done',idx>=0&&i<idx)});
  updateTicker(idx,id,dirDown);
  setMood(id?moodOf(byId(id)):'');
}
function progress(){
  if(view==='home'||view==='learn')return;
  var r=box.getBoundingClientRect();
  var p=(window.innerHeight*0.5-r.top)/Math.max(r.height,1);
  p=Math.max(0,Math.min(1,p));
  spine.style.setProperty('--p',(p*100).toFixed(1)+'%');
  var y=window.scrollY;
  if(Math.abs(y-lastScroll)>1){dirDown=y>lastScroll;lastScroll=y}
  var items=$$('.item',tl).filter(function(li){return !li.hidden});
  var mid=window.innerHeight*0.45,best=null,bd=1e9;
  items.forEach(function(li){
    var c=li.querySelector('.card').getBoundingClientRect();
    var d=Math.abs(c.top+c.height/2-mid);
    if(d<bd){bd=d;best=li}
  });
  var started=items.length&&items[0].getBoundingClientRect().top<window.innerHeight*0.8;
  setActive(started&&best?best.dataset.id:null);
  if(!reduce&&heroArt&&y<window.innerHeight*1.3){heroArt.style.transform='translate3d(0,'+(y*0.1).toFixed(1)+'px,0)'}
}
function countUp(li){
  var n=li.querySelector('.num');if(!n||reduce)return;
  var txt=n.dataset.final||n.textContent;
  if(!/^\d+$/.test(txt))return;
  n.dataset.final=txt;
  var end=+txt,start=end-50,t0=null;
  function f(ts){
    if(!t0)t0=ts;
    var k=Math.min((ts-t0)/900,1),e=1-Math.pow(1-k,3);
    n.textContent=k<1?Math.round(start+(end-start)*e):txt;
    if(k<1)requestAnimationFrame(f);
  }
  requestAnimationFrame(f);
}
function reveal(li){
  if(li.classList.contains('reveal'))return;
  li.classList.add('reveal');countUp(li);
}
function setupReveal(){
  $$('.item',tl).forEach(function(li){li.classList.remove('reveal')});
  if(!('IntersectionObserver' in window)){$$('.item',tl).forEach(reveal);return}
  if(!io){
    io=new IntersectionObserver(function(es){
      es.forEach(function(en){if(en.isIntersecting){reveal(en.target);io.unobserve(en.target)}});
    },{threshold:0.12,rootMargin:'0px 0px -6% 0px'});
  }
  $$('.item',tl).forEach(function(li){if(!li.hidden)io.observe(li)});
}
rail.addEventListener('click',function(ev){
  var b=ev.target.closest('.seg');if(!b)return;
  var li=$('.item[data-id="'+b.dataset.id+'"]',tl);
  if(li)li.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
});
window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(function(){tick=false;progress()})}},{passive:true});
window.addEventListener('resize',progress);

/* ---------- speech ---------- */
var supported=('speechSynthesis' in window)&&('SpeechSynthesisUtterance' in window);
var S={id:null,idx:0,state:'idle',token:0,tour:false,rate:1,pitch:1.08,au:false};
var AUD=(window.Audio?new Audio():null);
if(AUD){AUD.preload='auto';AUD.addEventListener('ended',function(){if(S.au&&S.state==='playing')finishEvent(S.token)});AUD.addEventListener('error',function(){if(S.au&&S.state==='playing'){S.state='idle';S.tour=false;refresh();toast('เล่นไฟล์เสียงไม่สำเร็จ ลองอัปโหลดไฟล์ใหม่')}})}
var voices=[], noticeShown=false, keepUtter=[], toastTimer=null, chosenVoice='';
try{chosenVoice=window.localStorage.getItem('sk-voice')||''}catch(e){}
function loadVoices(){if(supported){voices=window.speechSynthesis.getVoices()||[];populateVoices()}}
if(supported){loadVoices();if('onvoiceschanged' in window.speechSynthesis)window.speechSynthesis.onvoiceschanged=loadVoices}
function isThai(v){return /^th/i.test(v.lang||'')}
function scoreVoice(v){
  var n=(v.name||'').toLowerCase(),sc=1;
  if(/natural|neural|online|enhanced|premium/.test(n))sc+=6;
  if(/google/.test(n))sc+=3;
  if(/premwadee|kanya|narisa|achara|pattara|ploy/.test(n))sc+=3;
  if(/niwat/.test(n))sc+=1;
  return sc;
}
function pickVoice(){
  var th=voices.filter(isThai);
  if(!th.length)return null;
  if(chosenVoice){for(var i=0;i<th.length;i++){if(th[i].name===chosenVoice)return th[i]}}
  var best=th[0],bs=-1;
  th.forEach(function(v){var sc=scoreVoice(v);if(sc>bs){bs=sc;best=v}});
  return best;
}
function populateVoices(){
  var sel=document.getElementById('pVoiceSel'),wrap=document.getElementById('pVoiceWrap');
  if(!sel||!wrap)return;
  var th=voices.filter(isThai);
  wrap.hidden=th.length<2;
  sel.innerHTML='';
  var auto=document.createElement('option');auto.value='';auto.textContent='อัตโนมัติ (แนะนำ)';sel.appendChild(auto);
  th.forEach(function(v){
    var o=document.createElement('option');o.value=v.name;
    o.textContent=v.name.replace(/^(Microsoft|Google)\s+/i,'');
    sel.appendChild(o);
  });
  sel.value=chosenVoice;
  if(sel.value!==chosenVoice)sel.value='';
}
function toast(msg){
  var t=$('#toast');t.textContent=msg;t.hidden=false;
  clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.hidden=true},5200);
}
function speechText(t){
  return t.replace(/พ\.ศ\./g,'พุทธศักราช').replace(/(\d)\s*–\s*(\d)/g,'$1 ถึง $2').replace(/[–—]/g,' ');
}
function segmentsFrom(e,from){
  var parts=scriptOf(e),segs=[];
  for(var p=from;p<parts.length;p++){
    var words=speechText(parts[p]).split(/\s+/),cur='';
    for(var k=0;k<words.length;k++){
      var w=words[k];
      if(cur&&(cur+' '+w).length>110){segs.push({t:cur,p:p});cur=w}
      else cur=cur?cur+' '+w:w;
    }
    if(cur)segs.push({t:cur,p:p});
  }
  return segs;
}
function speakQueue(token,segs){
  var v=pickVoice();
  keepUtter=[];
  segs.forEach(function(sg,i){
    var u=new SpeechSynthesisUtterance(sg.t);
    u.lang=(v&&v.lang)||'th-TH';u.rate=S.rate;u.pitch=S.pitch;u.volume=1;
    if(v)u.voice=v;
    u.onstart=function(){
      if(token!==S.token)return;
      if(S.idx!==sg.p){S.idx=sg.p;refresh()}
    };
    if(i===segs.length-1){u.onend=function(){if(token===S.token)finishEvent(token)}}
    u.onerror=function(ev){
      if(token!==S.token)return;
      if(ev&&(ev.error==='canceled'||ev.error==='interrupted'))return;
      S.state='idle';S.tour=false;refresh();
      toast('เล่นเสียงไม่สำเร็จ ลองตรวจสอบว่าอุปกรณ์มีเสียงอ่านภาษาไทย');
    };
    keepUtter.push(u);
  });
  try{window.speechSynthesis.resume()}catch(e){}
  keepUtter.forEach(function(u){window.speechSynthesis.speak(u)});
}
function finishEvent(token){
  if(token!==S.token)return;
  if(S.tour){
    var ids=visibleIds(),i=ids.indexOf(S.id);
    if(i>=0&&i<ids.length-1){startPlay(ids[i+1],0,true,true);return}
  }
  S.state='idle';S.idx=0;S.tour=false;S.id=null;refresh();
}
function startPlay(id,from,tour,quick){
  var ev0=byId(id),useAu=!!(ev0&&AUD&&mediaSrc(ev0.audio));
  if(!supported&&!useAu){toast('เบราว์เซอร์นี้ยังไม่รองรับเสียงบรรยาย ลองเปิดด้วย Chrome, Edge หรือ Safari');return}
  loadVoices();
  if(!noticeShown&&voices.length&&!pickVoice()){
    noticeShown=true;
    toast('ไม่พบเสียงภาษาไทยในอุปกรณ์นี้ เสียงที่ได้ยินอาจไม่ชัด ลองเพิ่มเสียงไทยในการตั้งค่าระบบ');
  }
  if(supported)window.speechSynthesis.cancel();
  if(AUD){try{AUD.pause()}catch(e){}}
  var token=++S.token;
  S.id=id;S.idx=from||0;S.state='playing';S.tour=!!tour;S.au=useAu;
  refresh();
  if(tour){
    var li=$('.item[data-id="'+id+'"]',tl);
    if(li)li.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
  }
  if(useAu){
    AUD.src=mediaSrc(ev0.audio);AUD.playbackRate=S.rate;S.idx=0;
    var pr=AUD.play();if(pr&&pr.catch)pr.catch(function(){if(token===S.token){S.state='idle';S.tour=false;refresh();toast('เล่นไฟล์เสียงไม่สำเร็จ')}});
    return;
  }
  var segs=segmentsFrom(byId(id),S.idx);
  setTimeout(function(){if(token===S.token)speakQueue(token,segs)},quick?20:70);
}
function pauseAudio(){
  if(S.state!=='playing')return;
  S.token++;
  if(S.au&&AUD)AUD.pause();else window.speechSynthesis.cancel();
  S.state='paused';refresh();
}
function resumeAudio(){
  if(S.state!=='paused')return;
  if(S.au&&AUD){S.state='playing';refresh();var q=AUD.play();if(q&&q.catch)q.catch(function(){});return}
  startPlay(S.id,S.idx,S.tour);
}
function stopAudio(){
  S.token++;
  if(AUD){try{AUD.pause()}catch(e){}}
  S.au=false;
  if(supported)window.speechSynthesis.cancel();
  S.state='idle';S.id=null;S.idx=0;S.tour=false;refresh();
}
function toggleFor(id){
  if(S.id===id&&S.state==='playing')pauseAudio();
  else if(S.id===id&&S.state==='paused')resumeAudio();
  else startPlay(id,0,false);
}
function jump(dir){
  var ids=visibleIds(),i=ids.indexOf(S.id);if(i<0)return;
  var n=i+dir;if(n<0||n>=ids.length)return;
  startPlay(ids[n],0,S.tour);
  if(!S.tour){var li=$('.item[data-id="'+ids[n]+'"]',tl);if(li)li.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'})}
}
window.addEventListener('beforeunload',function(){if(supported)window.speechSynthesis.cancel()});

/* ---------- UI sync ---------- */
function labelFor(id){
  if(S.id===id&&S.state==='playing')return {icon:ICON.pause,text:'หยุดชั่วคราว'};
  if(S.id===id&&S.state==='paused')return {icon:ICON.play,text:'ฟังต่อ'};
  return {icon:ICON.play,text:'ฟังเสียงบรรยาย'};
}
function setBtn(btn,id){
  var l=labelFor(id);
  btn.innerHTML=l.icon+'<span>'+l.text+'</span>';
  btn.setAttribute('aria-label',l.text+' '+byId(id).title);
}
var player=$('#player'), pTitle=$('#pTitle'), pState=$('#pState'), pToggle=$('#pToggle');
function refresh(){
  $$('[data-play]',tl).forEach(function(b){setBtn(b,b.dataset.play)});
  $$('.item',tl).forEach(function(li){li.classList.toggle('is-playing',li.dataset.id===S.id&&S.state==='playing')});
  var active=S.id!==null&&S.state!=='idle';
  player.hidden=!active;
  document.body.classList.toggle('has-player',active);
  if(active){
    var e=byId(S.id),parts=scriptOf(e);
    pTitle.textContent=e.title;
    pState.textContent=(S.state==='paused'?'หยุดชั่วคราว':'กำลังบรรยาย')+(S.tour?' · โหมดฟังต่อเนื่อง':'')+' · ตอนที่ '+Math.min(S.idx+1,parts.length)+' จาก '+parts.length;
    pToggle.innerHTML=S.state==='playing'?ICON.pause:ICON.play;
    pToggle.setAttribute('aria-label',S.state==='playing'?'หยุดชั่วคราว':'เล่นต่อ');
    var ids=visibleIds(),i=ids.indexOf(S.id);
    $('#pPrev').disabled=i<=0;$('#pNext').disabled=i<0||i>=ids.length-1;
  }
  tourBtn.innerHTML=(S.tour&&S.state!=='idle')?ICON.stop+'<span>หยุดฟังต่อเนื่อง</span>':ICON.play+'<span>ฟังเรื่องราวต่อเนื่อง</span>';
  syncModal();
}
var tourBtn=$('#tourBtn');
$('#pPrev').innerHTML=ICON.prev;$('#pNext').innerHTML=ICON.next;$('#pStop').innerHTML=ICON.stop;

/* ---------- detail sheet ---------- */
var ov=$('#ov'), sheet=$('#sheet'), openId=null, lastFocus=null;
function renderSheet(id){
  var e=byId(id);openId=id;
  var ids=visibleIds(),i=ids.indexOf(id);
  sheet.className='sheet e'+e.era;
  sheet.innerHTML=
    '<button class="x" type="button" data-close aria-label="ปิดหน้าต่าง">'+ICON.close+'</button>'+
    '<div class="pic">'+picOf(e,'ภาพประกอบ: '+e.title)+'</div>'+
    '<div class="meta"><span class="year">'+yearLabel(e)+'</span><span class="tag">'+ERAS[e.era].name+'</span></div>'+
    '<h2 id="mTitle">'+e.title+'</h2>'+
    '<ul class="people" aria-label="คำสำคัญ">'+e.people.map(function(p){return '<li>'+p+'</li>'}).join('')+'</ul>'+
    '<div class="listen"><button class="btn" type="button" data-mplay></button><span class="state" id="mState"></span></div>'+
    '<div class="story">'+(function(){var used={};return e.story.map(function(p,k){return '<p data-i="'+k+'">'+glossify(p,used)+'</p>'}).join('')})()+'</div>'+
    '<div class="note"><b>ข้อควรรู้</b> '+e.note+'</div>'+debateBox(e)+
    '<div class="nav">'+
      '<button class="btn ghost sm" type="button" data-nav="-1"'+(i<=0?' disabled':'')+'>'+ICON.prev+'<span>เรื่องก่อนหน้า</span></button>'+
      '<button class="btn ghost sm" type="button" data-nav="1"'+(i>=ids.length-1?' disabled':'')+'><span>เรื่องถัดไป</span>'+ICON.next+'</button>'+
    '</div>';
  syncModal();
}
function syncModal(){
  if(!openId||ov.hidden)return;
  var b=$('[data-mplay]',sheet);if(b)setBtn(b,openId);
  var st=$('#mState',sheet);
  var mine=S.id===openId&&S.state!=='idle';
  if(st)st.textContent=mine?(S.state==='paused'?'หยุดชั่วคราว':'กำลังอ่านออกเสียง'):'ฟังเรื่องนี้ประมาณ 1 นาที';
  $$('.story p',sheet).forEach(function(p){
    p.classList.toggle('speaking',mine&&(+p.dataset.i===S.idx-1));
  });
}
function openSheet(id){
  TH.track('event',view,id);
  lastFocus=document.activeElement;
  renderSheet(id);
  ov.hidden=false;
  syncModal();
  document.documentElement.style.overflow='hidden';
  sheet.scrollTop=0;
  var x=$('.x',sheet);if(x)x.focus();
}
function closeSheet(){
  ov.hidden=true;openId=null;
  document.documentElement.style.overflow='';
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
ov.addEventListener('click',function(ev){
  if(ev.target===ov||ev.target.closest('[data-close]')){closeSheet();return}
  var m=ev.target.closest('[data-mplay]');if(m){toggleFor(openId);return}
  var n=ev.target.closest('[data-nav]');
  if(n&&!n.disabled){
    var ids=visibleIds(),i=ids.indexOf(openId)+(+n.dataset.nav);
    if(i>=0&&i<ids.length){renderSheet(ids[i]);sheet.scrollTop=0;var x=$('.x',sheet);if(x)x.focus()}
  }
});
document.addEventListener('keydown',function(ev){
  if(ov.hidden)return;
  if(ev.key==='Escape'){closeSheet();return}
  if(ev.key==='Tab'){
    var f=$$('button:not([disabled])',sheet);if(!f.length)return;
    var first=f[0],last=f[f.length-1];
    if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus()}
    else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus()}
  }
});

/* ---------- wiring ---------- */
tl.addEventListener('click',function(ev){
  var p=ev.target.closest('[data-play]');if(p){toggleFor(p.dataset.play);return}
  var o=ev.target.closest('[data-open]');if(o){openSheet(o.dataset.open)}
});
tl.addEventListener('keydown',function(ev){
  if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches&&ev.target.matches('.card[data-open]')){ev.preventDefault();openSheet(ev.target.dataset.open)}
});
tourBtn.addEventListener('click',function(){
  if(S.tour&&S.state!=='idle'){stopAudio();return}
  var ids=visibleIds();if(!ids.length)return;
  startPlay(ids[0],0,true);
});
pToggle.addEventListener('click',function(){
  if(S.state==='playing')pauseAudio();else resumeAudio();
});
$('#pStop').addEventListener('click',stopAudio);
$('#pPrev').addEventListener('click',function(){jump(-1)});
$('#pNext').addEventListener('click',function(){jump(1)});
$('#pRate').addEventListener('change',function(ev){
  S.rate=parseFloat(ev.target.value)||1;
  if(AUD)AUD.playbackRate=S.rate;
  if(S.state==='playing'&&!S.au)startPlay(S.id,S.idx,S.tour);
});

/* ---------- floating petals and fireflies ---------- */
(function(){
  var cv=document.createElement('canvas');
  cv.className='bgfx';cv.setAttribute('aria-hidden','true');
  document.body.insertBefore(cv,document.body.firstChild);
  var ctx=cv.getContext&&cv.getContext('2d');if(!ctx)return;
  var W=0,H=0,ps=[],cols=['#3C7C6B','#C2831C','#9C4C30'],last=0,frame=0;
  function readCols(){
    var cs=getComputedStyle(document.documentElement);
    cols=['--celadon','--gold','--laterite'].map(function(k,i){return (cs.getPropertyValue(k)||'').trim()||cols[i]});
  }
  function mk(init){
    return {x:Math.random()*W,y:init?Math.random()*H:H+24,s:6+Math.random()*9,vy:0.12+Math.random()*0.3,
      sw:Math.random()*6.28,sa:18+Math.random()*34,r:Math.random()*6.28,vr:(Math.random()-0.5)*0.008,
      k:Math.floor(Math.random()*3),a:0.16+Math.random()*0.2,fly:Math.random()<0.35,tw:Math.random()*6.28};
  }
  function size(){
    var dpr=Math.min(window.devicePixelRatio||1,2);
    W=window.innerWidth;H=window.innerHeight;
    cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    var n=W<600?14:28;
    while(ps.length<n)ps.push(mk(true));
    ps.length=n;
  }
  function draw(ts){
    var dt=Math.min((ts-last)/16.7||1,3);last=ts;frame++;
    if(frame%90===1)readCols();
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<ps.length;i++){
      var p=ps[i];
      p.y-=p.vy*dt;p.sw+=0.012*dt;p.r+=p.vr*dt;p.tw+=0.04*dt;
      if(p.y<-30)ps[i]=p=mk(false);
      var x=p.x+Math.sin(p.sw)*p.sa;
      ctx.save();
      ctx.translate(x,p.y);
      if(p.fly){
        var a=p.a*1.8*(0.5+0.5*Math.sin(p.tw));
        var g=ctx.createRadialGradient(0,0,0,0,0,p.s);
        g.addColorStop(0,cols[1]);g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.globalAlpha=Math.min(a,0.7);ctx.fillStyle=g;
        ctx.beginPath();ctx.arc(0,0,p.s,0,6.28);ctx.fill();
      }else{
        ctx.rotate(p.r);ctx.globalAlpha=p.a;ctx.fillStyle=cols[p.k];
        ctx.beginPath();ctx.moveTo(-p.s,0);
        ctx.quadraticCurveTo(0,-p.s*0.75,p.s,0);
        ctx.quadraticCurveTo(0,p.s*0.75,-p.s,0);
        ctx.fill();
      }
      ctx.restore();
    }
    if(!reduce)requestAnimationFrame(draw);
  }
  readCols();size();
  window.addEventListener('resize',size);
  requestAnimationFrame(draw);
})();

$('#pVoiceSel').addEventListener('change',function(ev){
  chosenVoice=ev.target.value;
  try{window.localStorage.setItem('sk-voice',chosenVoice)}catch(e){}
  if(S.state==='playing')startPlay(S.id,S.idx,S.tour);
});
populateVoices();

/* ---------- pages and menu ---------- */
var heroSK=$('#heroArt').innerHTML;
var menuLinks=$('#menuLinks'), menuInd=$('#menuInd'), homeBody=$('#homeBody'), stageEl=$('#timeline');
var hEyebrow=$('#hEyebrow'), hTitle=$('#hTitle'), hLede=$('#hLede'), hFacts=$('#hFacts'), heroArtEl=$('#heroArt');
var startBtn=$('#startBtn'), heroLink=$('#heroLink'), heroLinkTx=$('#heroLinkTx'), srcList=$('#srcList');
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function moveInd(){
  var a=$('a[aria-current="page"]',menuLinks);if(!a)return;
  menuInd.style.width=(a.offsetWidth-20)+'px';
  menuInd.style.transform='translateX('+(a.offsetLeft+10)+'px)';
  try{menuLinks.scrollTo({left:a.offsetLeft-(menuLinks.clientWidth-a.offsetWidth)/2,behavior:reduce?'auto':'smooth'})}catch(e){}
}
function buildHome(){
  var h='';
  var cover={sukhothai:'found',ayutthaya:'ay-elephant',thonburi:'th-capital',rattanakosin:'rk-found'};
  ORDER.forEach(function(k,i){
    var p=PERIODS[k],ev=p.events.filter(function(e){return e.id===cover[k]})[0]||p.events[0];
    h+='<a class="pcard" style="--i:'+i+'" href="#'+k+'" data-route="'+k+'">'+
      '<div class="pic">'+artSVG(artFor(ev),'ภาพประกอบ: '+p.name)+'</div>'+
      '<div class="body"><span class="rng">'+p.range+' · '+p.events.length+' เหตุการณ์</span><h3>'+p.name+'</h3><p>'+p.blurb+'</p>'+
      '<span class="go"><span>เข้าสู่'+p.label.replace('สมัย','สมัย ')+'</span>'+ICON.next+'</span></div></a>';
  });
  $('#cards4').innerHTML=h;
}
function sourcesFor(key){
  var list=[],seen={};
  if(key==='learn'){LEARN.src.forEach(function(x){list.push(x)});ORDER.forEach(function(k){PERIODS[k].src.forEach(function(x){if(!seen[x.u]){seen[x.u]=1;list.push(x)}})})}
  else (key==='home'?ORDER:[key]).forEach(function(k){PERIODS[k].src.forEach(function(x){if(!seen[x.u]){seen[x.u]=1;list.push(x)}})});
  srcList.innerHTML=list.map(function(x){return '<li><a href="'+x.u+'" target="_blank" rel="noopener">'+esc(x.t)+'</a></li>'}).join('');
}
function restart(el){if(!el)return;el.classList.remove('view-in');void el.offsetWidth;el.classList.add('view-in')}
function route(key){
  if(key!=='home'&&key!=='learn'&&!PERIODS[key])key='home';
  stopMapPlay();
  if(S.state!=='idle'||S.id)stopAudio();
  if(!ov.hidden)closeSheet();
  view=key;
  TH.track('view',key);
  document.body.dataset.p=key;setMood('');
  $$('a[data-route]',menuLinks).forEach(function(a){
    if(a.dataset.route===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  });
  var isHome=key==='home',isLearn=key==='learn',hero=isHome?HOME:isLearn?LEARN:PERIODS[key];
  hEyebrow.textContent=hero.eyebrow;
  hTitle.textContent=hero.title;hTitle.classList.toggle('long',hero.title.length>8);
  hLede.textContent=hero.lede;
  hFacts.innerHTML=hero.facts.map(function(f){return '<li>'+f+'</li>'}).join('');
  heroArtEl.innerHTML=key==='sukhothai'?heroSK:artSVG({items:HERO_SCENES[isLearn?'home':key]},'',true,'art');
  homeBody.hidden=!isHome;learnBody.hidden=!isLearn;stageEl.hidden=isHome||isLearn;
  tourBtn.hidden=isHome||isLearn;startBtn.hidden=!isHome;
  heroLink.dataset.scroll=isHome?'homeBody':isLearn?'learnBody':'timeline';
  heroLinkTx.textContent=isHome?'เลือกสมัย':isLearn?'เริ่มเรียนรู้':'เริ่มดูไทม์ไลน์';
  if(isHome){
    tl.innerHTML='';chips.innerHTML='';rail.innerHTML='';
    buildHome();mountOverview();
  }else if(isLearn){
    tl.innerHTML='';chips.innerHTML='';rail.innerHTML='';
    buildLearn();
  }else{
    ERAS=PERIODS[key].eras;EVENTS=PERIODS[key].events;curEra=0;
    buildTimeline();buildChips();applyFilter();
  }
  sourcesFor(key);
  restart($('.hero .in'));restart(isHome?homeBody:isLearn?learnBody:stageEl);
  window.scrollTo(0,0);
  moveInd();refresh();
}
document.addEventListener('click',function(ev){
  var a=ev.target.closest('a[data-route]');
  if(a){
    ev.preventDefault();
    var k=a.dataset.route;
    try{history.replaceState(null,'','#'+k)}catch(e){}
    if(k!==view)route(k);else window.scrollTo(0,0);
    return;
  }
  var sc=ev.target.closest('a[data-scroll]');
  if(sc){
    ev.preventDefault();
    var t=document.getElementById(sc.dataset.scroll);
    if(t)t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  }
});
function fromHash(){var h=(location.hash||'').replace('#','');return (h==='home'||h==='learn'||PERIODS[h])?h:null}
window.addEventListener('hashchange',function(){if(!document.body.classList.contains('unlocked'))return;var k=fromHash();if(k&&k!==view)route(k)});
window.addEventListener('resize',moveInd);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(moveInd);

/* ---------- learn page: map, people, life, before, glossary, debates ---------- */
var LEARN={
  eyebrow:"ชวนรู้เพิ่ม · นอกเหนือจากไทม์ไลน์",
  title:"เรื่องน่ารู้",
  lede:"แผนผังเมืองหลวง บุคคลสำคัญ วิถีชีวิตของผู้คน บ้านเมืองก่อนสุโขทัย คำศัพท์ และเรื่องที่นักประวัติศาสตร์ยังเห็นต่างกัน",
  facts:["แผนผังเมืองสำคัญ","บุคคลสำคัญ 13 พระองค์","คำศัพท์ที่กดดูความหมายได้"],
  src:[
    {t:"ข้อถกเถียงเรื่องจารึกหลักที่ 1 ศิลปวัฒนธรรม",u:"https://www.silpa-mag.com/?p=2203"},
    {t:"วิวาทะเจดีย์ยุทธหัตถี ศิลปวัฒนธรรม",u:"https://www.silpa-mag.com/?p=104968"},
    {t:"การสถาปนาอาณาจักรอยุธยา ทรูปลูกปัญญา",u:"https://www.trueplookpanya.com/learning/detail/31344"}
  ]
};
var CITY={
  sukhothai:{n:"สุโขทัย",lat:17.02,lon:99.70},satchanalai:{n:"ศรีสัชนาลัย",lat:17.5,lon:99.8},
  chiangmai:{n:"เชียงใหม่",lat:18.79,lon:98.98},phrae:{n:"แพร่",lat:18.14,lon:100.14},nan:{n:"น่าน",lat:18.78,lon:100.78},
  luang:{n:"หลวงพระบาง",lat:19.89,lon:102.13},vientiane:{n:"เวียงจันทน์",lat:17.97,lon:102.6},
  nakhon:{n:"นครศรีธรรมราช",lat:8.43,lon:99.96},ayutthaya:{n:"อยุธยา",lat:14.36,lon:100.56},lopburi:{n:"ลพบุรี",lat:14.8,lon:100.65},
  chanthaburi:{n:"จันทบุรี",lat:12.61,lon:102.1},bangkok:{n:"ธนบุรี และกรุงเทพฯ",lat:13.75,lon:100.5}
};
var MAPSTEPS=[
  {k:"sukhothai",label:"สุโขทัย",yr:"ราว พ.ศ. 1781",on:["sukhothai","satchanalai"],lines:[["sukhothai","phrae"],["sukhothai","nan"],["sukhothai","luang"],["sukhothai","vientiane"],["sukhothai","nakhon"]],reach:["phrae","nan","luang","vientiane","nakhon"],
   text:"ศูนย์กลางอยู่ที่สุโขทัยและศรีสัชนาลัย จารึกหลักที่ 1 กล่าวถึงบ้านเมืองที่อยู่ใต้อำนาจของพ่อขุนรามคำแหง เช่น แพร่ น่าน หลวงพระบาง เวียงจันทน์ และนครศรีธรรมราช (เส้นประ) แต่ขอบเขตอำนาจจริงเป็นเรื่องที่นักวิชาการยังถกเถียงกัน"},
  {k:"ayutthaya",label:"กรุงศรีอยุธยา",yr:"พ.ศ. 1893",on:["ayutthaya","lopburi"],lines:[["sukhothai","ayutthaya"]],reach:[],
   text:"พระเจ้าอู่ทองสถาปนากรุงศรีอยุธยาบนเกาะกลางแม่น้ำ ใกล้ปากทางสู่ทะเล เหมาะกับการค้าทางน้ำ ลพบุรียังเป็นเมืองสำคัญ และสมเด็จพระนารายณ์เคยประทับที่นั่นเป็นเวลานาน"},
  {k:"thonburi",label:"ธนบุรี",yr:"พ.ศ. 2310",on:["chanthaburi","bangkok"],lines:[["chanthaburi","bangkok"]],reach:[],
   text:"หลังเสียกรุงครั้งที่ 2 พระเจ้าตากรวบรวมกำลังจากจันทบุรี แล้วยกกลับมากอบกู้เอกราช และตั้งธนบุรีเป็นราชธานีใหม่ ซึ่งอยู่ใกล้ทะเลและป้องกันง่ายกว่าอยุธยาที่ถูกทำลาย"},
  {k:"rattanakosin",label:"รัตนโกสินทร์",yr:"พ.ศ. 2325",on:["bangkok"],lines:[],reach:[],
   text:"รัชกาลที่ 1 ย้ายราชธานีข้ามแม่น้ำมาฝั่งตะวันออก สร้างกรุงรัตนโกสินทร์ ซึ่งภายหลังคือกรุงเทพมหานคร ใช้คลองรอบเมืองและแม่น้ำเจ้าพระยาเป็นปราการ"}
];
var PEOPLE=[
 {id:"ps1",n:"พ่อขุนศรีอินทราทิตย์",era:"sukhothai",yr:"ราว พ.ศ. 1781",role:"ปฐมกษัตริย์แห่งสุโขทัย",
  t:"เดิมคือพ่อขุนบางกลางหาว ร่วมกับพ่อขุนผาเมืองขับไล่ขอมสบาดโขลญลำพงออกจากสุโขทัย แล้วขึ้นครองราชย์เป็นกษัตริย์องค์แรกของราชวงศ์พระร่วง",ev:["found"]},
 {id:"ps2",n:"พ่อขุนรามคำแหงมหาราช",era:"sukhothai",yr:"ราว พ.ศ. 1822–1841",role:"กษัตริย์ผู้ขยายอาณาจักรและประดิษฐ์ลายสือไทย",
  t:"ตามจารึกหลักที่ 1 ทรงขยายอำนาจ ประดิษฐ์ลายสือไทยเมื่อ พ.ศ. 1826 ปกครองแบบพ่อปกครองลูก และแขวนกระดิ่งหน้าประตูให้ราษฎรมาร้องทุกข์ได้",ev:["expand","script","rule"]},
  {id:"ps3",n:"พญาลิไท (พระมหาธรรมราชาที่ 1)",era:"sukhothai",yr:"ราว พ.ศ. 1890",role:"กษัตริย์นักปราชญ์ ผู้แต่งไตรภูมิพระร่วง",
  t:"ทรงเป็นกษัตริย์ผู้เคร่งในพระพุทธศาสนา ตามประวัติทรงแต่งไตรภูมิพระร่วง และทรงส่งเสริมพุทธศาสนาแบบลังกาวงศ์",ev:["traiphum","lithai"]},
 {id:"pa1",n:"สมเด็จพระรามาธิบดีที่ 1 (พระเจ้าอู่ทอง)",era:"ayutthaya",yr:"ครองราชย์ พ.ศ. 1893–1912",role:"ผู้สถาปนากรุงศรีอยุธยา",
  t:"ทรงสถาปนากรุงศรีอยุธยาเมื่อ พ.ศ. 1893 และวางระบบการปกครองและกฎหมายเริ่มแรกของอาณาจักร",ev:["ay-found"]},
 {id:"pa2",n:"สมเด็จพระสุริโยทัย",era:"ayutthaya",yr:"พ.ศ. 2091",role:"พระอัครมเหสีผู้ทรงออกศึก",
  t:"พระอัครมเหสีของสมเด็จพระมหาจักรพรรดิ ตามพระราชพงศาวดารทรงออกศึกสงครามช้างเผือก และสิ้นพระชนม์บนคอช้างขณะเข้าขวางเพื่อป้องกันพระสวามี",ev:["ay-suriyothai"]},
 {id:"pa3",n:"สมเด็จพระนเรศวรมหาราช",era:"ayutthaya",yr:"ครองราชย์ พ.ศ. 2133–2148",role:"กษัตริย์นักรบผู้กอบกู้เอกราช",
  t:"ทรงประกาศอิสรภาพจากพม่าเมื่อ พ.ศ. 2127 และเป็นพระมหากษัตริย์ในเรื่องยุทธหัตถี ซึ่งเป็นการรบบนหลังช้างตามพระราชพงศาวดาร",ev:["ay-independence","ay-elephant"]},
 {id:"pa4",n:"สมเด็จพระนารายณ์มหาราช",era:"ayutthaya",yr:"ครองราชย์ พ.ศ. 2199–2231",role:"กษัตริย์ผู้ติดต่อค้าขายและเจริญสัมพันธ์กับต่างประเทศ",
  t:"รัชสมัยของพระองค์เป็นยุคที่อยุธยาติดต่อกับฝรั่งเศส เปอร์เซีย และชาติต่าง ๆ มีการส่งและรับคณะทูตและการค้าอย่างคึกคัก",ev:["ay-narai"]},
 {id:"pt1",n:"สมเด็จพระเจ้าตากสินมหาราช",era:"thonburi",yr:"พ.ศ. 2310–2325",role:"ผู้กอบกู้เอกราชและสถาปนากรุงธนบุรี",
  t:"หลังเสียกรุงครั้งที่ 2 ทรงรวบรวมกำลังตีฝ่าวงล้อมออกจากกรุงศรีอยุธยา กอบกู้เอกราช ตั้งธนบุรีเป็นราชธานี และรวมแผ่นดินที่แตกเป็นชุมนุม",ev:["th-break","th-recapture","th-capital","th-unite"]},
 {id:"pr1",n:"พระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช (รัชกาลที่ 1)",era:"rattanakosin",yr:"ครองราชย์ พ.ศ. 2325–2352",role:"ปฐมกษัตริย์แห่งราชวงศ์จักรี",
  t:"ทรงสถาปนากรุงรัตนโกสินทร์เมื่อ พ.ศ. 2325 และโปรดให้ชำระกฎหมายจนเป็นกฎหมายตราสามดวง",ev:["rk-found","rk-law"]},
 {id:"pr2",n:"พระบาทสมเด็จพระจอมเกล้าเจ้าอยู่หัว (รัชกาลที่ 4)",era:"rattanakosin",yr:"ครองราชย์ พ.ศ. 2394–2411",role:"ผู้เปิดประเทศค้าขายกับตะวันตก",
  t:"ในรัชสมัยของพระองค์ไทยทำสนธิสัญญาเบาว์ริงกับอังกฤษเมื่อ พ.ศ. 2398 ซึ่งเปิดการค้าเสรีและเปลี่ยนเศรษฐกิจของประเทศ",ev:["rk-bowring"]},
 {id:"pr3",n:"พระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว (รัชกาลที่ 5)",era:"rattanakosin",yr:"ครองราชย์ พ.ศ. 2411–2453",role:"ผู้ปฏิรูปประเทศให้ทันสมัย",
  t:"ทรงปฏิรูปการปกครอง การศึกษา และการคมนาคม ทรงเลิกทาสจนสำเร็จเมื่อ พ.ศ. 2448 และต้องรับมือวิกฤตการณ์ ร.ศ. 112 ในปี พ.ศ. 2436",ev:["rk-r5","rk-slave","rk-paknam"]},
 {id:"pr4",n:"พระบาทสมเด็จพระปกเกล้าเจ้าอยู่หัว (รัชกาลที่ 7)",era:"rattanakosin",yr:"ครองราชย์ พ.ศ. 2468–2477",role:"พระมหากษัตริย์ในช่วงเปลี่ยนแปลงการปกครอง",
  t:"ในรัชสมัยของพระองค์เกิดการเปลี่ยนแปลงการปกครองเมื่อ พ.ศ. 2475 จากระบอบสมบูรณาญาสิทธิราชย์ เป็นระบอบประชาธิปไตยที่มีพระมหากษัตริย์ทรงเป็นประมุข",ev:["rk-1932"]},
 {id:"pr5",n:"พระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช (รัชกาลที่ 9)",era:"rattanakosin",yr:"ครองราชย์ พ.ศ. 2489–2559",role:"พระมหากษัตริย์ผู้ครองราชย์ยาวนานที่สุดของไทย",
  t:"ทรงครองราชย์ 70 ปี พระราชกรณียกิจจำนวนมากเน้นการพัฒนาชนบท การเกษตร และแหล่งน้ำ",ev:["rk-r9"]}
];
var LIFE={
 sukhothai:[
  {h:"ในน้ำมีปลา ในนามีข้าว",t:"จารึกหลักที่ 1 บรรยายความอุดมสมบูรณ์ของสุโขทัยด้วยประโยคนี้ ผู้คนทำนา หาปลา และเก็บของป่า ชาวเมืองใช้ตระพังและทำนบกักน้ำไว้ใช้ตลอดปี"},
  {h:"การค้าเสรี",t:"จารึกกล่าวว่าเจ้าเมืองไม่เก็บจกอบ (ภาษีผ่านด่าน) จากพ่อค้าที่ผ่านไปมา ทำให้พ่อค้าเดินทางค้าขายได้สะดวก"},
  {h:"อักษรและภาษา",t:"ลายสือไทยประดิษฐ์ขึ้นราว พ.ศ. 1826 ตามจารึกหลักที่ 1 และเป็นรากของอักษรไทยที่ใช้อยู่ในปัจจุบัน"},
  {h:"ศาสนาและศิลปะ",t:"รับพุทธศาสนาแบบลังกาวงศ์ ศิลปะสุโขทัยเด่นที่พระพุทธรูปปางลีลาที่ดูเหมือนก้าวเดิน และเจดีย์ทรงพุ่มข้าวบิณฑ์"},
  {h:"เครื่องสังคโลก",t:"เครื่องปั้นดินเผาเคลือบจากสุโขทัยและศรีสัชนาลัย ใช้ในชีวิตประจำวันและส่งออกไปขายต่างแดน"},
  {h:"ประเพณีลอยกระทง (ตำนาน)",t:"เล่ากันว่านางนพมาศประดิษฐ์กระทงรูปดอกบัวถวายพระร่วง แต่นักวิชาการเห็นว่าเรื่องนี้เป็นตำนานที่เล่าต่อกันมาภายหลัง"}],
 ayutthaya:[
  {h:"เมืองท่านานาชาติ",t:"กรุงศรีอยุธยาเป็นเมืองท่านานาชาติ มีชุมชนพ่อค้าต่างชาติ เช่น จีน ญี่ปุ่น เปอร์เซีย โปรตุเกส ฮอลันดา และฝรั่งเศส"},
  {h:"เมืองบนเกาะ",t:"เกาะเมืองล้อมด้วยแม่น้ำเจ้าพระยา ป่าสัก และลพบุรี ผู้คนเดินทางด้วยเรือเป็นหลัก ตลาดน้ำและบ้านเรือนริมน้ำเป็นภาพคุ้นตา"},
  {h:"ศักดินาและไพร่",t:"สังคมแบ่งเป็นชนชั้น ใช้ศักดินากำหนดฐานะ ไพร่ต้องสังกัดมูลนายและถูกเกณฑ์แรงงานหรือไปรบ"},
  {h:"กองทัพช้าง",t:"ช้างเป็นพาหนะในการรบและเป็นสัญลักษณ์ของพระราชอำนาจ ช้างเผือกมีความสำคัญต่อพระมหากษัตริย์"},
  {h:"ขนมหวานที่เล่ากันว่ามีมาตั้งแต่อยุธยา",t:"มีเรื่องเล่าว่าขนมอย่างทองหยิบ ทองหยอด ฝอยทอง เผยแพร่ในสมัยพระนารายณ์ โดยมารี กีมาร์ หรือท้าวทองกีบม้า นักวิชาการบางคนยังไม่แน่ใจรายละเอียดของเรื่องนี้"},
  {h:"วรรณคดีและศิลปะ",t:"กาพย์เห่เรือเจ้าฟ้ากุ้งเป็นวรรณคดีสำคัญสมัยอยุธยา ศิลปะอยุธยามีพระปรางค์ เจดีย์ และจิตรกรรมตามวัด"}],
 thonburi:[
  {h:"เมืองหลวงริมน้ำ",t:"ธนบุรีเป็นราชธานีเล็กที่อยู่ติดแม่น้ำเจ้าพระยา ใกล้ทะเลกว่าอยุธยา ใช้เรือและคลองในการสัญจร"},
  {h:"ฟื้นฟูบ้านเมืองหลังสงคราม",t:"หลังเสียกรุง บ้านเมืองแตกเป็นชุมนุม ผู้คนอดอยาก พระเจ้าตากต้องรวมแผ่นดิน ส่งเสริมการเกษตร และฟื้นฟูการค้า"},
  {h:"การค้ากับจีน",t:"ธนบุรีค้าขายกับจีนอย่างคึกคัก และมีชาวจีนจำนวนมากอยู่ในเมือง"},
  {h:"วรรณคดีและศาสนา",t:"สมัยนี้มีการรวบรวมและสร้างวรรณคดีขึ้นใหม่ เช่น พระราชนิพนธ์รามเกียรติ์ บางตอน และมีการฟื้นฟูวัดวาอาราม"}],
 rattanakosin:[
  {h:"ถนนและรถไฟ",t:"ถนนเจริญกรุงสร้างเสร็จเมื่อ พ.ศ. 2407 และรถไฟสายแรกวิ่งระหว่างกรุงเทพฯ กับปากน้ำเมื่อ พ.ศ. 2436 เปลี่ยนการเดินทางและเมืองไปตลอดกาล"},
  {h:"ไปรษณีย์และการสื่อสาร",t:"ไทยเริ่มมีบริการไปรษณีย์เมื่อ พ.ศ. 2426 ในรัชกาลที่ 5 ทำให้ข่าวสารเดินทางได้ไกลและเร็วขึ้น"},
  {h:"การศึกษาและการเลิกทาส",t:"รัชกาลที่ 5 ทรงตั้งโรงเรียนและขยายการศึกษา และเลิกทาสจนสำเร็จเมื่อ พ.ศ. 2448"},
  {h:"วรรณกรรม",t:"สุนทรภู่เป็นกวีเอกที่ประพันธ์พระอภัยมณี และนิราศหลายเรื่องในต้นรัตนโกสินทร์"},
  {h:"ธงไตรรงค์",t:"ไทยใช้ธงไตรรงค์เป็นธงชาติตั้งแต่ พ.ศ. 2460 ในสมัยรัชกาลที่ 6"},
  {h:"ชื่อประเทศ",t:"ชื่อประเทศเปลี่ยนจากสยามเป็นไทยอย่างเป็นทางการเมื่อ พ.ศ. 2482"}]
};
var BEFORE=[
 {n:"ทวารวดี",yr:"ราวพุทธศตวรรษที่ 12–16",t:"กลุ่มบ้านเมืองที่นับถือพุทธศาสนา ในที่ราบภาคกลาง เช่น นครปฐม อู่ทอง ลพบุรี มีธรรมจักรศิลาและพระพุทธรูปเป็นหลักฐานสำคัญ"},
 {n:"ศรีวิชัย",yr:"ราว พ.ศ. 1200–1800",t:"อาณาจักรทางทะเลที่มีศูนย์กลางอยู่ที่เกาะสุมาตรา มีอิทธิพลถึงภาคใต้ของไทย เช่น ไชยา และตามพรลิงค์ (นครศรีธรรมราช)"},
 {n:"ลพบุรีและอิทธิพลขอม",yr:"ราวพุทธศตวรรษที่ 16–18",t:"ศิลปะและการปกครองแบบเขมรโบราณแพร่เข้ามาในภาคกลางและอีสาน เห็นได้จากปราสาทหินพิมายและปราสาทพนมรุ้ง"},
 {n:"หริภุญไชย",yr:"ราวพุทธศตวรรษที่ 13–19",t:"เมืองสำคัญทางภาคเหนือตอนบน มีลำพูนเป็นศูนย์กลาง จนถูกพญามังรายผนวกเมื่อ พ.ศ. 1835"},
 {n:"ล้านนา",yr:"ตั้งเมืองเชียงใหม่ พ.ศ. 1839",t:"พญามังรายรวมบ้านเมืองทางเหนือ และสร้างเมืองเชียงใหม่ เป็นศูนย์กลางของล้านนา ซึ่งมีวัฒนธรรมและภาษาเป็นของตนเอง"},
 {n:"ล้านช้าง",yr:"ตั้งเมื่อ พ.ศ. 1896",t:"พญาฟ้างุ่มสถาปนาอาณาจักรล้านช้างบริเวณลุ่มน้ำโขง มีหลวงพระบางเป็นศูนย์กลาง"},
 {n:"พม่า (ตองอูและคองบอง)",yr:"ราว พ.ศ. 2053–2428",t:"ราชวงศ์ตองอูและคองบองเป็นคู่ศึกสำคัญที่ผลัดกันทำสงครามกับอยุธยา ธนบุรี และรัตนโกสินทร์ ตามเรื่องเล่าในประวัติศาสตร์ไทย"}
];
var GLOSS=[
 {w:"ศักดินา",d:"ระบบที่ใช้ตัวเลขจำนวนที่นากำหนดฐานะและสิทธิของคนแต่ละระดับในสังคมสมัยอยุธยา"},
 {w:"จตุสดมภ์",d:"เสาหลัก 4 ด้านของการปกครองสมัยอยุธยา คือ เวียง วัง คลัง นา"},
 {w:"ไพร่",d:"สามัญชนชายที่ต้องสังกัดมูลนายและถูกเกณฑ์แรงงานหรือไปรบ"},
 {w:"ทาส",d:"คนที่ถูกซื้อขายหรือติดหนี้ และต้องทำงานให้นาย รัชกาลที่ 5 ทรงเลิกทาสจนสำเร็จเมื่อ พ.ศ. 2448"},
 {w:"จกอบ",d:"ภาษีผ่านด่านที่เก็บจากสินค้าและพ่อค้า จารึกหลักที่ 1 บอกว่าสุโขทัยไม่เก็บ"},
 {w:"ลายสือไทย",d:"ตัวอักษรไทยแบบแรก ประดิษฐ์ราว พ.ศ. 1826 ตามจารึกหลักที่ 1"},
 {w:"จารึก",d:"ข้อความที่เขียนหรือสลักไว้บนหิน โลหะ หรือวัสดุอื่น"},
 {w:"สังคโลก",d:"เครื่องปั้นดินเผาเคลือบจากสุโขทัยและศรีสัชนาลัย ส่งออกไปขายต่างแดน"},
 {w:"ตระพัง",d:"สระน้ำใหญ่ที่ขุดไว้เก็บน้ำในเมืองสุโขทัย เช่น ตระพังเงิน ตระพังทอง"},
 {w:"ลังกาวงศ์",d:"พุทธศาสนาเถรวาทแบบที่รับมาจากลังกา (ศรีลังกา) แพร่หลายในสุโขทัยและต่อมาทั่วประเทศ"},
 {w:"พุ่มข้าวบิณฑ์",d:"รูปทรงเจดีย์ยอดคล้ายดอกบัวตูมหรือพุ่มข้าว เป็นเอกลักษณ์ของศิลปะสุโขทัย"},
 {w:"ยุทธหัตถี",d:"การรบกันตัวต่อตัวบนหลังช้างระหว่างแม่ทัพหรือกษัตริย์ของสองฝ่าย"},
 {w:"เสียกรุง",d:"การที่กรุงศรีอยุธยาถูกข้าศึกตีแตกและยึดเมืองหลวงได้ เกิดสองครั้ง คือ พ.ศ. 2112 และ 2310"},
 {w:"ราชธานี",d:"เมืองหลวงที่เป็นที่ประทับของพระมหากษัตริย์"},
 {w:"ประเทศราช",d:"เมืองหรืออาณาจักรที่อ่อนน้อมต่อศูนย์กลาง ส่งเครื่องบรรณาการ แต่ปกครองตนเองได้บางส่วน"},
 {w:"สำเภา",d:"เรือเดินทะเลขนาดใหญ่แบบจีน ใช้บรรทุกสินค้าไปค้าขาย"},
 {w:"เกาะเมือง",d:"ส่วนใจกลางกรุงศรีอยุธยาที่มีแม่น้ำล้อมรอบเป็นเกาะ"},
 {w:"กฎหมายตราสามดวง",d:"ประมวลกฎหมายที่ชำระในรัชกาลที่ 1 เมื่อ พ.ศ. 2347 ประทับตราสามดวงกำกับ"},
 {w:"สนธิสัญญาเบาว์ริง",d:"สนธิสัญญากับอังกฤษ พ.ศ. 2398 ที่เปิดการค้าเสรี และเก็บภาษีขาเข้าในอัตราคงที่"},
 {w:"ร.ศ.",d:"รัตนโกสินทรศก ปีนับจากการสถาปนากรุงรัตนโกสินทร์ พ.ศ. 2325 เป็นปีที่ 1 เช่น ร.ศ. 112 คือ พ.ศ. 2436"},
 {w:"เปลี่ยนแปลงการปกครอง",d:"เหตุการณ์วันที่ 24 มิถุนายน พ.ศ. 2475 ที่เปลี่ยนจากสมบูรณาญาสิทธิราชย์ เป็นระบอบประชาธิปไตยที่มีพระมหากษัตริย์ทรงเป็นประมุข"},
 {w:"พุทธศตวรรษ",d:"ช่วงเวลา 100 ปีที่นับจากปีพุทธศักราช เช่น พุทธศตวรรษที่ 18 คือ พ.ศ. 1701–1800"},
 {w:"มรดกโลก",d:"แหล่งที่องค์การยูเนสโกขึ้นทะเบียนว่ามีคุณค่าโดดเด่นต่อมนุษยชาติ"},
 {w:"ธรรมราชา",d:"พระราชาผู้ปกครองตามหลักธรรม"}
];
var DEBATES=[
 {ev:"script",era:"sukhothai",h:"จารึกหลักที่ 1 สร้างสมัยใคร",t:"นักวิชาการส่วนใหญ่เห็นว่าข้อความตอนต้นของจารึกมาจากสมัยพ่อขุนรามคำแหง ส่วนตอนท้ายเพิ่มภายหลัง แต่ศรีศักร วัลลิโภดมเห็นว่าจารึกทั้งหลักน่าจะสร้างหลังรัชกาล ในสมัยพญาลิไท",src:"https://www.silpa-mag.com/?p=2203"},
 {ev:"ay-found",era:"ayutthaya",h:"พระเจ้าอู่ทองมาจากไหน",t:"มีสองแนวคิดหลัก คือ ทรงอพยพมาจากเมืองอื่นแล้วสถาปนากรุงศรีอยุธยา หรือทรงปกครองบริเวณใกล้เคียงอยุธยามาก่อน ส่วนปีสถาปนา พ.ศ. 1893 เป็นปีที่ใช้กันทั่วไป",src:"https://www.trueplookpanya.com/learning/detail/31344"},
 {ev:"ay-elephant",era:"ayutthaya",h:"ยุทธหัตถีเกิดที่ไหน",t:"สถานที่ยุทธหัตถีมีหลายความเห็น ได้แก่ สุพรรณบุรี (ตามสมเด็จฯ กรมพระยาดำรงราชานุภาพ พ.ศ. 2456) ดอนเจดีย์ที่พนมทวน กาญจนบุรี เจดีย์ภูเขาทองที่อยุธยา และมีผู้เสนอว่าเรื่องการสร้างเจดีย์อาจเป็นโวหารในพงศาวดาร",src:"https://www.silpa-mag.com/?p=104968"},
 {ev:"th-vientiane",era:"thonburi",h:"ตีเวียงจันทน์ปีไหน",t:"แหล่งข้อมูลที่ใช้อ้างอิงบางแห่งระบุปี พ.ศ. 2312 ขณะที่เว็บนี้ใช้ ราว พ.ศ. 2321 ตามหลายแหล่ง จึงควรตรวจสอบกับหลายแหล่งก่อนนำไปอ้างอิง",src:""}
];

var learnBody=document.getElementById('learnBody'),LT='map',LERA='all',LLIFE='sukhothai',MSTEP=0,mtimer=0,GQ='';
var ECOL={sukhothai:'var(--celadon)',ayutthaya:'var(--laterite)',thonburi:'var(--slate)',rattanakosin:'var(--gold)'};
var LTABS=[['map','แผนผังเมืองหลวง'],['people','บุคคลสำคัญ'],['life','วิถีชีวิต'],['before','ก่อนสุโขทัย'],['gloss','คำศัพท์'],['debate','นักวิชาการเห็นต่าง']];
function evBtn(k,id){
  var e=null;PERIODS[k].events.forEach(function(x){if(x.id===id)e=x});
  return e?'<button type="button" class="ln-ev" data-ev="'+k+'|'+id+'" style="--c:'+ECOL[k]+'">'+esc(e.big+' '+e.title)+'</button>':'';
}
function eraChips(cur,attr){
  var h='<div class="ln-chips" role="group">';
  h+='<button type="button" '+attr+'="all" aria-pressed="'+(cur==='all')+'">ทุกสมัย</button>';
  ORDER.forEach(function(k){h+='<button type="button" '+attr+'="'+k+'" aria-pressed="'+(cur===k)+'">'+esc(PERIODS[k].name)+'</button>'});
  return h+'</div>';
}
function mapPos(c){return {x:(c.lon-96.5)*40+20,y:(21-c.lat)*40+20}}
function mapHTML(){
  var st=MAPSTEPS[MSTEP],h='<div class="ln-map">';
  h+='<div class="mp-side"><div class="ln-chips" role="group" aria-label="เลือกช่วงเวลา">';
  MAPSTEPS.forEach(function(s,i){h+='<button type="button" data-ms="'+i+'" aria-pressed="'+(i===MSTEP)+'">'+s.label+'</button>'});
  h+='</div><div class="mp-card" style="--c:'+ECOL[st.k]+'"><span class="rg">'+st.yr+'</span><h3>'+esc(st.label)+'</h3><p>'+esc(st.text)+'</p>';
  h+='<button type="button" class="btn ghost sm" data-mplay><span>'+(mtimer?'หยุดเดินทาง':'เดินทางตามเมืองหลวง')+'</span></button>';
  h+='<p class="note-s">แผนผังนี้วางตำแหน่งเมืองตามละติจูดและลองจิจูดโดยประมาณ ไม่ใช่แผนที่ละเอียดและไม่แสดงเส้นพรมแดน</p></div></div>';
  h+='<svg class="mp-svg" viewBox="0 0 340 580" role="img" aria-label="แผนผังตำแหน่งเมืองสำคัญ">';
  for(var la=8;la<=20;la+=2){var y=(21-la)*40+20;h+='<line x1="0" x2="340" y1="'+y+'" y2="'+y+'" class="gr"/>'}
  for(var lo=97;lo<=104;lo+=1){var x=(lo-96.5)*40+20;h+='<line y1="0" y2="580" x1="'+x+'" x2="'+x+'" class="gr"/>'}
  h+='<text x="190" y="430" class="sea">อ่าวไทย</text><text x="20" y="500" class="sea">ทะเลอันดามัน</text>';
  st.lines.forEach(function(l){var a=mapPos(CITY[l[0]]),b=mapPos(CITY[l[1]]);h+='<line class="ln" x1="'+a.x.toFixed(1)+'" y1="'+a.y.toFixed(1)+'" x2="'+b.x.toFixed(1)+'" y2="'+b.y.toFixed(1)+'" style="stroke:'+ECOL[st.k]+'"/>'});
  var side={sukhothai:'l',chiangmai:'l',ayutthaya:'l'};
  Object.keys(CITY).forEach(function(id){
    var c=CITY[id],p=mapPos(c),on=st.on.indexOf(id)>=0,rc=st.reach.indexOf(id)>=0,l=side[id]==='l';
    h+='<g class="ct'+(on?' on':'')+(rc?' rc':'')+'" style="--c:'+ECOL[st.k]+'">';
    if(on)h+='<circle class="pu" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="7"/>';
    h+='<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="'+(on?6:4)+'"/><text x="'+(p.x+(l?-10:10)).toFixed(1)+'" y="'+(p.y+4).toFixed(1)+'" text-anchor="'+(l?'end':'start')+'">'+esc(c.n)+'</text></g>';
  });
  return h+'</svg></div>';
}
function peopleHTML(){
  var h=eraChips(LERA,'data-le')+'<div class="ln-grid">';
  PEOPLE.filter(function(p){return LERA==='all'||p.era===LERA}).forEach(function(p){
    h+='<article class="ln-card" style="--c:'+ECOL[p.era]+'"><div class="av" aria-hidden="true">'+esc(p.n.replace(/^(สมเด็จพระ|พระบาทสมเด็จพระ|พ่อขุน|พญา)/,'').charAt(0)||'ท')+'</div>'+
      '<div class="bd"><span class="rg">'+esc(PERIODS[p.era].name+' · '+p.yr)+'</span><h3>'+esc(p.n)+'</h3><p class="role">'+esc(p.role)+'</p><p>'+esc(p.t)+'</p><div class="evs">'+p.ev.map(function(i){return evBtn(p.era,i)}).join('')+'</div></div></article>';
  });
  return h+'</div>';
}
function lifeHTML(){
  var h='<div class="ln-chips" role="group">';
  ORDER.forEach(function(k){h+='<button type="button" data-ll="'+k+'" aria-pressed="'+(LLIFE===k)+'">'+esc(PERIODS[k].name)+'</button>'});
  h+='</div><div class="ln-grid">';
  LIFE[LLIFE].forEach(function(c){h+='<article class="ln-card flat" style="--c:'+ECOL[LLIFE]+'"><div class="bd"><h3>'+esc(c.h)+'</h3><p>'+esc(c.t)+'</p></div></article>'});
  return h+'</div>';
}
function beforeHTML(){
  var h='<p class="ln-intro">ก่อนสุโขทัยและตลอดสมัยที่เรียนมา ยังมีบ้านเมืองและอาณาจักรอื่นที่เกี่ยวข้องกับประวัติศาสตร์ไทย รายการนี้เรียงตามช่วงเวลาโดยประมาณ</p><ol class="ln-tl">';
  BEFORE.forEach(function(b){h+='<li><span class="yr">'+esc(b.yr)+'</span><div><h3>'+esc(b.n)+'</h3><p>'+esc(b.t)+'</p></div></li>'});
  return h+'</ol>';
}
function glossListHTML(){
  var q=GQ.trim(),h='';
  GLOSS.filter(function(g){return !q||g.w.indexOf(q)>=0||g.d.indexOf(q)>=0}).forEach(function(g){h+='<div class="ln-gl"><dt>'+esc(g.w)+'</dt><dd>'+esc(g.d)+'</dd></div>'});
  return h||'<p class="ln-intro">ไม่พบคำที่ค้นหา</p>';
}
function glossHTML(){
  return '<label class="fld ln-search" for="gq"><span>ค้นหาคำศัพท์</span><input id="gq" type="search" value="'+esc(GQ).replace(/"/g,'&quot;')+'" placeholder="เช่น ศักดินา"></label><p class="ln-intro">คำศัพท์เหล่านี้ยังปรากฏเป็นปุ่มขีดเส้นใต้ในหน้ารายละเอียดของแต่ละเหตุการณ์ กดแล้วดูความหมายได้</p><dl class="ln-gls" id="glList">'+glossListHTML()+'</dl>';
}
function debateHTML(){
  var h='<p class="ln-intro">ประวัติศาสตร์ไม่ได้มีคำตอบเดียวเสมอไป เรื่องเหล่านี้คือที่ที่นักวิชาการและหลักฐานยังชี้ไปคนละทาง</p><div class="ln-grid">';
  DEBATES.forEach(function(d){
    h+='<article class="ln-card flat" style="--c:'+ECOL[d.era]+'"><div class="bd"><span class="rg">สมัย'+esc(PERIODS[d.era].name)+'</span><h3>'+esc(d.h)+'</h3><p>'+esc(d.t)+'</p><div class="evs">'+evBtn(d.era,d.ev)+(d.src?'<a class="ln-src" href="'+d.src+'" target="_blank" rel="noopener">แหล่งอ้างอิง</a>':'')+'</div></div></article>';
  });
  return h+'</div>';
}
function buildLearn(){
  if(!learnBody)return;
  var tabs='<div class="ln-tabs" role="tablist" aria-label="หมวดเรื่องน่ารู้">';
  LTABS.forEach(function(t){tabs+='<button type="button" role="tab" data-lt="'+t[0]+'" aria-selected="'+(LT===t[0])+'">'+t[1]+'</button>'});
  tabs+='</div>';
  var body=LT==='map'?mapHTML():LT==='people'?peopleHTML():LT==='life'?lifeHTML():LT==='before'?beforeHTML():LT==='gloss'?glossHTML():debateHTML();
  learnBody.querySelector('.in').innerHTML=tabs+'<div class="ln-panel" role="tabpanel">'+body+'</div>';
}
function stopMapPlay(){clearInterval(mtimer);mtimer=0}
function gotoEv(pair){
  var q=pair.split('|');stopMapPlay();
  try{history.replaceState(null,'','#'+q[0])}catch(e){}
  route(q[0]);
  setTimeout(function(){if(byId(q[1]))openSheet(q[1])},60);
}
if(learnBody){
  learnBody.addEventListener('click',function(ev){
    var b=ev.target.closest('button');if(!b)return;
    if(b.dataset.lt){stopMapPlay();LT=b.dataset.lt;buildLearn();return}
    if(b.dataset.le){LERA=b.dataset.le;buildLearn();return}
    if(b.dataset.ll){LLIFE=b.dataset.ll;buildLearn();return}
    if(b.dataset.ms!==undefined){stopMapPlay();MSTEP=+b.dataset.ms;buildLearn();return}
    if(b.hasAttribute('data-mplay')){
      if(mtimer){stopMapPlay();buildLearn();return}
      MSTEP=0;buildLearn();
      mtimer=setInterval(function(){if(view!=='learn'||LT!=='map'){stopMapPlay();return}if(MSTEP>=MAPSTEPS.length-1){stopMapPlay();buildLearn();return}MSTEP++;buildLearn()},3600);
      buildLearn();return;
    }
    if(b.dataset.ev){gotoEv(b.dataset.ev)}
  });
  learnBody.addEventListener('input',function(ev){
    if(ev.target.id==='gq'){GQ=ev.target.value;var l=document.getElementById('glList');if(l)l.innerHTML=glossListHTML()}
  });
}
/* glossary buttons inside the detail sheet */
function glossify(txt,used){
  var out=String(txt),marks=[];
  GLOSS.map(function(g,i){return {g:g,i:i}}).sort(function(a,b){return b.g.w.length-a.g.w.length}).forEach(function(o){
    if(used[o.g.w])return;var i=out.indexOf(o.g.w);if(i<0)return;used[o.g.w]=1;
    var tok='\u0001'+marks.length+'\u0002';
    marks.push('<button type="button" class="gterm" data-gl="'+o.i+'">'+o.g.w+'</button>');
    out=out.slice(0,i)+tok+out.slice(i+o.g.w.length);
  });
  return out.replace(/\u0001(\d+)\u0002/g,function(m,n){return marks[+n]});
}
function debateBox(e){
  var d=null;DEBATES.forEach(function(x){if(x.ev===e.id)d=x});
  if(!d)return '';
  return '<div class="debate"><b>นักประวัติศาสตร์ยังเห็นต่าง: '+esc(d.h)+'</b> '+esc(d.t)+(d.src?' <a href="'+d.src+'" target="_blank" rel="noopener">แหล่งอ้างอิง</a>':'')+'</div>';
}
var glCard=document.createElement('div');glCard.className='gl-card';glCard.hidden=true;glCard.setAttribute('role','status');
document.body.appendChild(glCard);
var glTimer=0;
function showGl(i){
  var g=GLOSS[i];if(!g)return;
  glCard.innerHTML='<b>'+esc(g.w)+'</b><span>'+esc(g.d)+'</span><button type="button" aria-label="ปิดคำอธิบาย">ปิด</button>';
  glCard.hidden=false;clearTimeout(glTimer);glTimer=setTimeout(function(){glCard.hidden=true},12000);
}
glCard.addEventListener('click',function(ev){if(ev.target.closest('button'))glCard.hidden=true});
sheet.addEventListener('click',function(ev){var b=ev.target.closest('.gterm');if(b){showGl(+b.dataset.gl)}});

/* ---------- Vue overview (render functions, no template compiler) ---------- */
var vapp=null;
function mountOverview(){
  var el=document.getElementById('vOverview'),wrap=document.getElementById('voWrap');
  if(!el||!window.Vue||!window.Vue.createApp){if(wrap)wrap.hidden=true;return}
  try{
    if(vapp){vapp.unmount();vapp=null}
    var V=window.Vue,h=V.h,Y0=1770,Y1=2580,SPAN=Y1-Y0;
    var RANGES={sukhothai:[1781,1981],ayutthaya:[1893,2310],thonburi:[2310,2325],rattanakosin:[2325,2569]};
    var COL={sukhothai:'var(--celadon)',ayutthaya:'var(--laterite)',thonburi:'var(--slate)',rattanakosin:'var(--gold)'};
    function pct(y){return (y-Y0)/SPAN*100}
    function yr(e){var n=parseInt(String(e.big),10);return n>=1000?n:null}
    vapp=V.createApp({setup:function(){
      var sel=V.ref('ayutthaya'),tip=V.ref(null),year=V.ref(2100),ex=V.ref(pct(2100)),walk=V.ref(false),drag=V.ref(false),wt=null;
      var ALL=[];ORDER.forEach(function(k){PERIODS[k].events.forEach(function(e){var y=yr(e);if(y)ALL.push({k:k,e:e,y:y})})});
      ALL.sort(function(a,b){return a.y-b.y});
      function eraAt(y){return y>=2325?'rattanakosin':y>=2310?'thonburi':y>=1893?'ayutthaya':'sukhothai'}
      function onSlide(y){
        year.value=y;ex.value=pct(y);drag.value=true;walk.value=true;clearTimeout(wt);wt=setTimeout(function(){walk.value=false;drag.value=false},350);
        var best=null,bd=1e9;ALL.forEach(function(o){var d=Math.abs(o.y-y);if(d<bd){bd=d;best=o}});
        if(best&&bd<=12){sel.value=best.k;tip.value={k:best.k,e:best.e}}else{sel.value=eraAt(y);tip.value=null}
      }
      function step(d){
        var n=null;
        if(tip.value){var idx=-1;ALL.forEach(function(o,i){if(o.e.id===tip.value.e.id)idx=i});n=ALL[idx+d]||null}
        else{
          if(d>0){for(var i=0;i<ALL.length;i++){if(ALL[i].y>year.value){n=ALL[i];break}}}
          else{for(var j=ALL.length-1;j>=0;j--){if(ALL[j].y<year.value){n=ALL[j];break}}}
        }
        if(n)pickEv(n.k,n.e);
      }
      function go(x){if(Math.abs(ex.value-x)<.1)return;ex.value=x;walk.value=true;clearTimeout(wt);wt=setTimeout(function(){walk.value=false},1000)}
      function pickEra(k){sel.value=k;tip.value=null;var r=RANGES[k]||[Y0,Y1];year.value=Math.round((r[0]+r[1])/2);go(pct(year.value))}
      function pickEv(k,e){sel.value=k;tip.value={k:k,e:e};var y=yr(e);if(y){year.value=y;go(pct(y))}}
      return function(){
        var lanes=ORDER.map(function(k,i){
          var p=PERIODS[k],r=RANGES[k]||[Y0,Y1],on=sel.value===k;
          var ticks=p.events.map(function(e){
            var y=yr(e);if(!y)return null;
            var ton=tip.value&&tip.value.e.id===e.id;
            return h('button',{key:e.id,type:'button',class:'vo-tick'+(ton?' on':''),style:{left:pct(y).toFixed(2)+'%','--c':COL[k]},'aria-label':e.pre+' '+e.big+' '+e.title,
              onMouseenter:function(){pickEv(k,e)},onFocus:function(){pickEv(k,e)},onClick:function(){pickEv(k,e)}});
          });
          return h('div',{class:'vo-lane',key:k,style:{'--c':COL[k]}},[
            h('div',{class:'vo-lab'},[h('b',null,PERIODS[k].name),h('span',null,'พ.ศ. '+r[0]+'–'+(k==='rattanakosin'?'ปัจจุบัน':r[1]))]),
            h('div',{class:'vo-track'},[
              h('button',{type:'button',class:'vo-bar'+(on?' on':''),'aria-label':'เลือกสมัย'+PERIODS[k].name,style:{left:pct(r[0]).toFixed(2)+'%',width:Math.max(pct(r[1])-pct(r[0]),1.2).toFixed(2)+'%',animationDelay:(i*.12)+'s'},onClick:function(){pickEra(k)},onMouseenter:function(){pickEra(k)}}),
              ticks
            ])
          ]);
        });
        var axis=[1800,2000,2200,2400,2500].map(function(y){return h('span',{class:'vo-yr',key:y,style:{left:pct(y).toFixed(2)+'%'}},String(y))});
        var k=sel.value,p=PERIODS[k],cur=tip.value;
        var panel;
        if(cur){
          panel=h('div',{class:'vo-panel',key:'t'+cur.e.id,style:{'--c':COL[k]}},[
            h('span',{class:'rg'},cur.e.pre+' '+cur.e.big+' · สมัย'+p.name),
            h('h3',null,cur.e.title),h('p',null,cur.e.sum),
            h('a',{href:'#'+k},'เข้าไปอ่านทั้งสมัย'+p.name+' →')
          ]);
        }else{
          panel=h('div',{class:'vo-panel',key:'e'+k},[
            h('span',{class:'rg'},p.range||''),h('h3',null,'สมัย'+p.name),h('p',null,p.blurb||''),
            h('a',{href:'#'+k},'เข้าไปอ่านทั้งสมัย'+p.name+' →'),
            h(V.TransitionGroup,{name:'vo',tag:'div',class:'vo-chips',appear:true},function(){
              return p.events.map(function(e,i){return h('button',{key:e.id,type:'button',class:'vo-chip',style:{transitionDelay:(i*35)+'ms'},onClick:function(){pickEv(k,e)}},e.big+' '+e.title)});
            })
          ]);
        }
        return h('div',null,[
          lanes,
          h('div',{class:'vo-axis'},[axis,
            h('input',{type:'range',class:'vo-range',min:Y0,max:Y1,step:1,value:year.value,'aria-label':'เลื่อนดูปี พ.ศ. บนเส้นเวลา','aria-valuetext':'พ.ศ. '+year.value,onInput:function(ev){onSlide(+ev.target.value)}}),
            h('span',{class:'vo-ele'+(walk.value?' walk':'')+(drag.value?' drag':''),'aria-hidden':'true',style:{left:'calc('+ex.value.toFixed(2)+'% + '+((0.5-ex.value/100)*22).toFixed(1)+'px)'},innerHTML:ELE})]),
          h('div',{class:'vo-step-row'},[
            h('button',{type:'button',class:'vo-step',onClick:function(){step(-1)}},'◀ เหตุการณ์ก่อนหน้า'),
            h('span',{class:'vo-year'},'พ.ศ. '+year.value),
            h('button',{type:'button',class:'vo-step',onClick:function(){step(1)}},'เหตุการณ์ถัดไป ▶')
          ]),
          panel
        ]);
      };
    }});
    vapp.mount(el);
    if(wrap)wrap.hidden=false;
  }catch(err){if(wrap)wrap.hidden=true;try{console.warn(err)}catch(e2){}}
}
/* ---------- mood backgrounds ---------- */
var MOODS={peace:'สงบเขียวชอุ่ม',war:'สงคราม (ไฟ)',joy:'เฉลิมฉลอง',glory:'รุ่งโรจน์ (ทอง)',sorrow:'สูญเสีย (เถ้าถ่าน)',sea:'ค้าขายและทะเล',wisdom:'ปัญญาและปฏิรูป (น้ำเงิน)'};
var MOODMAP={khmer:'peace',found:'joy',elephant:'war',banmueang:'glory',expand:'glory',script:'wisdom',rule:'glory',water:'sea',buddhism:'glory',after:'sorrow',traiphum:'wisdom',lithai:'glory',ayutthaya:'peace',vassal:'sorrow',merge:'sorrow',heritage:'joy',memory:'joy',
'ay-found':'joy','ay-law':'wisdom','ay-portugal':'sea','ay-suriyothai':'war','ay-fall1':'war','ay-independence':'glory','ay-elephant':'war','ay-narai':'sea','ay-borom':'glory','ay-fall2':'war','ay-heritage':'joy',
'th-break':'war','th-recapture':'war','th-capital':'joy','th-unite':'war','th-chiangmai':'war','th-vientiane':'war','th-end':'sorrow',
'rk-found':'joy','rk-law':'wisdom','rk-bowring':'sea','rk-r5':'wisdom','rk-paknam':'war','rk-slave':'joy','rk-1932':'wisdom','rk-name':'wisdom','rk-ww2':'war','rk-r9':'joy','rk-r10':'joy'};
function moodOf(e){
  if(!e)return '';
  if(e.mood&&MOODS[e.mood])return e.mood;
  if(MOODMAP[e.id])return MOODMAP[e.id];
  var t=(e.title||'')+' '+(e.sum||'');
  if(/สงคราม|ศึก|ยุทธ|รบ|ปราบ|กบฏ|ตีเมือง|เสียกรุง|ทัพ/.test(t))return 'war';
  if(/ฉลอง|สถาปนา|ราชาภิเษก|พิธี|ก่อตั้ง|เอกราช|มรดกโลก|เฉลิม/.test(t))return 'joy';
  if(/สิ้นสุด|ล่มสลาย|สวรรคต|สูญเสีย|เสียดินแดน/.test(t))return 'sorrow';
  if(/ค้า|สนธิสัญญา|ทะเล|สำเภา|ต่างชาติ|ทูต/.test(t))return 'sea';
  if(/ปฏิรูป|กฎหมาย|การศึกษา|อักษร|ปัญญา|ประชาธิปไตย|รัฐธรรมนูญ/.test(t))return 'wisdom';
  if(/มหาราช|รุ่งเรือง|ยุคทอง|พระมหากษัตริย์/.test(t))return 'glory';
  return 'peace';
}
var moodfx=document.createElement('div');moodfx.className='moodfx';moodfx.setAttribute('aria-hidden','true');
moodfx.innerHTML=Object.keys(MOODS).map(function(k){return '<i class="m-'+k+'"></i>'}).join('');
document.body.insertBefore(moodfx,document.body.firstChild);
function setMood(m){if(document.body.dataset.mood!==m)document.body.dataset.mood=m||''}

/* ---------- access gate ---------- */
var GATE=(typeof CFG.gateCode==='string')?CFG.gateCode:'';
var gate=$('#gate'), gIn=$('#gIn'), gErr=$('#gErr'), gCard=$('#gForm');
function unlock(save){
  document.body.classList.add('unlocked');gate.hidden=true;
  if(save){try{sessionStorage.setItem('th-ok','1')}catch(e){}}
  route(fromHash()||'home');
  TH.track('visit',fromHash()||'home');
  TH.fetchLatest(function(doc){
    if(!applyContent(doc))return;
    if(window.scrollY<200&&S.state==='idle')route(view);
  });
}
gCard.addEventListener('submit',function(ev){
  ev.preventDefault();
  if(!GATE||gIn.value===GATE){unlock(true);return}
  gErr.textContent='รหัสไม่ถูกต้อง ลองกรอกใหม่อีกครั้ง';
  gIn.value='';gCard.classList.remove('shake');void gCard.offsetWidth;gCard.classList.add('shake');gIn.focus();
});
gIn.addEventListener('input',function(){gErr.textContent='';gIn.value=gIn.value.replace(/\D/g,'')});
var ok=false;try{ok=sessionStorage.getItem('th-ok')==='1'}catch(e){}
if(ok||!GATE)unlock(false);else{gate.hidden=false;try{gIn.focus()}catch(e){}}
})();
