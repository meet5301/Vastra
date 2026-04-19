const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const { protect, adminOnly } = require("../middleware/auth");

function isCouponActive(coupon) {
  const now = new Date();
  if (!coupon.isActive) return false;
  if (coupon.startAt && now < coupon.startAt) return false;
  if (coupon.endAt && now > coupon.endAt) return false;
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return false;
  return true;
}

function getDiscountAmount(coupon, orderTotal) {
  let discountAmount = 0;
  if (coupon.type === "percent") {
    discountAmount = (orderTotal * coupon.value) / 100;
  } else {
    discountAmount = coupon.value;
  }
  if (coupon.maxDiscount > 0) {
    discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  }
  return Number(discountAmount.toFixed(2));
}

// POST /api/coupons/validate
router.post("/validate", async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const orderTotal = Number(orderAmount || 0);
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code required" });
    }
    const coupon = await Coupon.findOne({ code: code?.toUpperCase().trim() });
    if (!coupon || !isCouponActive(coupon)) {
      return res.status(400).json({ success: false, message: "Invalid coupon" });
    }
    if (orderTotal < coupon.minOrder) {
      return res.status(400).json({ success: false, message: "Minimum order not met" });
    }

    const discountAmount = getDiscountAmount(coupon, orderTotal);

    res.json({
      success: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coupons/public/active
router.get("/public/active", async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 });
    const active = coupons.filter((c) => isCouponActive(c));
    res.json({
      success: true,
      coupons: active.map((c) => ({
        id: c._id,
        code: c.code,
        type: c.type,
        value: c.value,
        minOrder: c.minOrder,
        maxDiscount: c.maxDiscount,
        endAt: c.endAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coupons/public/best?orderAmount=123
router.get("/public/best", async (req, res) => {
  try {
    const orderTotal = Number(req.query.orderAmount || 0);
    const coupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 });
    const eligible = coupons.filter((c) => isCouponActive(c) && orderTotal >= c.minOrder);

    if (!eligible.length) {
      return res.json({ success: true, coupon: null });
    }

    let best = null;
    let bestDiscount = 0;
    eligible.forEach((c) => {
      const discountAmount = getDiscountAmount(c, orderTotal);
      if (discountAmount > bestDiscount) {
        best = c;
        bestDiscount = discountAmount;
      }
    });

    if (!best) {
      return res.json({ success: true, coupon: null });
    }

    res.json({
      success: true,
      coupon: {
        id: best._id,
        code: best.code,
        type: best.type,
        value: best.value,
        discountAmount: bestDiscount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/coupons/admin/all
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/coupons/admin/create
router.post("/admin/create", protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/coupons/admin/:id
router.put("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/coupons/admin/:id
router.delete("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
