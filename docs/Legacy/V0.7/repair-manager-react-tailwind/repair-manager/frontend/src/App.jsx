import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import RepairForm from "./components/RepairForm";
import RepairList from "./components/RepairList";
import AuthForm from "./components/AuthForm";
import CustomerTrack from "./components/CustomerTrack";

const REPAIRS_API = "http://localhost:5000/api/repairs";
const AUTH_API = "http://localhost:5000/api/auth";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "repairs", label: "All Repairs", icon: "⚙" },
  { id: "add", label: "New Repair", icon: "+" },
  { id: "completed", label: "Completed", icon: "✓" },
  { id: "about", label: "About", icon: "i" },
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("repairManagerUser"));
  } catch {
    return null;
  }
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

  const authHeaders = useMemo(() => {
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  }, [user]);

  const saveUser = (userData) => {
    localStorage.setItem("repairManagerUser", JSON.stringify(userData));
    setUser(userData);
  };

  const handleAuth = async (formData) => {
    try {
      setAuthLoading(true);
      setAuthError("");
      const endpoint = authMode === "signup" ? "signup" : "login";
      const payload = authMode === "signup"
        ? formData
        : { email: formData.email, password: formData.password };
      const response = await axios.post(`${AUTH_API}/${endpoint}`, payload);
      saveUser(response.data);
      setActiveTab("dashboard");
    } catch (err) {
      setAuthError(err.response?.data?.message || "Authentication failed. Check backend and MongoDB.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("repairManagerUser");
    setUser(null);
    setRepairs([]);
    setEditingRepair(null);
    setActiveTab("dashboard");
  };

  const fetchRepairs = async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(REPAIRS_API, { headers: authHeaders });
      setRepairs(response.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      setError(err.response?.data?.message || "Unable to fetch repair jobs. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const handleSubmit = async (formData) => {
    try {
      setError("");
      if (editingRepair) {
        await axios.put(`${REPAIRS_API}/${editingRepair._id}`, formData, { headers: authHeaders });
        setEditingRepair(null);
        setActiveTab("repairs");
      } else {
        await axios.post(REPAIRS_API, formData, { headers: authHeaders });
        setActiveTab("repairs");
      }
      await fetchRepairs();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save repair job");
    }
  };

  const handleEdit = (repair) => {
    setEditingRepair(repair);
    setActiveTab("add");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this repair job?");
    if (!confirmed) return;
    try {
      setError("");
      await axios.delete(`${REPAIRS_API}/${id}`, { headers: authHeaders });
      await fetchRepairs();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete repair job");
    }
  };

  const handleComplete = async (id) => {
    try {
      setError("");
      await axios.patch(`${REPAIRS_API}/${id}/complete`, {}, { headers: authHeaders });
      await fetchRepairs();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark repair job as completed");
    }
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
      const matchesSearch =
        !term ||
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
    if (publicTrackMode) {
      return <CustomerTrack onBackToLogin={() => setPublicTrackMode(false)} />;
    }
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

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">Auto Garage Management System</p>
          <h1>Repair Manager</h1>
          <p>Welcome back, {user.name}. Manage customers, vehicles, repair jobs, costs, and completion status from one clean private dashboard.</p>
        </div>
        <div className="hero-actions">
          <button className="btn hero-btn" onClick={() => { setEditingRepair(null); setActiveTab("add"); }}>
            + New Repair
          </button>
          <button className="btn logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <nav className="tabs" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => {
              if (tab.id !== "add") setEditingRepair(null);
              setActiveTab(tab.id);
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {error && <div className="alert">{error}</div>}
      {loading && <div className="loading-box">Loading data from backend…</div>}

      {activeTab === "dashboard" && (
        <section className="tab-page">
          <div className="stats-grid extended">
            <div className="stat-card"><span>Total Jobs</span><strong>{dashboard.totalJobs}</strong></div>
            <div className="stat-card"><span>Pending</span><strong>{dashboard.pendingJobs}</strong></div>
            <div className="stat-card"><span>In Progress</span><strong>{dashboard.inProgressJobs}</strong></div>
            <div className="stat-card"><span>Completed</span><strong>{dashboard.completedJobs}</strong></div>
            <div className="stat-card"><span>Cancelled</span><strong>{dashboard.cancelledJobs}</strong></div>
            <div className="stat-card"><span>Avg. Est. Cost</span><strong>${dashboard.averageCost.toFixed(0)}</strong></div>
          </div>

          <div className="dashboard-grid">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>Garage Overview</h2>
                  <p>Financial & operational summary</p>
                </div>
              </div>
              <div className="summary-list">
                <div><span>Total estimated revenue</span><strong>${dashboard.totalEstimated.toFixed(2)}</strong></div>
                <div><span>Total actual revenue</span><strong>${dashboard.totalActual.toFixed(2)}</strong></div>
                <div><span>Open jobs</span><strong>{dashboard.pendingJobs + dashboard.inProgressJobs}</strong></div>
                <div><span>Completion rate</span><strong>{dashboard.totalJobs ? Math.round((dashboard.completedJobs / dashboard.totalJobs) * 100) : 0}%</strong></div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>Recent Repair Jobs</h2>
                  <p>Latest jobs added to the system</p>
                </div>
              </div>
              <RepairList repairs={dashboard.recentJobs} onEdit={handleEdit} onDelete={handleDelete} onComplete={handleComplete} />
            </div>
          </div>
        </section>
      )}

      {activeTab === "repairs" && (
        <section className="tab-page panel list-panel">
          <div className="panel-header split">
            <div>
              <h2>All Repair Jobs</h2>
              <p>Search, filter, edit, complete, or delete repair jobs</p>
            </div>
            <button className="btn primary" onClick={() => { setEditingRepair(null); setActiveTab("add"); }}>+ Add Repair</button>
          </div>

          <div className="toolbar">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer, plate, car, or issue..."
            />
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

      {activeTab === "add" && (
        <section className="tab-page form-wrapper">
          <RepairForm onSubmit={handleSubmit} editingRepair={editingRepair} onCancelEdit={() => { setEditingRepair(null); setActiveTab("repairs"); }} />
        </section>
      )}

      {activeTab === "completed" && (
        <section className="tab-page panel list-panel">
          <div className="panel-header">
            <div>
              <h2>Completed Repairs</h2>
              <p>Archive of finished repair jobs with completion dates</p>
            </div>
          </div>
          <RepairList repairs={completedRepairs} onEdit={handleEdit} onDelete={handleDelete} onComplete={handleComplete} />
        </section>
      )}

      {activeTab === "about" && (
        <section className="tab-page about-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>About Repair Manager</h2>
                <p>MERN stack garage management system</p>
              </div>
            </div>
            <p className="about-text">
              Repair Manager is a full-stack MERN application built for auto repair shops. It features JWT authentication, protected API routes, customer-facing tracking, and a complete repair job lifecycle.
            </p>
            <ul className="feature-list">
              <li>MongoDB stores users and repair jobs with tracking codes</li>
              <li>Express & Node.js provide secured REST API endpoints</li>
              <li>React powers the authenticated tab-based dashboard</li>
              <li>Axios sends requests with Bearer JWT authorization</li>
              <li>Public customer tracking portal — no login required</li>
            </ul>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>API Reference</h2>
                <p>Available endpoints</p>
              </div>
            </div>
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
    </main>
  );
}

export default App;
