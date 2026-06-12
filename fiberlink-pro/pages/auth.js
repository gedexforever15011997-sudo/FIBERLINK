// ── AUTH PAGE ──

function renderAuthPage(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon">FL</div>
          <div class="logo-text">Fiber<span>Link</span> Pro</div>
        </div>

        <div class="auth-forms">
          <!-- LOGIN FORM -->
          <div id="login-form" class="auth-form active">
            <h1>Bienvenido</h1>
            <p class="auth-subtitle">Inicia sesión en tu cuenta</p>

            <form onsubmit="handleLogin(event)">
              <div class="form-group">
                <label for="login-email">Correo Electrónico</label>
                <input type="email" id="login-email" required placeholder="tu@ejemplo.com">
              </div>

              <div class="form-group">
                <label for="login-password">Contraseña</label>
                <input type="password" id="login-password" required placeholder="••••••••">
              </div>

              <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px">
                Iniciar Sesión
              </button>
            </form>

            <div class="auth-divider"></div>

            <div class="auth-switch">
              ¿No tienes cuenta?
              <button type="button" class="auth-link" onclick="switchAuthForm('signup')">
                Crear una
              </button>
            </div>
          </div>

          <!-- SIGNUP FORM -->
          <div id="signup-form" class="auth-form">
            <h1>Crear Cuenta</h1>
            <p class="auth-subtitle">Regístrate para comenzar</p>

            <form onsubmit="handleSignup(event)">
              <div class="form-group">
                <label for="signup-name">Nombre Completo</label>
                <input type="text" id="signup-name" required placeholder="Juan Pérez">
              </div>

              <div class="form-group">
                <label for="signup-email">Correo Electrónico</label>
                <input type="email" id="signup-email" required placeholder="tu@ejemplo.com">
              </div>

              <div class="form-group">
                <label for="signup-password">Contraseña</label>
                <input type="password" id="signup-password" required placeholder="••••••••" minlength="6">
              </div>

              <div class="form-group">
                <label for="signup-password-confirm">Confirmar Contraseña</label>
                <input type="password" id="signup-password-confirm" required placeholder="••••••••" minlength="6">
              </div>

              <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px">
                Crear Cuenta
              </button>
            </form>

            <div class="auth-divider"></div>

            <div class="auth-switch">
              ¿Ya tienes cuenta?
              <button type="button" class="auth-link" onclick="switchAuthForm('login')">
                Inicia sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchAuthForm(form) {
  document.getElementById('login-form').classList.toggle('active', form === 'login');
  document.getElementById('signup-form').classList.toggle('active', form === 'signup');
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    toast('Por favor completa todos los campos', 'error');
    return;
  }

  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Iniciando sesión...';

  try {
    const result = await SupabaseService.loginUser(email, password);

    if (result.error) {
      toast('Correo o contraseña inválida', 'error');
      btn.disabled = false;
      btn.textContent = originalText;
      return;
    }

    window.currentUser = result.data;
    Store.set('auth-user', result.data);
    toast('¡Sesión iniciada correctamente!', 'success');

    setTimeout(() => {
      showMainApp();
    }, 500);
  } catch (err) {
    console.error('Login error:', err);
    toast('Ocurrió un error al iniciar sesión', 'error');
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const passwordConfirm = document.getElementById('signup-password-confirm').value;

  if (!name || !email || !password) {
    toast('Por favor completa todos los campos', 'error');
    return;
  }

  if (password !== passwordConfirm) {
    toast('Las contraseñas no coinciden', 'error');
    return;
  }

  if (password.length < 6) {
    toast('La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }

  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Creando cuenta...';

  try {
    const result = await SupabaseService.registerUser(name, email, password);

    if (result.error) {
      toast(result.error.message || 'No se pudo crear la cuenta', 'error');
      btn.disabled = false;
      btn.textContent = originalText;
      return;
    }

    toast('¡Cuenta creada! Por favor inicia sesión.', 'success');
    setTimeout(() => {
      switchAuthForm('login');
      document.getElementById('login-email').value = email;
      document.getElementById('login-password').value = '';
      btn.disabled = false;
      btn.textContent = originalText;
    }, 500);
  } catch (err) {
    console.error('Signup error:', err);
    toast('Ocurrió un error al registrarse', 'error');
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

function showMainApp() {
  document.body.innerHTML = `
    <div id="mobile-overlay" class="mobile-overlay"></div>
    <div id="toast-container"></div>

    <div id="db-loading" style="display:none;position:fixed;inset:0;background:rgba(10,15,28,.85);z-index:9999;align-items:center;justify-content:center;flex-direction:column;gap:14px">
      <div style="width:36px;height:36px;border:3px solid #1e2d45;border-top-color:#2563eb;border-radius:50%;animation:spin .7s linear infinite"></div>
      <div style="color:#8899bb;font-size:13px">Connecting to database…</div>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>

    <div class="app-layout">
      <!-- SIDEBAR -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo">
          <div class="logo-icon">FL</div>
          <div class="logo-text">Fiber<span>Link</span> Pro</div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-label">Principal</div>
            <div class="nav-item active" data-page="dashboard">
              <div class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              <span class="nav-text">Panel de Control</span>
            </div>
            <div class="nav-item" data-page="clients">
              <div class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <span class="nav-text">Clientes</span>
            </div>
            <div class="nav-item" data-page="plans">
              <div class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              </div>
              <span class="nav-text">Planes</span>
            </div>
          </div>

          <div class="nav-section">
            <div class="nav-label">Facturación</div>
            <div class="nav-item" data-page="contracts">
              <div class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <span class="nav-text">Contratos</span>
            </div>
            <div class="nav-item" data-page="payments">
              <div class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
              </div>
              <span class="nav-text">Pagos</span>
              <span class="nav-badge">3</span>
            </div>
          </div>

          <div class="nav-section">
            <div class="nav-label">Análisis</div>
            <div class="nav-item" data-page="reports">
              <div class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
              </div>
              <span class="nav-text">Reportes</span>
            </div>
          </div>

          <div class="nav-section">
            <div class="nav-label">Sistema</div>
            <div class="nav-item" id="nav-admin" data-page="admin" style="display:none">
              <div class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <span class="nav-text">Panel de Admin</span>
            </div>
            <div class="nav-item" data-page="settings">
              <div class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              </div>
              <span class="nav-text">Configuración</span>
            </div>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user">
            <div class="user-avatar" id="user-avatar">MS</div>
            <div class="user-info">
              <div class="user-name" id="user-name">Marcus Silva</div>
              <div class="user-role" id="user-role">Administrator</div>
            </div>
            <button class="sidebar-logout-btn" onclick="handleLogout()" title="Sign out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="main-wrapper" id="main-wrapper">
        <!-- TOPBAR -->
        <header class="topbar">
          <button class="topbar-toggle" id="sidebar-toggle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <div class="topbar-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Busca clientes, planes, facturas...">
          </div>

          <span class="topbar-page-title"></span>

          <div class="topbar-right">
            <div class="notifications-container">
              <button class="topbar-btn" onclick="toggleNotifications()" title="Notificaciones">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span class="badge" id="notifications-badge" style="display:none;"></span>
              </button>
              <div class="notifications-dropdown" id="notifications-dropdown" style="display:none;">
                <div class="notifications-header">
                  <h3>🔔 Notificaciones</h3>
                  <button class="btn-close" onclick="closeNotifications()" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:20px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;transition:all 0.2s">&times;</button>
                </div>
                <div class="notifications-list" id="notifications-list">
                  <div style="padding:24px 18px;text-align:center;color:var(--text-secondary);font-size:13px">Sin notificaciones por ahora</div>
                </div>
              </div>
            </div>
            <button class="topbar-btn" onclick="toast('Centro de ayuda próximamente','info')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </button>
            <div class="user-menu-container">
              <button class="user-menu-btn" onclick="toggleUserMenu()">
                <div class="user-avatar" id="topbar-avatar-menu">MS</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div class="user-menu-dropdown" id="user-menu-dropdown">
                <div class="user-menu-header">
                  <div class="user-menu-info">
                    <div class="user-menu-info-avatar" id="user-menu-avatar">MS</div>
                    <div class="user-menu-info-text">
                      <h4 id="user-menu-name">Usuario</h4>
                      <p id="user-menu-email">email@ejemplo.com</p>
                      <div id="user-menu-badges"></div>
                    </div>
                  </div>
                </div>
                <div class="user-menu-body">
                  <button class="user-menu-item" onclick="navigate('settings')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                    Configuración
                  </button>
                  <button class="user-menu-item logout" onclick="confirmLogout()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- PAGE CONTENT -->
        <main class="page-content" id="page-content"></main>
      </div>
    </div>

    <!-- Scripts -->
    <script src="data/mock.js"><\/script>
    <script src="utils/helpers.js"><\/script>
    <script src="utils/permissions.js"><\/script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"><\/script>
    <script src="services/supabase.js"><\/script>
    <script src="pages/dashboard.js"><\/script>
    <script src="pages/clients.js"><\/script>
    <script src="pages/plans-contracts-payments.js"><\/script>
    <script src="pages/reports-settings.js"><\/script>
    <script src="pages/admin.js"><\/script>
    <script src="assets/js/app.js"><\/script>
  `;

  // Re-init after DOM is ready
  setTimeout(async () => {
    // Actualizar info del usuario primero
    if (typeof updateUserInfo === 'function') {
      updateUserInfo();
    }
    if (typeof updateUserMenu === 'function') {
      updateUserMenu();
    }

    initSidebar();
    initData();
    initRealtimeListeners();
    initSearch();
    updateUserInterface();
    if (typeof Notifications !== 'undefined' && Notifications.init) {
      Notifications.init();
    }
    await navigate('dashboard');
  }, 100);
}

function updateUserInfo() {
  const user = window.currentUser;
  if (!user) return;

  const avatar = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const roleText = user.role === 'admin' ? 'Administrador' : 'Trabajador';

  // Actualizar elementos del sidebar
  const userAvatarEl = document.getElementById('user-avatar');
  if (userAvatarEl) userAvatarEl.textContent = avatar;

  const userNameEl = document.getElementById('user-name');
  if (userNameEl) userNameEl.textContent = user.name;

  const userRoleEl = document.getElementById('user-role');
  if (userRoleEl) {
    userRoleEl.textContent = roleText;
    // Actualizar color según rol
    if (user.role === 'admin') {
      userRoleEl.style.color = 'var(--accent-purple-light)';
    } else {
      userRoleEl.style.color = 'var(--accent-blue-light)';
    }
  }

  const topbarAvatarEl = document.getElementById('topbar-avatar');
  if (topbarAvatarEl) topbarAvatarEl.textContent = avatar;

  // Actualizar info en el menú de usuario
  const userMenuNameEl = document.getElementById('user-menu-name');
  if (userMenuNameEl) userMenuNameEl.textContent = user.name;

  const userMenuEmailEl = document.getElementById('user-menu-email');
  if (userMenuEmailEl) userMenuEmailEl.textContent = user.email;

  const userMenuAvatarEl = document.getElementById('user-menu-avatar');
  if (userMenuAvatarEl) userMenuAvatarEl.textContent = avatar;
}

function handleLogout() {
  const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
  if (confirmed) {
    Store.remove('auth-user');
    window.currentUser = null;
    toast('Sesión cerrada correctamente', 'success');
    setTimeout(() => {
      location.reload();
    }, 500);
  }
}
