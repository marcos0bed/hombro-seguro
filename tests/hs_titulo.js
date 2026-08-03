var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,140)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[];GACT.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};

var pasos=[["Calentamiento","10 min"],["Series","6 × 1 min"],["Enfriamiento","10 min"]];
var plan={};
plan["2026-08-11"]={t:{es:"Series 6 × 1 min",en:"Intervals 6 × 1 min"},p:pasos};
plan["2026-08-13"]=pasos;                      /* formato viejo: lista pelada */
plan["2026-08-14"]="texto suelto";             /* formato más viejo todavía */
W("race",{name:"Ponle Freno",date:"2026-11-15",km:10,goal_min:55,plan:plan});

print("\n== El nombre del día sale del plan ==");
ok("con título propio",planTitulo("2026-08-11")==="Series 6 × 1 min",planTitulo("2026-08-11"));
ok("y la ficha sigue saliendo",(planCard("2026-08-11").match(/class="sesr"/g)||[]).length===3,"");
ok("sin plan ese día, sin título",planTitulo("2026-08-12")===null,String(planTitulo("2026-08-12")));

print("\n== Los formatos viejos no se rompen ==");
ok("lista pelada: sin título",planTitulo("2026-08-13")===null,String(planTitulo("2026-08-13")));
ok("pero con ficha",(planCard("2026-08-13").match(/class="sesr"/g)||[]).length===3,"");
ok("texto suelto: sin título",planTitulo("2026-08-14")===null,"");
ok("y se pinta como párrafo",/texto suelto/.test(planCard("2026-08-14")),"");

print("\n== Un objeto sin pasos no revienta nada ==");
W("race",{name:"x",date:"2026-11-15",km:10,plan:{"2026-08-11":{t:{es:"Solo nombre",en:"Name only"}}}});
ok("título sí",planTitulo("2026-08-11")==="Solo nombre","");
ok("tarjeta no, porque no hay qué hacer",planCard("2026-08-11")==="","");

print("\n== Si ese día no se corre, el plan no manda ==");
W("race",{name:"x",date:"2026-11-15",km:10,plan:plan});
ok("una sesión de pesas conserva su nombre",planTitulo("2026-08-11",{type:"gym"})===null,String(planTitulo("2026-08-11",{type:"gym"})));
/* Un descanso sí lo coge: es donde aterriza una sesión movida con "Lo hice
   hoy". El veto es solo para las pesas, que tienen nombre propio. */
ok("un descanso sí, que es donde cae lo que se mueve",planTitulo("2026-08-11",{type:"rest"})==="Series 6 × 1 min","");
ok("y la de correr sí lo coge",planTitulo("2026-08-11",{type:"run"})==="Series 6 × 1 min","");
ok("sin decir qué sesión, se comporta como antes",planTitulo("2026-08-11")==="Series 6 × 1 min","");

print("\n== La fecha de cada posición de la semana ==");
var lun=fechaDeIdx(0),dom=fechaDeIdx(6);
ok("la posición 0 es lunes",new Date(lun+"T12:00:00").getDay()===1,lun);
ok("la 6 es domingo",new Date(dom+"T12:00:00").getDay()===0,dom);
ok("y van seguidas",(new Date(dom+"T12:00:00")-new Date(lun+"T12:00:00"))===6*86400000,"");

print("\n== La sesión de correr coge el nombre del día que se mira ==");
W("race",{name:"x",date:"2026-11-15",km:10,plan:plan});
var vRun=sessionView("run1","2026-08-11");
ok("no el título fijo, sino el del plan",/Series 6 × 1 min/.test(vRun),vRun.slice(0,120));
var vOtro=sessionView("run1","2026-08-12");
ok("un día sin plan conserva el suyo",!/Series 6 × 1 min/.test(vOtro),"");

print("\n== Sin plan de carrera ninguno ==");
W("race",null);
ok("no inventa títulos",planTitulo("2026-08-11")===null,"");


print("\n== Mover una sesión al día en que se hizo ==");
var hoy=iso(new Date()),man=iso(new Date(new Date().getTime()+86400000));
var pl={};pl[man]={t:{es:"Rodaje suave 25 min",en:"Easy run 25 min"},p:[["Rodaje","25 min"]]};
W("race",{name:"x",date:"2026-11-15",km:10,plan:pl});
ok("la ficha de mañana ofrece moverla",/data-act="planhoy"/.test(planCard(man)),"");
ok("la de hoy no, que ya es hoy",!/data-act="planhoy"/.test(planCard(hoy)),"");

var R=raceCfg(),pl2={};for(var k in R.plan)pl2[k]=R.plan[k];
var deHoy=pl2[hoy];pl2[hoy]=pl2[man];if(deHoy!==undefined)pl2[man]=deHoy;else delete pl2[man];
R.plan=pl2;W("race",R);
ok("tras moverla, hoy tiene la sesión",planTitulo(hoy)==="Rodaje suave 25 min",String(planTitulo(hoy)));
ok("y mañana se queda vacío",planTitulo(man)===null,String(planTitulo(man)));
ok("no se ha duplicado",Object.keys(raceCfg().plan).length===1,String(Object.keys(raceCfg().plan).length));

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
