// ══════════════════════════════════════
// REPORTS
// ══════════════════════════════════════
function renderReports(container) {
  const totalRevenue = DB.payments.filter(p => p.status === 'paid').reduce((a, b) => a + b.amount, 0);
  const activeClients = DB.clients.filter(c => c.status === 'active').length;
  const suspendedClients = DB.clients.filter(c => c.status === 'suspended').length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const newClientsCount = DB.clients.filter(c => c.joined && c.joined.startsWith(thisMonth)).length;
  const churnRate = DB.clients.length ? ((suspendedClients / DB.clients.length) * 100).toFixed(1) : '0.0';
  const arpu = activeClients ? (totalRevenue / activeClients).toFixed(2) : '0.00';

  container.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-title">Reports & Analytics</h1><p class="page-subtitle">Business intelligence and performance metrics</p></div>
      <button class="btn btn-primary" onclick="exportReport()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export PDF
      </button>
    </div>

    <div class="grid-4" style="margin-bottom:16px">
      ${[
        ['Total Revenue', formatCurrency(totalRevenue), 'green', DB.payments.filter(p=>p.status==='paid').length + ' paid invoices'],
        ['New Clients', String(newClientsCount), 'blue', 'joined this month'],
        ['Churn Rate', churnRate + '%', 'red', suspendedClients + ' suspended'],
        ['ARPU', formatCurrency(arpu), 'cyan', activeClients + ' active clients'],
      ].map(([l,v,c,t])=>`
        <div class="kpi-card ${c}" style="padding:16px 18px">
          <div class="kpi-label" style="margin-bottom:6px">${l}</div>
          <div class="kpi-value" style="font-size:22px">${v}</div>
          <div style="font-size:11px;margin-top:4px;color:var(--text-secondary)">${t}</div>
        </div>`).join('')}
    </div>

    <div class="grid-2" style="margin-bottom:16px">
      <div class="chart-card chart-card-compact">
        <div class="card-header"><span class="card-title">Client Growth</span></div>
        <div class="chart-wrapper compact-chart">
          <canvas id="clientGrowthChart"></canvas>
        </div>
      </div>
      <div class="chart-card chart-card-compact">
        <div class="card-header"><span class="card-title">Revenue by Plan</span></div>
        <div class="chart-wrapper compact-chart">
          <canvas id="revenueBreakdownChart"></canvas>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">Top Performing Plans</span></div>
        ${DB.plans.map(p => {
          const rev = p.clients * p.price;
          const pct = Math.round(rev / (DB.plans.reduce((a,b)=>a+b.clients*b.price,0)||1) * 100);
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:8px;height:8px;border-radius:50%;background:${p.color}"></div>
              <div>
                <div style="font-size:13px;font-weight:500">${p.name}</div>
                <div style="font-size:11px;color:var(--text-secondary)">${p.clients} clients</div>
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:13px;font-weight:600">${formatCurrency(rev)}</div>
              <div style="font-size:11px;color:var(--text-secondary)">${pct}% of total</div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Payment Summary</span></div>
        ${[
          ['Paid',DB.payments.filter(p=>p.status==='paid').length,'var(--accent-green)'],
          ['Pending',DB.payments.filter(p=>p.status==='pending').length,'var(--accent-yellow)'],
          ['Overdue',DB.payments.filter(p=>p.status==='overdue').length,'var(--accent-red)'],
        ].map(([l,v,c])=>`
          <div class="stat-row">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:8px;height:8px;border-radius:50%;background:${c}"></div>
              <span class="stat-row-label">${l}</span>
            </div>
            <span class="stat-row-value">${v} invoices</span>
          </div>`).join('')}
        <div class="divider"></div>
        <div style="text-align:center;padding:8px 0">
          <div class="chart-wrapper compact-chart">
            <canvas id="payStatusChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initClientGrowthChart();
    initRevenueBreakdownChart();
    initPayStatusChart();
  }, 50);
}

function exportReport() {
  window.print();
}

function initClientGrowthChart() {
  const ctx = document.getElementById('clientGrowthChart');
  if (!ctx) return;

  const now = new Date();
  const labels = [];
  const counts = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
    counts.push(DB.clients.filter(c => c.joined && c.joined.startsWith(key)).length);
  }

  const hasRealData = counts.some(c => c > 0);
  const finalLabels = hasRealData ? labels : DB.revenueMonthly.map(d => d.month);
  const finalData   = hasRealData ? counts : DB.revenueMonthly.map(d => d.clients);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: finalLabels,
      datasets: [{
        label: 'Clients',
        data: finalData,
        fill: true,
        borderColor: '#10b981',
        backgroundColor: ctx2 => { const g = ctx2.chart.ctx.createLinearGradient(0,0,0,220); g.addColorStop(0,'rgba(16,185,129,0.2)'); g.addColorStop(1,'rgba(16,185,129,0)'); return g; },
        borderWidth: 2, tension: 0.4, pointBackgroundColor: '#10b981', pointRadius: 3, pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#131929', borderColor: '#1e2d45', borderWidth: 1, titleColor: '#f0f4ff', bodyColor: '#8899bb' }},
      scales: { x: { grid: { color: '#1e2d45' }, ticks: { color: '#8899bb', font: { size: 11 } } }, y: { grid: { color: '#1e2d45' }, ticks: { color: '#8899bb', font: { size: 11 } } } }
    }
  });
}

