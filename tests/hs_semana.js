var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,130)));if(!c)fails++}
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}}; sbUser={id:"u1"};
LOGS.data=[]; METRICS.data=[]; GACT.data=[];

print("\n== La semana nueva ==");
var W=getWeek(), dias=["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"];
W.forEach(function(w,i){ print("  "+dias[i]+"  "+w.sid+"  ("+(getSession(w.sid)||{}).type+")") });
ok("tres días de carrera",W.filter(function(w){return (getSession(w.sid)||{}).type==="run"}).length===3,"");
ok("y tres de fuerza contando el día doble",
   W.filter(function(w){return (getSession(w.sid)||{}).type==="gym"}).length+
   W.filter(function(w){return w.plus&&(getSession(w.plus)||{}).type==="gym"}).length===3,"");
ok("martes, jueves y domingo",W[1].sid==="run1"&&W[3].sid==="runEasy"&&W[6].sid==="runLong","");
ok("la larga es el domingo",/larga|long/i.test(T(getSession("runLong").title)),"");
ok("el sábado es el día de carga",W[5].sid==="carga","");
ok("el lunes es descanso",W[0].sid==="descanso",W[0].sid);
ok("hay upper y lower entre semana",W[3].plus==="upA"&&W[2].sid==="lowB","");
ok("las piernas descansan 3 días entre el miércoles y el sábado",true,"");
ok("el torso va junto al rodaje del jueves",W[3].plus==="upA"&&W[3].sid==="runEasy","");
ok("y el viernes queda libre",W[4].sid==="descanso",W[4].sid);
ok("y las piernas descansan 3 días entre miércoles y sábado",W[2].sid==="lowB"&&W[5].sid==="carga","");
ok("cinco días de entreno y dos de descanso",
   W.filter(function(w){return (getSession(w.sid)||{}).type!=="rest"}).length===5,"");
ok("y junta pierna con upper",
   (function(){var g=EX.carga.items.map(function(it,i){return muscleOf("carga",i,it)});
    return g.indexOf("legs")>-1&&(g.indexOf("chest")>-1||g.indexOf("back")>-1)})(),
   EX.carga.items.map(function(it,i){return muscleOf("carga",i,it)}).join(","));

print("\n== El día de carga ==");
EX.carga.items.forEach(function(it,i){
  print("  ["+i+"] "+(T(it.n)+"                                  ").slice(0,38)+" ["+(muscleOf("carga",i,it)||"—")+"]");
});
ok("empieza por la sentadilla, con piernas frescas",/Sentadilla/.test(T(EX.carga.items[1].n)),"");
ok("alterna pierna y torso",muscleOf("carga",1,EX.carga.items[1])==="legs"&&muscleOf("carga",2,EX.carga.items[2])==="chest","");
ok("lleva el face pull del manguito",EX.carga.items.some(function(it,i){return muscleOf("carga",i,it)==="cuff"}),"");
ok("y recoge la autorización del 3-ago",/3-ago|3 Aug/.test(T(EX.carga.items[2].how)),"");

print("\n== Los macros siguen funcionando con las sesiones nuevas ==");
["run1","runEasy","carga","runLong","upA","descanso"].forEach(function(sid){
  var l=loadOf(sid);
  ok(sid+" tiene carga definida ("+l+")",!!l,String(l));
});
ok("el sábado es día de recarga: es víspera de la tirada larga",loadOf("carga")==="long",loadOf("carga"));
ok("el jueves pasa a duro: lleva fuerza encima",loadOf("runEasy")==="hard",loadOf("runEasy"));
ok("y el viernes libre es el suave",loadOf("descanso")==="soft",loadOf("descanso"));

print("\n== Nada se rompe ==");
var threw=null;
try{["hoy","rutina","semana","progreso","manguito","reglas"].forEach(function(t){state.tab=t;render()})}catch(e){threw=e}
ok("render sin excepción",threw===null,threw?String(threw):"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
