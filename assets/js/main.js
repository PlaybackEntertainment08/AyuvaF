/* AYUVA Longevity Institute — homepage interactions (no dependencies) */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro veil: once per session ---------- */
  var seen = false;
  try { seen = sessionStorage.getItem('ayuva-veil') === '1'; } catch (e) {}
  if (seen || reduceMotion) root.classList.add('no-veil');

  function ready() {
    root.classList.add('is-ready');
    try { sessionStorage.setItem('ayuva-veil', '1'); } catch (e) {}
  }
  if (seen || reduceMotion) {
    requestAnimationFrame(ready);
  } else {
    var start = performance.now();
    var go = function () { setTimeout(ready, Math.max(0, 1300 - (performance.now() - start))); };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    setTimeout(ready, 2600); // never hold the page hostage
  }

  /* ---------- Header: scrolled state + hide on scroll down ---------- */
  var header = document.querySelector('[data-header]');
  var dock = document.querySelector('[data-dock]');
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    var menuOpen = document.body.classList.contains('menu-open');
    var dropOpen = document.querySelector('.nav__item--drop.is-open');
    header.classList.toggle('is-hidden', !menuOpen && !dropOpen && y > 640 && y > lastY + 4);
    if (y < lastY - 4) header.classList.remove('is-hidden');
    if (dock) dock.classList.toggle('is-visible', y > window.innerHeight * 0.7);
    lastY = y;
    parallax();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- Parallax (subtle, uses `translate` so CSS transforms stay free) ---------- */
  var parallaxEls = reduceMotion ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  function parallax() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
      var offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.translate = '0 ' + offset.toFixed(1) + 'px';
    });
  }
  onScroll();

  /* ---------- Programmes dropdown ---------- */
  var dropItem = document.querySelector('.nav__item--drop');
  if (dropItem) {
    var toggle = dropItem.querySelector('.nav__drop-toggle');
    var closeTimer;
    var setOpen = function (open) {
      dropItem.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', function () { setOpen(!dropItem.classList.contains('is-open')); });
    dropItem.addEventListener('mouseenter', function () { clearTimeout(closeTimer); setOpen(true); });
    dropItem.addEventListener('mouseleave', function () { closeTimer = setTimeout(function () { setOpen(false); }, 180); });
    dropItem.addEventListener('focusout', function (e) { if (!dropItem.contains(e.relatedTarget)) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dropItem.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector('[data-burger]');
  var menu = document.querySelector('[data-menu]');
  if (burger && menu) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('menu-open', open);
      header.classList.remove('is-hidden');
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add('is-open'); });
        menu.querySelectorAll('.menu__nav > ul > li').forEach(function (li, i) {
          li.style.transitionDelay = (0.18 + i * 0.04) + 's';
        });
      } else {
        menu.classList.remove('is-open');
        menu.querySelectorAll('.menu__nav > ul > li').forEach(function (li) { li.style.transitionDelay = '0s'; });
        setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 700);
      }
    };
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1280 && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
  }

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion || !target) return;
    var dur = 1600;
    var t0 = performance.now();
    var step = function (now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  }

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll('[data-reveal], [data-steps], .step, .founder__portrait');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-in');
        el.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Therapies rail: buttons, drag, progress ---------- */
  var rail = document.querySelector('[data-rail]');
  if (rail) {
    var prev = document.querySelector('[data-rail-prev]');
    var next = document.querySelector('[data-rail-next]');
    var bar = document.querySelector('[data-rail-bar]');
    var cardStep = function () {
      var card = rail.querySelector('.therapy');
      return card ? card.getBoundingClientRect().width + 20 : 300;
    };
    var updateRail = function () {
      var max = rail.scrollWidth - rail.clientWidth;
      var p = max > 0 ? rail.scrollLeft / max : 1;
      if (bar) bar.style.transform = 'scaleX(' + (0.15 + p * 0.85).toFixed(3) + ')';
      if (prev) prev.disabled = rail.scrollLeft < 4;
      if (next) next.disabled = rail.scrollLeft > max - 4;
    };
    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -cardStep(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: cardStep(), behavior: 'smooth' }); });
    rail.addEventListener('scroll', updateRail, { passive: true });
    window.addEventListener('resize', updateRail);
    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { rail.scrollBy({ left: cardStep(), behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { rail.scrollBy({ left: -cardStep(), behavior: 'smooth' }); e.preventDefault(); }
    });

    // mouse drag (touch already scrolls natively)
    var dragX = 0, dragLeft = 0, dragging = false, moved = false;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true; moved = false; dragX = e.clientX; dragLeft = rail.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragX;
      if (!moved && Math.abs(dx) > 4) { moved = true; rail.classList.add('is-dragging'); }
      if (moved) rail.scrollLeft = dragLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      if (moved) {
        rail.classList.remove('is-dragging');
        var s = cardStep();
        rail.scrollTo({ left: Math.round(rail.scrollLeft / s) * s, behavior: 'smooth' });
      }
    });
    updateRail();
  }

  /* ---------- Smooth scroll (Lenis), desktop pointers only ---------- */
  if (window.Lenis && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70, duration: 1.6 });
    });
    new MutationObserver(function () {
      if (document.body.classList.contains('menu-open')) lenis.stop(); else lenis.start();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- Footer year ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
