import React from 'react';

export const Footer = () => {
  return (
    <footer className="footer mt-auto py-4 border-top border-secondary border-opacity-25" style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}>
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-md-6 text-start">
            <div className="footer-brand h5 fw-bold text-white mb-1">
              <i className="bi bi-droplet-fill text-danger me-2"></i> Blood Donation Platform
            </div>
            <p className="footer-tagline text-white-50 small mb-0">
              एक कदम रक्तदान की ओर, एक जीवन बचाने की ओर।
            </p>
          </div>

          <div className="col-md-6 text-md-end text-start">
            <div className="contact-info text-white-50 small">
              <span className="me-3"><i className="bi bi-envelope-fill text-danger me-1"></i> gandharvkumar107@gmail.com</span>
              <span><i className="bi bi-telephone-fill text-danger me-1"></i> +91 8383899649</span>
            </div>
            <div className="footer-copy text-white-50 text-xs mt-2" style={{ fontSize: '0.75rem' }}>
              &copy; 2026 Blood Donation Platform. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
