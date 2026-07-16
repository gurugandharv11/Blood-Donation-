/**
 * dashboard.js - Dashboard page logic
 * Loads stats, recent requests, recent donors based on user role
 */

document.addEventListener('DOMContentLoaded', () => {
  initProtectedPage();
  const user = Auth.getUser();
  if (!user) return;

  renderSidebar(user);
  renderDashboardHeader(user);

  if (Auth.isAdmin()) {
    loadAdminDashboard();
  } else if (Auth.isDonor()) {
    loadDonorDashboard();
  } else {
    loadSeekerDashboard();
  }
});

// ============ SIDEBAR ============
function renderSidebar(user) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const adminItems = `
    <a href="dashboard.html" class="sidebar-nav-item active" data-page="dashboard">
      <i class="bi bi-grid-1x2"></i> Dashboard
    </a>
    <a href="donors.html" class="sidebar-nav-item" data-page="donors">
      <i class="bi bi-people"></i> Donors
    </a>
    <a href="requests.html" class="sidebar-nav-item" data-page="requests">
      <i class="bi bi-droplet"></i> Blood Requests
    </a>
    <div class="sidebar-section-label">Management</div>
    <a href="#" class="sidebar-nav-item" onclick="loadUsersSection()">
      <i class="bi bi-person-gear"></i> Users
    </a>
    <a href="#" class="sidebar-nav-item" onclick="loadDonationsSection()">
      <i class="bi bi-heart-pulse"></i> Donations
    </a>
  `;

  const donorItems = `
    <a href="dashboard.html" class="sidebar-nav-item active" data-page="dashboard">
      <i class="bi bi-grid-1x2"></i> Dashboard
    </a>
    <a href="requests.html" class="sidebar-nav-item" data-page="requests">
      <i class="bi bi-droplet"></i> Blood Requests
    </a>
    <a href="profile.html" class="sidebar-nav-item" data-page="profile">
      <i class="bi bi-person-circle"></i> My Profile
    </a>
  `;

  const seekerItems = `
    <a href="dashboard.html" class="sidebar-nav-item active" data-page="dashboard">
      <i class="bi bi-grid-1x2"></i> Dashboard
    </a>
    <a href="donors.html" class="sidebar-nav-item" data-page="donors">
      <i class="bi bi-search-heart"></i> Find Donors
    </a>
    <a href="requests.html" class="sidebar-nav-item" data-page="requests">
      <i class="bi bi-file-earmark-plus"></i> My Requests
    </a>
    <a href="profile.html" class="sidebar-nav-item" data-page="profile">
      <i class="bi bi-person-circle"></i> My Profile
    </a>
  `;

  const navItems = Auth.isAdmin() ? adminItems : Auth.isDonor() ? donorItems : seekerItems;

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div style="font-size:1.2rem;font-weight:800;color:#fff;">
        <span style="color:#E74C3C;">Blood</span>Donation
      </div>
      <div style="font-size:0.7rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;margin-top:2px;">
        Platform
      </div>
    </div>
    <div class="sidebar-nav">
      ${navItems}
      <div style="margin-top:auto;padding-top:1rem;border-top:1px solid rgba(255,255,255,0.06);margin-top:2rem;">
        <button class="sidebar-nav-item" onclick="logout()" style="color:rgba(255,100,100,0.8);">
          <i class="bi bi-box-arrow-left"></i> Logout
        </button>
      </div>
    </div>
  `;
}

// ============ HEADER ============
function renderDashboardHeader(user) {
  const header = document.getElementById('dashboardHeader');
  if (!header) return;

  const roleLabels = {
    'ROLE_ADMIN': 'Administrator',
    'ROLE_DONOR': 'Donor',
    'ROLE_SEEKER': 'Blood Seeker'
  };

  header.innerHTML = `
    <div class="page-header" style="border-bottom:none;margin-bottom:0;">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h1 style="font-size:1.75rem;font-weight:800;color:#1A1A2E;letter-spacing:-0.5px;">
            Welcome back, ${escapeHtml(user.name.split(' ')[0])}
          </h1>
          <p style="color:#6C757D;font-size:0.9rem;margin:0;">
            ${roleLabels[user.role] || 'User'} &bull; ${new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}
          </p>
        </div>
        <div class="d-flex align-items-center gap-3">
          ${renderAvatar(user.name, null, 44)}
          <div>
            <div style="font-size:0.875rem;font-weight:700;color:#1A1A2E;">${escapeHtml(user.name)}</div>
            <div style="font-size:0.75rem;color:#6C757D;">${escapeHtml(user.email)}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============ ADMIN DASHBOARD ============
