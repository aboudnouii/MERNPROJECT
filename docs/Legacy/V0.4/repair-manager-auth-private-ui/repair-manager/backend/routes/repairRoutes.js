const express = require("express");
const RepairJob = require("../models/RepairJob");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All repair routes are private.
router.use(protect);

// POST /api/repairs - Create a new repair job for the logged-in user only
router.post("/", async (req, res) => {
  try {
    const repairJob = await RepairJob.create({ ...req.body, user: req.user._id });
    res.status(201).json(repairJob);
  } catch (error) {
    res.status(400).json({ message: "Failed to create repair job", error: error.message });
  }
});

// GET /api/repairs - Get repair jobs that belong only to the logged-in user
router.get("/", async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = { user: req.user._id };

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

// GET /api/repairs/:id - Get a single repair job owned by the logged-in user
router.get("/:id", async (req, res) => {
  try {
    const repairJob = await RepairJob.findOne({ _id: req.params.id, user: req.user._id });

    if (!repairJob) {
      return res.status(404).json({ message: "Repair job not found" });
    }

    res.json(repairJob);
  } catch (error) {
    res.status(500).json({ message: "Failed to get repair job", error: error.message });
  }
});

// PUT /api/repairs/:id - Update a repair job owned by the logged-in user
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.user;

    if (updateData.status === "completed" && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    if (updateData.status && updateData.status !== "completed") {
      updateData.completedAt = null;
    }

    const repairJob = await RepairJob.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!repairJob) {
      return res.status(404).json({ message: "Repair job not found" });
    }

    res.json(repairJob);
  } catch (error) {
    res.status(400).json({ message: "Failed to update repair job", error: error.message });
  }
});

// DELETE /api/repairs/:id - Delete a repair job owned by the logged-in user
router.delete("/:id", async (req, res) => {
  try {
    const repairJob = await RepairJob.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!repairJob) {
      return res.status(404).json({ message: "Repair job not found" });
    }

    res.json({ message: "Repair job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete repair job", error: error.message });
  }
});

// PATCH /api/repairs/:id/complete - Mark as completed only if it belongs to the logged-in user
router.patch("/:id/complete", async (req, res) => {
  try {
    const update = {
      status: "completed",
      completedAt: new Date(),
    };

    if (req.body.actualCost !== undefined) {
      update.actualCost = req.body.actualCost;
    }

    const repairJob = await RepairJob.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
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
