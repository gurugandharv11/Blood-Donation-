import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("API BASE URL =", API_BASE_URL);

// ============ TOKEN MANAGEMENT ============
export const Auth = {
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
      donorId:  authResponse.donorId,
      profileImage: authResponse.profileImage || null
    });
    // Parse JWT expiry
    try {
      const payload = JSON.parse(atob(authResponse.token.split('.')[1]));
      localStorage.setItem(this.EXPIRY_KEY, payload.exp * 1000);
    } catch {}
  },

  updateProfileImage(imageUrl) {
    const user = this.getUser();
    if (user) {
      user.profileImage = imageUrl;
      this.setUser(user);
    }
  },

  isExpired() {
    const exp = localStorage.getItem(this.EXPIRY_KEY);
    if (!exp) return false;
    return Date.now() > parseInt(exp);
  }
};

// ============ AXIOS INSTANCE ============
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (Auth.isExpired()) {
      Auth.clear();
      // We will handle redirect to login via window.location if necessary,
      // or reject.
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired'));
    }

    const token = Auth.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      Auth.clear();
      window.location.href = '/login';
    }
    const errorMsg = error.response?.data?.message || error.message || 'API Error';
    return Promise.reject(new Error(errorMsg));
  }
);

// ============ HTTP METHOD SHORTCUTS ============
const api = {
  get:    (url)           => apiClient.get(url),
  post:   (url, body)     => apiClient.post(url, body),
  put:    (url, body)     => apiClient.put(url, body),
  patch:  (url, body)     => apiClient.patch(url, body),
  delete: (url)           => apiClient.delete(url),
  upload: (url, formData) => apiClient.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ============ TYPED API METHODS ============

// --- Auth ---
export const authApi = {
  login:    (data)    => api.post('/auth/login',    data),
  register: (data)    => api.post('/auth/register', data),
  uploadProfileImage: (formData) => apiClient.post('/auth/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Helper to build full image URL from relative path
export const getProfileImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  const base = import.meta.env.VITE_API_URL.replace('/api', '');
  return `${base}${imageUrl}`;
};

// --- Donors ---
export const donorApi = {
  getAll: (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') =>
    api.get(`/donors?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),

  getById: (id) => api.get(`/donors/${id}`),

  getByUserId: (userId) => api.get(`/donors/user/${userId}`),

  search: async (params) => {
    const q = new URLSearchParams();

    if (params.bloodGroup) q.set("bloodGroup", params.bloodGroup);
    if (params.city) q.set("city", params.city);
    if (params.available !== undefined && params.available !== null)
      q.set("available", params.available);

    q.set("page", params.page || 0);
    q.set("size", params.size || 10);

    const url = `/donors/search?${q.toString()}`;

    console.log("API BASE URL:", API_BASE_URL);
    console.log("REQUEST URL:", API_BASE_URL + url);

    try {
      const response = await apiClient.get(url);
      console.log("SUCCESS RESPONSE:", response);
      return response;
    } catch (err) {
      console.error("ERROR:", err);
      console.error("ERROR RESPONSE:", err.response);
      throw err;
    }
  },

  create: (data) => api.post('/donors', data),

  update: (id, data) => api.put(`/donors/${id}`, data),

  toggleAvailability: (id) =>
    api.patch(`/donors/${id}/availability`),

  delete: (id) => api.delete(`/donors/${id}`),

  uploadPhoto: (id, formData) =>
    apiClient.post(`/donors/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// --- Blood Requests ---
export const requestApi = {
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
export const adminApi = {
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
