import { useState } from "react";
import axios from "axios";

const TRACK_API = "http://localhost:5000/api/repairs/track";

function getDaysInGarage(repair) {
  const start = new Date(repair.createdAt);
  const end = repair.completedAt ? new Date(repair.completedAt) : new Date();
  return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

function CustomerTrack({ onBackToLogin }) {
  const [trackingCode, setTrackingCode] = useState("");
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = trackingCode.trim();
    if (!cleanCode) return;

    try {
      setLoading(true);
      setError("");
      setRepair(null);
      const response = await axios.get(`${TRACK_API}/${encodeURIComponent(cleanCode)}`);
      setRepair(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to find this repair code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="customer-track-page">
      <section className="track-hero">
        <p className="eyebrow">Customer Portal</p>
        <h1>Track Your<br />Car Repair</h1>
        <p>Enter the tracking code provided by the garage to check your vehicle's repair status instantly — no account needed.</p>
      </section>

      <section className="track-card">
        <button className="link-btn" onClick={onBackToLogin}>← Back to staff login</button>

        <div>
          <h2>Repair Status Lookup</h2>
          <p className="muted">Format: RM-260424-A1B2C3</p>
        </div>

        <form className="track-form" onSubmit={handleSubmit}>
          <input
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            placeholder="Enter your tracking code"
            autoFocus
          />
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Checking..." : "Check Status"}
          </button>
        </form>

        {error && <div className="alert">{error}</div>}

        {repair && (
          <article className="customer-result">
            <div className="repair-main">
              <div>
                <h3>{repair.carModel}</h3>
                <p className="car-model">Code: <code>{repair.trackingCode}</code></p>
              </div>
              <span className={`status-badge ${repair.status}`}>{repair.status.replace("-", " ")}</span>
            </div>

            <div className="progress-steps">
              <span className={repair.status !== "cancelled" ? "done" : ""}>Received</span>
              <span className={["in-progress", "completed"].includes(repair.status) ? "done" : ""}>In Progress</span>
              <span className={repair.status === "completed" ? "done" : ""}>Completed</span>
            </div>

            <p className="issue">{repair.issueDescription}</p>

            <div className="meta-grid">
              <span><strong>Customer:</strong> {repair.customerName}</span>
              <span><strong>Plate:</strong> {repair.licensePlate || "—"}</span>
              <span><strong>Estimated:</strong> ${Number(repair.estimatedCost || 0).toFixed(2)}</span>
              <span><strong>Actual:</strong> ${Number(repair.actualCost || 0).toFixed(2)}</span>
              <span><strong>Days in garage:</strong> {getDaysInGarage(repair)}</span>
              <span><strong>Created:</strong> {new Date(repair.createdAt).toLocaleDateString()}</span>
              {repair.completedAt && (
                <span><strong>Completed:</strong> {new Date(repair.completedAt).toLocaleDateString()}</span>
              )}
            </div>
          </article>
        )}
      </section>
    </main>
  );
}

export default CustomerTrack;
