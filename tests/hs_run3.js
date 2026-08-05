var fails=0;
/* buscar por nombre, no por índice: quitar o meter un ejercicio no debe romper
   la prueba (misma fragilidad que tenía MGROUPS) */
function item(sid,txt){return (EX[sid].items||[]).filter(function(i){return T(i.n).indexOf(txt)>-1})[0]}
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,110)));if(!c)fails++}
print("\n== Las tres sesiones de carrera tienen contenido ==");
["run1","runEasy","runLong"].forEach(function(sid){
  var s=EX[sid];
  ok(sid+" tiene ejercicios",s.items&&s.items.length>0,String((s.items||[]).length));
  ok(sid+": todos con explicación",(s.items||[]).every(function(i){return i.how&&T(i.how).length>60}),"");
});
print("\n== La sesión NO lleva el racional del plan ==");
["run1","runEasy","runLong"].forEach(function(sid){
  var todo=(EX[sid].items||[]).map(function(i){return T(i.how)}).join(" ");
  ok(sid+": sin objetivo de sesión",!(EX[sid].items||[]).some(function(i){return /Objetivo de la sesión|What this session/.test(T(i.n))}),"");
  ok(sid+": sin la tabla de 15 semanas",!/Semanas 1-2|Weeks 1-2/.test(todo),"");
});
ok("remite a la tarjeta del día",/tarjeta de arriba|card above/.test(T(item("run1","Tus ritmos").how)),"");
ok("y dice para qué es cada ritmo",/Series cortas|Short reps/.test(T(item("run1","Tus ritmos").how))&&/umbral|threshold/i.test(T(item("run1","Tus ritmos").how)),"");

print("\n== El racional vive aparte y plegado ==");
var LS2={};var _W=W,_S=S;W=function(k,v){LS2[k]=v};S=function(k,d){return LS2[k]===undefined?d:LS2[k]};
var rc=racionalCard();
ok("se pinta",rc.length>150,rc.slice(0,60));
ok("empieza plegado",/aria-expanded="false"/.test(rc),"");
ok("y no enseña el cuerpo hasta abrirlo",!/VO₂max/.test(rc),"");
W("fold:racional",true);
var ab=racionalCard();
ok("al abrirlo aparece la fisiología",/VO₂max/.test(ab)&&/mitocondrial/.test(ab),"");
ok("y los tres bloques",/Semanas 1-4|Weeks 1-4/.test(ab),"");
ok("y la secuencia del peso",/déficit|deficit/.test(ab),"");
W=_W;S=_S;
print("\n== Con ritmos concretos ==");
var bloque=item("run1","Tus ritmos");
ok("calidad da ritmos de series y umbral",bloque&&/5:50-6:10/.test(T(bloque.how))&&/6:20-6:40/.test(T(bloque.how)),"");
ok("y avisa de que el objetivo sale del test",bloque&&/test de 5 km|5 km test/.test(T(bloque.how)),"");
var prog=item("runLong","Tirada progresiva");
ok("la larga da los tres tercios",prog&&/8:00-8:15/.test(T(prog.how))&&/6:50-7:10/.test(T(prog.how)),"");
var av=item("runLong","Avituallamiento");
ok("y avituallamiento a partir de 60 min",av&&/30-60 g/.test(T(av.how)),"");
var ci=item("runLong","En cinta");
ok("la cinta tiene su apartado",!!ci,"");
ok("con el 1 % de inclinación",ci&&/1 %/.test(T(ci.how)),"");
ok("y dice que el bloque final va fuera",ci&&/bloque final|final block/.test(T(ci.how)),"");
print("\n== La estructura del día de calidad ==");
var n=EX.run1.items.map(function(i){return T(i.n)});
ok("calentamiento, ritmos y enfriamiento",n.length===3,n.join(" | "));
var cal=item("run1","Calentamiento");
ok("el calentamiento avisa del riesgo con la pierna fría",cal&&/gemelos|calves/.test(T(cal.how)),"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));

print("\n== Correr no se hace con kilos ==");
var cRun=exCard("run1",0,{n:B("Calentamiento","Warm-up"),sets:1,reps:"10 min"},0,3);
ok("la sesión de carrera no pide peso",!/aria-label="Weight"/.test(cRun),cRun.slice(cRun.indexOf("setrow"),cRun.indexOf("setrow")+200));
ok("ni pone kg",!/>kg</.test(cRun)&&cRun.indexOf("kg</span>")<0,"");
ok("pero sí deja apuntar lo hecho",/aria-label="Reps"/.test(cRun),"");
var cGym=exCard("upA",0,{n:B("Press","Press"),sets:3,reps:"8-12"},0,3);
ok("la de pesas sigue pidiendo peso",/aria-label="Weight"/.test(cGym),"");


print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
