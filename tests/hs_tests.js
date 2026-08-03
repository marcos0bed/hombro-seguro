/* Conteo de entreno de la semana. Ojo: la semana pasó a 3 carreras + 3 días de
   fuerza (upA lunes, lowB miércoles, carga sábado) el 3-ago-2026, así que el
   denominador es 2, no 4. */
var fails = 0;
function ok(n, c, x) { print((c ? "  ok   " : "  FAIL ") + n + (c ? "" : "   <<< " + (x || ""))); if (!c) fails++; }
sbUser = { id: "u1" };
function chain(){var o={};["from","select","insert","upsert","update","delete","eq","gte","lte","order","limit","maybeSingle","single","in","neq"].forEach(function(m){o[m]=function(){return o}});o.then=function(r){try{r&&r({data:[],error:null})}catch(e){}return o};o.catch=function(){return o};return o}
sb = sb || { from: function(){return chain()}, auth: { signOut: function(){} } };
state.dayRange = 1; state.dayOff = 0;
var lun = mondayOf(TODAY);
function d(i){ var x = new Date(lun + "T12:00:00"); x.setDate(x.getDate() + i); return iso(x) }
function ent(n){ return [{ n: "x", m: "legs", sets: n }] }
function fila(h, et){ var i = h.indexOf(et); return i < 0 ? null : h.slice(i, i + 260) }

METRICS.data = [{ day: d(0), kcal_in: 1904, protein_g: 147 }];

print("\n== EL CASO REAL: entrenó 4 días, pero con los identificadores viejos ==");
LOGS.data = [
  { day: d(1), session_id: "lowerA",   title: "Lower A + Core", total_sets: 22, entries: ent(22) },
  { day: d(2), session_id: "upperB",   title: "Upper B",        total_sets: 24, entries: ent(24) },
  { day: d(2), session_id: "manguito", title: "Manguito",       total_sets: 9,  entries: ent(9) },
  { day: d(3), session_id: "lowerA",   title: "Lower A + Core", total_sets: 18, entries: ent(18) },
  { day: d(5), session_id: "upB",      title: "Upper B",        total_sets: 20, entries: ent(20) },
  { day: d(5), session_id: "manguito", title: "Manguito",       total_sets: 9,  entries: ent(9) }
];
var t = fila(weekPaceCard(), "Entreno") || fila(weekPaceCard(), "Training");
ok("cuenta las 4 que hizo sobre las 2 previstas", t && t.indexOf(">4/3</b>") > -1, t);
ok("y dice que va al día", t && /al día|on track/.test(t), t);
ok("no nombra nada como pendiente", t && !/falta|missing/.test(t), t);

print("\n== El manguito no cuenta como sesión ==");
LOGS.data = [
  { day: d(1), session_id: "manguito", title: "Manguito", total_sets: 9, entries: ent(9) },
  { day: d(2), session_id: "manguito", title: "Manguito", total_sets: 9, entries: ent(9) }
];
t = fila(weekPaceCard(), "Entreno") || fila(weekPaceCard(), "Training");
ok("solo manguito -> 0 sesiones", t && t.indexOf(">0/3</b>") > -1, t);

print("\n== Sí nombra lo que falta cuando de verdad falta ==");
LOGS.data = [
  { day: d(1), session_id: "lowA", title: "Lower A", total_sets: 15, entries: ent(15) },
  { day: d(2), session_id: "upA",  title: "Upper A", total_sets: 16, entries: ent(16) }
];
t = fila(weekPaceCard(), "Entreno") || fila(weekPaceCard(), "Training");
ok("2 de 3", t && t.indexOf(">2/3</b>") > -1, t);
ok("y nombra la que falta", t && /falta|missing/.test(t), t);

print("\n== Con una sola sesión sí nombra la que falta ==");
LOGS.data = [{ day: d(2), session_id: "upA", title: "Upper A", total_sets: 16, entries: ent(16) }];
t = fila(weekPaceCard(), "Entreno") || fila(weekPaceCard(), "Training");
ok("1 de 3", t && t.indexOf(">1/3</b>") > -1, t);
ok("nombra la que falta", t && /falta|missing/.test(t), t);
ok("y es la Carga del sábado", t && /Carga|Load/.test(t), t);

print("\n== Hacer una sesión en otro día NO se penaliza ==");
LOGS.data = [
  { day: d(0), session_id: "lowA", title: "Lower A", total_sets: 15, entries: ent(15) },
  { day: d(3), session_id: "upA",  title: "Upper A", total_sets: 16, entries: ent(16) },
  { day: d(4), session_id: "lowB", title: "Lower B", total_sets: 18, entries: ent(18) },
  { day: d(5), session_id: "upB",  title: "Upper B", total_sets: 19, entries: ent(19) }
];
t = fila(weekPaceCard(), "Entreno") || fila(weekPaceCard(), "Training");
ok("cuenta los 4 días aunque no coincidan con los previstos", t && t.indexOf(">4/3</b>") > -1 && /al día|on track/.test(t), t);

print("\n== Dos sesiones el mismo día cuentan como un día ==");
LOGS.data = [
  { day: d(1), session_id: "lowA", title: "Lower A", total_sets: 15, entries: ent(15) },
  { day: d(1), session_id: "upA",  title: "Upper A", total_sets: 16, entries: ent(16) }
];
t = fila(weekPaceCard(), "Entreno") || fila(weekPaceCard(), "Training");
ok("1 día = 1 sesión contada", t && t.indexOf(">1/3</b>") > -1, t);

print("\n== Nada se rompe ==");
var threw = null;
try { ["hoy","rutina","semana","progreso"].forEach(function (x) { state.tab = x; render() }) } catch (e) { threw = e }
ok("render() sin excepción", threw === null, threw ? String(threw) : "");

print("\n" + (fails ? "==> " + fails + " FALLOS" : "==> TODO OK"));
