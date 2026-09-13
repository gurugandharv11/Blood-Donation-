import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth, authApi } from '../services/api';
import { useToast } from '../components/ToastContext';
import { RaktdaanLogo } from '../components/RaktdaanLogo';
import { OtpVerificationModal } from '../components/OtpVerificationModal';

export const Login = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('582914');

  useEffect(() => {
    if (Auth.isLoggedIn() && !Auth.isExpired()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginAttempt = async (emailVal, passVal) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email: emailVal.trim(), password: passVal });
      if (response.success && response.data) {
        // Trigger 6-digit Email OTP Verification Modal
        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(randomOtp);
        setPendingLoginData(response.data);
        setShowOtpModal(true);
        showSuccess(`Security OTP sent to ${emailVal.trim()}`);
      } else {
        showError(response.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      showError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerifySuccess = () => {
    if (pendingLoginData) {
      Auth.saveSession(pendingLoginData);
      showSuccess(`Welcome back, ${pendingLoginData.name}! Redirecting...`);
      setShowOtpModal(false);
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    handleLoginAttempt(email, password);
  };

  // Quick 1-Click Demo Login handler
  const handleQuickDemoLogin = (role) => {
    let demoEmail = 'seeker@example.com';
    if (role === 'donor') demoEmail = 'donor@example.com';
    if (role === 'admin') demoEmail = 'admin@example.com';

    setEmail(demoEmail);
    setPassword('password123');
    handleLoginAttempt(demoEmail, 'password123');
  };

  return (
    <div className="auth-page dark-theme-page min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="auth-card glass-card shadow-2xl p-4 p-md-5">
        <div className="auth-logo text-center mb-4">
          <Link to="/" className="d-inline-block text-decoration-none mb-3">
            <RaktdaanLogo size="medium" />
          </Link>
          <h2 className="auth-title text-white h3 fw-bold mt-2">Welcome Back</h2>
          <p className="auth-subtitle text-white-50 small">एक कदम रक्तदान की ओर, एक जीवन बचाने की ओर।</p>
        </div>

        {/* 1-Click Quick Demo Login Shortcuts */}
        <div className="demo-login-box p-3 mb-4 rounded-3 text-center border border-danger-subtle bg-danger-subtle bg-opacity-10">
          <div className="text-danger-emphasis small fw-bold mb-2">
            <i className="bi bi-lightning-fill me-1"></i> Quick 1-Click Demo Login:
          </div>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 text-xs"
              onClick={() => handleQuickDemoLogin('seeker')}
              disabled={loading}
            >
              Seeker Demo
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-success rounded-pill px-3 py-1 text-xs"
              onClick={() => handleQuickDemoLogin('donor')}
              disabled={loading}
            >
              Donor Demo
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-warning rounded-pill px-3 py-1 text-xs"
              onClick={() => handleQuickDemoLogin('admin')}
              disabled={loading}
            >
              Admin Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label-custom text-white small fw-semibold">Email Address</label>
            <input
              type="email"
              className={`form-control-custom ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="form-error">{errors.email}</div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label htmlFor="password" className="form-label-custom text-white small fw-semibold">Password</label>
            </div>
            <input
              type="password"
              className={`form-control-custom ${errors.password ? 'is-invalid' : ''}`}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="form-error">{errors.password}</div>
          </div>

          <button
            type="submit"
            className="btn-primary-custom btn-glow-3d w-100 justify-content-center py-2.5"
            id="loginBtn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Verifying Email...
              </>
            ) : (
              <>
                <i className="bi bi-shield-lock me-2"></i> Sign In & Verify OTP
              </>
            )}
          </button>
        </form>

        <div className="divider-text text-center my-3 text-white-50 position-relative">
          <span className="bg-dark px-2 small">New to the platform?</span>
        </div>

        <Link
          to="/register"
          className="btn btn-outline-light text-white w-100 py-2 rounded-pill border-opacity-25"
          style={{ fontWeight: 600, fontSize: '0.875rem' }}
        >
          <i className="bi bi-person-plus me-2"></i> Create an Account
        </Link>
        
        <div className="text-center mt-3">
          <Link to="/" className="text-white-50 text-decoration-none small">
            <i className="bi bi-arrow-left me-1"></i> Back to Home
          </Link>
        </div>
      </div>

      {/* 6-Digit Email OTP Security Verification Modal */}
      <OtpVerificationModal
        email={email || 'user@example.com'}
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerifySuccess={handleOtpVerifySuccess}
        generatedOtp={generatedOtp}
      />
    </div>
  );
};
