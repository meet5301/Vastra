const express = require("express");
const router = express.Router();
const Brand = require("../models/Brand");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/brands - public list
router.get("/", async (req, res) => {
  try {
    const hasPaginationRequest = req.query.page !== undefined || req.query.limit !== undefined;

    if (!hasPaginationRequest) {
      const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
      const pagination = buildPaginationMeta(brands.length, 1, brands.length || 1);
      return res.json({ success: true, brands, pagination });
    }

    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    const query = { isActive: true };
    const total = await Brand.countDocuments(query);
    const brands = await Brand.find(query).sort({ name: 1 }).skip(skip).limit(limit);
    const pagination = buildPaginationMeta(total, page, limit);

    return res.json({ success: true, brands, total, pagination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/brands/admin/all - admin list
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const hasPaginationRequest = req.query.page !== undefined || req.query.limit !== undefined;

    if (!hasPaginationRequest) {
      const brands = await Brand.find().sort({ createdAt: -1 });
      const pagination = buildPaginationMeta(brands.length, 1, brands.length || 1);
      return res.json({ success: true, brands, pagination });
    }

    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    const total = await Brand.countDocuments();
    const brands = await Brand.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const pagination = buildPaginationMeta(total, page, limit);

    return res.json({ success: true, brands, total, pagination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/brands/admin/create
router.post("/admin/create", protect, adminOnly, async (req, res) => {
  try {
    const { name, slug, logo, description, isActive } = req.body;
    const slugValue = (slug || name || "").toString().trim().toLowerCase().replace(/\s+/g, "-");
    const brand = await Brand.create({
      name,
      slug: slugValue,
      logo,
      description,
      isActive: isActive !== undefined ? !!isActive : true,
    });
    res.status(201).json({ success: true, brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/brands/admin/:id
router.put("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    res.json({ success: true, brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/brands/admin/:id
router.delete("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Brand deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
