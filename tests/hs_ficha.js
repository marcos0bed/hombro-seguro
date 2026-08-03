var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,120)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[];GACT.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};
var plan={};
plan["2026-08-11"]=[["Calentamiento","10 min · 7:45-8:15 + 4 rectas"],["Series","6 × 1 min · 5:50-6:10"],["Recuperación","90 s andando"],["Enfriamiento","10 min · 7:45-8:15"]];
plan["2026-08-13"]="texto suelto de toda la vida";
W("race",{name:"Ponle Freno",date:"2026-11-15",km:10,goal_min:55,plan:plan});

print("\n== La sesión se lee como ficha ==");
var c=planCard("2026-08-11");
ok("hay cuatro filas",(c.match(/class="sesr"/g)||[]).length===4,String((c.match(/class="sesr"/g)||[]).length));
ok("con etiqueta a la izquierda",(c.match(/class="sesl"/g)||[]).length===4,"");
ok("calentamiento",/Calentamiento/.test(c)&&/10 min · 7:45-8:15/.test(c),"");
ok("series con su ritmo",/6 × 1 min · 5:50-6:10/.test(c),"");
ok("recuperación aparte",/90 s andando/.test(c),"");
ok("y enfriamiento",/Enfriamiento/.test(c),"");
ok("dice la semana, contada desde el primer día del plan",/semana 1|week 1/.test(c),c.slice(c.indexOf("snum"),c.indexOf("snum")+50));
ok("sin párrafo corrido",!/<p style="font-size:15px/.test(c),"");

print("\n== Sigue tragando el formato viejo ==");
var v=planCard("2026-08-13");
ok("un texto suelto se pinta igual",/texto suelto/.test(v),"");
ok("como párrafo, no como filas",/<p style="font-size:15px/.test(v)&&!/class="sesr"/.test(v),"");

print("\n== Nada raro ==");
ok("día sin plan, sin tarjeta",planCard("2026-08-12")==="","");
W("race",{name:"x",date:"2026-11-15",km:10,plan:{"2026-08-11":[["Solo","una fila"]]}});
ok("una sola fila también vale",(planCard("2026-08-11").match(/class="sesr"/g)||[]).length===1,"");
W("race",{name:"x",date:"2026-11-15",km:10,plan:{"2026-08-11":[["a","b"],"suelto"]}});
ok("mezcla de filas y texto no revienta",planCard("2026-08-11").length>100,"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
