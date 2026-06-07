// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api, { API_BASE_URL } from '../services/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js structures
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_students: 0,
    total_courses: 0,
    total_notes: 0,
    total_projects: 0,
    total_jobs: 0
  });
  const [analytics, setAnalytics] = useState({
    registrations: { labels: [], data: [] },
    courses_by_category: { labels: [], data: [] },
    jobs_posted: { labels: [], data: [] }
  });
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/dashboard.php');
        if (response.data.success) {
          const { stats: fetchedStats, analytics: fetchedAnalytics, activity: fetchedActivity } = response.data.data;
          setStats(fetchedStats);
          setAnalytics(fetchedAnalytics);
          setActivity(fetchedActivity);
        } else {
          setError(response.data.message || "Failed to load dashboard data.");
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Connection error. Could not connect to API server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Resolve profile photo
  const getAvatarUrl = () => {
    if (user && user.profile_image) {
      return `${API_BASE_URL}/${user.profile_image}`;
    }
    return null;
  };

  // Chart configurations & themes
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';

  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: title,
        color: isDarkMode ? '#f8fafc' : '#1e293b',
        font: { size: 14, weight: 'bold', family: 'Outfit' }
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Outfit' } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Outfit' } }
      }
    }
  });

  const registrationChartData = {
    labels: analytics.registrations.labels.length > 0 ? analytics.registrations.labels : ['No Data'],
    datasets: [{
      label: 'Students Registered',
      data: analytics.registrations.data.length > 0 ? analytics.registrations.data : [0],
      fill: true,
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderColor: '#6366f1',
      borderWidth: 2,
      tension: 0.3,
      pointBackgroundColor: '#4f46e5'
    }]
  };

  const coursesChartData = {
    labels: analytics.courses_by_category.labels.length > 0 ? analytics.courses_by_category.labels : ['No Data'],
    datasets: [{
      label: 'Course Count',
      data: analytics.courses_by_category.data.length > 0 ? analytics.courses_by_category.data : [0],
      backgroundColor: 'rgba(14, 165, 233, 0.75)',
      borderColor: '#0ea5e9',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const jobsChartData = {
    labels: analytics.jobs_posted.labels.length > 0 ? analytics.jobs_posted.labels : ['No Data'],
    datasets: [{
      label: 'Jobs Posted',
      data: analytics.jobs_posted.data.length > 0 ? analytics.jobs_posted.data : [0],
      fill: true,
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: '#10b981',
      borderWidth: 2,
      tension: 0.3,
      pointBackgroundColor: '#059669'
    }]
  };

  return (
    <div className="d-flex min-vh-100" style={{ paddingTop: '80px' }}>
      
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main dashboard body */}
      <div className="main-content">
        
        {/* Toggle Mobile Menu Indicator */}
        <div className="d-lg-none mb-3">
          <button onClick={toggleSidebar} className="btn btn-primary-custom d-flex align-items-center gap-2">
            <i className="bi bi-list"></i> Menu
          </button>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading data...</span>
            </div>
          </div>
        ) : (
          <div>
            
            {/* Error Message */}
            {error && (
              <div className="alert alert-danger border-0 mb-4" role="alert">
                <i className="bi bi-exclamation-octagon-fill me-2"></i> {error}
              </div>
            )}

            {/* 1. WELCOME BANNER */}
            <div className="glass-card p-4 p-md-5 mb-4 border-0 position-relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
              color: '#ffffff'
            }}>
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h1 className="fw-bold mb-2">Welcome Back, {user.full_name}!</h1>
                  <p className="mb-0 opacity-90" style={{ fontSize: '1.05rem' }}>
                    {user.role === 'admin' 
                      ? "Here are the metrics, analytical trends, and activity logs across the Career & Placement Portal."
                      : "Access notes, browse courses, keep your projects updated, and view active job listings."
                    }
                  </p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <span className="badge bg-white text-primary text-uppercase px-3 py-2 rounded-pill fw-bold border border-white border-opacity-25">
                    Role: {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. STATS ROW */}
            <div className="row g-4 mb-4">
              {user.role === 'admin' ? (
                <div className="col-lg-3 col-sm-6">
                  <div className="glass-card p-4 h-100 d-flex align-items-center gap-3">
                    <div className="rounded p-3 bg-primary bg-opacity-10 text-primary">
                      <i className="bi bi-people-fill fs-3"></i>
                    </div>
                    <div>
                      <h4 className="fw-bold mb-0">{stats.total_students}</h4>
                      <small className="text-muted">Students Registered</small>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="col-lg-3 col-sm-6">
                  <div className="glass-card p-4 h-100 d-flex align-items-center gap-3">
                    <div className="rounded p-3 bg-primary bg-opacity-10 text-primary">
                      <i className="bi bi-code-square fs-3"></i>
                    </div>
                    <div>
                      <h4 className="fw-bold mb-0">{stats.total_projects}</h4>
                      <small className="text-muted">My Projects</small>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-lg-3 col-sm-6">
                <div className="glass-card p-4 h-100 d-flex align-items-center gap-3">
                  <div className="rounded p-3 bg-info bg-opacity-10 text-info">
                    <i className="bi bi-mortarboard-fill fs-3"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">{stats.total_courses}</h4>
                    <small className="text-muted">Available Courses</small>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-sm-6">
                <div className="glass-card p-4 h-100 d-flex align-items-center gap-3">
                  <div className="rounded p-3 bg-success bg-opacity-10 text-success">
                    <i className="bi bi-journal-richtext fs-3"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">{stats.total_notes}</h4>
                    <small className="text-muted">Study Resources</small>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-sm-6">
                <div className="glass-card p-4 h-100 d-flex align-items-center gap-3">
                  <div className="rounded p-3 bg-warning bg-opacity-10 text-warning">
                    <i className="bi bi-briefcase-fill fs-3"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">{stats.total_jobs}</h4>
                    <small className="text-muted">Placements & Jobs</small>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. MIDDLE SECTION: ROLE DEPENDENT */}
            {user.role === 'admin' ? (
              /* ADMIN ANALYTICS DASHBOARD */
              <div className="row g-4 mb-4">
                {/* Registrations graph */}
                <div className="col-lg-6">
                  <div className="glass-card p-4" style={{ height: '350px' }}>
                    <Line options={chartOptions('Student Registrations Trend')} data={registrationChartData} />
                  </div>
                </div>
                {/* Courses categories bar chart */}
                <div className="col-lg-6">
                  <div className="glass-card p-4" style={{ height: '350px' }}>
                    <Bar options={chartOptions('Course Category Distribution')} data={coursesChartData} />
                  </div>
                </div>
                {/* Jobs postings trend */}
                <div className="col-lg-12">
                  <div className="glass-card p-4" style={{ height: '320px' }}>
                    <Line options={chartOptions('Job & Internship Posting Frequency')} data={jobsChartData} />
                  </div>
                </div>
              </div>
            ) : (
              /* STUDENT DASHBOARD PROFILE CARD & QUICK LINKS */
              <div className="row g-4 mb-4">
                {/* Profile Card */}
                <div className="col-lg-4">
                  <div className="glass-card p-4 text-center h-100">
                    <div className="position-relative d-inline-block mb-3">
                      {getAvatarUrl() ? (
                        <img 
                          src={getAvatarUrl()} 
                          alt={user.full_name} 
                          className="rounded-circle object-fit-cover shadow border border-primary border-3" 
                          style={{ width: '120px', height: '120px' }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow border border-primary border-3" 
                          style={{ width: '120px', height: '120px', fontSize: '3rem', backgroundColor: 'var(--primary-color)' }}
                        >
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h4 className="fw-bold mb-1">{user.full_name}</h4>
                    <p className="text-muted mb-3 text-capitalize">{user.role}</p>
                    <ul className="list-unstyled text-start mb-4 bg-light bg-opacity-5 p-3 rounded" style={{ fontSize: '0.9rem' }}>
                      <li className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-envelope-fill text-primary"></i>
                        <span className="text-truncate">{user.email}</span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <i className="bi bi-telephone-fill text-primary"></i>
                        <span>{user.mobile}</span>
                      </li>
                    </ul>
                    <Link to="/profile" className="btn btn-secondary-custom w-100 py-2 btn-sm">
                      <i className="bi bi-pencil-square me-1"></i> Edit Profile
                    </Link>
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="col-lg-8">
                  <div className="glass-card p-4 h-100">
                    <h5 className="fw-bold mb-4 text-main-color">Placement Prep Shortcuts</h5>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between">
                          <div>
                            <h6 className="fw-bold mb-1"><i className="bi bi-journal-arrow-up text-primary me-2"></i> Notes Hub</h6>
                            <p className="text-muted small mb-3">Upload your class files, or read other students notes for quick exams prep.</p>
                          </div>
                          <Link to="/notes" className="btn btn-sm btn-primary-custom w-fit">Open Notes</Link>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between">
                          <div>
                            <h6 className="fw-bold mb-1"><i className="bi bi-github text-primary me-2"></i> Project Showcase</h6>
                            <p className="text-muted small mb-3">Add links to your github projects so admins and reviewers can verify them.</p>
                          </div>
                          <Link to="/projects" className="btn btn-sm btn-primary-custom w-fit">Manage Projects</Link>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between">
                          <div>
                            <h6 className="fw-bold mb-1"><i className="bi bi-laptop text-primary me-2"></i> Study Materials</h6>
                            <p className="text-muted small mb-3">Browse standard courses across major software programming concepts.</p>
                          </div>
                          <Link to="/courses" className="btn btn-sm btn-primary-custom w-fit">Explore Courses</Link>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between">
                          <div>
                            <h6 className="fw-bold mb-1"><i className="bi bi-person-workspace text-primary me-2"></i> Jobs Board</h6>
                            <p className="text-muted small mb-3">Check active job details, find internships, and click redirects to apply.</p>
                          </div>
                          <Link to="/jobs" className="btn btn-sm btn-primary-custom w-fit">Browse Jobs</Link>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* 4. ACTIVITY LOGS (Admin gets global log table, Student gets personal activity feed) */}
            <div className="glass-card p-4">
              <h5 className="fw-bold mb-4 text-main-color">
                {user.role === 'admin' ? "System Activity Logs" : "My Recent Activities"}
              </h5>

              {activity.length === 0 ? (
                <p className="text-muted mb-0">No registered activities found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                    <thead>
                      <tr>
                        {user.role === 'admin' && <th scope="col">User</th>}
                        {user.role === 'admin' && <th scope="col">Role</th>}
                        <th scope="col">Action Details</th>
                        <th scope="col">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map((log) => (
                        <tr key={log.id}>
                          {user.role === 'admin' && (
                            <td>
                              <div className="fw-semibold">{log.full_name}</div>
                              <small className="text-muted">{log.email}</small>
                            </td>
                          )}
                          {user.role === 'admin' && (
                            <td>
                              <span className={`badge bg-opacity-10 text-uppercase ${log.role === 'admin' ? 'bg-danger text-danger' : 'bg-primary text-primary'}`}>
                                {log.role}
                              </span>
                            </td>
                          )}
                          <td>
                            <i className="bi bi-dot text-primary fs-4 align-middle"></i>
                            {log.action}
                          </td>
                          <td className="text-muted">
                            {new Date(log.created_at).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
