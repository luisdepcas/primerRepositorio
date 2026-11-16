# Garbicar · prototipo de web nueva

Web estática (HTML, CSS y JavaScript sin frameworks) para Garbicar, taller de detailing en Segovia. Está pensada para el hosting estático de IONOS: no necesita PHP, base de datos ni Node.

```
garbicar/
├── web/                 ← ESTO es lo que se sube al hosting
│   ├── index.html
│   ├── aviso-legal.html, politica-privacidad.html,
│   │   politica-cookies.html, condiciones-contratacion.html
│   ├── .htaccess        (compresión, caché y redirecciones de la web antigua)
│   ├── robots.txt, sitemap.xml, favicon.ico, apple-touch-icon.png
│   └── assets/  css/  js/  fonts/  img/  video/
├── herramientas/        ← ayudas para preparar fotos y vídeos (no se suben)
├── capturas/            ← capturas en móvil (390 px) y escritorio (1440 px)
└── README.md
```

Para verla en local basta con abrir `web/index.html` en el navegador. Todas las rutas son relativas.

---

## Qué falta (está marcado en la web)

Todo lo pendiente se ve en la web con un recuadro gris o con un borde discontinuo:

| Pendiente | Dónde está | Qué hacer |
|---|---|---|
| **Fotos reales** de trabajos (portada, 6 servicios, 6 parejas de antes/después, 6 de Instagram) | `web/assets/img/` (marcadores grises "Foto real: …") | Ver "Cambiar las fotos" |
| **Vídeo real** del faro para el efecto de scroll | `index.html`, sección `id="recorrido"` | Ver "Poner el vídeo" |
| **Precios** "Desde X €" | `index.html`, uno por servicio | Ver "Cambiar los precios" |
| **Horario** (sacado de un directorio, sin confirmar) | `main.js`, `index.html` (tabla y JSON-LD) | Ver "Cambiar el horario" |
| **Reseñas de Google** | `index.html`, sección "Lo que dicen los clientes" | Ver "Añadir reseñas" |
| **Logo en SVG** | Ahora se usa el logo de la web actual, recortado sobre fondo transparente | Cuando llegue el SVG, sustituir `assets/img/logo-garbicar.webp` (horizontal, sin hexágono) y `logo-garbicar-completo.webp` (con hexágono) |
| **Textos legales** | Las 4 páginas legales | Ver "Avisos sobre los textos legales" |

> De las 6 fotos que tiene ahora garbicar.com, 5 parecen fotos de banco de imágenes (el faro del Porsche, la mano con guante, los asientos de cuero…). Por eso no se han usado: la web solo debe enseñar coches tratados en el taller. La del techo tapizado sobre fondo negro podría ser suya; si lo es, se puede usar.

---

## Cambiar las fotos

Cada foto se sirve en WebP y en varios tamaños (`srcset`): el móvil descarga la pequeña y el ordenador la grande. **Basta con sustituir los archivos manteniendo el mismo nombre**; no hay que tocar el HTML.

| Archivo(s) | Proporción | Tamaños (px de ancho) | Qué foto va |
|---|---|---|---|
| `portada-*.webp` | 3:2 | 640, 1024, 1600 | Coche terminado, con buena luz. En escritorio se recorta por los lados, así que el coche debe ir centrado |
| `servicio-limpieza-*.webp` | 4:3 | 480, 800, 1200 | Interior recién limpiado |
| `servicio-pulido-*.webp` | 4:3 | 480, 800, 1200 | Reflejo en la carrocería pulida |
| `servicio-ceramico-*.webp` | 4:3 | 480, 800, 1200 | Coche con cerámico recién aplicado |
| `servicio-faros-*.webp` | 4:3 | 480, 800, 1200 | Faro recién pulido |
| `servicio-techos-*.webp` | 4:3 | 480, 800, 1200 | Techo tapizado montado |
| `servicio-tapiceria-*.webp` | 4:3 | 480, 800, 1200 | Asientos de cuero |
| `ad-faros-1-antes-*.webp` / `ad-faros-1-despues-*.webp` (y `faros-2`, `pintura-1`, `pintura-2`, `techo-1`, `interior-1`) | 4:3 | 480, 800, 1200 | Parejas antes/después **con el mismo encuadre** |
| `instagram-1-*.webp` … `instagram-6-*.webp` | 1:1 | 320, 640 | Publicaciones de Instagram |
| `faro-proceso-*.webp` | 16:9 | 640, 1024, 1600 | Fotograma del vídeo del faro (se ve en móvil) |

