/* ===========================
   UNBIASED AI — APP.JS
   =========================== */

'use strict';

// ===== STATE =====
let currentUser = null;
let currentPage = 'home';
let charts = {};
let starRating = 0;
let uploadedFile = null;

const DEMO_USERS = {
  admin:   { email: 'admin@unbiasedai.com',   password: 'Admin@123',    name: 'Alexandra Chen',  role: 'admin',   avatar: 'AC' },
  analyst: { email: 'analyst@unbiasedai.com', password: 'Analyst@123',  name: 'Marcus Williams', role: 'analyst', avatar: 'MW' },
  user:    { email: 'user@unbiasedai.com',     password: 'User@123',     name: 'Priya Sharma',    role: 'user',    avatar: 'PS' }
};

const REPORTS_DATA = [
  { id: 'R001', name: 'Hiring Model Audit Q1',    dataset: 'hiring_2024.csv',   date: 'Apr 20, 2025', score: 0.12, status: 'warn' },
  { id: 'R002', name: 'Credit Scoring Analysis',  dataset: 'credit_data.xlsx',  date: 'Apr 15, 2025', score: 0.04, status: 'good' },
  { id: 'R003', name: 'Loan Approval Review',     dataset: 'loans_q1.csv',      date: 'Apr 10, 2025', score: 0.31, status: 'bad'  },
  { id: 'R004', name: 'Insurance Risk Model',     dataset: 'insurance.xlsx',    date: 'Mar 28, 2025', score: 0.08, status: 'good' },
  { id: 'R005', name: 'Recidivism Prediction',    dataset: 'justice_ml.csv',    date: 'Mar 15, 2025', score: 0.27, status: 'bad'  },
  { id: 'R006', name: 'College Admissions Audit', dataset: 'admissions.csv',    date: 'Mar 05, 2025', score: 0.06, status: 'good' },
];

const USERS_DATA = [
  { name: 'Alexandra Chen',  email: 'admin@unbiasedai.com',   role: 'admin',   status: 'active' },
  { name: 'Marcus Williams', email: 'analyst@unbiasedai.com', role: 'analyst', status: 'active' },
  { name: 'Priya Sharma',    email: 'user@unbiasedai.com',     role: 'user',    status: 'active' },
  { name: 'Jordan Lee',      email: 'jordan@example.com',     role: 'analyst', status: 'active' },
  { name: 'Sam Rivera',      email: 'sam@example.com',        role: 'user',    status: 'inactive' },
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeroChart();
  initUploadPage();
  initFeedbackPage();
  initAuthForms();
  initDemoButtons();
  initHamburger();
  initNotifications();
  showPage('home');
});

// ===== NAVIGATION =====
function initNavigation() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-page]');
    if (!link) return;
    e.preventDefault();
    const page = link.dataset.page;

    // Guard auth-required pages
    const authPages = ['dashboard', 'upload', 'results', 'reports', 'feedback', 'admin'];
    if (authPages.includes(page) && !currentUser) {
      showToast('Please login to access this page.', 'warning');
      showPage('login');
      return;
    }
    if (page === 'admin' && currentUser?.role !== 'admin') {
      showToast('Admin access only.', 'error');
      return;
    }
    showPage(page);
  });

  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('sidebar-logout')?.addEventListener('click', logout);
}

function showPage(pageId) {
  // Close mobile menu
  document.getElementById('nav-links')?.classList.remove('open');

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const page = document.getElementById(`page-${pageId}`);
  if (!page) return;
  page.classList.add('active');
  currentPage = pageId;

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pageId);
  });

  // Update sidebar links
  document.querySelectorAll('.sidebar-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pageId);
  });

  // Show/hide navbar scroll
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Page-specific init
  if (pageId === 'dashboard') initDashboard();
  if (pageId === 'results')   initResultCharts();
  if (pageId === 'reports')   initReportsTable();
  if (pageId === 'admin')     initAdminPanel();
}

// ===== HAMBURGER =====
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  btn?.addEventListener('click', () => links?.classList.toggle('open'));
}

// ===== SIDEBAR TOGGLE =====
function toggleSidebar(sidebarId) {
  const sidebar = document.getElementById(sidebarId);
  sidebar?.classList.toggle('open');
}

// ===== NOTIFICATIONS =====
function initNotifications() {
  const btn = document.getElementById('notif-btn');
  const dropdown = document.getElementById('notif-dropdown');
  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('hidden');
  });
  document.addEventListener('click', () => dropdown?.classList.add('hidden'));
}

