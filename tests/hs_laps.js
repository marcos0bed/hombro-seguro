var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,160)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};

/* Las rectas reales de Sofi del 3-ago: 6 tramos rápidos de ~100 m alternados
   con trote de recuperación. */
var rectas=[{i:1,km:0.104,min:0.47,ritmo:"4:31",fc:136},{i:2,km:0.154,min:1.86,ritmo:"12:05",fc:141},
            {i:3,km:0.105,min:0.36,ritmo:"3:29",fc:140},{i:4,km:0.208,min:2.38,ritmo:"11:27",fc:150},
            {i:5,km:0.099,min:0.35,ritmo:"3:32",fc:147},{i:6,km:0.207,min:2.30,ritmo:"11:08",fc:153}];
GACT.data=[{activity_id:1,start_time:"2026-08-03T09:04:00",type:"running",distance_km:1.82,duration_min:16.4,raw:{laps:rectas}}];

print("\n== Tramos del reloj ==");
var c=lapsCard();
ok("se pinta",/Tramos del reloj|Watch laps/.test(c),"");
ok("una fila por tramo",(c.match(/class="lapr/g)||[]).length===6,String((c.match(/class="lapr/g)||[]).length));
ok("los metros no se muestran como km",/104 m/.test(c)&&!/0.10 km/.test(c),"");
ok("marca las rectas rápidas",(c.match(/lapr hard/g)||[]).length===3,String((c.match(/lapr hard/g)||[]).length));
ok("y las pinta en color",(c.match(/<i class="on"/g)||[]).length===3,"");
ok("las recuperaciones no",(c.match(/<i class=""/g)||[]).length===3,"");
/* Barra invertida: la recta de 3:29 tiene que salir más larga que el trote de
   12:05, si no la gráfica miente. */
var anchos=(c.match(/width:(\d+)%/g)||[]).map(function(x){return +x.match(/\d+/)[0]});
ok("la más rápida es la barra más larga",Math.max.apply(null,anchos)===anchos[2],anchos.join(","));
ok("y la más lenta la más corta",Math.min.apply(null,anchos)===anchos[1],anchos.join(","));
ok("resume el mejor tramo",/Mejor|Best/.test(c)&&/3:2\d/.test(c),"");
ok("trae los ritmos",/4:31/.test(c)&&/3:29/.test(c),"");
ok("y el pulso",/>136</.test(c),"");

print("\n== Casos vacíos ==");
GACT.data=[{activity_id:2,start_time:"2026-08-03T09:00:00",type:"running",distance_km:5,duration_min:40}];
ok("sin tramos no hay tarjeta",lapsCard()==="","");
GACT.data=[{activity_id:3,start_time:"2026-08-03T09:00:00",type:"running",distance_km:5,duration_min:40,raw:{laps:[{i:1,km:5,min:40,ritmo:"8:00",fc:150}]}}];
ok("un solo tramo tampoco: es la sesión entera",lapsCard()==="","");
GACT.data=[];
ok("sin actividades tampoco",lapsCard()==="","");

print("\n== Coge la carrera más reciente ==");
GACT.data=[{activity_id:4,start_time:"2026-07-01T09:00:00",type:"running",distance_km:5,duration_min:40,raw:{laps:[{i:1,km:1,min:8,ritmo:"8:00",fc:150},{i:2,km:1,min:6,ritmo:"6:00",fc:170}]}},
           {activity_id:5,start_time:"2026-08-03T09:00:00",type:"running",distance_km:3.07,duration_min:25.1,raw:{laps:[{i:1,km:1,min:8.14,ritmo:"8:08",fc:141},{i:2,km:1,min:8.18,ritmo:"8:11",fc:153}]}}];
var r=lapsCard();
ok("la del 3 de agosto, no la de julio",/03\/08/.test(r),"");
ok("un rodaje parejo no tiene tramos fuertes",!/lapr hard/.test(r),r.slice(0,220));


print("\n== La leyenda dice lo mismo que las filas ==");
GACT.data=[{activity_id:9,start_time:"2026-08-03T09:04:00",type:"running",distance_km:1.82,duration_min:16.4,raw:{laps:rectas}}];
var lg=lapsCard();
var mej=(lg.match(/Mejor<\/span>|Mejor <b>([\d:]+)/)||[])[1]||(lg.match(/Mejor[^<]*<b>([\d:]+)/)||[])[1];
ok("el mejor tramo es uno de los que se ven",lg.indexOf(">"+mej+"<")>=0,String(mej));
ok("y es el 3:29, no un 3:26 recalculado",mej==="3:29",String(mej));

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
