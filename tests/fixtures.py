#!/usr/bin/env python3
"""Regenera los ficheros de datos que usan las suites.

Viven en /tmp a propósito: llevan métricas reales de la familia y **no deben
versionarse**. Pero /tmp se limpia, y entonces seis suites dejaban de compilar.
Con el runner viejo eso pasaba por bueno; ahora falla, y este script las
recupera en dos segundos.

Uso:  tests/fixtures.py        (regenera lo que falte)
      tests/fixtures.py --all  (regenera todo)
"""
import json
import sys
import urllib.request
from pathlib import Path

BASE = "https://rinjfomkmxvnyqpeftxa.supabase.co"
CONF = Path.home() / "corpus-tools/fitmet_users.json"


def creds():
    for line in (Path.home() / ".supabase_hombro_creds").read_text().splitlines():
        if line.startswith("SUPABASE_SERVICE_ROLE="):
            return line.split("=", 1)[1].strip()
    sys.exit("no encuentro SUPABASE_SERVICE_ROLE")


def main():
    todo = "--all" in sys.argv
    conf = json.loads(CONF.read_text())
    users = conf.get("users") or conf
    sr = creds()
    H = {"apikey": sr, "Authorization": "Bearer " + sr}

    def get(path):
        return json.loads(urllib.request.urlopen(
            urllib.request.Request(BASE + path, headers=H)).read().decode())

    def uid(slug):
        return users[slug]["supabase_user_id"]

    hechos = []

    # métricas diarias de Marcos: sueño, pasos, estrés… (hs_bedt, hs_km)
    f = Path("/tmp/hs_bed.json")
    if todo or not f.exists():
        rows = get(f"/rest/v1/daily_metrics?user_id=eq.{uid('marcos')}"
                   "&day=gte.2026-05-01&order=day")
        f.write_text(json.dumps(rows))
        hechos.append(f"{f.name} ({len(rows)} días)")

    # un día completo con curva de estrés y comidas (hs_meals, hs_run, hs_sync)
    f = Path("/tmp/hs_real.json")
    if todo or not f.exists():
        # Día CONGELADO a propósito: hs_meals comprueba cifras concretas de esa
        # jornada (comida de 1.109 kcal y 62 g). Si el fixture siguiera al
        # último día, el test fallaría cada vez que él come otra cosa.
        rows = get(f"/rest/v1/daily_metrics?user_id=eq.{uid('marcos')}"
                   "&day=eq.2026-08-02")
        if not rows:
            sys.exit("falta el día 2026-08-02, sobre el que están escritos los tests")
        f.write_text(json.dumps(rows[0]))
        hechos.append(f"{f.name} ({rows[0]['day']})")

    # plan y rutina de Lorena (hs_lorena)
    for k, nom in (("race", "lorena_race"), ("routine", "lorena_routine")):
        f = Path(f"/tmp/{nom}.json")
        if todo or not f.exists():
            r = get(f"/rest/v1/kv_state?user_id=eq.{uid('lorena')}&k=eq.{k}&select=v")
            if not r:
                print(f"  ⚠ Lorena no tiene {k}"); continue
            f.write_text(json.dumps(r[0]["v"]))
            hechos.append(f.name)

    # plan y rutina de Sofía: su suite los lee de FitmetData, que sí es durable
    d = Path.home() / "FitmetData/sofia"
    for k in ("race", "routine"):
        f = d / f"{k}.json"
        if todo or not f.exists():
            r = get(f"/rest/v1/kv_state?user_id=eq.{uid('sofia')}&k=eq.{k}&select=v")
            if not r:
                print(f"  ⚠ Sofía no tiene {k}"); continue
            d.mkdir(parents=True, exist_ok=True)
            f.write_text(json.dumps(r[0]["v"]))
            hechos.append(str(f))

    print("fixtures: " + (", ".join(hechos) if hechos else "todo estaba en su sitio"))


if __name__ == "__main__":
    main()
