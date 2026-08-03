var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,120)));if(!c)fails++}
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}};sbUser={id:"u1"};
LOGS.data=[];GACT.data=[];METRICS.data=[{day:iso(new Date()),steps:9000,sleep_h:7.5,hrv_ms:60,rhr:47}];
var RT=JSON.parse(readFile("/tmp/lorena_routine.json")), RC=JSON.parse(readFile("/tmp/lorena_race.json"));
var LS={routine:RT,race:RC};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};

print("\n== Su semana ==");
var W7=getWeek(),dias=["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"];
W7.forEach(function(w,i){print("  "+dias[i]+"  "+w.sid+"  ("+(getSession(w.sid)||{}).type+")")});
ok("siete días válidos",W7.length===7&&W7.every(function(w){return getSession(w.sid)}),"");
ok("tres de carrera",W7.filter(function(w){return (getSession(w.sid)||{}).type==="run"}).length===3,"");
ok("tres de fuerza",W7.filter(function(w){return (getSession(w.sid)||{}).type==="gym"}).length===3,"");
ok("descanso el lunes",W7[0].sid==="restday","");
ok("la tirada larga el domingo, como Marcos",W7[6].sid==="runL","");
ok("y NO cae en modo solo-running (ella sí ve comida y peso)",runOnly()===false,"");

print("\n== Sus sesiones de carrera ==");
["runQ","runE","runL"].forEach(function(sid){
  var s=getSession(sid);
  ok(sid+" existe con contenido",!!s&&s.items.length>0,"");
  ok(sid+": todo explicado",s.items.every(function(i){return i.how&&T(i.how).length>60}),"");
});
ok("sus ritmos, no los de Marcos",/7:30-8:00/.test(T(getSession("runE").items[0].how)),"");
ok("y su rango de pulso",/130-145/.test(T(getSession("runE").items[0].how)),"");

print("\n== Conserva su fuerza ==");
["chestday","legs1","backbi"].forEach(function(sid){
  ok("sigue "+sid,!!getSession(sid)&&(getSession(sid).items||[]).length>0,"");
});

print("\n== Su carrera ==");
ok("objetivo 58 min",RC.goal_min===58,String(RC.goal_min));
ok("45 sesiones fechadas",Object.keys(RC.plan).length===45,String(Object.keys(RC.plan).length));
ok("el test el 4-oct",/TEST DE 5 KM/.test(RC.plan["2026-10-04"]||""),"");
ok("y la carrera el 15-nov",/PONLE FRENO/.test(RC.plan["2026-11-15"]||""),"");
ok("la pestaña de carrera le aparece",visibleTabs().indexOf("carrera")>-1,visibleTabs().join(","));

print("\n== Nada se rompe ==");
var threw=null;
try{visibleTabs().forEach(function(t){state.tab=t;render()})}catch(e){threw=e}
ok("todas sus pestañas renderizan",threw===null,threw?String(threw):"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
