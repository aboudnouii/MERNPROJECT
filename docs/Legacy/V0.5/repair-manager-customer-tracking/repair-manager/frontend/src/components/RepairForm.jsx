import { useEffect, useState } from "react";

const initialState = {
  customerName: "",
  phoneNumber: "",
  carModel: "",
  licensePlate: "",
  issueDescription: "",
  status: "pending",
  estimatedCost: "",
  actualCost: "",
};

function RepairForm({ onSubmit, editingRepair, onCancelEdit }) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (editingRepair) {
      setFormData({
        customerName: editingRepair.customerName || "",
        phoneNumber: editingRepair.phoneNumber || "",
        carModel: editingRepair.carModel || "",
        licensePlate: editingRepair.licensePlate || "",
        issueDescription: editingRepair.issueDescription || "",
        status: editingRepair.status || "pending",
        estimatedCost: editingRepair.estimatedCost ?? "",
        actualCost: editingRepair.actualCost ?? "",
      });
    } else {
      setFormData(initialState);
    }
  }, [editingRepair]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      estimatedCost: Number(formData.estimatedCost || 0),
      actualCost: Number(formData.actualCost || 0),
    };

    await onSubmit(payload);
    setFormData(initialState);
  };

  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <div>
          <h2>{editingRepair ? "Edit Repair Job" : "Add Repair Job"}</h2>
          <p>{editingRepair ? "Update the selected job details." : "Create a new customer repair ticket."}</p>
        </div>
      </div>

      <form className="repair-form" onSubmit={handleSubmit}>
        <label>
          Customer Name *
          <input
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Aboud Noui"
            required
          />
        </label>

        <label>
          Phone Number
          <input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="0555 123 456"
          />
        </label>

        <label>
          Car Model *
          <input
            name="carModel"
            value={formData.carModel}
            onChange={handleChange}
            placeholder="Hyundai Tucson 2022"
            required
          />
        </label>

        <label>
          License Plate
          <input
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            placeholder="16-123-456"
          />
        </label>

        <label className="full-width">
          Issue Description *
          <textarea
            name="issueDescription"
            value={formData.issueDescription}
            onChange={handleChange}
            placeholder="Check engine light on"
            required
          />
        </label>

        <label>
          Status
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label>
          Estimated Cost
          <input
            type="number"
            min="0"
            name="estimatedCost"
            value={formData.estimatedCost}
            onChange={handleChange}
            placeholder="350"
          />
        </label>

        <label>
          Actual Cost
          <input
            type="number"
            min="0"
            name="actualCost"
            value={formData.actualCost}
            onChange={handleChange}
            placeholder="0"
          />
        </label>

        <div className="form-actions full-width">
          <button className="btn primary" type="submit">
            {editingRepair ? "Save Changes" : "Add Repair"}
          </button>
          {editingRepair && (
            <button className="btn ghost" type="button" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default RepairForm;
