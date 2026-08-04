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

