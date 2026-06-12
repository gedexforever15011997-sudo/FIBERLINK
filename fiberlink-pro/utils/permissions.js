// ── PERMISSIONS & ROLES ──

const PERMISSIONS = {
  // Clientes
  'clients.view': ['user', 'admin'],
  'clients.create': ['admin'],
  'clients.edit': ['admin'],
  'clients.delete': ['admin'],

  // Planes
  'plans.view': ['user', 'admin'],
  'plans.create': ['admin'],
  'plans.edit': ['admin'],
  'plans.delete': ['admin'],

  // Pagos
  'payments.view': ['user', 'admin'],
  'payments.create': ['admin'],
  'payments.edit': ['admin'],
  'payments.delete': ['admin'],

  // Contratos
  'contracts.view': ['user', 'admin'],
  'contracts.create': ['admin'],
  'contracts.edit': ['admin'],
  'contracts.delete': ['admin'],

  // Reportes
  'reports.view': ['user', 'admin'],
  'reports.export': ['admin'],

  // Configuración
  'settings.view': ['user', 'admin'],
  'settings.edit': ['admin'],

  // Panel de Admin
  'admin.access': ['admin'],
  'users.manage': ['admin']
};

function hasPermission(permission) {
  const user = window.currentUser;
  if (!user) return false;

  const allowedRoles = PERMISSIONS[permission] || [];
  return allowedRoles.includes(user.role);
}

function isAdmin() {
  return window.currentUser?.role === 'admin';
}

function isWorker() {
  return window.currentUser?.role === 'user';
}

function showIfPermitted(element, permission) {
  if (!element) return;
  if (hasPermission(permission)) {
    element.style.display = '';
  } else {
    element.style.display = 'none';
  }
}

function disableIfNoPermission(element, permission) {
  if (!element) return;
  if (!hasPermission(permission)) {
    element.disabled = true;
    element.style.opacity = '0.5';
    element.style.cursor = 'not-allowed';
    element.title = 'No tienes permiso para realizar esta acción';
  }
}

function hideButtonsForWorkers() {
  const isWorker = window.currentUser?.role === 'user';
  if (!isWorker) return;

  // Ocultar botones de crear
  document.querySelectorAll('[onclick*="openClientModal()"]').forEach(btn => {
    btn.style.display = 'none';
  });
  document.querySelectorAll('[onclick*="openPlanModal()"]').forEach(btn => {
    btn.style.display = 'none';
  });

  // Ocultar botones de editar y eliminar
  document.querySelectorAll('[title="Editar"]').forEach(btn => {
    btn.style.display = 'none';
  });
  document.querySelectorAll('[title="Eliminar"]').forEach(btn => {
    btn.style.display = 'none';
  });
}

function requirePermission(permission) {
  if (!hasPermission(permission)) {
    toast('No tienes permiso para realizar esta acción', 'error');
    return false;
  }
  return true;
}
