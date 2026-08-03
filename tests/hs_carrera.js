var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,130)));if(!c)fails++}
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}}; sbUser={id:"u1"};
LOGS.data=[]; METRICS.data=[];
var LS={}; W=function(k,v){LS[k]=v}; S=function(k,d){return LS[k]===undefined?d:LS[k]};
function dias(n){var d=new Date();d.setDate(d.getDate()-n);return iso(d)+"T09:00:00"}
function run(n,km,min,hr,t){return {activity_id:n,start_time:dias(n),type:"running",distance_km:km,duration_min:min,hr_avg:hr,temp_c:t,apparent_c:t}}

print("\n== Sin carrera configurada la pestaña no existe ==");
W("race",null); GACT.data=[];
ok("no está en las pestañas",visibleTabs().indexOf("carrera")<0,visibleTabs().join(","));
W("race",{name:"Ponle Freno",date:"2026-11-15",km:10,goal_min:60,hr_max:195});
ok("con carrera sí aparece",visibleTabs().indexOf("carrera")>-1,visibleTabs().join(","));

print("\n== Conversión de ritmos ==");
ok("8:11 se escribe bien",fmtPace(8+11/60)==="8:11",fmtPace(8+11/60));
ok("una hora clavada",fmtMin(60)==="1:00:00",fmtMin(60));
ok("57:30",fmtMin(57.5)==="0:57:30",fmtMin(57.5));
ok("Riegel: 5 km en 28 -> 10 km",Math.abs(riegel(5,28,10)-58.3)<0.5,String(riegel(5,28,10)));

print("\n== Corrección por temperatura ==");
var frio=run(1,5,41,150,12), calor=run(2,5,41,150,30);
ok("a 12° no corrige (por debajo de la referencia)",Math.abs(paceCorr(frio)-8.2)<0.01,String(paceCorr(frio)));
ok("a 30° corrige a mejor",paceCorr(calor)<paceMin(calor),String(paceCorr(calor)));
ok("y son 22 s/km menos",Math.abs((paceMin(calor)-paceCorr(calor))*60-22.5)<0.6,String((paceMin(calor)-paceCorr(calor))*60));

print("\n== Cabecera de la carrera ==");
GACT.data=[run(5,5,28,180,15),run(12,6,36,175,18)];
var h=raceHeadCard();
ok("dice el nombre",/Ponle Freno/.test(h),"");
ok("cuenta los días que faltan",/días|days/.test(h),"");
ok("muestra el objetivo 1:00:00",/1:00:00/.test(h),"");
ok("y proyecta un tiempo",/Previsto|Projected/.test(h)&&/0:5\d:\d\d|1:0\d:\d\d/.test(h),h.slice(h.indexOf("Previsto"),h.indexOf("Previsto")+120));
GACT.data=[run(5,1.5,12,150,15)];
ok("sin carrera de 3 km no se inventa proyección",/Necesito|I need/.test(raceHeadCard()),"");

print("\n== Eficiencia aeróbica ==");
GACT.data=[run(2,5,41,150,15)];
ok("con 1 sola carrera avisa en vez de dibujar",/al menos 3|At least 3/.test(efficiencyCard()),"");
GACT.data=[run(60,5,43,150,15),run(59,5,43,150,15),run(58,5,43,150,15),
           run(4,5,40,150,15),run(3,5,40,150,15),run(2,5,40,150,15)];
var e=efficiencyCard();
ok("con historia dibuja un área",/Eficiencia|Aerobic/.test(e)&&/<svg/.test(e)&&/linearGradient/.test(e),"");
ok("con curva suave, no en sierra",/C[\d.]+ [\d.]+,/.test(e),"");
ok("y destaca el último valor",/font-weight="700"/.test(e),"");
ok("detecta la mejora",/ganado|gained/.test(e),e.slice(e.indexOf("macwarn"),e.indexOf("macwarn")+140));
ok("solo cuenta rodajes suaves",runsOf().filter(function(a){return a.hr_avg<=195*0.82}).length===6,"");
GACT.data=[run(60,5,40,185,15),run(59,5,40,185,15),run(58,5,40,185,15)];
ok("carreras duras no entran en la eficiencia",/al menos 3|At least 3/.test(efficiencyCard()),"");