// ===== AUTH FORMS =====
function initAuthForms() {
  // Register
  const regForm = document.getElementById('register-form');
  regForm?.addEventListener('submit', handleRegister);

  // Password strength
  document.getElementById('reg-pass')?.addEventListener('input', function () {
    updatePasswordStrength(this.value);
  });

  // Toggle password visibility
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', function () {
      const input = this.closest('.input-wrap').querySelector('input');
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      this.querySelector('i').className = `fa-solid fa-eye${isText ? '' : '-slash'}`;
    });
  });

  // Login
  const loginForm = document.getElementById('login-form');
  loginForm?.addEventListener('submit', handleLogin);
}

function handleRegister(e) {
  e.preventDefault();
  clearErrors();
  let valid = true;

  const fname = document.getElementById('reg-fname').value.trim();
  const lname = document.getElementById('reg-lname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const role  = document.getElementById('reg-role').value;
  const pass  = document.getElementById('reg-pass').value;
  const cpass = document.getElementById('reg-cpass').value;
  const terms = document.getElementById('reg-terms').checked;

  if (!fname) { showError('err-fname', 'First name is required.'); valid = false; }
  if (!lname) { showError('err-lname', 'Last name is required.'); valid = false; }
  if (!validateEmail(email)) { showError('err-reg-email', 'Enter a valid email address.'); valid = false; }
  if (!role)  { showError('err-role', 'Please select a role.'); valid = false; }
  if (pass.length < 8) { showError('err-reg-pass', 'Password must be at least 8 characters.'); valid = false; }
  if (pass !== cpass) { showError('err-cpass', 'Passwords do not match.'); valid = false; }
  if (!terms) { showError('err-terms', 'You must accept the terms to continue.'); valid = false; }

  if (!valid) return;

  showLoading('Creating your account...');
  setTimeout(() => {
    hideLoading();
    currentUser = { name: `${fname} ${lname}`, email, role, avatar: `${fname[0]}${lname[0]}`.toUpperCase() };
    updateNavForUser();
    showPage('dashboard');
    showToast(`Welcome, ${fname}! Your account has been created.`, 'success');
  }, 1800);
}

function handleLogin(e) {
  e.preventDefault();
  clearErrors();
  let valid = true;

  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;

  if (!validateEmail(email)) { showError('err-login-email', 'Enter a valid email address.'); valid = false; }
  if (!pass) { showError('err-login-pass', 'Password is required.'); valid = false; }
  if (!valid) return;

  showLoading('Signing you in...');
  setTimeout(() => {
    hideLoading();
    // Match demo accounts
    const matched = Object.values(DEMO_USERS).find(u => u.email === email && u.password === pass);
    if (matched) {
      currentUser = { name: matched.name, email: matched.email, role: matched.role, avatar: matched.avatar };
      updateNavForUser();
      showPage('dashboard');
      showToast(`Welcome back, ${matched.name.split(' ')[0]}!`, 'success');
    } else {
      hideLoading();
      showError('err-login-pass', 'Invalid email or password. Try a demo account.');
    }
  }, 1400);
}

function initDemoButtons() {
  document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      const user = DEMO_USERS[role];
      document.getElementById('login-email').value = user.email;
      document.getElementById('login-pass').value  = user.password;
      showToast(`Demo credentials filled for ${role}.`, 'info');
    });
  });
}

// ===== LOGOUT =====
function logout() {
  currentUser = null;
  updateNavForUser();
  showPage('home');
  showToast('You have been logged out.', 'success');
  // Destroy charts
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} });
  charts = {};
}

// ===== NAV UPDATE =====
function updateNavForUser() {
  const authItems = document.querySelectorAll('.nav-auth-only');
  const adminItems = document.querySelectorAll('.nav-admin-only, .admin-only');
  const guestEl = document.getElementById('nav-guest');
  const userEl  = document.getElementById('nav-user');
  const badgeEl = document.getElementById('user-badge');

  if (currentUser) {
    authItems.forEach(el => el.classList.remove('hidden'));
    guestEl?.classList.add('hidden');
    userEl?.classList.remove('hidden');
    if (badgeEl) badgeEl.textContent = `${currentUser.avatar} — ${capitalize(currentUser.role)}`;

    if (currentUser.role === 'admin') {
      adminItems.forEach(el => el.classList.remove('hidden'));
    } else {
      adminItems.forEach(el => el.classList.add('hidden'));
    }
  } else {
    authItems.forEach(el => el.classList.add('hidden'));
    adminItems.forEach(el => el.classList.add('hidden'));
    guestEl?.classList.remove('hidden');
    userEl?.classList.add('hidden');
  }
}

// ===== DASHBOARD =====
function initDashboard() {
  if (!currentUser) return;

  const greet = document.getElementById('dash-greeting');
  const avatar = document.getElementById('user-avatar');
  if (greet) greet.textContent = `Welcome, ${currentUser.name.split(' ')[0]} 👋`;
  if (avatar) avatar.textContent = currentUser.avatar;

  const dashContent = document.getElementById('dash-content');
  if (!dashContent) return;

  if (currentUser.role === 'admin') {
    dashContent.innerHTML = buildAdminDashboard();
  } else if (currentUser.role === 'analyst') {
    dashContent.innerHTML = buildAnalystDashboard();
  } else {
    dashContent.innerHTML = buildUserDashboard();
  }

  // Render mini charts inside dashboard
  setTimeout(() => {
    renderDashboardCharts(currentUser.role);
  }, 100);
}

