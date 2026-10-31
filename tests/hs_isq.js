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
ok("la quinta fila: ¿dormiste sobre el izquierdo?",/dormido sobre el lado izquierdo|sleep on your left side/.test(c),"");
ok("y la casilla del isométrico",/Isom\u00e9trico de abducci\u00f3n|Isometric abduction/.test(c),"");
ok("la fila de línea de base va primero",/AHORA MISMO|RIGHT NOW/.test(c)&&c.indexOf('data-r="b"')<c.indexOf('data-r="c"'),"");
ok("diecinueve botones: cinco de tres, dos de dos",(c.match(/data-act="isq"/g)||[]).length===19,String((c.match(/data-act="isq"/g)||[]).length));
ok("la fila del lado es binaria (no/sí)",/data-r="l" data-v="1"/.test(c)&&!/data-r="l" data-v="2"/.test(c),"");
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

print("\n== Dormir sobre el lado malo no es reposo, es compresión ==");
ok("la fila del lado sola no da grado",isqGrado({l:1})===-1,String(isqGrado({l:1})));
ok("noche incomodó SIN dormir encima → síntoma en reposo (2)",isqGrado({n:1,l:0})===2,String(isqGrado({n:1,l:0})));
ok("la misma noche HABIENDO dormido encima baja a línea base (1)",isqGrado({n:1,l:1})===1,String(isqGrado({n:1,l:1})));
ok("que te DESPIERTE sin dormir encima sigue siendo cambio de fase (3)",isqGrado({n:2,l:0})===3,String(isqGrado({n:2,l:0})));
ok("y habiendo dormido encima baja un escalón, no se anula (2)",isqGrado({n:2,l:1})===2,String(isqGrado({n:2,l:1})));
ok("sin la fila rellena se asume que no durmió encima",isqGrado({n:1})===2,String(isqGrado({n:1})));
ok("la compresión de día (a) no la rebaja dormir del lado",isqGrado({a:1,l:1})===3,String(isqGrado({a:1,l:1})));
ok("y el dolor manda igual",isqGrado({m:2,l:1})===4,String(isqGrado({m:2,l:1})));

print("\n== El bug de guardado de v214-v216 (isqMerge) ==");
ok("tocar la noche NO borra la cuesta",JSON.stringify(isqMerge({c:1},"n",1))===JSON.stringify({c:1,n:1}),JSON.stringify(isqMerge({c:1},"n",1)));
ok("ni la cuesta borra el monopodal",isqMerge({m:2,n:1},"c",1).m===2,JSON.stringify(isqMerge({m:2,n:1},"c",1)));
ok("las cinco filas conviven",Object.keys(isqMerge({c:1,m:0,a:0,n:1},"l",1)).length===5,JSON.stringify(isqMerge({c:1,m:0,a:0,n:1},"l",1)));
ok("un cero se conserva, no se pierde por falsy",isqMerge({c:0},"n",1).c===0,JSON.stringify(isqMerge({c:0},"n",1)));
ok("volver a tocar el mismo valor lo borra",isqMerge({c:1,n:1},"n",1).n===undefined,JSON.stringify(isqMerge({c:1,n:1},"n",1)));
ok("y tocar otro valor lo cambia",isqMerge({n:1},"n",2).n===2,JSON.stringify(isqMerge({n:1},"n",2)));
ok("sobre un día vacío funciona igual",JSON.stringify(isqMerge(null,"c",2))===JSON.stringify({c:2}),JSON.stringify(isqMerge(null,"c",2)));

