var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,120)));if(!c)fails++}
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}}; sbUser={id:"u1"};
var R=JSON.parse(readFile("/tmp/hs_real.json"));
state.dayRange=1; state.dayOff=0; TODAY=R.day; LOGS.data=[];
METRICS.data=[{day:R.day,steps:9000,distance_km:6.5,weight_kg:86.6,body_fat_pct:23.7,kcal_in:1900,kcal_out:2900,
               sleep_h:7.6,hrv_ms:29,rhr:57,bed_h:0,sleep_start_h:0.45,sleep_lat_min:28,
               stress_curve:R.stress_curve,rest_win:R.rest_win,meals_kcal:R.meals_kcal}];
var LS={}; W=function(k,v){LS[k]=v}; S=function(k,d){return LS[k]===undefined?d:LS[k]};

print("\n== Perfil normal: se ve todo ==");
W("routine",null);
ok("no está en modo carrera",runOnly()===false,"");
var n=dayCard();
ok("hay peso",/Peso|Weight/.test(n),"");
ok("hay grasa",/Grasa|Body fat/i.test(n),"");
ok("hay kcal in",/Kcal in/.test(n),"");
ok("el presupuesto ya no está arriba, sino en macros",!/Por comer|Left to eat/.test(n)&&/Por comer|Left to eat/.test(macroCard()),"");
ok("hay macros",macroCard().length>100,"");
ok("hay horas de comida",mealsCard().length>100,"");

print("\n== Modo carrera: fuera comida y peso ==");
W("routine",{mode:"run",week:[{d:{es:"LUN",en:"MON"},sid:"descanso",name:{es:"Lunes",en:"Monday"}},{d:{es:"MAR",en:"TUE"},sid:"calidad",name:{es:"Martes",en:"Tuesday"}},{d:{es:"MIÉ",en:"WED"},sid:"descanso",name:{es:"Miércoles",en:"Wednesday"}},{d:{es:"JUE",en:"THU"},sid:"suave",name:{es:"Jueves",en:"Thursday"}},{d:{es:"VIE",en:"FRI"},sid:"descanso",name:{es:"Viernes",en:"Friday"}},{d:{es:"SÁB",en:"SAT"},sid:"descanso",name:{es:"Sábado",en:"Saturday"}},{d:{es:"DOM",en:"SUN"},sid:"larga",name:{es:"Domingo",en:"Sunday"}}],sessions:{descanso:{title:{es:"Descanso",en:"Rest"},type:"rest",items:[]},calidad:{title:{es:"Calidad",en:"Quality"},type:"run",items:[]},suave:{title:{es:"Suave",en:"Easy"},type:"run",items:[]},larga:{title:{es:"Tirada larga",en:"Long run"},type:"run",items:[]}}});
ok("está en modo carrera",runOnly()===true,"");
var c=dayCard();
ok("NO hay peso",!/Peso<|Weight<|⚖️/.test(c),"");
ok("NO hay grasa",!/🧈/.test(c),"");
ok("NO hay kcal in",!/Kcal in/.test(c),"");
ok("NO hay presupuesto en ningún sitio",!/Por comer|Left to eat/.test(c)&&macroCard()==="","");
ok("NO hay macros",macroCard()==="","");
ok("NO hay horas de comida",mealsCard()==="","");
ok("NO hay parte semanal",weekPaceCard()==="","");

print("\n== Pero SÍ ve lo suyo ==");
ok("pasos",/👣/.test(c),"");
ok("y los km",/km<\/span>/.test(c),"");
ok("kcal out (gasto, no ingesta)",/Kcal out/.test(c),"");
ok("sueño",/😴/.test(c),"");
ok("HRV",/HRV/.test(c),"");
ok("pulso en reposo",/🫀/.test(c),"");
ok("la tarjeta de sueño con latencia",bedCard().length>200,"");
ok("y la gráfica de estrés",stressDayCard().length>200,"");

print("\n== Nada se rompe ==");
var threw=null;
try{["hoy","rutina","semana","progreso"].forEach(function(t){state.tab=t;render()})}catch(e){threw=e}
ok("render en modo carrera",threw===null,threw?String(threw):"");
W("routine",null); threw=null;
try{["hoy","rutina","semana","progreso"].forEach(function(t){state.tab=t;render()})}catch(e){threw=e}
ok("render en modo normal",threw===null,threw?String(threw):"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
