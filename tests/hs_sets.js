var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,200)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};METRICS.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};
render=function(){};

/* La sesión real del 1-nov-2026, la primera con los nombres editados a mano en
   Garmin Connect. Lo que el reloj NO sabe es el ejercicio: sin esa edición
   `ej` llega a "UNKNOWN" y no se enseña. */
var sets=[
  {hora:"19:33",reps:12,kg:12,dur:32,descanso:null,ej:"BENCH_PRESS:INCLINE_DUMBBELL_BENCH_PRESS"},
  {hora:"19:36",reps:12,kg:24,dur:33,descanso:125,ej:"BENCH_PRESS:INCLINE_DUMBBELL_BENCH_PRESS"},
  {hora:"19:40",reps:10,kg:18,dur:29,descanso:207,ej:"BENCH_PRESS:INCLINE_DUMBBELL_BENCH_PRESS"},
  {hora:"19:48",reps:10,kg:null,dur:31,descanso:156,ej:"PUSH_UP"},
  {hora:"20:09",reps:10,kg:20,dur:25,descanso:153,ej:"ROW:SINGLE_ARM_NEUTRAL_GRIP_DUMBBELL_ROW"},
  {hora:"20:10",reps:10,kg:20,dur:18,descanso:10,ej:"ROW:SINGLE_ARM_NEUTRAL_GRIP_DUMBBELL_ROW"}
];
var log={day:"2026-11-01",session_id:"carga",title:"Carga",created_at:"2026-11-01T20:21:00",
         total_sets:21,est_volume:4100,
         entries:[{n:"Dumbbell floor press",sets:5,reps:"10",weight:18}]};
var act={activity_id:24932770585,start_time:"2026-11-01T19:33:00",type:"strength_training",
         duration_min:46,calories:300,raw:{sets:sets}};

print("\n== El nombre del ejercicio ==");
ok("coge la subcategoría, no la categoría",exName("ROW:SINGLE_ARM_NEUTRAL_GRIP_DUMBBELL_ROW")==="Single arm neutral grip dumbbell row",exName("ROW:SINGLE_ARM_NEUTRAL_GRIP_DUMBBELL_ROW"));
ok("sin subcategoría se queda la categoría",exName("PUSH_UP")==="Push up",exName("PUSH_UP"));
/* UNKNOWN es "no lo he reconocido", no un ejercicio: enseñarlo sería inventar. */
ok("UNKNOWN no se enseña",exName("UNKNOWN")==="","["+exName("UNKNOWN")+"]");
ok("UNKNOWN con categorías de relleno tampoco",exName("UNKNOWN:null")===""||exName("UNKNOWN")==="","");
ok("vacío no rompe",exName(null)===""&&exName("")==="","");

print("\n== Agrupa las series seguidas del mismo ejercicio ==");
var gs=exGrupos(sets);
ok("tres bloques, no seis filas sueltas",gs.length===3,String(gs.length));
ok("el press lleva sus tres series",gs[0].sets.length===3,String(gs[0].sets.length));
ok("y el remo sus dos",gs[2].sets.length===2,String(gs[2].sets.length));

print("\n== La tabla del reloj ==");
var card=relojSetsCard(sets);
ok("pone las horas en local",/19:33/.test(card)&&/20:09/.test(card),"");
ok("las repeticiones",/>12</.test(card)&&/>10</.test(card),"");
ok("el descanso en minutos:segundos",/2:05/.test(card)&&/3:27/.test(card),card.slice(0,200));
/* 10 segundos entre series es el cambio de brazo del remo a una mano, no un
   descanso: tiene que verse como 0:10 y no redondearse a 0. */
ok("y el cambio de brazo de 10 s se ve",/0:10/.test(card),"");
ok("sin peso no inventa un 0",/—/.test(card),"");
/* El peso lo teclea él en el reloj y SE ARRASTRA del ejercicio anterior: que
   dentro de un mismo ejercicio haya 12, 24 y 18 kg casi siempre es ese fallo. */
