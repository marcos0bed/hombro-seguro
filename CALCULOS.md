# Fitmet — todos los cálculos, con fórmula exacta

Referencia técnica de **todo lo que la app (y el pipeline que la alimenta) calculan**.
Objetivo: no tener que releer `index.html` ni los scripts de `~/corpus-tools` cada vez
que alguien pregunta "¿cómo sale este número?". Si un cálculo cambia, actualiza esta
página en el mismo commit — si no, vuelve a mentir.

Estado: revisado a fondo el 2026-08-26 sobre `index.html` (`APP_VERSION` ~v203) y
`~/corpus-tools` en su estado de esa fecha. Las **líneas** citadas son orientativas
(el fichero crece); los **nombres de función** son el ancla estable — búscalos con
`grep -n "function nombre" index.html`.

Convención de fuentes: **[APP]** = calculado en `index.html` (cliente); **[PIPE]** =
calculado en `~/corpus-tools` (servidor/cron) antes de llegar a `daily_metrics`;
**[EXTERNO]** = dato que llega ya calculado de Garmin/MyFitnessPal, la app solo lo
lee y presenta.

---

## 0. Mapa rápido — qué calcula quién

| Bloque | Dónde vive el cálculo | Fichero |
|---|---|---|
| NEAT extra (bonus de macros por moverte más) | **[APP]** | `index.html`: `neatBase`, `neatDe`, `neatExtra` |
| Objetivo de macros (kcal/proteína/carbos/grasa del día) | **[APP]** | `index.html`: `macroGoal`, `macroCard`, tabla `MACROS` |
| BMR / gasto energético total (`kcal_bmr`, `kcal_out`) | **[EXTERNO]** (Garmin) | ninguno — la app nunca calcula BMR |
| Déficit calórico semanal | **[APP]** | `index.html`: `weekCardFor` |
| Predicción de marca (Riegel) | **[APP]** | `index.html`: `riegel` |
| Eficiencia de carrera (ritmo equivalente a 150 ppm) | **[APP]** | `index.html`: `efSlope`, `efDe`, `efficiencyCard`, `trayectoriaCard` |
| Corrección de ritmo por temperatura | **[APP]** | `index.html`: `paceCorr` |
| Marcas personales (PB) por distancia | **[APP]** | `index.html`: `marcasCard` |
| Adherencia al plan de carrera | **[APP]** | `index.html`: `adherenceCard`, `progresionCard` |
| Volumen semanal de carrera (regla del 10%) | **[APP]** | `index.html`: `volumeCard` |
| Reparto por zonas de FC | **[APP]** | `index.html`: `intensityCard` |
| Hora de irse a la cama (proxy desde pasos) | **[PIPE]** | `balancetool.py`: bloque de `bed_h`/`sleep_lat_min` |
| Hora de "ponerse a dormir" real (`sleep_try_h`) | **[PIPE]** | `balancetool.py`: `journal_bed`, `bed_tap` |
| Comparación de hora de acostarse/latencia contra tu normalidad | **[APP]** | `index.html`: `bedCard`, `medianaDe` |
| Curva de estrés en cubos de 30 min | **[PIPE]** | `balancetool.py`: bloque `stress_curve`/`rest_win` |
| Presentación/coloreado de la curva de estrés | **[APP]** | `index.html`: `stressDayCard`, `sColor` |
| Detección de viaje (cambio de huso horario) | **[PIPE]** | `balancetool.py`: campo `travel` |
| Volumen de una sesión de pesas (series×reps×peso) | **[APP]** | `index.html`: `buildLog` |
| Grupo muscular de cada ejercicio | **[APP]** | `index.html`: `muscleOf`, `guessMuscle`, `mapaDe` |
| Semáforo de dolor de hombro | **[APP]** | `index.html`: `painBlock` (solo mensajes fijos, sin fórmula) |
| Split proteína batido vs comida (MFP "snacks") | **[PIPE]** | `balancetool.py`/`fitmet_query.py`: densidad proteína/kcal |
| Notificación con frase sobre la sesión | **[PIPE]** | `fitmet_notify.py`: `resumen`, `frase` |
| Logros del día (👣😴🪜🔥) | **[APP]** | `index.html`: `achCard` |
| Rachas / streaks | **no existe** | ningún sitio calcula racha; ver §7 |

---

## 1. Nutrición y balance energético **[APP]**

No hay ningún Mifflin-St Jeor, Harris-Benedict ni BMR calculado a partir de peso/altura/edad
en la app. `kcal_bmr`, `kcal_active`, `kcal_out` llegan **ya calculados por Garmin**; la
app solo los lee, compara y presenta.

### 1.1 `neatDe(r)` — NEAT del día, descontando entrenos

```
ej = 0
para cada actividad de Garmin de ese día que NO sea "walking":
    basal = kcal_bmr / 1440 * duración_min          # parte basal que igualmente se habría gastado
    ej += max(0, calorías_actividad - basal)          # gasto NETO del entreno
devuelve kcal_active - ej
```

