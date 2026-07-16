/**
 * auth.js - Authentication page logic
 * Handles login, registration, logout, and session routing
 */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect logged-in users away from auth pages
  if (Auth.isLoggedIn() && !Auth.isExpired()) {
    redirectToDashboard();
    return;
  }

  // Init based on current page
  const path = window.location.pathname;
  if (path.includes('login')) {
    initLoginPage();
  } else if (path.includes('register')) {
    initRegisterPage();
  }
});

// ============ REDIRECT ============
function redirectToDashboard() {
  window.location.href = '/frontend/dashboard.html';
}

// ============ LOGIN PAGE ============
function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const btn = document.getElementById('loginBtn');
    setButtonLoading(btn, true, 'Signing in...');

    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        Auth.saveSession(response.data);
        showSuccess('Login successful! Redirecting...');
        setTimeout(redirectToDashboard, 800);
      } else {
        showError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setButtonLoading(btn, false, '<i class="bi bi-box-arrow-in-right me-2"></i>Sign In');
    }
  });
}

function validateLoginForm() {
  clearErrors();
  let valid = true;

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('emailError', 'Please enter a valid email address');
    valid = false;
  }
  if (!password || password.length < 6) {
    setFieldError('passwordError', 'Password must be at least 6 characters');
    valid = false;
  }
  return valid;
}

// ============ REGISTER PAGE ============
function initRegisterPage() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  // Role toggle - show/hide donor fields
  const roleSelect = document.getElementById('role');
  if (roleSelect) {
    roleSelect.addEventListener('change', () => {
      const donorInfo = document.getElementById('donorExtraInfo');
      if (donorInfo) {
        donorInfo.style.display = roleSelect.value === 'DONOR' ? 'block' : 'none';
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    const data = {
      name:     document.getElementById('name').value.trim(),
      email:    document.getElementById('regEmail').value.trim(),
      password: document.getElementById('regPassword').value,
      phone:    document.getElementById('phone').value.trim(),
      role:     document.getElementById('role').value
    };

    const btn = document.getElementById('registerBtn');
    setButtonLoading(btn, true, 'Creating account...');

    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        Auth.saveSession(response.data);
        showSuccess('Account created successfully! Redirecting...');
        setTimeout(redirectToDashboard, 800);
      } else {
        // Show field-level errors if available
        if (response.data && typeof response.data === 'object') {
          Object.entries(response.data).forEach(([field, msg]) => {
            const errEl = document.getElementById(`${field}Error`);
            if (errEl) errEl.textContent = msg;
          });
        }
        showError(response.message || 'Registration failed.');
      }
    } catch (err) {
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setButtonLoading(btn, false, '<i class="bi bi-person-plus me-2"></i>Create Account');
    }
  });
}

function validateRegisterForm() {
  clearErrors();
  let valid = true;

  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('confirmPassword').value;
  const phone    = document.getElementById('phone').value.trim();
  const role     = document.getElementById('role').value;

  if (!name || name.length < 2) {
    setFieldError('nameError', 'Name must be at least 2 characters'); valid = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('regEmailError', 'Enter a valid email address'); valid = false;
  }
  if (!password || password.length < 6) {
    setFieldError('regPasswordError', 'Password must be at least 6 characters'); valid = false;
  }
  if (password !== confirm) {
    setFieldError('confirmPasswordError', 'Passwords do not match'); valid = false;
  }
  if (phone && !/^[0-9]{10}$/.test(phone)) {
    setFieldError('phoneError', 'Phone must be exactly 10 digits'); valid = false;
  }
  if (!role) {
    setFieldError('roleError', 'Please select a role'); valid = false;
  }
  return valid;
}

// ============ LOGOUT ============
function logout() {
  Auth.clear();
  showInfo('Logged out successfully');
  setTimeout(() => { window.location.href = '/frontend/login.html'; }, 600);
}

// ============ NAVBAR AUTH STATE ============
function updateNavbarAuthState() {
  const user = Auth.getUser();
  const loginLinks  = document.querySelectorAll('.nav-login-link');
  const logoutLinks = document.querySelectorAll('.nav-logout-link');
  const userNameEls = document.querySelectorAll('.nav-user-name');

  if (user) {
    loginLinks.forEach(el => el.style.display  = 'none');
    logoutLinks.forEach(el => el.style.display = 'block');
    userNameEls.forEach(el => el.textContent   = user.name);
  } else {
    loginLinks.forEach(el => el.style.display  = 'block');
    logoutLinks.forEach(el => el.style.display = 'none');
  }
}

// ============ HELPER FORM FUNCTIONS ============
function setFieldError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-control-custom').forEach(el => el.classList.remove('is-invalid'));
}

function setButtonLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner-border spinner-border-sm me-2" role="status"></span>${label}`
    : label;
}

// ============ SESSION GUARD (for protected pages) ============
function requireAuth() {
  if (!Auth.isLoggedIn() || Auth.isExpired()) {
    Auth.clear();
    window.location.href = '/frontend/login.html';
    return false;
  }
  return true;
}

function requireRole(...roles) {
  if (!requireAuth()) return false;
  const userRole = Auth.getRole();
  if (!roles.includes(userRole)) {
    showError('You do not have permission to access this page.');
    setTimeout(() => { window.location.href = '/frontend/dashboard.html'; }, 1500);
    return false;
  }
  return true;
}

// ============ INIT ON ALL PROTECTED PAGES ============
function initProtectedPage() {
  if (!requireAuth()) return;
  updateNavbarAuthState();
  initSessionExpiryWarning();
}

function initSessionExpiryWarning() {
  const exp = localStorage.getItem(Auth.EXPIRY_KEY);
  if (!exp) return;

  const remaining = parseInt(exp) - Date.now();
  const warnAt = 5 * 60 * 1000; // 5 minutes before expiry

  if (remaining > warnAt) {
    setTimeout(() => {
      showWarning('Your session will expire in 5 minutes. Please save your work.', 8000);
    }, remaining - warnAt);
  }

  if (remaining > 0) {
    setTimeout(() => {
      Auth.clear();
      showError('Session expired. Redirecting to login...', 0);
      setTimeout(() => { window.location.href = '/frontend/login.html'; }, 2000);
    }, remaining);
  }
}
