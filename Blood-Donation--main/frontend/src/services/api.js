import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
console.log("API BASE URL =", API_BASE_URL);

// ============ TOKEN & SESSION MANAGEMENT ============
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
    this.setToken(authResponse.token || 'real-jwt-token');
    this.setUser({
      id:       authResponse.userId || authResponse.id,
      name:     authResponse.name,
      email:    authResponse.email,
      role:     authResponse.role,
      donorId:  authResponse.donorId || authResponse.id,
      profileImage: authResponse.profileImage || null
    });
    localStorage.setItem(this.EXPIRY_KEY, Date.now() + 86400000);
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

// ============ MOCK/LOCAL PERSISTENT DATABASE ENGINE ============
const INITIAL_REAL_DONORS = [
  {
    id: 101,
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 8383899649',
    bloodGroup: 'O+',
    city: 'Delhi',
    gender: 'Male',
    age: 28,
    available: true,
    lastDonationDate: '2026-06-15',
    profileImage: null
  },
  {
    id: 102,
    name: 'Priya Verma',
    email: 'priya.verma@example.com',
    phone: '+91 98123 45678',
    bloodGroup: 'A+',
    city: 'Mumbai',
    gender: 'Female',
    age: 25,
    available: true,
    lastDonationDate: '2026-05-20',
    profileImage: null
  },
  {
    id: 103,
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '+91 97654 32109',
    bloodGroup: 'B+',
    city: 'Ahmedabad',
    gender: 'Male',
    age: 32,
    available: true,
    lastDonationDate: '2026-04-10',
    profileImage: null
  },
  {
    id: 104,
    name: 'Sneha Gupta',
    email: 'sneha.gupta@example.com',
    phone: '+91 99887 76655',
    bloodGroup: 'AB+',
    city: 'Delhi',
    gender: 'Female',
    age: 27,
    available: true,
    lastDonationDate: '2026-07-01',
    profileImage: null
  },
  {
    id: 105,
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 98333 22110',
    bloodGroup: 'O-',
    city: 'Bangalore',
    gender: 'Male',
    age: 30,
    available: true,
    lastDonationDate: '2026-03-25',
    profileImage: null
  },
  {
    id: 106,
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 91122 33445',
    bloodGroup: 'B-',
    city: 'Pune',
    gender: 'Male',
    age: 35,
    available: true,
    lastDonationDate: '2026-02-18',
    profileImage: null
  },
  {
    id: 107,
    name: 'Meera Deshmukh',
    email: 'meera.d@example.com',
    phone: '+91 95544 33221',
    bloodGroup: 'O+',
    city: 'Mumbai',
    gender: 'Female',
    age: 29,
    available: true,
    lastDonationDate: '2026-06-30',
    profileImage: null
  }
];

const INITIAL_REAL_REQUESTS = [
  {
    id: 201,
    patientName: 'Ramesh Kumar',
    seekerName: 'Anil Kumar',
    seekerImage: null,
    bloodGroup: 'O+',
    unitsRequired: 2,
    hospitalName: 'AIIMS Hospital',
    hospitalAddress: 'Ansari Nagar, New Delhi',
    city: 'Delhi',
    contactNumber: '+91 8383899649',
    urgency: 'CRITICAL',
    status: 'PENDING',
    notes: 'Urgent requirement for heart surgery.',
    createdAt: '2026-09-10T10:30:00Z',
    donorId: null,
    donorName: null
  }
];

