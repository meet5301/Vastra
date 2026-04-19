const express = require("express");
const router = express.Router();
const Placement = require("../models/Placement");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/placements/admin/all
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const placements = await Placement.find().sort({ createdAt: -1 });
    res.json({ success: true, placements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/placements/admin/:key - upsert placement
router.put("/admin/:key", protect, adminOnly, async (req, res) => {
  try {
    const update = { ...req.body, key: req.params.key };
    const placement = await Placement.findOneAndUpdate(
      { key: req.params.key },
      update,
      { new: true, upsert: true }
    );
    res.json({ success: true, placement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/placements/admin/:id
router.delete("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    await Placement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Placement deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/placements/:key - public
router.get("/:key", async (req, res) => {
  try {
    const placement = await Placement.findOne({ key: req.params.key, isActive: true }).populate(
      "productIds",
      "name image price category"
    );
    if (!placement) return res.status(404).json({ success: false, message: "Placement not found" });
    res.json({ success: true, placement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
