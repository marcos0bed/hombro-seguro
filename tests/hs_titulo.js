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
ok("un descanso también",planTitulo("2026-08-11",{type:"rest"})===null,"");
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

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
