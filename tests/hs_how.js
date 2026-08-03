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
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
