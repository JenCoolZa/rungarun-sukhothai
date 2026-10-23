/* Illustration kit: every scene is composed from these SVG parts.
   Exposes window.TH_ART = { artSVG, ARTS, HERO_SCENES, PR } */
(function(){
'use strict';
/* ---------- illustration kit: every scene is composed from these parts ---------- */
function G(o,inner){
  var sx=o.f?-o.s:o.s;
  return '<g transform="translate('+o.x+' '+o.y+') scale('+sx+' '+o.s+')">'+inner+'</g>';
}
function prangBody(){
  return '<path class="dk" d="M-72 0V-26H-58V-54H-46V-82H-34V-112Q-22-150 0-206Q22-150 34-112V-82H46V-54H58V-26H72V0Z"/>'+
    '<path class="gd" d="M-58-26H58M-46-54H46M-34-82H34M-26-112H26"/>'+
    '<path class="gd" d="M-14-150Q0-176 14-150"/>'+
    '<rect class="dk" x="-1.5" y="-228" width="3" height="24"/><circle class="gf" cx="0" cy="-230" r="3.5"/>';
}
var PR={
  sun:function(o){return G(o,'<circle class="s-glow" r="64"/><circle class="s-sun" r="38"/>')},
  moon:function(o){return G(o,'<circle r="50" fill="var(--sun-glow)"/><circle r="26" fill="var(--art-moon)"/><circle cx="-8" cy="-6" r="5" fill="var(--art-dk)" opacity=".12"/><circle cx="9" cy="8" r="7" fill="var(--art-dk)" opacity=".1"/>')},
  glow:function(o){return G(o,'<circle class="s-glow" r="90"/>')},
  cloud:function(o){
    var c=o.k==='smoke'?'smoke':'cloud';
    return G(o,'<g class="'+c+'"><ellipse cx="0" cy="0" rx="46" ry="12"/><ellipse cx="30" cy="-9" rx="30" ry="12"/><ellipse cx="-24" cy="-7" rx="26" ry="10"/></g>');
  },
  stars:function(){
    var s='';
    for(var i=0;i<30;i++){
      var x=(i*137+23)%590+5,y=(i*71+11)%170+8,r=0.8+(i%3)*0.5;
      s+='<circle class="twk" style="animation-delay:-'+(i%6)+'s" cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#FFF6DA"/>';
    }
    return s;
  },
  hills:function(){
    return '<path fill="var(--art-hill2)" d="M0 262V196Q50 160 110 186T240 172T380 192T500 168T600 190V262Z"/>'+
      '<path fill="var(--art-hill1)" d="M0 262V222Q90 196 180 222T360 214T520 224T600 212V262Z"/>';
  },
  ground:function(){
    return '<path fill="var(--ground)" d="M0 262Q150 246 300 258T600 252T1000 256V340H0Z"/>'+
      '<path fill="var(--art-ground2)" opacity=".5" d="M0 300Q150 286 300 298T600 292V340H0Z"/>';
  },
  ledge:function(){
    return '<rect y="296" width="600" height="44" fill="var(--art-ledge)"/><rect y="296" width="600" height="5" fill="var(--art-ledge2)"/>';
  },
  water:function(o){
    var y=o.y||262,r='<rect x="0" y="'+y+'" width="1000" height="'+(340-y)+'" fill="var(--art-water)"/>';
    for(var row=0;row<3;row++){
      var yy=y+16+row*22;
      if(yy>332)break;
      var d='M-40 '+yy+' q15 -7 30 0';
      for(var i=0;i<42;i++)d+=' t30 0';
      r+='<path class="wave" style="animation-duration:'+(5+row*2)+'s" d="'+d+'" fill="none" stroke="var(--art-wave)" stroke-width="2" stroke-dasharray="44 26"/>';
    }
    return r;
  },
  text:function(o){
    return '<text class="gl" x="'+o.x+'" y="'+o.y+'" font-size="'+(o.s*44)+'" text-anchor="middle" fill="'+(o.c||'var(--art-ink)')+'" opacity="'+(o.a||.8)+'">'+o.t+'</text>';
  },

  /* buildings */
  chedi:function(o){
    return G(o,'<g class="dk"><rect x="-96" y="-24" width="192" height="24" rx="2"/><rect x="-78" y="-44" width="156" height="20" rx="2"/><rect x="-60" y="-61" width="120" height="17" rx="2"/><rect x="-38" y="-89" width="76" height="28"/>'+
      '<path d="M0-188C19-165 37-134 37-100V-87H-37V-100C-37-134-19-165 0-188Z"/><rect x="-1.5" y="-218" width="3" height="34"/></g>'+
      '<circle class="gf" cx="0" cy="-220" r="4"/><path class="gd" d="M-30-100Q0-120 30-100M-24-122Q0-138 24-122M-60-61H60M-78-44H78"/>');
  },
  bellstupa:function(o){
    return G(o,'<g class="dk"><rect x="-72" y="-18" width="144" height="18"/><rect x="-58" y="-34" width="116" height="16"/>'+
      '<path d="M-40-34C-50-80-24-118 0-128C24-118 50-80 40-34Z"/><rect x="-13" y="-144" width="26" height="16"/><path d="M0-250L-8-144H8Z"/></g>'+
      '<path class="gd" d="M-72-18H72M-58-34H58M-30-86Q0-70 30-86M-4-170H4M-5-190H5M-5-210H5M-3-230H3"/><circle class="gf" cx="0" cy="-252" r="3.5"/>');
  },
  prang:function(o){
    var r=prangBody();
    if(o.k==='arun'){
      r+='<g transform="translate(-106 0) scale(.42)">'+prangBody()+'</g><g transform="translate(106 0) scale(.42)">'+prangBody()+'</g>';
    }
    return G(o,r);
  },
  hall:function(o){
    return G(o,'<g class="dk"><rect x="-98" y="-14" width="196" height="14"/><rect x="-80" y="-58" width="160" height="44"/><path d="M-104-58L-72-96H72L104-58Z"/><path d="M-88-96L-58-130H58L88-96Z"/>'+
      '<path d="M-58-130Q-70-138-64-150L-52-130ZM58-130Q70-138 64-150L52-130Z"/></g>'+
      '<path class="gd" d="M-104-58L-72-96H72L104-58M-88-96L-58-130H58L88-96"/>'+
      '<path d="M-60-14V-58M-30-14V-58M0-14V-58M30-14V-58M60-14V-58" stroke="var(--gild)" stroke-width="3" opacity=".7"/>');
  },
  prasat:function(o){
    var t='';
    for(var i=0;i<3;i++){
      var y0=-14-i*40,w=92-i*16,w2=64-i*12;
      t+='<path class="dk" d="M'+(-w)+' '+y0+'L'+(-w2)+' '+(y0-34)+'H'+w2+'L'+w+' '+y0+'Z"/><path class="gd" d="M'+(-w)+' '+y0+'L'+(-w2)+' '+(y0-34)+'H'+w2+'L'+w+' '+y0+'"/>';
    }
    return G(o,'<rect class="dk" x="-90" y="-14" width="180" height="14"/><rect class="dk" x="-60" y="-34" width="120" height="20"/>'+t+
      '<path class="dk" d="M0-196L-7-136H7Z"/><circle class="gf" cx="0" cy="-198" r="3.5"/>');
  },
  dome:function(o){
    var w='';
    for(var i=0;i<9;i++)w+='<rect x="'+(-112+i*28)+'" y="-46" width="8" height="18" rx="4" fill="var(--sun)" opacity=".65"/>';
    return G(o,'<g class="dk"><rect x="-130" y="-56" width="260" height="56"/><rect x="-40" y="-100" width="80" height="44"/>'+
      '<path d="M-44-100C-44-148-20-164 0-170C20-164 44-148 44-100Z"/><path d="M-110-56C-110-80-92-92-80-96C-68-92-50-80-50-56Z"/>'+
      '<path d="M110-56C110-80 92-92 80-96C68-92 50-80 50-56Z"/><rect x="-2" y="-196" width="4" height="30"/></g>'+
      '<path class="gd" d="M-124-52H124M-130-6H130"/>'+w);
  },
  fort:function(o){
    var m='';
    for(var i=0;i<16;i++)m+='<rect x="'+(-124+i*16)+'" y="-72" width="10" height="12"/>';
    return G(o,'<g class="dk"><rect x="-130" y="-60" width="260" height="60"/>'+m+'<rect x="-28" y="-104" width="56" height="104"/><rect x="-36" y="-116" width="72" height="14"/></g>'+
      '<path d="M-14 0V-30Q0-46 14-30V0Z" fill="var(--art-ledge)"/><path class="gd" d="M-28-70H28"/>');
  },
  columns:function(o){
    var r='<rect class="st" x="-110" y="-8" width="220" height="8"/>';
    var hs=[84,56,92,70,98,62,80];
    for(var i=0;i<7;i++)r+='<rect class="st" x="'+(-100+i*32)+'" y="'+(-8-hs[i])+'" width="14" height="'+hs[i]+'"/><rect class="st" x="'+(-103+i*32)+'" y="'+(-12-hs[i])+'" width="20" height="5"/>';
    return G(o,r);
  },
  stele:function(o){
    var l='';
    for(var i=0;i<8;i++)l+='<path d="M-14 '+(-34-i*13)+'H14" stroke="var(--art-dk)" stroke-opacity=".45" stroke-width="2.5" stroke-dasharray="5 3"/>';
    return G(o,'<rect class="st" x="-34" y="-12" width="68" height="12"/><path class="st" d="M-24-12V-130L0-158L24-130V-12Z"/>'+l+'<path d="M0-158V-12" stroke="var(--art-dk)" stroke-opacity=".25"/>');
  },
  bell:function(o){
    return G(o,'<rect class="dk" x="-50" y="-170" width="100" height="10" rx="3"/><rect class="dk" x="-48" y="-170" width="8" height="170"/><rect class="dk" x="40" y="-170" width="8" height="170"/>'+
      '<g class="swing"><line x1="0" y1="-160" x2="0" y2="-138" stroke="var(--art-dk)" stroke-width="3"/><path fill="var(--gild)" d="M-26-74C-26-112-14-138 0-138C14-138 26-112 26-74Z"/><rect x="-30" y="-76" width="60" height="7" rx="3" fill="var(--gild)"/><circle class="dk" cx="0" cy="-64" r="6"/></g>');
  },

  /* nature */
  tree:function(o){
    return G(o,'<path class="dk" d="M-8 0Q-6-40-14-70H14Q6-40 8 0Z"/><ellipse cx="0" cy="-96" rx="54" ry="34" fill="var(--art-leaf)"/><ellipse cx="-30" cy="-78" rx="34" ry="24" fill="var(--art-leaf)"/><ellipse cx="32" cy="-80" rx="34" ry="24" fill="var(--art-leaf)"/>');
  },
  palm:function(o){
    var r='<path d="M0 0Q10-60-4-110" stroke="var(--art-dk)" stroke-width="7" fill="none"/>';
    [200,235,270,305,340].forEach(function(a){
      var rad=a*Math.PI/180,ex=-4+Math.cos(rad)*62,ey=-110+Math.sin(rad)*34+16,cx=-4+Math.cos(rad)*36,cy=-110+Math.sin(rad)*52-10;
      r+='<path d="M-4-110Q'+cx.toFixed(1)+' '+cy.toFixed(1)+' '+ex.toFixed(1)+' '+ey.toFixed(1)+'" stroke="var(--art-leaf)" stroke-width="5" fill="none" stroke-linecap="round"/>';
    });
    return G(o,r);
  },
  lotus:function(o){
    var p='';
    [-50,-25,0,25,50].forEach(function(a){p+='<path transform="rotate('+a+')" d="M0 0C-10-10-10-24 0-32C10-24 10-10 0 0Z" fill="var(--art-lotus)"/>'});
    return G(o,'<ellipse cx="0" cy="2" rx="32" ry="7" fill="var(--art-leaf)"/>'+p+'<circle cy="-6" r="3" fill="var(--gild)"/>');
  },
  meru:function(o){
    return G(o,'<path fill="var(--art-hill2)" d="M-170 0L-70-120H70L170 0Z"/><path fill="var(--art-hill1)" d="M-120 0L-44-176H44L120 0Z"/><path class="dk" opacity=".85" d="M-60 0L-18-236H18L60 0Z"/><path class="gd" d="M-40-80H40M-30-140H30M-22-190H22"/><circle class="gf" cx="0" cy="-246" r="6"/>');
  },

  /* creatures and people */
  elephant:function(o){
    var r='<g class="dk"><ellipse cx="0" cy="-62" rx="58" ry="38"/><rect x="-44" y="-40" width="17" height="40" rx="5"/><rect x="-20" y="-38" width="17" height="38" rx="5"/><rect x="16" y="-38" width="17" height="38" rx="5"/><rect x="40" y="-40" width="17" height="40" rx="5"/>'+
      '<circle cx="64" cy="-84" r="27"/><path d="M80-74C104-68 116-50 111-26C109-17 99-16 99-25C101-42 95-52 79-58Z"/></g>'+
      '<path d="M-56-72Q-76-60-70-34" fill="none" stroke="var(--art-dk)" stroke-width="5" stroke-linecap="round"/>'+
      '<path d="M86-66Q116-64 124-82Q112-70 88-58Z" fill="#F4EAD0"/>'+
      '<ellipse cx="46" cy="-80" rx="15" ry="22" fill="var(--art-dk)" stroke="rgba(255,255,255,.2)" stroke-width="2"/>'+
      '<path class="gf" d="M-36-98H36L30-84H-30Z"/>';
    if(o.rider)r+=PR.figure({x:0,y:-96,s:.85,k:o.k||'soldier'});
    return G(o,r);
  },
  figure:function(o){
    var k=o.k||'plain',r;
    r=(k==='monk'?'<path fill="var(--art-robe)" d="M-18 0L-13-52Q0-62 13-52L18 0Z"/>':'<path class="dk" d="M-16 0L-12-50Q0-58 12-50L16 0Z"/>')+'<circle class="dk" cx="0" cy="-64" r="10"/>';
    if(k==='king')r+='<path class="gf" d="M-9-70L-7-90L-2-79L0-94L2-79L7-90L9-70Z"/><path class="gd" d="M-14-48L14-48"/>';
    if(k==='soldier')r+='<path class="dk" d="M-11-68Q0-84 11-68Z"/><line x1="22" y1="0" x2="22" y2="-102" stroke="var(--art-dk)" stroke-width="3"/><path class="gf" d="M22-106L18-92H26Z"/>';
    return G(o,r);
  },
  sword:function(o){
    return G(o,'<path fill="var(--art-white)" stroke="var(--art-dk)" stroke-width="1" d="M-3 0L-2-70L0-78L2-70L3 0Z"/><rect class="gf" x="-9" y="0" width="18" height="4"/><rect class="dk" x="-2" y="4" width="4" height="12"/>');
  },
  buddha:function(o){
    var c=o.k==='emerald'?'var(--celadon)':'var(--gild)';
    return G(o,'<circle r="70" cy="-62" fill="var(--sun-glow)"/><g fill="'+c+'"><ellipse cx="0" cy="-10" rx="54" ry="14"/><path d="M-30-14L-22-74Q0-84 22-74L30-14Z"/><circle cx="0" cy="-92" r="16"/><path d="M0-106C-4-112-2-120 0-126C2-120 4-112 0-106Z"/></g>'+
      '<path d="M-36-14Q0-4 36-14" stroke="var(--art-dk)" stroke-width="2" fill="none" opacity=".35"/>');
  },
  umbrella:function(o){
    var t='';
    for(var i=0;i<5;i++){var y=-44-i*18,w=48-i*7;t+='<path d="M'+(-w)+' '+y+'Q0 '+(y-16)+' '+w+' '+y+'Q0 '+(y-5)+' '+(-w)+' '+y+'Z" fill="var(--art-white)" stroke="var(--gild)" stroke-width="1.5"/>';}
    return G(o,'<rect class="gf" x="-2" y="-140" width="4" height="140"/>'+t+'<circle class="gf" cx="0" cy="-146" r="4"/>');
  },
  banner:function(o){
    return G(o,'<rect class="dk" x="-2" y="-130" width="4" height="130"/><path class="wv" fill="var(--laterite)" d="M2-128H48L38-114L48-100H2Z"/>');
  },
  flag:function(o){
    return G(o,'<rect class="dk" x="-2" y="-156" width="4" height="156"/><g class="wv"><rect x="2" y="-150" width="92" height="10" fill="#A51931"/><rect x="2" y="-140" width="92" height="10" fill="#F4F5F8"/><rect x="2" y="-130" width="92" height="20" fill="#2D2A4A"/><rect x="2" y="-110" width="92" height="10" fill="#F4F5F8"/><rect x="2" y="-100" width="92" height="10" fill="#A51931"/></g>');
  },
  flames:function(o){
    var r='';
    [[-30,0,1],[-10,6,1.3],[14,0,1.1],[34,5,.8],[0,-4,1.6]].forEach(function(f,i){
      r+='<g transform="translate('+f[0]+' '+f[1]+') scale('+f[2]+')"><path class="flame" style="animation-delay:-'+(i*.15)+'s" fill="var(--art-fire)" d="M0 0C-16-18-8-36 0-62C8-36 16-18 0 0Z"/><path class="flame" style="animation-delay:-'+(i*.2)+'s" fill="var(--art-fire2)" d="M0 0C-8-10-4-20 0-34C4-20 8-10 0 0Z"/></g>';
    });
    return G(o,r);
  },

  /* water craft */
  ship:function(o){
    var r='<path class="dk" d="M-86-16H86Q74 14 34 14H-34Q-74 14-86-16Z"/><path class="gd" d="M-80-8H80"/>';
    if(o.k==='steam'){
      r+='<rect fill="var(--art-white)" x="-60" y="-34" width="120" height="20"/><rect class="dk" x="-36" y="-72" width="22" height="40"/><rect class="dk" x="8" y="-62" width="18" height="30"/><rect fill="var(--art-red)" x="-36" y="-72" width="22" height="6"/>'+
        '<path class="dk" d="M-60-34L-40-34M40-34L60-34"/><rect class="dk" x="48" y="-70" width="3" height="40"/>'+
        '<g class="smoke"><ellipse cx="-24" cy="-84" rx="20" ry="9"/><ellipse cx="-6" cy="-102" rx="24" ry="10"/><ellipse cx="20" cy="-120" rx="28" ry="11"/></g>';
    }else{
      r+='<rect class="dk" x="-3" y="-120" width="6" height="106"/><rect class="dk" x="-52" y="-62" width="4" height="46"/><rect class="dk" x="46" y="-56" width="4" height="40"/>'+
        '<path fill="var(--art-white)" d="M-34-112Q0-102 34-112V-74Q0-64-34-74Z"/><path fill="var(--art-white)" d="M-40-68Q0-58 40-68V-28Q0-18-40-28Z"/><path fill="var(--art-white)" d="M-70-56Q-52-50-34-56V-36Q-52-30-70-36Z"/>'+
        '<path class="wv" fill="var(--art-red)" d="M3-120H30L22-112L30-104H3Z"/>';
    }
    return G(o,r);
  },
  junk:function(o){
    return G(o,'<path class="dk" d="M-70-14H74Q60 12 26 12H-30Q-62 12-70-14Z"/><rect class="dk" x="-2" y="-100" width="4" height="88"/>'+
      '<path fill="var(--art-brick)" d="M2-98H58L52-24H2Z"/><path fill="var(--art-brick)" d="M-2-86H-44L-40-30H-2Z"/>'+
      '<path d="M2-76H55M2-54H54M2-34H52M-2-66H-42M-2-46H-41" stroke="var(--art-dk)" stroke-opacity=".5" stroke-width="2"/>');
  },
  barge:function(o){
    var r='<path class="dk" d="M-124-12H112Q134-12 144-44Q150-54 146-64Q138-56 134-50Q120-20 100-4H-100Q-116-6-124-12Z"/><path class="gf" d="M-122-12H110L100-4H-110Z"/>'+
      '<rect class="dk" x="-46" y="-36" width="86" height="26"/><path class="gf" d="M-56-36L-40-62H34L50-36Z"/><path class="gd" d="M-46-36V-12M40-36V-12"/>';
    for(var i=0;i<10;i++){var x=-104+i*20;r+='<circle class="dk" cx="'+x+'" cy="-20" r="5"/><line x1="'+x+'" y1="-14" x2="'+(x-14)+'" y2="16" stroke="var(--art-dk)" stroke-width="2.5"/>';}
    return G(o,r);
  },

  /* objects */
  bowl:function(o){
    return G(o,'<ellipse cx="0" cy="-34" rx="38" ry="9" fill="var(--celadon)"/><path fill="var(--celadon)" d="M-38-34C-34-6-18 0 0 0C18 0 34-6 38-34Z"/><ellipse cx="0" cy="-34" rx="30" ry="6" fill="var(--art-dk)" opacity=".25"/><path d="M-26-20Q0-12 26-20" stroke="var(--art-white)" stroke-width="2" fill="none" opacity=".6"/>');
  },
  jar:function(o){
    return G(o,'<path fill="var(--celadon)" d="M-14-70Q-14-78-8-78H8Q14-78 14-70L18-60C34-50 34-14 22 0H-22C-34-14-34-50-18-60Z"/><path d="M-26-40H26" stroke="var(--gild)" stroke-width="3" opacity=".8"/>');
  },
  palmleaf:function(o){
    var r='';
    for(var i=0;i<4;i++)r+='<rect x="-80" y="'+(-12-i*11)+'" width="160" height="10" rx="3" fill="var(--art-parch)" stroke="var(--art-dk)" stroke-opacity=".3"/><path d="M-62 '+(-7-i*11)+'H62" stroke="var(--art-dk)" stroke-opacity=".35" stroke-width="2" stroke-dasharray="6 3"/>';
    r+='<path class="gd" d="M-56-48V0M56-48V0"/>';
    return G(o,r);
  },
  book:function(o){
    return G(o,'<rect x="-40" y="-14" width="80" height="14" fill="var(--laterite)"/><rect x="-36" y="-28" width="76" height="14" fill="var(--celadon)"/><rect x="-42" y="-42" width="78" height="14" fill="var(--slate)"/>'+
      '<path class="gd" d="M-34-7H34M-30-21H34M-36-35H30"/>');
  },
  seal:function(o){
    return G(o,'<circle r="30" fill="var(--art-red)"/><circle r="24" fill="none" stroke="var(--art-white)" stroke-width="2" opacity=".8"/><path fill="var(--art-white)" d="M0-14L4-4L14-4L6 3L9 13L0 7L-9 13L-6 3L-14-4L-4-4Z"/>');
  },
  constitution:function(o){
    return G(o,'<ellipse cx="0" cy="-10" rx="48" ry="9" fill="var(--gild)"/><rect class="gf" x="-6" y="-10" width="12" height="10"/><rect class="gf" x="-18" y="-3" width="36" height="4"/>'+
      '<rect x="-30" y="-56" width="60" height="44" rx="3" fill="var(--art-red)" stroke="var(--gild)" stroke-width="3"/><path class="gf" d="M-8-34L0-46L8-34L0-24Z"/>');
  },
  chain:function(o){
    return G(o,'<g fill="none" stroke="var(--art-dk)" stroke-width="5"><ellipse cx="-44" cy="0" rx="14" ry="8"/><ellipse cx="-20" cy="0" rx="14" ry="8"/><ellipse cx="22" cy="-6" rx="14" ry="8" transform="rotate(-24 22 -6)"/><ellipse cx="46" cy="-14" rx="14" ry="8" transform="rotate(-28 46 -14)"/></g><path class="gd" d="M0-18L-4-2L4-8L0 8"/>');
  },
  plane:function(o){
    return G(o,'<g class="plane"><path class="dk" d="M-60 0Q-60-8-40-10H40Q70-10 78-2Q70 6 40 6H-40Q-60 6-60 0Z"/><path class="dk" d="M-6-8L-26-36H-12L16-8ZM-6 4L-26 32H-12L16 4Z"/><path class="dk" d="M-56-6L-66-24H-56L-44-8Z"/><circle cx="70" cy="-2" r="3" fill="var(--sun)"/><path class="gd" opacity=".45" d="M-70 0H-190" stroke-dasharray="10 8"/></g>');
  }
};

function artSVG(spec,label,bare,cls){
  var h='<svg class="'+(cls||'art')+'" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" role="img" aria-label="'+(label||'')+'" focusable="false">';
  if(!bare)h+='<rect width="600" height="340" fill="url(#g-'+(spec.sky||'day')+')"/>';
  spec.items.forEach(function(it){
    var n=it[0],o={x:it[1]||0,y:it[2]||0,s:it[3]||1},ex=it[4]||{};
    for(var k in ex)o[k]=ex[k];
    if(PR[n])h+=PR[n](o);
  });
  return h+'</svg>';
}

/* ---------- scenes for the Sukhothai events ---------- */
var ARTS={
  khmer:{sky:'dusk',items:[['sun',470,176,.9],['hills'],['ground'],['prang',290,266,1.25],['palm',100,266,1],['palm',520,266,.9],['figure',420,274,1.1,{k:'soldier'}],['figure',160,274,1.1,{k:'soldier'}]]},
  found:{sky:'dawn',items:[['sun',300,196,1.5],['cloud',110,70],['cloud',500,90,.8],['hills'],['ground'],['chedi',300,264,.95],['figure',150,276,1.35,{k:'king'}],['figure',450,276,1.35,{k:'soldier'}]]},
  elephant:{sky:'day',items:[['cloud',120,60],['cloud',470,90,.8],['hills'],['ground'],['elephant',180,276,1.05,{rider:true}],['elephant',430,276,1.05,{rider:true,f:true}],['banner',60,272,1],['banner',545,272,1]]},
  banmueang:{sky:'day',items:[['cloud',140,70],['cloud',470,60,.8],['hills'],['ground'],['hall',300,264,1.25],['figure',140,276,1.1,{k:'king'}],['palm',520,266,1],['palm',70,266,.9]]},
  expand:{sky:'day',items:[['sun',480,120,.9],['cloud',120,66],['hills'],['ground'],['elephant',270,276,1.25,{rider:true,k:'king'}],['banner',90,272,1.05],['banner',440,272,1.05],['banner',510,272,.9]]},
  script:{sky:'dawn',items:[['sun',300,170,1.3],['hills'],['ground'],['stele',300,270,1.5],['text',120,110,1,{t:'ก',a:.55}],['text',200,70,.8,{t:'ข',a:.5}],['text',420,92,1,{t:'ค',a:.55}],['text',500,150,.8,{t:'ง',a:.5}],['text',80,190,.7,{t:'จ',a:.45}]]},
  rule:{sky:'day',items:[['cloud',130,66],['cloud',480,80,.8],['hills'],['ground'],['hall',190,264,1],['bell',420,268,1.15],['figure',510,276,1.1,{k:'plain'}],['figure',345,276,1.1,{k:'plain'}]]},
  water:{sky:'day',items:[['cloud',110,64],['hills'],['ground'],['water',0,270],['chedi',250,268,.75],['lotus',120,284,1],['lotus',420,290,1.1],['ledge'],['bowl',420,302,1.5],['jar',510,302,1.3],['bowl',90,302,1.2]]},
  buddhism:{sky:'dawn',items:[['sun',470,150,1],['hills'],['ground'],['chedi',140,264,.8],['figure',320,276,1.4,{k:'monk'}],['figure',385,276,1.4,{k:'monk'}],['tree',520,268,1.05]]},
  after:{sky:'dusk',items:[['sun',300,226,1.2],['hills'],['ground'],['chedi',200,264,.9],['banner',380,272,1],['figure',440,276,1.3,{k:'soldier'}]]},
  traiphum:{sky:'night',items:[['stars'],['moon',500,70,.9],['cloud',130,150],['cloud',470,170,.9],['meru',300,262,1.1],['ground'],['ledge'],['palmleaf',300,302,1.4]]},
  lithai:{sky:'dawn',items:[['sun',300,190,1.2],['hills'],['ground'],['chedi',170,264,.95],['umbrella',330,172,1],['figure',330,276,1.45,{k:'king'}],['figure',430,276,1.3,{k:'monk'}]]},
  ayutthaya:{sky:'dusk',items:[['sun',150,210,1],['hills'],['ground'],['bellstupa',380,264,1.1],['bellstupa',470,264,.8],['water',0,296],['junk',200,318,.8]]},
  vassal:{sky:'dusk',items:[['sun',100,216,1.1],['hills'],['ground'],['hall',170,264,.95],['banner',300,272,1],['elephant',440,276,1.05,{rider:true,f:true}]]},
  merge:{sky:'night',items:[['stars'],['moon',120,80,1],['hills'],['ground'],['chedi',300,264,1.2],['chedi',470,264,.7]]},
  heritage:{sky:'day',items:[['sun',470,120,.9],['cloud',110,70],['hills'],['ground'],['chedi',140,264,.75],['buddha',300,268,1.3],['chedi',470,264,.75]]},
  memory:{sky:'night',items:[['stars'],['moon',500,70,.9],['hills'],['ground'],['glow',300,200,1.3],['ledge'],['stele',300,302,1.45],['text',130,150,1,{t:'ก',c:'#FFF6DA',a:.45}],['text',470,140,.9,{t:'ข',c:'#FFF6DA',a:.45}]]}
};

var HERO_SCENES={
  home:[['sun',300,200,1.5],['cloud',90,70],['cloud',500,100,.8],['ground'],['chedi',110,276,.55],['bellstupa',225,276,.72],['prang',350,276,.7,{k:'arun'}],['prasat',480,276,.66]],
  ayutthaya:[['sun',300,190,1.4],['cloud',100,70],['cloud',490,96,.8],['ground'],['water',0,302],['bellstupa',200,278,1.0],['bellstupa',300,278,1.25],['bellstupa',400,278,1.0],['prang',510,278,.6]],
  thonburi:[['sun',300,200,1.4],['cloud',100,76],['cloud',500,100,.8],['ground'],['water',0,298],['prang',300,280,1.5,{k:'arun'}],['barge',130,322,.65],['junk',500,316,.65]],
  rattanakosin:[['sun',300,200,1.4],['cloud',100,70],['cloud',500,100,.8],['ground'],['water',0,304],['prasat',300,280,1.35],['hall',140,280,.8],['hall',460,280,.8]]
};
window.TH_ART={artSVG:artSVG,ARTS:ARTS,HERO_SCENES:HERO_SCENES,PR:PR};
})();
