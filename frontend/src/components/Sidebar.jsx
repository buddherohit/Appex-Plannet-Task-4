// frontend/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className={`sidebar-container ${isOpen ? 'show' : ''} d-flex flex-column pt-5`}>
      {/* Title */}
      <div className="px-4 mb-4 mt-2">
        <h6 className="text-uppercase text-muted fw-bold tracking-wider" style={{ fontSize: '0.75rem' }}>
          Portal Navigation
        </h6>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-grow-1">
        <NavLink 
          to="/dashboard" 
          onClick={toggleSidebar}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/courses" 
          onClick={toggleSidebar}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-mortarboard"></i>
          <span>{user.role === 'admin' ? 'Manage Courses' : 'Courses'}</span>
        </NavLink>

        <NavLink 
          to="/notes" 
          onClick={toggleSidebar}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-journal-text"></i>
          <span>{user.role === 'admin' ? 'Manage Notes' : 'Notes & Resources'}</span>
        </NavLink>

        <NavLink 
          to="/projects" 
          onClick={toggleSidebar}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-code-square"></i>
          <span>{user.role === 'admin' ? 'Manage Projects' : 'Projects Showcase'}</span>
        </NavLink>

        <NavLink 
          to="/jobs" 
          onClick={toggleSidebar}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-briefcase"></i>
          <span>{user.role === 'admin' ? 'Manage Jobs' : 'Jobs & Internships'}</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          onClick={toggleSidebar}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-person-gear"></i>
          <span>Profile Settings</span>
        </NavLink>
      </div>

      {/* Quick stats footer for sidebar */}
      <div className="p-4 mt-auto border-top border-secondary border-opacity-10 text-center">
        <div className="glass-card p-3 rounded" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <small className="d-block text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Logged in as</small>
          <div className="fw-semibold text-truncate" style={{ fontSize: '0.85rem' }}>{user.full_name}</div>
          <span className="badge mt-2 bg-primary text-uppercase" style={{ fontSize: '0.65rem' }}>{user.role}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
