var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,130)));if(!c)fails++}
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}}; sbUser={id:"u1"};
LOGS.data=[]; GACT.data=[];
METRICS.data=[{day:iso(new Date()),steps:9500,distance_km:6.8,sleep_h:7.6,hrv_ms:54,rhr:50,kcal_out:2100}];
var RT=JSON.parse(readFile("/Users/magonzal/FitmetData/sofia/routine.json"));
var RC=JSON.parse(readFile("/Users/magonzal/FitmetData/sofia/race.json"));
var LS={routine:RT,race:RC}; W=function(k,v){LS[k]=v}; S=function(k,d){return LS[k]===undefined?d:LS[k]};

print("\n== Su rutina carga bien ==");
ok("la semana tiene 7 días válidos",getWeekBase().length===7&&getWeekBase().every(function(w){return w.sid}),"");
ok("y NO cae al plan de Marcos",getWeekBase()[1].sid==="calidad",getWeekBase()[1].sid);
ok("está en modo carrera",runOnly()===true,"");
ok("sin manguito ni reglas ni viaje",
   ["manguito","reglas","viaje"].every(function(t){return visibleTabs().indexOf(t)<0}),visibleTabs().join(","));
ok("pero sí con la pestaña de carrera",visibleTabs().indexOf("carrera")>-1,visibleTabs().join(","));
ok("pestañas finales: "+visibleTabs().join(", "),visibleTabs().length===5,"");

print("\n== Las sesiones ==");
["descanso","calidad","suave","larga"].forEach(function(sid){
  var s=getSession(sid);
  ok("existe "+sid,!!s&&!!s.title,"");
});
var q=getSession("calidad");
ok("calidad tiene calentamiento, bloque y enfriamiento",q.items.length===3,String(q.items.length));
ok("y explica las vueltas de 200 m",/200 m/.test(T(q.items[1].how)),"");
var su=getSession("suave");
ok("las rectas avisan de no correr en curva",/curva/.test(T(su.items[1].how)),"");
var lg=getSession("larga");
ok("la tirada manda salir de la pista",/calle, no en la pista|road, not the track/.test(T(lg.items[0].how)),"");
ok("y explica qué hacer en las cuestas",/cuesta|hills/i.test(T(lg.items[0].how)),"");

print("\n== El plan fechado ==");
var ks=Object.keys(RC.plan);
ok("45 sesiones",ks.length===45,String(ks.length));
ok("empieza el martes 4-ago",ks.sort()[0]==="2026-08-04","");
ok("y acaba el día de la carrera",ks[ks.length-1]==="2026-11-15","");
ok("el último es Ponle Freno",/PONLE FRENO/.test(RC.plan["2026-11-15"]),"");
ok("el test de 5 km está el 4-oct",/TEST DE 5 KM/.test(RC.plan["2026-10-04"]||""),RC.plan["2026-10-04"]);
ok("la sesión clave, el 3-nov",/la clave/.test(RC.plan["2026-11-03"]||""),RC.plan["2026-11-03"]);

print("\n== Se pinta todo sin romperse ==");
var threw=null;
try{visibleTabs().forEach(function(t){state.tab=t;render()})}catch(e){threw=e}
ok("todas sus pestañas renderizan",threw===null,threw?String(threw):"");
state.tab="hoy";
var d=dayCard();
ok("en Hoy no hay peso ni comida",!/⚖️|🧈|Kcal in|Por comer/.test(d),"");
ok("pero sí pasos y sueño",/👣/.test(d)&&/😴/.test(d),"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));

print("\n== En Progreso no le sale la tarjeta de peso ==");
/* Dos guiones y un número: no pesa ni mide grasa, y el VO2max ya está en
   Your body today. */
METRICS.data=[{day:"2026-08-03",vo2max:45.8,steps:9000,rhr:50,sleep_h:7.3},
              {day:"2026-08-04",vo2max:45.8,steps:8000,rhr:50,sleep_h:7.0}];
state.pview="balance";
var bv=balanceView();
ok("sin tarjeta de último peso",!/lastWeight|Último peso|Last weight/i.test(bv),bv.slice(0,140));
ok("y sin grasa corporal en esa tarjeta",!/Grasa corporal|Body fat/i.test(bv.slice(0,600)),"");
ok("pero la vista sigue existiendo",bv.length>200,String(bv.length));


print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
