var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,150)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[{day:iso(new Date()),steps:9000}];GACT.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};
var hoy=iso(new Date());

print("\n== Solo lo ve quien lo pide ==");
LS["routine"]={week:[],sessions:{}};
ok("sin isqCheck no sale nada",isqBlock(hoy)==="","");
ok("y la tarjeta de hábitos no lo lleva",habCard().indexOf('data-act="isq"')<0,"");
LS["routine"]={week:[],sessions:{},isqCheck:true};
ok("con isqCheck sí sale",/Isquion izquierdo|Left ischium/.test(isqBlock(hoy)),isqBlock(hoy).slice(0,80));

print("\n== Las dos pruebas, tres bandas cada una ==");
var c=isqBlock(hoy);
ok("la de la silla",/silla dura|hard chair/.test(c),"");
ok("la del puente",/Puente a una pierna|Single-leg bridge/.test(c),"");
ok("seis botones en total",(c.match(/data-act="isq"/g)||[]).length===6,String((c.match(/data-act="isq"/g)||[]).length));
ok("ninguno marcado al empezar",c.indexOf("sel")<0,"");
ok("y pide rellenarlo",/Treinta segundos|Thirty seconds/.test(c),"");

print("\n== El veredicto por grados ==");
ok("sin datos, grado -1",isqGrado(null)===-1&&isqGrado({})===-1,String(isqGrado({})));
ok("nada y nada → limpio",isqGrado({s:0,p:0})===0,"");
ok("solo en el puente → línea base",isqGrado({s:0,p:1})===1,"");
ok("sentado manda sobre el puente",isqGrado({s:1,p:0})===2,"");
ok("dolor en cualquiera → parar",isqGrado({s:0,p:2})===3&&isqGrado({s:2,p:0})===3,"");

print("\n== Los mensajes dicen lo que toca ==");
W("isq:"+hoy,{s:0,p:0});
ok("limpio habla de cerrarlo",/dar por cerrado|called closed/.test(isqBlock(hoy)),"");
W("isq:"+hoy,{s:0,p:1});
ok("línea base dice que el plan sigue",/plan sigue igual|plan stands/.test(isqBlock(hoy)),"");
W("isq:"+hoy,{s:1,p:1});
ok("sentado avisa de que es nuevo",/SENTADO|SITTING/.test(isqBlock(hoy)),"");
ok("y de no esperar al 17-nov",/17-nov|17-Nov/.test(isqBlock(hoy)),"");
W("isq:"+hoy,{s:0,p:2});
ok("dolor manda parar lo rápido",/trabajo rápido|fast work/.test(isqBlock(hoy)),"");

print("\n== Es por día y no se hereda ==");
ok("guardado en su fecha",S("isq:"+hoy,{}).p===2,"");
ok("otro día está vacío",isqGrado(S("isq:2026-01-01",null))===-1,"");

print("\n== La tira de 10 días ==");
W("isq:"+hoy,{s:0,p:1});
var t=isqBlock(hoy);
ok("diez celdas",(t.match(/flex:1;text-align:center/g)||[]).length===10,String((t.match(/flex:1;text-align:center/g)||[]).length));
ok("los días sin dato van en punto",(t.match(/>·</g)||[]).length===9,String((t.match(/>·</g)||[]).length));
ok("y el de hoy en bola",t.indexOf("●")>0,"");

print("\n== No estorba a lo que ya había ==");
var h=habCard();
ok("los hábitos siguen",/data-act="habit"/.test(h),"");
ok("el 1-5 de levantarse sigue",/data-act="wake"/.test(h),"");
ok("y el isquion va al final",h.indexOf('data-act="wake"')<h.indexOf('data-act="isq"'),"");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
