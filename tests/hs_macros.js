var W=getWeek(), dias=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
function kc(g){return Math.round(g.prot*4+g.carb*4+g.fat*9)}
print("  día  sesión      carga   prot  carb  grasa   kcal");
var tot=0,tc=0;
W.forEach(function(w,i){
  var l=loadOf(w.sid), g=MACROS[l];
  var k=kc({prot:MACROS.prot,carb:g.carb,fat:g.fat});
  tot+=k; tc+=g.carb;
  print("  "+dias[i]+"  "+(w.sid+"          ").slice(0,11)+" "+(l+"     ").slice(0,6)+"  "+
        MACROS.prot+"   "+("  "+g.carb).slice(-3)+"   "+("  "+g.fat).slice(-3)+"   "+k);
});
print("\n  SEMANA: "+tot+" kcal · "+tc+" g de carbos · "+(MACROS.prot*7)+" g de proteína");
print("  media diaria: "+Math.round(tot/7)+" kcal");
