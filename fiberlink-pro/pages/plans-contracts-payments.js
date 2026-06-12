// ══════════════════════════════════════
// PLANES
// ══════════════════════════════════════
function renderPlans(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Planes</h1>
        <p class="page-subtitle">Gestiona tu portafolio de servicios de internet</p>
      </div>
      <button class="btn btn-primary" onclick="openPlanModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Crear Plan
      </button>
    </div>

    <div class="grid-3" id="plans-grid"></div>

    <div style="margin-top:24px">
      <div class="chart-card chart-card-compact">
        <div class="card-header"><span class="card-title">Utilización de Capacidad de Red</span></div>
        <div class="chart-wrapper compact-chart">
          <canvas id="plansBarChart"></canvas>
        </div>
      </div>
    </div>

    <div class="modal-overlay" id="plan-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="plan-modal-title">Crear Plan</h3>
          <button class="modal-close" onclick="closeModal('plan-modal')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="form-group"><label class="form-label">Nombre del Plan *</label><input class="form-input" id="p-name" placeholder="Fibra Pro"></div>
        <div class="grid-2" style="gap:12px">
          <div class="form-group"><label class="form-label">Velocidad de Descarga</label><input class="form-input" id="p-speed" placeholder="500 Mbps"></div>
          <div class="form-group"><label class="form-label">Velocidad de Carga</label><input class="form-input" id="p-upload" placeholder="250 Mbps"></div>
          <div class="form-group"><label class="form-label">Precio (S/mes) *</label><input class="form-input" id="p-price" type="number" placeholder="59"></div>
          <div class="form-group"><label class="form-label">Estado</label>
            <select class="form-input form-select" id="p-status"><option value="active">Activo</option><option value="inactive">Inactivo</option></select>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Descripción</label><input class="form-input" id="p-desc" placeholder="Ideal para familias y trabajo remoto"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('plan-modal')">Cancelar</button>
          <button class="btn btn-primary" onclick="savePlan()">Guardar Plan</button>
        </div>
      </div>
    </div>
  `;

  renderPlansGrid();
  setTimeout(initPlansChart, 50);
}

function renderPlansGrid() {
  const grid = document.getElementById('plans-grid');
  if (!grid) return;
  const featured = DB.plans.reduce((a, b) => b.clients > a.clients ? b : a);
  const totalPlanClients = DB.plans.reduce((sum, plan) => sum + plan.clients, 0);
  grid.innerHTML = DB.plans.map(p => `
    <div class="plan-card ${p.id === featured.id ? 'featured' : ''}">
      ${p.id === featured.id ? '<div class="plan-badge">Más Popular</div>' : ''}
      <div style="margin-bottom:12px">
        <div style="font-size:16px;font-weight:700;margin-bottom:2px">${p.name}</div>
        <div style="font-size:12px;color:var(--text-secondary)">${p.description}</div>
      </div>
      <div class="plan-price" style="margin-bottom:16px">${formatCurrency(p.price)}<span>/mes</span></div>
      <div class="plan-feature">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Descarga: ${p.speed}
      </div>
      <div class="plan-feature">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Carga: ${p.upload}
      </div>
      <div class="plan-feature">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        ${p.clients} clientes activos
      </div>
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:11px;color:var(--text-secondary)">Capacidad</span>
          <span style="font-size:11px;font-weight:600">${totalPlanClients ? Math.round(p.clients/totalPlanClients*100) : 0}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${totalPlanClients ? Math.round(p.clients/totalPlanClients*100) : 0}%;background:${p.color}"></div></div>
      </div>
      <div style="display:flex;gap:6px;margin-top:14px">
        ${statusBadge(p.status)}
        <div style="margin-left:auto;display:flex;gap:4px">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="openPlanModal(${p.id})" title="Editar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deletePlan(${p.id})" title="Eliminar" style="color:var(--accent-red)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

let editPlanId = null;
function openPlanModal(id = null) {
  editPlanId = id;
  document.getElementById('plan-modal-title').textContent = id ? 'Editar Plan' : 'Crear Plan';
  if (id) {
    const p = DB.plans.find(x => x.id === id);
    if (!p) return;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-speed').value = p.speed;
    document.getElementById('p-upload').value = p.upload;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-status').value = p.status;
    document.getElementById('p-desc').value = p.description;
  } else {
    ['p-name','p-speed','p-upload','p-price','p-desc'].forEach(i => document.getElementById(i).value = '');
  }
  openModal('plan-modal');
}

async function savePlan() {
  const name = document.getElementById('p-name').value.trim();
  const price = parseFloat(document.getElementById('p-price').value);
  if (!name || !price) { toast('Name and price are required', 'error'); return; }
  const data = {
    name,
    speed: document.getElementById('p-speed').value,
    upload: document.getElementById('p-upload').value,
    price,
    status: document.getElementById('p-status').value,
    description: document.getElementById('p-desc').value,
    clients: 0,
    color: '#2563eb'
  };
  if (editPlanId) data.id = editPlanId;

  const result = await window.SupabaseService.upsertPlan(data);
  if (result.error) {
    toast('Plan saved locally, but Supabase sync failed', 'error');
  } else {
    toast(editPlanId ? 'Plan updated' : 'Plan created', 'success');
  }

  const saved = result.data?.[0];
  if (editPlanId) {
    const idx = DB.plans.findIndex(p => p.id === editPlanId);
    if (idx >= 0) DB.plans[idx] = { ...DB.plans[idx], ...data, id: saved?.id ?? editPlanId };
  } else {
    DB.plans.push({ ...data, id: saved?.id ?? Date.now() });
  }
  closeModal('plan-modal');
  renderPlansGrid();
}

async function deletePlan(id) {
  if (!window.confirm('Delete this plan?')) return;
  const result = await window.SupabaseService.deletePlan(id);
  if (result.error) { toast('Failed to delete plan', 'error'); return; }
  const idx = DB.plans.findIndex(p => p.id === id);
  if (idx >= 0) DB.plans.splice(idx, 1);
  toast('Plan deleted', 'success');
  renderPlansGrid();
}

function initPlansChart() {
  const ctx = document.getElementById('plansBarChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DB.plans.map(p => p.name),
      datasets: [{
        label: 'Active Clients',
        data: DB.plans.map(p => p.clients),
        backgroundColor: DB.plans.map(p => p.color + 'cc'),
        borderColor: DB.plans.map(p => p.color),
        borderWidth: 1,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#131929', borderColor: '#1e2d45', borderWidth: 1, titleColor: '#f0f4ff', bodyColor: '#8899bb' }},
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8899bb' } },
        y: { grid: { color: '#1e2d45' }, ticks: { color: '#8899bb' } }
      }
    }
  });
}

