#!/usr/bin/env bash
# Convierte una foto real en las versiones WebP que usa la web, con el nombre correcto.
# Requiere ffmpeg (https://ffmpeg.org). Uso:
#   ./herramientas/preparar-foto.sh FOTO.jpg NOMBRE "ANCHOS" PROPORCION
# Ejemplos:
#   ./herramientas/preparar-foto.sh faro.jpg servicio-faros "480 800 1200" 4:3
#   ./herramientas/preparar-foto.sh portada.jpg portada "640 1024 1600" 3:2
#   ./herramientas/preparar-foto.sh insta1.jpg instagram-1 "320 640" 1:1
# La foto se recorta al centro a la proporción indicada.
set -euo pipefail
[ $# -eq 4 ] || { sed -n '2,10p' "$0"; exit 1; }
foto="$1"; nombre="$2"; anchos="$3"; prop="$4"
destino="$(cd "$(dirname "$0")/.." && pwd)/web/assets/img"
pw="${prop%%:*}"; ph="${prop##*:}"
for w in $anchos; do
  h=$(( w * ph / pw ))
  ffmpeg -loglevel error -y -i "$foto" \
    -vf "scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}" \
    -c:v libwebp -quality 78 -compression_level 6 "$destino/${nombre}-${w}.webp"
  echo "  $destino/${nombre}-${w}.webp"
done
