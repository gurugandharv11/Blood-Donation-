import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth, authApi } from '../services/api';
import { useToast } from '../components/ToastContext';

export const Login = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Auth.isLoggedIn() && !Auth.isExpired()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authApi.login({ email: email.trim(), password });
      if (response.success && response.data) {
        Auth.saveSession(response.data);
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        showError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-circle">
            <i className="bi bi-droplet-fill"></i>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to manage requests or donations</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label-custom">Email Address</label>
            <input
              type="email"
              className={`form-control-custom ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="form-error" id="emailError">{errors.email}</div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <label htmlFor="password" className="form-label-custom">Password</label>
            </div>
            <input
              type="password"
              className={`form-control-custom ${errors.password ? 'is-invalid' : ''}`}
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="form-error" id="passwordError">{errors.password}</div>
          </div>

          <button
            type="submit"
            className="btn-primary-custom w-100 justify-content-center py-2"
            id="loginBtn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
              </>
            )}
          </button>
        </form>

        <div className="divider-text">
          <span>New to the platform?</span>
        </div>

        <Link
          to="/register"
          className="btn btn-outline-light text-red border-red w-100 py-2 rounded-pill"
          style={{ fontWeight: 600, fontSize: '0.875rem' }}
        >
          <i className="bi bi-person-plus me-2"></i>Create an Account
        </Link>
        
        <div className="text-center mt-3">
          <Link to="/" className="text-muted text-decoration-none small">
            <i className="bi bi-arrow-left me-1"></i> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
