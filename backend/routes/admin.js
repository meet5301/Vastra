const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");

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
router.put("/users/:id/brand-approval", protect, adminOnly, async (req, res) => {
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

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id - admin edit user/brand basics
router.put("/users/:id", protect, adminOnly, async (req, res) => {
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
    res.json({ success: true, user: await User.findById(user._id).select("-password") });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/role - change user role
router.put("/users/:id/role", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/analytics - dashboard analytics
router.get("/analytics", protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: last24h } });
    const totalOrders = await Order.countDocuments();
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

module.exports = router;
