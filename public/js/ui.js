// public/js/ui.js — UI interactions, DOM manipulation, and ES6 Features
// Features: Event delegation, Set/Map filtering, sortable tables, flash auto-dismiss,
// ES6 StockItem class, and image preview.

'use strict';

// ─── 1. Flash Message Auto-Dismiss ───────────────────────────────
const initFlashMessages = () => {
  const flashMessages = document.querySelectorAll('.msg');
  if (!flashMessages.length) return;

  flashMessages.forEach((msg) => {
    // 1. Manual close button click
    const closeBtn = msg.querySelector('.msg-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        msg.remove(); // removes DOM element
      });
    }

    // 2. Auto-hide after 4 seconds (4000 ms) using setTimeout
    setTimeout(() => {
      // Check if message is still in DOM before removing
      if (document.body.contains(msg)) {
        msg.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(-10px)';
        setTimeout(() => msg.remove(), 500);
      }
    }, 4000);
  });
};

// ─── 2. Delete Confirmation with Event Delegation ────────────────
// Attaches ONE single submit listener on the document body (event bubbling)
// instead of attaching individual listeners to every delete button.
const initDeleteConfirmation = () => {
  document.body.addEventListener('submit', (event) => {
    const form = event.target.closest('form');
    if (!form || !form.matches('.delete-form, form[action*="/delete"]')) return;

    const confirmed = confirm('Are you sure you want to delete this record? This action cannot be undone.');
    if (!confirmed) {
      event.preventDefault(); // cancel form submission
    }
  });
};

// ─── 3. Low-Stock Highlighting ───────────────────────────────────
// Loops through all rows with data-quantity attributes and adds low-stock visual warning
const applyLowStockHighlight = () => {
  const rows = document.querySelectorAll('tr[data-quantity]');
  if (!rows.length) return;

  rows.forEach((row) => {
    const qty = Number(row.dataset.quantity);
    const reorder = Number(row.dataset.reorder);

    if (!isNaN(qty) && !isNaN(reorder) && qty <= reorder) {
      row.classList.add('low-stock');
    } else {
      row.classList.remove('low-stock');
    }
  });
};