function buildUserDashboard() {
  return `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon blue"><i class="fa-solid fa-database"></i></div>
        <div><div class="kpi-val">4</div><div class="kpi-label">Datasets Uploaded</div><div class="kpi-trend up">↑ 1 this month</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon green"><i class="fa-solid fa-file-lines"></i></div>
        <div><div class="kpi-val">7</div><div class="kpi-label">Reports Generated</div><div class="kpi-trend up">↑ 2 this week</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon amber"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div><div class="kpi-val">2</div><div class="kpi-label">Bias Alerts</div><div class="kpi-trend down">↑ 1 unresolved</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon blue"><i class="fa-solid fa-gauge-high"></i></div>
        <div><div class="kpi-val">0.09</div><div class="kpi-label">Avg Bias Score</div><div class="kpi-trend up">↓ Improved</div></div>
      </div>
    </div>
    <div class="dash-row">
      <div class="dash-card">
        <h4>Recent Analyses</h4>
        <table class="recent-table">
          <thead><tr><th>Dataset</th><th>Score</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>hiring_2024.csv</td><td>0.12</td><td><span class="status-pill warn">Moderate</span></td></tr>
            <tr><td>credit_data.xlsx</td><td>0.04</td><td><span class="status-pill good">Compliant</span></td></tr>
            <tr><td>loans_q1.csv</td><td>0.31</td><td><span class="status-pill bad">High Bias</span></td></tr>
            <tr><td>insurance.xlsx</td><td>0.08</td><td><span class="status-pill good">Compliant</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="dash-card">
        <h4>Bias Trend (Last 30 days)</h4>
        <canvas id="dashTrendChart" height="180"></canvas>
      </div>
    </div>
    <div class="dash-row">
      <div class="dash-card">
        <h4>Quick Actions</h4>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
          <button class="btn btn-outline" data-page="upload"><i class="fa-solid fa-cloud-arrow-up"></i> Upload New Dataset</button>
          <button class="btn btn-outline" data-page="results"><i class="fa-solid fa-chart-bar"></i> View Latest Results</button>
          <button class="btn btn-outline" data-page="reports"><i class="fa-solid fa-file-lines"></i> Browse Reports</button>
          <button class="btn btn-outline" data-page="feedback"><i class="fa-solid fa-comment-dots"></i> Give Feedback</button>
        </div>
      </div>
      <div class="dash-card">
        <h4>Metric Summary</h4>
        <canvas id="dashMetricChart" height="180"></canvas>
      </div>
    </div>`;
}

function buildAnalystDashboard() {
  return `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon blue"><i class="fa-solid fa-database"></i></div>
        <div><div class="kpi-val">38</div><div class="kpi-label">Total Datasets</div><div class="kpi-trend up">↑ 6 this month</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon green"><i class="fa-solid fa-circle-check"></i></div>
        <div><div class="kpi-val">29</div><div class="kpi-label">Compliant Models</div><div class="kpi-trend up">↑ 76% pass rate</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon amber"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div><div class="kpi-val">6</div><div class="kpi-label">Flagged Models</div><div class="kpi-trend down">↓ 2 from last week</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon red"><i class="fa-solid fa-circle-xmark"></i></div>
        <div><div class="kpi-val">3</div><div class="kpi-label">Critical Bias Cases</div><div class="kpi-trend down">Needs review</div></div>
      </div>
    </div>
    <div class="dash-row">
      <div class="dash-card">
        <h4>Fairness Score Distribution</h4>
        <canvas id="dashTrendChart" height="180"></canvas>
      </div>
      <div class="dash-card">
        <h4>Metric Compliance Rate</h4>
        <canvas id="dashMetricChart" height="180"></canvas>
      </div>
    </div>
    <div class="dash-card" style="margin-top:0">
      <h4>Models Requiring Attention</h4>
      <table class="recent-table">
        <thead><tr><th>Model</th><th>Owner</th><th>Bias Score</th><th>Critical Metric</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>Loan Approval v2</td><td>Sam Rivera</td><td><span style="color:var(--danger);font-weight:700">0.31</span></td><td>Calibration</td><td><button class="action-btn" onclick="showPage('results')">Review</button></td></tr>
          <tr><td>Recidivism Pred.</td><td>Jordan Lee</td><td><span style="color:var(--danger);font-weight:700">0.27</span></td><td>Eq. Odds</td><td><button class="action-btn" onclick="showPage('results')">Review</button></td></tr>
          <tr><td>Hiring Model Q2</td><td>Priya Sharma</td><td><span style="color:var(--warning);font-weight:700">0.18</span></td><td>Eq. Opportunity</td><td><button class="action-btn" onclick="showPage('results')">Review</button></td></tr>
        </tbody>
      </table>
    </div>`;
}

