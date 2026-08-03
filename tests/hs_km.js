var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,140)));if(!c)fails++}
var ROWS=JSON.parse(readFile("/tmp/hs_bed.json"));
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}}; sbUser={id:"u1"};
state.dayRange=1; state.dayOff=0; LOGS.data=[]; METRICS.data=ROWS; TODAY=ROWS[ROWS.length-1].day;
var hoy=ROWS[ROWS.length-1];

print("\n== Los km junto a los pasos ==");
var h=dayCard();
ok("aparecen los km de hoy ("+hoy.distance_km+")",h.indexOf(hoy.distance_km.toFixed(1)+" km")>-1,"");
ok("y siguen estando los pasos",h.indexOf(hoy.steps.toLocaleString())>-1,"");
ok("van en la misma casilla que los pasos",
   /👣[^]{0,400}?km<\/span>/.test(h),"");
ok("en pequeño y apagado",/font-size:11px;color:var\(--mut\)[^>]*>· [\d.]+ km/.test(h),"");
ok("no tocan otras casillas",(h.match(/ km<\/span>/g)||[]).length===1,String((h.match(/ km<\/span>/g)||[]).length));

print("\n== Cuando no hay distancia no se inventa ==");
function sinKm(v){
  var c=ROWS.map(function(x){return JSON.parse(JSON.stringify(x))});
  c[c.length-1].distance_km=v; METRICS.data=c; return dayCard();
}
ok("null -> sin km",sinKm(null).indexOf(" km</span>")<0,"");
ok("0 -> sin km (no '0.0 km')",sinKm(0).indexOf(" km</span>")<0,"");
ok("pero los pasos siguen ahí",sinKm(null).indexOf(hoy.steps.toLocaleString())>-1,"");

print("\n== En vista de varios días da la media ==");
METRICS.data=ROWS; state.dayRange=7;
var h7=dayCard();
var m=/· ([\d.]+) km/.exec(h7);
ok("hay km en la vista de 7 días",!!m,h7.slice(0,60));
if(m){
  // misma ventana que usa la app: 7 días naturales hacia atrás desde hoy
  var lim=new Date(); lim.setDate(lim.getDate()-6); lim=iso(lim);
  var ult=ROWS.filter(function(r){return r.day>=lim&&r.distance_km!=null}).map(function(r){return +r.distance_km});
  var med=ult.reduce(function(a,b){return a+b},0)/ult.length;
  ok("y es la media real de esos días ("+med.toFixed(2)+")",Math.abs(+m[1]-med)<0.05,m[1]+" vs "+med.toFixed(2));
}
state.dayRange=1;
var threw=null; try{["hoy","rutina","semana","progreso"].forEach(function(x){state.tab=x;render()})}catch(e){threw=e}
ok("render() sin excepción",threw===null,threw?String(threw):"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
