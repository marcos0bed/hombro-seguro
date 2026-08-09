var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,160)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};
W("race",{name:"x",date:"2026-11-15",km:10,hr_max:195,plan:{}});
function dias(n){var d=new Date();d.setDate(d.getDate()-n);return iso(d)+"T09:00:00"}
function run(id,hace,min,hr){return {activity_id:id,start_time:dias(hace),type:"running",distance_km:min/8,duration_min:min,hr_avg:hr}}

print("\n== La unidad de carga ==");
ok("40 min a 146 ppm pesa lo esperado",Math.abs(cargaDe({duration_min:40,hr_avg:146,type:"running"})-40*Math.pow(146/195,2))<0.01,"");
ok("andar no cuenta",cargaDe({duration_min:60,hr_avg:120,type:"walking"})===0,"");
ok("la fuerza sí",cargaDe({duration_min:40,hr_avg:110,type:"strength_training"})>0,"");
ok("sin pulso, cero",cargaDe({duration_min:40,type:"running"})===0,"");

print("\n== Semana igual al mes: ratio 1 ==");
/* misma sesión cada 3-4 días durante 4 semanas */
GACT.data=[run(1,2,40,150),run(2,5,40,150),run(3,9,40,150),run(4,12,40,150),
           run(5,16,40,150),run(6,19,40,150),run(7,23,40,150),run(8,26,40,150)];
var c=cargaCard();
ok("hay tarjeta",/Carga de entrenamiento|Training load/.test(c),c.slice(0,90));
var m=c.match(/<b[^>]*>([\d.]+)<\/b>/);
ok("ratio cerca de 1",m&&Math.abs(+m[1]-1)<0.2,m&&m[1]);
ok("zona buena",/Zona buena|Sweet spot/.test(c),"");

print("\n== Semana desbocada: avisa ==");
GACT.data=[run(1,1,60,165),run(2,2,60,165),run(3,3,60,165),run(4,4,60,165),run(5,6,60,165),
           run(6,12,30,145),run(7,19,30,145),run(8,26,30,145)];
var c2=cargaCard();
var m2=c2.match(/<b[^>]*>([\d.]+)<\/b>/);
ok("ratio alto",m2&&+m2[1]>1.5,m2&&m2[1]);
ok("dice FRENA",/FRENA|BRAKE/.test(c2),"");

print("\n== Sin historia no se inventa ==");
GACT.data=[run(1,1,40,150),run(2,3,40,150)];
ok("con dos sesiones no hay tarjeta",cargaCard()==="","");
GACT.data=[];
ok("vacío tampoco",cargaCard()==="","");

print("\n== La eficiencia lleva las referencias ==");
W("race",{name:"x",date:"2026-11-15",km:10,hr_max:195,plan:{},
  base:{day:"2026-08-04",ef_s:421,meta_ef_s:398,slope:-3.1}});
/* doce rodajes repartidos en ~6 semanas: run(id, hace, min, fc) */
GACT.data=[];
for(var i=0;i<12;i++)GACT.data.push(run(100+i,3+i*4,42,148));
var e=efficiencyCard();
ok("salida marcada",/salida|start/.test(e),"");
ok("meta marcada",/meta 6:38|goal 6:38/.test(e),"");
ok("y el 'toca hoy'",/toca|due/.test(e),"");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