function buildAdminDashboard() {
  return `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon blue"><i class="fa-solid fa-users"></i></div>
        <div><div class="kpi-val">247</div><div class="kpi-label">Total Users</div><div class="kpi-trend up">↑ 12 this month</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon green"><i class="fa-solid fa-database"></i></div>
        <div><div class="kpi-val">1,842</div><div class="kpi-label">Datasets</div><div class="kpi-trend up">↑ 84 this week</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon amber"><i class="fa-solid fa-file-lines"></i></div>
        <div><div class="kpi-val">3,291</div><div class="kpi-label">Reports</div><div class="kpi-trend up">↑ 211 this month</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon red"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div><div class="kpi-val">14</div><div class="kpi-label">High Bias Cases</div><div class="kpi-trend down">Needs action</div></div>
      </div>
    </div>
    <div class="dash-row">
      <div class="dash-card">
        <h4>Platform Activity (7 days)</h4>
        <canvas id="dashTrendChart" height="180"></canvas>
      </div>
      <div class="dash-card">
        <h4>Users by Role</h4>
        <canvas id="dashMetricChart" height="180"></canvas>
      </div>
    </div>
    <div class="dash-row">
      <div class="dash-card">
        <h4>Recent User Registrations</h4>
        <table class="recent-table">
          <thead><tr><th>Name</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>
            <tr><td>Kenji Tanaka</td><td><span class="role-badge analyst">Analyst</span></td><td>Apr 24</td></tr>
            <tr><td>Amira Hassan</td><td><span class="role-badge user">User</span></td><td>Apr 23</td></tr>
            <tr><td>Carlos Mendez</td><td><span class="role-badge user">User</span></td><td>Apr 22</td></tr>
            <tr><td>Sofia Ivanova</td><td><span class="role-badge analyst">Analyst</span></td><td>Apr 21</td></tr>
          </tbody>
        </table>
      </div>
      <div class="dash-card">
        <h4>Quick Admin Actions</h4>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
          <button class="btn btn-outline" data-page="admin"><i class="fa-solid fa-users-gear"></i> Manage Users</button>
          <button class="btn btn-outline" data-page="reports"><i class="fa-solid fa-file-lines"></i> View All Reports</button>
          <button class="btn btn-outline" onclick="showToast('System health: All services operational.','success')"><i class="fa-solid fa-server"></i> Check System Health</button>
          <button class="btn btn-outline" onclick="showToast('Audit log exported to email.','success')"><i class="fa-solid fa-file-export"></i> Export Audit Log</button>
        </div>
      </div>
    </div>`;
}

function renderDashboardCharts(role) {
  destroyChart('dashTrendChart');
  destroyChart('dashMetricChart');

  const trendCtx = document.getElementById('dashTrendChart');
  const metricCtx = document.getElementById('dashMetricChart');
  if (!trendCtx || !metricCtx) return;

  if (role === 'admin') {
    charts.dashTrend = new Chart(trendCtx, {
      type: 'bar',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [
          { label: 'Uploads', data: [42,58,35,72,61,28,19], backgroundColor: 'rgba(26,79,173,0.7)', borderRadius: 6 },
          { label: 'Reports', data: [30,44,27,55,48,22,15], backgroundColor: 'rgba(37,99,235,0.35)', borderRadius: 6 }
        ]
      },
      options: chartOptions('bar')
    });
    charts.dashMetric = new Chart(metricCtx, {
      type: 'doughnut',
      data: {
        labels: ['Admin','Analyst','User'],
        datasets: [{ data: [8, 62, 177], backgroundColor: ['#dc2626','#d97706','#1a4fad'], borderWidth: 0, hoverOffset: 6 }]
      },
      options: { ...chartOptions('doughnut'), cutout: '68%' }
    });
  } else if (role === 'analyst') {
    charts.dashTrend = new Chart(trendCtx, {
      type: 'bar',
      data: {
        labels: ['0-0.05','0.05-0.1','0.1-0.15','0.15-0.2','0.2-0.3','0.3+'],
        datasets: [{ label: 'Models', data: [12, 9, 7, 4, 4, 3], backgroundColor: ['#16a34a','#16a34a','#d97706','#d97706','#dc2626','#dc2626'], borderRadius: 6 }]
      },
      options: chartOptions('bar')
    });
    charts.dashMetric = new Chart(metricCtx, {
      type: 'doughnut',
      data: {
        labels: ['Compliant','Moderate','High Bias'],
        datasets: [{ data: [29, 6, 3], backgroundColor: ['#16a34a','#d97706','#dc2626'], borderWidth: 0, hoverOffset: 6 }]
      },
      options: { ...chartOptions('doughnut'), cutout: '68%' }
    });
  } else {
    charts.dashTrend = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Apr 1','Apr 5','Apr 10','Apr 15','Apr 20','Apr 24'],
        datasets: [{ label: 'Bias Score', data: [0.21, 0.18, 0.15, 0.13, 0.10, 0.09], borderColor: '#1a4fad', backgroundColor: 'rgba(26,79,173,0.08)', fill: true, tension: 0.4, pointBackgroundColor: '#1a4fad' }]
      },
      options: chartOptions('line')
    });
    charts.dashMetric = new Chart(metricCtx, {
      type: 'bar',
      data: {
        labels: ['Dem. Parity','Eq. Odds','Eq. Opp.','Calibration'],
        datasets: [{ label: 'Score', data: [0.03, 0.18, 0.07, 0.24], backgroundColor: ['#16a34a','#d97706','#16a34a','#dc2626'], borderRadius: 6 }]
      },
      options: { ...chartOptions('bar'), scales: { y: { min: 0, max: 0.4, grid: { color: '#f1f4f9' }, ticks: { font: { size: 11 } } }, x: { grid: { display: false }, ticks: { font: { size: 10 } } } } }
    });
  }
}

