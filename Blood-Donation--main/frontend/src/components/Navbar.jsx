import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Auth } from '../services/api';
import { useToast } from './ToastContext';
import { AvatarImage } from './AvatarImage';
import { RaktdaanLogo } from './RaktdaanLogo';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showInfo } = useToast();
  const loggedIn = Auth.isLoggedIn();
  const currentPath = location.pathname;

  const handleLogout = (e) => {
    e.preventDefault();
    Auth.clear();
    showInfo('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center py-1 text-decoration-none" to="/">
          <RaktdaanLogo size="small" showText={true} />
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            <li className="nav-item">
              <Link className={`nav-link ${currentPath === '/' ? 'active' : ''}`} to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className={`nav-link ${currentPath === '/donors' ? 'active' : ''}`} to="/donors">
                <i className="bi bi-search me-1"></i> Find Donors
              </Link>
            </li>
            
            {!loggedIn ? (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${currentPath === '/login' ? 'active' : ''}`} to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                  </Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link className="btn-donate-nav nav-link px-4 text-white" to="/register">
                    <i className="bi bi-heart-fill me-1"></i> Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${currentPath === '/dashboard' ? 'active' : ''}`} to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${currentPath === '/requests' ? 'active' : ''}`} to="/requests">
                    <i className="bi bi-droplet-half me-1"></i> Requests
                  </Link>
                </li>
                
                <li className="nav-item d-flex align-items-center ms-lg-3 my-2 my-lg-0">
                  <div
                    className="user-profile-badge d-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                    onClick={() => navigate('/profile')}
                    style={{ cursor: 'pointer' }}
                  >
                    <AvatarImage name={Auth.getUser()?.name} imageUrl={Auth.getUser()?.profileImage} size={30} />
                    <span className="text-white small fw-bold">{Auth.getUser()?.name?.split(' ')[0]}</span>
                    <span className="badge bg-danger-subtle text-danger-emphasis rounded-pill px-2 py-0.5 small" style={{ fontSize: '0.65rem' }}>
                      {Auth.getRole()?.replace('ROLE_', '')}
                    </span>
                  </div>
                </li>

                <li className="nav-item ms-lg-2">
                  <button className="btn btn-link nav-link text-danger text-decoration-none border-0 bg-transparent" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
