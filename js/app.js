// Rymone: comportamiento de la web. Sin dependencias; funciona abriendo index.html directamente.
(function () {
  'use strict';

  // Movimiento siempre activo (muchos móviles traen «reducir movimiento» encendido y dejaban la web quieta).
  // Para revisarla sin animaciones: añadir ?movimiento=reducido a la dirección.
  var reducido = /movimiento=reducido/.test(location.search);
  var punteroFino = matchMedia('(pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Obra y Música son apartados propios (#obra, #musica); lo demás vive en la portada.
  var VISTAS = { obra: 1, musica: 1 };
  function vistaDe(id) { return VISTAS[id] ? id : 'inicio'; }
  var idInicial = decodeURIComponent(location.hash.slice(1));
  document.body.dataset.vista = vistaDe(idInicial);

  // ---------- Canciones ----------
  // audio: null = todavía no hay archivo; la web lo indica sin romperse.
  var CANCIONES = [
    { titulo: 'No me arrepiento', portada: 1, audio: 'audio/no-me-arrepiento.mp3', dur: 117 },
    { titulo: 'Oh no!', portada: 2, audio: 'audio/oh-no.mp3', dur: 125 },
    { titulo: 'Ahora me mata', portada: 3, audio: 'audio/ahora-me-mata.mp3', dur: 140 },
    { titulo: 'Lady', portada: 4, audio: 'audio/lady.mp3', dur: 133 },
    { titulo: 'Dime', portada: 5, audio: 'audio/dime.mp3', dur: 153 },
    { titulo: 'Demonios', portada: 6, audio: 'audio/demonios.mp3', dur: 126 },
    { titulo: 'Me esperan arriba', portada: 7, audio: 'audio/me-esperan-arriba.mp3', dur: 154 },
    { titulo: 'Voy perdido', portada: 8, audio: 'audio/voy-perdido.mp3', dur: 153 }
  ];

  function ajustaCanvas(c) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = c.getBoundingClientRect();
    c.width = Math.max(1, Math.round(r.width * dpr)); c.height = Math.max(1, Math.round(r.height * dpr));
    var ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: r.width, h: r.height };
  }

  // ---------- Bienvenida: la firma se pinta a rotulador y el telón sube ----------
  // Basada en dos preloaders de 21st.dev: «Hand-Lettered Poster Preloader» (la palabra se entinta
  // trazo a trazo mientras sube el contador y luego rebota en ola) y el «Preloader» que sale
  // deslizándose hacia arriba con el borde curvo.
  function siluetaSVG(cls) {
    var S = window.SILUETA; if (!S) return '';
    // trazos sueltos para dibujar el contorno y un relleno único con huecos (evenodd)
    return '<svg class="' + cls + '" viewBox="0 0 ' + S.w + ' ' + S.h + '" aria-hidden="true">' +
      '<g class="trazos">' + S.d.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</g>' +
      '<path class="relleno" fill-rule="evenodd" d="' + S.d.join(' ') + '"/></svg>';
  }
  // logo de la cabecera: la misma silueta, plana
  (function () { var l = $('#logo'); if (l && window.SILUETA) l.innerHTML = siluetaSVG('cabecera__firma'); })();

  (function bienvenida() {
    var capa = $('#bienvenida'); if (!capa) return;
    // quien llega por un enlace directo a Obra o Música entra sin la bienvenida
    if (document.body.dataset.vista !== 'inicio') { capa.remove(); return; }
    document.body.classList.add('con-bienvenida');
    var zona = $('#introFirma'), entrarBtn = $('#entrar'), carga = $('#carga'), num = $('#cargaNum'), barra = $('#cargaBarra');
    var curva = $('#curva'), lista = false, hecho = false;
    zona.innerHTML = siluetaSVG('bienvenida__firma');
    var trazos = $$('.trazos path', zona);

    function preparada() {
      if (lista) return; lista = true;
      zona.classList.add('entintada');
      num.textContent = '100'; barra.style.width = '100%';
      if (!reducido) zona.firstChild.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07) rotate(-2deg)' }, { transform: 'scale(.98)' }, { transform: 'scale(1)' }],
        { duration: 700, delay: 350, easing: 'cubic-bezier(.3,1.6,.5,1)' });
      setTimeout(function () { carga.classList.add('oculta'); entrarBtn.classList.add('visible'); entrarBtn.focus({ preventScroll: true }); }, reducido ? 0 : 700);
    }

    if (reducido || !trazos.length) preparada();
    else {
      var DUR = 2600, t0 = performance.now();
      trazos.forEach(function (p, i) {
        var L = p.getTotalLength();
        p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
        p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }],
          { duration: Math.min(1400, 500 + L * 0.35), delay: (i / trazos.length) * DUR * 0.62, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' });
      });
      (function cuenta(t) {
        var k = Math.min(1, (t - t0) / DUR);
        num.textContent = ('00' + Math.round(k * 100)).slice(-3); barra.style.width = k * 100 + '%';
        if (k < 1 && !lista) requestAnimationFrame(cuenta); else preparada();
      })(t0);
    }

    // la firma sigue un poco al puntero
    capa.addEventListener('pointermove', function (e) {
      if (reducido) return;
      zona.style.transform = 'translate(' + (e.clientX / innerWidth - .5) * 14 + 'px,' + (e.clientY / innerHeight - .5) * 10 + 'px)';
    });

    function entrar() {
      if (!lista) { preparada(); return; }        // un clic durante la animación la salta
      if (hecho) return; hecho = true;
      document.body.classList.remove('con-bienvenida');
      if (reducido) { capa.remove(); arrancaBoceto(); return; }
      // 1) la firma sale volando hasta el logo de la cabecera y pasa de lima a tinta
      var origen = zona.querySelector('svg'), logo = $('#logo');
      var a = origen.getBoundingClientRect();
      var clon = origen.cloneNode(true); clon.setAttribute('class', 'firma-vuelo');
      clon.style.cssText = 'left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;height:' + a.height + 'px';
      document.body.appendChild(clon); origen.style.visibility = 'hidden'; logo.style.opacity = '0';
      document.body.classList.add('entrando');
      requestAnimationFrame(function () {
        var b = logo.getBoundingClientRect(), esc = b.width / a.width;
        var vuelo = clon.animate([
          { transform: 'translate(0,0) scale(1) rotate(0)' },
          { transform: 'translate(' + ((b.left - a.left) * .45) + 'px,' + ((b.top - a.top) * .55 - 40) + 'px) scale(' + (0.5 + esc * .5) + ') rotate(-8deg)', offset: .55 },
          { transform: 'translate(' + (b.left - a.left) + 'px,' + (b.top - a.top) + 'px) scale(' + esc + ') rotate(0)' }
        ], { duration: 1150, easing: 'cubic-bezier(.7,0,.25,1)', fill: 'forwards' });
        clon.querySelector('.relleno').animate([{ fill: '#ddffb2' }, { fill: '#ddffb2', offset: .5 }, { fill: '#0a0a0a' }], { duration: 1150, fill: 'forwards' });
        vuelo.onfinish = function () { logo.style.opacity = ''; clon.remove(); document.body.classList.remove('entrando'); };
      });
      // 2) el telón sube con el borde curvo; 3) la página entra desde abajo
      setTimeout(function () {
        capa.classList.add('subiendo'); document.body.classList.add('revelando');
        setTimeout(arrancaBoceto, 250);
        var t0 = performance.now();
        (function curvar(t) {
          var k = Math.min(1, (t - t0) / 1000), bb = Math.sin(k * Math.PI) * 100;
          curva.setAttribute('d', 'M0 0 L100 0 L100 0 Q50 ' + bb + ' 0 0 Z');
          if (k < 1) requestAnimationFrame(curvar); else { capa.remove(); document.body.classList.remove('revelando'); }
        })(t0);
      }, 160);
    }
    entrarBtn.addEventListener('click', entrar);
    capa.addEventListener('click', function (e) { if (e.target !== entrarBtn) entrar(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === 'Escape') entrar(); });
  })();

  // ---------- Boceto que se dibuja solo ----------
  var bocetoArrancado = false;
  function arrancaBoceto() {
    if (bocetoArrancado || !window.BOCETO) return; bocetoArrancado = true;
    var B = window.BOCETO, svg = $('#boceto'), lienzo = $('#lienzo'), ns = 'http://www.w3.org/2000/svg';
    svg.setAttribute('viewBox', '0 0 ' + B.w + ' ' + B.h);
    lienzo.style.aspectRatio = B.w + ' / ' + B.h;
    var relleno = document.createElementNS(ns, 'path');
    relleno.setAttribute('d', B.d.join(' ')); relleno.setAttribute('fill-rule', 'evenodd'); relleno.setAttribute('class', 'boceto-relleno');
    var g = document.createElementNS(ns, 'g');
    B.d.forEach(function (d) { var p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); p.setAttribute('class', 'boceto-trazo'); g.appendChild(p); });
    svg.appendChild(g); svg.appendChild(relleno);
    lienzo.classList.add('vectorizado');
    if (reducido) { lienzo.classList.add('entintado'); return; }
    var trazos = $$('.boceto-trazo', svg), total = 3200;
    trazos.forEach(function (p, i) {
      var L = p.getTotalLength();
      p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      var ini = (i / trazos.length) * total * 0.75, dur = Math.min(1400, 300 + L * 0.9);
      p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: dur, delay: ini, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
    });
    setTimeout(function () { lienzo.classList.add('entintado'); }, total);
  }
  // Si la bienvenida no existe (o falla), dibujar igualmente
  if (!$('#bienvenida') && document.body.dataset.vista === 'inicio') arrancaBoceto();

  // ---------- Cintas: «Rymone» y la firma en lima, aceleran con el scroll ----------
  (function cintas() {
    var F = window.FIRMA;
    var firma = F ? '<svg class="cinta__firma" viewBox="0 0 ' + F.w + ' ' + F.h + '" aria-hidden="true"><path fill-rule="evenodd" d="' + F.d + '"/></svg>' : '';
    var bloque = '';
    for (var i = 0; i < 6; i++) bloque += '<span class="cinta__palabra">Rymone</span>' + firma;
    var pistas = $$('.cinta__pista').map(function (p, i) { p.innerHTML = bloque + bloque; return { el: p, x: 0, dir: -1 }; });
    if (reducido || !pistas.length) return;
    var vel = 0.6, ultimoY = scrollY;
    (function mueve() {
      var dy = scrollY - ultimoY; ultimoY = scrollY;
      vel += (0.6 + Math.min(Math.abs(dy), 60) * 0.25 - vel) * 0.08;
      pistas.forEach(function (p) {
        p.x += vel * p.dir * (dy < 0 ? -1 : 1);
        var ancho = p.el.scrollWidth / 2;
        if (p.x <= -ancho) p.x += ancho; if (p.x > 0) p.x -= ancho;
        p.el.style.transform = 'translateX(' + p.x + 'px)';
      });
      requestAnimationFrame(mueve);
    })();
  })();

  // ---------- Obra: destellos en el título, foco y visor ----------
  $$('.cuadro__marco').forEach(function (m) {
    var luz = $('.cuadro__luz', m);
    m.addEventListener('pointermove', function (e) {
      var r = m.getBoundingClientRect();
      luz.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100) + '%');
      luz.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100) + '%');
    });
    m.addEventListener('click', function () { abreVisor(m.dataset.ampliar, m.dataset.alt); });
  });
  var visor = $('#visor'), visorMarco = $('#visorMarco'), visorImg = $('#visorImg');
  function abreVisor(src, alt) {
    visorImg.src = src; visorImg.alt = alt; visorMarco.classList.remove('cerca');
    if (visor.showModal) visor.showModal(); else visor.setAttribute('open', '');
  }
  $('#cerrarVisor').addEventListener('click', function () { visor.close(); });
  visorMarco.addEventListener('click', function (e) { origen(e); visorMarco.classList.toggle('cerca'); });
  visorMarco.addEventListener('pointermove', origen);
  function origen(e) {
    var r = visorImg.getBoundingClientRect();
    if (!r.width) return;
    var x = Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100));
    var y = Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100));
    visorImg.style.transformOrigin = x + '% ' + y + '%';
  }

  // ---------- Música ----------
  (function musica() {
    var lista = $('#lista'), audio = $('#audio'), rep = $('#reproductor');
    if (!lista) return;
    var disco = $('#disco'), label = $('#discoLabel'), caja = $('#caja'), flot = $('#flotante');
    var actual = -1, barra = $('#barra'), arrastrando = false;
    function mmss(t) { if (!isFinite(t)) return '0:00'; t = Math.round(t); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }

    CANCIONES.forEach(function (c, i) {
      var li = document.createElement('li');
      li.innerHTML = '<button type="button" class="pista" data-i="' + i + '">' +
        '<span class="pista__num">' + ('0' + (i + 1)).slice(-2) + '</span>' +
        '<span class="pista__titulo">' + c.titulo + '</span>' +
        '<span class="pista__dur">' + (c.dur ? mmss(c.dur) : 'Pronto') + '</span></button>';
      lista.appendChild(li);
    });
    // siempre hay algo por llegar: una fila bloqueada al final
    var prox = document.createElement('li');
    prox.className = 'pista-bloqueada';
    prox.innerHTML = '<span class="pista__num">' + ('0' + (CANCIONES.length + 1)).slice(-2) + '</span>' +
      '<span class="pista__titulo pista__borrosa" aria-hidden="true">ylo snmrd</span>' +
      '<span class="pista__dur"><svg class="candado" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3h1.5A1.5 1.5 0 0 1 20 11.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20.5v-9A1.5 1.5 0 0 1 5.5 10H7Zm2 0h6V7a3 3 0 0 0-6 0v3Z"/></svg>Próximamente</span>';
    lista.appendChild(prox);
    var botones = $$('.pista', lista);

    function carga(i, reproducir) {
      i = (i + CANCIONES.length) % CANCIONES.length;
      var c = CANCIONES[i], cambio = i !== actual; actual = i;
      botones.forEach(function (b, j) { b.setAttribute('aria-current', j === i ? 'true' : 'false'); });
      $('#rNum').textContent = ('0' + (i + 1)).slice(-2) + '';
      $('#rTitulo').textContent = c.titulo;
      if (cambio) {
        disco.classList.remove('fuera', 'sonando');
        caja.classList.add('cambiando');
        setTimeout(function () {
          caja.src = 'media/cd-' + c.portada + '.webp';
          label.style.backgroundImage = 'url("media/portada-' + c.portada + '.webp")';
          caja.classList.remove('cambiando');
          setTimeout(function () { disco.classList.add('fuera'); }, 120);
        }, reducido ? 0 : 320);
        audio.pause();
        if (c.audio) { audio.src = c.audio; $('#rEstado').textContent = ''; }
        else { audio.removeAttribute('src'); audio.load(); $('#rEstado').textContent = 'Audio en camino. Mientras, mira la portada.'; }
        $('#play').disabled = !c.audio;
        barra.value = 0; $('#tActual').textContent = '0:00'; $('#tTotal').textContent = c.dur ? mmss(c.dur) : '–:––';
      }
      if (reproducir && c.audio) toca();
    }
    function toca() {
      iniciaOndas();
      var p = audio.play();
      if (p && p.catch) p.catch(function () { $('#rEstado').textContent = 'No se ha podido reproducir. Pulsa de nuevo.'; });
    }
    $('#play').addEventListener('click', function () { if (audio.paused) toca(); else audio.pause(); });
    $('#anterior').addEventListener('click', function () { carga(actual - 1, !audio.paused); });
    $('#siguiente').addEventListener('click', function () { carga(actual + 1, !audio.paused); });
    botones.forEach(function (b) { b.addEventListener('click', function () { carga(+b.dataset.i, true); }); });

    audio.addEventListener('play', function () { rep.classList.add('sonando'); disco.classList.add('sonando', 'fuera'); $('#play').setAttribute('aria-label', 'Pausar'); });
    audio.addEventListener('pause', function () { rep.classList.remove('sonando'); disco.classList.remove('sonando'); $('#play').setAttribute('aria-label', 'Reproducir'); });
    audio.addEventListener('loadedmetadata', function () { $('#tTotal').textContent = mmss(audio.duration); });
    audio.addEventListener('timeupdate', function () {
      if (!arrastrando && audio.duration) barra.value = audio.currentTime / audio.duration * 1000;
      $('#tActual').textContent = mmss(audio.currentTime);
    });
    audio.addEventListener('ended', function () {
      var sig = actual; do { sig = (sig + 1) % CANCIONES.length; } while (!CANCIONES[sig].audio);
      carga(sig, true);
    });
    barra.addEventListener('input', function () { arrastrando = true; if (audio.duration) $('#tActual').textContent = mmss(barra.value / 1000 * audio.duration); });
    barra.addEventListener('change', function () { if (audio.duration) audio.currentTime = barra.value / 1000 * audio.duration; arrastrando = false; });

    // Ondas: con analizador real si la web está en un servidor; si se abre como archivo, ondas simuladas
    var ondas = $('#ondas'), so = ajustaCanvas(ondas), analizador = null, datos = null, intentado = false;
    window.addEventListener('resize', function () { so = ajustaCanvas(ondas); });
    function iniciaOndas() {
      if (intentado || location.protocol.indexOf('http') !== 0) return; intentado = true;
      try {
        var AC = window.AudioContext || window.webkitAudioContext, ctx = new AC();
        var fuente = ctx.createMediaElementSource(audio);
        analizador = ctx.createAnalyser(); analizador.fftSize = 128;
        fuente.connect(analizador); analizador.connect(ctx.destination);
        datos = new Uint8Array(analizador.frequencyBinCount);
      } catch (e) { analizador = null; }
    }
    (function pinta(t) {
      var c = so.ctx, n = 48, w = so.w / n;
      c.clearRect(0, 0, so.w, so.h);
      var sonando = !audio.paused;
      if (analizador && sonando) analizador.getByteFrequencyData(datos);
      for (var i = 0; i < n; i++) {
        var v;
        if (analizador && sonando) v = datos[Math.floor(i / n * datos.length * 0.8)] / 255;
        else if (sonando) v = 0.25 + 0.6 * Math.abs(Math.sin(t / 260 + i * 0.55) * Math.cos(t / 410 + i * 0.21));
        else v = 0.04;
        var h = Math.max(2, v * so.h);
        c.fillStyle = i % 2 === 0 ? '#ddffb2' : '#e4e2e6';
        c.globalAlpha = 0.35 + v * 0.65;
        c.fillRect(i * w + 1, (so.h - h) / 2, Math.max(1, w - 3), h);
      }
      c.globalAlpha = 1;
      requestAnimationFrame(pinta);
    })(0);

    // CD que sigue al cursor sobre la lista (solo con ratón)
    if (punteroFino && !reducido) {
      var fx = 0, fy = 0, tx = 0, ty = 0, giro = 0;
      lista.addEventListener('pointerover', function (e) {
        var b = e.target.closest('.pista'); if (!b) return;
        flot.src = 'media/cd-' + CANCIONES[+b.dataset.i].portada + '.webp'; flot.classList.add('visible');
      });
      lista.addEventListener('pointerleave', function () { flot.classList.remove('visible'); });
      lista.addEventListener('pointermove', function (e) { tx = e.clientX + 30; ty = e.clientY - 90; });
      (function sigue() {
        var dx = tx - fx; fx += dx * 0.14; fy += (ty - fy) * 0.14; giro += (dx * 0.08 - giro) * 0.2;
        flot.style.transform = 'translate(' + fx + 'px,' + fy + 'px) rotate(' + Math.max(-14, Math.min(14, giro)) + 'deg)';
        requestAnimationFrame(sigue);
      })();
    }
    carga(0, false);
  })();

  // ---------- Apariciones al hacer scroll ----------
  // Se vuelve a llamar al cambiar de apartado: solo prepara lo visible que aún no se ha preparado.
  var io = null;
  function revelar() {
    if (reducido || !('IntersectionObserver' in window)) return;
    var els = $$('.puerta, .colabora, .bloqueado, .obra .metal, .cuadro__marco, .cartela, .musica .metal, .musica__sub, .reproductor, .lista li, .album__objeto, .album__texto > *, .album__lista li, .sobre .metal, .sobre__frase, .sobre__datos > *, .contacto > *');
    io = io || new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      if (el.dataset.rv || !r.height) return;          // ya preparado, o en un apartado oculto
      el.dataset.rv = '1';
      if (r.top < innerHeight) return;               // lo que ya se ve no se esconde
      var hermanos = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--retraso', Math.min(hermanos, 8) * 0.06 + 's');
      el.classList.add('revela'); io.observe(el);
    });
  }
  revelar();

  // ---------- Navegación: apartados propios y sección activa ----------
  (function nav() {
    var enlaces = $$('.cabecera__nav a');
    function marca(id) { enlaces.forEach(function (a) { a.classList.toggle('activo', a.dataset.seccion === id); }); }
    // en la portada, el menú sigue la sección que se está viendo
    var obs = new IntersectionObserver(function (entradas) {
      if (document.body.dataset.vista !== 'inicio') return;
      entradas.forEach(function (en) { if (en.isIntersecting) marca(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section').forEach(function (s) { obs.observe(s); });

    var telon = $('#telon'), telonT = $('#telonT'), telonF = $('#telonFirma'), ocupado = false, actual = idInicial;
    var NOMBRES = { inicio: 'Rymone', obra: 'Obra', musica: 'Música' };
    if (telonF) telonF.innerHTML = siluetaSVG('');

    function colocar(v, id) {
      var antes = document.body.dataset.vista;
      if (antes === 'musica' && v !== 'musica') $('#audio').pause();
      document.body.dataset.vista = v;
      document.body.classList.toggle('es-noche', v === 'musica');
      if (v === 'inicio') arrancaBoceto();
      var el = v === 'inicio' && id && id !== 'inicio' && document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'instant' }); else window.scrollTo({ top: 0, behavior: 'instant' });
      if (v !== 'inicio') marca(v);
      window.dispatchEvent(new Event('resize'));     // el lienzo de las ondas mide su nuevo tamaño
      revelar();
    }
    colocar(document.body.dataset.vista, idInicial);

    function ir(id, apuntar) {
      id = id || 'inicio';
      actual = id;
      var v = vistaDe(id);
      if (apuntar) try { history.pushState(null, '', '#' + id); } catch (e) {}
      if (v === document.body.dataset.vista) {
        var el = id !== v && document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' }); else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (reducido || !telon || !telon.animate) { colocar(v, id); return; }
      if (ocupado) return; ocupado = true;
      // el telón negro sube con el borde curvo, cambia el apartado y se va por arriba
      telonT.textContent = NOMBRES[v];
      telon.classList.add('activo');
      var cubre = telon.animate([
        { transform: 'translateY(100%)', borderRadius: '50% 50% 0 0 / 16vh 16vh 0 0' },
        { transform: 'translateY(0)', borderRadius: '0' }
      ], { duration: 850, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' });
      telonF.animate([{ transform: 'translateY(40px) scale(.85) rotate(-10deg)', opacity: 0 }, { transform: 'rotate(-4deg)', opacity: 1 }],
        { duration: 950, delay: 340, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'both' });
      telonT.animate([{ transform: 'translateY(30px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 800, delay: 500, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' });
      cubre.onfinish = function () {
        colocar(v, id);
        document.body.classList.remove('cambiando-vista'); void document.body.offsetWidth;
        document.body.classList.add('cambiando-vista');
        var sale = telon.animate([
          { transform: 'translateY(0)', borderRadius: '0' },
          { transform: 'translateY(-100%)', borderRadius: '0 0 50% 50% / 0 0 16vh 16vh' }
        ], { duration: 1050, delay: 800, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' });
        sale.onfinish = function () {
          telon.classList.remove('activo');
          telon.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
          ocupado = false;
          setTimeout(function () { document.body.classList.remove('cambiando-vista'); }, 1300);
        };
      };
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      // los botones de precio y colaboraciones dejan el asunto del correo preparado
      var correo = $('#correo');
      if (correo) correo.href = 'mailto:' + correo.textContent + (a.dataset.asunto ? '?subject=' + encodeURIComponent(a.dataset.asunto) : '');
      ir(a.getAttribute('href').slice(1), true);
    });
    function desdeDireccion() { var id = decodeURIComponent(location.hash.slice(1)); if (id !== actual) ir(id, false); }
    window.addEventListener('popstate', desdeDireccion);
    window.addEventListener('hashchange', desdeDireccion);
  })();

  // ---------- Correo: se monta aquí para que los robots de spam no lo lean del HTML ----------
  (function () {
    var c = $('#correo'); if (!c || !c.dataset.u) return;
    var dir = c.dataset.u + '@' + c.dataset.d;
    c.textContent = dir; c.href = 'mailto:' + dir;
  })();

  // ---------- Formulario de colaboración: prepara un correo con lo que se rellena ----------
  (function colabora() {
    var dlg = $('#formulario'), form = $('#formColabora'); if (!dlg || !form) return;
    $$('[data-colabora]').forEach(function (b) {
      b.addEventListener('click', function () {
        $('#formTipo').value = b.dataset.colabora; $('#formAviso').textContent = '';
        if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      });
    });
    $('#formCerrar').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form), correo = $('#correo').textContent;
      var cuerpo = d.get('mensaje') + '\n\n— ' + (d.get('nombre') || 'Sin nombre') + ' · ' + d.get('email');
      location.href = 'mailto:' + correo + '?subject=' + encodeURIComponent('Colaboración: ' + d.get('tipo')) + '&body=' + encodeURIComponent(cuerpo);
      $('#formAviso').textContent = 'Se abre tu programa de correo con todo escrito. Si no se abre, escribe a ' + correo + '.';
    });
  })();

  // ---------- Copiar correo ----------
  $('#copiar').addEventListener('click', function () {
    var b = this, t = $('#correo').textContent;
    function hecho(txt) { b.textContent = txt; setTimeout(function () { b.textContent = 'Copiar'; }, 1800); }
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { hecho('Copiado'); }, seleccionar);
    else seleccionar();
    function seleccionar() { var r = document.createRange(); r.selectNodeContents($('#correo')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); hecho('Seleccionado'); }
  });

  // ---------- Destellos al hacer clic en cualquier sitio ----------
  if (!reducido) {
    document.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.bienvenida, dialog, input')) return;
      for (var i = 0; i < 5; i++) {
        var d = document.createElement('i');
        var a = Math.random() * Math.PI * 2, r = 24 + Math.random() * 30;
        d.style.cssText = 'position:fixed;z-index:70;pointer-events:none;width:14px;height:14px;clip-path:path("M7 0C7.6 4.7 9.3 6.4 14 7 9.3 7.6 7.6 9.3 7 14 6.4 9.3 4.7 7.6 0 7 4.7 6.4 6.4 4.7 7 0Z");left:' + (e.clientX - 7) + 'px;top:' + (e.clientY - 7) + 'px;background:' + (document.body.classList.contains('es-noche') ? '#ddffb2' : '#55056d');
        document.body.appendChild(d);
        d.animate([{ transform: 'translate(0,0) scale(.3) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * r + 'px,' + Math.sin(a) * r + 'px) scale(1) rotate(90deg)', opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = function () { this.effect.target.remove(); };
      }
    });
  }
})();
