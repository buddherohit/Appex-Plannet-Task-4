// frontend/src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [simulatedToken, setSimulatedToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSimulatedToken('');

    if (!email) {
      setError("Please specify your email address.");
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      // Retrieve simulated token from payload response
      if (result.data?.reset_token) {
        setSimulatedToken(result.data.reset_token);
      }
    } else {
      setError(result.message || "Failed to submit request.");
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center align-items-center min-vh-75 mt-4">
        <div className="col-md-6 col-lg-5">
          <div className="glass-card p-4 p-md-5 shadow-lg">
            
            <div className="text-center mb-4">
              <h2 className="fw-bold text-main-color">Recover Password</h2>
              <p className="text-muted-color">Enter your registered email address below</p>
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

            {simulatedToken && (
              <div className="alert alert-warning border border-warning border-opacity-25 p-3 rounded mb-4">
                <div className="fw-bold mb-1"><i className="bi bi-info-circle-fill me-2"></i>Simulated Recovery Action:</div>
                <p className="mb-2" style={{ fontSize: '0.85rem' }}>Because mail servers are disabled on local servers, copy this code to complete verification:</p>
                <div className="d-flex align-items-center justify-content-between bg-dark bg-opacity-10 p-2 rounded">
                  <code className="text-danger fw-bold fs-6">{simulatedToken}</code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(simulatedToken)}
                    className="btn btn-sm btn-outline-secondary py-1"
                    title="Copy to Clipboard"
                  >
                    <i className="bi bi-copy"></i> Copy
                  </button>
                </div>
                <div className="mt-3 text-end">
                  <Link to="/reset-password" state={{ email }} className="btn btn-sm btn-primary-custom">
                    Proceed to Reset <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            )}

            {!simulatedToken && (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
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

                <button 
                  type="submit" 
                  className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <>
                      <i className="bi bi-envelope-check-fill"></i> Generate Reset Code
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center mt-4">
              <p className="text-muted-color mb-0" style={{ fontSize: '0.9rem' }}>
                Remember your password?{' '}
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

export default ForgotPasswordPage;