// ══════════════════════════════════════
// CONTRACTS
// ══════════════════════════════════════
function renderContracts(container) {
  container.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-title">Contratos</h1><p class="page-subtitle">${DB.contracts.length} contratos en total</p></div>
      <button class="btn btn-primary" onclick="openContractModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        New Contract
      </button>
    </div>
    <div class="grid-4" style="margin-bottom:16px">
      ${[
        ['Active',DB.contracts.filter(c=>c.status==='active').length,'green'],
        ['Expiring Soon',DB.contracts.filter(c=>c.status==='expiring').length,'yellow'],
        ['Expired',DB.contracts.filter(c=>c.status==='expired').length,'red'],
        ['Suspended',DB.contracts.filter(c=>c.status==='suspended').length,'red'],
      ].map(([l,v,c])=>`
        <div class="kpi-card ${c}" style="padding:16px 18px">
          <div class="kpi-value" style="font-size:22px">${v}</div>
          <div class="kpi-label">${l}</div>
        </div>`).join('')}
    </div>
    <div class="table-toolbar">
      <div class="search-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="text" placeholder="Busca contratos..." id="contract-search" oninput="filterContracts()">
      </div>
      <select class="filter-select" id="contract-status-filter" onchange="filterContracts()">
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="expiring">Expiring</option>
        <option value="expired">Expired</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>
    <div class="table-container">
      <table>
        <thead><tr><th>Client</th><th>Plan</th><th>Start Date</th><th>End Date</th><th>Monthly Value</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="contracts-tbody"></tbody>
      </table>
    </div>

    <div class="modal-overlay" id="contract-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">New Contract</h3>
          <button class="modal-close" onclick="closeModal('contract-modal')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="grid-2" style="gap:12px">
          <div class="form-group"><label class="form-label">Client *</label>
            <select class="form-input form-select" id="ct-client">
              <option value="">Select client</option>
              ${DB.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Plan *</label>
            <select class="form-input form-select" id="ct-plan">
              <option value="">Select plan</option>
              ${DB.plans.map(p => `<option value="${p.id}">${p.name} — ${formatCurrency(p.price)}/mo</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Start Date *</label>
            <input class="form-input" id="ct-start" type="date" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group"><label class="form-label">End Date *</label>
            <input class="form-input" id="ct-end" type="date">
          </div>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-input form-select" id="ct-status">
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('contract-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="saveContract()">Create Contract</button>
        </div>
      </div>
    </div>
  `;
  renderContractsTable(DB.contracts);
}

function filterContracts() {
  const search = document.getElementById('contract-search')?.value.toLowerCase()||'';
  const status = document.getElementById('contract-status-filter')?.value||'all';
  const data = DB.contracts.filter(c => {
    const ms = !search || c.client.toLowerCase().includes(search);
    const mst = status==='all' || c.status===status;
    return ms && mst;
  });
  renderContractsTable(data);
}

function renderContractsTable(data) {
  const tbody = document.getElementById('contracts-tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(c => {
    const daysLeft = Math.ceil((new Date(c.endDate) - new Date()) / 86400000);
    return `<tr>
      <td><div style="font-weight:500">${c.client}</div></td>
      <td><span style="font-size:12px;color:var(--text-secondary)">${c.plan}</span></td>
      <td><span style="font-size:12px;color:var(--text-secondary)">${formatDate(c.startDate)}</span></td>
      <td>
        <div style="font-size:12px">${formatDate(c.endDate)}</div>
        ${daysLeft > 0 ? `<div style="font-size:10px;color:${daysLeft<60?'var(--accent-yellow)':'var(--text-muted)'}">${daysLeft} days left</div>` : ''}
      </td>
      <td><span style="font-weight:600">${formatCurrency(c.value)}/mo</span></td>
      <td>${statusBadge(c.status)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-icon btn-sm" title="Renew" onclick="renewContract('${c.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          </button>
          <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--accent-red)" title="Cancel" onclick="cancelContract('${c.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);padding:32px">No contracts found</td></tr>`;
}

// ══════════════════════════════════════
// PAYMENTS
// ══════════════════════════════════════
function renderPayments(container) {
  const paid = DB.payments.filter(p=>p.status==='paid').reduce((a,b)=>a+b.amount,0);
  const pending = DB.payments.filter(p=>p.status==='pending').reduce((a,b)=>a+b.amount,0);
  const overdue = DB.payments.filter(p=>p.status==='overdue').reduce((a,b)=>a+b.amount,0);

  container.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-title">Pagos y Facturación</h1><p class="page-subtitle">Rastrea transacciones y registros de facturación</p></div>
      <button class="btn btn-primary" onclick="openPaymentModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        New Payment
      </button>
    </div>

    <div class="grid-3" style="margin-bottom:16px">
      ${[
        ['Revenue This Month',formatCurrency(paid),'green','+12.4%'],
        ['Pending Payments',formatCurrency(pending),'yellow',DB.payments.filter(p=>p.status==='pending').length+' invoices'],
        ['Overdue Invoices',formatCurrency(overdue),'red',DB.payments.filter(p=>p.status==='overdue').length+' overdue'],
      ].map(([l,v,c,sub])=>`
        <div class="kpi-card ${c}" style="padding:18px 20px">
          <div class="kpi-label" style="margin-bottom:8px">${l}</div>
          <div class="kpi-value" style="font-size:24px">${v}</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${sub}</div>
        </div>`).join('')}
    </div>

    <div class="dashboard-grid" style="grid-template-columns:1fr 300px">
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <h3 style="font-size:14px;font-weight:600">Transaction History</h3>
        </div>
        <div class="table-toolbar">
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Buscar..." id="pay-search" oninput="filterPayments()">
          </div>
          <select class="filter-select" id="pay-filter" onchange="filterPayments()">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div class="table-container">
          <table>
            <thead><tr><th>Client</th><th>Invoice</th><th>Date</th><th>Amount</th><th>Method</th><th>Status</th><th></th></tr></thead>
            <tbody id="payments-tbody"></tbody>
          </table>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="chart-card chart-card-compact">
          <div class="card-header"><span class="card-title">Revenue by Method</span></div>
          <div class="chart-wrapper compact-chart">
            <canvas id="payMethodChart"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Quick Stats</span></div>
          ${[
            ['Total Transactions', DB.payments.length],
            ['Average Payment', formatCurrency(DB.payments.reduce((a,b)=>a+b.amount,0)/DB.payments.length)],
            ['Success Rate', Math.round(DB.payments.filter(p=>p.status==='paid').length/DB.payments.length*100)+'%'],
          ].map(([l,v])=>`<div class="stat-row"><span class="stat-row-label">${l}</span><span class="stat-row-value">${v}</span></div>`).join('')}
        </div>
      </div>
    </div>

    <div class="modal-overlay" id="payment-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">New Payment</h3>
          <button class="modal-close" onclick="closeModal('payment-modal')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="grid-2" style="gap:12px">
          <div class="form-group"><label class="form-label">Client</label>
            <select class="form-input form-select" id="pay-client">
              <option value="">Select client</option>
              ${DB.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Invoice #</label><input class="form-input" id="pay-invoice" placeholder="INV-2024-011"></div>
          <div class="form-group"><label class="form-label">Amount</label><input class="form-input" id="pay-amount" type="number" placeholder="59"></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select class="form-input form-select" id="pay-status"><option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option></select>
          </div>
        </div>
        <div class="grid-2" style="gap:12px">
          <div class="form-group"><label class="form-label">Method</label><input class="form-input" id="pay-method" placeholder="Credit Card"></div>
          <div class="form-group"><label class="form-label">Date</label><input class="form-input" id="pay-date" type="date"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('payment-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="savePayment()">Save Payment</button>
        </div>
      </div>
    </div>
  `;
  renderPaymentsTable(DB.payments);
  setTimeout(initPayMethodChart, 50);
}

function openPaymentModal() {
  document.getElementById('pay-client').value = '';
  document.getElementById('pay-invoice').value = '';
  document.getElementById('pay-amount').value = '';
  document.getElementById('pay-method').value = '';
  document.getElementById('pay-status').value = 'paid';
  document.getElementById('pay-date').value = new Date().toISOString().split('T')[0];
  openModal('payment-modal');
}

async function savePayment() {
  const clientId = document.getElementById('pay-client').value;
  const invoice = document.getElementById('pay-invoice').value.trim();
  const amount = parseFloat(document.getElementById('pay-amount').value);
  const method = document.getElementById('pay-method').value.trim() || 'Credit Card';
  const status = document.getElementById('pay-status').value;
  const date = document.getElementById('pay-date').value || new Date().toISOString().split('T')[0];

  if (!clientId || !invoice || !amount) {
    toast('Client, invoice, and amount are required', 'error');
    return;
  }

  const client = DB.clients.find(c => c.id == clientId);
  const paymentData = {
    client_id: clientId,
    client_name: client?.name || 'Unknown',
    amount,
    method,
    status,
    date,
    invoice
  };

  const result = await window.SupabaseService.insertPayment(paymentData);
  if (result.error) {
    toast('Payment saved locally, but Supabase sync failed', 'error');
  } else {
    toast('Payment added to Supabase', 'success');
  }

  DB.payments.push({
    id: result.data?.[0]?.id || Date.now(),
    client: paymentData.client_name,
    clientId: paymentData.client_id,
    amount: paymentData.amount,
    method: paymentData.method,
    status: paymentData.status,
    date: paymentData.date,
    invoice: paymentData.invoice
  });

  closeModal('payment-modal');
  filterPayments();
}

function filterPayments() {
  const search = document.getElementById('pay-search')?.value.toLowerCase()||'';
  const status = document.getElementById('pay-filter')?.value||'all';
  const data = DB.payments.filter(p => {
    const ms = !search || p.client.toLowerCase().includes(search) || p.invoice.toLowerCase().includes(search);
    const mst = status==='all'||p.status===status;
    return ms && mst;
  });
  renderPaymentsTable(data);
}

function renderPaymentsTable(data) {
  const tbody = document.getElementById('payments-tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(p => `
    <tr>
      <td><span style="font-weight:500">${p.client}</span></td>
      <td><span style="font-family:monospace;font-size:12px;color:var(--text-secondary)">${p.invoice}</span></td>
      <td><span style="font-size:12px;color:var(--text-secondary)">${formatDate(p.date)}</span></td>
      <td><span style="font-weight:600">${formatCurrency(p.amount)}</span></td>
      <td><span style="font-size:12px;color:var(--text-secondary)">${p.method}</span></td>
      <td>${statusBadge(p.status)}</td>
      <td>
        <button class="btn btn-ghost btn-icon btn-sm" title="Download" onclick="toast('Invoice downloaded','success')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);padding:32px">No payments found</td></tr>`;
}

function initPayMethodChart() {
  const ctx = document.getElementById('payMethodChart');
  if (!ctx) return;
  const methods = {};
  DB.payments.filter(p=>p.status==='paid').forEach(p => { methods[p.method] = (methods[p.method]||0) + p.amount; });
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(methods),
      datasets: [{ data: Object.values(methods), backgroundColor: ['#2563eb','#8b5cf6','#06b6d4'], borderWidth: 0, hoverOffset: 4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#8899bb', font: { size: 11 }, boxWidth: 10, padding: 12 } },
        tooltip: { backgroundColor: '#131929', borderColor: '#1e2d45', borderWidth: 1, titleColor: '#f0f4ff', bodyColor: '#8899bb', callbacks: { label: ctx => formatCurrency(ctx.raw) } }
      }
    }
  });
}

// ══════════════════════════════════════
// CONTRACT CRUD
// ══════════════════════════════════════
function openContractModal() {
  document.getElementById('ct-client').value = '';
  document.getElementById('ct-plan').value = '';
  document.getElementById('ct-start').value = new Date().toISOString().split('T')[0];
  document.getElementById('ct-end').value = '';
  document.getElementById('ct-status').value = 'active';
  openModal('contract-modal');
}

async function saveContract() {
  const clientId = document.getElementById('ct-client').value;
  const planId   = document.getElementById('ct-plan').value;
  const startDate = document.getElementById('ct-start').value;
  const endDate   = document.getElementById('ct-end').value;
  const status    = document.getElementById('ct-status').value;

  if (!clientId || !planId || !startDate || !endDate) {
    toast('All fields are required', 'error'); return;
  }

  const client = DB.clients.find(c => String(c.id) === String(clientId));
  const plan   = DB.plans.find(p => String(p.id) === String(planId));

  const payload = {
    client_id: clientId, client_name: client?.name || '',
    plan_id: planId,     plan_name: plan?.name || '',
    start_date: startDate, end_date: endDate,
    status, value: plan?.price || 0
  };

  let savedId = null;
  if (isUUID(clientId) && isUUID(planId)) {
    const result = await window.SupabaseService.insertContract(payload);
    if (result.error) {
      toast('Contract saved locally, Supabase sync failed', 'error');
    } else {
      savedId = result.data?.[0]?.id;
      toast('Contract created', 'success');
    }
  } else {
    toast('Contract created (demo mode)', 'success');
  }

  DB.contracts.push({
    id: savedId || Date.now(),
    client: payload.client_name, clientId: payload.client_id,
    plan: payload.plan_name,     planId: payload.plan_id,
    startDate: payload.start_date, endDate: payload.end_date,
    status: payload.status, value: payload.value
  });

  closeModal('contract-modal');
  navigate('contracts');
}

async function renewContract(id) {
  const c = DB.contracts.find(x => String(x.id) === String(id));
  if (!c) return;
  const newEnd = new Date(c.endDate || new Date());
  newEnd.setFullYear(newEnd.getFullYear() + 1);
  const newEndStr = newEnd.toISOString().split('T')[0];

  if (isUUID(id)) {
    const result = await window.SupabaseService.updateContract(id, { status: 'active', end_date: newEndStr });
    if (result.error) { toast('Failed to renew contract', 'error'); return; }
  }
  c.endDate = newEndStr;
  c.status = 'active';
  toast('Contract renewed for 1 year', 'success');
  navigate('contracts');
}

async function cancelContract(id) {
  if (!window.confirm('Cancel this contract?')) return;
  if (isUUID(id)) {
    const result = await window.SupabaseService.updateContract(id, { status: 'suspended' });
    if (result.error) { toast('Failed to cancel contract', 'error'); return; }
  }
  const c = DB.contracts.find(x => String(x.id) === String(id));
  if (c) c.status = 'suspended';
  toast('Contract cancelled', 'success');
  navigate('contracts');
}
