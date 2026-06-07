// frontend/src/pages/Projects.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const Projects = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Projects state
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState(''); // '' for all, or user.id for 'My Projects'
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 1,
    current_page: 1,
    limit: 10
  });

  // Modal State
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedProject, setSelectedProject] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/projects.php', {
        params: {
          search,
          user_id: userFilter,
          page
        }
      });
      if (response.data.success) {
        setProjects(response.data.data.projects);
        setPagination(response.data.data.pagination);
      } else {
        setError(response.data.message || "Failed to load projects.");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [userFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const handleClearFilters = () => {
    setSearch('');
    setUserFilter('');
    setPage(1);
    setTimeout(() => fetchProjects(), 50);
  };

  const openAddModal = () => {
    setModalType('add');
    setTitle('');
    setDescription('');
    setGithubLink('');
    setDemoLink('');
    setSelectedProject(null);
    setError('');
    setSuccess('');
  };

  const openEditModal = (project) => {
    setModalType('edit');
    setSelectedProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setGithubLink(project.github_link || '');
    setDemoLink(project.demo_link || '');
    setError('');
    setSuccess('');
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to remove this project from your showcase?")) {
      return;
    }

    try {
      const response = await api.delete(`/api/projects.php?id=${projectId}`);
      if (response.data.success) {
        setSuccess("Project deleted successfully.");
        fetchProjects();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || "Failed to delete project.");
      }
    } catch (err) {
      setError("Error deleting project. Connection failure.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description) {
      setError("Please fill in the project title and description.");
      return;
    }

    setSubmitLoading(true);

    const payload = {
      title,
      description,
      github_link: githubLink,
      demo_link: demoLink
    };

    try {
      let response;
      if (modalType === 'add') {
        response = await api.post('/api/projects.php', payload);
      } else {
        payload.id = selectedProject.id;
        response = await api.put('/api/projects.php', payload);
      }

      if (response.data.success) {
        setSuccess(response.data.message || "Project saved successfully!");
        fetchProjects();
        // Hide Bootstrap modal
        const modalElement = document.getElementById('projectModal');
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
        
        {/* Mobile menu toggle */}
        <div className="d-lg-none mb-3">
          <button onClick={toggleSidebar} className="btn btn-primary-custom d-flex align-items-center gap-2">
            <i className="bi bi-list"></i> Menu
          </button>
        </div>

        {/* Heading */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h1 className="fw-bold mb-1 text-main-color">Projects Showcase</h1>
            <p className="text-muted mb-0">Explore development projects built and hosted by students</p>
          </div>
          <button 
            onClick={openAddModal}
            className="btn btn-primary-custom d-flex align-items-center gap-2" 
            data-bs-toggle="modal" 
            data-bs-target="#projectModal"
          >
            <i className="bi bi-plus-circle-fill"></i> Add Project
          </button>
        </div>

        {/* Notifications */}
        {success && <div className="alert alert-success border-0 mb-4">{success}</div>}
        {error && <div className="alert alert-danger border-0 mb-4">{error}</div>}

        {/* Filters */}
        <div className="glass-card p-4 mb-4">
          <form onSubmit={handleSearchSubmit} className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-transparent text-muted"><i className="bi bi-search"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Search project titles or tech stacks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            {/* Show only My Projects selector */}
            <div className="col-md-3 col-sm-6">
              <select 
                className="form-select" 
                value={userFilter} 
                onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Student Projects</option>
                <option value={user.id}>My Uploaded Projects</option>
              </select>
            </div>
            {/* Buttons */}
            <div className="col-md-4 col-sm-6 d-flex gap-2">
              <button type="submit" className="btn btn-primary-custom flex-grow-1">Apply Search</button>
              <button type="button" onClick={handleClearFilters} className="btn btn-secondary-custom"><i className="bi bi-arrow-counterclockwise"></i></button>
            </div>
          </form>
        </div>

        {/* Projects Cards List */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading projects...</span>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-5 glass-card">
            <i className="bi bi-code-slash fs-1 text-muted"></i>
            <h4 className="fw-bold mt-3 text-main-color">No Projects Found</h4>
            <p className="text-muted">No developer showpieces match your current filtering criteria.</p>
          </div>
        ) : (
          <div>
            <div className="row g-4">
              {projects.map((project) => (
                <div className="col-md-6" key={project.id}>
                  <div className="glass-card p-4 h-100 d-flex flex-column hover-lift transition-all">
                    
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h4 className="fw-bold text-main-color mb-1">{project.title}</h4>
                        <small className="text-muted">
                          By <span className="fw-semibold text-primary">{project.student_name}</span> ({project.student_email})
                        </small>
                      </div>
                      <span className="badge bg-primary bg-opacity-10 text-primary">Student Showcase</span>
                    </div>

                    {/* Body */}
                    <p className="text-muted-color mb-4 flex-grow-1" style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '0.92rem' }}>
                      {project.description}
                    </p>

                    {/* Bottom action panel */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between pt-3 border-top gap-3 mt-auto">
                      {/* GitHub / Demo Anchors */}
                      <div className="d-flex gap-2">
                        {project.github_link ? (
                          <a 
                            href={project.github_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1 py-1.5 px-3"
                          >
                            <i className="bi bi-github"></i> GitHub
                          </a>
                        ) : (
                          <button className="btn btn-sm btn-outline-secondary py-1.5 px-3" disabled><i className="bi bi-github"></i> No Link</button>
                        )}
                        {project.demo_link ? (
                          <a 
                            href={project.demo_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-1.5 px-3"
                          >
                            <i className="bi bi-globe"></i> Live Demo
                          </a>
                        ) : (
                          <button className="btn btn-sm btn-outline-secondary py-1.5 px-3" disabled><i className="bi bi-globe"></i> No Demo</button>
                        )}
                      </div>

                      {/* Edit / Delete actions */}
                      {(user.role === 'admin' || project.user_id === user.id) && (
                        <div className="d-flex gap-2">
                          <button 
                            onClick={() => openEditModal(project)}
                            className="btn btn-sm btn-outline-primary p-2 py-1"
                            data-bs-toggle="modal" 
                            data-bs-target="#projectModal"
                            title="Edit Details"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button 
                            onClick={() => handleDelete(project.id)}
                            className="btn btn-sm btn-outline-danger p-2 py-1"
                            title="Delete Project"
                          >
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </div>
                      )}
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

      {/* PROJECT ADD/EDIT BOOTSTRAP MODAL */}
      <div className="modal fade" id="projectModal" tabIndex="-1" aria-labelledby="projectModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content glass-card shadow-lg p-2 border">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold text-main-color" id="projectModalLabel">
                {modalType === 'add' ? 'Publish Project Showcase' : 'Modify Project Showcase'}
              </h5>
              <button type="button" className="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body py-4">
                {error && <div className="alert alert-danger border-0 mb-3">{error}</div>}
                {success && <div className="alert alert-success border-0 mb-3">{success}</div>}

                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Project Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Distributed Chat System"
                    required 
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description & Tech Stack</label>
                  <textarea 
                    className="form-control" 
                    rows="5" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Detail your system features, technologies utilized (React, Node, Redis, etc.), and implementation methods."
                    required
                  ></textarea>
                </div>

                {/* GitHub link */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">GitHub Repository Link (Optional)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent text-muted"><i className="bi bi-github"></i></span>
                    <input 
                      type="url" 
                      className="form-control border-start-0" 
                      value={githubLink} 
                      onChange={(e) => setGithubLink(e.target.value)} 
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                </div>

                {/* Demo link */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Live Production Demo URL (Optional)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent text-muted"><i className="bi bi-globe"></i></span>
                    <input 
                      type="url" 
                      className="form-control border-start-0" 
                      value={demoLink} 
                      onChange={(e) => setDemoLink(e.target.value)} 
                      placeholder="https://myproject.vercel.app"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary-custom btn-sm" data-bs-dismiss="modal">Close</button>
                <button type="submit" className="btn btn-primary-custom btn-sm" disabled={submitLoading}>
                  {submitLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Projects;
