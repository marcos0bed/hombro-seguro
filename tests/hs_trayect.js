var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,160)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};

function dias(n){var d=new Date();d.setDate(d.getDate()-n);return iso(d)+"T09:00:00"}
/* base: 7:56 (476 s) el 4-ago hacia 7:05 (425 s) el 15-nov */
W("race",{name:"x",date:"2026-11-15",km:10,goal_min:55,hr_max:195,plan:{},
  base:{day:"2026-08-04",ef_s:421,kg:87.0,meta_ef_s:398,meta_kg:83,slope:-3}});

print("\n== Sin datos suficientes no se inventa ==");
GACT.data=[];METRICS.data=[];
ok("sin carreras, sin fila de eficiencia",!/Eficiencia|Efficiency/.test(trayectoriaCard()),"");
GACT.data=[{activity_id:1,start_time:dias(2),type:"running",distance_km:5,duration_min:40,hr_avg:150}];
ok("con una sola carrera tampoco",!/Eficiencia|Efficiency/.test(trayectoriaCard()),"");

print("\n== Con tres carreras ya mide ==");
GACT.data=[{activity_id:1,start_time:dias(2),type:"running",distance_km:5,duration_min:40,hr_avg:150},
           {activity_id:2,start_time:dias(5),type:"running",distance_km:5,duration_min:40,hr_avg:150},
           {activity_id:3,start_time:dias(8),type:"running",distance_km:5,duration_min:40,hr_avg:150}];
var c=trayectoriaCard();
ok("aparece la tarjeta",/Voy a tiempo|On track/.test(c),c.slice(0,120));
ok("con la eficiencia",/Eficiencia|Efficiency/.test(c),"");
ok("8:00 al pulso 150 se lee tal cual",/8:00/.test(c),c.slice(c.indexOf("wkv"),c.indexOf("wkv")+80));
ok("dice en qué semana vas",/semana|week/.test(c),"");
ok("y avisa de que la recta es referencia",/referencia|reference/.test(c),"");

print("\n== El pulso normaliza ==");
/* mismo ritmo pero a 140 ppm = mejor eficiencia que a 150 */
GACT.data=GACT.data.map(function(a){var b={};for(var k in a)b[k]=a[k];b.hr_avg=140;return b});
var mejor=trayectoriaCard();
/* pendiente por defecto -3: 8:00 a 140 ppm -> 480+(150-140)*(-3) = 450 s */
ok("a menos pulso, mejor cifra",/7:30/.test(mejor),mejor.slice(mejor.indexOf("wkv"),mejor.indexOf("wkv")+70));

print("\n== El peso entra si lo hay ==");
METRICS.data=[{day:iso(new Date()),weight_kg:86.2}];
ok("sale la fila de peso",/Peso|Weight/.test(trayectoriaCard()),"");
ok("con su cifra",/86.2 kg/.test(trayectoriaCard()),"");

print("\n== Sin plan, sin tarjeta ==");
W("race",{name:"x",date:"2026-11-15",km:10,plan:{}});
ok("sin base congelada no se dibuja",trayectoriaCard()==="","");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
