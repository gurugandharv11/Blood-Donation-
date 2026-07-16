import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth, authApi } from '../services/api';
import { useToast } from '../components/ToastContext';

export const Register = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Auth.isLoggedIn() && !Auth.isExpired()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!name || name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }
    if (!role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const data = {
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      role
    };

    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        Auth.saveSession(response.data);
        showSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        if (response.data && typeof response.data === 'object') {
          const apiErrors = {};
          Object.entries(response.data).forEach(([field, msg]) => {
            apiErrors[field] = msg;
          });
          setErrors((prev) => ({ ...prev, ...apiErrors }));
        }
        showError(response.message || 'Registration failed.');
      }
    } catch (err) {
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '540px' }}>
        <div className="auth-logo">
          <div className="logo-circle">
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us to save lives or request blood help</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="col-md-12 mb-3">
              <label htmlFor="name" className="form-label-custom">Full Name</label>
              <input
                type="text"
                className={`form-control-custom ${errors.name ? 'is-invalid' : ''}`}
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="form-error" id="nameError">{errors.name}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="regEmail" className="form-label-custom">Email Address</label>
              <input
                type="email"
                className={`form-control-custom ${errors.email ? 'is-invalid' : ''}`}
                id="regEmail"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="form-error" id="regEmailError">{errors.email}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="phone" className="form-label-custom">Phone Number</label>
              <input
                type="tel"
                className={`form-control-custom ${errors.phone ? 'is-invalid' : ''}`}
                id="phone"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="form-error" id="phoneError">{errors.phone}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="regPassword" className="form-label-custom">Password</label>
              <input
                type="password"
                className={`form-control-custom ${errors.password ? 'is-invalid' : ''}`}
                id="regPassword"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="form-error" id="regPasswordError">{errors.password}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="confirmPassword" className="form-label-custom">Confirm Password</label>
              <input
                type="password"
                className={`form-control-custom ${errors.confirmPassword ? 'is-invalid' : ''}`}
                id="confirmPassword"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <div className="form-error" id="confirmPasswordError">{errors.confirmPassword}</div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="role" className="form-label-custom">Select Role</label>
            <select
              className={`form-select form-control-custom ${errors.role ? 'is-invalid' : ''}`}
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Choose Role</option>
              <option value="DONOR">Become a Blood Donor (Donate Blood)</option>
              <option value="SEEKER">Become a Blood Seeker (Need Blood)</option>
            </select>
            <div className="form-error" id="roleError">{errors.role}</div>
          </div>

          {role === 'DONOR' && (
            <div id="donorExtraInfo" className="alert alert-info py-2 px-3 mb-4" style={{ fontSize: '0.8rem', borderRadius: '10px' }}>
              <i className="bi bi-info-circle me-1"></i> As a Donor, you can update your blood group, location, age, and availability inside your profile dashboard after registering.
            </div>
          )}

          <button
            type="submit"
            className="btn-primary-custom w-100 justify-content-center py-2"
            id="registerBtn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating account...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus me-2"></i>Create Account
              </>
            )}
          </button>
        </form>

        <div className="divider-text">
          <span>Already have an account?</span>
        </div>

        <Link
          to="/login"
          className="btn btn-outline-light text-red border-red w-100 py-2 rounded-pill"
          style={{ fontWeight: 600, fontSize: '0.875rem' }}
        >
          <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
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
