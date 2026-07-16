/**
 * utils.js - Shared utility functions
 * Toast notifications, loading spinner, helpers, session management
 */

// ============ CONSTANTS ============
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const REQUEST_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];

// ============ TOAST NOTIFICATIONS ============
let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show a toast notification.
 * @param {string} message - Message to display
 * @param {'success'|'error'|'warning'|'info'} type - Toast type
 * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 */
function showToast(message, type = 'info', duration = 4000) {
  const icons = {
    success: 'bi-check-circle-fill',
    error:   'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info:    'bi-info-circle-fill'
  };

  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast-custom toast-${type}`;
  toast.innerHTML = `
    <i class="bi ${icons[type]} toast-icon"></i>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" onclick="dismissToast(this.parentElement)">
      <i class="bi bi-x"></i>
    </button>
  `;

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }

  return toast;
}

function dismissToast(toast) {
  if (!toast || !toast.parentElement) return;
  toast.classList.add('toast-hiding');
  setTimeout(() => {
    if (toast.parentElement) toast.parentElement.removeChild(toast);
  }, 280);
}

// Convenience shorthands
const showSuccess = (msg, dur) => showToast(msg, 'success', dur);
const showError   = (msg, dur) => showToast(msg, 'error', dur);
const showWarning = (msg, dur) => showToast(msg, 'warning', dur);
const showInfo    = (msg, dur) => showToast(msg, 'info', dur);

// ============ LOADING SPINNER ============
let spinnerEl = null;
let spinnerCount = 0;

function showSpinner(text = 'Loading...') {
  spinnerCount++;
  if (!spinnerEl) {
    spinnerEl = document.createElement('div');
    spinnerEl.className = 'loading-overlay';
    spinnerEl.innerHTML = `
      <div class="spinner-blood"></div>
      <div class="spinner-text" id="spinner-text">${escapeHtml(text)}</div>
    `;
    document.body.appendChild(spinnerEl);
  } else {
    spinnerEl.classList.remove('hidden');
    const t = spinnerEl.querySelector('#spinner-text');
    if (t) t.textContent = text;
  }
}

function hideSpinner() {
  spinnerCount = Math.max(0, spinnerCount - 1);
  if (spinnerCount === 0 && spinnerEl) {
    spinnerEl.classList.add('hidden');
  }
}

// ============ HTML ESCAPING ============
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(text ?? '')));
  return div.innerHTML;
}

// ============ DATE FORMATTING ============
function formatDate(dateString) {
  if (!dateString) return '--';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function formatDateTime(dateString) {
  if (!dateString) return '--';
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function timeAgo(dateString) {
  if (!dateString) return '';
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'just now';
  const intervals = [
    { label: 'year', secs: 31536000 },
    { label: 'month', secs: 2592000 },
    { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 },
    { label: 'minute', secs: 60 }
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

// ============ STATUS BADGE ============
function getStatusBadge(status) {
  const map = {
    PENDING:   { cls: 'badge-pending',   icon: 'bi-clock' },
    ACCEPTED:  { cls: 'badge-accepted',  icon: 'bi-check-circle' },
    COMPLETED: { cls: 'badge-completed', icon: 'bi-check-all' },
    REJECTED:  { cls: 'badge-rejected',  icon: 'bi-x-circle' }
  };
  const s = map[status] || { cls: 'badge-pending', icon: 'bi-question-circle' };
  return `<span class="badge-custom ${s.cls}">
            <i class="bi ${s.icon}"></i> ${status}
          </span>`;
}

function getAvailabilityBadge(available) {
  return available
    ? `<span class="badge-custom badge-available"><i class="bi bi-check-circle"></i> Available</span>`
    : `<span class="badge-custom badge-unavailable"><i class="bi bi-x-circle"></i> Unavailable</span>`;
}

function getUrgencyBadge(urgency) {
  const colors = {
    CRITICAL: '#C0392B', HIGH: '#E67E22', MEDIUM: '#F1C40F', LOW: '#27AE60'
  };
  const color = colors[urgency] || '#6C757D';
  return `<span style="color:${color}; font-weight:600; font-size:0.78rem;">
            <span style="display:inline-block;width:8px;height:8px;background:${color};border-radius:50%;margin-right:4px;"></span>
            ${urgency}
          </span>`;
}

function getBloodGroupBadge(bloodGroup) {
  return `<span class="badge-blood">${escapeHtml(bloodGroup)}</span>`;
}

// ============ AVATAR ============
function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function renderAvatar(name, photoUrl, size = 40) {
  if (photoUrl) {
    return `<img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(name)}"
               style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
  }
  const initials = getInitials(name);
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;
                      background:linear-gradient(135deg,#C0392B,#E74C3C);
                      display:flex;align-items:center;justify-content:center;
                      color:#fff;font-weight:700;font-size:${size * 0.35}px;
                      flex-shrink:0;">
            ${initials}
          </div>`;
}

// ============ CONFIRMATION DIALOG ============
function confirmAction(message) {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;
      display:flex;align-items:center;justify-content:center;padding:1rem;
      animation:fadeIn 0.2s ease;
    `;
    modal.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:2rem;max-width:420px;width:100%;
                  box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;">
        <div style="width:56px;height:56px;background:rgba(192,57,43,0.1);border-radius:50%;
                    display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
          <i class="bi bi-exclamation-triangle-fill" style="font-size:1.5rem;color:#C0392B;"></i>
        </div>
        <h5 style="font-weight:700;color:#1A1A2E;margin-bottom:0.5rem;">Confirm Action</h5>
        <p style="color:#6C757D;font-size:0.9rem;margin-bottom:1.5rem;">${escapeHtml(message)}</p>
        <div style="display:flex;gap:0.75rem;justify-content:center;">
          <button id="conf-cancel" style="padding:0.6rem 1.5rem;border:1.5px solid #E9ECEF;
                  background:#fff;border-radius:50px;font-weight:600;cursor:pointer;font-size:0.875rem;">
            Cancel
          </button>
          <button id="conf-ok" style="padding:0.6rem 1.5rem;background:linear-gradient(135deg,#C0392B,#E74C3C);
                  color:#fff;border:none;border-radius:50px;font-weight:600;cursor:pointer;font-size:0.875rem;
                  box-shadow:0 4px 15px rgba(192,57,43,0.35);">
            Confirm
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#conf-ok').onclick = () => { document.body.removeChild(modal); resolve(true); };
    modal.querySelector('#conf-cancel').onclick = () => { document.body.removeChild(modal); resolve(false); };
  });
}

