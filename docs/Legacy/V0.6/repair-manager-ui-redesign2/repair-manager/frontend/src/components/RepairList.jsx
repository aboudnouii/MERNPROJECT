import RepairItem from "./RepairItem";

function RepairList({ repairs, onEdit, onDelete, onComplete }) {
  if (!repairs.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔧</div>
        <p>No repair jobs found.</p>
      </div>
    );
  }

  return (
    <div className="repair-list">
      {repairs.map((repair) => (
        <RepairItem
          key={repair._id}
          repair={repair}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}

export default RepairList;