async function loadAdminDashboard() {
  showSpinner('Loading dashboard...');
  try {
    const res = await adminApi.getDashboard();
    const stats = res.data;
    renderAdminStats(stats);
    await Promise.all([loadRecentRequests(), loadRecentDonors()]);
  } catch (err) {
    showError('Failed to load dashboard: ' + err.message);
  } finally {
    hideSpinner();
  }
}

function renderAdminStats(stats) {
  const container = document.getElementById('statsContainer');
  if (!container || !stats) return;

  const cards = [
    { label: 'Total Users',        value: stats.totalUsers,        icon: 'bi-people-fill',       accent: 'blue',   trend: '+' },
    { label: 'Total Donors',       value: stats.totalDonors,       icon: 'bi-heart-fill',         accent: 'red',    trend: '' },
    { label: 'Available Donors',   value: stats.availableDonors,   icon: 'bi-check-circle-fill',  accent: 'green',  trend: '' },
    { label: 'Total Requests',     value: stats.totalRequests,     icon: 'bi-droplet-fill',        accent: 'orange', trend: '' },
    { label: 'Pending Requests',   value: stats.pendingRequests,   icon: 'bi-clock-fill',          accent: 'orange', trend: '' },
    { label: 'Accepted Requests',  value: stats.acceptedRequests,  icon: 'bi-hand-thumbs-up-fill', accent: 'teal',   trend: '' },
    { label: 'Completed Donations',value: stats.completedDonations,icon: 'bi-award-fill',          accent: 'green',  trend: '' },
  ];

  container.innerHTML = cards.map(c => `
    <div class="col-12 col-sm-6 col-xl-4">
      <div class="stat-card accent-${c.accent}">
        <div class="card-icon"><i class="bi ${c.icon}"></i></div>
        <div class="card-value" id="count-${c.label.replace(/ /g,'-')}">${formatNumber(c.value)}</div>
        <div class="card-label">${c.label}</div>
      </div>
    </div>
  `).join('');

  // Animate counters
  cards.forEach(c => {
    animateCounter(
      document.getElementById(`count-${c.label.replace(/ /g,'-')}`),
      c.value
    );
  });
}

function animateCounter(el, target) {
  if (!el || !target) return;
  let start = 0;
  const duration = 1200;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = formatNumber(Math.floor(start));
    if (start >= target) clearInterval(timer);
  }, 16);
}

// ============ DONOR DASHBOARD ============
async function loadDonorDashboard() {
  showSpinner('Loading your dashboard...');
  const user = Auth.getUser();
  try {
    const [pendingRes] = await Promise.all([
      requestApi.getPending(0, 5)
    ]);

    renderDonorStats(user);
    renderPendingRequestsTable(pendingRes.data?.content || []);
  } catch (err) {
    showError('Failed to load dashboard: ' + err.message);
  } finally {
    hideSpinner();
  }
}

