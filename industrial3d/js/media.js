/* media.js — lightbox for figures/videos + lazy-loaded autoplay videos */
(function () {
  'use strict';

  /* ── Lightbox ─────────────────────────────────────────────── */
  let lb, lbStage, lbCaption;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML =
      '<button class="lightbox-close" aria-label="Close (Esc)">×</button>' +
      '<div class="lightbox-stage"></div>' +
      '<p class="lightbox-caption"></p>';
    document.body.appendChild(lb);
    lbStage = lb.querySelector('.lightbox-stage');
    lbCaption = lb.querySelector('.lightbox-caption');

    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox-close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) close();
    });
  }

  function open(node, captionHtml) {
    if (!lb) buildLightbox();
    lbStage.innerHTML = '';
    lbStage.appendChild(node);
    lbCaption.innerHTML = captionHtml || '';
    lbCaption.style.display = captionHtml ? 'block' : 'none';
    lb.classList.add('open');
    document.body.classList.add('lb-lock');
  }

  function close() {
    lb.classList.remove('open');
    document.body.classList.remove('lb-lock');
    setTimeout(function () {
      if (lbStage) lbStage.innerHTML = '';
    }, 220);
  }

  /* Open a high-res image. `full` = full-res src (falls back to displayed src). */
  function openImage(src, alt, captionHtml) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    open(img, captionHtml);
  }

  /* Open a looping video (clone of an existing <video> or by src list). */
  function openVideo(sources, captionHtml) {
    const v = document.createElement('video');
    v.autoplay = true; v.loop = true; v.muted = true;
    v.controls = true; v.playsInline = true;
    sources.forEach(function (s) {
      const src = document.createElement('source');
      src.src = s.src; src.type = s.type;
      v.appendChild(src);
    });
    open(v, captionHtml);
  }

  /* ── Lazy autoplay videos ─────────────────────────────────── */
  function setupLazyVideos() {
    const vids = document.querySelectorAll('video[data-lazy]');
    if (!vids.length) return;

    function load(v) {
      if (v.dataset.loaded) return;
      v.dataset.loaded = '1';
      v.querySelectorAll('source[data-src]').forEach(function (s) {
        s.src = s.dataset.src;
      });
      v.load();
      const p = v.play();
      if (p && p.catch) p.catch(function () {});
    }

    if (!('IntersectionObserver' in window)) {
      vids.forEach(load);
      return;
    }

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { load(en.target); }
        else if (en.target.dataset.loaded && !en.target.paused) {
          en.target.pause();              /* save CPU when off-screen */
        } else if (en.target.dataset.loaded) {
          en.target.play().catch(function(){});
        }
      });
    }, { rootMargin: '200px 0px', threshold: 0.1 });

    vids.forEach(function (v) { io.observe(v); });
  }

  /* ── Wire up zoom triggers ────────────────────────────────── */
  function wireZoom() {
    document.querySelectorAll('[data-zoom]').forEach(function (el) {
      el.classList.add('zoomable');
      el.addEventListener('click', function () {
        const cap = el.getAttribute('data-caption') || '';
        if (el.dataset.zoom === 'video') {
          const srcs = [];
          el.querySelectorAll('source').forEach(function (s) {
            srcs.push({ src: s.dataset.src || s.src, type: s.type });
          });
          openVideo(srcs, cap);
        } else {
          const full = el.getAttribute('data-full');
          const img = el.tagName === 'IMG' ? el : el.querySelector('img');
          openImage(full || (img && img.currentSrc) || (img && img.src), img && img.alt, cap);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupLazyVideos();
    wireZoom();
  });
})();
