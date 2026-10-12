// public/js/app.js — Core Client Application Script
// Handles sidebar responsive toggles, alert dismissals, Chart.js graphs, and interactive stock helpers.

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ─── 1. Responsive Sidebar Controls ──────────────────────────────
  const appSidebar = document.getElementById('appSidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  const openSidebar = () => {
    if (appSidebar) appSidebar.classList.add('sidebar-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    if (appSidebar) appSidebar.classList.remove('sidebar-open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  // Close sidebar on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && appSidebar && appSidebar.classList.contains('sidebar-open')) {
      closeSidebar();
    }
  });

  // ─── 2. Flash Alert Dismissal ─────────────────────────────────────
  const alertCloseButtons = document.querySelectorAll('.alert-close');
  alertCloseButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const alert = btn.closest('.alert');
      if (alert) {
        alert.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-6px)';
        setTimeout(() => alert.remove(), 200);
      }
    });
  });

  // Auto-dismiss success alert after 6 seconds
  const successAlert = document.getElementById('flash-success');
  if (successAlert) {
    setTimeout(() => {
      if (successAlert.parentNode) {
        successAlert.style.transition = 'opacity 0.4s ease';
        successAlert.style.opacity = '0';
        setTimeout(() => successAlert.remove(), 400);
      }
    }, 6000);
  }

  // ─── 3. Dashboard Chart.js Visualizations ─────────────────────────
  const chartDataEl = document.getElementById('dashboardChartData');
  if (chartDataEl && typeof Chart !== 'undefined') {
    try {
      const rawData = chartDataEl.getAttribute('data-charts');
      const categoryData = JSON.parse(rawData || '[]');

      const labels = categoryData.map(c => c.name);
      const stockQuantities = categoryData.map(c => c.totalQty);
      const productCounts = categoryData.map(c => c.count);

      // Color palette for charts
      const modernPalette = [
        '#6366f1', // Indigo
        '#06b6d4', // Cyan
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#3b82f6', // Blue
        '#14b8a6'  // Teal
      ];

      // Bar Chart: Stock Volume by Category
      const barCanvas = document.getElementById('categoryStockChart');
      if (barCanvas) {
        new Chart(barCanvas.getContext('2d'), {
          type: 'bar',
          data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
              label: 'Stock Units',
              data: stockQuantities.length > 0 ? stockQuantities : [0],
              backgroundColor: 'rgba(99, 102, 241, 0.75)',
              borderColor: '#6366f1',
              borderWidth: 1.5,
              borderRadius: 6,
              hoverBackgroundColor: '#818cf8'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1a2235',
                titleColor: '#fff',
                bodyColor: '#e0e7ff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                  label: (ctx) => ` Available: ${ctx.parsed.y} units`
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#9ca3af', font: { family: 'Inter', size: 11 } }
              },
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#9ca3af', font: { family: 'Inter', size: 11 }, precision: 0 }
              }
            }
          }
        });
      }

      // Doughnut Chart: Product Distribution
      const donutCanvas = document.getElementById('categoryDistributionChart');
      if (donutCanvas) {
        new Chart(donutCanvas.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
              data: productCounts.length > 0 ? productCounts : [1],
              backgroundColor: modernPalette.slice(0, labels.length || 1),
              borderColor: '#141a28',
              borderWidth: 3,
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#9ca3af',
                  font: { family: 'Inter', size: 11 },
                  boxWidth: 12,
                  padding: 12
                }
              },
              tooltip: {
                backgroundColor: '#1a2235',
                titleColor: '#fff',
                bodyColor: '#e0e7ff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  label: (ctx) => ` ${ctx.label}: ${ctx.parsed} items`
                }
              }
            }
          }
        });
      }
    } catch (chartErr) {
      console.warn('Dashboard charts initialization error:', chartErr);
    }
  }

  // ─── 4. Stock In / Stock Out Interactive Helper ──────────────────
  const stockForm = document.getElementById('stockMovementForm');
  if (stockForm) {
    const productSelect = document.getElementById('productSelect');
    const typeInRadio = document.getElementById('typeIn');
    const typeOutRadio = document.getElementById('typeOut');
    const stockQtyInput = document.getElementById('stockQty');
    const stockHint = document.getElementById('availableStockHint');
    const previewCard = document.getElementById('calculationPreview');
    const previewBadge = document.getElementById('previewBadge');
    const previewCurrentStock = document.getElementById('previewCurrentStock');
    const previewDelta = document.getElementById('previewDelta');
    const previewMathSymbol = document.getElementById('previewMathSymbol');
    const previewResultStock = document.getElementById('previewResultStock');
    const submitBtn = document.getElementById('submitStockBtn');

    // Auto-select query parameters if URL has ?product=... or ?type=...
    const urlParams = new URLSearchParams(window.location.search);
    const paramProduct = urlParams.get('product');
    const paramType = urlParams.get('type');

    if (paramProduct && productSelect) {
      productSelect.value = paramProduct;
    }
    if (paramType === 'OUT' && typeOutRadio) {
      typeOutRadio.checked = true;
    } else if (paramType === 'IN' && typeInRadio) {
      typeInRadio.checked = true;
    }

    const updateStockCalculation = () => {
      const selectedOption = productSelect.options[productSelect.selectedIndex];
      if (!selectedOption || !selectedOption.value) {
        if (previewCard) previewCard.style.display = 'none';
        if (stockHint) stockHint.textContent = 'Select a product to view stock limitations.';
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      const currentStock = parseInt(selectedOption.getAttribute('data-stock'), 10) || 0;
      const minStock = parseInt(selectedOption.getAttribute('data-min'), 10) || 0;
      const isOut = typeOutRadio && typeOutRadio.checked;
      const qty = parseInt(stockQtyInput.value, 10) || 0;

      if (previewCard) previewCard.style.display = 'block';

      if (previewBadge) {
        previewBadge.textContent = isOut ? 'Stock OUT' : 'Stock IN';
        previewBadge.className = isOut ? 'badge badge-out' : 'badge badge-in';
      }

      if (previewCurrentStock) previewCurrentStock.textContent = currentStock;
      if (previewMathSymbol) previewMathSymbol.textContent = isOut ? '−' : '+';
      if (previewDelta) previewDelta.textContent = qty;

      const projectedStock = isOut ? (currentStock - qty) : (currentStock + qty);

      if (previewResultStock) {
        previewResultStock.textContent = projectedStock;
        if (projectedStock < 0) {
          previewResultStock.className = 'stat-num font-bold text-danger';
        } else if (projectedStock <= minStock) {
          previewResultStock.className = 'stat-num font-bold text-warning';
        } else {
          previewResultStock.className = 'stat-num font-bold text-success';
        }
      }

      // Validations
      if (isOut && qty > currentStock) {
        if (stockHint) {
          stockHint.innerHTML = `<span class="text-danger font-bold">⚠️ Insufficient stock! Available: ${currentStock} units. Cannot dispatch ${qty}.</span>`;
        }
        if (submitBtn) {
          submitBtn.disabled = true;
        }
      } else {
        if (stockHint) {
          stockHint.innerHTML = `Available stock: <strong>${currentStock}</strong> units &bull; Min threshold: <strong>${minStock}</strong>.`;
        }
        if (submitBtn) {
          submitBtn.disabled = false;
        }
      }
    };

    if (productSelect) productSelect.addEventListener('change', updateStockCalculation);
    if (typeInRadio) typeInRadio.addEventListener('change', updateStockCalculation);
    if (typeOutRadio) typeOutRadio.addEventListener('change', updateStockCalculation);
    if (stockQtyInput) stockQtyInput.addEventListener('input', updateStockCalculation);

    // Quick increment buttons
    const quickButtons = document.querySelectorAll('.qty-quick');
    quickButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const add = parseInt(btn.getAttribute('data-add'), 10) || 1;
        const currentVal = parseInt(stockQtyInput.value, 10) || 0;
        stockQtyInput.value = currentVal + add;
        updateStockCalculation();
      });
    });

    // Run initial calculation
    updateStockCalculation();
  }

  // ─── 5. Ledger Real-Time Client Search ───────────────────────────
  const ledgerSearch = document.getElementById('ledgerSearch');
  const ledgerTable = document.getElementById('ledgerTable');
  if (ledgerSearch && ledgerTable) {
    ledgerSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const rows = ledgerTable.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }
});
