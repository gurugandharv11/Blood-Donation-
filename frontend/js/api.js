/**
 * api.js - HTTP client wrapper with JWT authentication
 * Provides typed request methods with automatic token injection and error handling.
 */

const API_BASE_URL = 'http://localhost:8080/api';

// ============ TOKEN MANAGEMENT ============
const Auth = {
  TOKEN_KEY:   'bdp_token',
  USER_KEY:    'bdp_user',
  EXPIRY_KEY:  'bdp_expiry',

  getToken()       { return localStorage.getItem(this.TOKEN_KEY); },
  setToken(t)      { localStorage.setItem(this.TOKEN_KEY, t); },
  removeToken()    { localStorage.removeItem(this.TOKEN_KEY); },

  getUser()        {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY) || 'null'); }
    catch { return null; }
  },
  setUser(u)       { localStorage.setItem(this.USER_KEY, JSON.stringify(u)); },
  removeUser()     { localStorage.removeItem(this.USER_KEY); },

  isLoggedIn()     { return !!this.getToken(); },

  getRole()        { return this.getUser()?.role || null; },
  isAdmin()        { return this.getRole() === 'ROLE_ADMIN'; },
  isDonor()        { return this.getRole() === 'ROLE_DONOR'; },
  isSeeker()       { return this.getRole() === 'ROLE_SEEKER'; },

  clear() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
  },

  saveSession(authResponse) {
    this.setToken(authResponse.token);
    this.setUser({
      id:       authResponse.userId,
      name:     authResponse.name,
      email:    authResponse.email,
      role:     authResponse.role,
      donorId:  authResponse.donorId
    });
    // Parse JWT expiry
    try {
      const payload = JSON.parse(atob(authResponse.token.split('.')[1]));
      localStorage.setItem(this.EXPIRY_KEY, payload.exp * 1000);
    } catch {}
  },

  isExpired() {
    const exp = localStorage.getItem(this.EXPIRY_KEY);
    if (!exp) return false;
    return Date.now() > parseInt(exp);
  }
};

// ============ CORE HTTP CLIENT ============
async function apiRequest(method, endpoint, body = null, isFormData = false) {
  // Check token expiry
  if (Auth.isExpired()) {
    Auth.clear();
    if (typeof showWarning === 'function') {
      showWarning('Your session has expired. Please log in again.', 0);
    }
    setTimeout(() => { window.location.href = '/frontend/login.html'; }, 1500);
    throw new Error('Session expired');
  }

  const headers = {};
  const token = Auth.getToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method: method.toUpperCase(),
    headers,
    credentials: 'same-origin'
  };

  if (body && method !== 'GET') {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle 401 Unauthorized - session expired or invalid token
  if (response.status === 401) {
    Auth.clear();
    if (typeof showError === 'function') {
      showError('Authentication failed. Please log in again.', 0);
    }
    setTimeout(() => { window.location.href = '/frontend/login.html'; }, 1500);
    throw new Error('Unauthorized');
  }

  // Parse response body
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    // Extract error message from ApiResponse
    const errorMsg = typeof data === 'object'
      ? (data.message || `HTTP Error ${response.status}`)
      : `HTTP Error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// ============ HTTP METHOD SHORTCUTS ============
const api = {
  get:    (url)           => apiRequest('GET',    url),
  post:   (url, body)     => apiRequest('POST',   url, body),
  put:    (url, body)     => apiRequest('PUT',    url, body),
  patch:  (url, body)     => apiRequest('PATCH',  url, body),
  delete: (url)           => apiRequest('DELETE', url),
  upload: (url, formData) => apiRequest('POST',   url, formData, true),
};

// ============ TYPED API METHODS ============

// --- Auth ---
const authApi = {
  login:    (data)    => api.post('/auth/login',    data),
  register: (data)    => api.post('/auth/register', data),
};

// --- Donors ---
const donorApi = {
  getAll:           (page=0, size=10, sortBy='id', sortDir='asc') =>
                      api.get(`/donors?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  getById:          (id)             => api.get(`/donors/${id}`),
  getByUserId:      (userId)         => api.get(`/donors/user/${userId}`),
  search:           (params)         => {
    const q = new URLSearchParams();
    if (params.bloodGroup) q.set('bloodGroup', params.bloodGroup);
    if (params.city)       q.set('city', params.city);
    if (params.available !== undefined && params.available !== null) q.set('available', params.available);
    q.set('page', params.page || 0);
    q.set('size', params.size || 10);
    return api.get(`/donors/search?${q.toString()}`);
  },
  create:           (data)           => api.post('/donors', data),
  update:           (id, data)       => api.put(`/donors/${id}`, data),
  toggleAvailability: (id)           => api.patch(`/donors/${id}/availability`),
  delete:           (id)             => api.delete(`/donors/${id}`),
  uploadPhoto:      (id, formData)   => apiRequest('POST', `/donors/${id}/photo`, formData, true),
};

// --- Blood Requests ---
const requestApi = {
  getAll:     (page=0, size=10)    => api.get(`/requests?page=${page}&size=${size}`),
  getPending: (page=0, size=10)    => api.get(`/requests/pending?page=${page}&size=${size}`),
  getMy:      (page=0, size=10)    => api.get(`/requests/my?page=${page}&size=${size}`),
  getById:    (id)                 => api.get(`/requests/${id}`),
  create:     (data)               => api.post('/requests', data),
  accept:     (id)                 => api.patch(`/requests/${id}/accept`),
  reject:     (id)                 => api.patch(`/requests/${id}/reject`),
  complete:   (id)                 => api.patch(`/requests/${id}/complete`),
  cancel:     (id)                 => api.patch(`/requests/${id}/cancel`),
  delete:     (id)                 => api.delete(`/requests/${id}`),
};

// --- Admin ---
const adminApi = {
  getDashboard: ()                  => api.get('/admin/dashboard'),
  getUsers:     (page=0, size=10)   => api.get(`/admin/users?page=${page}&size=${size}`),
  deleteUser:   (id)                => api.delete(`/admin/users/${id}`),
  toggleUser:   (id)                => api.patch(`/admin/users/${id}/toggle-status`),
  getDonors:    (page=0, size=10)   => api.get(`/admin/donors?page=${page}&size=${size}`),
  deleteDonor:  (id)                => api.delete(`/admin/donors/${id}`),
  getRequests:  (page=0, size=10)   => api.get(`/admin/requests?page=${page}&size=${size}`),
  approveRequest: (id)              => api.patch(`/admin/requests/${id}/approve`),
  rejectRequest:  (id)              => api.patch(`/admin/requests/${id}/reject`),
  getDonations:   (page=0, size=10) => api.get(`/admin/donations?page=${page}&size=${size}`),
};
