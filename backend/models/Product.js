const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name required"], trim: true },
    price: { type: Number, required: [true, "Price required"], min: 0 },
    description: { type: String, default: "" },
    image: { type: String, required: [true, "Image required"] },
    category: {
      type: String,
      enum: ["Men", "Women", "Accessories", "Other"],
      default: "Other",
    },
    subCategory: { type: String, default: "" },
    sizes: { type: [String], default: ["S", "M", "L", "XL"] },
    colors: { type: [String], default: [] },
    stock: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    reviews: [reviewSchema],
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
