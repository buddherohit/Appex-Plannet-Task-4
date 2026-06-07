// frontend/src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="pt-5">
      {/* 1. Hero Section */}
      <section className="py-5 mt-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-bold mb-3">
                <i className="bi bi-stars me-2"></i>Empowering Student Careers
              </span>
              <h1 className="display-4 fw-extrabold mb-4" style={{ letterSpacing: '-1px', lineHeight: '1.2' }}>
                Your Gateway to a <br />
                <span style={{
                  background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '800'
                }}>Brilliant Future</span>
              </h1>
              <p className="lead text-muted-color mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
                Access courses, download study notes, showcase projects, and land your dream job or internship. All in one centralized portal built for the next generation of engineers.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary-custom px-4 py-3">
                    Go to Dashboard <i className="bi bi-arrow-right ms-2"></i>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary-custom px-4 py-3">
                      Join Portal <i className="bi bi-person-plus ms-2"></i>
                    </Link>
                    <Link to="/login" className="btn btn-secondary-custom px-4 py-3">
                      Learn More
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="position-relative d-inline-block">
                {/* Floating graphic overlay with CSS glassmorphism */}
                <div className="glass-card p-4 position-absolute top-10 start-0 translate-middle-y d-none d-md-block shadow-lg" style={{ width: '220px', zIndex: '10' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-success-subtle text-success rounded p-2">
                      <i className="bi bi-check-circle-fill fs-3"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">100% Secure</h6>
                      <small className="text-muted">Data & Uploads</small>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-4 position-absolute bottom-0 end-0 d-none d-md-block shadow-lg" style={{ width: '240px', zIndex: '10' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary-subtle text-primary rounded p-2">
                      <i className="bi bi-briefcase-fill fs-3"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">500+ Placements</h6>
                      <small className="text-muted">In Active Tech Giants</small>
                    </div>
                  </div>
                </div>
                {/* Main Hero SVG representation */}
                <svg viewBox="0 0 500 500" width="100%" height="400" className="img-fluid" style={{ maxWidth: '480px' }}>
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'var(--primary-color)', stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: 'var(--secondary-color)', stopOpacity: 0.8 }} />
                    </linearGradient>
                  </defs>
                  <circle cx="250" cy="250" r="180" fill="url(#grad1)" />
                  <path d="M 170 300 L 250 150 L 330 300 Z" fill="rgba(255,255,255,0.2)" />
                  <rect x="230" y="270" width="40" height="80" rx="5" fill="rgba(255,255,255,0.9)" />
                  <circle cx="250" cy="150" r="25" fill="#ffffff" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-5" style={{ background: 'rgba(99, 102, 241, 0.03)' }}>
        <div className="container">
          <div className="glass-card p-4 p-md-5">
            <div className="row g-4 text-center">
              <div className="col-md-3 col-6">
                <h2 className="display-5 fw-bold text-main-color">1200+</h2>
                <p className="text-muted mb-0">Active Students</p>
              </div>
              <div className="col-md-3 col-6">
                <h2 className="display-5 fw-bold text-main-color">80+</h2>
                <p className="text-muted mb-0">Verified Courses</p>
              </div>
              <div className="col-md-3 col-6">
                <h2 className="display-5 fw-bold text-main-color">450+</h2>
                <p className="text-muted mb-0">Study Notes</p>
              </div>
              <div className="col-md-3 col-6">
                <h2 className="display-5 fw-bold text-main-color">200+</h2>
                <p className="text-muted mb-0">Recruitment Partners</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section className="py-5 my-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-6 text-main-color">Portal Offerings</h2>
            <p className="text-muted-color mx-auto" style={{ maxWidth: '600px' }}>
              Explore the core modules engineered to transition you from classroom learning straight to high-impact professional fields.
            </p>
          </div>

          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-6 col-lg-3">
              <div className="glass-card p-4 h-100 hover-lift transition-all">
                <div className="bg-primary text-white rounded-3 p-3 d-inline-block mb-3">
                  <i className="bi bi-mortarboard-fill fs-4"></i>
                </div>
                <h5 className="fw-bold mb-2">Academic Courses</h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  Interactive courses across major categories like Full Stack Development, Data Structures, and Cloud Computing.
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="col-md-6 col-lg-3">
              <div className="glass-card p-4 h-100 hover-lift transition-all">
                <div className="bg-info text-white rounded-3 p-3 d-inline-block mb-3">
                  <i className="bi bi-file-earmark-pdf-fill fs-4"></i>
                </div>
                <h5 className="fw-bold mb-2">Resource Sharing</h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  Download hand-written notes, syllabus summaries, and lecture notes in PDF, PPT, and DOCX formats.
                </p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="col-md-6 col-lg-3">
              <div className="glass-card p-4 h-100 hover-lift transition-all">
                <div className="bg-success text-white rounded-3 p-3 d-inline-block mb-3">
                  <i className="bi bi-code-slash fs-4"></i>
                </div>
                <h5 className="fw-bold mb-2">Projects Showcase</h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  Build your digital developer profile. Upload projects with complete GitHub links and direct production demo URLs.
                </p>
              </div>
            </div>
            {/* Feature 4 */}
            <div className="col-md-6 col-lg-3">
              <div className="glass-card p-4 h-100 hover-lift transition-all">
                <div className="bg-warning text-white rounded-3 p-3 d-inline-block mb-3">
                  <i className="bi bi-briefcase-fill fs-4"></i>
                </div>
                <h5 className="fw-bold mb-2">Jobs & Internships</h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  Find off-campus job opportunities and internships. Use criteria filtering to target roles matching your skillset.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Banner Call to Action */}
      <section className="py-5 mb-5">
        <div className="container">
          <div className="glass-card p-5 text-center text-white position-relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
            border: 'none'
          }}>
            <h2 className="fw-bold display-6 mb-3">Ready to Accelerate Your Career?</h2>
            <p className="mx-auto mb-4 opacity-80" style={{ maxWidth: '600px', fontSize: '1.1rem' }}>
              Create an account now to access all resource modules, apply for active job listings, and present your projects to recruiters.
            </p>
            <Link to="/register" className="btn btn-light text-primary fw-bold px-4 py-3 rounded-pill">
              Get Started Now <i className="bi bi-chevron-right ms-1"></i>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
