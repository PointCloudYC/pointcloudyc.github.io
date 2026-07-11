// Shared page-chrome widgets for the main site + blog (Contour & Ink design system).
// Each block no-ops if its markup isn't present on the page, so this file is safe
// to include on any page regardless of which widgets it actually uses.

// Reading progress bar — thin fill reflecting scroll position through the page
(function () {
  var fill = document.getElementById('progress-fill');
  if (!fill) return;
  var ticking = false;
  function update() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - window.innerHeight;
    var pct = height > 0 ? scrollTop / height : 0;
    fill.style.transform = 'scaleX(' + Math.min(1, Math.max(0, pct)) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

// Back-to-top button — fades in once the reader has scrolled past the header
(function () {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 480);
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// Section dot-rail — highlights the section currently in view
(function () {
  var rail = document.getElementById('section-rail');
  if (!rail || !('IntersectionObserver' in window)) return;
  var links = Array.prototype.slice.call(rail.querySelectorAll('a'));
  var linkById = {};
  var targets = [];
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) { linkById[id] = a; targets.push(el); }
  });
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        links.forEach(function (a) { a.classList.remove('active'); });
        linkById[entry.target.id].classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  targets.forEach(function (t) { observer.observe(t); });
})();

// Scroll-reveal for sections and cards (skipped entirely when reduced motion is preferred)
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;
  var els = document.querySelectorAll('.reveal');
  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { observer.observe(el); });
})();
