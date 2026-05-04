/* Vivero Admin Suite - Interacciones compartidas */
(function () {
  // ---------- Toast ----------
  function ensureToastHost() {
    let host = document.getElementById('toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toast-host';
      host.style.cssText =
        'position:fixed;top:20px;right:20px;display:flex;flex-direction:column;gap:10px;z-index:1000;pointer-events:none';
      document.body.appendChild(host);
    }
    return host;
  }
  function toast(msg, kind) {
    const host = ensureToastHost();
    const el = document.createElement('div');
    el.textContent = msg;
    const bg =
      kind === 'success'
        ? 'linear-gradient(135deg,#a9bf9d,#7a9b6e)'
        : kind === 'warn'
        ? 'linear-gradient(135deg,#f3e6b3,#e6cf7a)'
        : kind === 'error'
        ? 'linear-gradient(135deg,#f5b7a8,#e89888)'
        : 'rgba(255,255,255,.85)';
    const color = kind === 'success' || kind === 'error' ? '#fff' : '#2e3f2a';
    el.style.cssText =
      'pointer-events:auto;padding:12px 18px;border-radius:14px;background:' +
      bg +
      ';color:' +
      color +
      ';font:500 14px Inter,sans-serif;box-shadow:0 10px 30px rgba(46,63,42,.18);backdrop-filter:blur(14px);border:1px solid rgba(122,155,110,.18);opacity:0;transform:translateY(-8px);transition:all .25s';
    host.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px)';
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }
  window.viveroToast = toast;

  // ---------- Modal ----------
  function openModal(title, bodyHtml, onSubmit) {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(46,63,42,.35);backdrop-filter:blur(6px);display:grid;place-items:center;z-index:900;padding:20px;animation:viv-fade .2s ease';
    overlay.innerHTML =
      '<div role="dialog" style="background:rgba(255,255,255,.92);backdrop-filter:blur(18px);border:1px solid rgba(122,155,110,.18);border-radius:18px;box-shadow:0 20px 60px rgba(46,63,42,.22);padding:26px;max-width:440px;width:100%">' +
      '<h2 style="font-family:Cormorant Garamond,serif;font-size:1.5rem;margin-bottom:14px;color:#2e3f2a">' +
      title +
      '</h2>' +
      '<form id="viv-form" style="display:flex;flex-direction:column;gap:12px">' +
      bodyHtml +
      '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">' +
      '<button type="button" class="btn ghost" data-cancel>Cancelar</button>' +
      '<button type="submit" class="btn primary">Confirmar</button>' +
      '</div></form></div>';
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector('[data-cancel]').addEventListener('click', close);
    overlay.querySelector('#viv-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {};
      overlay.querySelectorAll('[name]').forEach((i) => (data[i.name] = i.value));
      if (onSubmit) onSubmit(data);
      close();
    });
  }
  window.viveroModal = openModal;

  // ---------- Active nav según URL ----------
  document.querySelectorAll('.bottom-nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && location.pathname.endsWith(href)) {
      document.querySelectorAll('.bottom-nav a').forEach((x) => x.classList.remove('active'));
      a.classList.add('active');
    }
  });

  // ---------- CSV export ----------
  function tableToCSV(table) {
    const rows = [...table.querySelectorAll('tr')];
    return rows
      .map((r) =>
        [...r.querySelectorAll('th,td')]
          .map((c) => '"' + c.innerText.replace(/\s+/g, ' ').trim().replace(/"/g, '""') + '"')
          .join(','),
      )
      .join('\n');
  }
  function downloadCSV(name, csv) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---------- Bind por data-action ----------
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'add-plant') {
      openModal(
        'Añadir nueva planta',
        '<label style="font-size:.78rem;color:#4f6b48">Especie<input class="input" name="especie" required style="width:100%;margin-top:4px"/></label>' +
          '<label style="font-size:.78rem;color:#4f6b48">Categoría<select class="input" name="categoria" style="width:100%;margin-top:4px"><option>Interior</option><option>Exterior</option><option>Aromática</option><option>Suculenta</option></select></label>' +
          '<div style="display:flex;gap:10px"><label style="flex:1;font-size:.78rem;color:#4f6b48">Stock<input class="input" type="number" name="stock" value="10" style="width:100%;margin-top:4px"/></label>' +
          '<label style="flex:1;font-size:.78rem;color:#4f6b48">Precio<input class="input" type="number" step="0.01" name="precio" value="10.00" style="width:100%;margin-top:4px"/></label></div>' +
          '<label style="font-size:.78rem;color:#4f6b48">Ubicación<input class="input" name="ubicacion" placeholder="Invernadero A · F1" style="width:100%;margin-top:4px"/></label>',
        (data) => {
          const tbody = document.querySelector('table.stock tbody');
          if (tbody) {
            const tr = document.createElement('tr');
            tr.innerHTML =
              '<td><span class="row-name"><span class="thumb">🌿</span>' +
              data.especie +
              '</span></td><td>' +
              data.categoria +
              '</td><td>' +
              data.stock +
              '</td><td>$ ' +
              Number(data.precio).toFixed(2) +
              '</td><td>' +
              (data.ubicacion || '—') +
              '</td><td><span class="tag">Disponible</span></td>';
            tbody.prepend(tr);
          }
          toast('Planta "' + data.especie + '" añadida', 'success');
        },
      );
    }

    if (action === 'filter') {
      const wrap = btn.closest('.toolbar') || document;
      let panel = wrap.querySelector('[data-filter-panel]');
      if (panel) {
        panel.remove();
        return;
      }
      panel = document.createElement('div');
      panel.dataset.filterPanel = '1';
      panel.style.cssText =
        'flex-basis:100%;display:flex;gap:10px;flex-wrap:wrap;padding:12px;border-radius:12px;background:rgba(255,255,255,.6);border:1px solid rgba(122,155,110,.18);margin-top:6px';
      panel.innerHTML =
        '<select class="input" data-filter-cat><option value="">Todas las categorías</option><option>Interior</option><option>Exterior</option><option>Aromática</option><option>Suculenta</option></select>' +
        '<select class="input" data-filter-state><option value="">Cualquier estado</option><option>Disponible</option><option>Stock bajo</option><option>Reposición</option><option>Agotado</option></select>' +
        '<button class="btn ghost" data-action="filter-clear">Limpiar</button>';
      wrap.appendChild(panel);
      panel.addEventListener('change', applyFilters);
      toast('Filtros activados');
    }

    if (action === 'filter-clear') {
      document.querySelectorAll('[data-filter-panel] select').forEach((s) => (s.value = ''));
      applyFilters();
    }

    if (action === 'export-csv') {
      const table = document.querySelector('table.stock');
      if (!table) return toast('No hay tabla para exportar', 'error');
      downloadCSV('inventario-vivero.csv', tableToCSV(table));
      toast('Inventario exportado a CSV', 'success');
    }

    if (action === 'edit-plant') {
      toast('Modo edición: ficha desbloqueada', 'success');
      document.querySelectorAll('.detail-list .v').forEach((v) => {
        v.contentEditable = 'true';
        v.style.outline = '1px dashed rgba(122,155,110,.5)';
        v.style.borderRadius = '6px';
        v.style.padding = '2px 4px';
      });
    }

    if (action === 'print-label') {
      window.print();
    }

    if (action === 'history') {
      openModal(
        'Historial de la planta',
        '<ul style="display:flex;flex-direction:column;gap:8px;font-size:.88rem;color:#4f6b48">' +
          '<li>🌱 03 May · Riego programado completado</li>' +
          '<li>📦 28 Abr · Ingresaron 24 unidades</li>' +
          '<li>✂️ 21 Abr · Poda de mantenimiento</li>' +
          '<li>🧪 14 Abr · Aplicación de fertilizante NPK</li>' +
          '</ul>',
        () => {},
      );
    }

    if (action === 'save-settings') {
      toast('Cambios guardados correctamente', 'success');
    }
    if (action === 'cancel-settings') {
      toast('Cambios descartados', 'warn');
    }
    if (action === 'configure') {
      toast('Abriendo asistente de configuración…');
    }
  });

  function applyFilters() {
    const cat = document.querySelector('[data-filter-cat]');
    const st = document.querySelector('[data-filter-state]');
    const catV = cat ? cat.value : '';
    const stV = st ? st.value : '';
    document.querySelectorAll('table.stock tbody tr').forEach((tr) => {
      const cells = tr.children;
      const okCat = !catV || (cells[1] && cells[1].innerText.trim() === catV);
      const okSt = !stV || (cells[5] && cells[5].innerText.trim() === stV);
      tr.style.display = okCat && okSt ? '' : 'none';
    });
  }

  // ---------- Búsqueda en tabla ----------
  document.querySelectorAll('.search input').forEach((inp) => {
    inp.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('table.stock tbody tr').forEach((tr) => {
        tr.style.display = tr.innerText.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  });

  // ---------- Settings nav ----------
  document.querySelectorAll('.settings-nav a').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          document.querySelectorAll('.settings-nav a').forEach((x) => x.classList.remove('active'));
          a.classList.add('active');
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ---------- Switches feedback ----------
  document.querySelectorAll('.switch input').forEach((sw) => {
    sw.addEventListener('change', () => {
      const label = sw.closest('.setting-row');
      const name = label ? label.querySelector('h4')?.innerText : 'Opción';
      toast(name + ': ' + (sw.checked ? 'activado' : 'desactivado'));
    });
  });

  // Anim style
  const s = document.createElement('style');
  s.textContent = '@keyframes viv-fade{from{opacity:0}to{opacity:1}}';
  document.head.appendChild(s);
})();
