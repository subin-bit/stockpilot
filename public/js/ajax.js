// public/js/ajax.js — jQuery and Ajax Client-Side Module
// Syllabus Phase 6: Live Search, Auto-Refresh Dashboard Stats, Item Quick View,
// Stock Form Helper, and Animated Ajax Delete.

'use strict';

/* global $ */

$(function () {
  // Helper to safely escape HTML special characters to prevent XSS in dynamic DOM inserts
  const escapeHtml = (str) => {
    if (typeof str !== 'string') return str || '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // ═════════════════════════════════════════════════════════════════
  // FEATURE A: Live Search on /items with 300ms Debounce
  // ═════════════════════════════════════════════════════════════════
  const $liveSearch = $('#live-search');
  const $searchLoading = $('#search-loading');
  const $itemsTable = $('#items-table');
  const $itemsTbody = $itemsTable.find('tbody');
  const $searchNoResults = $('#search-no-results');
  let searchTimer = null;

  if ($liveSearch.length) {
    $liveSearch.on('input', function () {
      const query = $(this).val().trim();
      clearTimeout(searchTimer);

      searchTimer = setTimeout(() => {
        $searchLoading.show();

        $.getJSON('/api/items', { search: query })
          .done((res) => {
            if (!res.success) return;
            const items = res.data;

            if (items.length === 0) {
              $itemsTable.closest('.table-wrapper').hide();
              $searchNoResults.show();
            } else {
              $searchNoResults.hide();
              $itemsTable.closest('.table-wrapper').show();

              const isAdmin = $itemsTable.data('user-role') === 'admin';

              const rowsHtml = items.map((item) => {
                const imgHtml = item.image
                  ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="thumb">`
                  : `<div class="thumb thumb-placeholder">No img</div>`;

                const statusHtml = item.isLowStock
                  ? `<span class="badge badge-warning">Low Stock (≤ ${item.reorderLevel})</span>`
                  : `<span class="badge badge-success">In Stock</span>`;

                const adminActions = isAdmin ? `
                  <a href="/items/${item._id}/edit" class="btn btn-outline btn-sm">Edit</a>
                  <form action="/items/${item._id}/delete" method="POST" class="inline-form delete-form">
                    <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                  </form>
                ` : '';

                return `
                  <tr data-quantity="${item.quantity}" data-reorder="${item.reorderLevel}" data-category="${escapeHtml(item.category)}" class="${item.isLowStock ? 'low-stock' : ''}">
                    <td>${imgHtml}</td>
                    <td>
                      <a href="/items/${item._id}" style="font-weight: var(--fw-semibold);">
                        ${escapeHtml(item.name)}
                      </a>
                    </td>
                    <td><code>${escapeHtml(item.sku)}</code></td>
                    <td>${escapeHtml(item.category)}</td>
                    <td>$${Number(item.unitPrice).toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>${statusHtml}</td>
                    <td class="text-right">
                      <div class="btn-group" style="justify-content: flex-end;">
                        <button type="button" class="btn btn-outline btn-sm btn-quick-view" data-id="${item._id}">Quick</button>
                        <a href="/items/${item._id}" class="btn btn-outline btn-sm">View</a>
                        ${adminActions}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('');

              $itemsTbody.html(rowsHtml);

              // Re-run low stock highlight if StockPilotUI is loaded
              if (window.StockPilotUI && typeof window.StockPilotUI.applyLowStockHighlight === 'function') {
                window.StockPilotUI.applyLowStockHighlight();
              }
            }
          })
          .fail((err) => {
            console.error('Ajax live search failed:', err);
          })
          .always(() => {
            $searchLoading.hide();
          });
      }, 300);
    });
  }

  // ═════════════════════════════════════════════════════════════════
  // FEATURE B: Auto-Refresh Dashboard Stats & HTML Partial Load
  // ═════════════════════════════════════════════════════════════════
  const $refreshStatsBtn = $('#refresh-stats');
  const $txContainer = $('#recent-transactions-container');

  const refreshDashboardStats = () => {
    if (!$refreshStatsBtn.length && !$('#stat-total-items-val').length) return;

    const $icon = $refreshStatsBtn.find('.refresh-icon');
    $icon.css('display', 'inline-block').css('transition', 'transform 0.6s').css('transform', 'rotate(360deg)');
    setTimeout(() => $icon.css('transform', 'rotate(0deg)'), 600);

    // 1. Fetch JSON statistics
    $.getJSON('/api/stats')
      .done((res) => {
        if (!res.success) return;
        const { totalItems, lowStockCount, totalSuppliers, totalStockValue } = res.data;

        const updateCard = ($el, newVal) => {
          if (!$el.length) return;
          $el.fadeOut(150, function () {
            $el.text(newVal).fadeIn(150);
          });
        };

        updateCard($('#stat-total-items-val'), totalItems);
        updateCard($('#stat-low-stock-val'), lowStockCount);
        updateCard($('#stat-suppliers-val'), totalSuppliers);
        updateCard($('#stat-stock-value-val'), `$${Number(totalStockValue).toFixed(2)}`);
      })
      .fail((err) => console.error('Error fetching /api/stats:', err));

    // 2. Refresh Recent Transactions Table via jQuery .load()
    if ($txContainer.length) {
      $txContainer.load('/partials/recent-transactions', function (response, status, xhr) {
        if (status === 'error') {
          console.error('Error loading /partials/recent-transactions:', xhr.status, xhr.statusText);
        }
      });
    }
  };

  if ($refreshStatsBtn.length) {
    $refreshStatsBtn.on('click', refreshDashboardStats);
    // Periodically auto-refresh every 30 seconds (30,000 ms)
    setInterval(refreshDashboardStats, 30000);
  }

  // ═════════════════════════════════════════════════════════════════
  // FEATURE C: Item Quick View (Slide-Down Panel)
  // ═════════════════════════════════════════════════════════════════
  const $quickViewPanel = $('#quick-view-panel');
  const $quickViewClose = $('#quick-view-close');

  $(document).on('click', '.btn-quick-view', function (e) {
    e.preventDefault();
    const itemId = $(this).data('id');
    if (!itemId) return;

    $.getJSON(`/api/items/${itemId}`)
      .done((res) => {
        if (!res.success) return;
        const item = res.data;

        $('#qv-name').text(item.name);
        $('#qv-sku').text(item.sku);
        $('#qv-category').text(item.category || 'General');
        $('#qv-price').text(`$${Number(item.unitPrice).toFixed(2)}`);
        $('#qv-stock').text(`${item.quantity} units (Reorder at ${item.reorderLevel})`);
        $('#qv-supplier').text(item.supplier ? item.supplier.name : 'None assigned');

        const $statusBadge = $('#qv-status-badge');
        if (item.isLowStock) {
          $statusBadge.attr('class', 'badge badge-warning').text('⚠️ Low Stock Alert');
        } else {
          $statusBadge.attr('class', 'badge badge-success').text('✓ Sufficient Stock');
        }

        const $img = $('#qv-image');
        if (item.image) {
          $img.attr('src', item.image).show();
        } else {
          $img.hide();
        }

        if (item.description && item.description.trim().length > 0) {
          $('#qv-description').html(item.description);
          $('#qv-description-row').show();
        } else {
          $('#qv-description-row').hide();
        }

        $('#qv-full-link').attr('href', `/items/${item._id}`);
        $('#qv-restock-link').attr('href', `/transactions/new?item=${item._id}`);

        $quickViewPanel.slideDown(300);

        // Smooth scroll to quick view panel
        $('html, body').animate({
          scrollTop: $quickViewPanel.offset().top - 80
        }, 300);
      })
      .fail((err) => {
        console.error('Quick view error:', err);
        alert('Could not retrieve item details.');
      });
  });

  if ($quickViewClose.length) {
    $quickViewClose.on('click', function () {
      $quickViewPanel.slideUp(250);
    });
  }

  // ═════════════════════════════════════════════════════════════════
  // FEATURE D: Stock IN/OUT Quick Form Helper on /transactions/new
  // ═════════════════════════════════════════════════════════════════
  const $txItemSelect = $('#transaction-form #item');
  const $txTypeSelect = $('#transaction-form #type');
  const $txQtyInput = $('#transaction-form #quantity');
  const $stockHelper = $('#stock-calc-helper');
  const $curStockSpan = $('#helper-current-stock');
  const $projStockSpan = $('#helper-projected-stock');
  const $stockWarning = $('#helper-stock-warning');

  let currentStockQuantity = null;

  const calculateProjectedStock = () => {
    if (currentStockQuantity === null) return;

    const qty = parseInt($txQtyInput.val(), 10) || 0;
    const type = $txTypeSelect.val();

    const projected = (type === 'IN')
      ? currentStockQuantity + qty
      : currentStockQuantity - qty;

    $curStockSpan.text(currentStockQuantity);
    $projStockSpan.text(projected);

    if (type === 'OUT' && qty > currentStockQuantity) {
      $stockWarning.show();
      $projStockSpan.css('color', '#ef4444');
    } else {
      $stockWarning.hide();
      $projStockSpan.css('color', '');
    }

    $stockHelper.slideDown(150);
  };

  const fetchSelectedItemStock = (itemId) => {
    if (!itemId) {
      currentStockQuantity = null;
      $stockHelper.slideUp(150);
      return;
    }

    $.getJSON(`/api/items/${itemId}`)
      .done((res) => {
        if (!res.success) return;
        currentStockQuantity = Number(res.data.quantity);
        calculateProjectedStock();
      })
      .fail((err) => {
        console.error('Error fetching stock quantity for helper:', err);
      });
  };

  if ($txItemSelect.length) {
    $txItemSelect.on('change', function () {
      fetchSelectedItemStock($(this).val());
    });

    $txTypeSelect.on('change', calculateProjectedStock);
    $txQtyInput.on('input', calculateProjectedStock);

    // Initial trigger if an item is pre-selected
    if ($txItemSelect.val()) {
      fetchSelectedItemStock($txItemSelect.val());
    }
  }

  // ═════════════════════════════════════════════════════════════════
  // FEATURE E: Ajax Delete with Animated fadeOut
  // ═════════════════════════════════════════════════════════════════
  $(document).on('submit', 'form.delete-form', function (e) {
    const $form = $(this);
    const $row = $form.closest('tr');

    // Only apply Ajax delete if within a table row
    if (!$row.length) return;

    e.preventDefault();
    e.stopImmediatePropagation(); // Prevent duplicate ui.js confirmation

    const confirmed = confirm('Are you sure you want to delete this record? This action cannot be undone.');
    if (!confirmed) return;

    $.ajax({
      url: $form.attr('action'),
      method: 'POST',
      dataType: 'json',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      success: function (res) {
        $row.fadeOut(400, function () {
          $row.remove();
        });
      },
      error: function (xhr) {
        // If server sent a standard 302 or 200 without JSON, handle gracefully
        if (xhr.status === 200 || xhr.status === 302) {
          $row.fadeOut(400, function () {
            $row.remove();
          });
        } else {
          alert('Failed to delete item: ' + (xhr.responseJSON?.message || 'Server error'));
        }
      }
    });
  });
});
