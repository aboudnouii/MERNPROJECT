import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import RepairForm from "./components/RepairForm";
import RepairList from "./components/RepairList";

const API_URL = "http://localhost:5000/api/repairs";

function App() {
  const [repairs, setRepairs] = useState([]);
  const [editingRepair, setEditingRepair] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const response = await axios.get(API_URL, { params });
      setRepairs(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch repair jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSubmit = async (formData) => {
    try {
      setError("");
      if (editingRepair) {
        await axios.put(`${API_URL}/${editingRepair._id}`, formData);
        setEditingRepair(null);
      } else {
        await axios.post(API_URL, formData);
      }
      await fetchRepairs();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save repair job");
    }
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
    const totalEstimated = repairs.reduce((sum, job) => sum + Number(job.estimatedCost || 0), 0);
    const averageCost = totalJobs ? totalEstimated / totalJobs : 0;

    return { totalJobs, completedJobs, averageCost };
  }, [repairs]);

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Auto Garage Dashboard</p>
          <h1>Repair Manager</h1>
          <p>Manage customer vehicles, repair issues, costs, and completion status.</p>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Jobs</span>
          <strong>{dashboard.totalJobs}</strong>
        </div>
        <div className="stat-card">
          <span>Completed</span>
          <strong>{dashboard.completedJobs}</strong>
        </div>
        <div className="stat-card">
          <span>Average Est. Cost</span>
          <strong>${dashboard.averageCost.toFixed(2)}</strong>
        </div>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="layout-grid">
        <RepairForm
          onSubmit={handleSubmit}
          editingRepair={editingRepair}
          onCancelEdit={() => setEditingRepair(null)}
        />

        <section className="panel list-panel">
          <div className="panel-header">
            <div>
              <h2>Repair Jobs</h2>
              <p>Search, filter, edit, complete, or delete jobs.</p>
            </div>
          </div>

          <div className="toolbar">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchRepairs()}
              placeholder="Search customer, plate, or car..."
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="btn secondary" onClick={fetchRepairs}>Search</button>
          </div>

          {loading ? (
            <p className="muted">Loading repair jobs...</p>
          ) : (
            <RepairList
              repairs={repairs}
              onEdit={setEditingRepair}
              onDelete={handleDelete}
              onComplete={handleComplete}
            />
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
