var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,170)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};METRICS.data=[];LOGS.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};

/* El rodaje real de Marcos del 4-ago: le pedían 7:45-8:15 y rodó a 7:23. */
var D="2026-08-04";
var laps=[{i:1,km:1,min:7.13,ritmo:"7:08",fc:133},{i:2,km:1,min:7.13,ritmo:"7:08",fc:144},
          {i:3,km:1,min:7.03,ritmo:"7:02",fc:148},{i:4,km:0.515,min:3.71,ritmo:"7:12",fc:150}];
GACT.data=[{activity_id:1,start_time:D+"T08:46:00",type:"running",distance_km:4.8,duration_min:35.5,
            hr_avg:145,hr_max:168,raw:{laps:laps}}];
var plan={};plan[D]=[["Rodaje","25 min · 7:45-8:15 · pulso 135-148"],["Rectas","4 × 20 s"]];
W("race",{name:"x",date:"2026-11-15",km:10,goal_min:55,plan:plan});

/* 35,5 min / 4,8 km = 7:24; el plan pedía como mucho 7:45, o sea 21 s/km. */
print("\n== Carrera: lo pedido contra lo hecho ==");
var c=hechoCard(D,{type:"run"});
ok("hay tarjeta",/registró el reloj|watch recorded/.test(c),c.slice(0,100));
ok("la distancia real",/4.80 km/.test(c),"");
ok("el tiempo real, redondeado a minutos",/36 min/.test(c),"");
ok("el ritmo real",/7:24\/km/.test(c),"");
ok("el pulso medio y el máximo",/145 \/ 168 ppm/.test(c),"");
ok("dice que fue más rápido de lo pedido",/Más rápido de lo pedido/.test(c),"");
ok("y cuánto: 21 s\/km",/21 s\/km/.test(c),c.slice(c.indexOf("Más rápido"),c.indexOf("Más rápido")+90));
ok("nombra el rango del plan",/7:45-8:15/.test(c),"");
ok("y trae los tramos debajo",/Tramos del reloj|Watch laps/.test(c),"");

print("\n== Dentro y por debajo del rango ==");
GACT.data=[{activity_id:2,start_time:D+"T08:00:00",type:"running",distance_km:5,duration_min:40}];
ok("8:00 cae dentro de 7:45-8:15",/Dentro del rango/.test(hechoCard(D,{type:"run"})),"");
GACT.data=[{activity_id:3,start_time:D+"T08:00:00",type:"running",distance_km:5,duration_min:45}];
ok("9:00 es más lento",/Más lento de lo pedido/.test(hechoCard(D,{type:"run"})),"");

print("\n== Fuerza: el reloj no sabe qué ejercicios fueron ==");
GACT.data=[{activity_id:4,start_time:D+"T18:00:00",type:"strength_training",duration_min:48,hr_avg:96,calories:220}];
var g=hechoCard(D,{type:"gym"});
ok("tiempo, pulso y calorías",/48 min/.test(g)&&/96 ppm/.test(g)&&/220 kcal/.test(g),"");
ok("sin series registradas, lo dice",/las series no están registradas/.test(g),"");
ok("no inventa distancia ni ritmo",!/km/.test(g),"");
LOGS.data=[{day:D,total_sets:12}];
var g2=hechoCard(D,{type:"gym"});
ok("con series registradas, las cuenta",/>12</.test(g2),"");
ok("y ya no avisa",!/no están registradas/.test(g2),"");

print("\n== Nada que reconciliar ==");
GACT.data=[];
ok("sin actividad, sin tarjeta",hechoCard(D,{type:"run"})==="","");
GACT.data=[{activity_id:5,start_time:"2026-07-01T08:00:00",type:"running",distance_km:5,duration_min:40}];
ok("una carrera de otro día no cuenta",hechoCard(D,{type:"run"})==="","");
GACT.data=[{activity_id:6,start_time:D+"T08:00:00",type:"walking",distance_km:3,duration_min:40}];
ok("un paseo no es la sesión de correr",hechoCard(D,{type:"run"})==="","");
ok("un día de descanso no reconcilia nada",hechoCard(D,{type:"rest"})==="","");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