// ============ PAGINATION ============
function renderPagination(container, currentPage, totalPages, onPageChange) {
  if (!container) return;
  container.innerHTML = '';
  if (totalPages <= 1) return;

  const createBtn = (label, page, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.className = `page-btn${active ? ' active' : ''}`;
    btn.innerHTML = label;
    btn.disabled = disabled;
    if (!disabled && !active) {
      btn.onclick = () => onPageChange(page);
    }
    return btn;
  };

  container.appendChild(createBtn('<i class="bi bi-chevron-left"></i>', currentPage - 1, currentPage === 0));

  const start = Math.max(0, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);
  for (let i = start; i <= end; i++) {
    container.appendChild(createBtn(i + 1, i, false, i === currentPage));
  }

  container.appendChild(createBtn('<i class="bi bi-chevron-right"></i>', currentPage + 1, currentPage >= totalPages - 1));
}

// ============ BLOOD GROUP SELECT ============
function populateBloodGroupSelect(selectId, selectedValue = '') {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">Select Blood Group</option>' +
    BLOOD_GROUPS.map(bg =>
      `<option value="${bg}" ${bg === selectedValue ? 'selected' : ''}>${bg}</option>`
    ).join('');
}

// ============ MISC ============
function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-IN');
}

// ============ ACTIVE NAV ============
function setActiveNav(page) {
  document.querySelectorAll('.sidebar-nav-item, .navbar-custom .nav-link').forEach(el => {
    el.classList.remove('active');
    if (el.dataset.page === page) el.classList.add('active');
  });
}
