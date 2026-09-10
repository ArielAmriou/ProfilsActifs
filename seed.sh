#!/usr/bin/env bash
set -euo pipefail

PROFILES=500
WITH_VIDEO=320
RECRUITERS=40
FAVORITES=900

SEED_DOMAIN="seed.profilsactifs.test"
SEED_PASSWORD="SeedPassword123!"

PASSWORD_HASH="3a1f800b8f072e042fc859142487d74f:687806f618d68c16f6fbd4e52213c63b85a2fac0fa53ee8662e8e9ff4470ccac6fe65d5ef64355a016dafb742cf5ad0e4610defc9d3196f16375705cd6d709f0"

VIDEO_SOURCES=(
  "https://assets.mixkit.co/active_storage/video_items/100018/1718919251/100018-video-720.mp4"
  "https://assets.mixkit.co/active_storage/video_items/100343/1723061803/100343-video-720.mp4"
  "https://assets.mixkit.co/active_storage/video_items/100344/1723061858/100344-video-720.mp4"
  "https://assets.mixkit.co/active_storage/video_items/100355/1723572868/100355-video-720.mp4"
  "https://assets.mixkit.co/active_storage/video_items/100513/1725310200/100513-video-720.mp4"
  "https://assets.mixkit.co/active_storage/video_items/100607/1730159956/100607-video-720.mp4"
  "https://assets.mixkit.co/active_storage/video_items/100608/1730160112/100608-video-720.mp4"
  "https://assets.mixkit.co/active_storage/video_items/100611/1730160284/100611-video-720.mp4"
  "https://assets.mixkit.co/active_storage/video_items/100626/1730161374/100626-video-720.mp4"
  "https://assets.mixkit.co/active_storage/video_items/100627/1730161415/100627-video-720.mp4"
  "https://assets.mixkit.co/active_storage/video_items/99858/1717181635/99858-video-720.mp4"
)

ROOT="$(pwd)"
BACKEND_DIR="$ROOT/backend"
VIDEO_STORAGE_PATH="${VIDEO_STORAGE_PATH:-$BACKEND_DIR/var/videos}"

for tool in curl ffmpeg; do
  command -v "$tool" >/dev/null 2>&1 || { echo "$tool is required." >&2; exit 1; }
done

if [[ -z "${DATABASE_URL:-}" ]]; then
  DATABASE_URL="$(grep -E '^[[:space:]]*DATABASE_URL=' "$BACKEND_DIR/.env" | tail -1 | cut -d= -f2-)"
  DATABASE_URL="${DATABASE_URL//\"/}"
  DATABASE_URL="${DATABASE_URL//@db:/@localhost:}"
fi

after_at="${DATABASE_URL#*@}"
db_user="${DATABASE_URL#*://}"; db_user="${db_user%%:*}"
db_name="${after_at#*/}"; db_name="${db_name%%\?*}"

cd "$ROOT"
if command -v psql >/dev/null 2>&1; then
  run_sql() { psql "$DATABASE_URL" -v ON_ERROR_STOP=1 "$@"; }
else
  run_sql() { docker compose exec -T db psql -U "$db_user" -d "$db_name" -v ON_ERROR_STOP=1 "$@"; }
fi

run_sql -c 'SELECT 1' >/dev/null 2>&1 || {
  echo "Database unreachable. Start it: docker compose up -d db" >&2
  exit 1
}

