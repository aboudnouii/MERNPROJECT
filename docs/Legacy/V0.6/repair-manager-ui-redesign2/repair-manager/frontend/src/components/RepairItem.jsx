function getDaysInGarage(repair) {
  const start = new Date(repair.createdAt);
  const end = repair.completedAt ? new Date(repair.completedAt) : new Date();
  const diff = end - start;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function RepairItem({ repair, onEdit, onDelete, onComplete }) {
  const daysInGarage = getDaysInGarage(repair);
  const isCompleted = repair.status === "completed";

  return (
    <article className="repair-card">
      <div className="repair-main">
        <div>
          <h3>{repair.customerName}</h3>
          <p className="car-model">{repair.carModel}</p>
        </div>
        <span className={`status-badge ${repair.status}`}>{repair.status.replace("-", " ")}</span>
      </div>

      <p className="issue">{repair.issueDescription}</p>

      <div className="meta-grid">
        <span><strong>Tracking:</strong> <code>{repair.trackingCode || "—"}</code></span>
        <span><strong>Phone:</strong> {repair.phoneNumber || "—"}</span>
        <span><strong>Plate:</strong> {repair.licensePlate || "—"}</span>
        <span><strong>Estimated:</strong> ${Number(repair.estimatedCost || 0).toFixed(2)}</span>
        <span><strong>Actual:</strong> ${Number(repair.actualCost || 0).toFixed(2)}</span>
        <span><strong>Days in garage:</strong> {daysInGarage}</span>
        <span><strong>Created:</strong> {new Date(repair.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="card-actions">
        {repair.trackingCode && (
          <button className="btn ghost" onClick={() => navigator.clipboard?.writeText(repair.trackingCode)}>
            Copy Code
          </button>
        )}
        <button className="btn secondary" onClick={() => onEdit(repair)}>Edit</button>
        <button className="btn danger" onClick={() => onDelete(repair._id)}>Delete</button>
        {!isCompleted && (
          <button className="btn success" onClick={() => onComplete(repair._id)}>
            Mark Complete
          </button>
        )}
      </div>
    </article>
  );
}

export default RepairItem;
