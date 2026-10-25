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
    if (reduceMotion || !target) return;
    var dur = 1600;
    var t0 = performance.now();
    var step = function (now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
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

  /* ---------- Footer year ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
