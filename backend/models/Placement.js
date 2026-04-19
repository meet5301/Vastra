const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

placementSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model("Placement", placementSchema);