print("\n== La línea de base: las de carga cuentan POR ENCIMA ==");
ok("molestia solo en reposo → síntoma en reposo (2)",isqGrado({b:1})===2,String(isqGrado({b:1})));
ok("la cuesta igualando la base no añade nada: sigue 2",isqGrado({b:1,c:1})===2,String(isqGrado({b:1,c:1})));
ok("pero por encima de la base ya es dolor (4)",isqGrado({b:1,c:2})===4,String(isqGrado({b:1,c:2})));
ok("compresión IGUAL que la base no es cambio de fase",isqGrado({b:1,a:1})===2,String(isqGrado({b:1,a:1})));
ok("compresión POR ENCIMA de la base sí lo es (3)",isqGrado({b:0,a:1})===3,String(isqGrado({b:0,a:1})));
ok("sin base, la cuesta sola sigue dando línea base (1)",isqGrado({b:0,c:1})===1,String(isqGrado({b:0,c:1})));
ok("dolor en reposo manda del todo (4)",isqGrado({b:2})===4,String(isqGrado({b:2})));
ok("el caso real del 31-oct (fondo todo el día, paseo sin cambio) = 2",isqGrado({b:1,c:1,m:1,a:0,n:0})===2,String(isqGrado({b:1,c:1,m:1,a:0,n:0})));
ok("marcar solo la base ya da el día por relleno",isqGrado({b:0})===0,String(isqGrado({b:0})));

print("\n== Pisos en casa: total menos el desnivel de las actividades ==");
METRICS.data=[{day:hoy,steps:9000,floors:28}];
GACT.data=[{start_time:hoy+"T19:00:00",elevation_m:45}];
ok("28 pisos menos 45 m de paseo (15) = 13 en casa",pisosCasa(hoy)===13,String(pisosCasa(hoy)));
GACT.data=[];
ok("sin actividades, todos son de casa",pisosCasa(hoy)===28,String(pisosCasa(hoy)));
GACT.data=[{start_time:hoy+"T19:00:00",elevation_m:300}];
ok("nunca negativo",pisosCasa(hoy)===0,String(pisosCasa(hoy)));
METRICS.data=[{day:hoy,steps:9000,floors:null}];
ok("sin dato de pisos no inventa nada",pisosCasa(hoy)===null&&pisosLinea(hoy)==="",String(pisosCasa(hoy)));
METRICS.data=[{day:hoy,steps:9000,floors:28}];GACT.data=[];
ok("y la línea sale en la tarjeta",/Escaleras en casa|Stairs at home/.test(isqBlock(hoy)),pisosLinea(hoy));

print("\n== El isométrico es adherencia, no síntoma ==");
ok("marcarlo solo a él no da el día por relleno",isqGrado({iso:1})===-1,String(isqGrado({iso:1})));
ok("ni cambia el grado",isqGrado({c:1,iso:1})===1&&isqGrado({c:1,iso:0})===1,"");
ok("se conserva al tocar otra fila",isqMerge({iso:1},"c",1).iso===1,JSON.stringify(isqMerge({iso:1},"c",1)));
LS={};LS["routine"]={week:[],sessions:{},isqCheck:true};
ok("sin hacerlo, cero de siete",/0 de los \u00faltimos 7|0 of the last 7/.test(isqBlock(hoy)),isoRacha(hoy));
W("isq:"+hoy,{iso:1});
ok("hecho hoy, uno de siete",/1 de los \u00faltimos 7|1 of the last 7/.test(isqBlock(hoy)),isoRacha(hoy));
(function(){var d=new Date(hoy+"T12:00");for(var i=0;i<7;i++){var x=new Date(d);x.setDate(x.getDate()-i);W("isq:"+iso(x),{iso:1})}})();
ok("siete seguidos tienen mensaje propio",/Siete de siete|Seven out of seven/.test(isqBlock(hoy)),isoRacha(hoy));
LS={};LS["routine"]={week:[],sessions:{},isqCheck:true};

print("\n== Los mensajes dicen lo que toca ==");
W("isq:"+hoy,{a:0,m:0,n:0,c:0});
ok("limpio habla de cerrarlo",/dar por cerrado|called closed/.test(isqBlock(hoy)),"");
W("isq:"+hoy,{a:0,m:1});
ok("línea base dice que el plan sigue",/plan sigue igual|plan stands/.test(isqBlock(hoy)),"");
W("isq:"+hoy,{a:0,m:0,n:1,c:1,l:0});
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
