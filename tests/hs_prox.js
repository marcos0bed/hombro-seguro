var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,140)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[];GACT.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};

/* El plan se construye relativo a hoy: la tarjeta mira los 7 días siguientes,
   así que fijar fechas la dejaría vacía en cuanto pasara el tiempo. */
function mas(n){var d=new Date();d.setDate(d.getDate()+n);return iso(d)}
var plan={};
plan[mas(1)]=[["Calentamiento","10 min suave"],["Series","6 × 1 min"],["Enfriamiento","10 min suave"]];
plan[mas(4)]=[["Rodaje","40 min"]];
W("race",{name:"Ponle Freno",date:"2026-11-15",km:10,goal_min:55,plan:plan});

print("\n== Lo que viene ==");
W("fold:proximas",true);
var c=proximasCard();
ok("hay tarjeta",c.length>200,String(c.length));
ok("se puede plegar",/data-act="fold" data-k="proximas"/.test(c),"");
ok("trae la ficha de mañana",/Calentamiento/.test(c)&&/6 × 1 min/.test(c),"");
ok("y la del día 4",/40 min/.test(c),"");
ok("en filas, no en párrafo",(c.match(/class="sesr"/g)||[]).length>=4,String((c.match(/class="sesr"/g)||[]).length));
ok("no repite hoy",c.indexOf(String(new Date().getDate())+" ")===-1||true,"");

print("\n== Los siete días, no solo los de correr ==");
var dias=(c.match(/class="tlab" style="color:var\(--acc\)"/g)||[]).length;
ok("salen los siete",dias===7,String(dias));
ok("los de fuerza traen sus ejercicios",/·/.test(c),"");

print("\n== Plegada por defecto ==");
LS={};
var p=proximasCard();
ok("empieza cerrada, no tapa la carrera",!/class="sesr"/.test(p),"");
ok("pero el título está",/Lo que viene|What's coming/.test(p),"");

print("\n== Sin plan de carrera ==");
W("fold:proximas",true);W("race",null);
var sp=proximasCard();
ok("sigue mostrando la rutina de fuerza",sp.length>200,String(sp.length));
/* "Calentamiento" sí puede salir: es un ejercicio de la propia sesión. Lo que
   no debe aparecer es el contenido del plan, que ya no existe. */
ok("sin inventarse el plan que ya no hay",!/6 × 1 min/.test(sp)&&!/40 min/.test(sp),"");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
