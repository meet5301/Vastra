const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { protect, adminOnly } = require("../middleware/auth");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

const COD_MAX_AMOUNT = Number(process.env.COD_MAX_AMOUNT || 15000);
const COD_EXTRA_CHARGE = Number(process.env.COD_EXTRA_CHARGE || 30);

function normalizePaymentMethod(value) {
  const method = String(value || "COD").trim().toUpperCase();
  if (["COD", "RAZORPAY", "STRIPE", "UPI", "PAYTM", "GPAY", "PHONEPE"].includes(method)) return method;
  return "COD";
}

function resolveGateway(method) {
  if (method === "RAZORPAY" || method === "UPI") return "RAZORPAY";
  if (method === "STRIPE") return "STRIPE";
  if (method === "PAYTM") return "PAYTM";
  if (method === "GPAY") return "GPAY";
  if (method === "PHONEPE") return "PHONEPE";
  if (method === "COD") return "COD";
  return "INTERNAL";
}

function createMockPaymentIntent(order) {
  const gateway = resolveGateway(order.paymentMethod);
  const mode = String(process.env.PAYMENT_GATEWAY_MODE || "test").toLowerCase();
  const intentId = `${gateway.toLowerCase()}_${crypto.randomUUID().replace(/-/g, "")}`;
  return {
    intentId,
    gateway,
    mode,
    amount: order.totalAmount,
    currency: "INR",
    orderId: order._id,
  };
}

function canAccessOrder(order, user) {
  if (!order || !user) return false;
  if (user.role === "admin") return true;
  return order.user && order.user.toString() === user._id.toString();
}

function appendTrackingEvent(order, status, note, byRole) {
  order.trackingEvents = order.trackingEvents || [];
  order.trackingEvents.push({
    status,
    note,
    byRole: byRole || "system",
    createdAt: new Date(),
  });
}

function isOrderOwner(order, user) {
  if (!order || !user) return false;
  return !!order.user && order.user.toString() === user._id.toString();
}

