var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,110)));if(!c)fails++}
print("\n== Las tres sesiones de carrera tienen contenido ==");
["run1","runEasy","runLong"].forEach(function(sid){
  var s=EX[sid];
  ok(sid+" tiene ejercicios",s.items&&s.items.length>0,String((s.items||[]).length));
  ok(sid+": todos con explicación",(s.items||[]).every(function(i){return i.how&&T(i.how).length>60}),"");
});
print("\n== Y dicen para qué sirven ==");
["run1","runLong"].forEach(function(sid){
  ok(sid+" abre con el objetivo",/Objetivo|What this session/.test(T(EX[sid].items[0].n)),T(EX[sid].items[0].n));
});
ok("calidad explica la fisiología",/VO₂max/.test(T(EX.run1.items[0].how))&&/lactato/.test(T(EX.run1.items[0].how)),"");
ok("la larga explica por qué suave",/mitocondrial/.test(T(EX.runLong.items[0].how))&&/TIEMPO/.test(T(EX.runLong.items[0].how)),"");
ok("y por qué cae tras el día de carga",/cansadas|tired legs/.test(T(EX.runLong.items[0].how)),"");
print("\n== Con ritmos concretos ==");
ok("calidad da ritmos de series y umbral",/5:50-6:10/.test(T(EX.run1.items[2].how))&&/6:20-6:40/.test(T(EX.run1.items[2].how)),"");
ok("y avisa de que se recalibran con el test",/test de 5 km|5 km test/.test(T(EX.run1.items[2].how)),"");
ok("la larga da los tres tercios",/8:00-8:15/.test(T(EX.runLong.items[1].how))&&/6:50-7:10/.test(T(EX.runLong.items[1].how)),"");
ok("y avituallamiento a partir de 60 min",/30-60 g/.test(T(EX.runLong.items[2].how)),"");
print("\n== La estructura del día de calidad ==");
var n=EX.run1.items.map(function(i){return T(i.n)});
ok("objetivo, calentamiento, bloque y enfriamiento",n.length===4,n.join(" | "));
ok("el calentamiento avisa del riesgo con la pierna fría",/gemelos|calves/.test(T(EX.run1.items[1].how)),"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