function renderDonorStats(user) {
  const container = document.getElementById('statsContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="col-12 col-sm-6 col-xl-4">
      <div class="stat-card accent-red">
        <div class="card-icon"><i class="bi bi-heart-fill"></i></div>
        <div class="card-value">Ready</div>
        <div class="card-label">Your Donor Status</div>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-4">
      <div class="stat-card accent-blue">
        <div class="card-icon"><i class="bi bi-droplet-fill"></i></div>
        <div class="card-value" id="pendingCount">...</div>
        <div class="card-label">Pending Requests Near You</div>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-4">
      <div class="stat-card accent-green">
        <div class="card-icon"><i class="bi bi-award-fill"></i></div>
        <div class="card-value">--</div>
        <div class="card-label">Total Donations</div>
      </div>
    </div>
  `;

  // Load donor-specific stats
  if (user.donorId) {
    donorApi.getById(user.donorId).then(res => {
      const donor = res.data;
      if (!donor) return;
      const countEl = document.getElementById('pendingCount');
      const lastDonEl = document.querySelectorAll('.card-value')[2];
      if (lastDonEl) lastDonEl.textContent = donor.totalDonations || 0;
    }).catch(() => {});
  }
}

// ============ SEEKER DASHBOARD ============
async function loadSeekerDashboard() {
  showSpinner('Loading your dashboard...');
  try {
    const myReqRes = await requestApi.getMy(0, 5);
    const myRequests = myReqRes.data?.content || [];

    renderSeekerStats(myRequests);
    renderMyRequestsTable(myRequests);
  } catch (err) {
    showError('Failed to load dashboard: ' + err.message);
  } finally {
    hideSpinner();
  }
}

function renderSeekerStats(requests) {
  const pending   = requests.filter(r => r.status === 'PENDING').length;
  const accepted  = requests.filter(r => r.status === 'ACCEPTED').length;
  const completed = requests.filter(r => r.status === 'COMPLETED').length;

  const container = document.getElementById('statsContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="col-12 col-sm-6 col-xl-3">
      <div class="stat-card accent-orange">
        <div class="card-icon"><i class="bi bi-clock-fill"></i></div>
        <div class="card-value">${pending}</div>
        <div class="card-label">Pending Requests</div>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
      <div class="stat-card accent-blue">
        <div class="card-icon"><i class="bi bi-check-circle-fill"></i></div>
        <div class="card-value">${accepted}</div>
        <div class="card-label">Accepted</div>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
      <div class="stat-card accent-green">
        <div class="card-icon"><i class="bi bi-award-fill"></i></div>
        <div class="card-value">${completed}</div>
        <div class="card-label">Completed</div>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
      <div class="stat-card accent-red">
        <div class="card-icon"><i class="bi bi-droplet-fill"></i></div>
        <div class="card-value">${requests.length}</div>
        <div class="card-label">Total Requests</div>
      </div>
    </div>
  `;
}

// ============ TABLES ============
async function loadRecentRequests() {
  try {
    const res = await adminApi.getRequests(0, 5);
    renderPendingRequestsTable(res.data?.content || []);
  } catch {}
}

async function loadRecentDonors() {
  try {
    const res = await adminApi.getDonors(0, 5);
    renderRecentDonorsTable(res.data?.content || []);
  } catch {}
}

function renderPendingRequestsTable(requests) {
  const el = document.getElementById('recentRequestsTable');
  if (!el) return;

  if (!requests.length) {
    el.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No blood requests found</td></tr>`;
    return;
  }

  el.innerHTML = requests.map(r => `
    <tr>
      <td>${escapeHtml(r.patientName)}</td>
      <td>${getBloodGroupBadge(r.bloodGroup)}</td>
      <td>${escapeHtml(r.city)}</td>
      <td>${getUrgencyBadge(r.urgency)}</td>
      <td>${getStatusBadge(r.status)}</td>
      <td>${formatDate(r.createdAt)}</td>
    </tr>
  `).join('');
}

function renderMyRequestsTable(requests) {
  const el = document.getElementById('recentRequestsTable');
  if (!el) return;

  if (!requests.length) {
    el.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No blood requests yet. <a href="requests.html">Create one</a></td></tr>`;
    return;
  }

  el.innerHTML = requests.map(r => `
    <tr>
      <td>${escapeHtml(r.patientName)}</td>
      <td>${getBloodGroupBadge(r.bloodGroup)}</td>
      <td>${getUrgencyBadge(r.urgency)}</td>
      <td>${getStatusBadge(r.status)}</td>
      <td>${formatDate(r.createdAt)}</td>
    </tr>
  `).join('');
}

function renderRecentDonorsTable(donors) {
  const el = document.getElementById('recentDonorsTable');
  if (!el) return;

  if (!donors.length) {
    el.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No donors found</td></tr>`;
    return;
  }

  el.innerHTML = donors.map(d => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-2">
          ${renderAvatar(d.name, d.profilePhoto, 36)}
          <div>
            <div style="font-weight:600;font-size:0.875rem;">${escapeHtml(d.name)}</div>
            <div style="font-size:0.75rem;color:#6C757D;">${escapeHtml(d.email)}</div>
          </div>
        </div>
      </td>
      <td>${getBloodGroupBadge(d.bloodGroup)}</td>
      <td>${escapeHtml(d.city || '--')}</td>
      <td>${getAvailabilityBadge(d.available)}</td>
    </tr>
  `).join('');
}

// Admin: Load users section in dashboard
async function loadUsersSection() {
  const content = document.getElementById('dashboardMainContent');
  if (!content) return;

  content.innerHTML = `
    <div class="page-header"><h1>All Users</h1></div>
    <div class="table-card">
      <div class="table-header">
        <span class="table-title">Registered Users</span>
      </div>
      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            <tr><td colspan="7" class="text-center py-4">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  try {
    const res = await adminApi.getUsers(0, 20);
    const users = res.data?.content || [];
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No users found</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.phone || '--')}</td>
        <td><span style="font-size:0.75rem;font-weight:600;color:#2980B9;">${u.role?.replace('ROLE_','')}</span></td>
        <td>${u.active ? '<span class="badge-custom badge-available">Active</span>' : '<span class="badge-custom badge-unavailable">Inactive</span>'}</td>
        <td>${formatDate(u.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" onclick="toggleUserStatus(${u.id})">
            ${u.active ? 'Deactivate' : 'Activate'}
          </button>
          <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteUserAdmin(${u.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showError('Failed to load users: ' + err.message);
  }
}

async function deleteUserAdmin(userId) {
  const ok = await confirmAction('Are you sure you want to delete this user? This action cannot be undone.');
  if (!ok) return;
  try {
    await adminApi.deleteUser(userId);
    showSuccess('User deleted successfully');
    loadUsersSection();
  } catch (err) {
    showError(err.message);
  }
}

async function toggleUserStatus(userId) {
  try {
    await adminApi.toggleUser(userId);
    showSuccess('User status updated');
    loadUsersSection();
  } catch (err) {
    showError(err.message);
  }
}

async function loadDonationsSection() {
  const content = document.getElementById('dashboardMainContent');
  if (!content) return;

  content.innerHTML = `
    <div class="page-header"><h1>Donation History</h1></div>
    <div class="table-card">
      <div class="table-header">
        <span class="table-title">Completed Donations</span>
      </div>
      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Donor</th><th>Patient</th><th>Blood Group</th><th>Hospital</th><th>Units</th><th>Date</th>
            </tr>
          </thead>
          <tbody id="donationsTableBody">
            <tr><td colspan="6" class="text-center py-4">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  try {
    const res = await adminApi.getDonations(0, 20);
    const donations = res.data?.content || [];
    const tbody = document.getElementById('donationsTableBody');
    if (!tbody) return;

    if (!donations.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No donations recorded yet</td></tr>';
      return;
    }

    tbody.innerHTML = donations.map(d => `
      <tr>
        <td><strong>${escapeHtml(d.donorName)}</strong></td>
        <td>${escapeHtml(d.patientName)}</td>
        <td>${getBloodGroupBadge(d.bloodGroup)}</td>
        <td>${escapeHtml(d.hospitalName)}</td>
        <td>${d.unitsDonated} unit${d.unitsDonated !== 1 ? 's' : ''}</td>
        <td>${formatDate(d.donationDate)}</td>
      </tr>
    `).join('');
  } catch (err) {
    showError('Failed to load donations: ' + err.message);
  }
}
