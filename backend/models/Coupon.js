const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "flat"], default: "percent" },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    startAt: { type: Date },
    endAt: { type: Date },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model("Coupon", couponSchema);
