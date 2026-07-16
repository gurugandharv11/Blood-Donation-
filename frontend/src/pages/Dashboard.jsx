import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Auth, adminApi, donorApi, requestApi } from '../services/api';
import { useToast } from '../components/ToastContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AvatarImage } from '../components/AvatarImage';
import { getInitials, formatDate, formatNumber } from '../services/utils';

export const Dashboard = () => {
  const { state } = useLocation();
  const { showError, showSuccess } = useToast();
  const user = Auth.getUser();

  const [activeTab, setActiveTab] = useState(state?.activeTab || 'dashboard');
  const [stats, setStats] = useState({});
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentDonors, setRecentDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin sub-states
  const [usersList, setUsersList] = useState([]);
  const [donationsList, setDonationsList] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  // Donor sub-states
  const [donorDetails, setDonorDetails] = useState(null);

  useEffect(() => {
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
    }
  }, [state]);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      if (activeTab === 'dashboard') {
        if (Auth.isAdmin()) {
          const statsRes = await adminApi.getDashboard();
          setStats(statsRes.data || {});

          const [reqRes, donorRes] = await Promise.all([
            adminApi.getRequests(0, 5),
            adminApi.getDonors(0, 5)
          ]);
          setRecentRequests(reqRes.data?.content || []);
          setRecentDonors(donorRes.data?.content || []);
        } else if (Auth.isDonor()) {
          const pendingRes = await requestApi.getPending(0, 5);
          setRecentRequests(pendingRes.data?.content || []);

          if (user.donorId) {
            const donorRes = await donorApi.getById(user.donorId);
            setDonorDetails(donorRes.data);
          }
        } else if (Auth.isSeeker()) {
          const myReqRes = await requestApi.getMy(0, 20);
          const myRequests = myReqRes.data?.content || [];
          setRecentRequests(myRequests);

          // Seeker local stats calculation
          const pending = myRequests.filter(r => r.status === 'PENDING').length;
          const accepted = myRequests.filter(r => r.status === 'ACCEPTED').length;
          const completed = myRequests.filter(r => r.status === 'COMPLETED').length;
          setStats({
            pending,
            accepted,
            completed,
            total: myRequests.length
          });
        }
      } else if (activeTab === 'users' && Auth.isAdmin()) {
        setSubLoading(true);
        const res = await adminApi.getUsers(0, 20);
        setUsersList(res.data?.content || []);
        setSubLoading(false);
      } else if (activeTab === 'donations' && Auth.isAdmin()) {
        setSubLoading(true);
        const res = await adminApi.getDonations(0, 20);
        setDonationsList(res.data?.content || []);
        setSubLoading(false);
      }
    } catch (err) {
      showError('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateActivate = async (userId) => {
    try {
      await adminApi.toggleUser(userId);
      showSuccess('User status updated successfully');
      // Reload
      const res = await adminApi.getUsers(0, 20);
      setUsersList(res.data?.content || []);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminApi.deleteUser(userId);
      showSuccess('User deleted successfully');
      // Reload
      const res = await adminApi.getUsers(0, 20);
      setUsersList(res.data?.content || []);
    } catch (err) {
      showError(err.message);
    }
  };

  // Role labels for display
  const roleLabels = {
    'ROLE_ADMIN': 'Administrator',
    'ROLE_DONOR': 'Donor',
    'ROLE_SEEKER': 'Blood Seeker'
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar currentTab={activeTab} onTabChange={setActiveTab} />

        <main className="dashboard-content" id="dashboardMainContent">
          {/* Header */}
          <div className="page-header" style={{ borderBottom: 'none', marginBottom: 0 }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.5px' }}>
                  Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}
                </h1>
                <p style={{ color: '#6C757D', fontSize: '0.9rem', margin: 0 }}>
                  {user ? roleLabels[user.role] : 'User'} &bull; {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <AvatarImage name={user?.name || 'User'} imageUrl={user?.profileImage} size={44} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1A2E' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6C757D' }}>{user?.email}</div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2 text-danger fw-bold">Loading dashboard...</div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <>
                  {/* Stats Cards */}
                  <div className="row g-4 mt-3" id="statsContainer">
                    {Auth.isAdmin() && (
                      <>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card accent-blue">
                            <div className="card-icon"><i className="bi bi-people-fill"></i></div>
                            <div className="card-value">{formatNumber(stats.totalUsers)}</div>
                            <div className="card-label">Total Users</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card accent-red">
                            <div className="card-icon"><i className="bi bi-heart-fill"></i></div>
                            <div className="card-value">{formatNumber(stats.totalDonors)}</div>
                            <div className="card-label">Total Donors</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card accent-green">
                            <div className="card-icon"><i className="bi bi-check-circle-fill"></i></div>
                            <div className="card-value">{formatNumber(stats.availableDonors)}</div>
                            <div className="card-label">Available Donors</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card accent-orange">
                            <div className="card-icon"><i className="bi bi-droplet-fill"></i></div>
                            <div className="card-value">{formatNumber(stats.totalRequests)}</div>
                            <div className="card-label">Total Requests</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card accent-orange">
                            <div className="card-icon"><i className="bi bi-clock-fill"></i></div>
                            <div className="card-value">{formatNumber(stats.pendingRequests)}</div>
                            <div className="card-label">Pending Requests</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card accent-teal">
                            <div className="card-icon"><i className="bi bi-hand-thumbs-up-fill"></i></div>
                            <div className="card-value">{formatNumber(stats.acceptedRequests)}</div>
                            <div className="card-label">Accepted Requests</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card accent-green">
                            <div className="card-icon"><i className="bi bi-award-fill"></i></div>
                            <div className="card-value">{formatNumber(stats.completedDonations)}</div>
                            <div className="card-label">Completed Donations</div>
                          </div>
                        </div>
                      </>
                    )}

                    {Auth.isDonor() && (
                      <>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card accent-red">
                            <div className="card-icon"><i className="bi bi-heart-fill"></i></div>
                            <div className="card-value">Ready</div>
                            <div className="card-label">Your Donor Status</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card accent-blue">
                            <div className="card-icon"><i className="bi bi-droplet-fill"></i></div>
                            <div className="card-value">{recentRequests.length}</div>
                            <div className="card-label">Pending Requests Near You</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card accent-green">
                            <div className="card-icon"><i className="bi bi-award-fill"></i></div>
                            <div className="card-value">{donorDetails?.totalDonations || 0}</div>
                            <div className="card-label">Total Donations</div>
                          </div>
                        </div>
                      </>
                    )}

                    {Auth.isSeeker() && (
                      <>
                        <div className="col-12 col-sm-6 col-xl-3">
                          <div className="stat-card accent-orange">
                            <div className="card-icon"><i className="bi bi-clock-fill"></i></div>
                            <div className="card-value">{stats.pending || 0}</div>
                            <div className="card-label">Pending Requests</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                          <div className="stat-card accent-blue">
                            <div className="card-icon"><i className="bi bi-check-circle-fill"></i></div>
                            <div className="card-value">{stats.accepted || 0}</div>
                            <div className="card-label">Accepted</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                          <div className="stat-card accent-green">
                            <div className="card-icon"><i className="bi bi-award-fill"></i></div>
                            <div className="card-value">{stats.completed || 0}</div>
                            <div className="card-label">Completed</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                          <div className="stat-card accent-red">
                            <div className="card-icon"><i className="bi bi-droplet-fill"></i></div>
                            <div className="card-value">{stats.total || 0}</div>
                            <div className="card-label">Total Requests</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Split Grid */}
                  <div className="row g-4 mt-4">
                    {/* Requests Section */}
                    <div className={Auth.isAdmin() ? 'col-lg-7' : 'col-12'}>
                      <div className="table-card h-100">
                        <div className="table-header">
                          <span className="table-title">
                            {Auth.isAdmin() ? 'Recent Blood Requests' : Auth.isDonor() ? 'Pending Blood Requests' : 'My Blood Requests'}
                          </span>
                          <Link to="/requests" className="btn btn-sm btn-outline-danger px-3 rounded-pill">View All</Link>
                        </div>
                        <div className="table-responsive">
                          <table className="table-custom">
                            <thead>
                              <tr>
                                <th>Patient</th>
                                <th>Blood</th>
                                {Auth.isAdmin() && <th>City</th>}
                                <th>Urgency</th>
                                <th>Status</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {!recentRequests.length ? (
                                <tr>
                                  <td colSpan="6" className="text-center py-4 text-muted">
                                    No blood requests found
                                  </td>
                                </tr>
                              ) : (
                                recentRequests.slice(0, 5).map((r) => (
                                  <tr key={r.id}>
                                    <td>{r.patientName}</td>
                                    <td><span className="badge-blood">{r.bloodGroup}</span></td>
                                    {Auth.isAdmin() && <td>{r.city}</td>}
                                    <td>
                                      <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>
                                        {r.urgency}
                                      </span>
                                    </td>
                                    <td>
                                      <span className={`badge-custom badge-${r.status.toLowerCase()}`}>
                                        {r.status}
                                      </span>
                                    </td>
                                    <td>{formatDate(r.createdAt)}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Donors Section (Only Admin Dashboard) */}
                    {Auth.isAdmin() && (
                      <div className="col-lg-5">
                        <div className="table-card h-100">
                          <div className="table-header">
                            <span className="table-title">Recent Registered Donors</span>
                            <Link to="/donors" className="btn btn-sm btn-outline-secondary px-3 rounded-pill">Search</Link>
                          </div>
                          <div className="table-responsive">
                            <table className="table-custom">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Blood</th>
                                  <th>City</th>
                                  <th>Availability</th>
                                </tr>
                              </thead>
                              <tbody>
                                {!recentDonors.length ? (
                                  <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">
                                      No donors found
                                    </td>
                                  </tr>
                                ) : (
                                  recentDonors.slice(0, 5).map((d) => (
                                    <tr key={d.id}>
                                      <td>
                                        <div className="d-flex align-items-center gap-2">
                                          <AvatarImage name={d.name} imageUrl={d.profileImage || d.profilePhoto} size={36} />
                                          <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6C757D' }}>{d.email}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td><span className="badge-blood">{d.bloodGroup}</span></td>
                                      <td>{d.city || '--'}</td>
                                      <td>
                                        <span className={`badge-custom ${d.available ? 'badge-available' : 'badge-unavailable'}`}>
                                          {d.available ? 'Available' : 'Unavailable'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Users Tab (Admin Only) */}
              {activeTab === 'users' && Auth.isAdmin() && (
                <>
                  <div className="page-header"><h1>All Users</h1></div>
                  <div className="table-card">
                    <div className="table-header">
                      <span className="table-title">Registered Users</span>
                    </div>
                    {subLoading ? (
                      <div className="text-center py-4">Loading users...</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table-custom">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Role</th>
                              <th>Status</th>
                              <th>Joined</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {!usersList.length ? (
                              <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">
                                  No users found
                                </td>
                              </tr>
                            ) : (
                              usersList.map((u) => (
                                <tr key={u.id}>
                                  <td>{u.name}</td>
                                  <td>{u.email}</td>
                                  <td>{u.phone || '--'}</td>
                                  <td>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2980B9' }}>
                                      {u.role?.replace('ROLE_', '')}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`badge-custom ${u.active ? 'badge-available' : 'badge-unavailable'}`}>
                                      {u.active ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                  <td>{formatDate(u.createdAt)}</td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => handleDeactivateActivate(u.id)}
                                    >
                                      {u.active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger ms-1"
                                      onClick={() => handleDeleteUser(u.id)}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Donations Tab (Admin Only) */}
              {activeTab === 'donations' && Auth.isAdmin() && (
                <>
                  <div className="page-header"><h1>Donation History</h1></div>
                  <div className="table-card">
                    <div className="table-header">
                      <span className="table-title">Completed Donations</span>
                    </div>
                    {subLoading ? (
                      <div className="text-center py-4">Loading donations...</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table-custom">
                          <thead>
                            <tr>
                              <th>Donor</th>
                              <th>Patient</th>
                              <th>Blood Group</th>
                              <th>Hospital</th>
                              <th>Units</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {!donationsList.length ? (
                              <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">
                                  No donations recorded yet
                                </td>
                              </tr>
                            ) : (
                              donationsList.map((d, index) => (
                                <tr key={index}>
                                  <td><strong>{d.donorName}</strong></td>
                                  <td>{d.patientName}</td>
                                  <td><span className="badge-blood">{d.bloodGroup}</span></td>
                                  <td>{d.hospitalName}</td>
                                  <td>{d.unitsDonated} unit{d.unitsDonated !== 1 ? 's' : ''}</td>
                                  <td>{formatDate(d.donationDate)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
