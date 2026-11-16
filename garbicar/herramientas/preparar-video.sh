#!/usr/bin/env bash
# Prepara un vídeo real para el efecto de scroll: H.264, sin audio, GOP corto (-g 8)
# para que se pueda saltar a cualquier punto sin tirones. Requiere ffmpeg. Uso:
#   ./herramientas/preparar-video.sh VIDEO-ORIGINAL.mp4 faro-proceso
# Genera web/assets/video/faro-proceso.mp4 (1280 px de ancho) y un fotograma inicial
# como foto fija (faro-proceso-640/1024/1600.webp) para móvil y reduced-motion.
set -euo pipefail
[ $# -eq 2 ] || { sed -n '2,6p' "$0"; exit 1; }
video="$1"; nombre="$2"
raiz="$(cd "$(dirname "$0")/.." && pwd)/web/assets"
ffmpeg -loglevel error -y -i "$video" -an -c:v libx264 -preset slow -crf 24 \
  -g 8 -keyint_min 8 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart \
  -vf "scale=1280:-2" "$raiz/video/${nombre}.mp4"
echo "  $raiz/video/${nombre}.mp4 ($(du -h "$raiz/video/${nombre}.mp4" | cut -f1))"
for w in 640 1024 1600; do
  ffmpeg -loglevel error -y -i "$video" -frames:v 1 \
    -vf "scale=${w}:-2,crop=${w}:trunc(${w}*9/16/2)*2" -c:v libwebp -quality 78 "$raiz/img/${nombre}-${w}.webp"
  echo "  $raiz/img/${nombre}-${w}.webp"
done
