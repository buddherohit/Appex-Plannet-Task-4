// frontend/src/pages/AboutPage.jsx
import React from 'react';

const AboutPage = () => {
  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          
          {/* Header */}
          <div className="text-center mb-5 mt-4">
            <h1 className="fw-bold display-5 text-main-color">About Our Portal</h1>
            <p className="lead text-muted-color mx-auto" style={{ maxWidth: '700px' }}>
              The Student Career & Placement Portal bridges the gap between learning materials and industrial placements.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <div className="glass-card p-4 h-100">
                <h3 className="fw-bold mb-3" style={{ color: 'var(--primary-color)' }}>
                  <i className="bi bi-rocket-takeoff-fill me-2"></i>Our Mission
                </h3>
                <p className="text-muted-color mb-0" style={{ lineHeight: '1.7' }}>
                  To democratize access to academic resources and career opportunities for students. We strive to provide a single, robust platform where students can seamlessly acquire placement preparation study materials, upload structural work, and connect directly with placement opportunities.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="glass-card p-4 h-100">
                <h3 className="fw-bold mb-3" style={{ color: 'var(--secondary-color)' }}>
                  <i className="bi bi-eye-fill me-2"></i>Our Vision
                </h3>
                <p className="text-muted-color mb-0" style={{ lineHeight: '1.7' }}>
                  To foster an active ecosystem where academic learning directly aligns with hiring realities. We envision a portal that streamlines placement administration tasks, automates progress reports for college hubs, and boosts overall student employability stats.
                </p>
              </div>
            </div>
          </div>

          {/* Features Detail */}
          <div className="glass-card p-4 p-md-5 mb-5">
            <h2 className="fw-bold text-center mb-5 text-main-color">How It Works</h2>
            
            <div className="row g-4 align-items-center">
              <div className="col-md-6">
                <div className="d-flex gap-3 mb-4">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', minWidth: '45px' }}>
                    <h5 className="mb-0 fw-bold">1</h5>
                  </div>
                  <div>
                    <h5 className="fw-bold text-main-color">Register & Build Profile</h5>
                    <p className="text-muted-color">Students create accounts, add contact parameters, and upload profile pictures representing their professional identity.</p>
                  </div>
                </div>

                <div className="d-flex gap-3 mb-4">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', minWidth: '45px' }}>
                    <h5 className="mb-0 fw-bold">2</h5>
                  </div>
                  <div>
                    <h5 className="fw-bold text-main-color">Acquire Study Materials</h5>
                    <p className="text-muted-color">Browse available courses and download student/faculty notes in PDF, DOCX, and PPT formats for placement review sessions.</p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', minWidth: '45px' }}>
                    <h5 className="mb-0 fw-bold">3</h5>
                  </div>
                  <div>
                    <h5 className="fw-bold text-main-color">Showcase Portfolios</h5>
                    <p className="text-muted-color">Register your student coding projects. Include GitHub repository links and direct production demo links for recruiters to view.</p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex gap-3 mb-4">
                  <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', minWidth: '45px', backgroundColor: 'var(--secondary-color) !important' }}>
                    <h5 className="mb-0 fw-bold">4</h5>
                  </div>
                  <div>
                    <h5 className="fw-bold text-main-color">Search Placement Openings</h5>
                    <p className="text-muted-color">Locate active off-campus job opportunities and internships. Click direct redirect URLs to submit applications.</p>
                  </div>
                </div>

                <div className="d-flex gap-3 mb-4">
                  <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', minWidth: '45px', backgroundColor: 'var(--secondary-color) !important' }}>
                    <h5 className="mb-0 fw-bold">5</h5>
                  </div>
                  <div>
                    <h5 className="fw-bold text-main-color">Role-based Privileges</h5>
                    <p className="text-muted-color">Administrators utilize stats grids, Chart.js trends dashboards, and activity log tables to update resources, jobs, and user metrics.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;
