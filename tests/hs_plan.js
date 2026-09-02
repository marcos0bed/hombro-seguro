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

/* El badge de km del run1 ("Calidad") era un rango fijo de plantilla
   (6-9 km, pensado para series de 45-55 min). El Fartlek del 1-sep-2026 dura
   40 min con medio tiempo a ritmo suave y nunca llega a esos números: el
   badge mentía. estimarKmPlan() lo calcula tramo a tramo desde el plan del
   día, y solo si TODOS los tramos son calculables. */
print("\n== estimarKmPlan: badge calculado tramo a tramo, no un rango fijo ==");
var pasosFartlek=[["Calentamiento","10 min · 7:45-8:15 + 4 rectas"],
  ["Fartlek","10 × (1 min · 5:50-6:10 / 1 min · 7:45-8:15)"],
  ["Enfriamiento","10 min · 7:45-8:15"]];
ok("Fartlek de 40 min sale 5,3-5,6 km (el reloj marcó 5,67)",
   estimarKmPlan(pasosFartlek)==="5.3-5.6 km",String(estimarKmPlan(pasosFartlek)));
var pasosCuestas=[["Calentamiento","10 min · 7:45-8:15 + 4 rectas"],
  ["Cuestas","8 × 45 s subiendo fuerte"],["Recuperación","bajando al trote"],
  ["Enfriamiento","10 min · 7:45-8:15"]];
ok("cuestas por tiempo sin ritmo -> no se inventa un número",
   estimarKmPlan(pasosCuestas)===null,String(estimarKmPlan(pasosCuestas)));
var pasosObjetivo=[["Series","6 × 3 min · ritmo objetivo"]];
ok("series a ritmo objetivo (antes del test del 4-oct) -> tampoco",
   estimarKmPlan(pasosObjetivo)===null,String(estimarKmPlan(pasosObjetivo)));
var pasosTest=[["🎯 TEST","5 km lo más rápido que puedas"]];
ok("un tramo con km explícito se toma tal cual",
   estimarKmPlan(pasosTest)==="5 km",String(estimarKmPlan(pasosTest)));
var pasosRecortoNegligible=[["Recuperación","90 s andando o trote muy suave"]];
ok("una recuperación corta sola no basta para dar un rango (nada calculable)",
   estimarKmPlan(pasosRecortoNegligible)===null,String(estimarKmPlan(pasosRecortoNegligible)));

print("\n== El badge de la sesión usa el cálculo, no el 6-9 km fijo de run1 ==");
TODAY="2026-09-01";
W("race",{name:"Ponle Freno",date:"2026-11-15",km:10,goal_min:55,
  plan:{"2026-09-01":{t:{es:"Fartlek",en:"Fartlek"},p:pasosFartlek}}});
var hv=sessionView("run1","2026-09-01");
ok("el badge dice 5.3-5.6 km",/5\.3-5\.6 km/.test(hv),hv.slice(0,300));
ok("y ya no el 6-9 km fijo de la plantilla",!/6-9 km/.test(hv),hv.slice(0,300));
W("race",{name:"Ponle Freno",date:"2026-11-15",km:10,goal_min:55,
  plan:{"2026-09-15":{t:{es:"Cuestas",en:"Hills"},p:pasosCuestas}}});
var hv2=sessionView("run1","2026-09-15");
ok("sin poder calcular, cae al 6-9 km fijo de la plantilla",/6-9 km/.test(hv2),hv2.slice(0,300));

print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
