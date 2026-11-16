/* Garbicar · main.js (vanilla, sin dependencias) */
(function () {
  'use strict';

  /* ===================== CONFIGURACIÓN =====================
     Horario del taller (hora de Madrid). Días: 0 = domingo … 6 = sábado.
     Si cambia el horario, cámbialo aquí Y en index.html (tabla de
     "Dónde estamos" y bloque JSON-LD del <head>). Ver README. */
  var HORARIO = {
    0: [],
    1: [['09:00', '13:30'], ['16:00', '18:30']],
    2: [['09:00', '13:30'], ['16:00', '18:30']],
    3: [['09:00', '13:30'], ['16:00', '18:30']],
    4: [['09:00', '13:30'], ['16:00', '18:30']],
    5: [['09:00', '13:30'], ['16:00', '18:30']],
    6: []
  };
  /* Días en los que el taller cierra aunque sean laborables (festivos, vacaciones).
     Formato 'AAAA-MM-DD', p. ej. ['2026-12-08', '2026-12-25'] */
  var CERRADO_EXTRA = [];
  var WHATSAPP = '34644141262';
  var DIAS_EN_DESPLEGABLE = 10;
  /* ========================================================= */

  var ZONA = 'Europe/Madrid';
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
    'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- Fecha y hora en Madrid ---------- */
  function ahoraMadrid() {
    var partes = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short'
    }).formatToParts(new Date()).forEach(function (p) { partes[p.type] = p.value; });
    var dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      y: +partes.year, m: +partes.month, d: +partes.day,
      dow: dias[partes.weekday],
      min: (+partes.hour % 24) * 60 + (+partes.minute)
    };
  }
  function aMin(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + (+p[1]); }
  function bonita(hhmm) { return hhmm.replace(/^0/, ''); }
  function fechaISO(dt) { return dt.toISOString().slice(0, 10); }
  function abreEse(dow, iso) { return HORARIO[dow].length && CERRADO_EXTRA.indexOf(iso) === -1; }

  /* ---------- Menú móvil ---------- */
  var botonMenu = $('.cabecera__menu');
  var menu = $('#menu');
  if (botonMenu && menu) {
    var cerrarMenu = function () {
      menu.classList.remove('abierto');
      botonMenu.setAttribute('aria-expanded', 'false');
      $('.oculto', botonMenu).textContent = 'Abrir menú';
    };
    botonMenu.addEventListener('click', function () {
      var abrir = botonMenu.getAttribute('aria-expanded') !== 'true';
      menu.classList.toggle('abierto', abrir);
      botonMenu.setAttribute('aria-expanded', String(abrir));
      $('.oculto', botonMenu).textContent = abrir ? 'Cerrar menú' : 'Abrir menú';
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', cerrarMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('abierto')) { cerrarMenu(); botonMenu.focus(); }
    });
  }

  /* ---------- "Reservar este servicio" ---------- */
  $$('.reservar').forEach(function (b) {
    b.addEventListener('click', function () {
      var valor = b.getAttribute('data-servicio');
      $$('input[name="servicio"]').forEach(function (c) { if (c.value === valor) c.checked = true; });
      limpiarError('servicio');
      // Tras el salto al formulario, llevar el foco al título para lectores de pantalla
      setTimeout(function () { var t = $('#t-cita'); if (t) t.focus({ preventScroll: true }); }, 50);
    });
  });

  /* ---------- Antes y después ---------- */
  $$('.comparador').forEach(function (comp) {
    var rango = $('input[type="range"]', comp);
    function pintar() {
      comp.style.setProperty('--pos', rango.value + '%');
      rango.setAttribute('aria-valuetext', rango.value + ' % de la foto de antes');
    }
    function desdePuntero(e) {
      var r = comp.getBoundingClientRect();
      var v = Math.round(Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100)));
      rango.value = v; pintar();
    }
    var arrastrando = false;
    comp.addEventListener('pointerdown', function (e) {
      arrastrando = true; desdePuntero(e);
      try { comp.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
    });
    comp.addEventListener('pointermove', function (e) { if (arrastrando) desdePuntero(e); });
    ['pointerup', 'pointercancel'].forEach(function (t) {
      comp.addEventListener(t, function () { arrastrando = false; });
    });
    rango.addEventListener('input', pintar);
    rango.addEventListener('focus', function () { if (rango.matches(':focus-visible')) comp.classList.add('con-foco'); });
    rango.addEventListener('blur', function () { comp.classList.remove('con-foco'); });
    pintar();
  });

  var filtros = $$('.filtro');
  var estadoFiltro = $('#filtro-estado');
  filtros.forEach(function (f) {
    f.addEventListener('click', function () {
      var tipo = f.getAttribute('data-filtro');
      filtros.forEach(function (o) { o.setAttribute('aria-pressed', String(o === f)); });
      var n = 0;
      $$('.comparadores > li').forEach(function (li) {
        var ver = tipo === 'todos' || li.getAttribute('data-tipo') === tipo;
        li.hidden = !ver; if (ver) n++;
      });
      if (estadoFiltro) {
        estadoFiltro.textContent = 'Mostrando ' + n + (n === 1 ? ' trabajo' : ' trabajos') +
          (tipo === 'todos' ? '' : ' de ' + f.textContent.toLowerCase());
      }
    });
  });

  /* ---------- Copiar teléfono ---------- */
  var botonCopiar = $('#copiar-tel');
  if (botonCopiar) {
    var avisoCopia = $('#copiar-estado');
    var avisar = function (t) {
      avisoCopia.textContent = t;
      clearTimeout(avisar.t); avisar.t = setTimeout(function () { avisoCopia.textContent = ''; }, 4000);
    };
    var copiarAMano = function (texto) {
      var ta = document.createElement('textarea');
      ta.value = texto; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    };
    botonCopiar.addEventListener('click', function () {
      var texto = botonCopiar.getAttribute('data-copiar');
      var hecho = function () { avisar('Copiado: ' + texto); };
      var fallo = function () {
        if (copiarAMano(texto)) hecho();
        else avisar('No se ha podido copiar. Mantén pulsado el número para copiarlo.');
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(hecho, fallo);
      } else { fallo(); }
    });
  }

  /* ---------- Horario: abierto / cerrado ---------- */
  var estado = $('#estado-horario');
  function pintarEstado() {
    if (!estado) return;
    var a = ahoraMadrid();
    var hoyISO = fechaISO(new Date(Date.UTC(a.y, a.m - 1, a.d)));
    var tramos = abreEse(a.dow, hoyISO) ? HORARIO[a.dow] : [];
    for (var i = 0; i < tramos.length; i++) {
      if (a.min >= aMin(tramos[i][0]) && a.min < aMin(tramos[i][1])) {
        estado.textContent = 'Abierto ahora · cierra a las ' + bonita(tramos[i][1]);
        estado.classList.add('abierto');
        return;
      }
    }
    estado.classList.remove('abierto');
    for (var j = 0; j < tramos.length; j++) {
      if (a.min < aMin(tramos[j][0])) {
        estado.textContent = 'Cerrado ahora · abre hoy a las ' + bonita(tramos[j][0]);
        return;
      }
    }
    for (var k = 1; k <= 14; k++) {
      var dt = new Date(Date.UTC(a.y, a.m - 1, a.d + k));
      var dow = dt.getUTCDay();
      if (abreEse(dow, fechaISO(dt))) {
        var cuando = k === 1 ? 'mañana' : 'el ' + DIAS[dow];
        estado.textContent = 'Cerrado ahora · abre ' + cuando + ' a las ' + bonita(HORARIO[dow][0][0]);
        return;
      }
    }
    estado.textContent = 'Cerrado ahora';
  }
  pintarEstado();
  setInterval(pintarEstado, 60000);

  /* ---------- Formulario de cita → WhatsApp ---------- */
  var form = $('#form-cita');
  if (!form) return;

  // Próximos días laborables (empezando mañana)
  var selDia = $('#dia');
  (function () {
    var a = ahoraMadrid(), puestos = 0;
    for (var k = 1; puestos < DIAS_EN_DESPLEGABLE && k < 40; k++) {
      var dt = new Date(Date.UTC(a.y, a.m - 1, a.d + k));
      var dow = dt.getUTCDay();
      if (!abreEse(dow, fechaISO(dt))) continue;
      var texto = DIAS[dow] + ' ' + dt.getUTCDate() + ' de ' + MESES[dt.getUTCMonth()];
      var op = document.createElement('option');
      op.value = texto; op.textContent = (k === 1 ? 'Mañana, ' : '') + texto;
      selDia.appendChild(op);
      puestos++;
    }
  })();

  var cajaErrores = $('#errores');
  var CAMPOS = {
    servicio: { foco: function () { return $('input[name="servicio"]'); }, caja: '#campo-servicio' },
    nombre: { foco: function () { return $('#nombre'); } },
    telefono: { foco: function () { return $('#telefono'); } },
    privacidad: { foco: function () { return $('#privacidad'); } }
  };

  function ponerError(nombre, msg) {
    $('#err-' + nombre).textContent = msg;
    var c = CAMPOS[nombre];
    if (c.caja) $(c.caja).classList.add('campo--error');
    else c.foco().setAttribute('aria-invalid', 'true');
  }
  function limpiarError(nombre) {
    var p = $('#err-' + nombre); if (p) p.textContent = '';
    var c = CAMPOS[nombre]; if (!c) return;
    if (c.caja) $(c.caja).classList.remove('campo--error');
    else c.foco().removeAttribute('aria-invalid');
  }

  function telefonoValido(t) {
    var limpio = t.replace(/[\s.\-()]/g, '');
    if (/^(\+34|0034)?[6789]\d{8}$/.test(limpio)) return true;      // España
    return /^(\+|00)[1-9]\d{7,14}$/.test(limpio);                     // extranjero
  }

  function validar() {
    var errores = [];
    var servicios = $$('input[name="servicio"]:checked').map(function (c) { return c.value; });
    var nombre = $('#nombre').value.trim();
    var tel = $('#telefono').value.trim();
    Object.keys(CAMPOS).forEach(limpiarError);

    if (!servicios.length) errores.push(['servicio', 'Marca al menos un servicio.']);
    if (nombre.length < 2) errores.push(['nombre', 'Escribe tu nombre.']);
    if (!tel) errores.push(['telefono', 'Escribe un teléfono para que podamos contestarte.']);
    else if (!telefonoValido(tel)) errores.push(['telefono', 'Revisa el teléfono: tiene que tener 9 cifras (por ejemplo, 600 123 456).']);
    if (!$('#privacidad').checked) errores.push(['privacidad', 'Tienes que aceptar la política de privacidad.']);

    errores.forEach(function (e) { ponerError(e[0], e[1]); });
    return { errores: errores, servicios: servicios, nombre: nombre, tel: tel };
  }

  function mostrarResumen(errores) {
    var ul = $('ul', cajaErrores);
    ul.innerHTML = '';
    errores.forEach(function (e) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#'; a.textContent = e[1];
      a.addEventListener('click', function (ev) { ev.preventDefault(); CAMPOS[e[0]].foco().focus(); });
      li.appendChild(a); ul.appendChild(li);
    });
    cajaErrores.hidden = false;
    cajaErrores.focus();
  }

  function montarMensaje(d) {
    var franja = ($('input[name="franja"]:checked') || {}).value || '';
    var lineas = [
      'Hola, quería pedir cita en Garbicar.',
      '',
      'Servicio: ' + d.servicios.join(', '),
      'Día que me vendría bien: ' + (selDia.value || 'me da igual'),
      'Mejor por la: ' + (franja || 'me da igual'),
      'Nombre: ' + d.nombre,
      'Teléfono: ' + d.tel
    ];
    var coche = $('#coche').value.trim();
    var comentario = $('#comentario').value.trim();
    if (coche) lineas.push('Coche: ' + coche);
    if (comentario) lineas.push('Comentario: ' + comentario);
    return lineas.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = $('#form-ok');
    ok.textContent = '';
    var d = validar();
    if (d.errores.length) { mostrarResumen(d.errores); return; }
    cajaErrores.hidden = true;

    var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(montarMensaje(d));
    var movil = window.matchMedia('(pointer: coarse)').matches;
    if (movil) {
      window.location.href = url;
    } else {
      var w = window.open(url, '_blank');
      if (w) { try { w.opener = null; } catch (err) { /* nada */ } } else { window.location.href = url; }
    }
    ok.innerHTML = '';
    ok.appendChild(document.createTextNode('Abriendo WhatsApp con tu mensaje. Si no se abre, '));
    var enlace = document.createElement('a');
    enlace.href = url; enlace.target = '_blank'; enlace.rel = 'noopener';
    enlace.className = 'enlace'; enlace.textContent = 'pulsa aquí';
    ok.appendChild(enlace);
    ok.appendChild(document.createTextNode('.'));
  });

  // Quitar el error de un campo en cuanto se corrige
  form.addEventListener('change', function (e) {
    var n = e.target.name;
    if (n === 'servicio' && $$('input[name="servicio"]:checked').length) limpiarError('servicio');
    if (n === 'privacidad' && e.target.checked) limpiarError('privacidad');
  });
  form.addEventListener('input', function (e) {
    var id = e.target.id;
    if (id === 'nombre' && e.target.value.trim().length >= 2) limpiarError('nombre');
    if (id === 'telefono' && telefonoValido(e.target.value.trim())) limpiarError('telefono');
  });
})();
