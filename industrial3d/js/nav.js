/* Navigation: mobile menu toggle, theme switcher, active link */
(function () {
  'use strict';

  /* ── Theme ── */
  const THEME_KEY = 'i3d-theme';
  const root = document.documentElement;

  function getTheme() {
    return localStorage.getItem(THEME_KEY) ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    localStorage.setItem(THEME_KEY, t);
  }

  applyTheme(getTheme());

  document.addEventListener('DOMContentLoaded', function () {
    /* ── Theme toggle ── */
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    /* ── Mobile hamburger ── */
    const hamburger = document.getElementById('navHamburger');
    const navLinks  = document.getElementById('navLinks');

    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function () {
        const open = navLinks.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', open);
      });

      /* Close on outside click */
      document.addEventListener('click', function (e) {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
          navLinks.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });

      /* Close on nav-link click */
      navLinks.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          navLinks.classList.remove('open');
        });
      });
    }

    /* ── Active link ── */
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link[data-page]').forEach(function (link) {
      if (link.dataset.page === current) {
        link.classList.add('active');
      }
    });

    /* ── Scroll header elevation ── */
    const header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', function () {
        header.style.borderBottomColor = window.scrollY > 10
          ? 'var(--border-faint)'
          : 'transparent';
      }, { passive: true });
    }
  });
})();
