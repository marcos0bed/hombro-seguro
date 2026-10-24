/* hs_parte.js — el parte del día y el historial de partes anteriores.
   Hasta v211 había una sola clave "daybrief" y cada parte diario pisaba al
   anterior: no se podía consultar ni el día de antes. */
var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,150)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[];GACT.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};

function dia(n){var d=new Date();d.setDate(d.getDate()-n);return iso(d)}
function parte(f,t){return {week:f,body:{es:t+" (es)",en:t+" (en)"}}}
function reset(){LS={}}

print("\n== Respaldo: la clave plana de antes de v212 ==");
reset();
W("daybrief",parte(dia(0),"parte plano"));
ok("sin índice se pinta igual",/parte plano/.test(daybriefCard()),daybriefCard().slice(0,120));
ok("y no inventa historial",daybriefHistCard()==="","");

print("\n== Con historial: la tarjeta del día es la del día ==");
reset();
W("daybriefIdx",[dia(0),dia(1),dia(2)]);
W("daybrief:"+dia(0),parte(dia(0),"hoy"));
W("daybrief:"+dia(1),parte(dia(1),"ayer"));
W("daybrief:"+dia(2),parte(dia(2),"anteayer"));
var c=daybriefCard();
ok("pinta el más nuevo",/hoy \(es\)/.test(c),c.slice(0,140));
ok("y solo ese",!/ayer \(es\)/.test(c),"");
ok("con su fecha",c.indexOf(dia(0))>0,"");
/* El índice puede venir en cualquier orden: lo ordena la app. */
reset();
W("daybriefIdx",[dia(2),dia(0),dia(1)]);
W("daybrief:"+dia(0),parte(dia(0),"hoy"));
W("daybrief:"+dia(1),parte(dia(1),"ayer"));
W("daybrief:"+dia(2),parte(dia(2),"anteayer"));
ok("el orden del índice no manda",/hoy \(es\)/.test(daybriefCard()),"");

print("\n== La tarjeta de partes anteriores ==");
var h=daybriefHistCard();
ok("existe",h!=="",h);
ok("cerrada por defecto",/aria-expanded="false"/.test(h),h.slice(0,200));
ok("dice cuántos días",/2 días/.test(h),h.slice(0,200));
W("fold:daybriefHist",true);
h=daybriefHistCard();
ok("abierta trae los días anteriores",/ayer \(es\)/.test(h)&&/anteayer \(es\)/.test(h),h.slice(0,200));
ok("y NO repite el del día",!/hoy \(es\)/.test(h),"");
ok("cada día con su fecha de cabecera",h.indexOf(dia(1))>0&&h.indexOf(dia(2))>0,"");
ok("del más nuevo al más viejo",h.indexOf("ayer (es)")<h.indexOf("anteayer (es)"),"");

print("\n== Un día solo no tiene anteriores ==");
reset();
W("daybriefIdx",[dia(0)]);
W("daybrief:"+dia(0),parte(dia(0),"hoy"));
ok("no sale la tarjeta",daybriefHistCard()==="",daybriefHistCard());

print("\n== Un índice con un día sin cuerpo no rompe nada ==");
reset();
W("daybriefIdx",[dia(0),dia(1),dia(2)]);
W("daybrief:"+dia(0),parte(dia(0),"hoy"));
W("daybrief:"+dia(2),parte(dia(2),"anteayer"));
W("fold:daybriefHist",true);
ok("el día del medio se salta",daybriefHistCard().indexOf("anteayer (es)")>0,"");
ok("y la cuenta no lo cuenta",/1 días/.test(daybriefHistCard()),daybriefHistCard().slice(0,200));
ok("el del día sigue bien",/hoy \(es\)/.test(daybriefCard()),"");

print("\n== Tope de 7 días anteriores ==");
reset();
var idx=[],i;
for(i=0;i<12;i++){idx.push(dia(i));W("daybrief:"+dia(i),parte(dia(i),"d"+i))}
W("daybriefIdx",idx);W("fold:daybriefHist",true);
h=daybriefHistCard();
ok("solo 7",/7 días/.test(h),h.slice(0,200));
ok("entra el 7.º",h.indexOf("d7 (es)")>0,"");
ok("y no el 8.º",h.indexOf("d8 (es)")<0,"");

print("\n== Un parte rancio no se cuela como el de hoy ==");
reset();
W("daybriefIdx",[dia(9),dia(10)]);
W("daybrief:"+dia(9),parte(dia(9),"viejo"));
W("daybrief:"+dia(10),parte(dia(10),"másviejo"));
ok("ni la tarjeta del día",daybriefCard()==="",daybriefCard().slice(0,120));
ok("ni la del historial",daybriefHistCard()==="",daybriefHistCard().slice(0,120));
/* El de ayer sí vale: el parte se publica por la mañana y se consulta todo el día. */
reset();
W("daybriefIdx",[dia(1)]);
W("daybrief:"+dia(1),parte(dia(1),"ayer"));
ok("el de ayer sí se pinta",/ayer \(es\)/.test(daybriefCard()),"");

print(fails?"\n==> "+fails+" FALLOS":"\n==> TODO OK");
