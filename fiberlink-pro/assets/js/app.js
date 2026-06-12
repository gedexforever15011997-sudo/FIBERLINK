// ── ROUTER ──
const ROUTES = {
  dashboard: renderDashboard,
  clients: renderClients,
  plans: renderPlans,
  contracts: renderContracts,
  payments: renderPayments,
  reports: renderReports,
  admin: renderAdmin,
  settings: renderSettings
};

let currentPage = 'dashboard';

async function navigate(page) {
  // Check if page is admin-only
  if (page === 'admin' && window.currentUser?.role !== 'admin') {
    toast('No tienes permiso para acceder a esta página', 'error');
    navigate('dashboard');
    return;
  }

  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
  const titles = {
    dashboard: 'Dashboard', clients: 'Clients', plans: 'Plans',
    contracts: 'Contracts', payments: 'Payments & Billing',
    reports: 'Reports', admin: 'Admin Panel', settings: 'Settings'
  };
  document.querySelector('.topbar-page-title').textContent = titles[page] || '';
  const content = document.getElementById('page-content');
  content.innerHTML = '';
  content.style.opacity = '0';

  // Wait for content to be rendered
  await new Promise(resolve => setTimeout(resolve, 60));

  // Render the page
  if (ROUTES[page]) await ROUTES[page](content);

  // Hide buttons for workers
  if (typeof hideButtonsForWorkers === 'function') {
    hideButtonsForWorkers();
  }

  // Show the content
  content.style.transition = 'opacity 0.2s';
  content.style.opacity = '1';
}

// ── UPDATE USER INTERFACE ──
function updateUserInterface() {
  const isAdmin = window.currentUser?.role === 'admin';
  const adminNav = document.getElementById('nav-admin');
  if (adminNav) {
    adminNav.style.display = isAdmin ? '' : 'none';
  }

  updateUserMenu();
}

// ── USER MENU ──
function updateUserMenu() {
  const user = window.currentUser;
  if (!user) return;

  const avatar = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const roleText = user.role === 'admin' ? 'Administrador' : 'Trabajador';
  const roleColor = user.role === 'admin' ? '#8b5cf6' : '#2563eb';

  // Actualizar avatar en el botón del menú
  const topbarAvatarMenu = document.getElementById('topbar-avatar-menu');
  if (topbarAvatarMenu) topbarAvatarMenu.textContent = avatar;

  // Actualizar información en el dropdown
  const userMenuAvatar = document.getElementById('user-menu-avatar');
  if (userMenuAvatar) userMenuAvatar.textContent = avatar;

  const userMenuName = document.getElementById('user-menu-name');
  if (userMenuName) userMenuName.textContent = user.name;

  const userMenuEmail = document.getElementById('user-menu-email');
  if (userMenuEmail) userMenuEmail.textContent = user.email;

  // Actualizar badges con estilos según rol
  const userMenuBadges = document.getElementById('user-menu-badges');
  if (userMenuBadges) {
    userMenuBadges.innerHTML = `<div class="user-role-badge" style="background:${roleColor}20;color:${roleColor};padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600">${roleText}</div>`;
  }
}

function toggleUserMenu() {
  const dropdown = document.getElementById('user-menu-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
  }
}

function closeUserMenu() {
  const dropdown = document.getElementById('user-menu-dropdown');
  if (dropdown) {
    dropdown.classList.remove('active');
  }
}

function confirmLogout() {
  closeUserMenu();
  const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
  if (confirmed) {
    logoutUser();
  }
}

function logoutUser() {
  Store.remove('auth-user');
  window.currentUser = null;
  toast('Sesión cerrada correctamente', 'success');
  setTimeout(() => {
    location.reload();
  }, 500);
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
  const userMenuContainer = document.querySelector('.user-menu-container');
  if (userMenuContainer && !userMenuContainer.contains(e.target)) {
    closeUserMenu();
  }
});

