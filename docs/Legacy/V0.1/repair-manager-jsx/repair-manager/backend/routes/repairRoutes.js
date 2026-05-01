const express = require("express");
const RepairJob = require("../models/RepairJob");

const router = express.Router();

// POST /api/repairs - Create a new repair job
router.post("/", async (req, res) => {
  try {
    const repairJob = await RepairJob.create(req.body);
    res.status(201).json(repairJob);
  } catch (error) {
    res.status(400).json({ message: "Failed to create repair job", error: error.message });
  }
});

// GET /api/repairs - Get all repair jobs
router.get("/", async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { licensePlate: { $regex: search, $options: "i" } },
        { carModel: { $regex: search, $options: "i" } },
      ];
    }

    const repairJobs = await RepairJob.find(filter).sort({ createdAt: -1 });
    res.json(repairJobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to get repair jobs", error: error.message });
  }
});

// GET /api/repairs/:id - Get a single repair job
router.get("/:id", async (req, res) => {
  try {
    const repairJob = await RepairJob.findById(req.params.id);

    if (!repairJob) {
      return res.status(404).json({ message: "Repair job not found" });
    }

    res.json(repairJob);
  } catch (error) {
    res.status(500).json({ message: "Failed to get repair job", error: error.message });
  }
});

// PUT /api/repairs/:id - Update a repair job
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.status === "completed" && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    if (updateData.status && updateData.status !== "completed") {
      updateData.completedAt = null;
    }

    const repairJob = await RepairJob.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!repairJob) {
      return res.status(404).json({ message: "Repair job not found" });
    }

    res.json(repairJob);
  } catch (error) {
    res.status(400).json({ message: "Failed to update repair job", error: error.message });
  }
});

// DELETE /api/repairs/:id - Delete a repair job
router.delete("/:id", async (req, res) => {
  try {
    const repairJob = await RepairJob.findByIdAndDelete(req.params.id);

    if (!repairJob) {
      return res.status(404).json({ message: "Repair job not found" });
    }

    res.json({ message: "Repair job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete repair job", error: error.message });
  }
});

// PATCH /api/repairs/:id/complete - Mark as completed
router.patch("/:id/complete", async (req, res) => {
  try {
    const repairJob = await RepairJob.findByIdAndUpdate(
      req.params.id,
      {
        status: "completed",
        completedAt: new Date(),
        actualCost: req.body.actualCost,
      },
      { new: true, runValidators: true }
    );

    if (!repairJob) {
      return res.status(404).json({ message: "Repair job not found" });
    }

    res.json(repairJob);
  } catch (error) {
    res.status(400).json({ message: "Failed to complete repair job", error: error.message });
  }
});

module.exports = router;
