// frontend/src/pages/Courses.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api, { API_BASE_URL } from '../services/api';

const Courses = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Courses state
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 1,
    current_page: 1,
    limit: 10
  });

  // Modal State
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/courses.php', {
        params: {
          search,
          category: categoryFilter,
          page
        }
      });
      if (response.data.success) {
        setCourses(response.data.data.courses);
        setCategories(response.data.data.categories);
        setPagination(response.data.data.pagination);
      } else {
        setError(response.data.message || "Failed to load courses.");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [categoryFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setPage(1);
    // Directly trigger fetch in next tick or rely on useEffect depending on state
    setTimeout(() => fetchCourses(), 50);
  };

  // Open Add Modal
  const openAddModal = () => {
    setModalType('add');
    setTitle('');
    setDescription('');
    setCategory('');
    setThumbnailFile(null);
    setSelectedCourse(null);
    setError('');
    setSuccess('');
  };

  // Open Edit Modal
  const openEditModal = (course) => {
    setModalType('edit');
    setSelectedCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setCategory(course.category);
    setThumbnailFile(null);
    setError('');
    setSuccess('');
  };

  // Delete Course Action
  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await api.delete(`/api/courses.php?id=${courseId}`);
      if (response.data.success) {
        setSuccess("Course deleted successfully.");
        fetchCourses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || "Failed to delete course.");
      }
    } catch (err) {
      setError("Error deleting course. Connection failure.");
    }
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description || !category) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    try {
      let response;
      if (modalType === 'add') {
        response = await api.post('/api/courses.php', formData);
      } else {
        formData.append('id', selectedCourse.id);
        response = await api.post('/api/courses.php?action=update', formData);
      }

      if (response.data.success) {
        setSuccess(response.data.message || "Course saved successfully!");
        fetchCourses();
        // Hide Bootstrap modal programmatically
        const modalElement = document.getElementById('courseModal');
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

  // Resolve thumbnail path
  const getThumbnailUrl = (course) => {
    if (course.thumbnail) {
      return `${API_BASE_URL}/${course.thumbnail}`;
    }
    return null;
  };

  return (
    <div className="d-flex min-vh-100" style={{ paddingTop: '80px' }}>
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-content">
        
        {/* Toggle Mobile Menu Indicator */}
        <div className="d-lg-none mb-3">
          <button onClick={toggleSidebar} className="btn btn-primary-custom d-flex align-items-center gap-2">
            <i className="bi bi-list"></i> Menu
          </button>
        </div>

        {/* Heading Panel */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h1 className="fw-bold mb-1 text-main-color">Placement Prep Courses</h1>
            <p className="text-muted mb-0">Learn core concepts required for recruitment drives</p>
          </div>
          {user && user.role === 'admin' && (
            <button 
              onClick={openAddModal}
              className="btn btn-primary-custom d-flex align-items-center gap-2" 
              data-bs-toggle="modal" 
              data-bs-target="#courseModal"
            >
              <i className="bi bi-plus-circle-fill"></i> Create Course
            </button>
          )}
        </div>

        {/* Global Notifications */}
        {success && <div className="alert alert-success border-0 mb-4">{success}</div>}
        {error && <div className="alert alert-danger border-0 mb-4">{error}</div>}

        {/* Search & Filter Controls Card */}
        <div className="glass-card p-4 mb-4">
          <form onSubmit={handleSearchSubmit} className="row g-3">
            {/* Search query */}
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-transparent text-muted"><i className="bi bi-search"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Search course titles or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            {/* Category filter */}
            <div className="col-md-3 col-sm-6">
              <select 
                className="form-select" 
                value={categoryFilter} 
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {/* Buttons */}
            <div className="col-md-4 col-sm-6 d-flex gap-2">
              <button type="submit" className="btn btn-primary-custom flex-grow-1">Apply Search</button>
              <button type="button" onClick={handleClearFilters} className="btn btn-secondary-custom"><i className="bi bi-arrow-counterclockwise"></i></button>
            </div>
          </form>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading courses...</span>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-5 glass-card">
            <i className="bi bi-journal-x fs-1 text-muted"></i>
            <h4 className="fw-bold mt-3 text-main-color">No Courses Found</h4>
            <p className="text-muted">Try clearing the search or category filters.</p>
          </div>
        ) : (
          <div>
            <div className="row g-4">
              {courses.map((course) => (
                <div className="col-md-6 col-lg-4" key={course.id}>
                  <div className="glass-card h-100 overflow-hidden d-flex flex-column hover-lift transition-all">
                    
                    {/* Thumbnail */}
                    <div style={{ height: '180px', position: 'relative' }} className="bg-dark bg-opacity-25 d-flex align-items-center justify-content-center">
                      {getThumbnailUrl(course) ? (
                        <img 
                          src={getThumbnailUrl(course)} 
                          alt={course.title} 
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white" style={{
                          background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)'
                        }}>
                          <i className="bi bi-mortarboard fs-1"></i>
                          <small className="fw-bold text-uppercase mt-2 tracking-wider">{course.category}</small>
                        </div>
                      )}
                      <span className="position-absolute top-0 end-0 badge bg-dark bg-opacity-75 m-3 text-uppercase font-monospace" style={{ fontSize: '0.7rem' }}>
                        {course.category}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 d-flex flex-column flex-grow-1">
                      <h5 className="fw-bold text-main-color mb-2">{course.title}</h5>
                      <p className="text-muted-color small mb-4 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6' }}>
                        {course.description}
                      </p>
                      
                      {/* Actions */}
                      <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                        <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                          Uploaded: {new Date(course.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </small>
                        
                        {user && user.role === 'admin' ? (
                          <div className="d-flex gap-2">
                            <button 
                              onClick={() => openEditModal(course)}
                              className="btn btn-sm btn-outline-primary p-2 py-1"
                              data-bs-toggle="modal" 
                              data-bs-target="#courseModal"
                              title="Edit"
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button 
                              onClick={() => handleDelete(course.id)}
                              className="btn btn-sm btn-outline-danger p-2 py-1"
                              title="Delete"
                            >
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          </div>
                        ) : (
                          <span className="text-primary fw-bold" style={{ fontSize: '0.85rem' }}>Active Resource</span>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Grid Controls */}
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

      {/* ADMIN ADD/EDIT COURSE BOOTSTRAP MODAL */}
      {user && user.role === 'admin' && (
        <div className="modal fade" id="courseModal" tabIndex="-1" aria-labelledby="courseModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card shadow-lg p-2 border">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-main-color" id="courseModalLabel">
                  {modalType === 'add' ? 'Create Course Module' : 'Modify Course Module'}
                </h5>
                <button type="button" className="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body py-4">
                  {error && <div className="alert alert-danger border-0 mb-3">{error}</div>}
                  {success && <div className="alert alert-success border-0 mb-3">{success}</div>}

                  {/* Title */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Course Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="e.g. Full Stack React & Node Development"
                      required 
                    />
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Category</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)} 
                      placeholder="e.g. Web Development, Core Java, Cloud Computing"
                      required 
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea 
                      className="form-control" 
                      rows="4" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Detail the course contents, syllabus, requirements, etc."
                      required
                    ></textarea>
                  </div>

                  {/* Thumbnail File upload */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Course Image (Thumbnail)</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept="image/*"
                      onChange={(e) => setThumbnailFile(e.target.files[0])} 
                    />
                    <small className="text-muted">Select an image file (JPG, PNG, WEBP). Max size: 2MB.</small>
                  </div>
                </div>
                
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-secondary-custom btn-sm" data-bs-dismiss="modal">Close</button>
                  <button type="submit" className="btn btn-primary-custom btn-sm" disabled={submitLoading}>
                    {submitLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Save Course'}
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

export default Courses;