// ===== RESULTS CHARTS =====
function initResultCharts() {
  setTimeout(() => {
    destroyChart('parityChart');
    destroyChart('radarChart');
    destroyChart('distChart');
    destroyChart('trendChart');

    const parityCtx = document.getElementById('parityChart');
    if (parityCtx) {
      charts.parity = new Chart(parityCtx, {
        type: 'bar',
        data: {
          labels: ['Male','Female','Non-binary'],
          datasets: [
            { label: 'Positive Rate', data: [0.76, 0.61, 0.69], backgroundColor: ['rgba(26,79,173,0.8)','rgba(220,38,38,0.75)','rgba(217,119,6,0.75)'], borderRadius: 8 }
          ]
        },
        options: { ...chartOptions('bar'), scales: { y: { min: 0, max: 1, ticks: { callback: v => (v*100)+'%', font:{size:11} }, grid:{color:'#f1f4f9'} }, x: { grid:{display:false} } } }
      });
    }

    const radarCtx = document.getElementById('radarChart');
    if (radarCtx) {
      charts.radar = new Chart(radarCtx, {
        type: 'radar',
        data: {
          labels: ['Dem. Parity','Eq. Odds','Eq. Opp.','Calibration','Ind. Fairness','Counterfactual'],
          datasets: [
            { label: 'Model Score', data: [0.97, 0.82, 0.93, 0.76, 0.88, 0.91], fill: true, backgroundColor: 'rgba(26,79,173,0.12)', borderColor: '#1a4fad', pointBackgroundColor: '#1a4fad' },
            { label: 'Threshold', data: [0.90, 0.90, 0.90, 0.90, 0.90, 0.90], fill: false, borderColor: '#dc2626', borderDash: [5,5], pointRadius: 0 }
          ]
        },
        options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 14 } } }, scales: { r: { min: 0.6, max: 1.0, ticks: { stepSize: 0.1, font: { size: 10 } }, pointLabels: { font: { size: 11 } } } } }
      });
    }

    const distCtx = document.getElementById('distChart');
    if (distCtx) {
      charts.dist = new Chart(distCtx, {
        type: 'bar',
        data: {
          labels: ['0.0-0.2','0.2-0.4','0.4-0.6','0.6-0.8','0.8-1.0'],
          datasets: [
            { label: 'Male', data: [12, 18, 22, 35, 48], backgroundColor: 'rgba(26,79,173,0.7)', borderRadius: 4 },
            { label: 'Female', data: [18, 24, 28, 30, 26], backgroundColor: 'rgba(220,38,38,0.6)', borderRadius: 4 }
          ]
        },
        options: chartOptions('bar')
      });
    }

    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
      charts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'],
          datasets: [
            { label: 'Bias Score', data: [0.28,0.25,0.22,0.20,0.18,0.17,0.15,0.14,0.13,0.12], borderColor:'#1a4fad', backgroundColor:'rgba(26,79,173,0.08)', fill:true, tension:0.4, pointRadius:4, pointBackgroundColor:'#1a4fad' },
            { label: 'Threshold', data: Array(10).fill(0.10), borderColor:'#dc2626', borderDash:[5,5], pointRadius:0, fill:false }
          ]
        },
        options: chartOptions('line')
      });
    }

    // Animate score ring
    const ringFill = document.getElementById('ring-fill-circle');
    if (ringFill) {
      setTimeout(() => { ringFill.style.strokeDashoffset = '196'; }, 300);
    }
  }, 100);
}

