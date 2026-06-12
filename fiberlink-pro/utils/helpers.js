// ── TOAST NOTIFICATIONS ──
function toast(msg, type = 'info', duration = 3000) {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;

  const icon = icons[type] || icons.info;
  el.innerHTML = `<span style="font-weight:700;font-size:16px">${icon}</span><span>${msg}</span>`;

  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 300);
  }, duration);

  return el;
}

// ── NOTIFY ──
function notify(title, message, type = 'info') {
  const notificationText = message ? `${title}: ${message}` : title;
  toast(notificationText, type, 4000);
}

// ── MODAL ──
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});

// ── FORMAT ──
function formatCurrency(n) {
  return 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusBadge(s) {
  return `<span class="badge-status status-${s}">${s.charAt(0).toUpperCase()+s.slice(1)}</span>`;
}

function avatarEl(initials, extraClass = '') {
  const colors = ['#2563eb','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444'];
  const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1)||0)) % colors.length;
  return `<div class="avatar ${extraClass}" style="background:linear-gradient(135deg,${colors[idx]},${colors[(idx+2)%colors.length]})">${initials}</div>`;
}

// ── CONFIRM ACTION ──
function confirmAction(msg, cb) {
  if (window.confirm(msg)) cb();
}

// ── STORAGE ──
const Store = {
  get(key) { try { return JSON.parse(localStorage.getItem('flp_'+key)) || null; } catch { return null; } },
  set(key, val) { localStorage.setItem('flp_'+key, JSON.stringify(val)); },
  remove(key) { localStorage.removeItem('flp_'+key); }
};

// ── DEBOUNCE ──
function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

// ── NOTIFICATIONS ──
  const Notifications = {
  list: [
    { id: 1, type: 'payment', title: 'Pago Recibido', message: 'Cliente Juan Pérez pagó S/150.00', time: 'Hace 5 minutos' },
    { id: 2, type: 'client', title: 'Nuevo Cliente', message: 'Se registró María García como nuevo cliente', time: 'Hace 1 hora' },
    { id: 3, type: 'alert', title: 'Pago Pendiente', message: 'Carlos López tiene 2 pagos vencidos', time: 'Hace 2 horas' }
  ],

  init: function() {
    this.render();
  },

  render: function() {
    const list = document.getElementById('notifications-list');
    const badge = document.getElementById('notifications-badge');

    if (!list) return;

    if (this.list.length === 0) {
      list.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-secondary)">Sin notificaciones</div>';
      if (badge) badge.style.display = 'none';
      return;
    }

    const icons = {
      payment: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      client: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      alert: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };

    list.innerHTML = this.list.map(n => `
      <div class="notification-item">
        <div class="notification-icon ${n.type}">${icons[n.type] || '📢'}</div>
        <div class="notification-content">
          <p class="notification-title">${n.title}</p>
          <p class="notification-message">${n.message}</p>
          <p class="notification-time">${n.time}</p>
        </div>
      </div>
    `).join('');

    if (badge) {
      badge.style.display = 'block';
      badge.textContent = this.list.length;
    }
  },

  add: function(type, title, message) {
    this.list.unshift({
      id: Date.now(),
      type,
      title,
      message,
      time: 'Ahora'
    });
    this.render();
  }
};

function toggleNotifications() {
  const dropdown = document.getElementById('notifications-dropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }
}

function closeNotifications() {
  const dropdown = document.getElementById('notifications-dropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

// Close notifications when clicking outside
document.addEventListener('click', (e) => {
  const container = document.querySelector('.notifications-container');
  if (container && !container.contains(e.target)) {
    closeNotifications();
  }
});
