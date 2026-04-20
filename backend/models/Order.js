const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestInfo: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        image: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        size: String,
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 3.5 },
    discount: { type: Number, default: 0 },
    coupon: {
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
      code: { type: String, default: "" },
      type: { type: String, enum: ["percent", "flat"], default: "percent" },
      value: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
    },
    tax: { type: Number, default: 0 },
    codCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["COD", "RAZORPAY", "STRIPE", "UPI", "PAYTM", "GPAY", "PHONEPE"],
      default: "COD",
    },
    paymentGateway: {
      type: String,
      enum: ["COD", "RAZORPAY", "STRIPE", "PAYTM", "GPAY", "PHONEPE", "INTERNAL"],
      default: "COD",
    },
    paymentIntentId: { type: String, default: "" },
    paymentReference: { type: String, default: "" },
    paymentAttempts: { type: Number, default: 0 },
    paidAt: { type: Date },
    trackingEvents: [
      {
        status: { type: String, default: "Placed" },
        note: { type: String, default: "Order placed" },
        byRole: { type: String, default: "system" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    refundStatus: {
      type: String,
      enum: ["", "Requested", "Approved", "Rejected"],
      default: "",
    },
    refundRequestedAt: { type: Date },
    refundResolvedAt: { type: Date },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
