const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "public/images/products/";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/products - get all active products (user side)
router.get("/", async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    let query = { isActive: true };

    if (category && category !== "All") query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    let sortObj = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { price: 1 };
    if (sort === "price_desc") sortObj = { price: -1 };
    if (sort === "rating") sortObj = { avgRating: -1 };

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortObj).skip(skip).limit(Number(limit));

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/featured
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true }).limit(8);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products/:id/reviews - add review
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ success: false, message: "Already reviewed" });

    product.reviews.push({ user: req.user._id, username: req.user.username, rating, comment });
    product.numReviews = product.reviews.length;
    product.avgRating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ success: true, message: "Review added" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────

// GET /api/products/admin/all - admin: all products including inactive
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products/admin/create
router.post("/admin/create", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, subCategory, sizes, colors, stock, isFeatured } = req.body;
    const image = req.file ? `images/products/${req.file.filename}` : req.body.image;

    const product = await Product.create({
      name, price, description, category, subCategory,
      sizes: sizes ? sizes.split(",").map((s) => s.trim()) : ["S", "M", "L", "XL"],
      colors: colors ? colors.split(",").map((c) => c.trim()) : [],
      stock, image, isFeatured: isFeatured === "true",
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/admin/:id
router.put("/admin/:id", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.image = `images/products/${req.file.filename}`;
    if (update.sizes && typeof update.sizes === "string") update.sizes = update.sizes.split(",").map((s) => s.trim());
    if (update.colors && typeof update.colors === "string") update.colors = update.colors.split(",").map((c) => c.trim());

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/admin/:id
router.delete("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
