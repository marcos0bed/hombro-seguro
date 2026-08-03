var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,120)));if(!c)fails++}
var s=getSession("manguito");
print("\n== La sesión de manguito ==");
ok("existe y tiene 6 ejercicios",s&&s.items.length===6,s?String(s.items.length):"no existe");
var noms=s.items.map(function(i){return T(i.n)});
["Estiramiento capsular","Rotación externa","Rotación interna","Remo con banda","Abducción en plano escapular","Protracción tumbado"].forEach(function(n){
  ok("incluye "+n,noms.some(function(x){return x.indexOf(n)>-1}),noms.join(" | "));
});
ok("los pull-aparts ya no están",!noms.some(function(x){return /pull-apart/i.test(x)}),noms.join(" | "));
print("\n== Los límites de seguridad están escritos donde se leen ==");
var ab=s.items.filter(function(i){return T(i.n).indexOf("Abducción")>-1})[0];
ok("la abducción avisa de los 30°",/30°/.test(T(ab.how)),"");
ok("y de no pasar la horizontal",/horizontal/.test(T(ab.how)),"");
var pr=s.items.filter(function(i){return T(i.n).indexOf("Protracción")>-1})[0];
ok("la protracción dice que sustituye a colgarse",/colgar/.test(T(pr.how)),"");
print("\n== Cada ejercicio queda bien clasificado por músculo ==");
s.items.forEach(function(i,idx){
  var m=muscleOf("manguito",idx,i);
  if(i.stretch){ ok(T(i.n)+" es estiramiento, no cuenta volumen", m===null||m===undefined, String(m)); return }
  ok(T(i.n)+" -> "+m, !!m && ["cuff","back","shoulders","chest"].indexOf(m)>-1, String(m));
});
print("\n== Nada se rompe ==");
var threw=null;
try{["hoy","rutina","semana","progreso","manguito"].forEach(function(x){state.tab=x;render()})}catch(e){threw=e}
ok("render sin excepción",threw===null,threw?String(threw):"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
