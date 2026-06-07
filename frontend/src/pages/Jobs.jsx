// frontend/src/pages/Jobs.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const Jobs = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 1,
    current_page: 1,
    limit: 10
  });

  // Modal State
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedJob, setSelectedJob] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [applicationLink, setApplicationLink] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/jobs.php', {
        params: {
          search,
          company: companyFilter,
          location: locationFilter,
          page
        }
      });
      if (response.data.success) {
        setJobs(response.data.data.jobs);
        setCompanies(response.data.data.companies);
        setLocations(response.data.data.locations);
        setPagination(response.data.data.pagination);
      } else {
        setError(response.data.message || "Failed to load job listings.");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [companyFilter, locationFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCompanyFilter('');
    setLocationFilter('');
    setPage(1);
    setTimeout(() => fetchJobs(), 50);
  };

  const openAddModal = () => {
    setModalType('add');
    setCompanyName('');
    setRole('');
    setLocation('');
    setDescription('');
    setApplicationLink('');
    setSelectedJob(null);
    setError('');
    setSuccess('');
  };

  const openEditModal = (job) => {
    setModalType('edit');
    setSelectedJob(job);
    setCompanyName(job.company_name);
    setRole(job.role);
    setLocation(job.location);
    setDescription(job.description);
    setApplicationLink(job.application_link);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job listing?")) {
      return;
    }

    try {
      const response = await api.delete(`/api/jobs.php?id=${jobId}`);
      if (response.data.success) {
        setSuccess("Job listing deleted successfully.");
        fetchJobs();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || "Failed to delete job listing.");
      }
    } catch (err) {
      setError("Error deleting job listing. Connection failure.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!companyName || !role || !location || !description || !applicationLink) {
      setError("Please fill in all inputs.");
      return;
    }

    setSubmitLoading(true);

    const payload = {
      company_name: companyName,
      role,
      location,
      description,
      application_link: applicationLink
    };

    try {
      let response;
      if (modalType === 'add') {
        response = await api.post('/api/jobs.php', payload);
      } else {
        payload.id = selectedJob.id;
        response = await api.put('/api/jobs.php', payload);
      }

      if (response.data.success) {
        setSuccess(response.data.message || "Job listing saved successfully!");
        fetchJobs();
        // Hide Bootstrap modal
        const modalElement = document.getElementById('jobModal');
        const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          setTimeout(() => {
            modalInstance.hide();
          }, 1000);
        }
      } else {
        setError(response.data.message || "Operation failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during submission.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ paddingTop: '80px' }}>
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-content">
        
        {/* Toggle Mobile Menu */}
        <div className="d-lg-none mb-3">
          <button onClick={toggleSidebar} className="btn btn-primary-custom d-flex align-items-center gap-2">
            <i className="bi bi-list"></i> Menu
          </button>
        </div>

        {/* Heading */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h1 className="fw-bold mb-1 text-main-color">Placements & Internships</h1>
            <p className="text-muted mb-0">Apply for active job listings and industrial internships</p>
          </div>
          {user && user.role === 'admin' && (
            <button 
              onClick={openAddModal}
              className="btn btn-primary-custom d-flex align-items-center gap-2" 
              data-bs-toggle="modal" 
              data-bs-target="#jobModal"
            >
              <i className="bi bi-plus-circle-fill"></i> Add Job Listing
            </button>
          )}
        </div>

        {/* Global Notifications */}
        {success && <div className="alert alert-success border-0 mb-4">{success}</div>}
        {error && <div className="alert alert-danger border-0 mb-4">{error}</div>}

        {/* Search & Filter bar */}
        <div className="glass-card p-4 mb-4">
          <form onSubmit={handleSearchSubmit} className="row g-3">
            {/* Search Role */}
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent text-muted"><i className="bi bi-search"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Search role, company or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            {/* Filter Company */}
            <div className="col-md-2.5 col-sm-6">
              <select 
                className="form-select" 
                value={companyFilter} 
                onChange={(e) => { setCompanyFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Companies</option>
                {companies.map((comp, idx) => (
                  <option key={idx} value={comp}>{comp}</option>
                ))}
              </select>
            </div>
            {/* Filter Location */}
            <div className="col-md-2.5 col-sm-6">
              <select 
                className="form-select" 
                value={locationFilter} 
                onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Locations</option>
                {locations.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            {/* Buttons */}
            <div className="col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary-custom flex-grow-1">Search</button>
              <button type="button" onClick={handleClearFilters} className="btn btn-secondary-custom"><i className="bi bi-arrow-counterclockwise"></i></button>
            </div>
          </form>
        </div>

        {/* Job Listings Grid */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading placements...</span>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-5 glass-card">
            <i className="bi bi-briefcase-fill fs-1 text-muted"></i>
            <h4 className="fw-bold mt-3 text-main-color">No Job Postings</h4>
            <p className="text-muted">No vacancies match your search at this moment.</p>
          </div>
        ) : (
          <div>
            <div className="row g-4">
              {jobs.map((job) => (
                <div className="col-md-6 col-lg-12" key={job.id}>
                  <div className="glass-card p-4 hover-lift transition-all">
                    <div className="row align-items-center g-3">
                      
                      {/* Job branding initials block */}
                      <div className="col-auto d-none d-md-block">
                        <div 
                          className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" 
                          style={{ width: '65px', height: '65px', fontSize: '1.6rem', background: 'linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%)' }}
                        >
                          {job.company_name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Job details */}
                      <div className="col-md flex-grow-1">
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <h4 className="fw-bold text-main-color mb-0">{job.role}</h4>
                          <span className="badge bg-secondary-subtle text-secondary">{job.company_name}</span>
                        </div>
                        <div className="d-flex flex-wrap gap-3 text-muted small mb-2">
                          <span><i className="bi bi-geo-alt-fill text-primary"></i> {job.location}</span>
                          <span><i className="bi bi-calendar-event-fill text-primary"></i> Posted: {new Date(job.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <p className="text-muted-color mb-0 small" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6' }}>
                          {job.description}
                        </p>
                      </div>

                      {/* Apply button and Admin controls */}
                      <div className="col-md-auto text-md-end d-flex flex-row flex-md-column gap-2 justify-content-between align-items-center">
                        <a 
                          href={job.application_link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-primary-custom py-2 px-4 btn-sm w-100"
                        >
                          Apply Now <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '0.75rem' }}></i>
                        </a>
                        {user && user.role === 'admin' && (
                          <div className="d-flex gap-2 w-100 justify-content-md-end mt-md-2">
                            <button 
                              onClick={() => openEditModal(job)}
                              className="btn btn-sm btn-outline-primary p-2 py-1 flex-grow-1"
                              data-bs-toggle="modal" 
                              data-bs-target="#jobModal"
                              title="Edit Listing"
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button 
                              onClick={() => handleDelete(job.id)}
                              className="btn btn-sm btn-outline-danger p-2 py-1 flex-grow-1"
                              title="Delete Listing"
                            >
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.total_pages > 1 && (
              <nav className="mt-5 d-flex justify-content-center">
                <ul className="pagination gap-1">
                  <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link rounded-3 border-0 shadow-none bg-light bg-opacity-10 text-main-color" onClick={() => setPage(pagination.current_page - 1)}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  {Array.from({ length: pagination.total_pages }, (_, idx) => idx + 1).map((pNum) => (
                    <li className={`page-item ${pagination.current_page === pNum ? 'active' : ''}`} key={pNum}>
                      <button 
                        className={`page-link rounded-3 border-0 shadow-none ${pagination.current_page === pNum ? 'btn-primary-custom text-white' : 'bg-light bg-opacity-10 text-main-color'}`} 
                        onClick={() => setPage(pNum)}
                      >
                        {pNum}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}`}>
                    <button className="page-link rounded-3 border-0 shadow-none bg-light bg-opacity-10 text-main-color" onClick={() => setPage(pagination.current_page + 1)}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        )}

      </div>

      {/* JOB ADD/EDIT BOOTSTRAP MODAL */}
      {user && user.role === 'admin' && (
        <div className="modal fade" id="jobModal" tabIndex="-1" aria-labelledby="jobModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content glass-card shadow-lg p-2 border">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-main-color" id="jobModalLabel">
                  {modalType === 'add' ? 'Create Job / Internship Posting' : 'Modify Job Listing'}
                </h5>
                <button type="button" className="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body py-4">
                  {error && <div className="alert alert-danger border-0 mb-3">{error}</div>}
                  {success && <div className="alert alert-success border-0 mb-3">{success}</div>}

                  <div className="row g-3">
                    {/* Role Title */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Job / Internship Role</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)} 
                        placeholder="e.g. Associate Software Engineer"
                        required 
                      />
                    </div>

                    {/* Company Name */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Company Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)} 
                        placeholder="e.g. Google India"
                        required 
                      />
                    </div>

                    {/* Location */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Location</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                        placeholder="e.g. Bengaluru, Karnataka (Hybrid)"
                        required 
                      />
                    </div>

                    {/* Apply Redirect URL */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Application Redirect URL Link</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        value={applicationLink} 
                        onChange={(e) => setApplicationLink(e.target.value)} 
                        placeholder="https://careers.google.com/..."
                        required 
                      />
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Job Description & Qualifications</label>
                      <textarea 
                        className="form-control" 
                        rows="6" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Outline duties, eligible batches, criteria percentage, bond guidelines, required technical skills, etc."
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary-custom btn-sm" data-bs-dismiss="modal">Close</button>
                  <button type="submit" className="btn btn-primary-custom btn-sm" disabled={submitLoading}>
                    {submitLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Save Job Posting'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Jobs;
