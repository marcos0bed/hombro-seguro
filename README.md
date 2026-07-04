# Hombro Seguro

PWA de entrenamiento de fuerza diseñada para entrenar **protegiendo un hombro en recuperación** (conflicto subacromial / supraespinoso): nada por encima del hombro, cargas moderadas y trabajo de manguito rotador integrado.

**App:** https://marcos0bed.github.io/hombro-seguro/

## Qué hace

- **Hoy** — detecta el día de la semana y muestra la sesión que toca (2 días de upper, 1 de pierna, running, descanso activo). Series marcables, peso recordado por ejercicio, instrucciones de técnica y enlace a vídeo por ejercicio.
- **Temporizador de descanso** automático (90 s) al marcar una serie.
- **Semáforo del hombro** al acabar cada sesión (0-1 / 2-3 / 4+) con la consigna correspondiente.
- **Semana** — vista de los 7 días con check automático al completar una sesión.
- **Viaje** — dos variantes: hotel con gimnasio y "sin gimnasio" con gomas y anclaje de puerta (incluye reglas de seguridad del anclaje).
- **Manguito** — bloque de rotadores y escápula con cronómetro guiado para isométricos de pared (5×45 s con aviso sonoro).
- **Reglas** — glosario de agarres (neutro/supino/prono), reglas de progresión y lista de ejercicios prohibidos en fase de protección.

Funciona **offline** (service worker) y es **instalable** en el móvil (Añadir a pantalla de inicio). Todo el progreso se guarda en `localStorage` del dispositivo: no hay backend ni se envía ningún dato.

## Aviso

Esto no es consejo médico. Es una rutina personal construida sobre pautas de un equipo de rehabilitación; si tienes una lesión de hombro, la progresión de cargas la decide tu médico o fisioterapeuta.

## Stack

HTML/CSS/JS vanilla en un solo fichero, sin dependencias. Manifest + service worker para PWA. Publicado con GitHub Pages.
