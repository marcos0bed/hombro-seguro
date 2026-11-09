var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,160)));if(!c)fails++}
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};
var hoy=iso(new Date());

print("\n== El mapa de carga no se come las entradas sin grupo ==");
LOGS.data=[{day:hoy,session_id:"x",title:"T",entries:[
  {n:"Elevación lateral con mancuernas",sets:4,m:"shoulders"},
  {n:"Jalón al pecho, agarre neutro estrecho",sets:4},        /* sin m */
  {n:"Curl martillo",sets:3},                                  /* sin m */
  {n:"Aperturas posteriores con mancuernas",sets:4}            /* sin m */
]}];
var m=muscleSets(30);
ok("la que trae m sigue contando",m.shoulders>=4,JSON.stringify(m));
ok("el jalón sin m cuenta como espalda",m.back>=4,JSON.stringify(m));
ok("el curl martillo sin m cuenta como bíceps",m.biceps>=3,JSON.stringify(m));
ok("las aperturas sin m suman a hombro",m.shoulders>=8,JSON.stringify(m));

print("\n== Un nombre que no se reconoce no inventa grupo ==");
LOGS.data=[{day:hoy,session_id:"x",title:"T",entries:[{n:"Ejercicio rarísimo",sets:5}]}];
var m2=muscleSets(30);
ok("no aparece de la nada",Object.keys(m2).length===0,JSON.stringify(m2));

print("\n== Y sin series no cuenta aunque tenga nombre ==");
LOGS.data=[{day:hoy,session_id:"x",title:"T",entries:[{n:"Curl martillo",sets:0}]}];
ok("sets 0 se ignora",Object.keys(muscleSets(30)).length===0,"");

print("\n== El crédito secundario no se duplica contra el grupo deducido ==");
LOGS.data=[{day:hoy,session_id:"x",title:"T",entries:[{n:"Sentadilla con barra",sets:4}]}];
var m3=muscleSets(30);
ok("la sentadilla sin m cuenta como pierna",m3.legs>=4,JSON.stringify(m3));
ok("y el core recibe solo el crédito secundario",!m3.core||m3.core<4,JSON.stringify(m3));

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
