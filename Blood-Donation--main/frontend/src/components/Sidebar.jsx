import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Auth } from '../services/api';
import { useToast } from './ToastContext';
import { AvatarImage } from './AvatarImage';
import { RaktdaanLogo } from './RaktdaanLogo';

export const Sidebar = ({ currentTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showInfo } = useToast();
  const user = Auth.getUser();

  if (!user) return null;

  const handleLogout = () => {
    Auth.clear();
    showInfo('Logged out successfully');
    navigate('/login');
  };

  const isAdmin = Auth.isAdmin();
  const isDonor = Auth.isDonor();
  const isSeeker = Auth.isSeeker();

  const handleAdminTab = (tabName) => {
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard', { state: { activeTab: tabName } });
    } else if (onTabChange) {
      onTabChange(tabName);
    }
  };

  return (
    <aside className="sidebar glass-card border-0 border-end border-secondary border-opacity-25" id="sidebar">
      {/* Brand Logo */}
      <div className="sidebar-logo p-3 border-bottom border-secondary border-opacity-25 text-center">
        <Link to="/" className="text-decoration-none">
          <RaktdaanLogo size="small" showText={true} />
        </Link>
      </div>

      {/* User Avatar Card */}
      <div
        className="user-card-sidebar d-flex align-items-center gap-3 p-3 m-3 rounded-3 cursor-pointer glass-card-hover"
        onClick={() => navigate('/profile')}
        style={{ cursor: 'pointer' }}
      >
        <AvatarImage name={user?.name} imageUrl={user?.profileImage} size={42} />
        <div className="overflow-hidden">
          <div className="text-white fw-bold small text-truncate">{user?.name}</div>
          <div className="text-white-50 text-xs text-truncate">{user?.email}</div>
          <span className="badge bg-danger-subtle text-danger-emphasis rounded-pill px-2 py-0.5 mt-1" style={{ fontSize: '0.65rem' }}>
            {user?.role?.replace('ROLE_', '')}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav px-3 py-2 d-flex flex-column gap-1 flex-grow-1">
        {isAdmin && (
          <>
            <button
              onClick={() => handleAdminTab('dashboard')}
              className={`sidebar-nav-item ${location.pathname === '/dashboard' && currentTab === 'dashboard' ? 'active' : ''}`}
            >
              <i className="bi bi-grid-1x2-fill me-2 fs-5"></i> Admin Dashboard
            </button>

            <Link
              to="/donors"
              className={`sidebar-nav-item ${location.pathname === '/donors' ? 'active' : ''}`}
            >
              <i className="bi bi-people-fill me-2 fs-5"></i> Manage Donors
            </Link>

            <Link
              to="/requests"
              className={`sidebar-nav-item ${location.pathname === '/requests' ? 'active' : ''}`}
            >
              <i className="bi bi-droplet-fill me-2 fs-5"></i> Blood Requests
            </Link>

            <div className="sidebar-section-label text-white-50 text-xs text-uppercase font-weight-bold px-2 mt-3 mb-1">
              Management
            </div>

            <button
              onClick={() => handleAdminTab('users')}
              className={`sidebar-nav-item ${location.pathname === '/dashboard' && currentTab === 'users' ? 'active' : ''}`}
            >
              <i className="bi bi-person-gear me-2 fs-5"></i> User Accounts
            </button>

            <button
              onClick={() => handleAdminTab('donations')}
              className={`sidebar-nav-item ${location.pathname === '/dashboard' && currentTab === 'donations' ? 'active' : ''}`}
            >
              <i className="bi bi-heart-pulse-fill me-2 fs-5"></i> Donations Log
            </button>
          </>
        )}

        {isDonor && (
          <>
            <Link
              to="/dashboard"
              className={`sidebar-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <i className="bi bi-grid-1x2-fill me-2 fs-5"></i> Dashboard
            </Link>

            <Link
              to="/requests"
              className={`sidebar-nav-item ${location.pathname === '/requests' ? 'active' : ''}`}
            >
              <i className="bi bi-droplet-half me-2 fs-5"></i> Blood Requests
            </Link>

            <Link
              to="/profile"
              className={`sidebar-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              <i className="bi bi-person-circle me-2 fs-5"></i> My Profile
            </Link>
          </>
        )}

        {isSeeker && (
          <>
            <Link
              to="/dashboard"
              className={`sidebar-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <i className="bi bi-grid-1x2-fill me-2 fs-5"></i> Dashboard
            </Link>

            <Link
              to="/donors"
              className={`sidebar-nav-item ${location.pathname === '/donors' ? 'active' : ''}`}
            >
              <i className="bi bi-search-heart me-2 fs-5"></i> Find Donors
            </Link>

            <Link
              to="/requests"
              className={`sidebar-nav-item ${location.pathname === '/requests' ? 'active' : ''}`}
            >
              <i className="bi bi-file-earmark-plus-fill me-2 fs-5"></i> My Requests
            </Link>

            <Link
              to="/profile"
              className={`sidebar-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              <i className="bi bi-person-circle me-2 fs-5"></i> My Profile
            </Link>
          </>
        )}

        <div className="mt-auto pt-3 border-top border-secondary border-opacity-25">
          <button onClick={handleLogout} className="sidebar-nav-item text-danger w-100 border-0 bg-transparent text-start">
            <i className="bi bi-box-arrow-left me-2 fs-5"></i> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
