var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,140)));if(!c)fails++}
var R=JSON.parse(readFile("/tmp/hs_real.json"));
sb={from:function(){return{}}}; sbUser={id:"u1"};
state.dayRange=1; state.dayOff=0; TODAY=R.day;

/* selDay() lee el reloj de verdad, no el TODAY que fija la suite. Mientras el
   fixture se capturó hoy las dos fechas coincidían y todo pasaba; al día
   siguiente la tarjeta buscaba datos de una fecha sin datos y fallaba todo.
   El verde solo valía el día que se grabó el fixture. */
selDay=function(){var d=new Date(TODAY+"T12:00:00");d.setDate(d.getDate()-(state.dayOff||0));return iso(d)};
/* refrescaDia() existe para poner TODAY al día real cuando la app lleva
   abierta desde ayer. En una suite anclada a un fixture es justo lo que no
   se quiere: cualquier render() intermedio desanclaba la fecha y las
   comprobaciones posteriores miraban un día sin datos. */
refrescaDia=function(){return false};
function reset(){METRICS.data=[{day:R.day,stress_curve:R.stress_curve,stress_avg:R.stress_avg,rest_win:R.rest_win,meals_kcal:R.meals_kcal}]}
reset();
var LS={}; W=function(k,v){LS[k]=v}; S=function(k,d){return LS[k]===undefined?d:LS[k]};

print("\n== Solo pide hora de lo que de verdad comió ==");
var c=mealsCard();
ok("hay tarjeta",c.length>100,c);
ok("desayuno sí (326 kcal)",/Desayuno|Breakfast/.test(c),"");
ok("comida sí (1109 kcal)",/Comida|Lunch/.test(c),"");
ok("el batido sale como batido, no como snack",/Batido/.test(c)&&!/Snacks|Picoteo/.test(c),"");
ok("no inventa un ×N: MFP cuenta alimentos, no tomas",c.indexOf("×")<0,"");
ok("la cena SÍ se ofrece aunque aún no haya cenado",/Cena|Dinner/.test(c),"");
ok("y dice que aún no está registrada",/sin registrar/.test(c),"");
ok("marcador 0/4",/>0\/4</.test(c),c.slice(c.indexOf("snum"),c.indexOf("snum")+40));
ok("las calorías salen junto al nombre",/1109 kcal · 62 g/.test(c),"");
ok("cuatro campos de hora",(c.match(/type="time"/g)||[]).length===4,"");

