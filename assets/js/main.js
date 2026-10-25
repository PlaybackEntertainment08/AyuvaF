/* AYUVA Longevity Institute — homepage interactions
   GSAP + ScrollTrigger + SplitText · Lenis · Swiper · Bootstrap */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var DOMAINS = [
    { n: 'Metabolic', type: 'Blood', icon: 'droplet', m: ['HbA1c', 'Fasting glucose', 'Fasting insulin (HOMA-IR)'] },
    { n: 'Heart & vessels', type: 'Blood', icon: 'droplet', m: ['Lipid profile', 'ApoB', 'Lp(a)'] },
    { n: 'Inflammation', type: 'Blood', icon: 'droplet', m: ['hsCRP', 'Homocysteine', 'CBC with NLR'] },
    { n: 'Liver & kidney', type: 'Blood & urine', icon: 'droplet-half', m: ['ALT', 'GGT', 'Cystatin C (eGFR)', 'Urine ACR', 'Uric acid'] },
    { n: 'Hormones', type: 'Blood', icon: 'droplet', m: ['TSH', 'AM cortisol', 'DHEA-S', 'Sex-hormone profile (men / women)'] },
    { n: 'Nutrients', type: 'Blood', icon: 'droplet', m: ['Vitamin D', 'Vitamin B12', 'Ferritin', 'Omega-3 index'] },
    { n: 'Body & strength', type: 'In clinic', icon: 'person-arms-up', m: ['DEXA (muscle, visceral fat, bone)', 'Grip strength', 'Sit-to-stand', 'BP & arterial stiffness'] },
    { n: 'Fitness & mind', type: 'In clinic', icon: 'person-arms-up', m: ['VO2 max', 'HRV', 'Sleep score', 'Cognitive screen'] }
  ];
  var TATTVA = [
    { name: 'Prithvi', el: 'Earth', what: 'Body composition, muscle and bone' },
    { name: 'Jala', el: 'Water', what: 'Hydration, clearance and IV support' },
    { name: 'Agni', el: 'Fire', what: 'Metabolism and mitochondrial energy' },
    { name: 'Vayu', el: 'Air', what: 'Breath, oxygen and hyperbaric oxygen' },
    { name: 'Akasha', el: 'Space', what: 'Mind, sleep and neuro-reset' }
  ];

  var loader = $('[data-loader]');
  var stage = $('[data-stage]');
  buildDial();

  /* Without GSAP (or with reduced motion) everything is simply shown. */
  if (!hasGsap || reduce) {
    if (loader) loader.remove();
    startStatic();
    return;
  }

  root.classList.add('anim');
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  function scrollToEl(target) {
    if (lenis) lenis.scrollTo(target, { offset: -90, duration: 1.6 });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = $(id);
      if (!t) return;
      e.preventDefault();
      scrollToEl(t);
    });
  });

  /* ---------- Hero geometry ---------- */
  function heroR() {
    var w = window.innerWidth, h = window.innerHeight;
    return w < 768 ? w * 0.36 : Math.min(w * 0.21, h * 0.25, 260);
  }
  function coverR() { return Math.hypot(window.innerWidth, window.innerHeight) * 0.75; }

  /* ---------- Loader ---------- */
  document.body.classList.add('is-loading');
  var seen = false;
  try { seen = sessionStorage.getItem('ayuva-seen') === '1'; } catch (e) {}
  var count = $('[data-loader-count]');
  var bar = $('[data-loader-bar]');
  var prog = { v: 0 };
  var loaded = document.readyState === 'complete';
  if (!loaded) window.addEventListener('load', function () { loaded = true; }, { once: true });
  var booted = false;

  prepareHero();

  gsap.to(prog, {
    v: 100, duration: seen ? 0.8 : 1.7, ease: 'power2.inOut',
    onUpdate: function () { count.textContent = Math.round(prog.v); bar.style.transform = 'scaleX(' + prog.v / 100 + ')'; },
    onComplete: function () {
      if (loaded) return outro();
      var tries = 0;
      var iv = setInterval(function () { if (loaded || ++tries > 30) { clearInterval(iv); outro(); } }, 100);
    }
  });

  /* Failsafe: never hold a visitor behind the loader */
  var failsafe = setTimeout(function () {
    if (booted) return;
    if (loader && document.body.contains(loader)) loader.remove();
    document.body.classList.remove('is-loading');
    gsap.set(stage, { '--r': heroR() + 'px' });
    gsap.set('.hero__title .line > span', { yPercent: 0 });
    gsap.set('[data-hero-fade], [data-dial]', { opacity: 1, y: 0, scale: 1, rotate: 0 });
    boot();
  }, 5000);

  function outro() {
    if (booted) return;
    clearTimeout(failsafe);
    try { sessionStorage.setItem('ayuva-seen', '1'); } catch (e) {}
    gsap.timeline()
      .to('.loader__inner', { y: -40, opacity: 0, duration: 0.55, ease: 'power3.in' })
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=0.1')
      .add(function () {
        if (loader && document.body.contains(loader)) loader.remove();
        document.body.classList.remove('is-loading');
        playHero();
      }, '-=0.5');
  }

  /* ---------- Hero: intro ---------- */
  function prepareHero() {
    gsap.set(stage, { '--r': '0px' });
    gsap.set('.hero__title .line > span', { yPercent: 118 });
    gsap.set('[data-hero-fade]', { y: 26, opacity: 0 });
    gsap.set('[data-dial]', { opacity: 0, scale: 0.7, rotate: -70 });
  }
  function playHero() {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(stage, { '--r': heroR() + 'px', duration: 1.9, ease: 'expo.inOut' }, 0)
      .fromTo('.hero__media img', { scale: 1.5 }, { scale: 1, duration: 2.6 }, 0)
      .to('[data-dial]', { opacity: 1, scale: 1, rotate: 0, duration: 2.2 }, 0.35)
      .fromTo('[data-dial] line', { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: { each: 0.006 } }, 0.5)
      .to('.hero__title .line > span', { yPercent: 0, duration: 1.4, stagger: 0.14 }, 0.8)
      .to('[data-hero-fade]', { y: 0, opacity: 1, duration: 1.1, stagger: 0.1 }, 1.05)
      .add(function () { $$('.hero__metrics [data-count]').forEach(countTo); }, 1.2)
      .add(boot, 1.6);
    particles();
  }

  function boot() {
    if (booted) return;
    booted = true;
    if (lenis) lenis.start();
    heroScroll();
    initAll();
  }

  /* ---------- Hero: pinned aperture → proverb ---------- */
  function heroScroll() {
    var story = $('[data-story]');
    var text = $('[data-story-text]');
    wrapWords(text);
    var words = $$('.w', text);
    var lit = { v: 0 };
    var ticks = $$('[data-dial] line');
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage, start: 'top top', end: '+=220%', pin: true, scrub: 0.8, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var n = Math.round(Math.min(1, self.progress / 0.4) * ticks.length);
          ticks.forEach(function (t, i) { t.classList.toggle('on', i < n); });
        }
      }
    });
    tl.fromTo(stage, { '--r': function () { return heroR() + 'px'; } }, { '--r': function () { return coverR() + 'px'; }, duration: 1, ease: 'power2.in' }, 0)
      .to('.hero__media img', { scale: 1.12, duration: 1.6 }, 0)
      .to('[data-dial]', { scale: 2.6, opacity: 0, duration: 0.8, ease: 'power2.in' }, 0)
      .to('.hero__l--1', { xPercent: -70, opacity: 0, duration: 0.7, ease: 'power2.in' }, 0)
      .to('.hero__l--2', { xPercent: 70, opacity: 0, duration: 0.7, ease: 'power2.in' }, 0)
      .to('.hero__top', { y: -50, opacity: 0, duration: 0.45 }, 0)
      .to('.hero__bottom', { y: 60, opacity: 0, duration: 0.45 }, 0)
      .to('[data-particles]', { opacity: 0.35, duration: 0.6 }, 0.3)
      .to(story, { autoAlpha: 1, duration: 0.3 }, 0.9)
      .from('[data-story-eyebrow]', { y: 30, opacity: 0, duration: 0.3 }, 0.95)
      .to(lit, { v: 1, duration: 1, onUpdate: function () {
        var n = Math.round(lit.v * words.length);
        words.forEach(function (w, i) { w.classList.toggle('is-lit', i < n); });
      } }, 1.05)
      .from('[data-story-foot]', { y: 40, opacity: 0, duration: 0.35 }, 1.8)
      .to({}, { duration: 0.35 });
    window.addEventListener('resize', function () {
      if (tl.scrollTrigger && tl.scrollTrigger.progress === 0) gsap.set(stage, { '--r': heroR() + 'px' });
    });
  }

  /* Rising gold "cells" */
  function particles() {
    var canvas = $('[data-particles]');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, pts = [], running = true, raf;
    function size() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 768 ? 38 : 80;
      pts = [];
      for (var i = 0; i < n; i++) pts.push(spawn(true));
    }
    function spawn(anyY) {
      return { x: Math.random() * W, y: anyY ? Math.random() * H : H + 10, r: 0.6 + Math.random() * 1.9, vy: 0.12 + Math.random() * 0.42, ph: Math.random() * Math.PI * 2, a: 0.18 + Math.random() * 0.5 };
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.y -= p.vy; p.ph += 0.012;
        var x = p.x + Math.sin(p.ph) * 14;
        if (p.y < -10) pts[i] = spawn(false);
        var g = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r * 4);
        g.addColorStop(0, 'rgba(243,220,160,' + p.a + ')');
        g.addColorStop(1, 'rgba(243,220,160,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(frame);
    }
    size();
    window.addEventListener('resize', size);
    gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 2, delay: 0.6 });
    frame();
    ST.create({
      trigger: '.hero', start: 'top top', end: 'bottom top',
      onToggle: function (self) { running = self.isActive; if (running) { cancelAnimationFrame(raf); frame(); } }
    });
  }

  /* ---------- Everything else ---------- */
  function initAll() {
    nav(); mega(); cursor(); magnetic();
    splitHeads(); reveals(); counters(); scrubText();
    about(); matrix(); rings(); domains(); stackCards(); programmes();
    spotlight(); tilt(); orbit(); ctaRings(); footer(); dock(); year();
    ST.refresh();
  }

  function nav() {
    var navEl = $('[data-nav]');
    var last = 0;
    ST.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var y = self.scroll();
        navEl.classList.toggle('is-scrolled', y > 40);
        navEl.classList.toggle('is-hidden', !$('.mega-wrap.is-open') && y > 500 && y > last);
        last = y;
      }
    });
  }

  function mega() {
    var wrap = $('[data-mega]');
    if (!wrap) return;
    var btn = $('.mega-toggle', wrap), timer;
    function set(o) { wrap.classList.toggle('is-open', o); btn.setAttribute('aria-expanded', String(o)); }
    btn.addEventListener('click', function () { set(!wrap.classList.contains('is-open')); });
    wrap.addEventListener('mouseenter', function () { clearTimeout(timer); set(true); });
    wrap.addEventListener('mouseleave', function () { timer = setTimeout(function () { set(false); }, 200); });
    wrap.addEventListener('focusout', function (e) { if (!wrap.contains(e.relatedTarget)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  function cursor() {
    if (!finePointer) return;
    root.classList.add('has-cursor');
    var c = $('[data-cursor]'), d = $('[data-cursor-dot]'), label = $('[data-cursor-label]');
    var xTo = gsap.quickTo(c, 'x', { duration: 0.5, ease: 'power3' });
    var yTo = gsap.quickTo(c, 'y', { duration: 0.5, ease: 'power3' });
    var dx = gsap.quickTo(d, 'x', { duration: 0.08 });
    var dy = gsap.quickTo(d, 'y', { duration: 0.08 });
    window.addEventListener('mousemove', function (e) { root.classList.add('cursor-on'); xTo(e.clientX); yTo(e.clientY); dx(e.clientX); dy(e.clientY); });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-cursor-text]');
      if (t) { label.textContent = t.getAttribute('data-cursor-text'); c.classList.add('is-label'); c.classList.remove('is-hover'); return; }
      c.classList.remove('is-label');
      c.classList.toggle('is-hover', !!e.target.closest('a, button'));
    });
  }

  function magnetic() {
    if (!finePointer) return;
    $$('[data-magnetic]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
        el.style.setProperty('--bx', mx + 'px'); el.style.setProperty('--by', my + 'px');
        xTo((mx - r.width / 2) * 0.22); yTo((my - r.height / 2) * 0.3);
      });
      el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  /* Section headings rise line by line from behind a mask */
  function splitHeads() {
    $$('[data-split]').forEach(function (el) {
      if (!window.SplitText) {
        gsap.from(el, { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        return;
      }
      window.SplitText.create(el, {
        type: 'lines,words', mask: 'lines', wordsClass: 'sw', autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, { yPercent: 105, duration: 1.3, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        }
      });
    });
  }

  function reveals() {
    $$('.reveal').forEach(function (el) {
      gsap.from(el, { y: 36, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    gsap.set('.reveal-card', { opacity: 0 });
    ST.batch('.reveal-card', {
      start: 'top 92%', once: true,
      onEnter: function (els) { gsap.fromTo(els, { y: 70, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 1.3, stagger: 0.1, ease: 'expo.out', overwrite: true }); }
    });
    // images unveil with a clip wipe, then drift
    $$('.scard__media img, .tcard--img img, .founder__frame > img').forEach(function (img) {
      gsap.fromTo(img, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: img, start: 'top 88%', once: true } });
      gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  function countTo(el) {
    var target = parseInt(el.getAttribute('data-count'), 10), o = { v: 0 };
    gsap.to(o, { v: target, duration: 2, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('en-IN'); } });
  }
  function counters() {
    $$('[data-count]').forEach(function (el) {
      if (el.closest('.hero')) return;
      ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { countTo(el); } });
    });
  }

  function wrapWords(node) {
    if (!node || node.dataset.wrapped) return;
    node.dataset.wrapped = '1';
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1) { walk(child); }
      });
    })(node);
  }
  function scrubText() {
    $$('[data-scrub]').forEach(function (el) {
      wrapWords(el);
      var words = $$('.w', el);
      ST.create({
        trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: true,
        onUpdate: function (self) {
          var n = Math.round(self.progress * words.length);
          words.forEach(function (w, i) { w.classList.toggle('is-lit', i < n); });
        }
      });
    });
  }

  /* About: five promises walk sideways (desktop) or swipe (mobile) */
  function about() {
    var hs = $('[data-hs]');
    if (!hs) return;
    var viewport = $('[data-hs-viewport]', hs), track = $('[data-hs-track]', hs);
    var barI = $('[data-hs-bar]', hs), countEl = $('[data-hs-count]', hs);
    var cards = $$('.hs__card', hs);
    function setProgress(p) {
      p = Math.max(0, Math.min(1, p));
      barI.style.transform = 'scaleX(' + (0.2 + p * 0.8) + ')';
      countEl.textContent = '0' + Math.max(1, Math.min(5, Math.round(p * 4) + 1));
    }
    var mm = gsap.matchMedia();
    mm.add('(min-width: 992px)', function () {
      var dist = function () { return track.scrollWidth - window.innerWidth; };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: hs, start: 'center center', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: function (self) { setProgress(self.progress); } }
      });
      cards.forEach(function (card) {
        var img = $('img', card), copy = $$('.hs__copy > *', card);
        gsap.fromTo(img, { xPercent: -8, scale: 1.25 }, { xPercent: 8, scale: 1.25, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        gsap.from(copy, { y: 50, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 70%', toggleActions: 'play none none reverse' } });
        gsap.fromTo(card, { rotate: 2.5, scale: 0.94 }, { rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'left 40%', scrub: true } });
      });
      return function () { gsap.set(track, { x: 0 }); };
    });
    mm.add('(max-width: 991.98px)', function () {
      var onScroll = function () { setProgress(viewport.scrollLeft / (viewport.scrollWidth - viewport.clientWidth || 1)); };
      viewport.addEventListener('scroll', onScroll, { passive: true });
      gsap.from(track.children, { x: 80, opacity: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: hs, start: 'top 85%', once: true } });
      return function () { viewport.removeEventListener('scroll', onScroll); };
    });
  }

  /* 183 markers → the 30 that matter */
  function matrix() {
    var box = $('[data-matrix]');
    if (!box) return;
    var dots = $('[data-matrix-dots]', box), num = $('[data-matrix-num]', box), label = $('[data-matrix-label]', box);
    var total = 183, keep = 30, chosen = {};
    for (var k = 0; k < keep; k++) chosen[Math.floor(k * total / keep + ((k * 37) % 5))] = 1;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) { var d = document.createElement('i'); if (chosen[i]) d.dataset.keep = '1'; frag.appendChild(d); }
    dots.appendChild(frag);
    var all = $$('i', dots), on = all.filter(function (x) { return x.dataset.keep; }), off = all.filter(function (x) { return !x.dataset.keep; });
    gsap.set(all, { scale: 0, opacity: 0 });
    var tl = gsap.timeline({ paused: true });
    tl.to(all, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', stagger: { each: 0.004, from: 'random' } })
      .add(function () {
        off.forEach(function (x) { x.classList.add('is-off'); });
        on.forEach(function (x) { x.classList.add('is-on'); });
        var o = { v: 183 };
        gsap.to(o, { v: 30, duration: 1.6, ease: 'power3.inOut', onUpdate: function () { num.textContent = Math.round(o.v); } });
        label.textContent = 'measures · signal';
      }, '+=0.5');
    ST.create({ trigger: box, start: 'top 75%', once: true, onEnter: function () { tl.play(); } });
  }

  function rings() {
    $$('.stat__ring .p').forEach(function (c) {
      gsap.to(c, { strokeDashoffset: 0, duration: 2.2, ease: 'power3.inOut', scrollTrigger: { trigger: c.closest('.stat'), start: 'top 88%', once: true } });
    });
  }

  function domains() {
    var wrap = $('[data-domains]');
    if (!wrap) return;
    var tabs = $$('[data-d]', wrap);
    var numEl = $('[data-d-num]', wrap), typeEl = $('[data-d-type]', wrap), nameEl = $('[data-d-name]', wrap), tagsEl = $('[data-d-tags]', wrap), barEl = $('[data-d-bar]', wrap);
    var current = 0, timer = null, auto = true;
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function show(i) {
      current = i;
      var d = DOMAINS[i];
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); });
      gsap.timeline()
        .to([numEl, nameEl, tagsEl], { opacity: 0, y: -12, duration: 0.25, stagger: 0.03, ease: 'power2.in' })
        .add(function () {
          numEl.textContent = '0' + (i + 1);
          typeEl.innerHTML = '<i class="bi bi-' + d.icon + '"></i> ' + esc(d.type);
          nameEl.textContent = d.n;
          tagsEl.innerHTML = d.m.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('');
        })
        .fromTo([numEl, nameEl], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'expo.out' })
        .set(tagsEl, { opacity: 1, y: 0 }, '<')
        .from($$('li', tagsEl), { opacity: 0, y: 14, scale: 0.9, duration: 0.6, stagger: 0.05, ease: 'back.out(1.8)' }, '<');
      if (timer) timer.kill();
      if (auto) timer = gsap.fromTo(barEl, { scaleX: 0 }, { scaleX: 1, duration: 5, ease: 'none', onComplete: function () { show((current + 1) % DOMAINS.length); } });
      else gsap.set(barEl, { scaleX: 1 });
    }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { auto = false; show(k); }); });
    ST.create({ trigger: wrap, start: 'top 70%', once: true, onEnter: function () { show(0); } });
  }

  function stackCards() {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 992px)', function () {
      var cards = $$('[data-scard]');
      cards.forEach(function (card, i) {
        var next = cards[i + 1];
        if (!next) return;
        gsap.to(card, { scale: 0.92, opacity: 0.55, ease: 'none', scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 160px', scrub: true } });
      });
    });
  }

  function programmes() {
    if (!window.Swiper) return;
    var barI = $('[data-prog-progress] i');
    new window.Swiper('.prog-swiper', {
      slidesPerView: 'auto', spaceBetween: 18, speed: 900, grabCursor: true,
      navigation: { prevEl: '[data-prog-prev]', nextEl: '[data-prog-next]' },
      mousewheel: { forceToAxis: true },
      keyboard: { enabled: true, onlyInViewport: true },
      on: { progress: function (s, p) { if (barI) barI.style.transform = 'scaleX(' + (0.17 + Math.max(0, Math.min(1, p)) * 0.83) + ')'; } }
    });
    gsap.from('.prog-swiper .swiper-slide', { x: 140, opacity: 0, rotate: 3, duration: 1.4, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.prog-swiper', start: 'top 85%', once: true } });
  }

  function spotlight() {
    $$('.tcard').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  function tilt() {
    if (!finePointer) return;
    $$('[data-tilt], .hs__card').forEach(function (el) {
      var rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3' });
      var ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3' });
      gsap.set(el, { transformPerspective: 1200 });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 5);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 5);
      });
      el.addEventListener('mouseleave', function () { rx(0); ry(0); });
    });
  }

  function orbit() {
    var o = $('[data-orbit]');
    if (!o) return;
    var nodes = $$('.node', o), imgs = $$('.orbit__core img', o), arc = $('[data-orbit-arc]', o);
    var nameEl = $('[data-t-name]', o), elEl = $('[data-t-el]', o), whatEl = $('[data-t-what]', o);
    var C = 603.2, cur = 0, timer = null, auto = true;
    function show(i) {
      cur = i;
      nodes.forEach(function (n, k) { n.classList.toggle('is-active', k === i); });
      imgs.forEach(function (im, k) { im.classList.toggle('is-active', k === i); });
      gsap.to(arc, { strokeDashoffset: C * (1 - (i + 1) / 5), duration: 1.2, ease: 'power3.inOut' });
      gsap.timeline()
        .to([elEl, nameEl, whatEl], { opacity: 0, y: -10, duration: 0.25, ease: 'power2.in' })
        .add(function () { nameEl.textContent = TATTVA[i].name; elEl.textContent = TATTVA[i].el; whatEl.textContent = TATTVA[i].what; })
        .to([elEl, nameEl, whatEl], { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'expo.out' });
      if (timer) clearTimeout(timer);
      if (auto) timer = setTimeout(function () { show((cur + 1) % 5); }, 4200);
    }
    nodes.forEach(function (n, k) { n.addEventListener('click', function () { auto = false; show(k); }); });
    gsap.from(nodes, { scale: 0, opacity: 0, duration: 1, stagger: 0.1, ease: 'back.out(2)', scrollTrigger: { trigger: o, start: 'top 75%', once: true } });
    gsap.from('.orbit__core', { scale: 0.7, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: o, start: 'top 75%', once: true } });
    ST.create({ trigger: o, start: 'top 70%', once: true, onEnter: function () { show(0); } });
  }

  function ctaRings() {
    gsap.from('.cta__rings i', { scale: 0.4, opacity: 0, duration: 2, stagger: 0.2, ease: 'expo.out', scrollTrigger: { trigger: '.cta', start: 'top 70%', once: true } });
    gsap.fromTo('.cta__icon', { rotate: -90 }, { rotate: 0, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'center center', scrub: true } });
  }

  /* Footer rises over the CTA; links and elements stagger in */
  function footer() {
    var foot = $('[data-foot]');
    if (!foot) return;
    gsap.fromTo('[data-foot-inner]', { yPercent: -18, opacity: 0.4 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: foot, start: 'top bottom', end: 'top 35%', scrub: true } });
    gsap.from('[data-foot-item]', { y: 40, opacity: 0, duration: 1, stagger: 0.04, ease: 'expo.out', scrollTrigger: { trigger: foot, start: 'top 70%', once: true } });
    var ring = $('[data-totop-ring]'), C = 175.9;
    ST.create({ start: 0, end: 'max', onUpdate: function (self) { if (ring) ring.style.strokeDashoffset = C * (1 - self.progress); } });
    var btn = $('[data-totop]');
    if (btn) btn.addEventListener('click', function () { if (lenis) lenis.scrollTo(0, { duration: 2.2 }); else window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* Floating actions appear after the hero and step aside for the footer */
  function dock() {
    var els = [$('[data-dock]'), $('.wa-float')].filter(Boolean);
    var afterHero = false, inFooter = false;
    function sync() { els.forEach(function (el) { el.classList.toggle('is-visible', afterHero && !inFooter); }); }
    ST.create({ trigger: '#about', start: 'top 70%', onEnter: function () { afterHero = true; sync(); }, onLeaveBack: function () { afterHero = false; sync(); } });
    ST.create({ trigger: '[data-foot]', start: 'top 85%', onEnter: function () { inFooter = true; sync(); }, onLeaveBack: function () { inFooter = false; sync(); } });
  }

  function year() { var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear(); }

  document.addEventListener('show.bs.offcanvas', function () { if (lenis) lenis.stop(); });
  document.addEventListener('hidden.bs.offcanvas', function () { if (lenis) lenis.start(); });

  /* ---------- Shared helpers ---------- */
  function buildDial() {
    var g = document.querySelector('[data-dial-ticks]');
    if (!g) return;
    var html = '';
    for (var i = 0; i < 120; i++) {
      var a = i * 3 * Math.PI / 180, mj = i % 10 === 0;
      var r1 = mj ? 172 : 182, r2 = 190;
      html += '<line' + (mj ? ' class="mj"' : '') + ' x1="' + (200 + r1 * Math.sin(a)).toFixed(2) + '" y1="' + (200 - r1 * Math.cos(a)).toFixed(2) + '" x2="' + (200 + r2 * Math.sin(a)).toFixed(2) + '" y2="' + (200 - r2 * Math.cos(a)).toFixed(2) + '"/>';
    }
    g.innerHTML = html;
  }

  /* ---------- Static fallback (no GSAP / reduced motion) ---------- */
  function startStatic() {
    var y = document.querySelector('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
    var dots = document.querySelector('[data-matrix-dots]');
    if (dots) {
      for (var i = 0; i < 183; i++) { var d = document.createElement('i'); d.className = i % 6 === 0 ? 'is-on' : 'is-off'; dots.appendChild(d); }
      var n = document.querySelector('[data-matrix-num]'); if (n) n.textContent = '30';
      var l = document.querySelector('[data-matrix-label]'); if (l) l.textContent = 'measures · signal';
    }
    document.querySelectorAll('.stat__ring .p').forEach(function (c) { c.style.strokeDashoffset = 0; });
    if (window.Swiper) new window.Swiper('.prog-swiper', { slidesPerView: 'auto', spaceBetween: 18, navigation: { prevEl: '[data-prog-prev]', nextEl: '[data-prog-next]' } });
    document.querySelectorAll('[data-d]').forEach(function (t) {
      t.addEventListener('click', function () {
        var i = +t.getAttribute('data-d'), dd = DOMAINS[i];
        document.querySelectorAll('[data-d]').forEach(function (b) { b.setAttribute('aria-selected', String(b === t)); });
        document.querySelector('[data-d-num]').textContent = '0' + (i + 1);
        document.querySelector('[data-d-type]').textContent = dd.type;
        document.querySelector('[data-d-name]').textContent = dd.n;
        var ul = document.querySelector('[data-d-tags]'); ul.innerHTML = '';
        dd.m.forEach(function (m) { var li = document.createElement('li'); li.textContent = m; ul.appendChild(li); });
      });
    });
    document.querySelectorAll('.node').forEach(function (nd, i) {
      nd.addEventListener('click', function () {
        document.querySelectorAll('.node').forEach(function (b, k) { b.classList.toggle('is-active', k === i); });
        document.querySelectorAll('.orbit__core img').forEach(function (im, k) { im.classList.toggle('is-active', k === i); });
        document.querySelector('[data-t-name]').textContent = TATTVA[i].name;
        document.querySelector('[data-t-el]').textContent = TATTVA[i].el;
        document.querySelector('[data-t-what]').textContent = TATTVA[i].what;
      });
    });
    var top = document.querySelector('[data-totop]');
    if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
})();
