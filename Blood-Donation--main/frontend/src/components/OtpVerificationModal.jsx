import React, { useState, useEffect } from 'react';
import { sendFirebaseOtp, verifyFirebaseOtp } from '../services/firebase';

export const OtpVerificationModal = ({ email, isOpen, onClose, onVerifySuccess }) => {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [livePreviewUrl, setLivePreviewUrl] = useState(null);
  const [sendingStatus, setSendingStatus] = useState('Dispatching real EmailJS security OTP...');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && email) {
      setSendingStatus(`Real EmailJS OTP dispatched to ${email}`);
      sendFirebaseOtp(email).then((res) => {
        if (res && res.previewUrl) {
          setLivePreviewUrl(res.previewUrl);
        }
      });
    }
  }, [isOpen, email]);

  useEffect(() => {
    let interval = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newValues = [...otpValues];
    newValues[index] = val.substring(val.length - 1);
    setOtpValues(newValues);
    setErrorMsg('');

    // Auto-focus next input box
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const enteredOtp = otpValues.join('');
    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyFirebaseOtp(email, enteredOtp);
      if (res.success) {
        onVerifySuccess();
      } else {
        setErrorMsg(res.message || 'Incorrect OTP code. Please check your Gmail Inbox / Spam folder.');
      }
    } catch (err) {
      setErrorMsg('OTP Verification error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setErrorMsg('');
    setOtpValues(['', '', '', '', '', '']);
    setSendingStatus(`New EmailJS OTP code dispatched to ${email}`);
    
    const res = await sendFirebaseOtp(email);
    if (res && res.previewUrl) {
      setLivePreviewUrl(res.previewUrl);
    }
  };

  return (
    <div className="modal show d-block modal-custom" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
        <div className="modal-content glass-card p-4 rounded-4 border-gradient text-center">
          
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger bg-opacity-25 text-danger px-2.5 py-1 rounded-2 border border-danger border-opacity-25 small fw-bold">
                <i className="bi bi-envelope-check-fill me-1"></i> EmailJS Real OTP
              </span>
              <h5 className="modal-title text-white fw-bold h5 mb-0">Security Verification</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <p className="text-white-50 small mb-3">
            Real 6-digit EmailJS OTP code sent to Gmail inbox:<br />
            <strong className="text-white fs-6">{email}</strong>
          </p>

          {/* Real Email Inbox Notice & Link */}
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border-opacity-25 text-start p-3 rounded-3 mb-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-mailbox2 text-danger fs-5"></i>
                <span className="text-white fw-semibold small">Check EmailJS Inbox</span>
              </div>
              {livePreviewUrl ? (
                <a
                  href={livePreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-danger py-1 px-2.5 text-xs rounded-pill fw-bold text-white text-decoration-none shadow-sm"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i> Open Email Inbox
                </a>
              ) : (
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-danger py-1 px-2 text-xs rounded-pill text-decoration-none"
                >
                  <i className="bi bi-google me-1"></i> Open Gmail
                </a>
              )}
            </div>
            <div className="text-white-50 small" style={{ fontSize: '0.8rem' }}>
              {sendingStatus}. Open your Gmail inbox (or click <strong>Open Email Inbox</strong>) to copy your EmailJS 6-digit code.
            </div>
          </div>

          <form onSubmit={handleVerify}>
            <div className="d-flex justify-content-center gap-2 mb-3">
              {otpValues.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength="1"
                  className="form-control text-center text-white fw-bold fs-4 rounded-3 border border-secondary border-opacity-50"
                  style={{ width: '48px', height: '56px', backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
                  value={digit}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {errorMsg && <div className="text-danger small fw-semibold mb-3">{errorMsg}</div>}

            <button 
              type="submit" 
              className="btn-primary-custom btn-glow-3d w-100 justify-content-center py-2.5 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Verifying EmailJS OTP...
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check me-2"></i> Verify EmailJS OTP
                </>
              )}
            </button>
          </form>

          <div className="d-flex justify-content-between align-items-center small text-white-50">
            <span>
              {timer > 0 ? `Resend OTP in ${timer}s` : "Didn't receive OTP?"}
            </span>
            <button
              type="button"
              className="btn btn-link text-danger text-decoration-none p-0 small fw-bold"
              disabled={timer > 0}
              onClick={handleResend}
            >
              Resend EmailJS OTP
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
