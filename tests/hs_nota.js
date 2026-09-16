/* Guardar una sesión improvisada: ejercicios que no están en la rutina.
   Antes, el botón de guardar no hacía NADA si no había ninguna serie marcada
   (buildLog devolvía null y el handler tenía un `if` sin `else`). Marcos hizo
   tres ejercicios de hombro el 15-sep-2026, escribió la nota, le dio a guardar
   y no pasó nada: ni fila, ni aviso. */
var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,110)));if(!c)fails++}

var INS=[];
function chain(tbl){
  var o={};
  ["select","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"]
    .forEach(function(m){o[m]=function(){return o}});
  o.insert=function(row){INS.push({t:tbl,row:row});return o};
  o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};
  o.catch=function(){return o};
  return o;
}
sb={from:function(t){return chain(t)},auth:{signOut:function(){}}};
sbUser={id:"u1"};LOGS.data=[];METRICS.data=[];LANG="es";

var SID="upA", NK="note:"+TODAY+":"+SID;
function limpia(){W(NK,"");W(setsKey(SID),{});W("savedlog:"+TODAY+":"+SID,false);INS=[];
  document.getElementById("toast").textContent="";}
function wlogs(){return INS.filter(function(i){return i.t==="workout_logs"})}
function clic(act,sid){
  var b={dataset:{act:act,sid:sid},
         getAttribute:function(k){return k==="data-act"?act:(k==="data-sid"?sid:null)}};
  var err=null;
  try{document._h.click({target:{closest:function(){return b}}})}catch(e){err=e}
  return err;
}

print("\n== buildLog: la nota sola basta para tener fila ==");
limpia();
ok("sin series y sin nota no hay nada que guardar",buildLog(SID)===null,String(buildLog(SID)));
W(NK,"Lateral raise 5x10 con mancuernas de 10kg");
var row=buildLog(SID);
ok("sin series pero con nota sí sale fila",!!row,"");
ok("va sin ejercicios",!!row&&row.entries.length===0,row&&row.entries.length);
ok("0 series y 0 volumen",!!row&&row.total_sets===0&&row.est_volume===0,row&&row.total_sets+"/"+row.est_volume);
ok("conserva la nota entera",!!row&&row.note==="Lateral raise 5x10 con mancuernas de 10kg",row&&row.note);
ok("y lleva el título de la sesión",!!row&&!!row.title,"");
ok("sin músculo, así que no ensucia el mapa de carga",!!row&&!row.entries.some(function(e){return e.m}),"");

print("\n== El botón ya no falla en silencio ==");
limpia();
var e1=clic("savelog",SID);
ok("no revienta",e1===null,String(e1));
ok("avisa de que no hay nada que guardar",/Nada que guardar/.test(document.getElementById("toast").textContent),
   document.getElementById("toast").textContent);
ok("y no manda ninguna fila",wlogs().length===0,wlogs().length);
ok("ni se marca la sesión como guardada",S("savedlog:"+TODAY+":"+SID,false)===false,"");

print("\n== Con nota, guarda de verdad ==");
limpia();
W(NK,"Hice elevaciones laterales y frontales, no tocaba");
var e2=clic("savelog",SID);
ok("no revienta",e2===null,String(e2));
ok("sube una fila",wlogs().length===1,wlogs().length);
ok("con la nota dentro",wlogs().length===1&&wlogs()[0].row.note==="Hice elevaciones laterales y frontales, no tocaba",
   wlogs().length&&wlogs()[0].row.note);
ok("sin inventarse series",wlogs().length===1&&wlogs()[0].row.total_sets===0,"");
ok("y esta vez sin aviso",document.getElementById("toast").textContent==="",
   document.getElementById("toast").textContent);

print("\n== Lo de siempre sigue igual ==");
limpia();
var st={};st[1]=[true,true,true];   /* el índice 0 de upA es el calentamiento, sin series */
W(setsKey(SID),st);
var row3=buildLog(SID);
ok("con series marcadas monta la fila normal",!!row3&&row3.entries.length===1,row3&&row3.entries.length);
ok("y las cuenta",!!row3&&row3.total_sets===3,row3&&row3.total_sets);
ok("nota vacía queda a null",!!row3&&row3.note===null,row3&&row3.note);

print("\n"+(fails?"==> "+fails+" FALLOS":"==> TODO OK"));
