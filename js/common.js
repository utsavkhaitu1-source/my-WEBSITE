/* =========================================================
   Utsav Forecasts — shared behaviour (all pages)
   - highlights the current page in the nav bar
   - mobile menu toggle
   - light / dark theme (remembered in localStorage)
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
    }
  };

  /* ----- Theme ----- */
  let theme = store.get('utsav-theme',
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const themeBtn = document.getElementById('theme-btn');

  function applyTheme() {
    root.dataset.theme = theme;
    if (themeBtn) {
      const icon = themeBtn.querySelector('i');
      if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      store.set('utsav-theme', theme);
      applyTheme();
    });
  }
  applyTheme();

  /* ----- Active link ----- */
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const target = a.getAttribute('href').toLowerCase();
    if (target === current) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ----- Mobile menu ----- */
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* ----- Footer year ----- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
