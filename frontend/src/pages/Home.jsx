import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Home = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      {/* Hero Section */}
      <header className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="hero-title">
                Your Blood Can <span className="highlight">Save a Life</span> Today
              </h1>
              <p className="hero-subtitle mt-3">
                Join our platform as a donor or request blood instantly. We connect available donors directly with patients in real-time.
              </p>
              <div className="hero-cta-group">
                <Link to="/register" className="btn-primary-custom">
                  <i className="bi bi-heart-pulse"></i> Become a Donor
                </Link>
                <Link to="/donors" className="btn-outline-custom">
                  <i className="bi bi-search"></i> Search Donors
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat-item">
                  <div className="stat-number">2,500+</div>
                  <div className="stat-label">Active Donors</div>
                </div>
                <div className="hero-stat-item">
                  <div className="stat-number">1,800+</div>
                  <div className="stat-label">Lives Saved</div>
                </div>
                <div className="hero-stat-item">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">Cities Covered</div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div className="blood-drop-animation">
                <div className="orbit-ring orbit-ring-1"><div className="orbit-dot"></div></div>
                <div className="orbit-ring orbit-ring-2"><div className="orbit-dot"></div></div>
                <div className="blood-drop-large">
                  <i className="bi bi-droplet-fill drop-icon"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple, quick, and transparent process from registration to donation.</p>
          </div>
          <div className="row g-4 mt-2">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon-wrap"><i className="bi bi-person-plus-fill"></i></div>
                <h3 className="feature-title">1. Register Account</h3>
                <p className="feature-desc">Sign up as a Seeker or Donor. Setup your profile details and set your city location.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon-wrap"><i className="bi bi-search-heart"></i></div>
                <h3 className="feature-title">2. Search or Request</h3>
                <p className="feature-desc">Filter available donors instantly or raise a blood request specifying hospital details and urgency.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon-wrap"><i className="bi bi-droplet-half"></i></div>
                <h3 className="feature-title">3. Save Lives</h3>
                <p className="feature-desc">Donors accept requests, arrange donations, and mark completion. Real-time updates all the way.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
