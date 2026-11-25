/* ==========================================================================
   What do you see? — shared behaviour
   - bilingual switching (EN / 中文), persisted
   - sidebar, chapter navigation, reading progress
   - two perception demos, loaded only when present
   ========================================================================== */

(function () {
  'use strict';

  var CHAPTERS = [
    { n: '01', slug: 'ch01.html', en: 'The Internet as a Visual System', zh: '互联网作为一个视觉系统' },
    { n: '02', slug: 'ch02.html', en: 'Attention, Saliency, and the Gaze', zh: '注意、显著性与凝视' },
    { n: '03', slug: 'ch03.html', en: 'From Retina to Heuristic', zh: '从视网膜到启发式' },
    { n: '04', slug: 'ch04.html', en: 'Color, Contrast, and Consequence', zh: '颜色、对比与后果' },
    { n: '05', slug: 'ch05.html', en: 'Motion as Meaning', zh: '运动即意义' },
    { n: '06', slug: 'ch06.html', en: 'Noise, Signals, and Trust', zh: '噪声、信号与信任' },
    { n: '07', slug: 'ch07.html', en: 'Scaling Beyond the Screen', zh: '超越屏幕的尺度' }
  ];

  var LANG_KEY = 'visbook:lang';
  var root = document.documentElement;

  function lang() {
    return root.getAttribute('data-lang') === 'zh' ? 'zh' : 'en';
  }

  function t(en, zh) {
    return lang() === 'zh' ? zh : en;
  }

  function applyLang(next, persist) {
    root.setAttribute('data-lang', next);
    root.setAttribute('lang', next);
    if (persist) {
      try { localStorage.setItem(LANG_KEY, next); } catch (e) { /* ignore */ }
      try {
        var url = new URL(location.href);
        url.searchParams.set('lang', next);
        history.replaceState(null, '', url);
      } catch (e) { /* ignore */ }
    }

    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-set-lang') === next));
    });

    var body = document.body;
    if (body) {
      var title = next === 'zh' ? body.getAttribute('data-title-zh') : body.getAttribute('data-title-en');
      if (title) document.title = title;
    }

    renderSidebar();
    renderChapterNav();
    refreshDemoText();
  }

  function bootLang() {
    var next = 'en';
    try {
      var param = new URLSearchParams(location.search).get('lang');
      var stored = localStorage.getItem(LANG_KEY);
      if (param === 'zh' || param === 'en') next = param;
      else if (stored === 'zh') next = 'zh';
    } catch (e) { /* ignore */ }
    applyLang(next, false);
  }

  /* ---------- Sidebar ---------- */
  function renderSidebar() {
    var host = document.getElementById('sidebar');
    if (!host) return;

    var current = document.body.getAttribute('data-chapter') || '';
    var html = '<div class="sidebar-inner">';
    html += '<p class="sidebar-label"><span class="en">Contents</span><span class="zh">目录</span></p>';
    html += '<a class="side-home" href="../book.html"><span class="en">What do you see?</span><span class="zh">你看见了什么？</span></a>';
    html += '<nav class="chapter-list" aria-label="' + t('Book chapters', '全书章节') + '">';

    CHAPTERS.forEach(function (ch) {
      var active = current === ch.n;
      html += '<a href="' + ch.slug + '"' + (active ? ' aria-current="page"' : '') + '>' +
        '<span class="num">' + ch.n + '</span>' +
        '<span class="title"><span class="en">' + ch.en + '</span><span class="zh">' + ch.zh + '</span></span>' +
        '</a>';
    });

    html += '<a class="ref-link" href="references.html"' + (current === 'refs' ? ' aria-current="page"' : '') + '>' +
      '<span class="num">&#8599;</span>' +
      '<span class="title"><span class="en">References &amp; further reading</span><span class="zh">参考文献与延伸阅读</span></span>' +
      '</a>';

    html += '</nav>';
    html += '<div class="sidebar-foot">' +
      '<span class="en">A web book in seven chapters. Read in order, or follow the figures.</span>' +
      '<span class="zh">七章网页书。可按顺序阅读，也可循图而读。</span>' +
      '</div>';
    html += '</div>';
    host.innerHTML = html;
  }

  /* ---------- Prev / next ---------- */
  function renderChapterNav() {
    var host = document.getElementById('chapter-nav');
    if (!host) return;

    var current = document.body.getAttribute('data-chapter') || '';
    var prev = null;
    var next = null;

    if (current === 'refs') {
      prev = CHAPTERS[CHAPTERS.length - 1];
    } else if (current) {
      var idx = Number(current) - 1;
      if (idx > 0) prev = CHAPTERS[idx - 1];
      if (idx < CHAPTERS.length - 1) next = CHAPTERS[idx + 1];
    }

    var out = '';
    if (prev) {
      out += '<a class="prev" href="' + prev.slug + '">' +
        '<span class="dir">' + t('Previous', '上一章') + '</span>' +
        '<span class="nav-title"><span class="en">' + prev.en + '</span><span class="zh">' + prev.zh + '</span></span>' +
        '</a>';
    } else {
      out += '<a class="prev is-empty" href="../book.html" aria-hidden="true" tabindex="-1"></a>';
    }

    if (next) {
      out += '<a class="next" href="' + next.slug + '">' +
        '<span class="dir">' + t('Next', '下一章') + '</span>' +
        '<span class="nav-title"><span class="en">' + next.en + '</span><span class="zh">' + next.zh + '</span></span>' +
        '</a>';
    } else if (current === 'refs') {
      out += '<a class="next" href="../book.html">' +
        '<span class="dir">' + t('Back to', '返回') + '</span>' +
        '<span class="nav-title"><span class="en">The cover</span><span class="zh">封面</span></span>' +
        '</a>';
    } else {
      out += '<a class="next" href="references.html">' +
        '<span class="dir">' + t('Next', '下一章') + '</span>' +
        '<span class="nav-title"><span class="en">References &amp; further reading</span><span class="zh">参考文献与延伸阅读</span></span>' +
        '</a>';
    }

    host.innerHTML = out;
  }

  /* ---------- Reading progress ---------- */
  function initProgress() {
    var bar = document.getElementById('progress-bar');
    if (!bar) return;

    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------- Mobile sidebar ---------- */
  function initMenu() {
    var btn = document.getElementById('menu-toggle');
    var sidebar = document.getElementById('sidebar');
    var scrim = document.getElementById('sidebar-scrim');
    if (!btn || !sidebar || !scrim) return;

    function setOpen(open) {
      sidebar.classList.toggle('is-open', open);
      scrim.classList.toggle('is-visible', open);
      btn.setAttribute('aria-expanded', String(open));
    }

    btn.addEventListener('click', function () {
      setOpen(!sidebar.classList.contains('is-open'));
    });
    scrim.addEventListener('click', function () { setOpen(false); });
    sidebar.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  /* ==========================================================================
     Demo 1 — change blindness
     ========================================================================== */
  var cbState = {
    running: false,
    showingB: false,
    timer: null,
    revealed: false
  };

  function initChangeBlindness() {
    var stage = document.getElementById('cb-stage');
    var toggle = document.getElementById('cb-toggle');
    var reveal = document.getElementById('cb-reveal');
    if (!stage || !toggle || !reveal) return;

    var shapesA = ['', 'tri', 'bar', '', 'sq', '', 'tri', '', 'bar'];
    var shapesB = ['', 'tri', 'bar', '', '', '', 'tri', '', 'bar'];
    var target = 4;

    var mask = document.createElement('div');
    mask.className = 'cb-mask';
    stage.appendChild(mask);

    var cells = [];
    for (var i = 0; i < 9; i++) {
      var cell = document.createElement('div');
      cell.className = 'cb-cell';
      var shape = document.createElement('span');
      shape.className = 'cb-shape';
      cell.appendChild(shape);
      stage.appendChild(cell);
      cells.push({ cell: cell, shape: shape });
    }

    function paint(showB) {
      cells.forEach(function (item, i) {
        item.shape.className = 'cb-shape ' + (showB ? shapesB[i] : shapesA[i]);
        item.cell.classList.toggle('is-target', cbState.revealed && i === target);
      });
    }

    function blink() {
      mask.classList.add('on');
      window.setTimeout(function () {
        cbState.showingB = !cbState.showingB;
        paint(cbState.showingB);
        mask.classList.remove('on');
      }, 90);
    }

    function loop() {
      if (!cbState.running) return;
      blink();
      cbState.timer = window.setTimeout(loop, 1150);
    }

    function setRunning(running) {
      cbState.running = running;
      toggle.setAttribute('aria-pressed', String(running));
      toggle.textContent = running ? t('Pause', '暂停') : t('Start blinking', '开始闪烁');
      if (running) {
        cbState.revealed = false;
        reveal.setAttribute('aria-pressed', 'false');
        paint(cbState.showingB);
        loop();
      } else {
        window.clearTimeout(cbState.timer);
      }
    }

    toggle.addEventListener('click', function () { setRunning(!cbState.running); });

    reveal.addEventListener('click', function () {
      setRunning(false);
      cbState.revealed = true;
      cbState.showingB = true;
      paint(true);
      reveal.setAttribute('aria-pressed', 'true');
    });

    paint(false);
  }

  /* ==========================================================================
     Demo 2 — contrast ratio
     ========================================================================== */
  function initContrastChecker() {
    var box = document.getElementById('cc-demo');
    if (!box) return;

    var textInput = document.getElementById('cc-text');
    var bgInput = document.getElementById('cc-bg');
    var preview = document.getElementById('cc-preview');
    var ratioEl = document.getElementById('cc-ratio');
    var badges = document.getElementById('cc-badges');
    if (!textInput || !bgInput || !preview || !ratioEl || !badges) return;

    function channel(value) {
      var c = value / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }

    function luminance(hex) {
      var h = hex.replace('#', '');
      if (h.length === 3) h = h.split('').map(function (x) { return x + x; }).join('');
      var r = parseInt(h.slice(0, 2), 16);
      var g = parseInt(h.slice(2, 4), 16);
      var b = parseInt(h.slice(4, 6), 16);
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    }

    function badge(label, threshold, ratio) {
      var pass = ratio >= threshold;
      return '<span class="badge ' + (pass ? 'pass' : 'fail') + '">' + label + ' ' + threshold + ':1 ' +
        (pass ? '&#10003;' : '&#10007;') + '</span>';
    }

    function render() {
      var fg = textInput.value;
      var bg = bgInput.value;
      var l1 = luminance(fg);
      var l2 = luminance(bg);
      var ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

      preview.style.color = fg;
      preview.style.background = bg;
      ratioEl.textContent = ratio.toFixed(2) + ':1';

      var fgCode = document.getElementById('cc-text-code');
      var bgCode = document.getElementById('cc-bg-code');
      if (fgCode) fgCode.textContent = fg;
      if (bgCode) bgCode.textContent = bg;

      badges.innerHTML = [
        badge(t('AA text', 'AA 正文'), 4.5, ratio),
        badge(t('AA large', 'AA 大字'), 3, ratio),
        badge(t('AAA text', 'AAA 正文'), 7, ratio),
        badge(t('AAA large', 'AAA 大字'), 4.5, ratio)
      ].join('');
    }

    textInput.addEventListener('input', render);
    bgInput.addEventListener('input', render);
    render();
  }

  function refreshDemoText() {
    var toggle = document.getElementById('cb-toggle');
    if (toggle) {
      toggle.textContent = cbState.running ? t('Pause', '暂停') : t('Start blinking', '开始闪烁');
    }
    var reveal = document.getElementById('cb-reveal');
    if (reveal) reveal.textContent = t('Reveal the change', '揭示变化');
    var cc = document.getElementById('cc-demo');
    if (cc) {
      var event = new Event('input');
      var text = document.getElementById('cc-text');
      if (text) text.dispatchEvent(event);
    }
  }

  /* ---------- Init ---------- */
  function init() {
    bootLang();
    renderSidebar();
    renderChapterNav();
    initProgress();
    initMenu();
    initChangeBlindness();
    initContrastChecker();

    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.getAttribute('data-set-lang'), true);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
