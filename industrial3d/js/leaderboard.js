/* Leaderboard: fetch JSON, render, sort, filter */
(function () {
  'use strict';

  const DATA_URL = 'data/leaderboard.json';

  const PARADIGM_COLORS = {
    'Fully-Supervised': 'paradigm-full',
    'Weakly-Supervised': 'paradigm-weak',
    'Unsupervised':      'paradigm-unsup',
    'Foundation Model':  'paradigm-found'
  };

  let allEntries = [];
  let classes    = [];
  let sortCol    = 'miou';
  let sortDir    = 'desc';
  let activeFilter = 'All';

  function mIoUColor(v) {
    if (v >= 50) return '#00c8ff';
    if (v >= 40) return '#4ade80';
    if (v >= 30) return '#facc15';
    if (v >= 20) return '#fb923c';
    return '#f87171';
  }

  function barWidth(v) {
    return Math.round((v / 60) * 100);
  }

  function sortEntries(entries) {
    return [...entries].sort(function (a, b) {
      let va = a[sortCol], vb = b[sortCol];
      if (va === null || va === undefined) va = sortDir === 'desc' ? -Infinity : Infinity;
      if (vb === null || vb === undefined) vb = sortDir === 'desc' ? -Infinity : Infinity;
      if (typeof va === 'string') return sortDir === 'asc'
        ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }

  function filterEntries(entries) {
    if (activeFilter === 'All') return entries;
    return entries.filter(function (e) { return e.paradigm === activeFilter; });
  }

  function renderTable(entries) {
    const tbody = document.getElementById('lbTbody');
    if (!tbody) return;

    const sorted = sortEntries(filterEntries(entries));

    if (sorted.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-muted)">No results</td></tr>';
      return;
    }

    tbody.innerHTML = sorted.map(function (e, i) {
      const paradigmClass = PARADIGM_COLORS[e.paradigm] || '';
      const miouColor = mIoUColor(e.miou);
      const width = barWidth(e.miou);
      const oaStr = e.oa !== null ? e.oa.toFixed(2) + '%' : '—';
      const methodLink = e.paper_url
        ? '<a href="' + e.paper_url + '" target="_blank" rel="noopener">' + escHtml(e.method) + '</a>'
        : escHtml(e.method);
      const codeLink = e.code_url
        ? '<a href="' + e.code_url + '" target="_blank" rel="noopener" class="code-link" title="Code / Repo">⎘</a>'
        : '<span style="color:var(--text-muted)">—</span>';
      const verifiedHtml = e.verified
        ? '<span class="verified-badge">✓ verified</span>'
        : '';

      return '<tr>' +
        '<td class="rank-cell">' + (i + 1) + '</td>' +
        '<td class="method-cell">' + methodLink + '</td>' +
        '<td><span class="paradigm-pill ' + paradigmClass + '">' + escHtml(e.paradigm) + '</span></td>' +
        '<td class="mono">' + escHtml(e.labels) + '</td>' +
        '<td class="miou-cell">' +
          '<div class="miou-bar-container">' +
            '<div class="miou-bar" style="width:' + width + '%;background:' + miouColor + '"></div>' +
            '<span style="color:' + miouColor + '">' + e.miou.toFixed(2) + '%</span>' +
          '</div>' +
        '</td>' +
        '<td class="mono">' + oaStr + '</td>' +
        '<td class="mono">' + (e.year || '—') + '</td>' +
        '<td>' + verifiedHtml + ' ' + codeLink + '</td>' +
      '</tr>';
    }).join('');
  }

  function renderPerClassTable(entries) {
    const container = document.getElementById('perClassSection');
    if (!container) return;

    const withData = entries.filter(function (e) { return e.per_class; });
    if (withData.length === 0) { container.style.display = 'none'; return; }

    const thead = container.querySelector('#pcThead');
    const tbody = container.querySelector('#pcTbody');
    if (!thead || !tbody) return;

    /* Build best per-class values across all entries */
    const bestVal = {};
    classes.forEach(function (cls) {
      bestVal[cls] = Math.max(...withData.map(function (e) { return e.per_class[cls] || 0; }));
    });

    thead.innerHTML = '<tr>' +
      '<th>Method</th><th>Labels</th>' +
      classes.map(function (c) { return '<th>' + c + '</th>'; }).join('') +
      '<th>mIoU</th></tr>';

    tbody.innerHTML = withData.map(function (e) {
      const cells = classes.map(function (cls) {
        const v = e.per_class[cls];
        if (v === null || v === undefined) return '<td class="mono text-muted">—</td>';
        const isBest = v === bestVal[cls] && v > 0;
        const cssClass = v === 0 ? 'zero-iou' : (isBest ? 'best-iou' : '');
        return '<td class="mono ' + cssClass + '">' + v.toFixed(2) + '</td>';
      }).join('');

      return '<tr>' +
        '<td>' + escHtml(e.method) + '</td>' +
        '<td class="mono">' + escHtml(e.labels) + '</td>' +
        cells +
        '<td class="mono best-iou">' + e.miou.toFixed(2) + '</td>' +
      '</tr>';
    }).join('');
  }

  function updateSortIndicators() {
    document.querySelectorAll('.lb-table th[data-sort]').forEach(function (th) {
      th.classList.remove('sorted-asc', 'sorted-desc');
      if (th.dataset.sort === sortCol) {
        th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
      }
    });
    const info = document.getElementById('sortInfo');
    if (info) info.textContent = 'sorted by ' + sortCol + ' ' + (sortDir === 'asc' ? '↑' : '↓');
  }

  function wireControls() {
    /* Sort headers */
    document.querySelectorAll('.lb-table th[data-sort]').forEach(function (th) {
      th.addEventListener('click', function () {
        const col = th.dataset.sort;
        if (sortCol === col) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortCol = col;
          sortDir = col === 'miou' ? 'desc' : 'asc';
        }
        updateSortIndicators();
        renderTable(allEntries);
      });
    });

    /* Filter buttons */
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        renderTable(allEntries);
      });
    });
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showError(msg) {
    const tbody = document.getElementById('lbTbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--danger)">' +
        escHtml(msg) + '</td></tr>';
    }
  }

  function updateLastUpdated(dateStr) {
    const el = document.getElementById('lbLastUpdated');
    if (el && dateStr) el.textContent = 'Last updated: ' + dateStr;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('lbTbody')) return;

    fetch(DATA_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        allEntries = data.entries || [];
        classes    = data.classes || [];
        updateLastUpdated(data.last_updated);
        wireControls();
        updateSortIndicators();
        renderTable(allEntries);
        renderPerClassTable(allEntries);
      })
      .catch(function (err) {
        showError('Could not load leaderboard data. ' + err.message);
      });
  });
})();