// ── SIDEBAR ──
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const wrapper = document.getElementById('main-wrapper');
  const toggle = document.getElementById('sidebar-toggle');
  const mobileOverlay = document.getElementById('mobile-overlay');
  let collapsed = Store.get('sidebar-collapsed') || false;

  function applyCollapsed() {
    sidebar.classList.toggle('collapsed', collapsed);
    wrapper.classList.toggle('collapsed', collapsed);
    Store.set('sidebar-collapsed', collapsed);
  }

  applyCollapsed();

  toggle.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('mobile-open');
      mobileOverlay.classList.toggle('show');
    } else {
      collapsed = !collapsed;
      applyCollapsed();
    }
  });

  mobileOverlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    mobileOverlay.classList.remove('show');
  });

  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      navigate(item.dataset.page);
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('show');
      }
    });
  });
}

// ── LOAD DATA FROM SUPABASE ──
async function initData() {
  const loadingEl = document.getElementById('db-loading');
  if (loadingEl) loadingEl.style.display = 'flex';

  try {
    const [clientsRes, paymentsRes, plansRes, contractsRes, usersRes] = await Promise.all([
      window.SupabaseService.fetchClients(),
      window.SupabaseService.fetchPayments(),
      window.SupabaseService.fetchPlans(),
      window.SupabaseService.fetchContracts(),
      window.SupabaseService.fetchUsers(),
    ]);

    if (clientsRes.data && clientsRes.data.length > 0) {
      DB.clients = clientsRes.data.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        plan: c.plan_name || '',
        planId: c.plan_id,
        status: c.status,
        ip: c.ip || '',
        address: c.address || '',
        joined: c.joined,
        lastPayment: c.last_payment,
        balance: parseFloat(c.balance) || 0,
        avatar: c.avatar || c.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      }));
    }

    if (plansRes.data && plansRes.data.length > 0) {
      DB.plans = plansRes.data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        speed: p.speed || '',
        upload: p.upload || '',
        price: parseFloat(p.price) || 0,
        status: p.status,
        clients: parseInt(p.clients) || 0,
        color: p.color || '#2563eb'
      }));
    }

    if (paymentsRes.data && paymentsRes.data.length > 0) {
      DB.payments = paymentsRes.data.map(p => ({
        id: p.id,
        client: p.client_name || '',
        clientId: p.client_id,
        amount: parseFloat(p.amount) || 0,
        method: p.method || '',
        status: p.status,
        date: p.date,
        invoice: p.invoice || ''
      }));
    }

    if (contractsRes.data && contractsRes.data.length > 0) {
      DB.contracts = contractsRes.data.map(c => ({
        id: c.id,
        client: c.client_name || '',
        clientId: c.client_id,
        plan: c.plan_name || '',
        planId: c.plan_id,
        startDate: c.start_date,
        endDate: c.end_date,
        status: c.status,
        value: parseFloat(c.value) || 0
      }));
    }

    if (usersRes.data && usersRes.data.length > 0) {
      DB.users = usersRes.data.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        avatar: u.avatar || u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      }));
    }

    const hasData = clientsRes.data?.length || plansRes.data?.length || paymentsRes.data?.length;
    console.log(hasData ? 'Data loaded from Supabase.' : 'Supabase tables are empty — using demo data.');
  } catch (err) {
    console.warn('Could not load from Supabase, using demo data:', err);
    toast('Using demo data — check Supabase connection', 'info');
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
    updateNavBadges();
  }
}

// ── NAV BADGES ──
function updateNavBadges() {
  const pending = DB.payments.filter(p => p.status === 'pending' || p.status === 'overdue').length;
  const badge = document.querySelector('[data-page="payments"] .nav-badge');
  if (badge) {
    badge.textContent = pending;
    badge.style.display = pending > 0 ? '' : 'none';
  }
}

