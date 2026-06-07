// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api, { API_BASE_URL } from '../services/api';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile fields state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status state
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsSuccess, setDetailsSuccess] = useState('');
  const [detailsError, setDetailsError] = useState('');

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Prefill details from auth context
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setMobile(user.mobile || '');
    }
  }, [user]);

  // Update profile details handler
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setDetailsError('');
    setDetailsSuccess('');

    if (!fullName || !email || !mobile) {
      setDetailsError("Please fill in all general details.");
      return;
    }

    setDetailsLoading(true);

    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('email', email);
    formData.append('mobile', mobile);
    
    if (profileImageFile) {
      formData.append('profile_image', profileImageFile);
    }

    const result = await updateProfile(formData);
    setDetailsLoading(false);

    if (result.success) {
      setDetailsSuccess(result.message || "Profile details updated successfully!");
      setProfileImageFile(null); // Reset file input
      // Clear success message after 4 seconds
      setTimeout(() => setDetailsSuccess(''), 4000);
    } else {
      setDetailsError(result.message || "Failed to update profile details.");
    }
  };

  // Change password handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters.");
      return;
    }

    setPwdLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setPwdLoading(false);

    if (result.success) {
      setPwdSuccess(result.message || "Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(''), 4000);
    } else {
      setPwdError(result.message || "Failed to update password.");
    }
  };

  // Resolve profile image URL
  const getAvatarUrl = () => {
    if (user && user.profile_image) {
      return `${API_BASE_URL}/${user.profile_image}`;
    }
    return null;
  };

  return (
    <div className="d-flex min-vh-100" style={{ paddingTop: '80px' }}>
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-content">
        
        {/* Toggle Mobile Sidebar */}
        <div className="d-lg-none mb-3">
          <button onClick={toggleSidebar} className="btn btn-primary-custom d-flex align-items-center gap-2">
            <i className="bi bi-list"></i> Menu
          </button>
        </div>

        {/* Heading */}
        <div className="mb-4">
          <h1 className="fw-bold mb-1 text-main-color">Profile Settings</h1>
          <p className="text-muted mb-0">Manage your contact credentials and credentials passwords</p>
        </div>

        <div className="row g-4">
          
          {/* 1. Account Details Form */}
          <div className="col-lg-7">
            <div className="glass-card p-4 p-md-5 h-100">
              <h4 className="fw-bold text-main-color mb-4"><i className="bi bi-person-badge-fill text-primary me-2"></i>Personal Details</h4>

              {detailsSuccess && <div className="alert alert-success border-0 mb-3">{detailsSuccess}</div>}
              {detailsError && <div className="alert alert-danger border-0 mb-3">{detailsError}</div>}

              <form onSubmit={handleDetailsSubmit}>
                {/* Profile photo view & upload */}
                <div className="d-flex align-items-center gap-4 mb-4">
                  <div>
                    {getAvatarUrl() ? (
                      <img 
                        src={getAvatarUrl()} 
                        alt={user?.full_name} 
                        className="rounded-circle object-fit-cover shadow border border-primary border-3" 
                        style={{ width: '90px', height: '90px' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow border border-primary border-3" 
                        style={{ width: '90px', height: '90px', fontSize: '2.5rem', backgroundColor: 'var(--primary-color)' }}
                      >
                        {user?.full_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="form-label fw-semibold mb-1">Update Profile Picture</label>
                    <input 
                      type="file" 
                      className="form-control form-control-sm" 
                      accept="image/*"
                      onChange={(e) => setProfileImageFile(e.target.files[0])}
                    />
                    <small className="text-muted">JPG, PNG or WEBP formats. Size limit: 3MB.</small>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Mobile number */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Mobile Number</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    pattern="[0-9]{10}"
                    title="10 digit phone number"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary-custom w-100 py-2 btn-sm" disabled={detailsLoading}>
                  {detailsLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Update Profile Details'}
                </button>
              </form>
            </div>
          </div>

          {/* 2. Password Reset Form */}
          <div className="col-lg-5">
            <div className="glass-card p-4 p-md-5 h-100">
              <h4 className="fw-bold text-main-color mb-4"><i className="bi bi-shield-lock-fill text-primary me-2"></i>Change Password</h4>

              {pwdSuccess && <div className="alert alert-success border-0 mb-3">{pwdSuccess}</div>}
              {pwdError && <div className="alert alert-danger border-0 mb-3">{pwdError}</div>}

              <form onSubmit={handlePasswordSubmit}>
                {/* Current password */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Current Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                {/* New password */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create new password"
                    required
                  />
                </div>

                {/* Confirm new password */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary-custom w-100 py-2 btn-sm" disabled={pwdLoading}>
                  {pwdLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Change Account Password'}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