print("\n== Al poner una hora se guarda y se marca ==");
W("meal:"+R.day+":l","14:15");
c=mealsCard();
ok("ahora 1/4",/>1\/4</.test(c),"");
ok("el campo conserva el valor",/value="14:15"/.test(c),"");
var g=stressDayCard();
ok("la gráfica dibuja la marca",(g.match(/#EFE6D2/g)||[]).length>=3,String((g.match(/#EFE6D2/g)||[]).length));
ok("el tooltip dice qué comida y cuánto",/14:15 · Comida · 1109 kcal · 62 g prot/.test(g),"");
ok("la leyenda añade 'comida'",/>comida</.test(g)||/comida<\/span>/.test(g),"");

print("\n== La marca cae donde toca en el eje ==");
W("meal:"+R.day+":b","00:00"); W("meal:"+R.day+":w","23:59");
g=stressDayCard();
var xs=(g.match(/<line x1="([\d.]+)"[^>]*dasharray/g)||[]).map(function(t){return +/x1="([\d.]+)"/.exec(t)[1]});
xs.sort(function(a,b){return a-b});
ok("las 00:00 en el borde izquierdo",xs[0]===3,String(xs));
ok("las 23:59 casi en el derecho",xs[xs.length-1]>330&&xs[xs.length-1]<=337,String(xs));
ok("las 14:15 en medio y a escala",Math.abs(xs[1]-(3+334*(14*60+15)/1440))<0.2,String(xs[1]));

print("\n== Basura en el campo no rompe nada ==");
["","--:--","xx","25:00","12:75","7:00"].forEach(function(v){
  W("meal:"+R.day+":b",v);
  var t=null; try{stressDayCard();mealsCard()}catch(e){t=e}
  ok("aguanta "+JSON.stringify(v),t===null,t);
});
function marcas(){return (stressDayCard().match(/dasharray/g)||[]).length}
W("meal:"+R.day+":b","08:00"); W("meal:"+R.day+":l","14:15"); W("meal:"+R.day+":w","");
ok("tres horas válidas -> pero una vacía, luego 2 marcas",marcas()===2,String(marcas()));
W("meal:"+R.day+":b","25:00");
ok("25:00 no se pinta",marcas()===1,String(marcas()));
W("meal:"+R.day+":b","12:75");
ok("12:75 no se pinta (caía en las 13:15)",marcas()===1,String(marcas()));
W("meal:"+R.day+":b","23:59");
ok("23:59 sí se pinta",marcas()===2,String(marcas()));
W("meal:"+R.day+":b","7:00");
ok("acepta 7:00 sin cero delante",/7:00 · Desayuno/.test(stressDayCard()),"");

print("\n== HOY sin datos de MFP: se puede apuntar igual ==");
METRICS.data=[{day:R.day,stress_curve:R.stress_curve,meals_kcal:null}];
var vac=mealsCard();
ok("hay tarjeta aunque no haya comido aún",vac.length>150,vac.slice(0,80));
ok("ofrece desayuno, comida, cena y batido",
   ["Desayuno","Comida","Cena","Batido"].every(function(n){return vac.indexOf(n)>-1}),"");
ok("no ofrece picoteo por defecto",vac.indexOf("Picoteo")<0,"");
ok("dice que no hay dato en vez de 0 kcal",/sin registrar/.test(vac)&&!/0 kcal/.test(vac),"");
ok("cuatro campos de hora",(vac.match(/type="time"/g)||[]).length===4,"");
W("meal:"+R.day+":l","14:00");
ok("se puede guardar la hora sin kcal",/value="14:00"/.test(mealsCard()),"");
var g2=stressDayCard();
ok("y se pinta en la gráfica",/14:00 · Comida/.test(g2),"");
ok("sin inventar calorías en el tooltip",!/14:00 · Comida · null/.test(g2),"");
W("meal:"+R.day+":l","");

print("\n== Un día PASADO sin datos sigue sin tarjeta ==");
state.dayOff=1;
METRICS.data=[{day:R.day,stress_curve:R.stress_curve,meals_kcal:null}];
ok("ayer sin comida -> sin tarjeta",mealsCard()==="","");
state.dayOff=0;
METRICS.data=[{day:R.day,stress_curve:R.stress_curve,meals_kcal:null}];
ok("y la gráfica sigue pintándose",stressDayCard().length>200,"");
state.dayOff=1;
METRICS.data=[{day:R.day,stress_curve:R.stress_curve,meals_kcal:{d:{k:0,p:0,n:1}}}];
ok("en un día pasado, cajón a 0 kcal se ignora",mealsCard()==="","");
state.dayOff=0;


print("\n== Las horas son de cada día, no globales ==");
reset(); W("meal:"+R.day+":l","14:15");
state.dayOff=1;
ok("ayer no hereda la hora de hoy",mealsCard()===""||!/value="14:15"/.test(mealsCard()),"");
state.dayOff=0;

print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));

print("\n== El aviso de registro incompleto no regaña a media mañana ==");
/* 405 kcal a las 11:27 no es un registro malo: es que aún no ha comido. */
METRICS.data=[{day:TODAY,kcal_in:405,protein_g:51,carbs_g:3,fat_g:22}];
W("goal",{macros:{prot:160,soft:{carb:60,fat:75},hard:{carb:110,fat:80},long:{carb:130,fat:80}}});
var m=macroCard();
ok("la tarjeta se pinta",m.length>200,String(m.length));
var esTarde=new Date().getHours()>=21;
ok("de día no avisa; de noche sí",/Registro incompleto/.test(m)===esTarde,"hora="+new Date().getHours());
state.dayOff=1;
var ayer=macroCard();
ok("un día cerrado sí avisa",!ayer||!/kcal_in/.test(ayer),"");
state.dayOff=0;



print("\n== 'Esta semana' mira la semana del día seleccionado ==");
/* viendo el domingo pasado, la tarjeta debe cerrar ESA semana */
state.dayOff=1;
var wp=weekPaceCard();
var ayer=selDay();
ok("el rango es el de la semana de ayer",wp.indexOf(mondayOf(ayer).slice(8,10)+"/")>0,wp.slice(wp.indexOf("macnote"),wp.indexOf("macnote")+60));
ok("sin 'hoy aparte' en una semana cerrada",ayer<mondayOf(TODAY)? !/hoy aparte|today separate/.test(wp):true,"");
state.dayOff=0;

print("\n== Las tres filas siempre están ==");
var wp2=weekPaceCard();
ok("calorías siempre",/Calorías|Calories/.test(wp2),"");
ok("proteína siempre",/Proteína|Protein/.test(wp2),"");
ok("entreno siempre",/Entreno|Training/.test(wp2),"");

print("\n== Botón propio para borrar la hora (13-ago) ==");
/* El "Reset" del selector nativo de hora en iOS no vacía el campo: solo
   deshace lo girado en esa apertura del picker, así que si la hora ya
   estaba puesta, Reset la deja tal cual — parece que no hace nada (dos
   intentos previos con eventos del navegador tampoco servían de nada,
   porque el problema nunca fue un evento que no llegara). Botón propio,
   fuera del picker nativo, con guardado directo. */
LOGS.data=[];GACT.data=[];   // clearmeal llama a render(true); sin esto intenta ir a red
ok("sin hora puesta, no hay botón de borrar",!/data-act="clearmeal"[^>]*meal:[^:]*:d/.test(mealsCard()),"");
/* Sin el botón, mealnm (flex:1) crecía y desalineaba esa fila frente a las
   demás: se reserva el hueco con un span invisible en vez de quitarlo. */
ok("pero sí se reserva su hueco, para no desalinear la fila",/class="tclear ph"/.test(mealsCard()),"");
W("meal:"+R.day+":d","21:32");
var cD=mealsCard();
ok("con hora puesta, sí aparece",new RegExp('data-act="clearmeal" data-key="meal:'+R.day+':d"').test(cD),cD.slice(cD.indexOf("Cena"),cD.indexOf("Cena")+220));
document._h.click({target:{closest:function(sel){
  return sel==="[data-act],[data-tab]"?{getAttribute:function(a){return a==="data-act"?"clearmeal":null},dataset:{key:"meal:"+R.day+":d"}}:null;
}}});
ok("al tocarlo, la hora queda vacía",S("meal:"+R.day+":d",null)==="","");
ok("y el botón desaparece",!new RegExp('data-act="clearmeal" data-key="meal:'+R.day+':d"').test(mealsCard()),"");


print("\n== Reparto recomendado del día (16-sep-2026) ==");
/* La suite NO puede depender del día en que se grabó el fixture: mealRec()
   mira el weekday real. Se fija la semana entera al sid que toque probar. */
var _gw=getWeek;
function pinSid(sid){getWeek=function(){var a=[];for(var i=0;i<7;i++)a.push({d:B("X","X"),sid:sid});return a}}
function unpin(){getWeek=_gw}

/* El guardarraíl que importa: si alguien toca una hora o un gramo, el reparto
   tiene que seguir sumando el objetivo de carbos de ese tipo de día. Sin esto
   MEALREC y MACROS se desalinean en silencio y el plan deja de ser el plan. */
["descanso","run1","lowB","runEasy","carga","runLong"].forEach(function(sid){
  pinSid(sid);
  var rec=mealRec(TODAY),kind=loadOf(sid),tot=0;
  Object.keys(rec.c).forEach(function(k){tot+=rec.c[k]});
  ok(sid+" ("+kind+") suma "+MACROS[kind].carb+" g de HC",tot===MACROS[kind].carb,sid+" suma "+tot);
  unpin();
});
var totP=0;Object.keys(MEALPROT).forEach(function(k){totP+=MEALPROT[k]});
ok("la proteína suma los 160 g del plan",totP===MACROS.prot,String(totP));

print("\n== La tarjeta enseña la recomendación ==");
reset(); pinSid("lowB"); W("meal:"+R.day+":l","");
var cR=mealsCard();
ok("sugiere hora para la comida",/→ 14:15/.test(cR),cR.slice(cR.indexOf("Comida"),cR.indexOf("Comida")+260));
ok("y los gramos de HC y proteína",/14:15 · 45 g HC · 60 g prot/.test(cR),"");
ok("el batido lleva su ancla de las 18:00",/→ 18:00/.test(cR),"");
ok("un día sin pre no saca la nota del plátano",cR.indexOf("Pre-sesión")<0,"");

print("\n== Solo avisa cuando la desviación importa ==");
/* Se limpian las demás horas: las secciones de arriba dejaron el desayuno en
   las 7:00 y la comprobación miraba la tarjeta entera, así que el ámbar de esa
   fila daba por buena una marca que no era la que se estaba probando. */
["b","d","w","s"].forEach(function(k){W("meal:"+R.day+":"+k,"")});
W("meal:"+R.day+":l","14:40");
ok("26 min de diferencia no se marcan",!/mealsug off/.test(mealsCard()),"");
W("meal:"+R.day+":l","16:30");
var cOff=mealsCard();
ok("2h15 sí se marcan en ámbar",/mealsug off/.test(cOff),"");
ok("y dice cuánto se ha desviado",/\(2\.3 h\)/.test(cOff),cOff.slice(cOff.indexOf("mealsug off"),cOff.indexOf("mealsug off")+90));
W("meal:"+R.day+":l","");
ok("basura en el campo no marca desviación",mealOff("12:75","14:15")===null,"");
ok("ni una hora imposible",mealOff("25:00","14:15")===null,"");
unpin();

print("\n== Los días de calidad llevan pre de carrera ==");
pinSid("run1");
var cQ=mealsCard();
ok("martes: nota de pre-sesión a las 07:45",/Pre-sesión 07:45/.test(cQ),cQ.slice(cQ.indexOf("mealnote"),cQ.indexOf("mealnote")+160));
ok("con los 30 g de HC rápidos",/30 g HC rápidos/.test(cQ),"");
ok("y el desayuno se adelanta a justo después de entrenar",/→ 09:30/.test(cQ),"");
unpin();
pinSid("runLong");
var cL=mealsCard();
ok("tirada larga: pre a las 09:15",/Pre-sesión 09:15/.test(cL),"");
ok("y desayuno a las 11:45",/→ 11:45/.test(cL),"");
unpin();
pinSid("runEasy");
ok("el rodaje suave NO lleva pre: ahí se conserva el ayuno",mealsCard().indexOf("Pre-sesión")<0,"");
unpin();

print("\n== El backend manda sobre el plan integrado ==");
pinSid("lowB");
W("goal",{meals:{hard:{h:{b:"08:00",l:"13:00",w:"19:30"},c:{b:40,l:50,w:20}}}});
var cB=mealsCard();
ok("goal.meals pisa a MEALREC",/→ 13:00/.test(cB)&&!/→ 14:15/.test(cB),"");
W("goal",{});
unpin();

print("\n== Nadie hereda el plan de otro ==");
/* macroGoal() ya tenía este candado; mealRec() no, y le habría enseñado a
   Lorena la ventana de ayuno de Marcos como si fuera su recomendación. */
pinSid("lowB");
var _rt=getRT();
W("routine",{mode:"full",days:[]});
ok("con rutina propia y sin goal.meals, no hay recomendación",mealRec(TODAY)===null,"");
ok("y la tarjeta diaria no la inventa",mealsCard().indexOf("→ ")<0,"");
ok("ni la de Perfil",mealPlanCard()==="","");
W("goal",{meals:{hard:{h:{l:"13:00"},c:{l:50}}}});
ok("pero sí las suyas si el backend se las manda",/→ 13:00/.test(mealsCard()),"");
W("goal",{}); W("routine",_rt);
ok("y Marcos, sin rutina propia en localStorage, sigue viendo la suya",/→ 14:15/.test(mealsCard()),"");
unpin();

print("\n== El plan entero, en Perfil ==");
var mp=mealPlanCard();
ok("hay tarjeta",mp.length>300,String(mp.length));
ok("una fila por día de la semana",(mp.match(/class="mprow/g)||[]).length===7,String((mp.match(/class="mprow/g)||[]).length));
ok("marca el día de hoy",/mprow today/.test(mp),"");
ok("dice la proteína fija",/160 g/.test(mp),"");
ok("avisa del batido de la tirada de noche",/21:30/.test(mp),"");
ok("sale de la misma fuente que la tarjeta diaria",/18:00/.test(mp),"");
W("goal",{meals:{hard:{h:{b:"08:00"},c:{b:40}}}});
ok("y también obedece a goal.meals",/08:00/.test(mealPlanCard()),"");
W("goal",{});
ok("perfil solo-running no la pinta",(function(){
  var r=getRT();W("routine",{mode:"run"});var v=mealPlanCard();W("routine",r);return v===""})(),"");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
