var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,120)));if(!c)fails++}
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}}; sbUser={id:"u1"};
LOGS.data=[];METRICS.data=[];GACT.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};
var plan={"2026-08-04":"6×1 min fuerte / 90 s suave","2026-08-09":"45 min progresivo","2026-11-15":"🏁 PONLE FRENO 10K"};
W("race",{name:"Ponle Freno",date:"2026-11-15",km:10,goal_min:55,hr_max:185,plan:plan});

print("\n== La sesión del día sale del plan fechado ==");
ok("martes 4-ago: las series",planDelDia("2026-08-04")==="6×1 min fuerte / 90 s suave",String(planDelDia("2026-08-04")));
ok("un día sin plan devuelve null",planDelDia("2026-08-05")===null,String(planDelDia("2026-08-05")));
var c=planCard("2026-08-04");
ok("la tarjeta se pinta",c.length>100,c.slice(0,60));
ok("con el texto de la sesión",/6×1 min fuerte/.test(c),"");
ok("y dice en qué semana estás",/semana 1 de 15|week 1 of 15/.test(c),c.slice(c.indexOf("snum"),c.indexOf("snum")+60));
ok("el domingo 9 es semana 1",/semana 1|week 1/.test(planCard("2026-08-09")),"");
ok("el día de la carrera es la 15",/semana 15|week 15/.test(planCard("2026-11-15")),"");
ok("sin plan no hay tarjeta",planCard("2026-08-05")==="","");
W("race",null);
ok("sin carrera configurada tampoco",planCard("2026-08-04")==="","");

print("\n== Orden de pestañas ==");
W("race",{name:"x",date:"2026-11-15",km:10});
var t=visibleTabs();
ok("Carrera va justo detrás de Rutina",t[t.indexOf("rutina")+1]==="carrera",t.join(","));
ok("y antes de Semana",t.indexOf("carrera")<t.indexOf("semana"),t.join(","));
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
