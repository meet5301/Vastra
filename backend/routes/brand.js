const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const { protect, brandOnly } = require("../middleware/auth");

function splitCsv(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

// GET /api/brand/me
router.get("/me", protect, brandOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/brand/me
router.put("/me", protect, brandOnly, async (req, res) => {
  try {
    const { username, contactPhone, website, companyName, about, brandName } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "Brand user not found" });

    user.username = username || user.username;
    user.brandProfile = {
      ...user.brandProfile,
      brandName: brandName ?? user.brandProfile?.brandName ?? "",
      contactPhone: contactPhone ?? user.brandProfile?.contactPhone ?? "",
      website: website ?? user.brandProfile?.website ?? "",
      companyName: companyName ?? user.brandProfile?.companyName ?? "",
      about: about ?? user.brandProfile?.about ?? "",
      approved: user.brandProfile?.approved !== false,
    };

    await user.save();
    res.json({ success: true, user: { id: user._id, username: user.username, email: user.email, role: user.role, brandProfile: user.brandProfile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/brand/products
router.get("/products", protect, brandOnly, async (req, res) => {
  try {
    const products = await Product.find({ sellerUser: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/brand/products
router.post("/products", protect, brandOnly, async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      image,
      category,
      subCategory,
      sizes,
      colors,
      stock,
      variants,
      tags,
      isActive,
    } = req.body;

    const product = await Product.create({
      name,
      price: Number(price || 0),
      description: description || "",
      image,
      category: category || "Other",
      subCategory: subCategory || "",
      sizes: splitCsv(sizes, ["S", "M", "L", "XL"]),
      colors: splitCsv(colors, []),
      stock: Number(stock || 0),
      variants: Array.isArray(variants) ? variants : [],
      tags: splitCsv(tags, []),
      isActive: isActive !== false,
      isFeatured: false,
      brandName: req.user.brandProfile?.brandName || req.user.username,
      sellerUser: req.user._id,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/brand/products/:id
router.put("/products/:id", protect, brandOnly, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, sellerUser: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const {
      name,
      price,
      description,
      image,
      category,
      subCategory,
      sizes,
      colors,
      stock,
      tags,
      isActive,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price || 0);
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (sizes !== undefined) product.sizes = splitCsv(sizes, product.sizes);
    if (colors !== undefined) product.colors = splitCsv(colors, product.colors);
    if (stock !== undefined) product.stock = Number(stock || 0);
    if (tags !== undefined) product.tags = splitCsv(tags, product.tags);
    if (isActive !== undefined) product.isActive = !!isActive;

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/brand/products/:id
router.delete("/products/:id", protect, brandOnly, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, sellerUser: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
