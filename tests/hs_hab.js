var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"")));if(!c)fails++}
print("\n== El interruptor de enfermo ==");
var ks=HABITS.map(function(h){return h.k});
ok("existe el hábito 'malo'",ks.indexOf("malo")>-1,ks.join(","));
ok("va el primero, donde se ve",ks[0]==="malo",ks[0]);
ok("no ha desaparecido ninguno",ks.length===11,String(ks.length));
["ayuno","cafe","supl","alc","fuera","sau","ir","viaje","madr","wk"].forEach(function(k){
  ok("sigue "+k,ks.indexOf(k)>-1,"");
});
var threw=null; try{["hoy","semana","progreso"].forEach(function(t){state.tab=t;render()})}catch(e){threw=e}
ok("render sin excepción",threw===null,threw?String(threw):"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