Los paseos (`type==="walking"`) **nunca se descuentan** — cuentan como NEAT igual que subir
escaleras o hacer la compra. Sin `kcal_active` → `null`.

### 1.2 `neatBase()` — tu "normalidad" de movimiento

```
si goal.neatBase está fijado manualmente → se usa ese valor, fin
si no:
    v = neatDe(r) de los ÚLTIMOS 45 REGISTROS de daily_metrics (no 45 días de calendario,
        45 filas — si faltan días, la ventana efectiva es más ancha), descartando null/≤0
    si v.length < 10 → null (no se inventa una base con pocos datos)
    ordena v ascendente, devuelve v[floor(len/2)]   # mediana simple, sin promediar en longitud par
```

### 1.3 `neatExtra(r)` — el bonus que se ve en la tarjeta de macros

```
si goal.neat === false → 0                      # interruptor de apagado
b = neatBase(); n = neatDe(r)
si b o n son null → 0
share = goal.neatShare ?? 0.5                    # por defecto, la mitad del exceso
cap   = goal.neatCap   ?? 400                    # tope 400 kcal
devuelve max(0, min(cap, round((n - b) * share)))
```

- Nunca resta (si `n<=b`, extra = 0).
- Es un extra de **kcal totales**, no reparte gramos de proteína/carbo/grasa.
- Por qué la mitad y no el 100%: dar el 100% "convierte moverse más en comer más y borra el
  déficit" (comentario del propio código).
- Ejemplos reales (de `tests/hs_neat.js`): base 400, `kcal_active=1000` sin entrenos →
  exceso 600 → extra = 300. Con `kcal_active=3000` → exceso 2600 → mitad 1300 → topado a
  400. Corriendo 36 min/600kcal con `kcal_bmr=2160` → basal descontado 54 → NEAT neto del
  entreno 546 → si `kcal_active=1000`, `neatDe=454` → exceso 54 → extra 27.

### 1.4 `macroGoal(day)` — objetivo de macros del día

Constante integrada `MACROS = {prot:160, soft:{carb:60,fat:75}, hard:{carb:110,fat:80}, long:{carb:130,fat:80}}`.
Proteína **fija en 160 g** siempre; carbohidratos y grasa varían según el tipo de día.

```
cfg = goal.macros || (tiene rutina propia en kv_state.routine ? null : MACROS)
si cfg es null → sin objetivo ese día
kind = loadOf(sid_del_día)     # "soft" | "hard" | "long", ver más abajo
k = cfg[kind] || cfg.soft || MACROS.soft
devuelve {prot: cfg.prot||160, carb: k.carb, fat: k.fat, kind, sid}
```

`loadOf(sid)` decide si el día es suave/duro/largo, en este orden de autoridad:
1. `goal.macros.byDay[sid]` (override explícito).
2. `session.load` (la propia sesión lo declara).
3. Tabla fija `DAYLOAD`: `{descanso:soft, lowA:hard, upA:soft, run1:hard, runEasy:hard, carga:long, lowB:hard, upB:soft, runLong:long}`.
4. Sin sesión ese día → `soft`. Sesión de descanso → `soft`.
5. Sesión de carrera → `long` si el título contiene "larga"/"long", si no `hard`.
6. Sesión de gimnasio sin match anterior: si ≥50% de las series son de pierna → `hard`, si no `soft`.

**No depende de peso corporal ni de TDEE** — son gramos fijos por tipo de día, configurables
solo vía `goal.macros` en `kv_state`.

### 1.5 `macroCard()` — cómo se pinta el objetivo del día

```
kcalBase = round(prot*4 + carb*4 + fat*9)          # fórmula de Atwater
kcalObjetivo = kcalBase + neatExtra(r)
```
- Proteína es **suelo**: verde si `consumido >= objetivo*0.95`.
- Carbohidratos/grasa son **techo**: rojo si `consumido > objetivo*1.1`.
- Aviso de "registro incompleto" solo si `kcal_in < MINLOG` (900 kcal por defecto,
  configurable en `goal.minKcal`) **y** ya es tarde (día pasado, o después de las 21:00 hoy)
  — no regaña a media mañana por comidas aún no tecleadas.

### 1.5b `outGoalTag()` — objetivo de gasto junto a «🔥 Kcal out» *(27-ago-2026)*

Tarjeta "Tu cuerpo hoy". Sirve para ver a media tarde si falta movimiento y compensarlo
andando o subiendo escaleras.

```
kcalObjetivo = round(prot*4 + carb*4 + fat*9) + neatExtra(r)   # el MISMO de macroCard
objetivoOut  = kcalObjetivo + OUT_MARGIN                        # goal.outMargin ?? 950
```

**Por qué 950 y no "comida + déficit deseado".** El margen calibra el objetivo a **un día
normal suyo**, no a un día ambicioso. La pregunta que responde la tarjeta es *"¿me he movido
menos de lo habitual y me da tiempo a compensarlo?"*, no *"¿he entrenado bastante?"*.

