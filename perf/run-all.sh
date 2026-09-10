#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8081}"
LEVELS="${LEVELS:-25 50 100 200}"
DURATION="${DURATION:-1m}"
SATURATION_VUS="${SATURATION_VUS:-100}"
SATURATION_DURATION="${SATURATION_DURATION:-30s}"
RUN_DIR="${RUN_DIR:-perf/results/$(date +%Y%m%d-%H%M%S)}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

fail() { printf '\n  ERREUR: %s\n\n' "$1" >&2; exit 1; }

echo "== Vérifications préalables =="

command -v k6 >/dev/null 2>&1 || fail "k6 introuvable. Voir docs/developpement.md pour l'installer."
echo "  k6                 $(k6 version | head -1)"

curl -fsS -m 5 "$BASE_URL/health" >/dev/null 2>&1 \
  || fail "API injoignable sur $BASE_URL. Lancez: docker compose up -d"
echo "  API                $BASE_URL joignable"

profiles="$(curl -fsS -m 30 "$BASE_URL/api/profiles" \
  | python3 -c 'import sys,json; print(len(json.load(sys.stdin)["profiles"]))')"
[ "$profiles" -gt 0 ] || fail "Catalogue vide. Lancez: ./seed.sh puis cd backend && bun run seed:videos"
echo "  Catalogue          $profiles profils"

playable="$(curl -fsS -m 30 "$BASE_URL/api/profiles" \
  | python3 -c 'import sys,json; print(sum(1 for p in json.load(sys.stdin)["profiles"] if p["video"]["playbackUrl"]))')"
[ "$playable" -gt 0 ] || fail "Aucune vidéo lisible. Lancez: cd backend && bun run seed:videos"
echo "  Vidéos lisibles    $playable"

mkdir -p "$RUN_DIR"

{
  echo "date: $(date -Is)"
  echo "cpu: $(lscpu 2>/dev/null | sed -n 's/^Model name: *//p')"
  echo "coeurs: $(nproc)"
  echo "ram: $(free -h 2>/dev/null | awk '/^Mem:/{print $2}')"
  echo "kernel: $(uname -r)"
  echo "k6: $(k6 version | head -1)"
  echo "cible: $BASE_URL"
  echo "jeu de donnees: $profiles profils, $playable videos lisibles"
} > "$RUN_DIR/machine.txt"

sample_cpu() {
  local out="$1"
  while true; do
    docker stats --no-stream --format '{{.Name}} {{.CPUPerc}}' 2>/dev/null \
      | grep -E 'back-bun|postgres' >> "$out" || true
    sleep 3
  done
}

peak_cpu() {
  local file="$1" pattern="$2"
  grep "$pattern" "$file" 2>/dev/null | sed 's/.* //; s/%//' \
    | sort -g | tail -1 | awk '{printf "%.0f%%", $1}' || echo "n/a"
}

run_case() {
  local label="$1" script="$2" vus="$3" duration="$4"
  local output="$RUN_DIR/$label.txt"
  local cpu_log="$RUN_DIR/$label.cpu"

  echo
  echo "== $label : $vus VUs pendant $duration =="

  sample_cpu "$cpu_log" & local sampler=$!
  trap 'kill '"$sampler"' 2>/dev/null || true' RETURN

  k6 run -e "BASE_URL=$BASE_URL" -e "VUS=$vus" -e "DURATION=$duration" "$script" \
    > "$output" 2>&1 || true

  kill "$sampler" 2>/dev/null || true

  {
    echo "peak_cpu_backend: $(peak_cpu "$cpu_log" back-bun)"
    echo "peak_cpu_postgres: $(peak_cpu "$cpu_log" postgres)"
  } >> "$output"

  grep -E 'route_|http_req_failed|http_reqs' "$output" | sed 's/^ */  /' || true
  echo "  CPU backend max    $(peak_cpu "$cpu_log" back-bun)"
  echo "  CPU postgres max   $(peak_cpu "$cpu_log" postgres)"
}

for vus in $LEVELS; do
  run_case "browse-${vus}vus" perf/catalogue-browse.js "$vus" "$DURATION"
done

run_case "saturation-${SATURATION_VUS}vus" perf/catalogue-only.js \
  "$SATURATION_VUS" "$SATURATION_DURATION"

echo
echo "== Synthèse =="
python3 perf/summarize.py "$RUN_DIR" | tee "$RUN_DIR/SYNTHESE.md"
echo
echo "Résultats bruts et synthèse : $RUN_DIR"
