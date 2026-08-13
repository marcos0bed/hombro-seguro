var fails=0;
function ok(n,c,x){print((c?"  ok   ":"  FAIL ")+n+(c?"":"   <<< "+String(x||"").slice(0,140)));if(!c)fails++}
var LS={};W=function(k,v){LS[k]=v};S=function(k,d){return LS[k]===undefined?d:LS[k]};

print("\n== exId: id estable a partir del nombre en español ==");
ok("curl con barra",exId({n:{es:"Curl con barra",en:"Barbell curl"}})==="curl-con-barra","");
ok("acentos y paréntesis fuera",exId({n:{es:"Tríceps en polea (cuerda)",en:"x"}})==="triceps-en-polea-cuerda","");
ok("mismo nombre, mismo id sin importar el orden",exId(EX.upA.items[4])===exId({n:{es:"Curl con barra"}}),"");

print("\n== getW: si no hay nada bajo el id, recupera lo que hubiera bajo el índice actual ==");
LS={};
W("w:upA:2","32.5");   // como si "remo en polea sentado" (índice 2) tuviera peso guardado a la vieja usanza
var it=EX.upA.items[2];
ok("el nombre en ese índice es el esperado",it.n.en==="Seated cable row",it.n.en);
ok("getW recupera el peso viejo",getW("upA",2,it)==="32.5",getW("upA",2,it));
ok("y lo deja ya escrito bajo el id nuevo",S(wKey("upA",it),null)==="32.5","");

print("\n== getW: una vez migrado, un cambio futuro de índice ya no lo puede volver a romper ==");
LS={};
W("w:upA:2","32.5");
getW("upA",2,it);                      // primera lectura: migra
ok("sigue devolviendo lo mismo aunque cambie el índice",getW("upA",9,it)==="32.5",getW("upA",9,it));

print("\n== getW: si ya hay algo bajo el id nuevo, el índice viejo no lo pisa ==");
LS={};
W("w:upA:2","32.5");
W(wKey("upA",it),"40");
ok("gana lo que ya está bajo el id",getW("upA",2,it)==="40",getW("upA",2,it));

print("\n== nSets: mismo mecanismo para el número de series ==");
LS={};
W("nsets:lowA:1","5");
var itS=EX.lowA.items[1];
ok("recupera el valor viejo",nSets("lowA",1,itS)===5,nSets("lowA",1,itS));
ok("y lo deja bajo el id",S(nsKey("lowA",itS),null)==="5",S(nsKey("lowA",itS),null));

print(fails?("\n"+fails+" FALLOS"):"\nTODO OK");
