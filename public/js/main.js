// public/js/main.js — StockPilot client-side JavaScript
// Phase 0: only the navbar toggle. Phase 5 adds more features.

'use strict';

// ─── Navbar hamburger toggle (mobile) ───────────────────────────
const navToggle = document.getElementById('navbar-toggle');
const navMenu   = document.getElementById('navbar-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}

// ─── Flash message close buttons ────────────────────────────────
// Attach click handlers to message close buttons
document.querySelectorAll('.msg-close').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.parentElement.remove();
  });
});
