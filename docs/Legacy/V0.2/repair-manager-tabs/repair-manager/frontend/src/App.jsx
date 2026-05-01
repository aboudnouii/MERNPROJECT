import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import RepairForm from "./components/RepairForm";
import RepairList from "./components/RepairList";

const API_URL = "http://localhost:5000/api/repairs";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "repairs", label: "All Repairs", icon: "🧰" },
  { id: "add", label: "Add Repair", icon: "➕" },
  { id: "completed", label: "Completed", icon: "✅" },
  { id: "about", label: "About", icon: "ℹ️" },
];

function App() {
  const [repairs, setRepairs] = useState([]);
  const [editingRepair, setEditingRepair] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      setRepairs(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch repair jobs. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setError("");
      if (editingRepair) {
        await axios.put(`${API_URL}/${editingRepair._id}`, formData);
        setEditingRepair(null);
        setActiveTab("repairs");
      } else {
        await axios.post(API_URL, formData);
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
      await axios.delete(`${API_URL}/${id}`);
      await fetchRepairs();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete repair job");
    }
  };

  const handleComplete = async (id) => {
    try {
      setError("");
      await axios.patch(`${API_URL}/${id}/complete`);
      await fetchRepairs();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark repair job as completed");
    }
  };

  const dashboard = useMemo(() => {
    const totalJobs = repairs.length;
    const completedJobs = repairs.filter((job) => job.status === "completed").length;
    const pendingJobs = repairs.filter((job) => job.status === "pending").length;
    const inProgressJobs = repairs.filter((job) => job.status === "in-progress").length;
    const cancelledJobs = repairs.filter((job) => job.status === "cancelled").length;
    const totalEstimated = repairs.reduce((sum, job) => sum + Number(job.estimatedCost || 0), 0);
    const totalActual = repairs.reduce((sum, job) => sum + Number(job.actualCost || 0), 0);
    const averageCost = totalJobs ? totalEstimated / totalJobs : 0;
    const recentJobs = [...repairs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    return {
      totalJobs,
      completedJobs,
      pendingJobs,
      inProgressJobs,
      cancelledJobs,
      totalEstimated,
      totalActual,
      averageCost,
      recentJobs,
    };
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
        repair.issueDescription?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [repairs, statusFilter, searchTerm]);

  const completedRepairs = repairs.filter((repair) => repair.status === "completed");

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Auto Garage Management System</p>
          <h1>Repair Manager</h1>
          <p>Manage customers, vehicles, repair jobs, costs, and completion status from one clean dashboard.</p>
        </div>
        <button className="btn hero-btn" onClick={() => { setEditingRepair(null); setActiveTab("add"); }}>
          + New Repair
        </button>
      </header>

      <nav className="tabs" aria-label="Main navigation tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => {
              if (tab.id !== "add") setEditingRepair(null);
              setActiveTab(tab.id);
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {error && <div className="alert">{error}</div>}
      {loading && <div className="loading-box">Loading data from backend...</div>}

      {activeTab === "dashboard" && (
        <section className="tab-page">
          <div className="stats-grid extended">
            <div className="stat-card"><span>Total Jobs</span><strong>{dashboard.totalJobs}</strong></div>
            <div className="stat-card"><span>Pending</span><strong>{dashboard.pendingJobs}</strong></div>
            <div className="stat-card"><span>In Progress</span><strong>{dashboard.inProgressJobs}</strong></div>
            <div className="stat-card"><span>Completed</span><strong>{dashboard.completedJobs}</strong></div>
            <div className="stat-card"><span>Cancelled</span><strong>{dashboard.cancelledJobs}</strong></div>
            <div className="stat-card"><span>Average Est. Cost</span><strong>${dashboard.averageCost.toFixed(2)}</strong></div>
          </div>

          <section className="dashboard-grid">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>Garage Overview</h2>
                  <p>Quick financial and operational summary.</p>
                </div>
              </div>
              <div className="summary-list">
                <div><span>Total estimated revenue</span><strong>${dashboard.totalEstimated.toFixed(2)}</strong></div>
                <div><span>Total actual revenue</span><strong>${dashboard.totalActual.toFixed(2)}</strong></div>
                <div><span>Open jobs</span><strong>{dashboard.pendingJobs + dashboard.inProgressJobs}</strong></div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>Recent Repair Jobs</h2>
                  <p>Latest jobs added to the system.</p>
                </div>
              </div>
              <RepairList
                repairs={dashboard.recentJobs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onComplete={handleComplete}
              />
            </div>
          </section>
        </section>
      )}

      {activeTab === "repairs" && (
        <section className="tab-page panel list-panel">
          <div className="panel-header split">
            <div>
              <h2>All Repair Jobs</h2>
              <p>Search, filter, edit, complete, or delete repair jobs.</p>
            </div>
            <button className="btn primary" onClick={() => { setEditingRepair(null); setActiveTab("add"); }}>
              Add Repair
            </button>
          </div>

          <div className="toolbar">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, plate, car, or issue..."
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="btn secondary" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>
              Reset
            </button>
          </div>

          <RepairList
            repairs={visibleRepairs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComplete={handleComplete}
          />
        </section>
      )}

      {activeTab === "add" && (
        <section className="tab-page form-wrapper">
          <RepairForm
            onSubmit={handleSubmit}
            editingRepair={editingRepair}
            onCancelEdit={() => { setEditingRepair(null); setActiveTab("repairs"); }}
          />
        </section>
      )}

      {activeTab === "completed" && (
        <section className="tab-page panel list-panel">
          <div className="panel-header">
            <div>
              <h2>Completed Repairs</h2>
              <p>Archive of finished repair jobs with completion dates.</p>
            </div>
          </div>
          <RepairList
            repairs={completedRepairs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComplete={handleComplete}
          />
        </section>
      )}

      {activeTab === "about" && (
        <section className="tab-page about-grid">
          <div className="panel">
            <h2>About Repair Manager</h2>
            <p>
              Repair Manager is a MERN stack web application built for an auto repair shop. It follows the same idea as a Task Manager project, but the task entity is replaced by a vehicle repair job.
            </p>
            <ul className="feature-list">
              <li>MongoDB stores repair jobs.</li>
              <li>Express and Node.js provide the REST API.</li>
              <li>React provides the tab-based user interface.</li>
              <li>Axios connects the frontend to the backend.</li>
            </ul>
          </div>

          <div className="panel">
            <h2>Implemented API</h2>
            <div className="api-table">
              <div><strong>POST</strong><span>/api/repairs</span></div>
              <div><strong>GET</strong><span>/api/repairs</span></div>
              <div><strong>GET</strong><span>/api/repairs/:id</span></div>
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