ok("marca el peso incoherente dentro de un ejercicio",/⚠/.test(card),"");
ok("un ejercicio con peso constante no se marca",relojSetsCard(sets.slice(4)).indexOf("⚠")<0,"");
ok("sin series no hay tabla",relojSetsCard([])===""&&relojSetsCard(null)==="","");

print("\n== El botón, en el historial ==");
LOGS.data=[log];GACT.data=[act];
state.histOpen="2026-11-01|carga|0";
var h=histView();
ok("la sesión está desplegada",/Dumbbell floor press/.test(h),"");
ok("sale el botón de traer de Garmin",/data-act="exreq"/.test(h),"");
ok("con el id de la actividad",/data-aid="24932770585"/.test(h),"");
ok("enseña lo que vio el reloj",/Lo que vio el reloj|What the watch/.test(h),"");
ok("y el nombre editado",/Single arm neutral grip dumbbell row/.test(h),"");
ok("sin desplegar no pinta nada de eso",(state.histOpen=null,!/data-act="exreq"/.test(histView())),"");

print("\n== Cuándo NO sale el botón ==");
state.histOpen="2026-11-01|garmin-999|0";
LOGS.data=[{day:"2026-11-01",session_id:"garmin-999",title:"8 km",created_at:"2026-11-01T19:00:00",
            entries:[{n:"8 km @ 5:15",m:"cardio",sets:1}]}];
GACT.data=[{activity_id:999,start_time:"2026-11-01T18:00:00",type:"running",distance_km:8}];
ok("en una carrera no: Garmin no tiene series",!/data-act="exreq"/.test(histView()),"");
/* Una sesión de pesas sin actividad casada no tiene a qué pedirle el detalle. */
state.histOpen="2026-11-01|carga|0";
LOGS.data=[log];GACT.data=[];
ok("sin actividad de Garmin tampoco",!/data-act="exreq"/.test(histView()),"");

print("\n== Sesión sin detalle todavía: botón sí, tabla no ==");
GACT.data=[{activity_id:24932770585,start_time:"2026-11-01T19:33:00",type:"strength_training",
            duration_min:46,raw:{}}];
var sin=histView();
ok("el botón está",/data-act="exreq"/.test(sin),"");
ok("pero no hay tabla del reloj",!/Lo que vio el reloj|What the watch/.test(sin),"");

print("\n== Pedirlo deja la petición escrita y el botón en espera ==");
GACT.data=[act];
var pedido=null;cloudPush=function(k,v){if(k==="exreq")pedido=v};
exreqPide("24932770585");
ok("escribe kv_state.exreq",!!pedido&&pedido.activity_id===24932770585,JSON.stringify(pedido));
ok("con la hora",!!(pedido&&pedido.at),"");
ok("el botón queda deshabilitado",/data-act="exreq"[^>]*disabled/.test(histView()),"");
ok("y lo dice",/Trayendo de Garmin|Fetching from Garmin/.test(histView()),"");

print("\n== Y donde de verdad lo quiere: la caja de hoy ==");
/* El historial está enterrado. Él abre la app al acabar de entrenar, así que
   el botón y el detalle tienen que estar en la sesión de hoy. */
TODAY="2026-11-01";
state.doneOpen=undefined;state.histOpen=null;
LOGS.data=[log];GACT.data=[act];
var hoy=doneTodayBox();
ok("la sesión de hoy sale",/Carga/.test(hoy),"");
ok("con el botón",/data-act="exreq"/.test(hoy),"");
ok("y el id correcto",/data-aid="24932770585"/.test(hoy),"");
/* Abierta por defecto: tener que tocar para ver el detalle era el fallo de
   tenerlo solo en el historial. */
ok("abierta por defecto, con el detalle a la vista",/Single arm neutral grip dumbbell row/.test(hoy),"");
ok("se puede plegar",(state.doneOpen="hoy|carga|0",/▾/.test(doneTodayBox())),"");
ok("y plegada manda su elección",(state.doneOpen="otra",!/Single arm neutral grip/.test(doneTodayBox())),"");

