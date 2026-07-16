import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Auth } from '../services/api';
import { useToast } from './ToastContext';
import { AvatarImage } from './AvatarImage';

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
    } else {
      onTabChange(tabName);
    }
  };

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
          <span style={{ color: '#E74C3C' }}>Blood</span>Donation
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>
          Platform
        </div>
      </div>
      <div className="d-flex align-items-center gap-3 px-3 py-3 mx-3 my-2 border-bottom border-top border-secondary-subtle" style={{ borderColor: 'rgba(255,255,255,0.08) !important', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
        <AvatarImage name={user?.name} imageUrl={user?.profileImage} size={40} />
        <div className="overflow-hidden">
          <div className="text-white fw-bold text-truncate" style={{ fontSize: '0.85rem' }}>{user?.name}</div>
          <div className="text-white-50 small text-truncate" style={{ fontSize: '0.7rem' }}>{user?.email}</div>
        </div>
      </div>
      <div className="sidebar-nav">
        {isAdmin && (
          <>
            <button
              onClick={() => handleAdminTab('dashboard')}
              className={`sidebar-nav-item ${location.pathname === '/dashboard' && currentTab === 'dashboard' ? 'active' : ''}`}
            >
              <i className="bi bi-grid-1x2"></i> Dashboard
            </button>
            <Link
              to="/donors"
              className={`sidebar-nav-item ${location.pathname === '/donors' ? 'active' : ''}`}
            >
              <i className="bi bi-people"></i> Donors
            </Link>
            <Link
              to="/requests"
              className={`sidebar-nav-item ${location.pathname === '/requests' ? 'active' : ''}`}
            >
              <i className="bi bi-droplet"></i> Blood Requests
            </Link>
            <div className="sidebar-section-label">Management</div>
            <button
              onClick={() => handleAdminTab('users')}
              className={`sidebar-nav-item ${location.pathname === '/dashboard' && currentTab === 'users' ? 'active' : ''}`}
            >
              <i className="bi bi-person-gear"></i> Users
            </button>
            <button
              onClick={() => handleAdminTab('donations')}
              className={`sidebar-nav-item ${location.pathname === '/dashboard' && currentTab === 'donations' ? 'active' : ''}`}
            >
              <i className="bi bi-heart-pulse"></i> Donations
            </button>
          </>
        )}

        {isDonor && (
          <>
            <Link
              to="/dashboard"
              className={`sidebar-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <i className="bi bi-grid-1x2"></i> Dashboard
            </Link>
            <Link
              to="/requests"
              className={`sidebar-nav-item ${location.pathname === '/requests' ? 'active' : ''}`}
            >
              <i className="bi bi-droplet"></i> Blood Requests
            </Link>
            <Link
              to="/profile"
              className={`sidebar-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              <i className="bi bi-person-circle"></i> My Profile
            </Link>
          </>
        )}

        {isSeeker && (
          <>
            <Link
              to="/dashboard"
              className={`sidebar-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <i className="bi bi-grid-1x2"></i> Dashboard
            </Link>
            <Link
              to="/donors"
              className={`sidebar-nav-item ${location.pathname === '/donors' ? 'active' : ''}`}
            >
              <i className="bi bi-search-heart"></i> Find Donors
            </Link>
            <Link
              to="/requests"
              className={`sidebar-nav-item ${location.pathname === '/requests' ? 'active' : ''}`}
            >
              <i className="bi bi-file-earmark-plus"></i> My Requests
            </Link>
            <Link
              to="/profile"
              className={`sidebar-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              <i className="bi bi-person-circle"></i> My Profile
            </Link>
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '2rem' }}>
          <button onClick={handleLogout} className="sidebar-nav-item" style={{ color: 'rgba(255,100,100,0.8)' }}>
            <i className="bi bi-box-arrow-left"></i> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
