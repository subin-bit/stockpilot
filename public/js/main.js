// public/js/main.js — StockPilot Client-Side Master Orchestrator
// Coordinates: Mobile navbar, UI enhancements, DOM manipulations, and Form Validations.

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ─── 1. Navbar Hamburger Toggle (Mobile View) ───────────────────
  const navToggle = document.getElementById('navbar-toggle');
  const navMenu   = document.getElementById('navbar-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // ─── 2. Initialize UI Features (from ui.js) ─────────────────────
  if (window.StockPilotUI) {
    const {
      initFlashMessages,
      initDeleteConfirmation,
      applyLowStockHighlight,
      initClientCategoryFilter,
      initSortableTables,
      initDashboardStockItems,
      initImagePreview
    } = window.StockPilotUI;

    initFlashMessages();
    initDeleteConfirmation();
    applyLowStockHighlight();
    initClientCategoryFilter();
    initSortableTables();
    initDashboardStockItems();
    initImagePreview();
  }

  // ─── 3. Initialize Client-Side Form Validations (from validation.js)
  if (window.StockPilotValidation) {
    const {
      initRegisterValidation,
      initLoginValidation,
      initItemValidation,
      initSupplierValidation,
      initTransactionValidation
    } = window.StockPilotValidation;

    initRegisterValidation();
    initLoginValidation();
    initItemValidation();
    initSupplierValidation();
    initTransactionValidation();
  }
});
