#!/bin/zsh
# run.sh — lanza todas las suites contra el index.html actual.
# Uso: tests/run.sh
set -u
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc
D="${0:A:h}"
APP=/tmp/hs_app.js
python3 -c "
import re,pathlib
s=pathlib.Path('$D/../index.html').read_text()
pathlib.Path('$APP').write_text(re.search(r'<script>\n\"use strict\";(.*)</script>', s, re.S).group(1))
"
fallos=0
for f in "$D"/hs_*.js; do
  n=$(basename "$f" .js)
  [ "$n" = "hs_harness" ] && continue
  out=$("$JSC" "$D/hs_harness.js" "$APP" "$f" 2>&1 | tail -1)
  printf "%-12s %s\n" "$n" "$out"
  # Cualquier cosa que no sea "TODO OK" es un fallo. Antes solo se miraba si
  # ponía FALLOS, así que una suite que ni siquiera compilaba pasaba por buena:
  # el error de sintaxis no lleva esa palabra. Tres veces dio verde en falso.
  [[ "$out" == *"TODO OK"* ]] || fallos=1
done
exit $fallos