print("\n== La caja de hoy: cuándo no hay botón ==");
state.doneOpen=undefined;
GACT.data=[];
ok("sin actividad de Garmin no hay botón",!/data-act="exreq"/.test(doneTodayBox()),"");
GACT.data=[{activity_id:999,start_time:"2026-11-01T18:00:00",type:"running",distance_km:8}];
LOGS.data=[{day:"2026-11-01",session_id:"garmin-999",title:"8 km",created_at:"2026-11-01T19:00:00",
            entries:[{n:"8 km @ 5:15",m:"cardio",sets:1}]}];
ok("en una carrera tampoco",!/data-act="exreq"/.test(doneTodayBox()),"");

print("\n== Sesión de hoy sin detalle: botón sí, tabla no ==");
LOGS.data=[log];
GACT.data=[{activity_id:24932770585,start_time:"2026-11-01T19:33:00",type:"strength_training",
            duration_min:46,raw:{}}];
state.doneOpen="hoy|carga|0";
var hsin=doneTodayBox();
ok("el botón está",/data-act="exreq"/.test(hsin),"");
ok("sin tabla",!/Lo que vio el reloj|What the watch/.test(hsin),"");

print("\n== Quien NO registra en la app (Lorena) ==");
/* Lorena no usa la rutina: sus sesiones de fuerza no tienen workout_log. Si el
   detalle cuelga del log, se queda sin nada. Su reloj además ya trae los
   nombres, porque sigue un entrenamiento estructurado. */
var lor=[
  {hora:"12:12",reps:10,kg:20,dur:40,descanso:null,ej:"SHOULDER_PRESS:BARBELL_PUSH_PRESS"},
  {hora:"12:13",reps:6,kg:32.5,dur:28,descanso:62,ej:"SHOULDER_PRESS:BARBELL_PUSH_PRESS"},
  {hora:"12:19",reps:8,kg:24,dur:41,descanso:90,ej:"SHOULDER_PRESS:ARNOLD_PRESS"}
];
var actLor={activity_id:24892129962,name:"Shoulders",start_time:"2026-11-01T12:12:00",
            type:"strength_training",duration_min:40,calories:210,raw:{sets:lor}};
TODAY="2026-11-01";
state.doneOpen=undefined;state.histOpen=null;
LOGS.data=[];GACT.data=[actLor];
var cajaL=doneTodayBox();
ok("la caja sale aunque no haya ningún log",cajaL!=="",cajaL.slice(0,120));
ok("con el título que ella le puso en Garmin",/Shoulders/.test(cajaL),"");
ok("y el detalle a la vista",/Barbell push press/.test(cajaL),"");
ok("con los pesos reales, que los suyos sí son fiables",/32.5/.test(cajaL),"");
ok("y el botón por si edita algo",/data-act="exreq"/.test(cajaL),"");
/* Un peso distinto por serie aquí es la serie de aproximación, no el fallo de
   arrastre: el ⚠ avisa, pero el dato es bueno. Que avise es correcto. */
ok("marca los pesos distintos del mismo ejercicio",/⚠/.test(cajaL),"");

print("\n== Sin duplicar: si hay log, no se repite la sesión ==");
var logL={day:"2026-11-01",session_id:"carga",title:"Carga",created_at:"2026-11-01T12:55:00",
          entries:[{n:"Algo",sets:1}]};
LOGS.data=[logL];GACT.data=[actLor];
var dup=doneTodayBox();
ok("una sola línea, no dos",(dup.match(/class="di"/g)||[]).length===1,String((dup.match(/class="di"/g)||[]).length));

print("\n== Y su historial, en la tarjeta de Garmin ==");
LOGS.data=[];GACT.data=[actLor];
state.doneOpen=null;
var gv=gactView();
ok("la sesión de fuerza es desplegable",/data-act="doneopen"/.test(gv),"");
ok("plegada no enseña series",!/Barbell push press/.test(gv),"");
state.doneOpen="gact|24892129962";
ok("desplegada sí",/Barbell push press/.test(gactView()),"");
/* Una carrera no tiene series: ni desplegable ni botón. */
GACT.data=[{activity_id:7,start_time:"2026-11-01T09:00:00",type:"running",distance_km:8,duration_min:42,pace:"5:15"}];
ok("una carrera no se despliega",!/data-act="doneopen"/.test(gactView()),"");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
