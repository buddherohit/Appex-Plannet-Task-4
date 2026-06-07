// frontend/src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email if prefilled from routing state redirect
  const [email, setEmail] = useState(location.state?.email || '');
  const [tokenValue, setTokenValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !tokenValue || !newPassword || !confirmPassword) {
      setError("Please fill in all inputs.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(email, tokenValue, newPassword);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message + " Redirecting to Login screen...");
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setError(result.message || "Failed to reset password.");
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center align-items-center min-vh-75 mt-4">
        <div className="col-md-6 col-lg-5">
          <div className="glass-card p-4 p-md-5 shadow-lg">
            
            <div className="text-center mb-4">
              <h2 className="fw-bold text-main-color">Set New Password</h2>
              <p className="text-muted-color">Submit the recovery code sent to your account</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            {success && (
              <div className="alert alert-success d-flex align-items-center gap-2 border-0" role="alert">
                <i className="bi bi-check-circle-fill"></i>
                <div>{success}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label text-main-color fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">
                    <i className="bi bi-envelope-fill"></i>
                  </span>
                  <input 
                    type="email" 
                    className="form-control border-start-0" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              {/* Recovery Code */}
              <div className="mb-3">
                <label className="form-label text-main-color fw-semibold">Recovery Code (Token)</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">
                    <i className="bi bi-key-fill"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0" 
                    value={tokenValue}
                    onChange={(e) => setTokenValue(e.target.value)}
                    placeholder="Enter copied token"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label className="form-label text-main-color fw-semibold">New Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">
                    <i className="bi bi-shield-lock-fill"></i>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control border-start-0 border-end-0" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <button 
                    type="button" 
                    className="input-group-text bg-transparent border-start-0 text-muted"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="mb-4">
                <label className="form-label text-main-color fw-semibold">Confirm New Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">
                    <i className="bi bi-shield-check"></i>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control border-start-0" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <i className="bi bi-shield-lock-fill"></i> Save Password
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-muted-color mb-0" style={{ fontSize: '0.9rem' }}>
                Cancel reset?{' '}
                <Link to="/login" style={{ color: 'var(--primary-color)' }} className="text-decoration-none fw-bold">
                  Go back to Login
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
