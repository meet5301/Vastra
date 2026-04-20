const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const AdminAuditLog = require("../models/AdminAuditLog");
const { protect, adminOnly } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validate");

async function createBrandNotification(userId, title, message, type, meta = null) {
  if (!userId) return;
  await Notification.create({
    user: userId,
    title,
    message,
    type,
    meta,
    read: false,
  });
}

function getRequestIp(req) {
  const fromHeader = req.headers["x-forwarded-for"];
  if (typeof fromHeader === "string" && fromHeader.trim()) {
    return fromHeader.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "";
}

async function logAdminAction(req, action, statusCode, targetType, targetId, metadata = {}) {
  if (!req.user?._id) return;
  try {
    await AdminAuditLog.create({
      admin: req.user._id,
      action,
      method: req.method,
      route: req.originalUrl || req.url,
      statusCode: Number(statusCode || 200),
      targetType: targetType || "",
      targetId: targetId ? String(targetId) : "",
      ip: getRequestIp(req),
      userAgent: String(req.headers["user-agent"] || ""),
      metadata,
    });
  } catch (_) {
    // Audit logging should never block admin operations.
  }
}

// GET /api/admin/users - all users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const brandIds = users.filter((u) => u.role === "brand").map((u) => u._id);

    const productCounts = brandIds.length
      ? await Product.aggregate([
          { $match: { sellerUser: { $in: brandIds } } },
          { $group: { _id: "$sellerUser", count: { $sum: 1 } } },
        ])
      : [];

    const countMap = productCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const enrichedUsers = users.map((u) => ({
      ...u.toObject(),
      brandProductCount: u.role === "brand" ? countMap[u._id.toString()] || 0 : 0,
    }));

    res.json({ success: true, users: enrichedUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/brand-approval - approve/reject brand seller
router.put(
  "/users/:id/brand-approval",
  protect,
  adminOnly,
  [body("approved").isBoolean().withMessage("approved must be boolean"), handleValidationErrors],
  async (req, res) => {
  try {
    const approved = req.body.approved === true;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role !== "brand") {
      return res.status(400).json({ success: false, message: "User is not a brand seller" });
    }

    user.brandProfile = {
      ...(user.brandProfile || {}),
      approved,
    };
    await user.save();

    await createBrandNotification(
      user._id,
      approved ? "Brand Account Approved" : "Brand Account Pending",
      approved
        ? "Your brand account has been approved by admin. Your approved products can now appear publicly."
        : "Your brand account was set to pending by admin. Public visibility is paused until re-approved.",
      "brand_approval",
      { approved }
    );

    await logAdminAction(req, approved ? "BRAND_APPROVED" : "BRAND_REJECTED", 200, "USER", user._id, {
      approved,
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
  }
);

// PUT /api/admin/users/:id - admin edit user/brand basics
router.put(
  "/users/:id",
  protect,
  adminOnly,
  [
    body("username").optional().trim().isLength({ min: 2, max: 60 }).withMessage("Username must be 2-60 characters"),
    body("email").optional().trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    handleValidationErrors,
  ],
  async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { username, email, brandName, contactPhone, website, companyName, about } = req.body;
    if (typeof username === "string") user.username = username.trim() || user.username;
    if (typeof email === "string") user.email = email.trim().toLowerCase() || user.email;

    if (user.role === "brand") {
      user.brandProfile = {
        ...(user.brandProfile || {}),
        brandName: typeof brandName === "string" ? brandName.trim() : user.brandProfile?.brandName || "",
        contactPhone: typeof contactPhone === "string" ? contactPhone.trim() : user.brandProfile?.contactPhone || "",
        website: typeof website === "string" ? website.trim() : user.brandProfile?.website || "",
        companyName: typeof companyName === "string" ? companyName.trim() : user.brandProfile?.companyName || "",
        about: typeof about === "string" ? about.trim() : user.brandProfile?.about || "",
        approved: user.brandProfile?.approved === true,
      };
    }

    await user.save();
    await logAdminAction(req, "USER_UPDATED", 200, "USER", user._id, {
      usernameUpdated: typeof username === "string",
      emailUpdated: typeof email === "string",
    });
    res.json({ success: true, user: await User.findById(user._id).select("-password") });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
  }
);

// PUT /api/admin/users/:id/role - change user role
router.put(
  "/users/:id/role",
  protect,
  adminOnly,
  [body("role").isIn(["user", "admin", "brand"]).withMessage("Invalid role"), handleValidationErrors],
  async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select("-password");
    await logAdminAction(req, "USER_ROLE_UPDATED", 200, "USER", req.params.id, {
      role: req.body.role,
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
  }
);

// DELETE /api/admin/users/:id
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await logAdminAction(req, "USER_DELETED", 200, "USER", req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users/:id/products - list products for one brand seller
router.get("/users/:id/products", protect, adminOnly, async (req, res) => {
  try {
    const brandUser = await User.findById(req.params.id).select("_id role username brandProfile");
    if (!brandUser) return res.status(404).json({ success: false, message: "User not found" });
    if (brandUser.role !== "brand") {
      return res.status(400).json({ success: false, message: "User is not a brand seller" });
    }

    const products = await Product.find({ sellerUser: brandUser._id })
      .sort({ createdAt: -1 })
      .select("name price stock isActive adminApproved isFeatured image category");

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/products/:id/approval - approve/reject individual product
router.put(
  "/products/:id/approval",
  protect,
  adminOnly,
  [body("approved").isBoolean().withMessage("approved must be boolean"), handleValidationErrors],
  async (req, res) => {
  try {
    const approved = req.body.approved === true;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (!product.sellerUser) {
      return res.status(400).json({ success: false, message: "Only brand seller products can be approved here" });
    }

    product.adminApproved = approved;
    await product.save();

    await createBrandNotification(
      product.sellerUser,
      approved ? "Product Approved" : "Product Unapproved",
      approved
        ? `Your product \"${product.name}\" has been approved by admin.`
        : `Your product \"${product.name}\" has been unapproved by admin. Please review and update listing details.`,
      "product_approval",
      { productId: product._id, approved }
    );

    await logAdminAction(req, approved ? "PRODUCT_APPROVED" : "PRODUCT_UNAPPROVED", 200, "PRODUCT", product._id, {
      approved,
    });

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
  }
);

// GET /api/admin/analytics - dashboard analytics
router.get("/analytics", protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: last24h } });
    const totalOrders = await Order.countDocuments();
    const pendingBrandApprovals = await User.countDocuments({ role: "brand", "brandProfile.approved": false });
    const pendingProductApprovals = await Product.countDocuments({ sellerUser: { $ne: null }, adminApproved: false });
    const totalRevenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const pending = await Order.countDocuments({ orderStatus: "Processing" });
    const delivered = await Order.countDocuments({ orderStatus: "Delivered" });

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const ordersByUser = await Order.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const userIds = ordersByUser.map((u) => u._id).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds } }).select("username email");
    const userMap = users.reduce((acc, u) => {
      acc[u._id.toString()] = u;
      return acc;
    }, {});

    const ordersByUserEnriched = ordersByUser.map((u) => ({
      user: userMap[u._id?.toString()] || null,
      count: u.count,
      revenue: u.revenue,
    }));

    res.json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        totalOrders,
        pendingBrandApprovals,
        pendingProductApprovals,
        totalRevenue,
        pending,
        delivered,
        ordersByStatus,
        ordersByUser: ordersByUserEnriched,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/audit-logs - recent admin actions
router.get("/audit-logs", protect, adminOnly, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(10, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      AdminAuditLog.countDocuments(),
      AdminAuditLog.find()
        .populate("admin", "username email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.json({
      success: true,
      total,
      page,
      limit,
      logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