// ===== HERO CHART =====
function initHeroChart() {
  setTimeout(() => {
    const ctx = document.getElementById('heroChart');
    if (!ctx) return;
    destroyChart('heroChart');
    charts.hero = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['','','','','',''],
        datasets: [{ data: [0.18,0.15,0.13,0.09,0.07,0.05], borderColor:'#1a4fad', backgroundColor:'rgba(26,79,173,0.12)', fill:true, tension:0.5, pointRadius:0, borderWidth:2 }]
      },
      options: { plugins:{legend:{display:false}}, scales:{x:{display:false},y:{display:false}}, animation:{ duration:1200 } }
    });
  }, 400);
}

// ===== REPORTS TABLE =====
function initReportsTable() {
  const tbody = document.getElementById('reports-tbody');
  if (!tbody) return;
  renderReportsTable(REPORTS_DATA);

  document.getElementById('report-search')?.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    const filtered = REPORTS_DATA.filter(r => r.name.toLowerCase().includes(q) || r.dataset.toLowerCase().includes(q));
    renderReportsTable(filtered);
  });

  document.getElementById('report-filter')?.addEventListener('change', function () {
    const val = this.value;
    let filtered = REPORTS_DATA;
    if (val === 'High Bias') filtered = REPORTS_DATA.filter(r => r.status === 'bad');
    if (val === 'Compliant') filtered = REPORTS_DATA.filter(r => r.status === 'good');
    renderReportsTable(filtered);
  });

  document.getElementById('gen-report-btn')?.addEventListener('click', () => {
    showLoading('Generating report...');
    setTimeout(() => {
      hideLoading();
      showToast('New report generated successfully!', 'success');
      const newReport = {
        id: 'R00' + (REPORTS_DATA.length + 1),
        name: 'Auto-Generated Audit ' + new Date().toLocaleDateString(),
        dataset: 'latest_dataset.csv',
        date: 'Apr 24, 2025',
        score: +(Math.random() * 0.3).toFixed(2),
        status: 'good'
      };
      REPORTS_DATA.unshift(newReport);
      renderReportsTable(REPORTS_DATA);
    }, 2000);
  });
}

function renderReportsTable(data) {
  const tbody = document.getElementById('reports-tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(r => `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td><i class="fa-solid fa-file-csv" style="color:var(--success);margin-right:6px"></i>${r.dataset}</td>
      <td>${r.date}</td>
      <td><span style="font-weight:700;color:${r.status==='bad'?'var(--danger)':r.status==='warn'?'var(--warning)':'var(--success)'}">${r.score}</span></td>
      <td><span class="status-pill ${r.status==='bad'?'bad':r.status==='warn'?'warn':'good'}">${r.status==='bad'?'High Bias':r.status==='warn'?'Moderate':'Compliant'}</span></td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="viewReport('${r.id}')"><i class="fa-solid fa-eye"></i> View</button>
          <button class="action-btn" onclick="downloadReport('${r.id}')"><i class="fa-solid fa-download"></i></button>
          <button class="action-btn danger" onclick="deleteReport('${r.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function viewReport(id) {
  showToast(`Opening report ${id}...`, 'info');
  setTimeout(() => showPage('results'), 500);
}
function downloadReport(id) { showToast(`Report ${id} downloaded as PDF.`, 'success'); }
function deleteReport(id) {
  const idx = REPORTS_DATA.findIndex(r => r.id === id);
  if (idx > -1) { REPORTS_DATA.splice(idx, 1); renderReportsTable(REPORTS_DATA); }
  showToast(`Report ${id} deleted.`, 'warning');
}

// ===== ADMIN PANEL =====
function initAdminPanel() {
  const tbody = document.getElementById('users-tbody');
  if (tbody) {
    tbody.innerHTML = USERS_DATA.map(u => `
      <tr>
        <td><div style="display:flex;align-items:center;gap:10px"><div class="user-avatar" style="width:30px;height:30px;font-size:0.75rem">${u.name.split(' ').map(n=>n[0]).join('')}</div><strong>${u.name}</strong></div></td>
        <td>${u.email}</td>
        <td><span class="role-badge ${u.role}">${capitalize(u.role)}</span></td>
        <td><span class="status-pill ${u.status==='active'?'good':'warn'}">${capitalize(u.status)}</span></td>
        <td>
          <div class="table-actions">
            <button class="action-btn" onclick="editUser('${u.email}')"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn danger" onclick="removeUser('${u.email}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>`).join('');
  }

  document.getElementById('add-user-btn')?.addEventListener('click', () => {
    showToast('Add user modal would open here.', 'info');
  });

  setTimeout(() => {
    destroyChart('activityChart');
    const ctx = document.getElementById('activityChart');
    if (ctx) {
      charts.activity = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
          datasets: [
            { label: 'Analyses Run', data: [34,51,42,68,57,23,18], borderColor:'#1a4fad', backgroundColor:'rgba(26,79,173,0.08)', fill:true, tension:0.4, pointRadius:4, pointBackgroundColor:'#1a4fad' },
            { label: 'New Users', data: [5,8,4,12,9,3,2], borderColor:'#16a34a', backgroundColor:'rgba(22,163,74,0.06)', fill:true, tension:0.4, pointRadius:4, pointBackgroundColor:'#16a34a' }
          ]
        },
        options: chartOptions('line')
      });
    }
  }, 100);
}