function initRevenueBreakdownChart() {
  const ctx = document.getElementById('revenueBreakdownChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DB.plans.map(p => p.name),
      datasets: [{
        label: 'Monthly Revenue',
        data: DB.plans.map(p => Math.round(p.clients * p.price)),
        backgroundColor: DB.plans.map(p => p.color + 'cc'),
        borderColor: DB.plans.map(p => p.color),
        borderWidth: 1,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#131929', borderColor: '#1e2d45', borderWidth: 1, titleColor: '#f0f4ff', bodyColor: '#8899bb', callbacks: { label: c => formatCurrency(c.raw) } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8899bb', font: { size: 11 } } },
        y: { grid: { color: '#1e2d45' }, ticks: { color: '#8899bb', font: { size: 11 }, callback: v => 'S/' + (v/1000).toFixed(0) + 'k' } }
      }
    }
  });
}

function initPayStatusChart() {
  const ctx = document.getElementById('payStatusChart');
  if (!ctx) return;
  const paid = DB.payments.filter(p=>p.status==='paid').length;
  const pend = DB.payments.filter(p=>p.status==='pending').length;
  const over = DB.payments.filter(p=>p.status==='overdue').length;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Paid','Pending','Overdue'],
      datasets: [{ data: [paid, pend, over], backgroundColor: ['#10b981','#f59e0b','#ef4444'], borderWidth: 0, hoverOffset: 4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#131929', borderColor: '#1e2d45', borderWidth: 1, titleColor: '#f0f4ff', bodyColor: '#8899bb' } }
    }
  });
}

