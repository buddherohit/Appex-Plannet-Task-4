// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check basic parameters
    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      setError("Please fill in all input fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const result = await register(fullName, email, mobile, password);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message + " Redirecting to login...");
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message || "Registration failed.");
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center align-items-center min-vh-75 mt-4">
        <div className="col-md-6 col-lg-5">
          <div className="glass-card p-4 p-md-5 shadow-lg">
            
            <div className="text-center mb-4">
              <h2 className="fw-bold text-main-color">Create Account</h2>
              <p className="text-muted-color">Join the portal as a Student</p>
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
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label text-main-color fw-semibold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">
                    <i className="bi bi-person-fill"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

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

              {/* Mobile Number */}
              <div className="mb-3">
                <label className="form-label text-main-color fw-semibold">Mobile Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">
                    <i className="bi bi-telephone-fill"></i>
                  </span>
                  <input 
                    type="tel" 
                    className="form-control border-start-0" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter mobile number"
                    pattern="[0-9]{10}"
                    title="10 digit phone number"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label text-main-color fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">
                    <i className="bi bi-shield-lock-fill"></i>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control border-start-0 border-end-0" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password (min 6 chars)"
                    required
                  />
                  <button 
                    type="button" 
                    className="input-group-text bg-transparent border-start-0 text-muted"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  >
                    {showPassword ? <i className="bi bi-eye-slash-fill"></i> : <i className="bi bi-eye-fill"></i>}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label text-main-color fw-semibold">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">
                    <i className="bi bi-shield-check"></i>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control border-start-0" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit" 
                className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <i className="bi bi-person-plus-fill"></i> Create Account
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-muted-color mb-0" style={{ fontSize: '0.9rem' }}>
                Already registered?{' '}
                <Link to="/login" style={{ color: 'var(--primary-color)' }} className="text-decoration-none fw-bold">
                  Sign In
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
