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
ok("y sin rótulo en la cabecera hasta que eliges",c.indexOf("snum")<0,"");

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


print("\n== El resumen de la última sesión ==");
W("lastnotif",{id:"1",day:hoy,title:{es:"🏃 Sesión registrada",en:"🏃 Session logged"},
  body:{es:"5,37 km · 43 min · 8:02/km · 149 ppm · Por encima de tu media del mes, y sin forzar.",
        en:"5.37 km · 43 min · 8:02/km · 149 bpm · Above your monthly average."}});
var av=avisoCard();
ok("se pinta",/Sesión registrada|Session logged/.test(av),av.slice(0,90));
ok("con los números",/5,37 km/.test(av)&&/8:02\/km/.test(av),"");
ok("y la frase aparte, en color",/Por encima de tu media/.test(av)&&/var\(--acc\)/.test(av),"");
ok("con su fecha",av.indexOf(hoy.slice(8,10)+"/"+hoy.slice(5,7))>0,"");

print("\n== No se queda pegado días ==");
W("lastnotif",{id:"2",day:"2026-01-01",title:{es:"x",en:"x"},body:{es:"viejo",en:"old"}});
ok("un resumen viejo no se enseña",avisoCard()==="","");
var ayer=new Date();ayer.setDate(ayer.getDate()-1);
W("lastnotif",{id:"9",day:iso(ayer),title:{es:"x",en:"x"},body:{es:"la tirada de ayer",en:"y"}});
ok("el de AYER tampoco: eso ya lo cuenta el parte",avisoCard()==="","");
W("lastnotif",null);
ok("sin resumen, sin tarjeta",avisoCard()==="","");
W("lastnotif",{id:"3",day:hoy});
ok("sin cuerpo tampoco",avisoCard()==="","");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
