var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,120)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];METRICS.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};
function act(id,f,km,min,hr){return {activity_id:id,start_time:f+"T09:00:00",type:"running",distance_km:km,duration_min:min,hr_avg:hr}}
print("\n== Marcas personales ==");
GACT.data=[];
for(var i=0;i<12;i++)GACT.data.push(act(i,"2019-0"+((i%9)+1)+"-10",10.02,58,150));
GACT.data.push(act(90,"2020-01-31",10.01,50.6,168));
GACT.data.push(act(91,"2020-11-01",21.10,114.4,166));
GACT.data.push(act(92,"2020-12-17",5.01,22.6,173));
var m=marcasCard();
ok("hay tarjeta",m.length>300,m.slice(0,60));
ok("el 10K coge el mejor, no el último",/0:50:36/.test(m),"");
ok("la media",/1:54:24/.test(m),"");
ok("el 5K",/0:22:36/.test(m),"");
ok("con el año de cada uno",(m.match(/>20\d\d</g)||[]).length>=3,"");
ok("y el total de carreras",/15 carreras desde|15 runs since/.test(m),m.slice(m.indexOf("snum"),m.indexOf("snum")+70));
print("\n== Por año ==");
ok("agrupa por año",/2019/.test(m)&&/2020/.test(m),"");
ok("con km y número de carreras",/km<\/span>/.test(m)&&/carreras<\/span>|runs<\/span>/.test(m),"");
ok("y el ritmo a 150 ppm",/\d:\d\d<\/span>/.test(m),"");
print("\n== Casos límite ==");
GACT.data=[act(1,"2026-01-01",5,30,150)];
ok("con menos de 10 carreras no se pinta",marcasCard()==="","");
GACT.data=[];for(var j=0;j<12;j++)GACT.data.push(act(j,"2026-0"+((j%9)+1)+"-10",3,20,150));
ok("sin ninguna en las distancias no se pinta",marcasCard()==="","");
print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
