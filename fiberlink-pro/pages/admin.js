// ── ADMIN PAGE ──

async function renderAdmin(container) {
  const html = `
    <div class="page-section">
      <div class="section-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p class="text-secondary">Administra los usuarios del sistema y sus roles</p>
        </div>
        <button class="btn btn-primary" onclick="openAddUserModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          Agregar Usuario
        </button>
      </div>

      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Ingresó</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="admin-users-table">
            <tr style="text-align:center;color:var(--text-secondary)">
              <td colspan="6">Cargando usuarios...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div id="user-modal" class="modal" style="display:none">
      <div class="modal-overlay" onclick="closeAddUserModal()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="modal-title">Agregar Nuevo Usuario</h3>
          <button class="modal-close" onclick="closeAddUserModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onsubmit="handleSaveUser(event)" id="user-form">
          <div class="form-group">
            <label for="user-name">Nombre Completo</label>
            <input type="text" id="user-name" required placeholder="Juan Pérez">
          </div>

          <div class="form-group">
            <label for="user-email">Correo Electrónico</label>
            <input type="email" id="user-email" required placeholder="juan@ejemplo.com">
          </div>

          <div class="form-group">
            <label for="user-password">Contraseña</label>
            <input type="password" id="user-password" placeholder="••••••••" minlength="6">
            <small style="color:var(--text-secondary);margin-top:4px;display:block">Deja vacío para mantener la contraseña actual (para ediciones)</small>
          </div>

          <div class="form-group">
            <label for="user-role">Rol</label>
            <select id="user-role" required>
              <option value="user">Trabajador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div class="form-group">
            <label for="user-status">Estado</label>
            <select id="user-status" required>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeAddUserModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar Usuario</button>
          </div>
        </form>
      </div>
    </div>
  `;

  container.innerHTML = html;
  await loadAdminUsers();
}

async function loadAdminUsers() {
  const result = await SupabaseService.fetchUsers();

  if (result.error || !result.data) {
    document.getElementById('admin-users-table').innerHTML = `
      <tr style="text-align:center;color:var(--text-secondary)">
        <td colspan="6">Error al cargar usuarios</td>
      </tr>
    `;
    return;
  }

  const users = result.data;

  if (users.length === 0) {
    document.getElementById('admin-users-table').innerHTML = `
      <tr style="text-align:center;color:var(--text-secondary)">
        <td colspan="6">No se encontraron usuarios</td>
      </tr>
    `;
    return;
  }

  const rows = users.map(user => {
    const avatar = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="avatar-sm" style="background:var(--surface-alt);color:var(--text-secondary)">${avatar}</div>
            <span>${user.name}</span>
          </div>
        </td>
        <td>${user.email}</td>
        <td>
          <span class="badge" style="background:${user.role === 'admin' ? 'var(--color-purple-dim)' : 'var(--color-blue-dim)'};color:${user.role === 'admin' ? 'var(--color-purple)' : 'var(--accent-blue-light)'}">
            ${user.role === 'admin' ? 'Administrador' : 'Trabajador'}
          </span>
        </td>
        <td>
          <span class="badge" style="background:${user.status === 'active' ? 'var(--color-green-dim)' : 'var(--color-red-dim)'};color:${user.status === 'active' ? 'var(--color-green)' : 'var(--color-red)'}">
            ${user.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td style="font-size:12px;color:var(--text-secondary)">${new Date(user.created_at).toLocaleDateString('es-ES')}</td>
        <td>
          <div style="display:flex;gap:8px">
            <button class="btn btn-small btn-ghost" onclick="editUser('${user.id}')">Editar</button>
            <button class="btn btn-small btn-ghost" style="color:var(--color-red)" onclick="deleteUser('${user.id}')">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  });

  document.getElementById('admin-users-table').innerHTML = rows.join('');
}

function openAddUserModal() {
  document.getElementById('user-form').reset();
  document.getElementById('modal-title').textContent = 'Agregar Nuevo Usuario';
  document.getElementById('user-password').required = true;
  document.getElementById('user-form').dataset.userId = '';
  document.getElementById('user-modal').style.display = 'flex';
}

function closeAddUserModal() {
  document.getElementById('user-modal').style.display = 'none';
}

async function handleSaveUser(event) {
  event.preventDefault();

  const userId = document.getElementById('user-form').dataset.userId;
  const name = document.getElementById('user-name').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const password = document.getElementById('user-password').value;
  const role = document.getElementById('user-role').value;
  const status = document.getElementById('user-status').value;

  if (!name || !email) {
    toast('Por favor completa todos los campos requeridos', 'error');
    return;
  }

  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    if (userId) {
      // Edit existing user
      const updates = { name, email, role, status };
      if (password) {
        updates.password_hash = btoa(password);
      }

      const result = await SupabaseService.updateUser(userId, updates);

      if (result.error) {
        toast('Error al actualizar usuario', 'error');
      } else {
        toast('Usuario actualizado correctamente', 'success');
        closeAddUserModal();
        loadAdminUsers();
      }
    } else {
      // Create new user
      const result = await SupabaseService.createUser(name, email, password, role);

      if (result.error) {
        toast(result.error.message || 'Error al crear usuario', 'error');
      } else {
        toast('Usuario creado correctamente', 'success');
        closeAddUserModal();
        loadAdminUsers();
      }
    }
  } catch (err) {
    console.error('Error saving user:', err);
    toast('Ocurrió un error', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function editUser(userId) {
  const result = await SupabaseService.fetchUsers();
  if (!result.data) return;

  const user = result.data.find(u => u.id === userId);
  if (!user) return;

  document.getElementById('user-name').value = user.name;
  document.getElementById('user-email').value = user.email;
  document.getElementById('user-password').value = '';
  document.getElementById('user-password').required = false;
  document.getElementById('user-role').value = user.role;
  document.getElementById('user-status').value = user.status;
  document.getElementById('user-form').dataset.userId = userId;
  document.getElementById('modal-title').textContent = 'Editar Usuario';
  document.getElementById('user-modal').style.display = 'flex';
}

async function deleteUser(userId) {
  if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

  const result = await SupabaseService.deleteUser(userId);

  if (result.error) {
    toast('Error al eliminar usuario', 'error');
  } else {
    toast('Usuario eliminado correctamente', 'success');
    loadAdminUsers();
  }
}