cgu_version="$(sed -n 's/.*CGU_VERSION *= *"\([^"]*\)".*/\1/p' "$BACKEND_DIR/src/config/cgu.ts")"

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT
mkdir -p "$VIDEO_STORAGE_PATH"

FIRSTNAMES=(Amina Lucas Chloé Mehdi Sarah Thomas Inès Hugo Camille Yanis Léa Nathan Manon Rayan
  Julie Antoine Nour Maxime Emma Samir Clara Enzo Lina Paul Fatou Adrien Zoé Karim Alice Victor
  Sofia Gabriel Jade Ilyes Louise Théo Anaïs Malik Eva Raphaël)

LASTNAMES=(Martin Bernard Dubois Thomas Robert Petit Durand Leroy Moreau Simon Laurent Lefebvre
  Michel Garcia David Bertrand Roux Vincent Fournier Morel Girard Mercier Blanc Guerin Boyer
  Garnier Chevalier Legrand Benali Traoré Nguyen Diallo Sanchez Lopez Marchand Dumont Fontaine)

TITLES=("Développeur full-stack" "Développeuse front-end" "Ingénieur DevOps" "Data analyst"
  "Data scientist" "Chef de projet digital" "Product owner" "Designer UI/UX"
  "Administrateur systèmes" "Technicien support" "Ingénieure QA" "Architecte logiciel"
  "Chargé de communication" "Community manager" "Comptable" "Contrôleur de gestion"
  "Assistant RH" "Chargée de recrutement" "Commercial B2B" "Responsable marketing"
  "Infirmier" "Aide-soignante" "Électricien" "Conducteur de travaux" "Cuisinier")

SECTORS=(Informatique Santé Finance Industrie Commerce Éducation Bâtiment Logistique
  Restauration Communication Énergie Transport)

LOCATIONS=(Paris Lyon Marseille Toulouse Nantes Bordeaux Lille Rennes Strasbourg Montpellier
  Nice Grenoble Rouen Reims Dijon Angers "Le Havre" "Clermont-Ferrand" Tours Limoges)

AVAILABILITIES=("Immédiate" "Sous 1 mois" "Sous 2 mois" "Sous 3 mois" "À partir de septembre")

SKILLS=(JavaScript TypeScript React "Node.js" Python SQL Docker Git Communication
  "Travail en équipe" "Gestion de projet" Autonomie Rigueur "Anglais courant" Espagnol Excel
  Figma Photoshop Rédaction Négociation "Relation client" Organisation Adaptabilité Leadership
  "Analyse de données" "Power BI" Comptabilité "Normes de sécurité")

RANDOM=20260909

pick() {
  local -n pool=$1
  printf '%s' "${pool[RANDOM % ${#pool[@]}]}"
}

quote() {
  printf "'%s'" "${1//\'/\'\'}"
}

skills_literal() {
  local count=$((3 + RANDOM % 4)) i literal=""
  for ((i = 0; i < count; i++)); do
    [[ -n "$literal" ]] && literal+=","
    literal+="$(quote "$(pick SKILLS)")"
  done
  printf 'ARRAY[%s]::text[]' "$literal"
}

birthdate_literal() {
  printf "TIMESTAMP '%04d-%02d-%02d 00:00:00'" \
    $((1975 + RANDOM % 30)) $((1 + RANDOM % 12)) $((1 + RANDOM % 28))
}

echo "Accounts ($PROFILES profiles + $RECRUITERS recruiters)"

users_sql="$workdir/users.sql"
{
  echo "INSERT INTO users (id, firstname, lastname, name, email, email_verified, role, title,"
  echo "  sector, location, availability, skills, certified, cgu_accepted_at, cgu_version,"
  echo "  created_at, updated_at, birthdate) VALUES"
} > "$users_sql"

separator=""
for ((i = 1; i <= PROFILES; i++)); do
  firstname="$(pick FIRSTNAMES)"
  lastname="$(pick LASTNAMES)"
  certified=$([[ $((RANDOM % 10)) -lt 4 ]] && echo true || echo false)
  printf '%s (gen_random_uuid(), %s, %s, %s, %s, true, %s, %s, %s, %s, %s, %s, %s, now(), %s, now(), now(), %s)\n' \
    "$separator" \
    "$(quote "$firstname")" "$(quote "$lastname")" "$(quote "$firstname $lastname")" \
    "$(quote "$(printf 'jobseeker-%03d@%s' "$i" "$SEED_DOMAIN")")" \
    "$(quote jobseeker)" "$(quote "$(pick TITLES)")" "$(quote "$(pick SECTORS)")" \
    "$(quote "$(pick LOCATIONS)")" "$(quote "$(pick AVAILABILITIES)")" \
    "$(skills_literal)" "$certified" "$(quote "$cgu_version")" "$(birthdate_literal)" \
    >> "$users_sql"
  separator=","
done

for ((i = 1; i <= RECRUITERS; i++)); do
  firstname="$(pick FIRSTNAMES)"
  lastname="$(pick LASTNAMES)"
  printf '%s (gen_random_uuid(), %s, %s, %s, %s, true, %s, NULL, NULL, NULL, NULL, ARRAY[]::text[], false, now(), %s, now(), now(), %s)\n' \
    "$separator" \
    "$(quote "$firstname")" "$(quote "$lastname")" "$(quote "$firstname $lastname")" \
    "$(quote "$(printf 'recruiter-%03d@%s' "$i" "$SEED_DOMAIN")")" \
    "$(quote recruiter)" "$(quote "$cgu_version")" "$(birthdate_literal)" \
    >> "$users_sql"
done

echo "ON CONFLICT (email) DO NOTHING;" >> "$users_sql"

cat >> "$users_sql" <<SQL
INSERT INTO account (id, user_id, issuer, account_id, provider_id, password, created_at, updated_at)
SELECT gen_random_uuid()::text, u.id, 'local:credential', u.id::text, 'credential',
       '$PASSWORD_HASH', now(), now()
FROM users u
WHERE u.email LIKE '%@$SEED_DOMAIN'
  AND NOT EXISTS (SELECT 1 FROM account a WHERE a.user_id = u.id);
SQL

run_sql --single-transaction -q < "$users_sql"

echo "Videos ($WITH_VIDEO profiles)"

run_sql -t -A -c "
  INSERT INTO videos (id, user_id, provider_name, provider_id, status, size, created_at, updated_at)
  SELECT gen_random_uuid(), u.id, 'local', gen_random_uuid()::text, 'READY', NULL, now(), now()
  FROM (
    SELECT batch.id FROM (
      SELECT u.id FROM users u
      WHERE u.email LIKE 'jobseeker-%@$SEED_DOMAIN'
      ORDER BY u.email
      LIMIT $WITH_VIDEO
    ) batch
    WHERE NOT EXISTS (SELECT 1 FROM videos v WHERE v.user_id = batch.id)
  ) u
  RETURNING provider_id;" > "$workdir/new_ids.txt"

pool=()
if grep -qE '^[0-9a-f]{8}-' "$workdir/new_ids.txt"; then
  sources=()
  for url in "${VIDEO_SOURCES[@]}"; do
    path="$workdir/$(basename "$url")"
    curl -fsSL -m 180 -o "$path" "$url" 2>/dev/null && sources+=("$path")
  done
  (( ${#sources[@]} > 0 )) || { echo "No source video could be downloaded." >&2; exit 1; }

  for ((i = 0; i < 16; i++)); do
    out="$workdir/pool-$i.mp4"
    ffmpeg -v error -y -ss "$((RANDOM % 5))" -i "${sources[i % ${#sources[@]}]}" \
      -t "$((6 + RANDOM % 5))" -c:v libx264 -preset veryfast -crf 30 -c:a aac -b:a 64k \
      -movflags +faststart "$out" 2>/dev/null && pool+=("$out")
  done
fi

sizes_sql="$workdir/sizes.sql"
echo "UPDATE videos v SET size = s.size::int FROM (VALUES" > "$sizes_sql"

written=0
separator=""
while read -r provider_id; do
  [[ "$provider_id" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]] || continue
  source_file="${pool[written % ${#pool[@]}]}"
  cp "$source_file" "$VIDEO_STORAGE_PATH/$provider_id"
  printf '{"mimeType":"video/mp4"}' > "$VIDEO_STORAGE_PATH/$provider_id.json"
  printf '%s (%s, %s)\n' "$separator" "$(quote "$provider_id")" "$(stat -c%s "$source_file")" >> "$sizes_sql"
  separator=","
  written=$((written + 1))
done < "$workdir/new_ids.txt"

if (( written > 0 )); then
  echo ") AS s(provider_id, size) WHERE v.provider_id = s.provider_id;" >> "$sizes_sql"
  run_sql --single-transaction -q < "$sizes_sql"
fi

echo "Favorites ($FAVORITES)"

favorites_sql="$workdir/favorites.sql"
declare -A seen_pairs=()
{
  echo "INSERT INTO favorites (favorited_user_id, user_id, created_at)"
  echo "SELECT j.id, r.id, now() - (random() * interval '30 days') FROM (VALUES"
} > "$favorites_sql"

separator=""
generated=0
while (( generated < FAVORITES )); do
  key="$((1 + RANDOM % PROFILES)):$((1 + RANDOM % RECRUITERS))"
  [[ -n "${seen_pairs[$key]:-}" ]] && continue
  seen_pairs[$key]=1
  printf '%s (%s, %s)\n' "$separator" \
    "$(quote "$(printf 'jobseeker-%03d@%s' "${key%%:*}" "$SEED_DOMAIN")")" \
    "$(quote "$(printf 'recruiter-%03d@%s' "${key##*:}" "$SEED_DOMAIN")")" \
    >> "$favorites_sql"
  separator=","
  generated=$((generated + 1))
done

cat >> "$favorites_sql" <<'SQL'
) AS pair(jobseeker_email, recruiter_email)
JOIN users j ON j.email = pair.jobseeker_email
JOIN users r ON r.email = pair.recruiter_email
ON CONFLICT DO NOTHING;
SQL

cat >> "$favorites_sql" <<SQL
INSERT INTO notifications (id, recipient_id, actor_id, type, payload, created_at)
SELECT gen_random_uuid(), f.favorited_user_id, f.user_id, 'FAVORITE_ADDED',
       jsonb_build_object('profileId', f.favorited_user_id), f.created_at
FROM favorites f
JOIN users u ON u.id = f.favorited_user_id
WHERE u.email LIKE '%@$SEED_DOMAIN'
ON CONFLICT DO NOTHING;
SQL

run_sql --single-transaction -q < "$favorites_sql"

run_sql -q <<SQL
\echo ''
SELECT
  (SELECT count(*) FROM users WHERE role = 'jobseeker')  AS profiles,
  (SELECT count(*) FROM users WHERE role = 'recruiter')  AS recruiters,
  (SELECT count(*) FROM videos WHERE status = 'READY')   AS videos,
  (SELECT count(*) FROM favorites)                       AS favorites,
  (SELECT count(*) FROM notifications)                   AS notifications;
SQL

echo "Connexion : jobseeker-001@$SEED_DOMAIN ou recruiter-001@$SEED_DOMAIN / $SEED_PASSWORD"
