import RepairItem from "./RepairItem";

function RepairList({ repairs, onEdit, onDelete, onComplete }) {
  if (!repairs.length) {
    return <p className="muted">No repair jobs found. Add your first repair job.</p>;
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
