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

print("\n== Sin plan de carrera ninguno ==");
W("race",null);
ok("no inventa títulos",planTitulo("2026-08-11")===null,"");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