print("\n== Volumen semanal ==");
GACT.data=[run(20,10,80,150,15),run(13,5,40,150,15),run(6,8,64,150,15),run(2,9,72,150,15)];
var v=volumeCard();
ok("se pinta",/Kilómetros|Weekly volume/.test(v),"");
ok("con barras redondeadas",/<rect[^>]*rx="/.test(v),"");
ok("suma el total",/32 km/.test(v),v.slice(v.indexOf("snum"),v.indexOf("snum")+60));
GACT.data=[run(13,4,32,150,15),run(6,4.9,39,150,15)];
ok("no avisa por un +23 % sobre 4 km (sería ruido)",!/riesgo de lesión|injury risk/.test(volumeCard()),"");
GACT.data=[run(13,20,160,150,15),run(6,26,208,150,15)];
ok("pero sí por un +30 % sobre 20 km",/riesgo de lesión|injury risk/.test(volumeCard()),"");

print("\n== Distribución de intensidad ==");
GACT.data=[run(20,5,40,150,15),run(19,5,40,152,15),run(18,5,30,180,15),
           run(13,5,40,150,15),run(12,5,25,185,15),run(11,5,40,151,15)];
var i2=intensityCard();
ok("se pinta",/repartes el esfuerzo|split effort/.test(i2),"");
ok("es un anillo, no barras",/<circle/.test(i2)&&/stroke-dasharray/.test(i2),"");
ok("con los tres colores",/#46C08A/.test(i2)&&/#E8963E/.test(i2)&&/#E5484D/.test(i2),"");
ok("y el porcentaje suave en el centro",/font-size="26"/.test(i2)&&/%<\/text>/.test(i2),"");
ok("con la marca del objetivo al 80 %",/objetivo 80|80 % target/.test(i2),"");
GACT.data=[run(20,5,30,178,15),run(19,5,30,180,15),run(18,5,30,179,15)];
ok("todo en zona gris -> lo avisa",/zona gris|grey zone/.test(intensityCard()),"");
GACT.data=[run(20,5,40,150,15),run(19,5,40,148,15),run(18,5,40,152,15)];
ok("todo suave -> avisa de que falta velocidad",/sin un día rápido|without one fast day/.test(intensityCard()),"");

print("\n== Adherencia ==");
/* fijamos un miércoles para que la semana tenga más de un día cerrado */
var HOY0=TODAY; TODAY="2026-08-05";
var lun=lunesDe(TODAY),plan={};plan[lun]="Series 6x1 min";plan[TODAY]="Rodaje suave 25 min";
W("race",{name:"Ponle Freno",date:"2026-11-15",km:10,goal_min:60,hr_max:195,plan:plan});
GACT.data=[{activity_id:9,start_time:TODAY+"T09:00:00",type:"running",distance_km:3.1,duration_min:25,hr_avg:149}];
var ad=adherenceCard();
ok("se pinta",/Esta semana|This week/.test(ad),"");
ok("marca la hecha",/✓ 3.1 km/.test(ad),"");
ok("y la pendiente",/—/.test(ad),ad.slice(ad.indexOf("wkrow"),ad.indexOf("wkrow")+260));
TODAY=HOY0;

print("\n== La vista entera ==");
GACT.data=[run(20,10,80,150,15),run(13,5,40,150,15),run(6,8,64,150,15),run(2,9,72,150,15)];
var threw=null,vw="";
try{vw=carreraView()}catch(e){threw=e}
ok("carreraView sin excepción",threw===null,threw?String(threw):"");
ok("trae las tarjetas",vw.length>1500,String(vw.length));
threw=null;
try{state.tab="carrera";render()}catch(e){threw=e}
ok("render sin excepción",threw===null,threw?String(threw):"");
GACT.data=[];
try{state.tab="carrera";render();carreraView()}catch(e){threw=e}
ok("sin ninguna carrera tampoco revienta",threw===null,threw?String(threw):"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
