var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,160)));if(!c)fails++}
function chain(){var o={};["from","select","eq","order","limit"].forEach(function(m){o[m]=function(){return o}});o.then=function(){return o};o.catch=function(){return o};return o}
sb={from:function(){return chain()}};sbUser={id:"u1"};LOGS.data=[];
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};

/* 45 días de referencia con NEAT 400: esa es su normalidad. */
var ROWS=[];
for(var i=45;i>0;i--){
  var d=new Date(); d.setDate(d.getDate()-i);
  ROWS.push({day:iso(d),kcal_active:400,kcal_bmr:2160,kcal_in:1700,protein_g:150,carbs_g:100,fat_g:70});
}
GACT.data=[];METRICS.data=ROWS;
W("goal",{macros:{prot:160,soft:{carb:60,fat:75},hard:{carb:110,fat:80},long:{carb:130,fat:80}}});

print("\n== La normalidad no da extra ==");
ok("con 45 días iguales, la base es 400",neatBase()===400,String(neatBase()));
ok("un día normal no suma nada",neatExtra({day:"x",kcal_active:400,kcal_bmr:2160})===0,"");
ok("moverse MENOS tampoco resta",neatExtra({day:"x",kcal_active:150,kcal_bmr:2160})===0,"");

print("\n== Un día de jardín sí ==");
ok("1000 de NEAT devuelve la mitad del exceso",neatExtra({day:"x",kcal_active:1000,kcal_bmr:2160})===300,String(neatExtra({day:"x",kcal_active:1000,kcal_bmr:2160})));
ok("y hay tope",neatExtra({day:"x",kcal_active:3000,kcal_bmr:2160})===400,String(neatExtra({day:"x",kcal_active:3000,kcal_bmr:2160})));

print("\n== El entreno no cuenta: ya está en el objetivo del día ==");
var D=iso(new Date());
GACT.data=[{activity_id:1,start_time:D+"T08:00:00",type:"running",calories:600,duration_min:36}];
var r={day:D,kcal_active:1000,kcal_bmr:2160};
/* 600 brutas menos 54 de basal durante los 36 min = 546 de entreno neto.
   NEAT real = 1000 - 546 = 454, apenas por encima de su normalidad. */
ok("correr no infla el presupuesto",neatExtra(r)===27,String(neatExtra(r)));
GACT.data=[{activity_id:2,start_time:D+"T08:00:00",type:"walking",calories:200,duration_min:60}];
ok("pero el paseo de los perros sí es NEAT",neatExtra(r)===300,String(neatExtra(r)));

print("\n== Se puede apagar y ajustar ==");
GACT.data=[];
W("goal",{neat:false,macros:{prot:160,soft:{carb:60,fat:75},hard:{carb:110,fat:80},long:{carb:130,fat:80}}});
ok("apagado, no suma",neatExtra({day:"x",kcal_active:1000,kcal_bmr:2160})===0,"");
W("goal",{neatShare:1,neatCap:1000,macros:{prot:160,soft:{carb:60,fat:75},hard:{carb:110,fat:80},long:{carb:130,fat:80}}});
ok("al 100% devuelve el exceso entero",neatExtra({day:"x",kcal_active:1000,kcal_bmr:2160})===600,String(neatExtra({day:"x",kcal_active:1000,kcal_bmr:2160})));

print("\n== Sin datos suficientes, no se inventa ==");
METRICS.data=ROWS.slice(0,5);
ok("con 5 días no hay base",neatBase()===null,String(neatBase()));
ok("y por tanto no hay extra",neatExtra({day:"x",kcal_active:1000,kcal_bmr:2160})===0,"");

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