// ─── 4. Client-Side Category Filter (using Set and Map) ──────────
const initClientCategoryFilter = () => {
  const table = document.getElementById('items-table');
  const select = document.getElementById('client-category-filter');
  if (!table || !select) return;

  const rows = table.querySelectorAll('tbody tr');
  if (!rows.length) return;

  // Use an ES6 Set to automatically eliminate duplicate categories
  const categorySet = new Set();
  // Use an ES6 Map to count occurrences of items per category
  const categoryCountMap = new Map();

  rows.forEach((row) => {
    const cat = row.dataset.category || 'General';
    categorySet.add(cat);
    categoryCountMap.set(cat, (categoryCountMap.get(cat) || 0) + 1);
  });

  // Populate <select> options dynamically with template strings
  categorySet.forEach((category) => {
    const count = categoryCountMap.get(category) || 0;
    const option = document.createElement('option');
    option.value = category;
    option.textContent = `${category} (${count})`;
    select.appendChild(option);
  });

  // Filter rows on change event without page reloading
  select.addEventListener('change', (e) => {
    const selected = e.target.value;
    rows.forEach((row) => {
      const rowCategory = row.dataset.category || 'General';
      if (selected === 'ALL' || rowCategory === selected) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
};

// ─── 5. Sortable Table Columns ───────────────────────────────────
const initSortableTables = () => {
  const sortableHeaders = document.querySelectorAll('th.sortable');
  if (!sortableHeaders.length) return;

  sortableHeaders.forEach((th) => {
    th.style.cursor = 'pointer';

    th.addEventListener('click', () => {
      const table = th.closest('table');
      const tbody = table ? table.querySelector('tbody') : null;
      if (!tbody) return;

      const columnIndex = th.cellIndex;
      const isNumber = th.dataset.type === 'number';
      const isAsc = !th.classList.contains('sorted-asc');

      // Use spread operator to convert NodeList/HTMLCollection into a standard Array
      const rowsArray = [...tbody.rows];

      // Sort the rows based on cell textContent
      rowsArray.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex] ? rowA.cells[columnIndex].textContent.trim() : '';
        const cellB = rowB.cells[columnIndex] ? rowB.cells[columnIndex].textContent.trim() : '';

        if (isNumber) {
          // Parse currency or numbers (strip $ and commas)
          const numA = parseFloat(cellA.replace(/[^0-9.-]+/g, '')) || 0;
          const numB = parseFloat(cellB.replace(/[^0-9.-]+/g, '')) || 0;
          return isAsc ? numA - numB : numB - numA;
        } else {
          return isAsc ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
        }
      });

      // Clear sorting indicators on all sibling header elements
      let sibling = th.parentElement ? th.parentElement.firstElementChild : null;
      while (sibling) {
        sibling.classList.remove('sorted-asc', 'sorted-desc');
        sibling = sibling.nextElementSibling; // Demonstrates nextElementSibling traversal
      }

      // Highlight the active sorted header
      th.classList.add(isAsc ? 'sorted-asc' : 'sorted-desc');

      // Re-append sorted rows to tbody using appendChild
      rowsArray.forEach((row) => tbody.appendChild(row));
    });
  });
};

// ─── 6. ES6 StockItem Class & Dashboard Banner ───────────────────
class StockItem {
  constructor({ name = 'Unknown', quantity = 0, reorderLevel = 0 }) {
    this.name = name;
    this.quantity = Number(quantity);
    this.reorderLevel = Number(reorderLevel);
  }

  get status() {
    return this.isLow() ? 'Low Stock' : 'Optimal';
  }

  isLow() {
    return this.quantity <= this.reorderLevel;
  }

  toRow() {
    return `${this.name}: ${this.quantity} units (reorder at ${this.reorderLevel})`;
  }
}

const initDashboardStockItems = () => {
  const bannerContainer = document.getElementById('stock-summary-banner');
  const lowStockTable = document.getElementById('low-stock-table');
  if (!bannerContainer || !lowStockTable) return;

  const rows = [...lowStockTable.querySelectorAll('tbody tr')];
  if (!rows.length) return;

  // Transform table row elements into StockItem class instances
  const stockItems = rows.map((tr) => {
    const nameEl = tr.querySelector('td a');
    const name = nameEl ? nameEl.textContent.trim() : 'Item';
    const quantity = tr.dataset.quantity || 0;
    const reorderLevel = tr.dataset.reorder || 0;
    return new StockItem({ name, quantity, reorderLevel });
  });

  // Use Array.find to find the most critically depleted item (zero or minimum stock)
  const criticalItem = stockItems.find((item) => item.quantity === 0) ||
                       stockItems.find((item) => item.isLow());

  // Use Array.findIndex to locate the row index of the critical item
  const criticalIndex = criticalItem
    ? stockItems.findIndex((it) => it.name === criticalItem.name)
    : -1;

  // Render an alert banner using template strings
  const banner = document.createElement('div');
  banner.className = 'msg msg-warning';
  banner.style.display = 'flex';
  banner.style.alignItems = 'center';
  banner.style.justifyContent = 'space-between';

  banner.innerHTML = `
    <div>
      <strong>⚠️ Low Stock Attention:</strong>
      <span>${stockItems.length} item${stockItems.length === 1 ? '' : 's'} currently at or below reorder threshold.</span>
      ${criticalItem ? `<span style="margin-left: 8px;">(e.g. <em>${criticalItem.name}</em> with only ${criticalItem.quantity} left!)</span>` : ''}
    </div>
    ${criticalIndex !== -1 ? `<span class="badge badge-warning">Row #${criticalIndex + 1}</span>` : ''}
  `;

  bannerContainer.appendChild(banner);
};

// ─── 7. Image Preview ────────────────────────────────────────────
// Listens for file selection on <input type="file" id="image">
// and generates a live local preview using URL.createObjectURL.
const initImagePreview = () => {
  const fileInput = document.getElementById('image');
  const previewContainer = document.getElementById('image-preview-container');
  const previewImg = document.getElementById('image-preview');

  if (!fileInput || !previewContainer || !previewImg) return;

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file && file.type.startsWith('image/')) {
      // Generate object URL for instant browser rendering
      const previewUrl = URL.createObjectURL(file);
      previewImg.setAttribute('src', previewUrl);
      previewContainer.style.display = 'block';

      // Revoke the object URL once image loads to prevent memory leaks
      previewImg.onload = () => {
        URL.revokeObjectURL(previewUrl);
      };
    } else {
      previewContainer.style.display = 'none';
      previewImg.removeAttribute('src');
    }
  });
};

// Export onto window namespace for main.js and Phase 6 Ajax re-highlighting
window.StockPilotUI = {
  initFlashMessages,
  initDeleteConfirmation,
  applyLowStockHighlight,
  initClientCategoryFilter,
  initSortableTables,
  initDashboardStockItems,
  initImagePreview,
  StockItem
};