// ── GLOBAL SEARCH ──
function initSearch() {
  const searchBox = document.querySelector('.topbar-search');
  if (!searchBox) return;
  const input = searchBox.querySelector('input');

  const dropdown = document.createElement('div');
  dropdown.id = 'search-dropdown';
  dropdown.style.cssText = 'display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;min-width:340px;background:var(--surface);border:1px solid var(--border);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.5);z-index:200;max-height:380px;overflow-y:auto';
  searchBox.style.position = 'relative';
  searchBox.appendChild(dropdown);

  function section(label) {
    return `<div style="padding:6px 12px 4px;font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px;background:var(--bg)">${label}</div>`;
  }

  function item(page, content) {
    return `<div data-page="${page}" style="padding:10px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background .1s" onmouseenter="this.style.background='var(--surface-alt)'" onmouseleave="this.style.background=''">${content}</div>`;
  }

  function hl(text, q) {
    if (!text) return '';
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return text.slice(0, idx) +
      `<mark style="background:var(--accent-blue-dim);color:var(--accent-blue-light);border-radius:2px;padding:0 1px">${text.slice(idx, idx + q.length)}</mark>` +
      text.slice(idx + q.length);
  }

  input.addEventListener('input', debounce(function () {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { dropdown.style.display = 'none'; return; }

    const clients = DB.clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.ip && c.ip.includes(q))
    ).slice(0, 4);

    const plans = DB.plans.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3);

    const payments = DB.payments.filter(p =>
      (p.invoice && p.invoice.toLowerCase().includes(q)) ||
      (p.client && p.client.toLowerCase().includes(q))
    ).slice(0, 3);

    let html = '';

    if (clients.length) {
      html += section('Clients');
      html += clients.map(c => item('clients', `
        ${avatarEl(c.avatar, 'avatar-sm')}
        <div style="min-width:0;flex:1">
          <div style="font-size:13px;font-weight:500">${hl(c.name, q)}</div>
          <div style="font-size:11px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.email}</div>
        </div>
        <span style="flex-shrink:0">${statusBadge(c.status)}</span>`)).join('');
    }

    if (plans.length) {
      html += section('Plans');
      html += plans.map(p => item('plans', `
        <div style="width:8px;height:8px;border-radius:50%;background:${p.color};flex-shrink:0"></div>
        <div>
          <div style="font-size:13px;font-weight:500">${hl(p.name, q)}</div>
          <div style="font-size:11px;color:var(--text-secondary)">${formatCurrency(p.price)}/mo · ${p.speed}</div>
        </div>`)).join('');
    }

    if (payments.length) {
      html += section('Payments');
      html += payments.map(p => item('payments', `
        <div>
          <div style="font-size:13px;font-weight:500">${hl(p.invoice, q)}</div>
          <div style="font-size:11px;color:var(--text-secondary)">${p.client} · ${formatCurrency(p.amount)}</div>
        </div>`)).join('');
    }

    if (!html) {
      html = `<div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:13px">No results for "<strong>${q}</strong>"</div>`;
    }

    dropdown.innerHTML = html;
    dropdown.style.display = '';

    dropdown.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', () => {
        input.value = '';
        dropdown.style.display = 'none';
        navigate(el.dataset.page);
      });
    });
  }, 200));

  document.addEventListener('click', e => {
    if (!searchBox.contains(e.target)) dropdown.style.display = 'none';
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { dropdown.style.display = 'none'; input.blur(); }
  });
}

// ── REALTIME ──
function initRealtimeListeners() {
  if (!window.SupabaseService) return;
  window.SupabaseService.listenClients(() => updateNavBadges());
  window.SupabaseService.listenPayments(() => updateNavBadges());
}

window.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  const authUser = Store.get('auth-user');

  if (!authUser) {
    // Show login/signup page
    renderAuthPage(document.body);
  } else {
    // User is authenticated, load app
    window.currentUser = authUser;

    // Update user info in sidebar
    setTimeout(() => {
      if (typeof updateUserInfo === 'function') {
        updateUserInfo();
      }
      if (typeof updateUserMenu === 'function') {
        updateUserMenu();
      }
    }, 50);

    initSidebar();
    updateUserInterface();
    await initData();
    initRealtimeListeners();
    initSearch();
    if (typeof Notifications !== 'undefined' && Notifications.init) {
      Notifications.init();
    }
    navigate('dashboard');
  }
});
