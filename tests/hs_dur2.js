var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"")));if(!c)fails++}
function dur(sid){
  var s=EX[sid],ser=0,extra=0;
  s.items.forEach(function(it,i){
    var m=muscleOf(sid,i,it);
    if(!it.sets){extra+=/manguito/i.test(T(it.n))?12:(/Calentamiento|Warm/i.test(T(it.n))?8:0);return}
    ser+=it.sets*(m==="legs"?2.5:2);
  });
  return Math.round(ser+extra);
}
print("\n== Las de entre semana caben en 45 minutos ==");
["upA","lowB"].forEach(function(sid){ok(sid+" dura ~"+dur(sid)+" min",dur(sid)<=45,String(dur(sid)))});
ok("el sábado puede pasarse (es el día de carga)",dur("carga")>45,String(dur("carga")));
print("\n== Sin perder lo esencial ==");
ok("upA conserva el empuje inclinado",EX.upA.items.some(function(i){return /Press inclinado/.test(T(i.n))}),"");
ok("y la tracción horizontal",EX.upA.items.some(function(i){return /Remo/.test(T(i.n))}),"");
ok("el manguito sale de upA: es sesión aparte",!EX.upA.items.some(function(i){return /manguito/i.test(T(i.n))}),"");
ok("lowB conserva bisagra, unilateral y ambos muslos",
   ["Hip thrust","Zancadas","Extensión","Curl femoral"].every(function(n){return EX.lowB.items.some(function(i){return T(i.n).indexOf(n)>-1})}),"");
print("\n== El sábado pasa a recarga ==");
ok("carga es día de recarga",loadOf("carga")==="long",loadOf("carga"));
ok("y eso son 130 g de carbos",MACROS[loadOf("carga")].carb===130,String(MACROS[loadOf("carga")].carb));
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