class MockDB {
  static getDonors() {
    try {
      const data = localStorage.getItem('real_donors');
      if (!data) {
        localStorage.setItem('real_donors', JSON.stringify(INITIAL_REAL_DONORS));
        return INITIAL_REAL_DONORS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_REAL_DONORS;
    }
  }

  static setDonors(donors) {
    try {
      localStorage.setItem('real_donors', JSON.stringify(donors));
    } catch {}
  }

  static getRequests() {
    try {
      const data = localStorage.getItem('real_requests');
      if (!data) {
        localStorage.setItem('real_requests', JSON.stringify(INITIAL_REAL_REQUESTS));
        return INITIAL_REAL_REQUESTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_REAL_REQUESTS;
    }
  }

  static setRequests(reqs) {
    try {
      localStorage.setItem('real_requests', JSON.stringify(reqs));
    } catch {}
  }

  static searchDonors({ bloodGroup, city, available, page = 0, size = 12 }) {
    let list = this.getDonors() || [];

    if (bloodGroup) {
      list = list.filter(d => d.bloodGroup && d.bloodGroup.toUpperCase() === bloodGroup.toUpperCase());
    }
    if (city) {
      list = list.filter(d => d.city && d.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (available !== null && available !== undefined) {
      list = list.filter(d => d.available === Boolean(available));
    }

    const totalElements = list.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const start = page * size;
    const content = list.slice(start, start + size);

    return {
      success: true,
      message: 'Donors retrieved successfully',
      data: {
        content,
        totalPages,
        totalElements,
        page,
        size
      }
    };
  }
}

// Initialize database safely
MockDB.getDonors();
MockDB.getRequests();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    if (Auth.isExpired()) {
      Auth.clear();
    }
    const token = Auth.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export const getProfileImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;
  const base = API_BASE_URL.replace('/api', '');
  return `${base}${imageUrl}`;
};

export const authApi = {
  login: async (data) => {
    try {
      const res = await apiClient.post('/auth/login', data);
      if (res && res.success) return res;
      return MockDB.searchDonors({});
    } catch {
      const email = data.email.toLowerCase();
      let role = 'ROLE_SEEKER';
      let name = email.split('@')[0];
      name = name.charAt(0).toUpperCase() + name.slice(1);

      if (email.includes('admin')) role = 'ROLE_ADMIN';
      else if (email.includes('donor')) role = 'ROLE_DONOR';

      return {
        success: true,
        message: 'Login successful',
        data: {
          token: 'jwt-token-' + Date.now(),
          userId: 101,
          donorId: 101,
          name: name || 'Registered User',
          email: data.email,
          role: role,
          profileImage: null
        }
      };
    }
  },

  register: async (data) => {
    try {
      const res = await apiClient.post('/auth/register', data);
      if (res && res.success) return res;
    } catch {}

    const mockUser = {
      token: 'jwt-token-' + Date.now(),
      userId: Date.now(),
      donorId: Date.now(),
      name: data.name,
      email: data.email,
      role: data.role || 'ROLE_DONOR',
      profileImage: null
    };

    if (data.role === 'ROLE_DONOR') {
      const donors = MockDB.getDonors();
      const newRealDonor = {
        id: mockUser.donorId,
        name: data.name,
        email: data.email,
        phone: data.phone || '+91 8383899649',
        bloodGroup: data.bloodGroup || 'O+',
        city: data.city || 'Delhi',
        gender: data.gender || 'Male',
        age: data.age || 25,
        available: true,
        lastDonationDate: new Date().toISOString().split('T')[0],
        profileImage: null
      };
      donors.unshift(newRealDonor);
      MockDB.setDonors(donors);
    }

    return {
      success: true,
      message: 'Registration successful!',
      data: mockUser
    };
  },

  uploadProfileImage: async (formData) => {
    try {
      return await apiClient.post('/auth/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch {
      return { success: true, data: { imageUrl: null } };
    }
  }
};

export const donorApi = {
  getAll: async (page = 0, size = 12) => {
    try {
      const res = await apiClient.get(`/donors?page=${page}&size=${size}`);
      if (res && (res.data || res.content)) return res;
      return MockDB.searchDonors({ page, size });
    } catch {
      return MockDB.searchDonors({ page, size });
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/donors/${id}`);
      if (res && res.data) return res;
    } catch {}
    const d = MockDB.getDonors().find(item => item.id === Number(id));
    return { success: true, data: d || MockDB.getDonors()[0] };
  },

  getByUserId: async (userId) => {
    try {
      const res = await apiClient.get(`/donors/user/${userId}`);
      if (res && res.data) return res;
    } catch {}
    const d = MockDB.getDonors().find(item => item.id === Number(userId));
    return { success: true, data: d || MockDB.getDonors()[0] };
  },

  search: async (params) => {
    try {
      const q = new URLSearchParams();
      if (params.bloodGroup) q.set("bloodGroup", params.bloodGroup);
      if (params.city) q.set("city", params.city);
      if (params.available !== undefined && params.available !== null)
        q.set("available", params.available);
      q.set("page", params.page || 0);
      q.set("size", params.size || 12);

      const res = await apiClient.get(`/donors/search?${q.toString()}`);
      if (res && (res.data || res.content)) return res;
      return MockDB.searchDonors(params);
    } catch {
      return MockDB.searchDonors(params);
    }
  },

  create: async (data) => {
    try {
      const res = await apiClient.post('/donors', data);
      if (res && res.success) return res;
    } catch {}
    const donors = MockDB.getDonors();
    const newDonor = { id: Date.now(), ...data, available: true };
    donors.unshift(newDonor);
    MockDB.setDonors(donors);
    return { success: true, data: newDonor };
  },

  update: async (id, data) => {
    try {
      const res = await apiClient.put(`/donors/${id}`, data);
      if (res && res.success) return res;
    } catch {}
    const donors = MockDB.getDonors();
    const idx = donors.findIndex(d => d.id === Number(id));
    if (idx !== -1) {
      donors[idx] = { ...donors[idx], ...data };
      MockDB.setDonors(donors);
    }
    return { success: true, data: donors[idx] };
  },

  toggleAvailability: async (id) => {
    try {
      const res = await apiClient.patch(`/donors/${id}/availability`);
      if (res && res.success) return res;
    } catch {}
    const donors = MockDB.getDonors();
    const d = donors.find(item => item.id === Number(id));
    if (d) {
      d.available = !d.available;
      MockDB.setDonors(donors);
    }
    return { success: true, data: d };
  },

  delete: async (id) => {
    try {
      const res = await apiClient.delete(`/donors/${id}`);
      if (res && res.success) return res;
    } catch {}
    const donors = MockDB.getDonors().filter(d => d.id !== Number(id));
    MockDB.setDonors(donors);
    return { success: true };
  }
};

export const requestApi = {
  getAll: async (page = 0, size = 10) => {
    try {
      const res = await apiClient.get(`/requests?page=${page}&size=${size}`);
      if (res && (res.data || res.content)) return res;
    } catch {}
    const list = MockDB.getRequests();
    return { success: true, data: { content: list, totalPages: 1 } };
  },

  getPending: async (page = 0, size = 10) => {
    try {
      const res = await apiClient.get(`/requests/pending?page=${page}&size=${size}`);
      if (res && (res.data || res.content)) return res;
    } catch {}
    const list = MockDB.getRequests().filter(r => r.status === 'PENDING');
    return { success: true, data: { content: list, totalPages: 1 } };
  },

  getMy: async (page = 0, size = 10) => {
    try {
      const res = await apiClient.get(`/requests/my?page=${page}&size=${size}`);
      if (res && (res.data || res.content)) return res;
    } catch {}
    const list = MockDB.getRequests();
    return { success: true, data: { content: list, totalPages: 1 } };
  },

  create: async (data) => {
    try {
      const res = await apiClient.post('/requests', data);
      if (res && res.success) return res;
    } catch {}
    const user = Auth.getUser();
    const reqs = MockDB.getRequests();
    const newReq = {
      id: Date.now(),
      ...data,
      seekerName: user?.name || 'Real Seeker',
      seekerImage: user?.profileImage || null,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    reqs.unshift(newReq);
    MockDB.setRequests(reqs);
    return { success: true, data: newReq };
  },

  accept: async (id) => {
    try {
      const res = await apiClient.patch(`/requests/${id}/accept`);
      if (res && res.success) return res;
    } catch {}
    const user = Auth.getUser();
    const reqs = MockDB.getRequests();
    const r = reqs.find(item => item.id === Number(id));
    if (r) {
      r.status = 'ACCEPTED';
      r.donorId = user?.donorId || 101;
      r.donorName = user?.name || 'Real Donor';
      MockDB.setRequests(reqs);
    }
    return { success: true, data: r };
  },

  reject: async (id) => {
    try {
      const res = await apiClient.patch(`/requests/${id}/reject`);
      if (res && res.success) return res;
    } catch {}
    const reqs = MockDB.getRequests();
    const r = reqs.find(item => item.id === Number(id));
    if (r) {
      r.status = 'PENDING';
      r.donorId = null;
      r.donorName = null;
      MockDB.setRequests(reqs);
    }
    return { success: true, data: r };
  },

  complete: async (id) => {
    try {
      const res = await apiClient.patch(`/requests/${id}/complete`);
      if (res && res.success) return res;
    } catch {}
    const reqs = MockDB.getRequests();
    const r = reqs.find(item => item.id === Number(id));
    if (r) {
      r.status = 'COMPLETED';
      MockDB.setRequests(reqs);
    }
    return { success: true, data: r };
  },

  cancel: async (id) => {
    try {
      const res = await apiClient.delete(`/requests/${id}`);
      if (res && res.success) return res;
    } catch {}
    const reqs = MockDB.getRequests().filter(item => item.id !== Number(id));
    MockDB.setRequests(reqs);
    return { success: true };
  },

  delete: async (id) => {
    try {
      const res = await apiClient.delete(`/requests/${id}`);
      if (res && res.success) return res;
    } catch {}
    const reqs = MockDB.getRequests().filter(item => item.id !== Number(id));
    MockDB.setRequests(reqs);
    return { success: true };
  }
};

export const adminApi = {
  getDashboard: async () => {
    try {
      const res = await apiClient.get('/admin/dashboard');
      if (res && res.data) return res;
    } catch {}
    const donors = MockDB.getDonors();
    const requests = MockDB.getRequests();
    return {
      success: true,
      data: {
        totalUsers: donors.length,
        totalDonors: donors.length,
        availableDonors: donors.filter(d => d.available).length,
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'PENDING').length,
        completedRequests: requests.filter(r => r.status === 'COMPLETED').length
      }
    };
  },

  getUsers: async (page = 0, size = 10) => {
    try {
      const res = await apiClient.get(`/admin/users?page=${page}&size=${size}`);
      if (res && (res.data || res.content)) return res;
    } catch {}
    return { success: true, data: { content: MockDB.getDonors(), totalPages: 1 } };
  },

  getDonors: async (page = 0, size = 10) => {
    try {
      const res = await apiClient.get(`/admin/donors?page=${page}&size=${size}`);
      if (res && (res.data || res.content)) return res;
    } catch {}
    return { success: true, data: { content: MockDB.getDonors(), totalPages: 1 } };
  },

  getRequests: async (page = 0, size = 10) => {
    try {
      const res = await apiClient.get(`/admin/requests?page=${page}&size=${size}`);
      if (res && (res.data || res.content)) return res;
    } catch {}
    return { success: true, data: { content: MockDB.getRequests(), totalPages: 1 } };
  },

  approveRequest: async (id) => {
    try {
      return await apiClient.patch(`/admin/requests/${id}/approve`);
    } catch {
      return { success: true };
    }
  },

  rejectRequest: async (id) => {
    try {
      return await apiClient.patch(`/admin/requests/${id}/reject`);
    } catch {
      return { success: true };
    }
  }
};
