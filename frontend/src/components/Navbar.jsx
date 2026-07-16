import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Auth } from '../services/api';
import { useToast } from './ToastContext';
import { AvatarImage } from './AvatarImage';

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
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-droplet-fill text-red"></i> <span>Blood</span><span className="brand-drop">Donation</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <Link className={`nav-link ${currentPath === '/' ? 'active' : ''}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${currentPath === '/donors' ? 'active' : ''}`} to="/donors">Find Donors</Link>
            </li>
            
            {!loggedIn ? (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${currentPath === '/login' ? 'active' : ''}`} to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link btn-donate-nav px-3" to="/register">Register</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${currentPath === '/dashboard' ? 'active' : ''}`} to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item d-flex align-items-center ms-2 me-1 gap-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                  <AvatarImage name={Auth.getUser()?.name} imageUrl={Auth.getUser()?.profileImage} size={30} />
                  <span className="text-white-50 small d-none d-lg-inline">{Auth.getUser()?.name?.split(' ')[0]}</span>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-danger" href="#" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-left me-1"></i>Logout
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
