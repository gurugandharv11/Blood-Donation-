import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth, authApi } from '../services/api';
import { useToast } from '../components/ToastContext';
import { RaktdaanLogo } from '../components/RaktdaanLogo';
import { CityAutocompleteInput } from '../components/CityAutocompleteInput';
import { OtpVerificationModal } from '../components/OtpVerificationModal';
import { BLOOD_GROUPS } from '../services/utils';

export const Register = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('DONOR');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [city, setCity] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('Male');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingRegisterData, setPendingRegisterData] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('582914');

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
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!phone || !/^[0-9+ ]{8,15}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!role) {
      newErrors.role = 'Please select a role';
    }
    if (role === 'DONOR' && !city.trim()) {
      newErrors.city = 'Please enter your city or village name';
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
      role: role === 'DONOR' ? 'ROLE_DONOR' : 'ROLE_SEEKER',
      bloodGroup,
      city: city.trim(),
      age: parseInt(age),
      gender
    };

    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(randomOtp);
        setPendingRegisterData(response.data);
        setShowOtpModal(true);
        showSuccess(`Security OTP sent to ${email.trim()}`);
      } else {
        showError(response.message || 'Registration failed.');
      }
    } catch (err) {
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerifySuccess = () => {
    if (pendingRegisterData) {
      Auth.saveSession(pendingRegisterData);
      showSuccess('Real donor account verified & created! Redirecting...');
      setShowOtpModal(false);
      setTimeout(() => {
        navigate('/donors');
      }, 600);
    }
  };

  return (
    <div className="auth-page dark-theme-page min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="auth-card glass-card shadow-2xl p-4 p-md-5" style={{ maxWidth: '600px' }}>
        <div className="auth-logo text-center mb-4">
          <Link to="/" className="d-inline-block text-decoration-none mb-2">
            <RaktdaanLogo size="medium" />
          </Link>
          <h2 className="auth-title text-white h3 fw-bold mt-2">Register Real Donor / Seeker</h2>
          <p className="auth-subtitle text-white-50 small">एक कदम रक्तदान की ओर, एक जीवन बचाने की ओर।</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="name" className="form-label-custom text-white small fw-semibold">Full Name *</label>
              <input
                type="text"
                className={`form-control-custom ${errors.name ? 'is-invalid' : ''}`}
                id="name"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="form-error">{errors.name}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="phone" className="form-label-custom text-white small fw-semibold">Phone Number *</label>
              <input
                type="tel"
                className={`form-control-custom ${errors.phone ? 'is-invalid' : ''}`}
                id="phone"
                placeholder="+91 8383899649"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="form-error">{errors.phone}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="regEmail" className="form-label-custom text-white small fw-semibold">Email Address *</label>
              <input
                type="email"
                className={`form-control-custom ${errors.email ? 'is-invalid' : ''}`}
                id="regEmail"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="form-error">{errors.email}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="role" className="form-label-custom text-white small fw-semibold">Select Role *</label>
              <select
                className={`form-select form-control-custom ${errors.role ? 'is-invalid' : ''}`}
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="DONOR">Become a Blood Donor (Donate Blood)</option>
                <option value="SEEKER">Become a Blood Seeker (Need Blood)</option>
              </select>
              <div className="form-error">{errors.role}</div>
            </div>
          </div>

          {role === 'DONOR' && (
            <div className="row p-3 mb-3 rounded-3 bg-white bg-opacity-10 border border-secondary border-opacity-25">
              <div className="col-md-6 mb-3">
                <label className="form-label-custom text-white small fw-semibold">Blood Group *</label>
                <select
                  className="form-select form-control-custom"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  required
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3 position-relative">
                <label className="form-label-custom text-white small fw-semibold">City / Village *</label>
                <CityAutocompleteInput
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Type city/village..."
                  className={`form-control-custom ${errors.city ? 'is-invalid' : ''}`}
                />
                <div className="form-error">{errors.city}</div>
              </div>

              <div className="col-md-6 mb-2">
                <label className="form-label-custom text-white small fw-semibold">Gender</label>
                <select className="form-select form-control-custom" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-md-6 mb-2">
                <label className="form-label-custom text-white small fw-semibold">Age (Years)</label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  className="form-control-custom"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="regPassword" className="form-label-custom text-white small fw-semibold">Password *</label>
              <input
                type="password"
                className={`form-control-custom ${errors.password ? 'is-invalid' : ''}`}
                id="regPassword"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="form-error">{errors.password}</div>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="confirmPassword" className="form-label-custom text-white small fw-semibold">Confirm Password *</label>
              <input
                type="password"
                className={`form-control-custom ${errors.confirmPassword ? 'is-invalid' : ''}`}
                id="confirmPassword"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <div className="form-error">{errors.confirmPassword}</div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-custom btn-glow-3d w-100 justify-content-center py-2.5 mt-2"
            id="registerBtn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Verifying Email...
              </>
            ) : (
              <>
                <i className="bi bi-shield-lock me-2"></i> Register & Verify Email OTP
              </>
            )}
          </button>
        </form>

        <div className="divider-text text-center my-3 text-white-50 position-relative">
          <span className="bg-dark px-2 small">Already registered?</span>
        </div>

        <Link
          to="/login"
          className="btn btn-outline-light text-white w-100 py-2 rounded-pill border-opacity-25"
          style={{ fontWeight: 600, fontSize: '0.875rem' }}
        >
          <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
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
