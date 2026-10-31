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
ok("con isqCheck sí sale",/Glúteo medio izquierdo|Left gluteus medius/.test(isqBlock(hoy)),isqBlock(hoy).slice(0,80));

print("\n== El tendón es el glúteo medio, no el isquion (31-oct-2026) ==");
var c=isqBlock(hoy);
ok("el título ya no habla del isquion",!/Isquion|ischium/i.test(c),c.slice(0,120));
ok("fuera la fila de la silla dura",!/silla dura|hard chair/.test(c),"");
ok("fuera el puente con el talón lejos",!/talón LEJOS|heel FAR/.test(c),"");

print("\n== Las cuatro filas nuevas ==");
ok("la de la cuesta se queda",/Cuesta andando|Walking a slope/.test(c),"");
ok("la del apoyo monopodal",/monopodal|Single-leg stand/.test(c),"");
ok("la de tumbado del lado izquierdo (compresión)",/lado izquierdo|left side/.test(c),"");
ok("la de la noche",/Anoche|Last night/.test(c),"");
ok("doce botones: cuatro filas de tres",(c.match(/data-act="isq"/g)||[]).length===12,String((c.match(/data-act="isq"/g)||[]).length));
ok("la noche con SU escala, no la de dolor",/incomodó|bothered/.test(c)&&/me despertó|woke me/.test(c),"");
ok("ninguno marcado al empezar",c.indexOf("sel")<0,"");
ok("y pide rellenarlo",/Treinta segundos|Thirty seconds/.test(c),"");

print("\n== El veredicto por grados ==");
ok("sin datos, grado -1",isqGrado(null)===-1&&isqGrado({})===-1,String(isqGrado({})));
ok("las claves viejas s/p ya no se leen",isqGrado({s:1,p:2})===-1,String(isqGrado({s:1,p:2})));
ok("todo a nada → limpio",isqGrado({a:0,m:0,n:0,c:0})===0,"");
ok("solo en el monopodal → línea base",isqGrado({a:0,m:1})===1,"");
ok("solo en la cuesta → línea base",isqGrado({c:1})===1,String(isqGrado({c:1})));
ok("REPOSO manda sobre carga: una noche incómoda sube de 1 a 2",isqGrado({n:1})===2,String(isqGrado({n:1})));
ok("y con cuesta y monopodal a la vez sigue siendo 2, no se suma",isqGrado({n:1,c:1,m:1})===2,String(isqGrado({n:1,c:1,m:1})));
ok("la COMPRESIÓN es cambio de fase (3)",isqGrado({a:1,m:0})===3,String(isqGrado({a:1,m:0})));
ok("que te DESPIERTE también (3), no es orden de parar",isqGrado({n:2})===3,String(isqGrado({n:2})));
ok("y el 3 no sube a 4 porque además haya carga",isqGrado({a:1,m:1,c:1})===3,String(isqGrado({a:1,m:1,c:1})));
ok("dolor en compresión/monopodal/cuesta → parar (4)",isqGrado({a:0,m:2})===4&&isqGrado({c:2})===4&&isqGrado({a:2})===4,"");

print("\n== Los mensajes dicen lo que toca ==");
W("isq:"+hoy,{a:0,m:0,n:0,c:0});
ok("limpio habla de cerrarlo",/dar por cerrado|called closed/.test(isqBlock(hoy)),"");
W("isq:"+hoy,{a:0,m:1});
ok("línea base dice que el plan sigue",/plan sigue igual|plan stands/.test(isqBlock(hoy)),"");
W("isq:"+hoy,{a:0,m:0,n:1,c:1});
ok("reposo avisa de no añadir provocación",/No añadas provocación|Don't add provocation/.test(isqBlock(hoy)),"");
ok("y deja la calidad EN DUDA",/EN DUDA|IN DOUBT/.test(isqBlock(hoy)),"");
W("isq:"+hoy,{a:1,m:1});
ok("la compresión avisa de que ha cambiado de fase",/LADO IZQUIERDO|LEFT SIDE/.test(isqBlock(hoy)),"");
ok("y ya no manda esperar al 17-nov (esa cita no existe)",!/17-nov|17-Nov/.test(isqBlock(hoy)),"");
W("isq:"+hoy,{a:0,m:2});
ok("dolor manda parar lo rápido",/trabajo rápido|fast work/.test(isqBlock(hoy)),"");
ok("y ahí sí nombra el enantyum con omeprazol",/enantyum/i.test(isqBlock(hoy))&&/omeprazol|omeprazole/i.test(isqBlock(hoy)),"");

print("\n== Es por día y no se hereda ==");
ok("guardado en su fecha",S("isq:"+hoy,{}).m===2,"");
ok("otro día está vacío",isqGrado(S("isq:2026-01-01",null))===-1,"");

print("\n== La tira de 10 días ==");
W("isq:"+hoy,{a:0,m:1});
var t=isqBlock(hoy);
ok("diez celdas",(t.match(/flex:1;text-align:center/g)||[]).length===10,String((t.match(/flex:1;text-align:center/g)||[]).length));
ok("los días sin dato van en punto",(t.match(/>·</g)||[]).length===9,String((t.match(/>·</g)||[]).length));
ok("y el de hoy en bola",t.indexOf("●")>0,"");

print("\n== No estorba a lo que ya había ==");
var h=habCard();
ok("los hábitos siguen",/data-act="habit"/.test(h),"");
ok("el 1-5 de levantarse sigue",/data-act="wake"/.test(h),"");
ok("y el glúteo va al final",h.indexOf('data-act="wake"')<h.indexOf('data-act="isq"'),"");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
