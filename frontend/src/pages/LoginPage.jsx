// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if redirection parameter exists
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || "Invalid credentials.");
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center align-items-center min-vh-75 mt-4">
        <div className="col-md-6 col-lg-5">
          <div className="glass-card p-4 p-md-5 shadow-lg">
            
            <div className="text-center mb-4">
              <h2 className="fw-bold text-main-color">Welcome Back</h2>
              <p className="text-muted-color">Sign in to access your placement dashboard</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
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
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <label className="form-label text-main-color fw-semibold mb-0">Password</label>
                  <Link to="/forgot-password" style={{ color: 'var(--primary-color)', fontSize: '0.85rem' }} className="text-decoration-none fw-medium">
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">
                    <i className="bi bi-shield-lock-fill"></i>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control border-start-0 border-end-0" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
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

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary-custom w-100 py-2 mt-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i> Sign In
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-muted-color mb-0" style={{ fontSize: '0.9rem' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--primary-color)' }} className="text-decoration-none fw-bold">
                  Register here
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
