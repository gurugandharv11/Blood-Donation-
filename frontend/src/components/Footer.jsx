import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="footer mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="footer-brand">
              <i className="bi bi-droplet-fill text-red"></i> Blood Donation
            </div>
            <p className="footer-tagline">Connecting hearts and saving lives, one drop at a time.</p>
          </div>
          <div className="col-md-3">
            <h5>Quick Links</h5>
            <Link to="/donors" className="footer-link">Search Donors</Link>
            <Link to="/register" className="footer-link">Become a Donor</Link>
            <Link to="/login" className="footer-link">Sign In</Link>
          </div>
          <div className="col-md-3">
            <h5>Contact Support</h5>
            <p className="mb-1"><i className="bi bi-envelope-fill me-2"></i> gandharvkumar107@gmail.com</p>
            <p><i className="bi bi-telephone-fill me-2"></i> +91 8383899649</p>
          </div>
        </div>
        <hr className="footer-divider" />
        <div className="footer-copy">&copy; 2026 Blood Donation Platform. All Rights Reserved.</div>
      </div>
    </footer>
  );
};
