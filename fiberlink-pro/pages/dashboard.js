function renderDashboard(container) {
  const totalClients = DB.clients.length;
  const activeClients = DB.clients.filter(c => c.status === 'active').length;
  const suspended = DB.clients.filter(c => c.status === 'suspended').length;
  const monthlyRevenue = DB.payments.filter(p => p.status === 'paid').reduce((a, b) => a + b.amount, 0);
  const pending = DB.payments.filter(p => p.status === 'pending' || p.status === 'overdue').length;
  const totalPlanClients = DB.plans.reduce((sum, plan) => sum + plan.clients, 0);

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Panel de Control</h1>
        <p class="page-subtitle">Bienvenido de vuelta, Marcus · ${new Date().toLocaleDateString('es-ES',{weekday:'long',month:'long',day:'numeric'})}</p>
      </div>
      <button class="btn btn-primary" onclick="navigate('clients')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Nuevo Cliente
      </button>
    </div>

    <div class="grid-4" style="margin-bottom:16px">
      ${kpiCard('Total de Clientes',totalClients,'users','blue','+8.2%','up')}
      ${kpiCard('Clientes Activos',activeClients,'activity','green','+5.1%','up')}
      ${kpiCard('Suspendidos',suspended,'pause-circle','red','+2','down')}
      ${kpiCard('Ingresos Mensuales',formatCurrency(monthlyRevenue),'dollar-sign','cyan','+12.4%','up')}
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-col">
        <div class="chart-card chart-card-compact">
          <div class="card-header">
            <span class="card-title">Crecimiento de Ingresos</span>
            <div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-sm" style="color:var(--accent-blue-light);background:var(--accent-blue-dim)">Este Año</button>
              <button class="btn btn-ghost btn-sm">Año Pasado</button>
            </div>
          </div>
          <div class="chart-wrapper compact-chart">
            <canvas id="revenueChart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">Clientes Recientes</span>
            <button class="btn btn-ghost btn-sm" onclick="navigate('clients')">Ver todos</button>
          </div>
          <div class="table-container">
            <table>
              <thead><tr>
                <th>Cliente</th><th>Plan</th><th>Fecha de Inscripción</th><th>Estado</th>
              </tr></thead>
              <tbody>
                ${DB.clients.slice(0,5).map(c => `<tr>
                  <td><div style="display:flex;align-items:center;gap:8px">${avatarEl(c.avatar,'avatar-sm')}<span style="font-weight:500">${c.name}</span></div></td>
                  <td><span style="font-size:12px;color:var(--text-secondary)">${c.plan}</span></td>
                  <td><span style="font-size:12px;color:var(--text-secondary)">${formatDate(c.joined)}</span></td>
                  <td>${statusBadge(c.status)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="dashboard-col">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">Tipo de Conexión</span>
          </div>
          <div style="position:relative;height:180px;display:flex;align-items:center;justify-content:center">
            <canvas id="donutChart"></canvas>
            <div style="position:absolute;text-align:center;pointer-events:none">
              <div style="font-size:22px;font-weight:800">${totalClients}</div>
              <div style="font-size:11px;color:var(--text-secondary)">Total</div>
            </div>
          </div>
          <div class="donut-legend">
            ${[['Fibra Óptica','#2563eb','79%'],['Inalámbrico','#8b5cf6','21%']].map(([l,c,v]) => `
              <div class="legend-item">
                <div class="legend-label"><div class="legend-dot" style="background:${c}"></div>${l}</div>
                <div class="legend-value">${v}</div>
              </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">Distribución de Planes</span></div>
          ${DB.plans.map(p => {
            const pct = totalPlanClients ? Math.round(p.clients / totalPlanClients * 100) : 0;
            return `<div style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:12px;color:var(--text-secondary)">${p.name}</span>
                <span style="font-size:12px;font-weight:600">${p.clients}</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${p.color}"></div></div>
            </div>`;
          }).join('')}
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">Quick Actions</span></div>
          <div class="quick-actions">
            ${[
              ['New Client','clients','<path d="M12 5v14M5 12h14"/>'],
              ['New Plan','plans','<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'],
              ['Payments','payments','<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>'],
              ['Reports','reports','<path d="M18 20V10M12 20V4M6 20v-6"/>']
            ].map(([lbl,pg,svgPath]) => `
              <button class="quick-action-btn" onclick="navigate('${pg}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${svgPath}</svg>
                ${lbl}
              </button>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">Pending Payments</span></div>
          <div style="text-align:center;padding:8px 0">
            <div style="font-size:28px;font-weight:800;color:var(--accent-yellow)">${pending}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">Require attention</div>
          </div>
          <button class="btn btn-secondary w-full" style="margin-top:10px" onclick="navigate('payments')">View Payments</button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initRevenueChart();
    initDonutChart();
  }, 50);
}

function kpiCard(label, value, icon, color, trend, dir) {
  const svgPaths = {
    'users': '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
    'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    'pause-circle': '<circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/>',
    'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/>'
  };
  const arrow = dir === 'up'
    ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>'
    : '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>';
  return `<div class="kpi-card ${color}">
    <div class="kpi-header">
      <div class="kpi-icon ${color}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${svgPaths[icon]||''}</svg>
      </div>
      <div class="kpi-trend ${dir}">${arrow}${trend}</div>
    </div>
    <div class="kpi-value">${value}</div>
    <div class="kpi-label">${label}</div>
  </div>`;
}

function initRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  const data = DB.revenueMonthly;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.month),
      datasets: [{
        label: 'Revenue',
        data: data.map(d => d.revenue),
        fill: true,
        borderColor: '#2563eb',
        backgroundColor: (ctx2) => {
          const g = ctx2.chart.ctx.createLinearGradient(0, 0, 0, 220);
          g.addColorStop(0, 'rgba(37,99,235,0.2)');
          g.addColorStop(1, 'rgba(37,99,235,0)');
          return g;
        },
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#2563eb',
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: '#131929', borderColor: '#1e2d45', borderWidth: 1,
        titleColor: '#f0f4ff', bodyColor: '#8899bb', padding: 10,
        callbacks: { label: ctx => formatCurrency(ctx.raw) }
      }},
      scales: {
        x: { grid: { color: '#1e2d45' }, ticks: { color: '#8899bb', font: { size: 11 } } },
        y: { grid: { color: '#1e2d45' }, ticks: { color: '#8899bb', font: { size: 11 }, callback: v => 'S/' + (v/1000).toFixed(0) + 'k' } }
      }
    }
  });
}

function initDonutChart() {
  const ctx = document.getElementById('donutChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Fiber Optic','Wireless'],
      datasets: [{ data: [980, 260], backgroundColor: ['#2563eb','#8b5cf6'], borderWidth: 0, hoverOffset: 4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '75%',
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: '#131929', borderColor: '#1e2d45', borderWidth: 1,
        titleColor: '#f0f4ff', bodyColor: '#8899bb'
      }}
    }
  });
}
