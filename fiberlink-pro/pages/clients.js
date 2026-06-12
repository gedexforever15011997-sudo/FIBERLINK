let clientsData = [...DB.clients];
let clientFilter = 'all';
let clientSearch = '';

function renderClients(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Clientes</h1>
        <p class="page-subtitle">${DB.clients.length} clientes registrados en total</p>
      </div>
      <button class="btn btn-primary" id="btn-new-client" onclick="openClientModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Nuevo Cliente
      </button>
    </div>

    <div class="table-toolbar">
      <div class="search-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="text" placeholder="Busca clientes..." id="client-search" oninput="filterClients()">
      </div>
      <select class="filter-select" id="client-filter" onchange="filterClients()">
        <option value="all">Todos los Estados</option>
        <option value="active">Activo</option>
        <option value="suspended">Suspendido</option>
        <option value="pending">Pendiente</option>
      </select>
      <select class="filter-select" id="plan-filter" onchange="filterClients()">
        <option value="all">Todos los Planes</option>
        ${DB.plans.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
      </select>
      <div style="margin-left:auto;font-size:12px;color:var(--text-secondary)" id="client-count"></div>
    </div>

    <div class="table-container">
      <table>
        <thead><tr>
          <th>Cliente</th><th>Plan</th><th>Dirección IP</th><th>Último Pago</th><th>Saldo</th><th>Estado</th><th>Acciones</th>
        </tr></thead>
        <tbody id="clients-tbody"></tbody>
      </table>
    </div>
    <div class="pagination" id="clients-pagination"></div>

    <!-- Client Modal -->
    <div class="modal-overlay" id="client-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="client-modal-title">Nuevo Cliente</h3>
          <button class="modal-close" onclick="closeModal('client-modal')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="grid-2" style="gap:12px">
          <div class="form-group"><label class="form-label">Nombre Completo *</label><input class="form-input" id="c-name" placeholder="Juan Pérez"></div>
          <div class="form-group"><label class="form-label">Correo *</label><input class="form-input" id="c-email" type="email" placeholder="juan@email.com"></div>
          <div class="form-group"><label class="form-label">Teléfono</label><input class="form-input" id="c-phone" placeholder="555-0000"></div>
          <div class="form-group"><label class="form-label">Dirección IP</label><input class="form-input" id="c-ip" placeholder="192.168.1.x"></div>
          <div class="form-group"><label class="form-label">Plan *</label>
            <select class="form-input form-select" id="c-plan">
              ${DB.plans.map(p => `<option value="${p.id}">${p.name} — ${formatCurrency(p.price)}/mes</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Estado</label>
            <select class="form-input form-select" id="c-status">
              <option value="active">Activo</option>
              <option value="pending">Pendiente</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Dirección</label><input class="form-input" id="c-address" placeholder="Calle Principal 123"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('client-modal')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveClient()">Guardar Cliente</button>
        </div>
      </div>
    </div>

    <!-- Client Detail Modal -->
    <div class="modal-overlay" id="client-detail-modal">
      <div class="modal" style="max-width:560px">
        <div class="modal-header">
          <h3 class="modal-title">Client Details</h3>
          <button class="modal-close" onclick="closeModal('client-detail-modal')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div id="client-detail-body"></div>
      </div>
    </div>
  `;

  clientsData = [...DB.clients];
  renderClientsTable();
}

let clientPage = 1;
const CLIENT_PER_PAGE = 8;

function filterClients() {
  const search = document.getElementById('client-search')?.value.toLowerCase() || '';
  const status = document.getElementById('client-filter')?.value || 'all';
  const plan = document.getElementById('plan-filter')?.value || 'all';
  clientsData = DB.clients.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || c.ip.includes(search);
    const matchStatus = status === 'all' || c.status === status;
    const matchPlan = plan === 'all' || c.plan === plan;
    return matchSearch && matchStatus && matchPlan;
  });
  clientPage = 1;
  renderClientsTable();
}

function renderClientsTable() {
  const tbody = document.getElementById('clients-tbody');
  const countEl = document.getElementById('client-count');
  if (!tbody) return;
  const start = (clientPage - 1) * CLIENT_PER_PAGE;
  const paged = clientsData.slice(start, start + CLIENT_PER_PAGE);
  if (countEl) countEl.textContent = `${clientsData.length} results`;
  tbody.innerHTML = paged.map(c => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          ${avatarEl(c.avatar,'avatar-sm')}
          <div>
            <div style="font-weight:500;font-size:13px">${c.name}</div>
            <div style="font-size:11px;color:var(--text-secondary)">${c.email}</div>
          </div>
        </div>
      </td>
      <td><span style="font-size:12px;background:var(--accent-blue-dim);color:var(--accent-blue-light);padding:3px 8px;border-radius:20px">${c.plan}</span></td>
      <td><span style="font-family:monospace;font-size:12px;color:var(--text-secondary)">${c.ip}</span></td>
      <td><span style="font-size:12px;color:var(--text-secondary)">${formatDate(c.lastPayment)}</span></td>
      <td><span style="${c.balance > 0 ? 'color:var(--accent-red)' : 'color:var(--accent-green)'};font-weight:600;font-size:12px">${c.balance > 0 ? formatCurrency(c.balance) : '—'}</span></td>
      <td>${statusBadge(c.status)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-icon" title="Ver" onclick="viewClient(${c.id})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn btn-ghost btn-icon" title="Editar" onclick="openClientModal(${c.id})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-ghost btn-icon" title="Eliminar" onclick="deleteClient(${c.id})" style="color:var(--accent-red)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);padding:32px">No clients found</td></tr>`;

  renderPagination('clients-pagination', clientsData.length, CLIENT_PER_PAGE, clientPage, (p) => { clientPage = p; renderClientsTable(); });
  applyClientPermissions();
}

let editClientId = null;

function openClientModal(id = null) {
  if (!requirePermission('clients.create') && !requirePermission('clients.edit')) return;
  editClientId = id;
  document.getElementById('client-modal-title').textContent = id ? 'Editar Cliente' : 'Nuevo Cliente';
  if (id) {
    const c = DB.clients.find(x => x.id === id);
    if (!c) return;
    document.getElementById('c-name').value = c.name;
    document.getElementById('c-email').value = c.email;
    document.getElementById('c-phone').value = c.phone;
    document.getElementById('c-ip').value = c.ip;
    document.getElementById('c-plan').value = c.planId;
    document.getElementById('c-status').value = c.status;
    document.getElementById('c-address').value = c.address;
  } else {
    ['c-name','c-email','c-phone','c-ip','c-address'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('c-plan').value = 1;
    document.getElementById('c-status').value = 'active';
  }
  openModal('client-modal');
}

async function saveClient() {
  const name = document.getElementById('c-name').value.trim();
  const email = document.getElementById('c-email').value.trim();
  if (!name || !email) { toast('Name and email are required', 'error'); return; }
  const planId = document.getElementById('c-plan').value;
  const plan = DB.plans.find(p => p.id == planId);
  const data = {
    id: editClientId || undefined,
    name,
    email,
    phone: document.getElementById('c-phone').value,
    ip: document.getElementById('c-ip').value || `192.168.1.${DB.clients.length + 10}`,
    plan_id: planId,
    plan_name: plan?.name || '',
    status: document.getElementById('c-status').value,
    address: document.getElementById('c-address').value,
    avatar: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2),
    joined: new Date().toISOString().split('T')[0],
    last_payment: null,
    balance: 0
  };

  const result = await window.SupabaseService.upsertClient(data);
  const saved = result.data && result.data[0] ? result.data[0] : null;
  if (result.error) {
    toast('Client saved locally, but Supabase sync failed', 'error');
  } else {
    toast(editClientId ? 'Client updated in Supabase' : 'Client added to Supabase', 'success');
  }

  const clientRecord = {
    id: saved?.id ?? (editClientId || Date.now()),
    name: data.name,
    email: data.email,
    phone: data.phone,
    ip: data.ip,
    plan: data.plan_name,
    planId: data.plan_id,
    status: data.status,
    address: data.address,
    joined: data.joined,
    lastPayment: data.last_payment,
    balance: data.balance,
    avatar: data.avatar
  };

  if (editClientId) {
    const idx = DB.clients.findIndex(c => c.id === editClientId);
    if (idx >= 0) DB.clients[idx] = { ...DB.clients[idx], ...clientRecord };
  } else {
    DB.clients.push(clientRecord);
  }

  closeModal('client-modal');
  filterClients();
}

async function deleteClient(id) {
  if (!requirePermission('clients.delete')) return;
  if (!window.confirm('Delete this client?')) return;
  const result = await window.SupabaseService.deleteClient(id);
  if (result.error) { toast('Failed to delete client', 'error'); return; }
  const idx = DB.clients.findIndex(c => c.id === id);
  if (idx >= 0) DB.clients.splice(idx, 1);
  toast('Client deleted', 'success');
  filterClients();
}

function viewClient(id) {
  const c = DB.clients.find(x => x.id === id);
  if (!c) return;
  const payments = DB.payments.filter(p => p.clientId === id);
  document.getElementById('client-detail-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      ${avatarEl(c.avatar)}
      <div>
        <div style="font-size:16px;font-weight:700">${c.name}</div>
        <div style="font-size:12px;color:var(--text-secondary)">${c.email} · ${c.phone}</div>
      </div>
      <div style="margin-left:auto">${statusBadge(c.status)}</div>
    </div>
    <div class="divider"></div>
    <div class="grid-2" style="gap:12px;margin-bottom:16px">
      ${[['Plan',`<span style="color:var(--accent-blue-light)">${c.plan}</span>`],['IP',`<code style="font-size:12px">${c.ip}</code>`],['Joined',formatDate(c.joined)],['Address',c.address||'—'],['Balance',c.balance>0?`<span style="color:var(--accent-red)">${formatCurrency(c.balance)}</span>`:'<span style="color:var(--accent-green)">Paid</span>'],['Payments',payments.length+' records']].map(([k,v])=>`
        <div><div style="font-size:11px;color:var(--text-muted);margin-bottom:2px">${k}</div><div style="font-size:13px;font-weight:500">${v}</div></div>`).join('')}
    </div>
    <div class="divider"></div>
    <div style="font-size:13px;font-weight:600;margin-bottom:10px">Payment History</div>
    ${payments.slice(0,3).map(p=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-size:13px;font-weight:500">${p.invoice}</div>
          <div style="font-size:11px;color:var(--text-secondary)">${formatDate(p.date)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-weight:600">${formatCurrency(p.amount)}</span>
          ${statusBadge(p.status)}
        </div>
      </div>`).join('') || '<div style="color:var(--text-secondary);font-size:13px">No payments yet</div>'}
  `;
  openModal('client-detail-modal');
}

function renderPagination(containerId, total, perPage, current, onPage) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) { el.innerHTML = ''; return; }
  let html = `<button class="page-btn" onclick="(${onPage})(${current-1})" ${current===1?'disabled':''}>‹</button>`;
  for (let i = 1; i <= pages; i++) {
    if (pages > 6 && i > 2 && i < pages - 1 && Math.abs(i - current) > 1) { if (i === 3) html += '<span style="color:var(--text-muted);padding:0 4px">…</span>'; continue; }
    html += `<button class="page-btn ${i===current?'active':''}" onclick="(${onPage})(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="(${onPage})(${current+1})" ${current===pages?'disabled':''}>›</button>`;
  el.innerHTML = html;
}

function applyClientPermissions() {
  const btnNewClient = document.getElementById('btn-new-client');
  if (btnNewClient) {
    showIfPermitted(btnNewClient, 'clients.create');
  }

  // Disable edit/delete buttons for non-admins
  document.querySelectorAll('button[title="Edit"], button[title="Delete"]').forEach(btn => {
    if (btn.title === 'Delete') {
      if (!hasPermission('clients.delete')) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      }
    } else if (btn.title === 'Edit') {
      if (!hasPermission('clients.edit')) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      }
    }
  });
}
