// frontend/src/pages/Notes.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api, { API_BASE_URL } from '../services/api';

const Notes = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total_records: 0,
    total_pages: 1,
    current_page: 1,
    limit: 10
  });

  // Modal State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [noteFile, setNoteFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/notes.php', {
        params: {
          search,
          subject: subjectFilter,
          page
        }
      });
      if (response.data.success) {
        setNotes(response.data.data.notes);
        setSubjects(response.data.data.subjects);
        setPagination(response.data.data.pagination);
      } else {
        setError(response.data.message || "Failed to load notes.");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [subjectFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNotes();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSubjectFilter('');
    setPage(1);
    setTimeout(() => fetchNotes(), 50);
  };

  const openUploadModal = () => {
    setTitle('');
    setSubject('');
    setNoteFile(null);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      const response = await api.delete(`/api/notes.php?id=${noteId}`);
      if (response.data.success) {
        setSuccess("Resource deleted successfully.");
        fetchNotes();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || "Failed to delete notes.");
      }
    } catch (err) {
      setError("Error deleting notes. Connection failure.");
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !subject || !noteFile) {
      setError("Please fill in all fields and select a file.");
      return;
    }

    // Front-end size check: 10MB
    if (noteFile.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit. Select a smaller file.");
      return;
    }

    setUploadLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('note_file', noteFile);

    try {
      const response = await api.post('/api/notes.php', formData);
      if (response.data.success) {
        setSuccess("Notes uploaded successfully!");
        fetchNotes();
        // Hide Bootstrap modal
        const modalElement = document.getElementById('uploadNotesModal');
        const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          setTimeout(() => {
            modalInstance.hide();
          }, 1000);
        }
      } else {
        setError(response.data.message || "Upload failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during note upload.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Determine file icon & color class
  const getFileIcon = (fileUrl) => {
    const extension = fileUrl.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return { icon: 'bi-file-pdf-fill', color: 'text-danger' };
      case 'doc':
      case 'docx':
        return { icon: 'bi-file-word-fill', color: 'text-primary' };
      case 'ppt':
      case 'pptx':
        return { icon: 'bi-file-ppt-fill', color: 'text-warning' };
      default:
        return { icon: 'bi-file-earmark-text-fill', color: 'text-secondary' };
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
            <h1 className="fw-bold mb-1 text-main-color">Study Notes & Resources</h1>
            <p className="text-muted mb-0">Browse and download study notes uploaded by students and faculty</p>
          </div>
          <button 
            onClick={openUploadModal}
            className="btn btn-primary-custom d-flex align-items-center gap-2" 
            data-bs-toggle="modal" 
            data-bs-target="#uploadNotesModal"
          >
            <i className="bi bi-cloud-arrow-up-fill"></i> Upload Resource
          </button>
        </div>

        {/* Global Notifications */}
        {success && <div className="alert alert-success border-0 mb-4">{success}</div>}
        {error && <div className="alert alert-danger border-0 mb-4">{error}</div>}

        {/* Search & Filter bar */}
        <div className="glass-card p-4 mb-4">
          <form onSubmit={handleSearchSubmit} className="row g-3">
            {/* Search query */}
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-transparent text-muted"><i className="bi bi-search"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Search by note title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            {/* Subject filter */}
            <div className="col-md-3 col-sm-6">
              <select 
                className="form-select" 
                value={subjectFilter} 
                onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Subjects</option>
                {subjects.map((sub, idx) => (
                  <option key={idx} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            {/* Actions */}
            <div className="col-md-4 col-sm-6 d-flex gap-2">
              <button type="submit" className="btn btn-primary-custom flex-grow-1">Apply Search</button>
              <button type="button" onClick={handleClearFilters} className="btn btn-secondary-custom"><i className="bi bi-arrow-counterclockwise"></i></button>
            </div>
          </form>
        </div>

        {/* Notes Table */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading resources...</span>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-5 glass-card">
            <i className="bi bi-file-earmark-x fs-1 text-muted"></i>
            <h4 className="fw-bold mt-3 text-main-color">No Notes Available</h4>
            <p className="text-muted">No notes match your current filter parameters. Be the first to upload one!</p>
          </div>
        ) : (
          <div className="glass-card p-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '40px' }}>Type</th>
                    <th scope="col">Title</th>
                    <th scope="col">Subject</th>
                    <th scope="col">Uploaded By</th>
                    <th scope="col">Upload Date</th>
                    <th scope="col" className="text-end" style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => {
                    const fileMeta = getFileIcon(note.file_url);
                    return (
                      <tr key={note.id}>
                        <td>
                          <i className={`bi ${fileMeta.icon} ${fileMeta.color} fs-3`}></i>
                        </td>
                        <td>
                          <div className="fw-bold text-main-color">{note.title}</div>
                          <small className="text-muted font-monospace">{note.file_url.split('/').pop()}</small>
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-secondary px-2.5 py-1.5 text-uppercase" style={{ fontSize: '0.7rem' }}>
                            {note.subject}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold">{note.uploaded_by_name}</div>
                          {note.uploaded_by === user.id && <small className="text-primary">(Me)</small>}
                        </td>
                        <td className="text-muted">
                          {new Date(note.created_at).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="text-end">
                          <div className="d-flex gap-2 justify-content-end">
                            <a 
                              href={`${API_BASE_URL}/${note.file_url}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              download
                              className="btn btn-sm btn-outline-success p-2 py-1"
                              title="Download File"
                            >
                              <i className="bi bi-cloud-arrow-down-fill"></i>
                            </a>
                            {(user.role === 'admin' || note.uploaded_by === user.id) && (
                              <button 
                                onClick={() => handleDelete(note.id)}
                                className="btn btn-sm btn-outline-danger p-2 py-1"
                                title="Delete Notes"
                              >
                                <i className="bi bi-trash3-fill"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.total_pages > 1 && (
              <nav className="mt-4 d-flex justify-content-center">
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

      {/* UPLOAD NOTES BOOTSTRAP MODAL */}
      <div className="modal fade" id="uploadNotesModal" tabIndex="-1" aria-labelledby="uploadNotesModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content glass-card shadow-lg p-2 border">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold text-main-color" id="uploadNotesModalLabel">
                Upload Study Notes
              </h5>
              <button type="button" className="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body py-4">
                {error && <div className="alert alert-danger border-0 mb-3">{error}</div>}
                {success && <div className="alert alert-success border-0 mb-3">{success}</div>}

                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Note Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Operating Systems Cheat Sheet"
                    required 
                  />
                </div>

                {/* Subject */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Subject / Course Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                    placeholder="e.g. Operating Systems, Computer Networks"
                    required 
                  />
                </div>

                {/* File Upload */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Document File (PDF, DOC, DOCX, PPT, PPTX)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => setNoteFile(e.target.files[0])} 
                    required 
                  />
                  <small className="text-muted">Strict size limits: Files must be smaller than 10MB.</small>
                </div>
              </div>
              
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary-custom btn-sm" data-bs-dismiss="modal">Close</button>
                <button type="submit" className="btn btn-primary-custom btn-sm" disabled={uploadLoading}>
                  {uploadLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Notes;
