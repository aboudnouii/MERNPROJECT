const mongoose = require("mongoose");

const RepairJobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  customerName: {
    type: String,
    required: [true, "Customer name is required"],
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  carModel: {
    type: String,
    required: [true, "Car model is required"],
    trim: true,
  },
  licensePlate: {
    type: String,
    trim: true,
    uppercase: true,
  },
  issueDescription: {
    type: String,
    required: [true, "Issue description is required"],
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  estimatedCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  actualCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("RepairJob", RepairJobSchema);