Medido sobre agosto-2026: gasto real medio **2.729** kcal/día, objetivo de comida medio
**1.753** → diferencia **967**, de donde sale el 950 por defecto.

Rinde: **2.505** (soft) · **2.750** (hard) · **2.830** (long). Con la semana real de Marcos
cumple 3 días holgado, roza 3 y suspende 1 — el sábado, que es su día flojo de verdad.

**⚠️ Intento fallido, no repetirlo.** La primera versión usó 1.200 (= offset empírico de 776
+ 425 de déficit deseado). Daba un objetivo **233 kcal/día por encima de su gasto normal**:
lo cumplía **1 día de 7** y exigía ~4.850 pasos extra diarios. Dos fallos:

1. Un objetivo que se falla seis de cada siete días deja de ser señal y se ignora.
2. Empujaba a moverse más, justo lo que el **protocolo de auditoría** (1-sep → 22-sep-2026)
   prohíbe: durante la calibración los pasos se mantienen estables, porque cambiar actividad
   y registro a la vez no deja aprender nada.

**Configuración:** `goal.outMargin` ajusta el margen; `goal.outGoal=false` apaga la etiqueta.

**Sobre el offset de 776** (por si se quiere reintroducir algún día): NO es inflación de
Garmin. Un bottom-up sin doble conteo — BMR 1.740 + TEF 220 + andar 199 + correr 198 +
fuerza 130 + resto de NEAT 150 = **2.637** — queda a un 3 % de las 2.720 de Garmin: Garmin
acierta. El offset es sobre todo **infraregistro de comida**: `kcal_in` captura ~74 % de lo
que se come. Y por eso solo vale mientras se registre igual.

- Solo se pinta en la **vista de un día** (`rng===1`).
- Usa el mismo `gtag()` (◎) que peso y grasa.

Detalle completo en el corpus: `deporte/referencia/2026-08-27_recalibracion-balance-energetico.md`.

### 1.6 Déficit calórico semanal — `weekCardFor(lunes)`

Solo cuenta días **ya cerrados** (`día < hoy`) con `kcal_in` registrado y `logOK` (≥900 kcal,
si no se descarta como "incompleto"):
```
desviación_del_día = kcal_in - (prot*4 + carb*4 + fat*9) - neatExtra(día)
```
Se acumula `Σ desviación / nº días válidos`. Color: verde si `|desviación media| <= 250`,
naranja si por encima del objetivo, gris si por debajo. La proteína se cuenta como **suelo
diario cumplido/no cumplido** ("3 de 5 días"), nunca como media — para no esconder los días
malos.

### 1.7 `mealsOf(day)` / `mealsCard()` — desglose por comida

`meals_kcal` llega de MyFitnessPal ya agregado por cajón (`b`=desayuno, `l`=comida,
`d`=cena, `w`=batido, `s`=picoteo). La app solo formatea; el único cálculo real de este
bloque ocurre en el pipeline (§6.4, separación batido/picoteo por densidad de proteína).
Día pasado sin datos de MFP → tarjeta vacía (no se pide retroactivamente).

### 1.8 Logro "🔥 Déficit" — `achCard()`

```
on = kcal_in > 0 && kcal_out > kcal_in
```
`kcal_out` es el gasto total de Garmin, no una fórmula propia.

---

## 2. Carrera / running **[APP]**

### 2.1 `riegel(km1, min1, km2)` — predicción de marca

