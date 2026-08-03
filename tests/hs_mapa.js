var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,120)));if(!c)fails++}
print("\n== Ningún mapa descuadrado puede mentir ==");
Object.keys(EX).forEach(function(sid){
  var s=EX[sid],m=MGROUPS[sid];
  if(!s||!s.items||!m)return;
  if(m.length!==s.items.length)
    ok(sid+": mapa de "+m.length+" para "+s.items.length+" ejercicios -> se ignora",mapaDe(sid)===null,String(mapaDe(sid)));
  else ok(sid+": mapa alineado, se usa",mapaDe(sid)===m,"");
});
print("\n== Los grupos que salen son correctos ==");
var esperado={
 gomasA:["legs","cuff","chest","back","legs","legs","chest","core","cuff"],
 gomasB:["cuff","legs","chest","back","legs","legs","triceps","biceps","core"],
 upB:[null,"chest","back","back","cuff","biceps","back","cuff"]
};
Object.keys(esperado).forEach(function(sid){
  var g=EX[sid].items.map(function(it,i){return muscleOf(sid,i,it)});
  ok(sid+" bien clasificado",JSON.stringify(g)===JSON.stringify(esperado[sid]),JSON.stringify(g));
});
print("\n== La carrera ya no vive dentro de una sesión de pesas ==");
var cardio=[];
Object.keys(EX).forEach(function(sid){
  var s=EX[sid];if(!s.items||s.type!=="gym")return;
  s.items.forEach(function(it,i){if(muscleOf(sid,i,it)==="cardio")cardio.push(sid+"["+i+"]")});
});
ok("ninguna sesión de gimnasio lleva cardio dentro",cardio.length===0,cardio.join(","));
ok("upB tiene 8 ejercicios",EX.upB.items.length===8,String(EX.upB.items.length));
ok("y ya no se llama día doble",!/día doble|double day/.test(JSON.stringify(EX.upB.sub||"")),JSON.stringify(EX.upB.sub));
print("\n== La constante de la carrera no pisa el ejercicio ==");
ok("PCT_SUAVE es un número",typeof PCT_SUAVE==="number"&&PCT_SUAVE===0.82,String(PCT_SUAVE));
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
