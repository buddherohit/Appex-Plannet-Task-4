// frontend/src/components/Header.jsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';

const Header = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Resolve user profile picture URL
  const getAvatarUrl = () => {
    if (user && user.profile_image) {
      return `${API_BASE_URL}/${user.profile_image}`;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <nav className="navbar navbar-expand-lg glass-navbar fixed-top py-3">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" to="/" style={{ color: 'var(--primary-color)' }}>
          <i className="bi bi-briefcase-fill"></i>
          <span className="text-main-color">Placement<span style={{ color: 'var(--primary-color)' }}>Portal</span></span>
        </Link>

        <button 
          className="navbar-toggler border-0 shadow-none text-main-color" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent" 
          aria-controls="navbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-2"></i>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2">
            <li className="nav-item">
              <NavLink className="nav-link fw-medium" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link fw-medium" to="/about">About</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link fw-medium" to="/courses">Courses</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link fw-medium" to="/notes">Notes</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link fw-medium" to="/projects">Projects</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link fw-medium" to="/jobs">Jobs</NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="btn btn-link nav-link p-2 text-main-color border-0 shadow-none" 
              title="Toggle Dark Mode"
              style={{ fontSize: '1.2rem' }}
            >
              {theme === 'light' ? <i className="bi bi-moon-stars-fill"></i> : <i className="bi bi-sun-fill text-warning"></i>}
            </button>

            {/* Auth Dropdown or Action Buttons */}
            {user ? (
              <div className="dropdown">
                <button 
                  className="btn d-flex align-items-center gap-2 p-1 border-0 shadow-none dropdown-toggle avatar-dropdown-toggle" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={user.full_name} 
                      className="rounded-circle object-fit-cover" 
                      style={{ width: '40px', height: '40px', border: '2px solid var(--primary-color)' }} 
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div 
                    className="rounded-circle text-white align-items-center justify-content-center fw-semibold" 
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: 'var(--primary-color)',
                      display: avatarUrl ? 'none' : 'flex'
                    }}
                  >
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-semibold text-main-color d-none d-md-inline">{user.full_name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end glass-card border shadow-lg mt-2 p-2" aria-labelledby="userDropdown" style={{ minWidth: '200px' }}>
                  <li className="px-3 py-2 border-bottom mb-2">
                    <div className="fw-bold text-main-color text-truncate">{user.full_name}</div>
                    <small className="text-muted text-capitalize">{user.role}</small>
                  </li>
                  <li>
                    <Link className="dropdown-item rounded py-2 text-main-color" to="/dashboard">
                      <i className="bi bi-speedometer2 me-2 text-primary"></i>Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item rounded py-2 text-main-color" to="/profile">
                      <i className="bi bi-person-circle me-2 text-primary"></i>My Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item rounded py-2 text-danger w-100 text-start border-0 bg-transparent">
                      <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-secondary-custom px-3 py-2 btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary-custom px-3 py-2 btn-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