```
min1 * (km2/km1) ^ 1.06
```
Exponente fijo **1,06** (estándar de extrapolación entre distancias). El esfuerzo de
referencia (`km1`,`min1`) es **el más rápido, con ritmo corregido por temperatura, entre
los últimos 42 días**, filtrado a `distance_km>=3` y `duro` (`hr_avg >= 0.85*fcMax()`).
Sin ningún esfuerzo "duro" en esa ventana → no hay proyección (aviso explícito: "aún no
hay un esfuerzo fuerte"). **Nunca se proyecta desde un rodaje suave** — dio a Marcos 1:19
y a Sofi 1:27 la vez que se hizo mal (error ya cometido, documentado en `CLAUDE.md`).

### 2.1b `estimarKmPlan(pasos)` — km del badge de la sesión de hoy *(1-sep-2026)*

El badge grande de la sesión de carrera (p.ej. "FARTLEK") mostraba `s.km`, un rango **fijo
por tipo de plantilla** (`run1.km="6-9 km"`, pensado para series de 45-55 min). El plan del
día concreto puede ser mucho más corto — un Fartlek de 40 min con medio tiempo a ritmo
suave nunca llega a esos números — así que el badge mentía. Ahora se calcula tramo a tramo
a partir del texto del plan (`planDelDia(dia)`, campo `p`) y **solo si todos los tramos son
calculables**; si no, cae al `s.km` fijo de antes:

```
por tramo:
  "N × (A min · P1-P2 / B min · P3-P4)"   → N * Σ tramo(sub)
  "N × M min · P1-P2"                     → [N*M/P2, N*M/P1]   (P1 rápido, P2 lento)
  "M min · P1-P2"                         → [M/P2, M/P1]
  "K km ..."                              → [K, K]             (distancia dada directamente)
  cualquier otro (cuestas por tiempo, series a "ritmo objetivo") → no calculable

si algún tramo no calculable es sustancial (tiene min/km/s y no es rectas o
recuperación corta ≤3 min al trote/andando) → estimarKmPlan devuelve null entero,
no un rango calculado a medias
si no → suma de los lo/hi de cada tramo, redondeado a un decimal
```

Comprobado contra el plan real de Marcos: 1-sep (Fartlek 10×1'/1') → 5,3-5,6 km (el reloj
marcó 5,67 km, dentro de rango); 11-ago (Series 6×1') → 3,4-3,6 km. Días de cuestas por
tiempo, series a "ritmo objetivo" (antes del test del 4-oct) o calentamiento sin ritmo
numérico caen a `null` **a propósito**: mejor el badge fijo antiguo que un número calculado
a medias y con más confianza de la que merece.

### 2.2 `fcMax()`

```
race.hr_max || 195
```
Valor **fijo, medido/manual por persona**, no `220-edad`. 195 es el fallback si no hay
carrera configurada.

### 2.3 `paceCorr(a)` — corrección de ritmo por temperatura

```
pm = duración_min / distancia_km
t = apparent_c ?? temp_c ?? (es cinta ? 21 : null)
si t es null o t <= 15 → pm sin cambios (nunca corrige a la baja)
si no → pm - ((t - 15) * 1.5) / 60      # 1,5 s/km por cada grado sobre 15°C
```
Constantes: `TEMP_REF=15`, `TEMP_SEG_GRADO=1.5`, `TEMP_CINTA=21` (temperatura asumida en
cinta sin sensor, porque "un tercio de sus salidas son en cinta"). Solo corrige por calor,
**no hay corrección por desnivel**.

### 2.4 Eficiencia de carrera — `efSlope()`, `efDe(a)`, `efficiencyCard()`, `trayectoriaCard()`

`efSlope()` = pendiente ritmo-pulso en s/km por ppm, **calibrada por persona y guardada
en `race.base.slope`** (no se calcula por regresión en el cliente); -3 s/km/ppm si no hay
dato. Valores reales medidos: Marcos -3,1, Lorena -5,3.

```
efDe(a) = paceCorr(a)*60 + (150 - hr_avg) * efSlope()     # "ritmo equivalente a 150 ppm", en segundos/km
```
Válido solo si `135 <= hr_avg <= 165` (rango alrededor del ancla de 150 ppm) y
`distance_km>=2`.

⚠️ **Bug histórico ya corregido (hasta v178):** la fórmula vieja era una razón
`pace/hr_avg`, que escala al revés (a menos pulso, peor cifra). La actual es lineal y
correcta: con `slope` negativo, menos pulso que 150 resta segundos → mejor cifra.
Verificado: 8:00/km (480 s) a 140 ppm con slope -3 → `480 + (150-140)*(-3) = 450 s = 7:30`
(mejor que a 150 ppm, como debe ser).

- **`efficiencyCard()`**: ventana 84 días, filtro `hr_avg <= fcMax()*0.82` (rodaje suave) y
  `distance_km>=2`; necesita ≥3 rodajes y ≥2 semanas con datos. Agrupa por semana natural,
  media (no mediana) por semana. `mejora = valor_primera_semana - valor_última` (positivo
  = mejora); "estable" si `|mejora| < 4 s/km`.
- **`trayectoriaCard()`**: ventana más corta, 21 días ("para que una carrera rara no
  mande"), usa `efDe` con sus límites 135-165 ppm, necesita ≥3 valores, **mediana manual
  sin promediar en longitud par** (`vs.sort(); vs[floor(len/2)]`) — distinta de `medianaDe()`.
  Dibuja una recta de referencia partida→meta: `debe = ef_s - (ef_s - meta_ef_s) * frac`,
  con `frac` = fracción de tiempo transcurrido entre `race.base.day` y `race.date`,
  acotada a [0,1]. Compara también el peso contra la misma recta, usando el **último
  peso de los últimos 14 días** (no una mediana).

⚠️ **Discrepancia conocida, no corregida:** `marcasCard()` (columna "ritmo a 150 ppm" por
año) usa todavía la **fórmula vieja** (`paceCorr(a)/hr_avg*150`, filtro 120-175 ppm), nunca
tocada por la corrección de v178. Es la única tarjeta donde a menos pulso puede salir una
cifra peor. Si algún día se homogeneiza, tocar la línea de `marcasCard` que hace
`o.ef.push(...)`.

### 2.5 `marcasCard()` — marcas personales (PB)

Requiere ≥10 carreras en el histórico completo (sin ventana de fecha). Por cada distancia
coge la de **menor duración** dentro de una ventana de tolerancia asimétrica sobre la
distancia exacta:

| Distancia | Ventana aceptada |
|---|---|
| 5K | 4,80 – 5,30 km |
| 10K | 9,60 – 10,70 km |
| Media maratón | 20,57 – 21,94 km |

Por año (últimos 6): volumen (km) y nº de carreras por suma simple.

### 2.6 `adherenceCard()` y `progresionCard()` — cumplimiento del plan

`adherenceCard`: de la semana en curso, `% = días con km>0 registrados / días planificados
hasta hoy` (sin umbral mínimo de km, basta con >0).

`progresionCard`: sobre los domingos de tirada larga, combina 3 curvas — minutos
planificados (del plan), % de adherencia semanal (mismo criterio que arriba, excluyendo la
semana en curso), y velocidad real (media semanal de `efDe`, coloreada verde si mejora≥4
s/km, naranja si empeora≤-4, gris si estable). Necesita ≥4 fechas de plan reconocibles y
≥3 domingos con "N min" extraíble del título por regex.

### 2.7 `volumeCard()` — regla del 10-15%

```
salto = round((última_semana_km / penúltima_semana_km - 1) * 100)
```
Aviso de riesgo solo si la semana previa ya tenía **≥12 km** y el salto es **>15%** (por
debajo de 12 km/semana el aviso no se muestra, es ruido estadístico). Ventana: últimas 11
semanas (77 días).

### 2.8 `intensityCard()` — reparto por zonas de frecuencia cardíaca

Tres zonas sobre `hr_avg / fcMax()`: suave (≤0,82), medio (≤0,89), duro (resto). Objetivo
visual: 80% del tiempo en zona suave. Avisa si `%suave < 65%` ("zona gris") o si
`%suave > 96% y nada dese duro` ("todo suave, sin día rápido no se gana velocidad").

---

## 3. Sueño, descanso y estrés

### 3.1 Proxy de "hora de irse a la cama" **[PIPE]** (`balancetool.py`)

Garmin da cuándo te **dormiste** (`sleep_start_h`), nunca cuándo te **acostaste**. El
pipeline lo aproxima con el último tramo de pasos reales antes de dormirte:

```
busca hasta 8h antes del inicio de sueño, el último bucket de 15 min con >=25 pasos
"acostarse" = fin de ese bucket + 15 min
sleep_lat_min = minutos entre ese instante y el inicio de sueño real
```

Umbral de 25 pasos para descartar el paseo al baño / moverse en el sofá. Red de seguridad
contra falsos positivos de madrugada: un tramo suelto y pequeño (<80 pasos, vecinos a
cero, entre las 00:30 y las 12:00) **no** se toma como "se acostó" — podría ser un
despertar de madrugada, y confundirlo convertiría una noche de insomnio en una de
trasnoche. A la hora normal (23:00-00:30) sí se acepta un tramo suelto.

**Prioridad de fuentes para "hora de ponerse a dormir" (`sleep_try_h`)**, de mayor a menor:
1. `bedtap:<día>` en `kv_state` — toque manual en la app (HH:MM estructurado).
2. `journal:<día>` — regex sobre el texto libre ("23:55 a dormir", "a la 1 am"), mirando
   primero la nota de la víspera y si no la del propio día. El minuto es opcional en la
   forma "a dormir a la 1 am".
3. Si ninguna aplica, solo queda el proxy de pasos (`bed_h`), que es la hora de
   **acostarse**, no la de "ponerse a ello" — son conceptualmente distintas (entre medias
   caben la serie o el libro).

### 3.2 Comparación contra tu normalidad **[APP]** (`bedCard`, `medianaDe`)

```
medianaDe(v) = mediana estándar (promedia los dos centrales si longitud par)
```
Ventana: **todo el histórico disponible hasta el día seleccionado**, no un nº de días
fijo. Se calcula la mediana personal de `bed_h` y de `sleep_lat_min`.

Clasificación:
- Hora de acostarse "mala" si `>= mediana+1h`; "buena" si `<= mediana-0.5h`.
- Latencia "mala" si `>= mediana+30min`; "buena" si `<= mediana`.

Aviso jerárquico (se comprueba en este orden, gana el primero que aplique):
1. Si te acostaste tarde → "te acostaste tarde, no es que te costara dormir" (culpa la hora).
2. Si no, y la latencia fue alta → culpa la latencia, y matiza con `sleep_h` vs su propia
   mediana: si aun así dormiste ~tus horas de siempre (`sleep_h >= mediana-0.3`), no hubo
   pérdida real; si no, "esta vez sí lo pagaste".
3. Noche dentro de la normalidad en ambos → sin aviso.

### 3.3 Curva de estrés — cubos de 30 min **[PIPE]** (`balancetool.py`)

48 cubos de media hora en **hora local** (no muestreo cada N lecturas, para que cada
punto sea una franja horaria real). Garmin usa dos códigos negativos distintos:
- `-1` = sin dato suficiente → cubo queda `None`.
- `-2` = demasiado movimiento (reloj puesto y midiendo, pero la señal de estrés no vale
  durante ejercicio/actividad) → si el cubo no tiene ninguna lectura válida pero sí hubo
  `-2`, se marca `-2` explícitamente ("actividad", no un hueco).

**[APP]** presenta esto en `stressDayCard`: la media/máximo mostrados **excluyen** los
cubos `-2` y `null` (solo promedia estrés real ≥0); usa `stress_avg` de Garmin si está
disponible, si no recalcula la media local. Colores por banda (`sColor`):
`[0,25)` verde, `[25,50)` verde-oliva, `[50,75)` ámbar, `[75,100]` rojo. Los cubos `-2` se
pintan de color distinto (violeta) con la etiqueta "en movimiento" — **nunca** "entrenando":
puede ser simplemente 772 pasos limpiando la casa.

### 3.4 Detección de viaje **[PIPE]**

```
travel = (offset_local_del_reloj_ese_día) != (offset_UTC_de_Madrid_ese_día)
```
Comparando el desfase Local-GMT del bloque de estrés de Garmin contra el huso horario de
Madrid calculado con `zoneinfo`.

### 3.5 Otros

- `sleep_score` **nunca se recalcula**: viene de Garmin tal cual, solo se compara contra
  el umbral de logro (`>=80`) o se promedia (media aritmética simple) en vistas de varios
  días.
- No existe ningún dato de "body battery" en la app — se buscó explícitamente, no hay.
- Las siestas (`rest_win===2`) son puramente visuales (sombreado en la curva de estrés),
  sin agregación propia.
- `wake:<día>` (1-5, "fatal"…"perfecto") es un valor **subjetivo de un solo toque**, sin
  fórmula: correlaciona mejor con las horas dormidas (r=+0,46) que el `sleep_score` del
  reloj (r=+0,20) en una comparación de 15 días — es la razón de que exista junto al dato
  del reloj, no un cálculo en sí.
- `baselineCard` (línea base de 90 días) es **texto ya redactado por el backend**, no hay
  fórmula visible en el front — si hace falta auditar esa "línea base", hay que mirar el
  proceso que la genera, no `index.html`.

---

## 4. Fuerza / rutina / hombro **[APP]**

### 4.1 `buildLog(sid)` — volumen de una sesión de pesas

Por cada ejercicio con series marcadas como hechas (`c` de `NS` totales):
```
reps del ejercicio (rp):
  si es un solo número → tot = número * c   (se repite en cada serie hecha)
  si es una lista "15,15,12" → toma los primeros c valores; si faltan, repite el ÚLTIMO
  si no hay reps → repsMid(reps_de_la_ficha) * c   (media del rango, ej. "8-12"→10)
volumen_ejercicio = tot * peso_kg      (solo si hay peso; si no, no aporta volumen aunque
                                         sí cuenta como serie hecha)
volumen_sesión = Σ volumen_ejercicio
```

### 4.2 `muscleOf` / `guessMuscle` — a qué grupo pertenece un ejercicio

Cadena de prioridad: (1) campo explícito `it.m` en la ficha → (2) mapa por índice
`MGROUPS[sid]` (solo si el nº de ejercicios de la sesión coincide EXACTAMENTE con el mapa
— un mapa descuadrado se ignora entero, "es peor que no tener mapa") → (3) heurística por
regex sobre el nombre (orden importa: `back` se comprueba antes que `chest`, para que
"jalón al pecho" no se cuele como pecho). Sin match → `null` (los estiramientos no
cuentan volumen).

### 4.3 Series objetivo, series hechas, "ejercicio completo"

- `nSets(sid,i,it)`: nº de series ajustable ±1 por el usuario (botones, rango 1-10);
  si nunca se toca, usa el valor de la ficha (`it.sets`).
- Un ejercicio se considera **hecho** solo si están marcadas TODAS sus series objetivo
  (no un porcentaje).
- Una sesión de gimnasio se considera **hecha** solo si TODOS sus ejercicios con series
  están hechos.
- Sesiones que no son de gimnasio (carrera, descanso): se marcan hechas con un botón
  manual, sin relación con datos reales del reloj.

### 4.4 Temporizador de descanso

**Fijo en 60 segundos**, siempre, para cualquier ejercicio — no varía por grupo muscular
ni por RPE. Basado en marca de tiempo real (`Date.now()+60000`), no en un contador de
`setInterval` puro, para sobrevivir a que la app pase a segundo plano. El bloque de
isométricos de manguito usa un temporizador aparte, fijo en **45 segundos**, hasta 5
series.

### 4.5 Semáforo de dolor de hombro — `painBlock()`

No hay fórmula: son 3 umbrales fijos que el propio usuario elige tras la sesión (`0`=0-1,
`1`=2-3, `2`=4+ sobre 10), cada uno con un mensaje fijo predefinido (progresar / vigilar
mañana / parar y bajar carga). Un solo valor por sesión/día, sobrescribible. No aparece en
sesiones de manguito/activo, ni para usuarios con rutina propia salvo que la pidan
explícitamente (`routine.shoulderCheck===true`).

### 4.6 "Día doble" — campo `plus`

Un día de la semana puede llevar **dos sesiones independientes** (ej. jueves =
`runEasy` + `upA`). No es un cálculo, es un campo de configuración (`WK[i].plus`) que:
hace que la app pinte ambas fichas ese día (pesas primero, "las piernas fatigadas no
deben ir antes de estabilizar el press"), cada una con su propio guardado/dolor/series, y
que la adherencia semanal cuente **ambas** sesiones potenciales ese día, no solo una. El
tipo de carga del día (§1.4) también sube a `hard` cuando lleva fuerza añadida.

---

## 5. Notificación de sesión — `fitmet_notify.py` **[PIPE]**

No es un cálculo numérico, pero decide con lógica de prioridad **qué frase mostrar** tras
cada entreno nuevo (primero lo excepcional, luego lo del plan, solo al final algo
genérico):

1. Si es carrera ≥2 km: ¿es tu ritmo más rápido en 30 días? (comparado contra el mínimo de
   tus ritmos previos de ≥2 km en esa ventana) → mensaje de récord.
2. Si no, ¿estás por debajo de la mediana de tus últimos ritmos (con ≥3 muestras)? →
   mensaje de "por encima de tu media".
3. Si no, ¿es tu distancia más larga del mes? → mensaje de fondo.
4. Si llevas 3 carreras esa semana natural → mensaje de "semana completa".
5. Si el día tenía un título de plan de carrera asociado (y la sesión ES de carrera, nunca
   se acredita una sesión de fuerza con el título de la tirada del día) → "hecho lo que
   tocaba: {título}".
6. Si es fuerza → mensaje genérico de fuerza.
7. Si nada de lo anterior aplica → mensaje genérico de progreso.

Solo dispara para actividades `running` o `strength_training` de ≥10 min, y es
**idempotente** (cada actividad se marca avisada por su id en `kv_state.notif:<id>`, así
que relanzar el script no duplica avisos).

---

## 6. Otros cálculos del pipeline (`~/corpus-tools`) **[PIPE]**

Repo aparte de la app (sin versionar junto a `index.html`). Documentación operativa
completa de cada script en sus propios docstrings; aquí solo los cálculos no triviales
que alimentan `daily_metrics`/`kv_state`:

### 6.1 `balancetool.py build_rows()` — fusión diaria

Un `daily_metrics` por día se construye cruzando MyFitnessPal (`kcal_in`+macros),
Garmin (`kcal_bmr/active/out`, pasos, sueño, HRV, estrés) y Apple Health/báscula
(peso, grasa, masa magra), con reglas de prioridad cuando dos fuentes traen el mismo
dato (p. ej. peso: Health > báscula Garmin > check-in de MFP, cada uno solo rellena si
el anterior no trajo el dato ese día — nunca se sobrescribe un dato bueno con `null`).

### 6.2 `steps_curve` / `hr_curve` — curvas intradía muestreadas

Se muestrean a un máximo de ~40 puntos (paso = `len//32` o `len//40`) para no mandar el
intradía completo a Supabase; siempre se fuerza a incluir el último valor real aunque no
caiga en el muestreo, para no perder el total del día.

### 6.3 Distancia del día (`distance_km`)

Es la distancia derivada por Garmin de los pasos (no la suma manual de actividades), así
que en un día con carrera **incluye** la carrera como distancia hecha a pie — es
coherente con la cifra de pasos que se enseña al lado, pero hay que tenerlo presente al
comparar "distancia del día" con "km de la actividad".

### 6.4 Separación batido vs picoteo (cajón "snacks" de MFP)

```
densidad = proteína_g / kcal
si kcal>0 y densidad >= 0.12 → es un batido de proteína (categoría "w")
si no → es picoteo real (categoría "s")
```
Umbral 0,12 g proteína/kcal porque un whey ronda 0,19 y la comida de picar ronda 0,02 —
mantenerlos separados conserva la distinción entre proteína de comida y de suplemento.

### 6.5 `fitmet_query.py` — agregación de partes diario/semanal

No calcula métricas nuevas: junta lo que ya existe en `daily_metrics`/`kv_state`/CSVs
locales en un único JSON por persona y día (pasos, sueño, actividades, comida, siestas,
journal, hábitos) para que los partes automáticos no necesiten heredocs. El único
cálculo real es la hora de las siestas (`duración = ms/60000`, redondeada).

---

## 7. Cosas que la gente asume que se calculan y NO se calculan

- **No hay sistema de rachas/streaks** en ningún sitio (ni entrenos consecutivos, ni días
  de journal seguidos, ni hábitos en fila). Se buscó explícitamente en todo `index.html`.
  Lo más parecido son las 4 insignias **del día actual** de `achCard()` (10k pasos, 10
  plantas, sueño ≥80, déficit del día), que no se acumulan ni persisten.
- **No hay BMR/TDEE calculado por la app.** Todo el gasto energético (`kcal_bmr`,
  `kcal_out`) es un dato externo de Garmin.
- **El hábito 🍷 (alcohol) es un booleano**, no guarda cantidad — una copa y 700 ml
  puntúan igual. La cantidad real, si se quiere, hay que buscarla en el texto del journal.
- **`baselineCard`, `briefCard`, `daybriefCard`, `avisoCard`, `tripCard`, `runplanCard`**
  no calculan nada en el cliente: son texto ya redactado por un proceso externo
  (`fitmet_brief.py`, `fitmet_notify.py`, u otro) que la app solo pinta con viñetas/negrita.
  Si el contenido de una de estas tarjetas parece "mal calculado", el problema está en el
  proceso que lo generó, no en `index.html`.

---

## 8. Constantes numéricas — tabla de referencia rápida

| Constante | Valor | Dónde se usa |
|---|---|---|
| Proteína objetivo | 160 g/día, fija | `MACROS` |
| Carbohidratos/grasa por tipo de día | soft 60/75, hard 110/80, long 130/80 (g) | `MACROS` |
| `MINLOG` (kcal mínimas para "día registrado") | 900 | `logOK`, avisos de macros |
| Ventana NEAT base | 45 registros, mínimo 10 válidos | `neatBase` |
| Reparto del exceso de NEAT | 50% (`neatShare`, configurable) | `neatExtra` |
| Tope del extra de NEAT | 400 kcal (`neatCap`, configurable) | `neatExtra` |
| Exponente de Riegel | 1,06 | `riegel` |
| Umbral "esfuerzo duro" | `hr_avg >= 0,85 * fcMax()` | `riegel` (esfuerzo de referencia) |
| Ventana del mejor esfuerzo para Riegel | 42 días | `raceHeadCard` |
| `fcMax()` por defecto | 195 ppm | si no hay `race.hr_max` |
| Ancla de eficiencia | 150 ppm, válido 135-165 ppm | `efDe` |
| Ancla de eficiencia (fórmula vieja, solo en `marcasCard`) | 150 ppm, válido 120-175 ppm | inconsistente, ver §2.4 |
| `efSlope()` por defecto | -3 s/km por ppm | si no hay `race.base.slope` |
| Corrección de temperatura | referencia 15 °C, 1,5 s/km por grado extra | `paceCorr` |
| Temperatura asumida en cinta sin sensor | 21 °C | `paceCorr` |
| Umbral "rodaje suave" | `hr_avg <= fcMax()*0,82` | `efficiencyCard`, `intensityCard` |
| Ventana eficiencia semanal | 84 días, ≥3 runs, ≥2 semanas | `efficiencyCard` |
| Ventana eficiencia corta (trayectoria) | 21 días, ≥3 valores | `trayectoriaCard` |
| Ventanas de tolerancia de marca personal | 5K 0,96-1,06×; 10K 0,96-1,07×; Media 0,975-1,04× | `marcasCard` |
| Umbral mínimo de carreras para marcas | 10 carreras en total | `marcasCard` |
| Ventana volumen semanal / regla del 10% | 77 días (11 semanas); aviso si base≥12 km/sem y salto>15% | `volumeCard` |
| Temporizador de descanso entre series | 60 s fijos | `restStart` |
| Temporizador isométrico (manguito) | 45 s, hasta 5 series | `isoStart` |
| Umbral de pasos para "se acostó" (proxy) | ≥25 pasos en bucket de 15 min | `balancetool.py` |
| Comparación de hora de acostarse/latencia | mala si ≥ mediana personal +1h / +30min; buena si ≤ mediana -0,5h / = mediana | `bedCard` |
| Umbral "madrugada" (hábito automático) | dormido entre 03:00 y 06:59 | `habCard` |
| Bandas de color de estrés | verde 0-24, oliva 25-49, ámbar 50-74, rojo 75-100 | `sColor` |
| Densidad proteína/kcal para distinguir batido de picoteo | ≥0,12 g/kcal → batido | `balancetool.py` |

---

## 9. Deuda técnica conocida (no arreglar sin avisar, pero hay que saberlo)

- `marcasCard()` usa la fórmula de eficiencia **vieja** (invertida) para la columna "ritmo
  a 150 ppm por año" — nunca se corrigió cuando se arregló el resto en la v178 (ver §2.4).
- `pendingLogs` (cola de reintento de `workout_logs` que no se pudieron subir) se
  sincroniza también como clave normal de `kv_state`, lo que mezcla una cola transaccional
  con el bus de configuración; un pull en otro dispositivo podría traer una cola ajena.
- `ses:<fecha>` (override de qué sesión toca un día suelto) se lee en el front pero no
  tiene UI para escribirse desde la app — solo se puede fijar a mano (SQL/API).
- El `schema.sql` versionado en el repo no incluye la función `notice_by_token` ni el
  edge function `push-timer`, que sí están activos en producción: el schema local **no**
  es la fuente de verdad completa del backend desplegado.