function editUser(email) { showToast(`Edit modal for ${email} would open.`, 'info'); }
function removeUser(email) {
  const idx = USERS_DATA.findIndex(u => u.email === email);
  if (idx > -1) { USERS_DATA.splice(idx, 1); initAdminPanel(); }
  showToast(`User ${email} removed.`, 'warning');
}

// ===== UPLOAD PAGE =====
function initUploadPage() {
  const zone     = document.getElementById('upload-zone');
  const input    = document.getElementById('file-input');
  const browseBtn= document.getElementById('browse-btn');
  const runBtn   = document.getElementById('run-analysis-btn');

  browseBtn?.addEventListener('click', () => input?.click());
  zone?.addEventListener('click', (e) => { if (e.target !== browseBtn) input?.click(); });

  zone?.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone?.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone?.addEventListener('drop', (e) => {
    e.preventDefault(); zone.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileUpload(file);
  });

  input?.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) handleFileUpload(file);
  });

  runBtn?.addEventListener('click', handleRunAnalysis);
}

function handleFileUpload(file) {
  const allowed = ['text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel'];
  const extOk   = file.name.match(/\.(csv|xlsx|xls)$/i);
  if (!extOk) { showToast('Only CSV and Excel files are supported.', 'error'); return; }
  if (file.size > 52428800) { showToast('File exceeds 50MB limit.', 'error'); return; }

  uploadedFile = file;
  const sizeLabel = file.size > 1048576 ? (file.size/1048576).toFixed(1)+' MB' : (file.size/1024).toFixed(0)+' KB';

  document.getElementById('upload-zone').classList.add('hidden');
  const progressEl = document.getElementById('upload-progress');
  progressEl.classList.remove('hidden');
  document.getElementById('file-name-display').textContent = file.name;
  document.getElementById('file-size-display').textContent = sizeLabel;

  simulateUpload();
}

function simulateUpload() {
  const bar     = document.getElementById('progress-bar');
  const pctEl   = document.getElementById('progress-pct');
  const statusEl= document.getElementById('progress-status');
  const config  = document.getElementById('upload-config');
  let pct = 0;

  const stages = [
    { target:30, label:'Uploading file...' },
    { target:60, label:'Validating schema...' },
    { target:85, label:'Detecting columns...' },
    { target:100, label:'Ready!' }
  ];
  let stageIdx = 0;

  const interval = setInterval(() => {
    pct += Math.random() * 5 + 2;
    if (pct > 100) pct = 100;

    if (stageIdx < stages.length && pct >= stages[stageIdx].target) {
      statusEl.textContent = stages[stageIdx].label;
      stageIdx++;
    }

    bar.style.width = pct + '%';
    pctEl.textContent = Math.floor(pct) + '%';

    if (pct >= 100) {
      clearInterval(interval);
      statusEl.textContent = 'Upload complete!';
      bar.style.background = 'var(--success)';
      setTimeout(() => {
        config.style.display = 'block';
        config.style.animation = 'none';
        showToast('Dataset uploaded! Configure and run your analysis.', 'success');
      }, 500);
    }
  }, 120);
}

function handleRunAnalysis() {
  const target = document.getElementById('target-col').value;
  const prot   = document.getElementById('protected-attr').value;
  if (!target || target.includes('Select')) { showToast('Please select a target column.', 'warning'); return; }
  if (!prot || prot.includes('Select'))   { showToast('Please select a protected attribute.', 'warning'); return; }

  showLoading('Running bias analysis...');
  const steps = ['Preprocessing data...','Computing fairness metrics...','Generating visualizations...','Building report...'];
  let i = 0;
  const loaderText = document.querySelector('.loader-text');
  const interval = setInterval(() => {
    if (loaderText && steps[i]) loaderText.textContent = steps[i++];
    if (i >= steps.length) { clearInterval(interval); }
  }, 900);

  setTimeout(() => {
    hideLoading();
    showToast('Bias analysis complete! View your results.', 'success');
    showPage('results');
    setTimeout(resetUploadPage, 500);
  }, 4000);
}

