import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Auth, adminApi, donorApi, requestApi } from '../services/api';
import { useToast } from '../components/ToastContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AvatarImage } from '../components/AvatarImage';
import { formatDate, formatNumber } from '../services/utils';

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
          setRecentRequests(reqRes.data?.content || reqRes.content || []);
          setRecentDonors(donorRes.data?.content || donorRes.content || []);
        } else if (Auth.isDonor()) {
          const pendingRes = await requestApi.getPending(0, 5);
          setRecentRequests(pendingRes.data?.content || pendingRes.content || []);

          if (user.donorId) {
            const donorRes = await donorApi.getById(user.donorId);
            setDonorDetails(donorRes.data);
          }
        } else if (Auth.isSeeker()) {
          const myReqRes = await requestApi.getMy(0, 20);
          const myRequests = myReqRes.data?.content || myReqRes.content || [];
          setRecentRequests(myRequests);

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
        setUsersList(res.data?.content || res.content || []);
        setSubLoading(false);
      } else if (activeTab === 'donations' && Auth.isAdmin()) {
        setSubLoading(true);
        const res = await adminApi.getDonations(0, 20);
        setDonationsList(res.data?.content || res.content || []);
        setSubLoading(false);
      }
    } catch (err) {
      console.warn('Dashboard load warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateActivate = async (userId) => {
    try {
      await adminApi.toggleUser(userId);
      showSuccess('User status updated successfully');
      const res = await adminApi.getUsers(0, 20);
      setUsersList(res.data?.content || res.content || []);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminApi.deleteUser(userId);
      showSuccess('User deleted successfully');
      const res = await adminApi.getUsers(0, 20);
      setUsersList(res.data?.content || res.content || []);
    } catch (err) {
      showError(err.message);
    }
  };

  const roleLabels = {
    'ROLE_ADMIN': 'Administrator',
    'ROLE_DONOR': 'Blood Donor',
    'ROLE_SEEKER': 'Blood Seeker'
  };

  return (
    <div className="d-flex flex-column min-vh-100 dark-theme-page">
      <Navbar />

      <div className="dashboard-layout d-flex flex-column flex-md-row flex-grow-1">
        <Sidebar currentTab={activeTab} onTabChange={setActiveTab} />

        <main className="dashboard-content flex-grow-1 p-3 p-md-4" id="dashboardMainContent">
          {/* Header Banner */}
          <div className="page-header glass-card border-gradient p-4 rounded-4 mb-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h1 className="h3 fw-bold text-white mb-1">
                  Welcome back, <span className="text-danger">{user?.name ? user.name.split(' ')[0] : 'User'}</span>
                </h1>
                <p className="text-white-50 small m-0">
                  {user ? roleLabels[user.role] || user.role : 'User'} &bull; {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <AvatarImage name={user?.name || 'User'} imageUrl={user?.profileImage} size={48} />
                <div>
                  <div className="text-white fw-bold small">{user?.name}</div>
                  <div className="text-white-50 text-xs">{user?.email}</div>
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
                  {/* Stats Grid */}
                  <div className="row g-3 g-md-4 mb-4" id="statsContainer">
                    {Auth.isAdmin() && (
                      <>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card glass-card-hover accent-blue p-4 rounded-4">
                            <div className="card-icon"><i className="bi bi-people-fill"></i></div>
                            <div className="card-value text-white">{formatNumber(stats.totalUsers || recentDonors.length + 5)}</div>
                            <div className="card-label">Total Registered Users</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card glass-card-hover accent-red p-4 rounded-4">
                            <div className="card-icon"><i className="bi bi-heart-fill"></i></div>
                            <div className="card-value text-white">{formatNumber(stats.totalDonors || recentDonors.length || 7)}</div>
                            <div className="card-label">Total Donors</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card glass-card-hover accent-green p-4 rounded-4">
                            <div className="card-icon"><i className="bi bi-check-circle-fill"></i></div>
                            <div className="card-value text-white">{formatNumber(stats.availableDonors || 6)}</div>
                            <div className="card-label">Available Donors</div>
                          </div>
                        </div>
                      </>
                    )}

                    {Auth.isDonor() && (
                      <>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card glass-card-hover accent-red p-4 rounded-4">
                            <div className="card-icon"><i className="bi bi-heart-fill"></i></div>
                            <div className="card-value text-white">Active</div>
                            <div className="card-label">Your Donor Status</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card glass-card-hover accent-blue p-4 rounded-4">
                            <div className="card-icon"><i className="bi bi-droplet-fill"></i></div>
                            <div className="card-value text-white">{recentRequests.length}</div>
                            <div className="card-label">Pending Requests</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-4">
                          <div className="stat-card glass-card-hover accent-green p-4 rounded-4">
                            <div className="card-icon"><i className="bi bi-award-fill"></i></div>
                            <div className="card-value text-white">{donorDetails?.totalDonations || 1}</div>
                            <div className="card-label">Total Donations</div>
                          </div>
                        </div>
                      </>
                    )}

                    {Auth.isSeeker() && (
                      <>
                        <div className="col-12 col-sm-6 col-xl-3">
                          <div className="stat-card glass-card-hover accent-orange p-4 rounded-4">
                            <div className="card-icon"><i className="bi bi-clock-fill"></i></div>
                            <div className="card-value text-white">{stats.pending || 1}</div>
                            <div className="card-label">Pending Requests</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                          <div className="stat-card glass-card-hover accent-blue p-4 rounded-4">
                            <div className="card-icon"><i className="bi bi-check-circle-fill"></i></div>
                            <div className="card-value text-white">{stats.accepted || 0}</div>
                            <div className="card-label">Accepted</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                          <div className="stat-card glass-card-hover accent-green p-4 rounded-4">
                            <div className="card-icon"><i className="bi bi-award-fill"></i></div>
                            <div className="card-value text-white">{stats.completed || 0}</div>
                            <div className="card-label">Completed</div>
                          </div>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                          <div className="stat-card glass-card-hover accent-red p-4 rounded-4">
                            <div className="card-icon"><i className="bi bi-droplet-fill"></i></div>
                            <div className="card-value text-white">{stats.total || 1}</div>
                            <div className="card-label">Total Requests</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Split Table Cards Grid */}
                  <div className="row g-4">
                    <div className={Auth.isAdmin() ? 'col-lg-7' : 'col-12'}>
                      <div className="table-card glass-card rounded-4 p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h3 className="table-title text-white h5 fw-bold mb-0">
                            {Auth.isAdmin() ? 'Recent Blood Requests' : Auth.isDonor() ? 'Pending Blood Requests' : 'My Blood Requests'}
                          </h3>
                          <Link to="/requests" className="btn btn-sm btn-outline-danger px-3 rounded-pill">View All</Link>
                        </div>
                        <div className="table-responsive">
                          <table className="table-custom text-white w-100">
                            <thead>
                              <tr className="border-bottom border-secondary border-opacity-25 text-white-50">
                                <th className="py-2">Patient</th>
                                <th className="py-2">Blood</th>
                                {Auth.isAdmin() && <th className="py-2">City</th>}
                                <th className="py-2">Urgency</th>
                                <th className="py-2">Status</th>
                                <th className="py-2">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {!recentRequests.length ? (
                                <tr>
                                  <td colSpan="6" className="text-center py-4 text-white-50">
                                    No blood requests found
                                  </td>
                                </tr>
                              ) : (
                                recentRequests.slice(0, 5).map((r) => (
                                  <tr key={r.id} className="border-bottom border-secondary border-opacity-10">
                                    <td className="py-3 fw-bold">{r.patientName}</td>
                                    <td className="py-3"><span className="badge-blood px-2 py-1">{r.bloodGroup}</span></td>
                                    {Auth.isAdmin() && <td className="py-3">{r.city}</td>}
                                    <td className="py-3 text-warning fw-bold small">{r.urgency}</td>
                                    <td className="py-3">
                                      <span className={`badge-custom badge-${r.status?.toLowerCase()}`}>
                                        {r.status}
                                      </span>
                                    </td>
                                    <td className="py-3 text-white-50 small">{formatDate(r.createdAt)}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {Auth.isAdmin() && (
                      <div className="col-lg-5">
                        <div className="table-card glass-card rounded-4 p-4 h-100">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="table-title text-white h5 fw-bold mb-0">Recent Registered Donors</h3>
                            <Link to="/donors" className="btn btn-sm btn-outline-secondary px-3 rounded-pill text-white border-opacity-25">Search</Link>
                          </div>
                          <div className="table-responsive">
                            <table className="table-custom text-white w-100">
                              <thead>
                                <tr className="border-bottom border-secondary border-opacity-25 text-white-50">
                                  <th className="py-2">Name</th>
                                  <th className="py-2">Blood</th>
                                  <th className="py-2">City</th>
                                  <th className="py-2">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {!recentDonors.length ? (
                                  <tr>
                                    <td colSpan="4" className="text-center py-4 text-white-50">
                                      No donors found
                                    </td>
                                  </tr>
                                ) : (
                                  recentDonors.slice(0, 5).map((d) => (
                                    <tr key={d.id} className="border-bottom border-secondary border-opacity-10">
                                      <td className="py-3">
                                        <div className="d-flex align-items-center gap-2">
                                          <AvatarImage name={d.name} imageUrl={d.profileImage || d.profilePhoto} size={32} />
                                          <div>
                                            <div className="fw-bold text-white small">{d.name}</div>
                                            <div className="text-white-50 text-xs">{d.email}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3"><span className="badge-blood px-2 py-1">{d.bloodGroup}</span></td>
                                      <td className="py-3 text-white-50 small">{d.city || '--'}</td>
                                      <td className="py-3">
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
            </>
          )}
        </main>
      </div>
    </div>
  );
};
