// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="glass-navbar border-top mt-auto py-5" style={{ background: 'var(--glass-bg)' }}>
      <div className="container">
        <div className="row g-4 justify-content-between">
          
          {/* Brand and Description */}
          <div className="col-lg-4 col-md-6">
            <Link className="d-flex align-items-center gap-2 fw-bold fs-4 mb-3 text-decoration-none" to="/" style={{ color: 'var(--primary-color)' }}>
              <i className="bi bi-briefcase-fill"></i>
              <span className="text-main-color">Placement<span style={{ color: 'var(--primary-color)' }}>Portal</span></span>
            </Link>
            <p className="text-muted-color mb-4" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              A modern Student Career & Placement Portal helping students prepare for placement processes, share study resources, showcase projects, and discover job/internship opportunities.
            </p>
            {/* Social Icons */}
            <div className="d-flex gap-3">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-github"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-facebook"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-3 col-md-6 ms-lg-auto">
            <h5 className="fw-bold mb-3 text-main-color">Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
              <li><Link to="/" className="text-muted-color text-decoration-none hover-primary">Home Base</Link></li>
              <li><Link to="/about" className="text-muted-color text-decoration-none hover-primary">About Portal</Link></li>
              <li><Link to="/courses" className="text-muted-color text-decoration-none hover-primary">Interactive Courses</Link></li>
              <li><Link to="/notes" className="text-muted-color text-decoration-none hover-primary">Notes & PDFs</Link></li>
              <li><Link to="/projects" className="text-muted-color text-decoration-none hover-primary">Student Showcases</Link></li>
              <li><Link to="/jobs" className="text-muted-color text-decoration-none hover-primary">Careers Board</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-bold mb-3 text-main-color">Contact Support</h5>
            <ul className="list-unstyled d-flex flex-column gap-3 text-muted-color" style={{ fontSize: '0.9rem' }}>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-geo-alt-fill text-primary"></i>
                <span>Appex Planet Campus, India</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-envelope-fill text-primary"></i>
                <a href="mailto:support@placement.com" className="text-muted-color text-decoration-none">support@placement.com</a>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-telephone-fill text-primary"></i>
                <span>+91 99999 99999</span>
              </li>
            </ul>
          </div>

        </div>

        <hr className="my-4 border-secondary border-opacity-10" />

        <div className="row align-items-center justify-content-between text-center text-md-start">
          <div className="col-md-6">
            <p className="text-muted-color mb-0" style={{ fontSize: '0.85rem' }}>
              &copy; {new Date().getFullYear()} Student Career & Placement Portal. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end mt-2 mt-md-0">
            <p className="text-muted-color mb-0" style={{ fontSize: '0.85rem' }}>
              Designed with <i className="bi bi-heart-fill text-danger"></i> for Software Engineering Portfolios.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
