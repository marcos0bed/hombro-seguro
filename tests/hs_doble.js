var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,120)));if(!c)fails++}
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}};sbUser={id:"u1"};
LOGS.data=[];METRICS.data=[];GACT.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};

print("\n== El jueves lleva dos sesiones ==");
var W7=getWeek();
ok("el jueves es rodaje suave",W7[3].sid==="runEasy",W7[3].sid);
ok("con Upper A encima",W7[3].plus==="upA",String(W7[3].plus));
ok("y el viernes queda libre",W7[5-1].sid==="descanso",W7[4].sid);
ok("siguen siendo 3 carreras",W7.filter(function(w){return (getSession(w.sid)||{}).type==="run"}).length===3,"");
ok("y dos días de descanso",W7.filter(function(w){return (getSession(w.sid)||{}).type==="rest"}).length===2,"");

print("\n== Se pinta la sesión de fuerza antes del rodaje ==");
state.tab="rutina"; state.rxSid="runEasy";
var v=rutinaView();
ok("aparece Upper A",/Upper A/.test(v),"");
ok("con el orden explicado",/primero las pesas|lift first/.test(v),"");
ok("y sus ejercicios",/Press inclinado|Incline dumbbell/.test(v),"");
ok("también los del rodaje",/Rectas|Strides/.test(v),"");
var iF=v.indexOf("Press inclinado"), iR=v.indexOf("Rodaje suave");
ok("las pesas van ANTES del rodaje",iF>-1&&iR>-1&&iF<iR,iF+" vs "+iR);
ok("el selector marca el día doble",/rxplus/.test(v),"");

print("\n== Un día normal no cambia ==");
state.rxSid="run1";
var v2=rutinaView();
ok("el martes no lleva pesas",!/Press inclinado/.test(v2),"");
ok("ni marca de doble en su botón",(v2.match(/rxplus/g)||[]).length===1,String((v2.match(/rxplus/g)||[]).length));

print("\n== Macros: el jueves deja de ser día suave ==");
ok("jueves pasa a duro",loadOf("runEasy")==="hard",loadOf("runEasy"));
ok("el viernes sí es suave",loadOf("descanso")==="soft",loadOf("descanso"));

print("\n== Nada se rompe ==");
var threw=null;
try{["hoy","rutina","semana","progreso"].forEach(function(t){state.tab=t;render()})}catch(e){threw=e}
ok("render sin excepción",threw===null,threw?String(threw):"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
