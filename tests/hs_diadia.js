var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,150)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[];GACT.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};

var base={d:B("MAR","TUE"),name:B("Martes","Tuesday"),sid:"run1"};
var hoy=iso(new Date());

print("\n== Sin excepción, manda la plantilla ==");
ok("el día es el de su plantilla",diaDe(hoy,base).sid==="run1","");
ok("no se toca el objeto original",base.sid==="run1","");

print("\n== Con excepción, manda la fecha ==");
W("ses:"+hoy,{sid:"lowB"});
ok("la sesión de ese día cambia",diaDe(hoy,base).sid==="lowB",diaDe(hoy,base).sid);
ok("y solo la de ese día",diaDe("2026-01-01",base).sid==="run1","");
ok("conserva el nombre del día",T(diaDe(hoy,base).d)==="MAR","");

print("\n== La excepción también puede añadir o quitar la segunda sesión ==");
W("ses:"+hoy,{sid:"runEasy",plus:"upA"});
ok("añade el plus",diaDe(hoy,base).plus==="upA","");
W("ses:"+hoy,{sid:"runEasy",plus:null});
ok("y lo quita",!diaDe(hoy,base).plus,String(diaDe(hoy,base).plus));

print("\n== No se fía de cualquier cosa ==");
W("ses:"+hoy,{sid:"noexiste"});
ok("una sesión inventada se ignora",diaDe(hoy,base).sid==="run1","");
W("ses:"+hoy,{});
ok("sin sid, se ignora",diaDe(hoy,base).sid==="run1","");
W("ses:"+hoy,null);
ok("un null guardado se ignora",diaDe(hoy,base).sid==="run1","");

print("\n== La app no revienta con una excepción puesta ==");
W("ses:"+hoy,{sid:"lowB"});
var threw=null;
try{["hoy","rutina","semana"].forEach(function(t){state.tab=t;render()})}catch(e){threw=e}
ok("render sin excepción",threw===null,threw?String(threw):"");


print("\n== La pestaña Semana también respeta la excepción ==");
var lunI=iso(new Date(new Date().getTime()-((new Date().getDay()+6)%7)*86400000));
W("ses:"+lunI,{sid:"lowB"});
state.tab="semana";state.wview="week";
var threw=null,html="";
try{render();html=document.getElementById("view").innerHTML||""}catch(e){threw=e}
ok("render sin excepción",threw===null,threw?String(threw):"");
ok("el lunes muestra la sesión puesta a mano",/Lower B/.test(html),html.slice(0,200));
W("ses:"+lunI,null);
try{render();html=document.getElementById("view").innerHTML||""}catch(e){threw=e}
ok("y al quitarla vuelve la plantilla",!/Lower B/.test(html)||/Descanso/.test(html),"");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
