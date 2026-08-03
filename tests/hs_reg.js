var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,110)));if(!c)fails++}
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[];
["es","en"].forEach(function(L){
  LANG=L; var R=RULES[L];
  print("\n== Reglas en "+L+" ==");
  ok("existe la tarjeta de autorizados",!!R.ok&&R.ok.length>200,"");
  ok("la banca ya NO está prohibida",!/Banca plana con barra|Flat barbell bench press/.test(R.ban),"");
  ok("y SÍ está autorizada con condiciones",/banca con barra|Barbell bench press/i.test(R.ok),"");
  ok("con las tres condiciones",
     /escápulas juntas|shoulder blades squeezed/i.test(R.ok)&&/hombros abajo|shoulders down/i.test(R.ok)&&/hiperlordosis|hyperlordosis/i.test(R.ok),"");
  ok("colgarse sigue prohibido",/olgar|Hanging/.test(R.ban),"");
  ok("y ahora dice por qué (acromioclavicular)",/acromioclavicular|AC joint/.test(R.ban),"");
  ok("las laterales se matizan, no se levantan",/plano lateral puro|pure lateral plane/.test(R.ban),"");
  ok("y remiten a la abducción autorizada",/plano escapular|Scapular-plane/.test(R.ok),"");
  ["Press militar","Military press","Fondos","Dips","mentón","Upright rows"].forEach(function(t){
    if((L==="es")===(t==="Press militar"||t==="Fondos"||t==="mentón"))
      ok("sigue prohibido: "+t,R.ban.indexOf(t)>-1,"");
  });
});
print("\n== Se pinta en la pestaña ==");
LANG="es"; state.tab="reglas";
var threw=null,h="";
try{render(); h=document.getElementById("view").innerHTML||""}catch(e){threw=e}
ok("render sin excepción",threw===null,threw?String(threw):"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
