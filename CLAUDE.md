# Fitmet — lo que hay que saber antes de tocar nada

App de salud y entrenamiento de una familia. PWA de un solo fichero
(`index.html`, ~340 KB, JS plano, sin build). Datos en Supabase.
**Este fichero se carga solo en cada sesión: aquí van las decisiones ya
tomadas, no el historial.** El historial está en `git log`, que sí explica el
porqué de cada cambio.

## Quién usa esto

| | |
|---|---|
| **Marcos** | **50** (9-abr-1976), **1,78 m**. Head of Data & Analytics. Entrena **por las mañanas**. |
| **Lorena** | 45, su mujer. Usuario `lorena`. |
| **Lorena Sofía** | 19, su hija. Usuario `sofia`. "Sofi". |

**"Lorena" a secas es la mujer.** La hija es siempre "Sofi" o "Lorena Sofía".

Sofía es perfil **solo running** (`rt.mode==="run"`): nada de comida ni peso.

## Reglas que ya se acordaron y no hay que volver a plantear

- **El lunes de Marcos es descanso y no se negocia.** Los lunes por la mañana
  tiene mucho trabajo y por la tarde no llega.
- **Las rutinas de fuerza de entre semana, máximo 45 minutos.**
- **No añadir un cuarto día de carrera.** Ya son seis días de entreno.
- **La app es multiidioma** y cada uno tiene su toggle 🇪🇸/🇬🇧. Que un texto
  salga en inglés no es un fallo: es su elección. Todo texto nuevo va en
  `B("es","en")`.
- **No mezclar este proyecto con el corpus de OneData**, que es trabajo.
- **Nunca versionar** `classify/`, `map.json`, cookies de MFP ni datos
  personales. El respaldo del corpus lo hace él con Time Capsule.

## Nutrición de Marcos

Objetivo **83 kg** desde 87 (ago-2026). La tendencia de 43 pesadas da
**−272 g/semana**, que es justo lo que hace falta para llegar el 15-nov: **no
hay que tocar las calorías**. El objetivo no es un número fijo, varía con la
carga del día: 1.555 en día suave, 1.800 en duro, 1.880 en día largo, con la
proteína siempre en 160 g. Media semanal 1.753. Está en `goal.macros`.

**Registra un 33% menos de lo que come** (2.465 reales contra 1.662
apuntados), que es la tasa habitual de subregistro. **El objetivo está
calibrado en esas mismas unidades**, así que funciona mientras siga apuntando
igual. Si algún día empieza a registrar con precisión, hay que recalibrarlo a
la vez o creerá que se ha pasado.

El gasto de Garmin (2.764) **sí es bueno**: coincide al 3% con Mifflin-St
Jeor × 1,55. Lo que nunca hay que hacer es restar el registrado del gasto: esa
diferencia de 1.100 kcal es ficción.

## Las carreras

**Ponle Freno 10K, 15-nov-2026.** Corren los tres. Objetivos: Marcos 55 min,
Lorena 58, Sofía sub-60. Marcos apunta además a la Mitja de Barcelona 2027.

Planes de 15 semanas desde el 4-ago-2026, **martes / jueves / domingo**.
El **test de 5 km del 4-oct** recalibra todos los ritmos.

| | Suave | Umbral | Series |
|---|---|---|---|
| Marcos | 7:45-8:15 | 6:20-6:40 | 5:50-6:10 |
| Lorena | 7:30-8:00 | 6:20-6:40 | 5:50-6:10 |
| Sofía | 8:00-8:30 | 6:45-7:05 | 5:50-6:10 |

Marcas reales: Marcos 10K 50:36 y media 1:54:26 (2020); Lorena 10K 52:56.
**Su eficiencia se hundió en 2024** (6:45 → 7:59 al pulso 150) y sigue plana.
Lorena se recuperó (6:49 en 2025), así que **ahora ella está mejor que él**.

## Hombro de Marcos

Artroscopia mayo-2024. Calcificación **resuelta**; Dra. Ana levantó la
restricción el **3-ago-2026**. Sigue vigente: agarre **neutro > supino >
prono estrecho**, RPE 6-7, dolor 0-1/10. Los tirones y el manguito son lo que
la pauta quiere que haga más.

## Cómo se toca el código

- Cambiar `index.html` obliga a subir **`APP_VERSION` y `CACHE` en `sw.js`**, o
  el móvil sirve la versión cacheada.
- **`tests/run.sh`** antes de cada commit. 25 suites, JavaScriptCore.
  Las que usan fixtures anclan `TODAY` y anulan `refrescaDia()`: sin eso el
  verde solo vale el día en que se grabó el fixture.
- Las sustituciones de texto sobre `index.html` **deben verificarse**
  (`assert s.count(v)==1`): un `replace` que no encuentra su objetivo no
  falla, y el cambio se pierde en silencio.

## Datos

`daily_metrics`, `workout_logs`, `garmin_activities` (con `raw.laps`),
`kv_state`. Claves de `kv_state`: `routine`, `race`, `goal`, `clinical`,
`baseline`, `daybrief`, `labs`, `lang`, `pushsub`, `weekorder`,
`habits:<día>`, `meal:<día>:<b|l|d|w|s>`, `done:<día>:<sid>`, `notif:<id>`.

Un día del plan de carrera es `{t:{es,en}, p:[[etiqueta, contenido], …]}`.
El título del plan manda sobre el de la plantilla **salvo en días de pesas**.

`getSession()` cae a la rutina integrada si `kv.routine` no define ese id, así
que una rutina personalizada puede traer solo lo que cambia.

## Herramientas (`~/corpus-tools`, repo aparte)

`fitmet_sync.sh` orquesta: `mfptool` · `garmintool` (`sync`, `push`,
`autolog`, `laps`, `--repair`) · `healthtool` · `balancetool` ·
`fitmet_export`. Además `garminplan.py` (lleva el plan al calendario del
reloj), `stravatool.py`, `weathertool.py`, `fitmet_notify.py`.

## Errores ya cometidos: no repetirlos

- **Riegel necesita un esfuerzo fuerte.** Proyectar desde un rodaje suave dio
  1:19 a Marcos y 1:27 a Sofi. Sin pulso alto, no se proyecta.
- **No concluir "no hay datos" sin preguntar dónde más los hay.** El histórico
  de Marcos estaba en Strava, no en Garmin.
- **`sleep_start_h` es cuando se duerme, no cuando se acuesta.** La hora de
  acostarse sale de cuándo dejan de contarse pasos.
- **Garmin `-2` en estrés es "en movimiento"**, no "entrenando". Pueden ser
  772 pasos limpiando.
- **Las rectas tienen dos usos**: dentro del calentamiento antes de calidad, y
  **al final de un rodaje suave**. Decir que "nunca van al final" es falso.
- **Nunca sobrescribir datos buenos con nulos** al sincronizar Garmin.
