var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,130)));if(!c)fails++}
var R=JSON.parse(readFile("/tmp/hs_real.json"));
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}}; sbUser={id:"u1"};
state.dayRange=1; state.dayOff=0; TODAY=R.day; LOGS.data=[];
METRICS.data=[{day:R.day,stress_curve:R.stress_curve,stress_avg:R.stress_avg,rest_win:R.rest_win,meals_kcal:R.meals_kcal}];
var LS={}; W=function(k,v){LS[k]=v}; S=function(k,d){return LS[k]===undefined?d:LS[k]};

print("\n== Se marca lo que aún no ha volcado el reloj ==");
W("sync_status",{garmin_t:R.day+"T16:51"});
var h=stressDayCard();
ok("hay zona sombreada",/fill="#8E99A8" opacity="\.10"/.test(h),"");
ok("con la línea de corte",/stroke-dasharray="1.5 2"/.test(h),"");
ok("el tooltip dice la hora del volcado",/16:51/.test(h),"");
ok("y sale en la leyenda",/sin volcar/.test(h),"");
var x=/<rect x="([\d.]+)" y="6" width="([\d.]+)"[^>]*fill="#8E99A8"/.exec(h);
ok("empieza donde toca (16:51 de 24 h)",x&&Math.abs(+x[1]-(3+334*(16+51/60)/24))<0.3,x?x[1]:"no");
ok("y llega hasta el borde",x&&Math.abs((+x[1]+ +x[2])-337)<0.5,x?String(+x[1]+ +x[2]):"no");

print("\n== Un día ya cerrado no se sombrea ==");
W("sync_status",{garmin_t:R.day+"T23:59"});
ok("volcado a las 23:59 -> sin leyenda",!/sin volcar/.test(stressDayCard()),"");
W("sync_status",{garmin_t:"2026-01-01T10:00"});
ok("volcado de otro día -> no se pinta",!/fill="#8E99A8" opacity="\.10"/.test(stressDayCard()),"");
W("sync_status",null);
ok("sin sync_status -> no se pinta",!/fill="#8E99A8" opacity="\.10"/.test(stressDayCard()),"");
W("sync_status",{});
ok("sync_status vacío -> no revienta",stressDayCard().length>200,"");
W("sync_status",{garmin_t:"basura"});
ok("basura en la fecha -> no revienta",stressDayCard().length>200,"");

print("\n== Mirando un día pasado ==");
W("sync_status",{garmin_t:R.day+"T16:51"});
state.dayOff=1;
ok("ayer no lleva sombra",!/fill="#8E99A8" opacity="\.10"/.test(stressDayCard())||stressDayCard()==="","");
state.dayOff=0;
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
