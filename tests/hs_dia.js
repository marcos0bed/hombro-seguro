var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,140)));if(!c)fails++}
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}}; sbUser={id:"u1"};
LOGS.data=[]; METRICS.data=[];
var hoyReal=iso(new Date());

print("\n== La app lleva abierta desde ayer ==");
TODAY="2026-07-01"; todayIdx=0; state.dayOff=0;
ok("arranca con la fecha vieja",TODAY==="2026-07-01","");
var cambio=refrescaDia();
ok("refrescaDia detecta el cambio",cambio===true,"");
ok("TODAY pasa a ser hoy de verdad",TODAY===hoyReal,TODAY+" vs "+hoyReal);
ok("y el día de la semana también",todayIdx===((new Date().getDay()+6)%7),String(todayIdx));

print("\n== Si el día NO ha cambiado, no toca nada ==");
state.dayOff=2;
ok("devuelve false",refrescaDia()===false,"");
ok("y respeta que estés mirando un día pasado",state.dayOff===2,String(state.dayOff));

print("\n== Al cambiar de día vuelve a hoy ==");
TODAY="2026-07-01"; state.dayOff=3;
refrescaDia();
ok("el offset se resetea",state.dayOff===0,String(state.dayOff));

print("\n== render() lo arregla solo ==");
TODAY="2026-07-01"; todayIdx=5;
var threw=null; try{state.tab="hoy";render()}catch(e){threw=e}
ok("render sin excepción",threw===null,threw?String(threw):"");
ok("y ya tiene la fecha correcta",TODAY===hoyReal,TODAY);

print("\n== Las claves que se escriben usan el día bueno ==");
TODAY="2026-07-01";
render();
ok("setsKey usa hoy",setsKey("upA").indexOf(hoyReal)>-1,setsKey("upA"));

print("\n== Nada se rompe en las demás pestañas ==");
threw=null;
try{["hoy","rutina","semana","progreso"].forEach(function(x){TODAY="2026-07-01";state.tab=x;render()})}catch(e){threw=e}
ok("todas renderizan",threw===null,threw?String(threw):"");
ok("y todas dejan la fecha bien",TODAY===hoyReal,TODAY);
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
