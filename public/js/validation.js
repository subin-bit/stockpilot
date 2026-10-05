// public/js/validation.js — Client-side Form Validation
// Demonstrates: ES6 arrow functions, default parameter values, object destructuring,
// DOM element creation, DOM manipulation, aria accessibility attributes, and RegExp.

'use strict';

// ─── Small Validator Arrow Functions with Default Parameters ────
const isNotEmpty = (val = '') => typeof val === 'string' && val.trim().length > 0;

const isMinLength = (str = '', minLength = 6) => typeof str === 'string' && str.trim().length >= minLength;

const isValidEmail = (email = '') => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const isNonNegativeNumber = (val = 0) => {
  const num = Number(val);
  return !isNaN(num) && num >= 0;
};

const isPositiveInteger = (val = 1, min = 1) => {
  const num = parseInt(val, 10);
  return !isNaN(num) && num >= min;
};

// ─── Error Message Display Helpers ──────────────────────────────
// Clears any previously inserted client error for an input element
const clearFieldError = (input) => {
  if (!input) return;
  input.removeAttribute('aria-invalid');
  const parent = input.parentElement;
  if (!parent) return;
  const existingError = parent.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
};

// Creates a friendly error element using document.createElement and inserts after input
const showFieldError = (input, message = 'Invalid field') => {
  if (!input) return;
  clearFieldError(input);

  // Set aria accessibility attribute
  input.setAttribute('aria-invalid', 'true');

  // Create DOM error element
  const errorEl = document.createElement('div');
  errorEl.className = 'field-error';
  errorEl.textContent = message;

  // Insert after the input or its container
  input.insertAdjacentElement('afterend', errorEl);

  // Auto-clear when user begins typing to correct the error
  input.addEventListener('input', () => clearFieldError(input), { once: true });
};

// ─── Form Handlers ──────────────────────────────────────────────

// 1. Register Form Validation
const initRegisterValidation = () => {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    // Destructure form fields from FormData using Object.fromEntries
    const { name, email, password } = Object.fromEntries(new FormData(form));
    let hasError = false;

    // Validate Name
    const nameInput = form.querySelector('#name');
    if (!isNotEmpty(name)) {
      showFieldError(nameInput, 'Full Name is required.');
      hasError = true;
    } else {
      clearFieldError(nameInput);
    }

    // Validate Email
    const emailInput = form.querySelector('#email');
    if (!isNotEmpty(email)) {
      showFieldError(emailInput, 'Email Address is required.');
      hasError = true;
    } else if (!isValidEmail(email)) {
      showFieldError(emailInput, 'Please provide a valid email format (e.g. user@example.com).');
      hasError = true;
    } else {
      clearFieldError(emailInput);
    }

    // Validate Password
    const passwordInput = form.querySelector('#password');
    if (!isMinLength(password, 6)) {
      showFieldError(passwordInput, 'Password must be at least 6 characters long.');
      hasError = true;
    } else {
      clearFieldError(passwordInput);
    }

    if (hasError) {
      event.preventDefault();
    }
  });
};

// 2. Login Form Validation
const initLoginValidation = () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    const { email, password } = Object.fromEntries(new FormData(form));
    let hasError = false;

    const emailInput = form.querySelector('#email');
    if (!isNotEmpty(email) || !isValidEmail(email)) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      hasError = true;
    } else {
      clearFieldError(emailInput);
    }

    const passwordInput = form.querySelector('#password');
    if (!isNotEmpty(password)) {
      showFieldError(passwordInput, 'Password is required.');
      hasError = true;
    } else {
      clearFieldError(passwordInput);
    }

    if (hasError) {
      event.preventDefault();
    }
  });
};

// 3. Item Form Validation (New & Edit)
const initItemValidation = () => {
  const form = document.getElementById('item-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    const { name, sku, unitPrice, quantity, reorderLevel } = Object.fromEntries(new FormData(form));
    let hasError = false;

    // Validate Item Name
    const nameInput = form.querySelector('#name');
    if (!isNotEmpty(name)) {
      showFieldError(nameInput, 'Item name is required.');
      hasError = true;
    } else {
      clearFieldError(nameInput);
    }

    // Validate SKU
    const skuInput = form.querySelector('#sku');
    if (!isNotEmpty(sku)) {
      showFieldError(skuInput, 'SKU is required.');
      hasError = true;
    } else {
      clearFieldError(skuInput);
    }

    // Validate Unit Price (>= 0)
    const priceInput = form.querySelector('#unitPrice');
    if (!isNotEmpty(unitPrice) || !isNonNegativeNumber(unitPrice)) {
      showFieldError(priceInput, 'Price must be a valid positive number or 0.');
      hasError = true;
    } else {
      clearFieldError(priceInput);
    }

    // Validate Quantity (>= 0)
    const qtyInput = form.querySelector('#quantity');
    if (isNotEmpty(quantity) && !isNonNegativeNumber(quantity)) {
      showFieldError(qtyInput, 'Quantity cannot be negative.');
      hasError = true;
    } else {
      clearFieldError(qtyInput);
    }

    // Validate Reorder Level (>= 0)
    const reorderInput = form.querySelector('#reorderLevel');
    if (isNotEmpty(reorderLevel) && !isNonNegativeNumber(reorderLevel)) {
      showFieldError(reorderInput, 'Reorder level cannot be negative.');
      hasError = true;
    } else {
      clearFieldError(reorderInput);
    }

    if (hasError) {
      event.preventDefault();
    }
  });
};

// 4. Supplier Form Validation
const initSupplierValidation = () => {
  const form = document.getElementById('supplier-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    const { name, email } = Object.fromEntries(new FormData(form));
    let hasError = false;

    const nameInput = form.querySelector('#name');
    if (!isNotEmpty(name)) {
      showFieldError(nameInput, 'Supplier name is required.');
      hasError = true;
    } else {
      clearFieldError(nameInput);
    }

    const emailInput = form.querySelector('#email');
    if (isNotEmpty(email) && !isValidEmail(email)) {
      showFieldError(emailInput, 'Please provide a valid email address format.');
      hasError = true;
    } else {
      clearFieldError(emailInput);
    }

    if (hasError) {
      event.preventDefault();
    }
  });
};

// 5. Stock Transaction Form Validation
const initTransactionValidation = () => {
  const form = document.getElementById('transaction-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    const { item, type, quantity } = Object.fromEntries(new FormData(form));
    let hasError = false;

    const itemSelect = form.querySelector('#item');
    if (!isNotEmpty(item)) {
      showFieldError(itemSelect, 'Please select an item from the inventory catalog.');
      hasError = true;
    } else {
      clearFieldError(itemSelect);
    }

    const qtyInput = form.querySelector('#quantity');
    if (!isPositiveInteger(quantity, 1)) {
      showFieldError(qtyInput, 'Quantity must be at least 1 unit.');
      hasError = true;
    } else {
      clearFieldError(qtyInput);
    }

    if (hasError) {
      event.preventDefault();
    }
  });
};

// Export validation initializers onto window namespace
window.StockPilotValidation = {
  initRegisterValidation,
  initLoginValidation,
  initItemValidation,
  initSupplierValidation,
  initTransactionValidation
};