// ══════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════
function renderSettings(container) {
  const company = Store.get('company-info') || {
    name: 'FiberLink Pro', email: 'support@fiberlink.com',
    phone: '+1 555-0100', website: 'fiberlink.com',
    address: '100 Tech Street, San Francisco, CA'
  };

  container.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-title">Settings</h1><p class="page-subtitle">Manage users, roles, and system configuration</p></div>
    </div>

    <div class="dashboard-grid" style="grid-template-columns:220px 1fr">
      <div style="display:flex;flex-direction:column;gap:4px">
        ${[['Users & Roles','users-section'],['Company Info','company-section'],['Notifications','notif-section'],['Security','security-section']].map(([l,s],i)=>`
          <button class="nav-item ${i===0?'active':''}" onclick="showSettingsSection('${s}',this)" style="width:100%">${l}</button>`).join('')}
      </div>

      <div>
        <div id="users-section">
          <div class="card" style="margin-bottom:16px">
            <div class="card-header">
              <span class="card-title">Team Members</span>
              <button class="btn btn-primary btn-sm" onclick="toast('User invited','success')">Invite User</button>
            </div>
            <div class="table-container">
              <table>
                <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  ${DB.users.map(u => `<tr>
                    <td><div style="display:flex;align-items:center;gap:10px">${avatarEl(u.avatar,'avatar-sm')}<div><div style="font-weight:500">${u.name}</div><div style="font-size:11px;color:var(--text-secondary)">${u.email}</div></div></div></td>
                    <td><span style="font-size:12px;background:var(--accent-blue-dim);color:var(--accent-blue-light);padding:3px 8px;border-radius:20px;text-transform:capitalize">${u.role}</span></td>
                    <td>${statusBadge(u.status)}</td>
                    <td><div style="display:flex;gap:4px">
                      <button class="btn btn-ghost btn-icon btn-sm" onclick="toast('User edited','info')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </div></td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">Roles & Permissions</span></div>
            ${[['Admin','Full system access'],['Supervisor','Manage clients and billing'],['Technician','View clients and support']].map(([r,d])=>`
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
                <div>
                  <div style="font-size:13px;font-weight:500;text-transform:capitalize">${r}</div>
                  <div style="font-size:11px;color:var(--text-secondary)">${d}</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="toast('Permissions editor coming soon','info')">Edit</button>
              </div>`).join('')}
          </div>
        </div>

        <div id="company-section" style="display:none">
          <div class="card">
            <div class="card-header"><span class="card-title">Company Information</span></div>
            <div class="grid-2" style="gap:12px">
              <div class="form-group"><label class="form-label">Company Name</label><input class="form-input" id="company-name" value="${company.name}"></div>
              <div class="form-group"><label class="form-label">Support Email</label><input class="form-input" id="company-email" type="email" value="${company.email}"></div>
              <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="company-phone" value="${company.phone}"></div>
              <div class="form-group"><label class="form-label">Website</label><input class="form-input" id="company-website" value="${company.website}"></div>
            </div>
            <div class="form-group"><label class="form-label">Address</label><input class="form-input" id="company-address" value="${company.address}"></div>
            <div style="margin-top:16px;display:flex;justify-content:flex-end">
              <button class="btn btn-primary" onclick="saveCompanyInfo()">Save Changes</button>
            </div>
          </div>
        </div>

        <div id="notif-section" style="display:none">
          <div class="card">
            <div class="card-header"><span class="card-title">Notification Preferences</span></div>
            ${[['Payment received','Send email when payment is received',true],['Overdue invoices','Alert when invoice is 7+ days overdue',true],['New client','Notify on new client registration',false],['Contract expiry','Alert 30 days before contract expires',true]].map(([t,d,on])=>`
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
                <div>
                  <div style="font-size:13px;font-weight:500">${t}</div>
                  <div style="font-size:11px;color:var(--text-secondary)">${d}</div>
                </div>
                <button onclick="this.classList.toggle('on');toast('Setting updated','success')" style="width:42px;height:24px;background:${on?'var(--accent-blue)':'var(--border-light)'};border-radius:12px;position:relative;transition:all 0.2s;flex-shrink:0" class="${on?'on':''}">
                  <span style="position:absolute;width:18px;height:18px;background:#fff;border-radius:50%;top:3px;transition:all 0.2s;${on?'left:21px':'left:3px'}"></span>
                </button>
              </div>`).join('')}
          </div>
        </div>

        <div id="security-section" style="display:none">
          <div class="card">
            <div class="card-header"><span class="card-title">Security Settings</span></div>
            <div class="form-group"><label class="form-label">Current Password</label><input class="form-input" type="password" placeholder="••••••••"></div>
            <div class="form-group"><label class="form-label">New Password</label><input class="form-input" type="password" placeholder="••••••••"></div>
            <div class="form-group"><label class="form-label">Confirm Password</label><input class="form-input" type="password" placeholder="••••••••"></div>
            <div style="display:flex;justify-content:flex-end">
              <button class="btn btn-primary" onclick="toast('Password updated','success')">Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function showSettingsSection(id, btn) {
  ['users-section','company-section','notif-section','security-section'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = s === id ? '' : 'none';
  });
  btn.closest('div').querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function saveCompanyInfo() {
  const info = {
    name:    document.getElementById('company-name')?.value    || '',
    email:   document.getElementById('company-email')?.value   || '',
    phone:   document.getElementById('company-phone')?.value   || '',
    website: document.getElementById('company-website')?.value || '',
    address: document.getElementById('company-address')?.value || '',
  };
  Store.set('company-info', info);
  toast('Settings saved', 'success');
}
