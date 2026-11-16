#!/usr/bin/env python3
"""Genera los marcadores grises ("Foto real: ...") del prototipo.

Solo hace falta para el prototipo. Cuando lleguen las fotos reales se sustituyen
los .webp de web/assets/img/ por las fotos, con el MISMO nombre y tamaños
(ver README.md). Requiere Python 3 + Pillow.

Uso:  python3 herramientas/generar-marcadores.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent / "web" / "assets" / "img"
FUENTES = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
           "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]

# nombre, proporción (ancho, alto), anchos a generar, texto, tono
MARCADORES = [
    ("portada", (3, 2), [640, 1024, 1600], "coche terminado en el taller, buena luz (portada)", "medio"),
    ("faro-proceso", (16, 9), [640, 1024, 1600], "fotograma del vídeo: faro pulido de principio a fin", "medio"),
    ("servicio-limpieza", (4, 3), [480, 800, 1200], "interior recién limpiado (limpieza integral)", "medio"),
    ("servicio-pulido", (4, 3), [480, 800, 1200], "reflejo en la carrocería después del pulido", "medio"),
    ("servicio-ceramico", (4, 3), [480, 800, 1200], "coche con tratamiento cerámico recién aplicado", "medio"),
    ("servicio-faros", (4, 3), [480, 800, 1200], "faro recién pulido", "medio"),
    ("servicio-techos", (4, 3), [480, 800, 1200], "techo tapizado ya montado en el coche", "medio"),
    ("servicio-tapiceria", (4, 3), [480, 800, 1200], "asientos de cuero limpios e hidratados", "medio"),
]
PAREJAS = [
    ("faros-1", "faro amarillento"),
    ("faros-2", "faro opaco"),
    ("pintura-1", "capó con marcas de lavado"),
    ("pintura-2", "puerta con micro-arañazos"),
    ("techo-1", "techo descolgado"),
    ("interior-1", "asiento de tela manchado"),
]
for clave, que in PAREJAS:
    MARCADORES.append((f"ad-{clave}-antes", (4, 3), [480, 800, 1200], f"ANTES · {que}", "oscuro", 0.25))
    MARCADORES.append((f"ad-{clave}-despues", (4, 3), [480, 800, 1200], f"DESPUÉS · mismo encuadre", "claro", 0.75))
for i in range(1, 7):
    MARCADORES.append((f"instagram-{i}", (1, 1), [320, 640], f"publicación de Instagram {i}", "medio"))

TONOS = {"claro": ((222, 219, 213), (60, 58, 54)),
         "medio": ((205, 202, 196), (52, 50, 47)),
         "oscuro": ((160, 157, 151), (25, 24, 22))}


def envolver(draw, texto, fuente, ancho_max):
    palabras, lineas, actual = texto.split(), [], ""
    for p in palabras:
        prueba = (actual + " " + p).strip()
        if draw.textlength(prueba, font=fuente) <= ancho_max:
            actual = prueba
        else:
            lineas.append(actual); actual = p
    lineas.append(actual)
    return lineas


def marcador(nombre, prop, anchos, texto, tono, cx=0.5):
    fondo, tinta = TONOS[tono]
    for w in anchos:
        h = round(w * prop[1] / prop[0])
        im = Image.new("RGB", (w, h), fondo)
        d = ImageDraw.Draw(im)
        t1 = max(12, w // 26)
        f1 = ImageFont.truetype(FUENTES[1], t1)
        f2 = ImageFont.truetype(FUENTES[0], max(11, int(t1 * 0.8)))
        lineas = envolver(d, texto, f2, w * (0.4 if cx != 0.5 or nombre == "portada" else 0.78))
        alto = t1 * 1.5 + len(lineas) * t1 * 1.1
        y = (h - alto) / 2
        d.text((w * cx, y), "Foto real:", font=f1, fill=tinta, anchor="mt")
        y += t1 * 1.5
        for l in lineas:
            d.text((w * cx, y), l, font=f2, fill=tinta, anchor="mt"); y += t1 * 1.1
        im.save(RAIZ / f"{nombre}-{w}.webp", "WEBP", quality=72, method=6)


if __name__ == "__main__":
    RAIZ.mkdir(parents=True, exist_ok=True)
    for m in MARCADORES:
        marcador(*m)
    print(f"{len(MARCADORES)} marcadores generados en {RAIZ}")
