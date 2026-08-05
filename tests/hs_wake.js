var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,150)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[{day:iso(new Date()),steps:9000}];GACT.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};
var hoy=iso(new Date());

print("\n== El 1-5 de cómo te levantas ==");
var c=habCard();
ok("sale en el log del día",/Cómo te has levantado|How did you wake up/.test(c),c.slice(0,120));
ok("con cinco botones",(c.match(/class="wkb/g)||[]).length===5,String((c.match(/class="wkb/g)||[]).length));
ok("ninguno marcado al principio",!/wkb on/.test(c),"");
/* Las cinco etiquetas SÍ están en los aria-label de los botones, que es lo
   correcto para un lector de pantalla. Lo que no debe salir es el rótulo de la
   cabecera, que resume lo elegido. */
ok("y sin rótulo en la cabecera hasta que eliges",!/class=\snum\/.test(c),"");

print("\n== Al elegir ==");
W("wake:"+hoy,4);
var c4=habCard();
ok("se marca el que toca",(c4.match(/wkb on/g)||[]).length===1,"");
ok("y dice qué significa",/bien|good/.test(c4),"");
W("wake:"+hoy,1);
ok("el 1 es 'fatal'",/fatal|awful/.test(habCard()),"");
W("wake:"+hoy,5);
ok("el 5 es 'perfecto'",/perfecto|great/.test(habCard()),"");

print("\n== Es por día, no global ==");
ok("guardado en su fecha",S("wake:"+hoy,0)===5,String(S("wake:"+hoy,0)));
ok("otro día no lo hereda",S("wake:2026-01-01",0)===0,"");

print("\n== No estorba a los hábitos ==");
ok("los hábitos siguen ahí",/data-act="habit"/.test(habCard()),"");
ok("y el bloque va debajo",habCard().indexOf('data-act="habit"')<habCard().indexOf('data-act="wake"'),"");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