function resetUploadPage() {
  const zone = document.getElementById('upload-zone');
  const prog = document.getElementById('upload-progress');
  const conf = document.getElementById('upload-config');
  const bar  = document.getElementById('progress-bar');
  zone?.classList.remove('hidden');
  prog?.classList.add('hidden');
  if (conf) conf.style.display = 'none';
  if (bar)  { bar.style.width = '0'; bar.style.background = 'var(--primary)'; }
  const input = document.getElementById('file-input');
  if (input) input.value = '';
  uploadedFile = null;
}

// ===== FEEDBACK PAGE =====
function initFeedbackPage() {
  // Type tabs
  document.querySelectorAll('.type-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Star rating
  const stars = document.querySelectorAll('#star-rating i');
  stars.forEach((star, idx) => {
    star.addEventListener('click', () => {
      starRating = idx + 1;
      stars.forEach((s, i) => {
        s.className = i < starRating ? 'fa-star fa-solid active' : 'fa-star fa-regular';
      });
    });
    star.addEventListener('mouseenter', () => {
      stars.forEach((s, i) => s.className = i <= idx ? 'fa-star fa-solid active' : 'fa-star fa-regular');
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach((s, i) => s.className = i < starRating ? 'fa-star fa-solid active' : 'fa-star fa-regular');
    });
  });

  // Submit feedback
  document.getElementById('feedback-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = document.getElementById('fb-subject')?.value.trim();
    const message = document.getElementById('fb-message')?.value.trim();
    if (!subject) { showToast('Please enter a subject.', 'warning'); return; }
    if (!message) { showToast('Please enter a message.', 'warning'); return; }
    if (!starRating) { showToast('Please select a rating.', 'warning'); return; }

    showLoading('Submitting feedback...');
    setTimeout(() => {
      hideLoading();
      const type = document.querySelector('.type-tab.active')?.dataset.type || 'general';
      const stars = '★'.repeat(starRating) + '☆'.repeat(5 - starRating);
      const fbList = document.getElementById('fb-list');
      if (fbList) {
        const item = document.createElement('div');
        item.className = 'fb-item';
        item.innerHTML = `
          <div class="fb-meta">
            <span class="fb-type ${type}">${capitalize(type)}</span>
            <div class="fb-stars">${stars}</div>
            <span class="fb-date">Just now</span>
          </div>
          <h4>${subject}</h4>
          <p>${message}</p>`;
        fbList.prepend(item);
      }
      document.getElementById('fb-subject').value = '';
      document.getElementById('fb-message').value = '';
      starRating = 0;
      document.querySelectorAll('#star-rating i').forEach(s => s.className = 'fa-star fa-regular');
      showToast('Thank you for your feedback!', 'success');
    }, 1200);
  });
}

// ===== PASSWORD STRENGTH =====
function updatePasswordStrength(pass) {
  const bar = document.querySelector('.strength-bar');
  if (!bar) return;
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  bar.className = `strength-bar strength-${score}`;
}

// ===== CHART HELPERS =====
function chartOptions(type) {
  const base = {
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 14, padding: 12 } } },
    responsive: true,
    maintainAspectRatio: true,
  };
  if (type === 'bar' || type === 'line') {
    base.scales = {
      y: { grid: { color: '#f1f4f9' }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } }
    };
  }
  return base;
}

function destroyChart(id) {
  const key = id.replace('Chart','').replace('Chart','');
  // Try to destroy from charts map
  if (charts[id]) { try { charts[id].destroy(); } catch(e){} delete charts[id]; }
  // Also destroy via Chart.js registry
  const existing = Chart.getChart(document.getElementById(id));
  if (existing) existing.destroy();
}

// ===== TOAST =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span class="toast-msg">${message}</span><button class="toast-close"><i class="fa-solid fa-xmark"></i></button>`;
  container.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
  setTimeout(() => removeToast(toast), 4500);
}

function removeToast(toast) {
  toast.style.animation = 'slideOut 0.3s ease forwards';
  setTimeout(() => toast.remove(), 300);
}

// ===== LOADING =====
function showLoading(text = 'Processing...') {
  const overlay = document.getElementById('loading-overlay');
  const textEl  = overlay?.querySelector('.loader-text');
  if (textEl) textEl.textContent = text;
  overlay?.classList.remove('hidden');
}
function hideLoading() {
  document.getElementById('loading-overlay')?.classList.add('hidden');
}

// ===== VALIDATION HELPERS =====
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function showError(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
function clearErrors() { document.querySelectorAll('.field-error').forEach(el => el.textContent = ''); }
function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.style.boxShadow = window.scrollY > 10 ? 'var(--shadow-md)' : 'var(--shadow-sm)';
});

// ===== EXPOSE GLOBALS =====
window.showPage   = showPage;
window.logout     = logout;
window.toggleSidebar = toggleSidebar;
window.viewReport    = viewReport;
window.downloadReport= downloadReport;
window.deleteReport  = deleteReport;
window.editUser      = editUser;
window.removeUser    = removeUser;
window.showToast     = showToast;