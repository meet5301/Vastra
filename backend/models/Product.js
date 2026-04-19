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
    sellerUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    brandName: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Men", "Women", "Accessories", "Other"],
      default: "Other",
    },
    subCategory: { type: String, default: "" },
    sizes: { type: [String], default: ["S", "M", "L", "XL"] },
    colors: { type: [String], default: [] },
    colorImages: [
      {
        color: { type: String },
        image: { type: String },
      }
    ],
    variants: [
      {
        color: { type: String, default: "" },
        sku: { type: String, default: "" },
        stock: { type: Number, default: 0 },
        price: { type: Number },
        images: { type: [String], default: [] },
        isActive: { type: Boolean, default: true },
      },
    ],
    stock: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    placementKeys: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    externalOffers: [
      {
        site: { type: String, required: true, trim: true },
        price: { type: Number, min: 0 },
        productName: { type: String, default: "", trim: true },
        productUrl: { type: String, default: "", trim: true },
        notes: { type: String, default: "", trim: true },
        updatedAt: { type: Date },
      },
    ],
    reviews: [reviewSchema],
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
