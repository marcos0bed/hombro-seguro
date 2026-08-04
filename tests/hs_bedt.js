var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,160)));if(!c)fails++}
var ROWS=JSON.parse(readFile("/tmp/hs_bed.json"));
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()},auth:{signOut:function(){}}}; sbUser={id:"u1"};
state.dayRange=1; state.dayOff=0; METRICS.data=ROWS; TODAY=ROWS[ROWS.length-1].day;

/* selDay() lee el reloj de verdad, no el TODAY que fija la suite. Mientras el
   fixture se capturó hoy las dos fechas coincidían y todo pasaba; al día
   siguiente la tarjeta buscaba datos de una fecha sin datos y fallaba todo.
   El verde solo valía el día que se grabó el fixture. */
selDay=function(){var d=new Date(TODAY+"T12:00:00");d.setDate(d.getDate()-(state.dayOff||0));return iso(d)};
/* refrescaDia() existe para poner TODAY al día real cuando la app lleva
   abierta desde ayer. En una suite anclada a un fixture es justo lo que no
   se quiere: cualquier render() intermedio desanclaba la fecha y las
   comprobaciones posteriores miraban un día sin datos. */
refrescaDia=function(){return false};

print("\n== Conversión de horas ==");
ok("23:45 de anoche -> -0,25",bedNorm(23.75)===-0.25,String(bedNorm(23.75)));
ok("-0,25 se escribe 23:45",bedFmt(-0.25)==="23:45",bedFmt(-0.25));
ok("0,93 -> 00:56",bedFmt(0.93)==="00:56",bedFmt(0.93));
ok("no genera :60",bedFmt(1.999)==="02:00",bedFmt(1.999));
ok("mediana de par",medianaDe([1,2,3,4])===2.5,String(medianaDe([1,2,3,4])));
ok("mediana de impar",medianaDe([5,1,3])===3,String(medianaDe([5,1,3])));
ok("mediana de vacío",medianaDe([])===null,"");

print("\n== Con sus datos reales ==");
var h=bedCard(), hoy=ROWS[ROWS.length-1];
ok("hay tarjeta",h.length>200,h.slice(0,80));
ok("tres columnas",(h.match(/class="macg"/g)||[]).length===3,"");
ok("dice acostarse Y dormirse",/acostaste|in bed/i.test(h)&&/dormiste|asleep/i.test(h),"");
ok("muestra la hora de dormirse real",h.indexOf(bedFmt(bedNorm(hoy.sleep_start_h)))>-1,"");
ok("enseña la referencia 'normal'",/bedm/.test(h)&&/normal/i.test(h),"");

print("\n== Distingue las dos causas, que es el punto ==");
function esc2(bed,onset,lat){
  var c=ROWS.map(function(x){return JSON.parse(JSON.stringify(x))});
  var u=c[c.length-1]; u.bed_h=bed; u.sleep_start_h=onset; u.sleep_lat_min=lat;
  METRICS.data=c; return bedCard();
}
var t1=esc2(2.5,3.2,42);      // se acostó a las 2:30
ok("acostado tardísimo -> culpa a la hora, no al sueño",/tarde/.test(t1)&&!/tardaste/i.test(t1.replace(/Tardaste/g,"")),t1.slice(t1.indexOf("macwarn"),t1.indexOf("macwarn")+150));
ok("y marca en rojo la hora de acostarse",/bedv bad">02:30/.test(t1),"");
var t2=esc2(23.75,1.58,110);  // se acostó a su hora y tardó 110 min
ok("a su hora pero 110 min -> culpa a la latencia",/110/.test(t2)&&/a tu hora|on time/i.test(t2),t2.slice(t2.indexOf("macwarn"),t2.indexOf("macwarn")+170));
ok("y marca en rojo la latencia, no la hora",/bedv bad">110 min/.test(t2)&&!/bedv bad">23:45/.test(t2),"");
var t3=esc2(23.5,0.1,22);     // noche normal
ok("noche normal -> sin aviso",!/macwarn/.test(t3),t3.slice(t3.indexOf("macwarn"),t3.indexOf("macwarn")+120));
ok("y va en verde",/bedv ok/.test(t3),"");

print("\n== Casos límite ==");
METRICS.data=ROWS.map(function(r){var c=JSON.parse(JSON.stringify(r));c.sleep_start_h=null;return c});
ok("sin hora de dormirse -> sin tarjeta",bedCard()==="","");
METRICS.data=ROWS.map(function(r){var c=JSON.parse(JSON.stringify(r));c.bed_h=null;c.sleep_lat_min=null;return c});
var sp=bedCard();
ok("sin proxy la tarjeta sigue saliendo",sp.length>200,"");
ok("pero no inventa hora de acostarse",/macl">Te acostaste<\/div><div class="bedv ">—/.test(sp.replace(/\s+/g," "))||sp.indexOf(">—<")>-1,"");
ok("ni avisa de nada",!/macwarn/.test(sp),"");
METRICS.data=[{day:TODAY,sleep_start_h:1.5,bed_h:23.5,sleep_lat_min:120}];
ok("con una sola noche no compara contra sí misma de forma rara",bedCard().length>200,"");
METRICS.data=ROWS; state.dayRange=7;
ok("en vista de varios días no aparece",bedCard()==="","");
state.dayRange=1;
var threw=null; try{["hoy","rutina","semana","progreso"].forEach(function(x){state.tab=x;render()})}catch(e){threw=e}
ok("render() sin excepción",threw===null,threw?String(threw):"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));

print("\n== Tardar en dormirse: solo alarma si de verdad costó sueño ==");
function noche(bed,on,lat,sh){
  var c=ROWS.map(function(x){return JSON.parse(JSON.stringify(x))});
  var u=c[c.length-1]; u.bed_h=bed; u.sleep_start_h=on; u.sleep_lat_min=lat; u.sleep_h=sh;
  METRICS.data=c; return bedCard();
}
var lento_ok=noche(23.0,0.07,64,6.7);
ok("tardó mucho pero durmió lo suyo -> lo dice",/Aun así dormiste/.test(lento_ok),lento_ok.slice(lento_ok.indexOf("macwarn"),lento_ok.indexOf("macwarn")+230));
ok("y no lo presenta como pérdida",!/lo pagaste/.test(lento_ok),"");
var lento_mal=noche(23.75,1.6,110,4.9);
ok("tardó mucho Y durmió poco -> sí lo señala",/lo pagaste/.test(lento_mal),lento_mal.slice(lento_mal.indexOf("macwarn"),lento_mal.indexOf("macwarn")+230));
ok("nombra las horas reales",/4\.9 h/.test(lento_mal),"");
var normal=noche(23.5,0.1,20,6.7);
ok("noche normal sigue sin aviso",!/macwarn/.test(normal),"");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
