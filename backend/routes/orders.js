const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { protect, adminOnly } = require("../middleware/auth");

// POST /api/orders - place order (user or guest)
router.post("/", async (req, res) => {
  try {
    const { items, shippingAddress, guestInfo, paymentMethod, subtotal, shippingCost, discount, tax, totalAmount, coupon } = req.body;

    const orderData = {
      items, shippingAddress, paymentMethod,
      subtotal, shippingCost: shippingCost || 3.5, discount: discount || 0,
      tax: tax || 0, totalAmount, guestInfo,
      coupon: coupon || undefined,
    };

    // Attach user if logged in
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        orderData.user = decoded.id;
      } catch (_) {}
    }

    const order = await Order.create(orderData);

    if (coupon?.couponId) {
      await Coupon.findByIdAndUpdate(coupon.couponId, { $inc: { usedCount: 1 } });
    }
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/my - user's own orders
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id - get single order
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product", "name image price");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    // Allow user to see own order or admin to see any
    if (order.user && order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ROUTES ────────────────────────────────────────────────

// GET /api/orders/admin/all
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.orderStatus = status;
    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/admin/stats - dashboard stats
router.get("/admin/stats", protect, adminOnly, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const pending = await Order.countDocuments({ orderStatus: "Processing" });
    const delivered = await Order.countDocuments({ orderStatus: "Delivered" });

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders, totalRevenue: totalRevenue[0]?.total || 0,
        pending, delivered, monthlyRevenue,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/orders/admin/:id/status - update order status
router.put("/admin/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const update = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