// POST /api/orders - place order (user or guest)
router.post("/", async (req, res) => {
  try {
    const { items, shippingAddress, guestInfo, paymentMethod, subtotal, shippingCost, discount, tax, totalAmount, coupon } = req.body;
    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    const numericSubtotal = Number(subtotal || 0);
    const numericShippingCost = Number(shippingCost || 0);
    const numericDiscount = Number(discount || 0);
    const numericTax = Number(tax || 0);
    const computedCodCharge = normalizedPaymentMethod === "COD" ? COD_EXTRA_CHARGE : 0;
    const computedTotal = Number((numericSubtotal + numericShippingCost + numericTax - numericDiscount + computedCodCharge).toFixed(2));
    const numericTotal = Number(totalAmount || computedTotal);

    if (Math.abs(numericTotal - computedTotal) > 0.01) {
      return res.status(400).json({
        success: false,
        message: "Order total mismatch. Please review your checkout totals and try again.",
      });
    }

    if (normalizedPaymentMethod === "COD" && numericTotal > COD_MAX_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: `COD is available only up to Rs. ${COD_MAX_AMOUNT.toLocaleString("en-IN")}. Please use online payment.`,
      });
    }

    const orderData = {
      items,
      shippingAddress,
      paymentMethod: normalizedPaymentMethod,
      paymentGateway: resolveGateway(normalizedPaymentMethod),
      subtotal: numericSubtotal,
      shippingCost: numericShippingCost,
      discount: numericDiscount,
      tax: numericTax,
      codCharge: computedCodCharge,
      totalAmount: computedTotal,
      guestInfo,
      coupon: coupon || undefined,
      paymentAttempts: normalizedPaymentMethod === "COD" ? 0 : 1,
      paymentStatus: "Pending",
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

    if (normalizedPaymentMethod !== "COD" && !orderData.user) {
      return res.status(401).json({
        success: false,
        message: "Login required for online payment methods",
      });
    }

    const order = await Order.create(orderData);
    appendTrackingEvent(order, "Placed", "Order placed and submitted", order.user ? "customer" : "guest");

    if (order.paymentMethod !== "COD") {
      const intent = createMockPaymentIntent(order);
      order.paymentIntentId = intent.intentId;
      appendTrackingEvent(order, "Payment Pending", "Awaiting online payment confirmation", "system");
      await order.save();

      if (coupon?.couponId) {
        await Coupon.findByIdAndUpdate(coupon.couponId, { $inc: { usedCount: 1 } });
      }

      return res.status(201).json({ success: true, order, paymentRequired: true, paymentIntent: intent });
    }

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

// POST /api/orders/:id/payment/retry - create new payment intent for failed/pending online payment
router.post("/:id/payment/retry", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!canAccessOrder(order, req.user)) return res.status(403).json({ success: false, message: "Not authorized" });

    if (order.paymentMethod === "COD") {
      return res.status(400).json({ success: false, message: "COD orders do not support online payment retry" });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({ success: false, message: "Payment already completed" });
    }

    const intent = createMockPaymentIntent(order);
    order.paymentIntentId = intent.intentId;
    order.paymentStatus = "Pending";
    order.paymentAttempts = Number(order.paymentAttempts || 0) + 1;
    appendTrackingEvent(order, "Payment Retry", "Payment retry initiated", req.user.role);
    await order.save();

    res.json({ success: true, order, paymentIntent: intent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/orders/:id/payment/confirm - finalize payment status
router.put("/:id/payment/confirm", protect, async (req, res) => {
  try {
    const { paymentStatus, paymentReference, paymentIntentId } = req.body;
    const status = String(paymentStatus || "").trim();
    if (!["Paid", "Failed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!canAccessOrder(order, req.user)) return res.status(403).json({ success: false, message: "Not authorized" });

    if (paymentIntentId && order.paymentIntentId && paymentIntentId !== order.paymentIntentId) {
      return res.status(400).json({ success: false, message: "Payment intent mismatch" });
    }

    order.paymentStatus = status;
    order.paymentReference = String(paymentReference || "").trim();
    if (status === "Paid") {
      order.paidAt = new Date();
      if (order.orderStatus === "Cancelled") {
        order.orderStatus = "Confirmed";
      }
      appendTrackingEvent(order, "Paid", "Payment confirmed", req.user.role);
    } else {
      appendTrackingEvent(order, "Payment Failed", "Payment marked as failed", req.user.role);
    }
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id/timeline - get order lifecycle timeline
router.get("/:id/timeline", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!canAccessOrder(order, req.user)) return res.status(403).json({ success: false, message: "Not authorized" });
    res.json({ success: true, timeline: order.trackingEvents || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/orders/:id/return-request - customer requests return/refund
router.post("/:id/return-request", protect, async (req, res) => {
  try {
    const reason = String(req.body.reason || "").trim();
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (!isOrderOwner(order, req.user)) {
      return res.status(403).json({ success: false, message: "Only order owner can request return/refund" });
    }

    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({ success: false, message: "Return/refund can be requested only after delivery" });
    }

    if (order.refundStatus === "Requested") {
      return res.status(400).json({ success: false, message: "Return/refund request already submitted" });
    }

    if (order.refundStatus === "Approved") {
      return res.status(400).json({ success: false, message: "Return/refund already approved for this order" });
    }

    order.refundStatus = "Requested";
    order.refundRequestedAt = new Date();
    order.notes = reason ? `Return request: ${reason}` : order.notes;
    appendTrackingEvent(
      order,
      "Return Requested",
      reason ? `Customer requested return/refund: ${reason}` : "Customer requested return/refund",
      "customer"
    );
    await order.save();

    res.json({ success: true, order, message: "Return/refund request submitted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id/invoice - generate invoice PDF
router.get("/:id/invoice", protect, async (req, res) => {
  try {
    const PDFDocument = require("pdfkit");
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!canAccessOrder(order, req.user)) return res.status(403).json({ success: false, message: "Not authorized" });

    const doc = new PDFDocument({ margin: 40 });
    const invoiceNumber = `INV-${String(order._id).slice(-8).toUpperCase()}`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${invoiceNumber}.pdf`);
    doc.pipe(res);

    doc.fontSize(22).text("VASTRA", { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#666").text("Fashion Store Invoice");
    doc.moveDown(1.2);

    doc.fillColor("#000").fontSize(12).text(`Invoice No: ${invoiceNumber}`);
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`);
    doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`);
    doc.moveDown(0.8);

    doc.fontSize(12).text("Shipping Address", { underline: true });
    doc.fontSize(10).text(`${order.shippingAddress?.address || "-"}, ${order.shippingAddress?.city || "-"}`);
    doc.moveDown(1);

    doc.fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.4);

    (order.items || []).forEach((item, idx) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
      doc
        .fontSize(10)
        .text(`${idx + 1}. ${item.name || "Item"}  x${item.quantity || 1}  -  Rs. ${Math.round(lineTotal).toLocaleString("en-IN")}`);
    });

    doc.moveDown(1);
    doc.fontSize(11).text(`Subtotal: Rs. ${Math.round(order.subtotal || 0).toLocaleString("en-IN")}`);
    doc.text(`Shipping: Rs. ${Math.round(order.shippingCost || 0).toLocaleString("en-IN")}`);
    if (Number(order.codCharge || 0) > 0) {
      doc.text(`COD Charge: Rs. ${Math.round(order.codCharge || 0).toLocaleString("en-IN")}`);
    }
    doc.text(`Tax: Rs. ${Math.round(order.tax || 0).toLocaleString("en-IN")}`);
    if (Number(order.discount || 0) > 0) {
      doc.text(`Discount: - Rs. ${Math.round(order.discount || 0).toLocaleString("en-IN")}`);
    }
    doc.moveDown(0.4);
    doc.fontSize(13).text(`Total: Rs. ${Math.round(order.totalAmount || 0).toLocaleString("en-IN")}`, { underline: true });

    doc.moveDown(1.2);
    doc.fontSize(9).fillColor("#666").text("Thank you for shopping with VASTRA.");
    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ROUTES ────────────────────────────────────────────────

// GET /api/orders/admin/all
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    let query = {};
    if (status) query.orderStatus = status;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const pagination = buildPaginationMeta(total, page, limit);
    res.json({ success: true, orders, total, pagination });
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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (orderStatus) {
      order.orderStatus = orderStatus;
      appendTrackingEvent(order, orderStatus, `Order status changed to ${orderStatus}`, "admin");
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      appendTrackingEvent(order, paymentStatus, `Payment status changed to ${paymentStatus}`, "admin");
    }
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/admin/refund-requests - list refund requests for admin
router.get("/admin/refund-requests", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.refundStatus = status;
    } else {
      query.refundStatus = "Requested";
    }

    const orders = await Order.find(query)
      .populate("user", "username email")
      .sort({ refundRequestedAt: -1, createdAt: -1 })
      .limit(100);

    res.json({ success: true, orders, total: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/orders/admin/:id/refund - approve/reject refund request
router.put("/admin/:id/refund", protect, adminOnly, async (req, res) => {
  try {
    const action = String(req.body.action || "").trim().toLowerCase();
    const note = String(req.body.note || "").trim();

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be approve or reject" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.refundStatus !== "Requested") {
      return res.status(400).json({ success: false, message: "No pending refund request on this order" });
    }

    order.refundStatus = action === "approve" ? "Approved" : "Rejected";
    order.refundResolvedAt = new Date();

    if (action === "approve") {
      if (order.orderStatus !== "Cancelled") {
        order.orderStatus = "Cancelled";
      }
      appendTrackingEvent(
        order,
        "Refund Approved",
        note || "Admin approved return/refund request",
        "admin"
      );
    } else {
      appendTrackingEvent(
        order,
        "Refund Rejected",
        note || "Admin rejected return/refund request",
        "admin"
      );
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
