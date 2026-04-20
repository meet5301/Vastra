const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validate");

const signupValidation = [
  body("username").trim().isLength({ min: 2, max: 60 }).withMessage("Username must be 2-60 characters"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6, max: 128 }).withMessage("Password must be 6-128 characters"),
  handleValidationErrors,
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6, max: 128 }).withMessage("Password must be 6-128 characters"),
  handleValidationErrors,
];

const addressValidation = [
  body("fullName").trim().isLength({ min: 2, max: 80 }).withMessage("Full name must be 2-80 characters"),
  body("phone")
    .trim()
    .matches(/^[0-9+\-()\s]{7,20}$/)
    .withMessage("Phone number format is invalid"),
  body("address").trim().isLength({ min: 5, max: 200 }).withMessage("Address must be 5-200 characters"),
  body("city").trim().isLength({ min: 2, max: 80 }).withMessage("City must be 2-80 characters"),
  handleValidationErrors,
];

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// POST /api/auth/signup
router.post("/signup", signupValidation, async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/brand/signup
router.post(
  "/brand/signup",
  [
    ...signupValidation.slice(0, 3),
    body("brandName").trim().isLength({ min: 2, max: 120 }).withMessage("Brand name must be 2-120 characters"),
    body("contactPhone")
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^[0-9+\-()\s]{7,20}$/)
      .withMessage("Contact phone format is invalid"),
    body("website").optional({ checkFalsy: true }).trim().isURL().withMessage("Website must be a valid URL"),
    handleValidationErrors,
  ],
  async (req, res) => {
  const { username, email, password, brandName, contactPhone, website, companyName, about } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const normalizedBrandName = (brandName || "").trim();
    const fallbackUsername = normalizedBrandName || String(email || "").split("@")[0] || "brand-seller";

    const user = await User.create({
      username: (username || "").trim() || fallbackUsername,
      email,
      password,
      role: "brand",
      brandProfile: {
        brandName: normalizedBrandName,
        contactPhone: (contactPhone || "").trim(),
        website: (website || "").trim(),
        companyName: (companyName || "").trim(),
        about: (about || "").trim(),
        approved: false,
      },
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        brandProfile: user.brandProfile,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
  }
);

// POST /api/auth/login
router.post("/login", loginValidation, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/brand/login
router.post("/brand/login", loginValidation, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)) || user.role !== "brand") {
      return res.status(401).json({ success: false, message: "Invalid brand credentials" });
    }

    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        brandProfile: user.brandProfile,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me - get logged in user
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").populate("wishlist");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/profile - update profile
router.put(
  "/profile",
  protect,
  [
    body("username").optional().trim().isLength({ min: 2, max: 60 }).withMessage("Username must be 2-60 characters"),
    body("email").optional().trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    handleValidationErrors,
  ],
  async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, email },
      { new: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
  }
);

// PUT /api/auth/change-password
router.put(
  "/change-password",
  protect,
  [
    body("oldPassword").isLength({ min: 6, max: 128 }).withMessage("Old password must be 6-128 characters"),
    body("newPassword").isLength({ min: 6, max: 128 }).withMessage("New password must be 6-128 characters"),
    handleValidationErrors,
  ],
  async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(oldPassword))) {
      return res.status(400).json({ success: false, message: "Old password incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
  }
);

// POST /api/auth/addresses - add address
router.post("/addresses", protect, addressValidation, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { fullName, phone, address, city, isDefault } = req.body;
    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push({ fullName, phone, address, city, isDefault: !!isDefault });
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/auth/addresses/:addrId - delete address
router.delete("/addresses/:addrId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addrId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/wishlist/:productId - toggle wishlist
router.post("/wishlist/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.productId;
    const idx = user.wishlist.indexOf(pid);
    if (idx === -1) {
      user.wishlist.push(pid);
    } else {
      user.wishlist.splice(idx, 1);
    }
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
