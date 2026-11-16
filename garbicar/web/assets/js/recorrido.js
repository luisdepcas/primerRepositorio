/* Garbicar · recorrido.js
   Vídeo real que avanza con el scroll (sección #recorrido).

   Basado en la técnica del motor scrub-engine.js de oso95/scroll-world (licencia MIT,
   https://github.com/oso95/scroll-world): el vídeo se carga como Blob para que siempre
   se pueda saltar a cualquier punto, el scroll solo marca el tiempo (currentTime), no se
   pide un salto nuevo mientras el anterior no ha terminado (video.seeking) y en iOS se
   "despierta" el vídeo con el primer toque. Solo vídeo real: nada de generación con IA.

   Cuándo se activa: si la sección tiene data-video con la ruta de un MP4, la pantalla
   mide 900 px o más y el usuario no ha pedido reducir el movimiento. En cualquier otro
   caso (móvil, reduced-motion, sin vídeo, error de carga) se queda la foto fija. */
(function () {
  'use strict';

  var seccion = document.getElementById('recorrido');
  if (!seccion) return;
  var ruta = (seccion.getAttribute('data-video') || '').trim();
  if (!ruta) return;                                   // vídeo pendiente: se queda la foto

  var cumple = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
  if (!cumple.matches) return;

  var marco = seccion.querySelector('.recorrido__marco');
  var rotulos = Array.prototype.slice.call(seccion.querySelectorAll('[data-rotulo]'));
  var video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  video.setAttribute('muted', ''); video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true'); video.setAttribute('tabindex', '-1');
  video.disablePictureInPicture = true;

  var listo = false, visible = false, objetivo = 0, actual = 0, bucle = 0;

  function desactivar() {
    seccion.classList.remove('recorrido--activo', 'recorrido--listo');
    if (video.parentNode) video.parentNode.removeChild(video);
    cancelAnimationFrame(bucle);
  }

  seccion.classList.add('recorrido--activo');

  function cuandoListo() {
    if (listo) return;
    listo = true;
    marco.appendChild(video);
    seccion.classList.add('recorrido--listo');
    leerScroll();
    arrancar();
  }

  video.addEventListener('loadeddata', cuandoListo, { once: true });
  video.addEventListener('error', desactivar, { once: true });

  // Abierta en local (file://) no se puede usar fetch: se carga el MP4 directamente.
  if (location.protocol === 'file:') {
    video.src = ruta;
  } else {
    fetch(ruta).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.blob();
    }).then(function (blob) {
      video.src = URL.createObjectURL(blob);
    }).catch(function () {
      video.src = ruta;                                 // segundo intento sin blob
    });
  }

  function limitar(v) { return Math.min(1, Math.max(0, v)); }

  function leerScroll() {
    var r = seccion.getBoundingClientRect();
    var recorrido = seccion.offsetHeight - window.innerHeight;
    objetivo = recorrido > 0 ? limitar(-r.top / recorrido) : 0;
    rotulos.forEach(function (el) {
      var es = el.getAttribute('data-rotulo');
      el.classList.toggle('visible', es === 'inicio' ? objetivo < 0.12 : objetivo > 0.9);
    });
  }

  function paso() {
    bucle = 0;
    if (!listo || !visible) return;
    if (!video.seeking) {
      actual += (objetivo - actual) * 0.2;
      if (Math.abs(objetivo - actual) < 0.0005) actual = objetivo;
      var dur = video.duration || 0;
      if (dur) {
        var t = Math.min(actual, 0.999) * dur;
        if (Math.abs(video.currentTime - t) > 0.01) {
          try { video.currentTime = t; } catch (e) { /* nada */ }
        }
      }
    }
    if (actual !== objetivo || video.seeking) arrancar();
  }
  function arrancar() { if (!bucle) bucle = requestAnimationFrame(paso); }

  window.addEventListener('scroll', function () { leerScroll(); arrancar(); }, { passive: true });
  window.addEventListener('resize', function () {
    if (!cumple.matches) { desactivar(); return; }
    leerScroll(); arrancar();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      visible = entradas[0].isIntersecting;
      if (visible) { leerScroll(); arrancar(); }
    }).observe(seccion);
  } else {
    visible = true;
  }

  // iOS/Safari: primer gesto → play/pause en silencio para que el primer salto se pinte.
  function despertar() {
    try {
      var p = video.play();
      if (p && p.then) p.then(function () { video.pause(); }).catch(function () {});
    } catch (e) { /* nada */ }
  }
  window.addEventListener('pointerdown', despertar, { once: true, passive: true });
})();
