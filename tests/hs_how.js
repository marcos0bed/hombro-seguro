var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,110)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[];
print("\n== El detalle de las carreras se ve sin tocar nada ==");
["run1","runEasy","runLong"].forEach(function(sid){
  var s=getSession(sid),abierto=true;
  s.items.forEach(function(it,i){
    var c=exCard(sid,i,it,i,s.items.length);
    if(it.how&&!/class="how open"/.test(c))abierto=false;
  });
  ok(sid+": todo desplegado",abierto,"");
});
print("\n== Y en pesas sigue plegado ==");
["upA","lowB","carga"].forEach(function(sid){
  var s=getSession(sid),plegado=true;
  s.items.forEach(function(it,i){
    if(/class="how open"/.test(exCard(sid,i,it,i,s.items.length)))plegado=false;
  });
  ok(sid+": el detalle está detrás del botón",plegado,"");
});
print("\n== El botón sigue estando en ambos ==");
ok("carrera",/data-act="how"/.test(exCard("run1",1,getSession("run1").items[1],1,4)),"");
ok("pesas",/data-act="how"/.test(exCard("upA",1,getSession("upA").items[1],1,5)),"");


print("\n== La vista de sesión pinta los bloques de carrera ==");
["run1","runEasy","runLong"].forEach(function(sid){
  var v=sessionView(sid), s=getSession(sid);
  ok(sid+": salen los "+s.items.length+" bloques",(v.match(/data-act="how"/g)||[]).length===s.items.length,
     String((v.match(/data-act="how"/g)||[]).length));
  ok(sid+": y el texto se lee sin tocar",/class="how open"/.test(v),"");
});
ok("sigue el botón de marcar hecho",/run-done/.test(sessionView("run1")),"");
ok("y los km",/6-9 km/.test(sessionView("run1")),"");
print("\n== El calentamiento y los ritmos están a la vista ==");
var v1=sessionView("run1");
ok("calentamiento",/Calentamiento|Warm-up/.test(v1),"");
ok("ritmos de las series",/5:50-6:10/.test(v1),"");
ok("y el racional NO está en la sesión, sino en Carrera",!/VO₂max/.test(v1),"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
