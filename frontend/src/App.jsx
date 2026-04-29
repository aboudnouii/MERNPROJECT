import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import RepairForm from "./components/RepairForm";
import RepairList from "./components/RepairList";
import AuthForm from "./components/AuthForm";
import CustomerTrack from "./components/CustomerTrack";

const REPAIRS_API = "http://localhost:5000/api/repairs";
const AUTH_API = "http://localhost:5000/api/auth";

const tabs = [
  {
    id: "dashboard", label: "Dashboard", icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  },
  {
    id: "repairs", label: "All Repairs", icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    )
  },
  {
    id: "add", label: "New Repair", icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
      </svg>
    )
  },
  {
    id: "completed", label: "Completed", icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" />
      </svg>
    )
  },
  {
    id: "about", label: "About", icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" /><path d="M12 17v-5M12 8h.01" strokeLinecap="round" />
      </svg>
    )
  },
];

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("repairManagerUser")); }
  catch { return null; }
}

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [authMode, setAuthMode] = useState("login");
  const [publicTrackMode, setPublicTrackMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [repairs, setRepairs] = useState([]);
  const [editingRepair, setEditingRepair] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const authHeaders = useMemo(() => {
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  }, [user]);

  const saveUser = (userData) => {
    localStorage.setItem("repairManagerUser", JSON.stringify(userData));
    setUser(userData);
  };

  const handleAuth = async (formData) => {
    try {
      setAuthLoading(true); setAuthError("");
      const endpoint = authMode === "signup" ? "signup" : "login";
      const payload = authMode === "signup" ? formData : { email: formData.email, password: formData.password };
      const response = await axios.post(`${AUTH_API}/${endpoint}`, payload);
      saveUser(response.data);
      setActiveTab("dashboard");
    } catch (err) {
      setAuthError(err.response?.data?.message || "Authentication failed. Check backend and MongoDB.");
    } finally { setAuthLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("repairManagerUser");
    setUser(null); setRepairs([]); setEditingRepair(null); setActiveTab("dashboard");
  };

  const fetchRepairs = async () => {
    if (!user?.token) return;
    try {
      setLoading(true); setError("");
      const response = await axios.get(REPAIRS_API, { headers: authHeaders });
      setRepairs(response.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      setError(err.response?.data?.message || "Unable to fetch repair jobs. Make sure the backend is running on port 5000.");
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRepairs(); }, [user?.token]);

  const handleSubmit = async (formData) => {
    try {
      setError("");
      if (editingRepair) {
        await axios.put(`${REPAIRS_API}/${editingRepair._id}`, formData, { headers: authHeaders });
        setEditingRepair(null); setActiveTab("repairs");
      } else {
        await axios.post(REPAIRS_API, formData, { headers: authHeaders });
        setActiveTab("repairs");
      }
      await fetchRepairs();
    } catch (err) { setError(err.response?.data?.message || "Unable to save repair job"); }
  };

  const handleEdit = (repair) => { setEditingRepair(repair); setActiveTab("add"); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this repair job?")) return;
    try {
      setError("");
      await axios.delete(`${REPAIRS_API}/${id}`, { headers: authHeaders });
      await fetchRepairs();
    } catch (err) { setError(err.response?.data?.message || "Unable to delete repair job"); }
  };

  const handleComplete = async (id) => {
    try {
      setError("");
      await axios.patch(`${REPAIRS_API}/${id}/complete`, {}, { headers: authHeaders });
      await fetchRepairs();
    } catch (err) { setError(err.response?.data?.message || "Unable to mark repair job as completed"); }
  };

  const dashboard = useMemo(() => {
    const totalJobs = repairs.length;
    const completedJobs = repairs.filter((j) => j.status === "completed").length;
    const pendingJobs = repairs.filter((j) => j.status === "pending").length;
    const inProgressJobs = repairs.filter((j) => j.status === "in-progress").length;
    const cancelledJobs = repairs.filter((j) => j.status === "cancelled").length;
    const totalEstimated = repairs.reduce((s, j) => s + Number(j.estimatedCost || 0), 0);
    const totalActual = repairs.reduce((s, j) => s + Number(j.actualCost || 0), 0);
    const averageCost = totalJobs ? totalEstimated / totalJobs : 0;
    const recentJobs = [...repairs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
    return { totalJobs, completedJobs, pendingJobs, inProgressJobs, cancelledJobs, totalEstimated, totalActual, averageCost, recentJobs };
  }, [repairs]);

  const visibleRepairs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return repairs.filter((repair) => {
      const matchesStatus = statusFilter === "all" || repair.status === statusFilter;
      const matchesSearch = !term ||
        repair.customerName?.toLowerCase().includes(term) ||
        repair.carModel?.toLowerCase().includes(term) ||
        repair.licensePlate?.toLowerCase().includes(term) ||
        repair.trackingCode?.toLowerCase().includes(term) ||
        repair.issueDescription?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [repairs, statusFilter, searchTerm]);

  const completedRepairs = repairs.filter((r) => r.status === "completed");

  if (!user) {
    if (publicTrackMode) return <CustomerTrack onBackToLogin={() => setPublicTrackMode(false)} />;
    return (
      <AuthForm
        mode={authMode}
        onAuth={handleAuth}
        onSwitchMode={() => { setAuthError(""); setAuthMode((m) => (m === "login" ? "signup" : "login")); }}
        onOpenTrack={() => setPublicTrackMode(true)}
        loading={authLoading}
        error={authError}
      />
    );
  }

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="dashboard-shell">

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="logo-text">
              <span className="logo-title">RepairMGR</span>
              <span className="logo-sub">Auto Garage System</span>
            </div>
          )}
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(c => !c)} title="Toggle sidebar">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              {sidebarCollapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {!sidebarCollapsed && <div className="nav-section-label">NAVIGATION</div>}
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => { if (tab.id !== "add") setEditingRepair(null); setActiveTab(tab.id); }}
              title={sidebarCollapsed ? tab.label : ""}
            >
              <span className="nav-icon">{tab.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{tab.label}</span>}
              {!sidebarCollapsed && tab.id === "repairs" && repairs.length > 0 && (
                <span className="nav-badge">{repairs.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar quick stats */}
        {!sidebarCollapsed && (
          <div className="sidebar-stats">
            <div className="sidebar-stat-row">
              <span className="ss-dot amber-dot"></span>
              <span className="ss-label">Pending</span>
              <span className="ss-val">{dashboard.pendingJobs}</span>
            </div>
            <div className="sidebar-stat-row">
              <span className="ss-dot blue-dot"></span>
              <span className="ss-label">In Progress</span>
              <span className="ss-val">{dashboard.inProgressJobs}</span>
            </div>
            <div className="sidebar-stat-row">
              <span className="ss-dot green-dot"></span>
              <span className="ss-label">Completed</span>
              <span className="ss-val">{dashboard.completedJobs}</span>
            </div>
          </div>
        )}

        {/* User card at bottom */}
        <div className="sidebar-user">
          <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">Administrator</span>
            </div>
          )}
          <button className="logout-icon-btn" onClick={handleLogout} title="Sign out">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-area">

        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="breadcrumb">
              <span className="bc-root">Garage</span>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              <span className="bc-current">{activeTabData?.label}</span>
            </div>
          </div>
          <div className="topbar-right">
            {loading && <span className="topbar-loading"><span className="spin-dot"></span>Syncing…</span>}
            <button className="btn primary topbar-add-btn" onClick={() => { setEditingRepair(null); setActiveTab("add"); }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              New Repair
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="content-area">
          {error && (
            <div className="alert">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              {error}
            </div>
          )}

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <section className="tab-page">
              {/* Hero banner */}
              <div className="dash-hero">
                <div className="dash-hero-left">
                  <p className="eyebrow">Auto Garage Management</p>
                  <h1 className="dash-title">Welcome back, <span className="amber-text">{user.name}</span></h1>
                  <p className="dash-sub">Here's a snapshot of your garage operations today.</p>
                  <button className="btn primary" style={{marginTop:"16px"}} onClick={() => { setEditingRepair(null); setActiveTab("add"); }}>
                    + Create New Repair Job
                  </button>
                </div>
                <div className="dash-hero-img-wrap">
                  <img
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=520&q=80&auto=format&fit=crop"
                    alt="Car"
                    className="hero-car-img"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>

              {/* KPI Cards */}
              <div className="kpi-grid">
                <div className="kpi-card kpi-amber">
                  <div className="kpi-top">
                    <span className="kpi-label">Total Jobs</span>
                    <div className="kpi-icon-wrap amber-icon">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    </div>
                  </div>
                  <div className="kpi-value">{dashboard.totalJobs}</div>
                  <div className="kpi-sub">All time</div>
                </div>
                <div className="kpi-card kpi-yellow">
                  <div className="kpi-top">
                    <span className="kpi-label">Pending</span>
                    <div className="kpi-icon-wrap yellow-icon">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>
                    </div>
                  </div>
                  <div className="kpi-value">{dashboard.pendingJobs}</div>
                  <div className="kpi-sub">Awaiting</div>
                </div>
                <div className="kpi-card kpi-blue">
                  <div className="kpi-top">
                    <span className="kpi-label">In Progress</span>
                    <div className="kpi-icon-wrap blue-icon">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
                    </div>
                  </div>
                  <div className="kpi-value">{dashboard.inProgressJobs}</div>
                  <div className="kpi-sub">Active work</div>
                </div>
                <div className="kpi-card kpi-green">
                  <div className="kpi-top">
                    <span className="kpi-label">Completed</span>
                    <div className="kpi-icon-wrap green-icon">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
                    </div>
                  </div>
                  <div className="kpi-value">{dashboard.completedJobs}</div>
                  <div className="kpi-sub">{dashboard.totalJobs ? Math.round((dashboard.completedJobs / dashboard.totalJobs) * 100) : 0}% rate</div>
                </div>
                <div className="kpi-card kpi-red">
                  <div className="kpi-top">
                    <span className="kpi-label">Cancelled</span>
                    <div className="kpi-icon-wrap red-icon">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                    </div>
                  </div>
                  <div className="kpi-value">{dashboard.cancelledJobs}</div>
                  <div className="kpi-sub">Total</div>
                </div>
                <div className="kpi-card kpi-purple">
                  <div className="kpi-top">
                    <span className="kpi-label">Revenue Est.</span>
                    <div className="kpi-icon-wrap purple-icon">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    </div>
                  </div>
                  <div className="kpi-value">${dashboard.totalEstimated.toFixed(0)}</div>
                  <div className="kpi-sub">Estimated</div>
                </div>
              </div>

              {/* Bottom grid */}
              <div className="dash-bottom">
                <div className="panel">
                  <div className="panel-header">
                    <div><h2>Financial Overview</h2><p>Revenue & cost summary</p></div>
                  </div>
                  <div className="summary-list">
                    <div><span>Estimated revenue</span><strong>${dashboard.totalEstimated.toFixed(2)}</strong></div>
                    <div><span>Actual revenue</span><strong>${dashboard.totalActual.toFixed(2)}</strong></div>
                    <div><span>Average job cost</span><strong>${dashboard.averageCost.toFixed(2)}</strong></div>
                    <div><span>Open jobs</span><strong>{dashboard.pendingJobs + dashboard.inProgressJobs}</strong></div>
                    <div><span>Completion rate</span><strong>{dashboard.totalJobs ? Math.round((dashboard.completedJobs / dashboard.totalJobs) * 100) : 0}%</strong></div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header split">
                    <div><h2>Recent Repairs</h2><p>Latest jobs in system</p></div>
                    <button className="btn ghost" onClick={() => setActiveTab("repairs")}>View all</button>
                  </div>
                  <RepairList repairs={dashboard.recentJobs} onEdit={handleEdit} onDelete={handleDelete} onComplete={handleComplete} />
                </div>

                {/*<div className="panel garage-gallery">
                  <div className="panel-header"><div><h2>Garage Showcase</h2><p>Your workshop</p></div></div>
                  <div className="gallery-grid">
                    <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=280&q=75&auto=format&fit=crop" alt="Repair" className="gallery-img" onError={e => e.target.style.display='none'} />
                    <img src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=280&q=75&auto=format&fit=crop" alt="Mechanic" className="gallery-img" onError={e => e.target.style.display='none'} />
                    <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=280&q=75&auto=format&fit=crop" alt="Engine" className="gallery-img" onError={e => e.target.style.display='none'} />
                    <img src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=280&q=75&auto=format&fit=crop" alt="Sports car" className="gallery-img" onError={e => e.target.style.display='none'} />
                  </div>
                </div>*/}
              </div>
            </section>
          )}

          {/* ALL REPAIRS */}
          {activeTab === "repairs" && (
            <section className="tab-page panel list-panel">
              <div className="panel-header split">
                <div><h2>All Repair Jobs</h2><p>Search, filter, edit, complete, or delete repair jobs</p></div>
                <button className="btn primary" onClick={() => { setEditingRepair(null); setActiveTab("add"); }}>+ Add Repair</button>
              </div>
              <div className="toolbar">
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by customer, plate, car, or issue..." />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button className="btn ghost" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>Reset</button>
              </div>
              <RepairList repairs={visibleRepairs} onEdit={handleEdit} onDelete={handleDelete} onComplete={handleComplete} />
            </section>
          )}

          {/* ADD/EDIT */}
          {activeTab === "add" && (
            <section className="tab-page form-wrapper">
              <RepairForm onSubmit={handleSubmit} editingRepair={editingRepair} onCancelEdit={() => { setEditingRepair(null); setActiveTab("repairs"); }} />
            </section>
          )}

          {/* COMPLETED */}
          {activeTab === "completed" && (
            <section className="tab-page panel list-panel">
              <div className="panel-header">
                <div><h2>Completed Repairs</h2><p>Archive of finished repair jobs with completion dates</p></div>
              </div>
              <RepairList repairs={completedRepairs} onEdit={handleEdit} onDelete={handleDelete} onComplete={handleComplete} />
            </section>
          )}

          {/* ABOUT */}
          {activeTab === "about" && (
            <section className="tab-page about-grid">
              <div className="panel">
                <div className="panel-header"><div><h2>About Repair Manager</h2><p>MERN stack garage management system</p></div></div>
                <p className="about-text">Repair Manager is a full-stack MERN application built for auto repair shops. It features JWT authentication, protected API routes, customer-facing tracking, and a complete repair job lifecycle.</p>
                <ul className="feature-list">
                  <li>MongoDB stores users and repair jobs with tracking codes</li>
                  <li>Express & Node.js provide secured REST API endpoints</li>
                  <li>React powers the authenticated sidebar dashboard</li>
                  <li>Axios sends requests with Bearer JWT authorization</li>
                  <li>Public customer tracking portal — no login required</li>
                </ul>
              </div>
              <div className="panel">
                <div className="panel-header"><div><h2>API Reference</h2><p>Available endpoints</p></div></div>
                <div className="api-table">
                  <div><strong>GET</strong><span>/api/repairs/track/:code</span></div>
                  <div><strong>POST</strong><span>/api/auth/signup</span></div>
                  <div><strong>POST</strong><span>/api/auth/login</span></div>
                  <div><strong>GET</strong><span>/api/auth/me</span></div>
                  <div><strong>POST</strong><span>/api/repairs</span></div>
                  <div><strong>GET</strong><span>/api/repairs</span></div>
                  <div><strong>PUT</strong><span>/api/repairs/:id</span></div>
                  <div><strong>DELETE</strong><span>/api/repairs/:id</span></div>
                  <div><strong>PATCH</strong><span>/api/repairs/:id/complete</span></div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