**Forma rápida (con ffmpeg instalado):**

```bash
./herramientas/preparar-foto.sh faro.jpg servicio-faros "480 800 1200" 4:3
./herramientas/preparar-foto.sh portada.jpg portada "640 1024 1600" 3:2
./herramientas/preparar-foto.sh antes.jpg ad-faros-1-antes "480 800 1200" 4:3
```

**Sin instalar nada:** abrir la foto en [squoosh.app](https://squoosh.app), recortarla a la proporción, elegir formato WebP (calidad ~75), redimensionar a cada ancho y guardar con el nombre de la tabla.

Si cambia lo que sale en una foto, actualiza también su texto alternativo (`alt="…"`) en `index.html`. Sirve para Google y para personas ciegas.

Para **añadir o quitar parejas de antes/después**, copia o borra un bloque `<li data-tipo="…">` en `index.html`. `data-tipo` puede ser `faros`, `pintura`, `techos` o `interior`, y es lo que usan los filtros.

## Poner el vídeo (efecto de scroll)

1. Grabar el faro de principio a fin con el móvil quieto (en trípode) y la misma luz. De 5 a 10 segundos de vídeo final son suficientes.
2. Prepararlo (sin audio, H.264 con GOP corto para que avance suave):
   ```bash
   ./herramientas/preparar-video.sh faro-original.mp4 faro-proceso
   ```
   Crea `web/assets/video/faro-proceso.mp4` y la foto fija `faro-proceso-*.webp`. Sin el script, el comando equivalente es:
   ```bash
   ffmpeg -i original.mp4 -an -c:v libx264 -preset slow -crf 24 -g 8 -keyint_min 8 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart -vf scale=1280:-2 faro-proceso.mp4
   ```
3. En `index.html`, en la sección `id="recorrido"`, cambiar `data-video=""` por `data-video="assets/video/faro-proceso.mp4"`.

En pantallas de 900 px o más, el vídeo avanza con el scroll. En móvil, y si el usuario tiene activado "reducir movimiento", se ve la foto fija, como pide el encargo. Si el vídeo no carga, también se queda la foto. Si más adelante se quiere activar en móvil, conviene codificarlo con `-g 4` y cambiar la condición `min-width: 900px` al principio de `assets/js/recorrido.js`.

El motor se basa en la técnica de [scroll-world](https://github.com/oso95/scroll-world) (licencia MIT): el vídeo se carga como blob y el scroll mueve `currentTime`. Solo se usa con vídeo real; la parte de generación con IA no se usa.

## Cambiar los precios

En `index.html`, cada servicio tiene esta línea:

```html
<p class="precio"><span class="pendiente" title="Precio pendiente de confirmar por el negocio">Desde X €</span></p>
```

Cuando el taller dé el precio, se deja así (sin la clase `pendiente`):

```html
<p class="precio">Desde [precio] €</p>
```

Si para algún servicio no queréis poner precio, se puede borrar la línea entera.

## Cambiar el horario

Está en **tres sitios** y hay que cambiar los tres:

1. **`web/assets/js/main.js`**, al principio (`HORARIO`). Calcula el "Abierto ahora / Cerrado, abre a las…" con la hora de Madrid y los días que salen en el formulario. Ahí también se pueden añadir festivos o vacaciones en `CERRADO_EXTRA` (formato `'2026-12-08'`).
2. **`web/index.html`**, tabla de la sección "Dónde estamos". Es lo que lee la gente.
3. **`web/index.html`**, bloque `application/ld+json` del `<head>` (`openingHoursSpecification`). Es lo que lee Google.

Cuando esté confirmado, borra el `<p class="pendiente">Horario pendiente de confirmar</p>`.

## Añadir reseñas

Solo reseñas **reales** de la ficha de Google, copiadas tal cual, con el nombre de pila y un enlace a la reseña original. Hay una plantilla comentada en `index.html`, dentro de la sección "Lo que dicen los clientes". Al añadirlas, borra el recuadro "Pendiente".

## Avisos sobre los textos legales

Los textos se han copiado de la web actual, como pedía el encargo, pero conviene que los revise su asesor antes de publicar:

- **Condiciones de contratación:** son una plantilla de tienda online (carrito, envíos, devoluciones) y **en dos sitios nombran otra web, www.jabonesluyjo.com**.
- **Política de privacidad:** cita la LOPD 15/1999, que ya no está en vigor (ahora rige el RGPD y la LOPDGDD 3/2018). Su apartado de cookies hablaba de Google Analytics y de cookies de PHP de la web antigua, así que se ha quitado y se ha sustituido por dos apartados nuevos: cómo funciona el formulario por WhatsApp y un enlace a la política de cookies.
- **Política de cookies:** es nueva, porque la web actual no tiene. Dice lo que hace esta web: no usa cookies, ni analítica, ni nada de terceros hasta que el usuario pulsa un enlace externo. Por eso **no hace falta banner de cookies**. Si algún día se añade analítica, habrá que poner un banner con opción real de rechazar y actualizar esta página.
- El aviso legal se ha dejado tal cual.

Cada página lleva arriba un recuadro que explica esto. Hay que quitarlo antes de publicar.

## Subir la web a IONOS

Hay que subir **el contenido de la carpeta `web/`** (no la carpeta en sí) al directorio raíz del dominio en el Webspace.

**Con FTP/SFTP (por ejemplo, FileZilla):**
1. En el panel de IONOS: *Hosting → SFTP y SSH* (o *FTP*). Ahí están el servidor, el usuario y la contraseña.
2. En FileZilla: *Archivo → Gestor de sitios → Nuevo sitio*, protocolo SFTP (puerto 22), y poner esos datos.
3. A la izquierda, abrir la carpeta `web/`. A la derecha, la carpeta del dominio (la que figura en *Dominios → garbicar.com → Destino*).
4. Seleccionar todo lo de `web/` y arrastrarlo a la derecha. Activar *Servidor → Forzar mostrar archivos ocultos* para que suba también el `.htaccess`.

**Con el gestor de archivos de IONOS (Webspace Explorer):**
1. Panel de IONOS → *Hosting → Webspace* (o *Explorador de Webspace*).
2. Entrar en la carpeta del dominio y usar *Subir archivos*. Las carpetas se pueden subir arrastrándolas o comprimiendo `web/` en un ZIP y descomprimiéndolo allí mismo.

**Importante:** la web actual parece hecha con el creador de webs de IONOS. Si es así, el dominio apunta a ese creador y no al Webspace. En *Dominios → garbicar.com → Destino* hay que elegir el Webspace y la carpeta donde se ha subido esto. Conviene hacerlo cuando el dueño haya dado el visto bueno.

Después de subirla, comprueba esto:
- La web abre bien en `https://garbicar.com` desde el móvil.
- Al compartir el enlace por WhatsApp sale el logo. Las etiquetas Open Graph usan la ruta absoluta `https://garbicar.com/assets/img/og-garbicar.jpg`; si el dominio es otro, hay que cambiarla en `index.html`, igual que `canonical`, `sitemap.xml` y `robots.txt`.
- El formulario abre WhatsApp con el mensaje.

## Comprobaciones hechas en el prototipo

- Se abre igual desde el archivo local (`file://`) que desde un servidor.
- Las 5 páginas, a 390 px y a 1440 px, no dan errores en la consola, no tienen scroll horizontal y tienen un solo `h1`.
- El formulario no se envía si falta el servicio, el nombre, el teléfono (o es inválido) o la casilla de privacidad. Los mensajes de error son claros y hay un resumen enlazado. Con todo bien, abre `https://wa.me/34644141262?text=…` con el mensaje completo.
- "Reservar este servicio" deja el servicio marcado en el formulario.
- El horario "Abierto / Cerrado, abre a las…" se ha probado con varias horas y con el navegador en otra zona horaria, y siempre usa la hora de Madrid.
- El comparador funciona con ratón, con el dedo y con las flechas del teclado. Los filtros se anuncian a lectores de pantalla.
- El vídeo con scroll se ha probado con un vídeo de prueba que no se ha dejado en la entrega: avanza con el scroll en escritorio y se queda en foto fija en móvil y con "reducir movimiento".
- Lighthouse en móvil (servidor local): Rendimiento 99, Accesibilidad 100, Buenas prácticas 100, SEO 100.

## Créditos

- Tipografía Barlow y Barlow Condensed (licencia SIL OFL, alojada en local; ver `assets/fonts/OFL-Barlow.txt`).
- `assets/js/recorrido.js` se basa en la técnica del motor de [oso95/scroll-world](https://github.com/oso95/scroll-world) (MIT).
- Los marcadores grises se generan con `herramientas/generar-marcadores.py` (Python + Pillow). Solo hace falta para el prototipo.
