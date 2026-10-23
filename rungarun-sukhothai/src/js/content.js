/* Talks to the Cloudflare Pages Functions API. Exposes window.TH_CONTENT = { fetchLatest, track } */
(function(){
'use strict';
var API=(window.TH_CONFIG&&window.TH_CONFIG.api)||'/api';
var sid='';
try{
  sid=localStorage.getItem('th-sid')||'';
  if(!sid){sid=(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)+Date.now());localStorage.setItem('th-sid',sid)}
}catch(e){sid=sid||'anon'}

function fetchLatest(cb){
  if(!window.fetch)return;
  fetch(API+'/content',{headers:{accept:'application/json'}})
    .then(function(r){return r.ok?r.json():null})
    .then(function(d){if(d)cb(d)})
    .catch(function(){});
}

var lastKey='';
function track(type,period,eventId){
  try{
    var key=type+'|'+(period||'')+'|'+(eventId||'');
    if(key===lastKey)return;lastKey=key;
    var body=JSON.stringify({type:type,period:period||'',event:eventId||'',sid:sid,
      ref:document.referrer?new URL(document.referrer).hostname:'',w:window.innerWidth});
    if(navigator.sendBeacon){navigator.sendBeacon(API+'/track',new Blob([body],{type:'application/json'}))}
    else if(window.fetch){fetch(API+'/track',{method:'POST',headers:{'content-type':'application/json'},body:body,keepalive:true}).catch(function(){})}
  }catch(e){}
}
window.TH_CONTENT={fetchLatest:fetchLatest,track:track};
})();
