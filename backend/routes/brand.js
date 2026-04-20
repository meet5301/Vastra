const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { resolveMediaUrl, normalizeImageArray, normalizeColorImages } = require("../utils/media");
const { protect, brandOnly } = require("../middleware/auth");

function splitCsv(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseColorImagesInput(value) {
  if (!value) return [];
  if (Array.isArray(value)) return normalizeColorImages(value);
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return normalizeColorImages(parsed);
  } catch {
    // Fall through to line-based parser.
  }

  const lines = String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const pairs = lines
    .map((line) => {
      const [colorPart, imagePart] = line.split("|");
      return {
        color: String(colorPart || "").trim(),
        image: String(imagePart || "").trim(),
      };
    })
    .filter((entry) => entry.color && entry.image);

  return normalizeColorImages(pairs);
}

// GET /api/brand/me
router.get("/me", protect, brandOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/brand/me
router.put("/me", protect, brandOnly, async (req, res) => {
  try {
    const { username, contactPhone, website, companyName, about, brandName } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "Brand user not found" });

    user.username = username || user.username;
    user.brandProfile = {
      ...user.brandProfile,
      brandName: brandName ?? user.brandProfile?.brandName ?? "",
      contactPhone: contactPhone ?? user.brandProfile?.contactPhone ?? "",
      website: website ?? user.brandProfile?.website ?? "",
      companyName: companyName ?? user.brandProfile?.companyName ?? "",
      about: about ?? user.brandProfile?.about ?? "",
      approved: user.brandProfile?.approved !== false,
    };

    await user.save();
    res.json({ success: true, user: { id: user._id, username: user.username, email: user.email, role: user.role, brandProfile: user.brandProfile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/brand/products
router.get("/products", protect, brandOnly, async (req, res) => {
  try {
    const products = await Product.find({ sellerUser: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/brand/orders - list only this brand's order lines
router.get("/orders", protect, brandOnly, async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 100);
    const sellerId = req.user._id.toString();

    const sellerProducts = await Product.find({ sellerUser: req.user._id }).select("_id");
    const sellerProductIds = sellerProducts.map((p) => p._id);
    const sellerProductIdSet = new Set(sellerProductIds.map((id) => id.toString()));

    if (sellerProductIds.length === 0) {
      return res.json({ success: true, orders: [], total: 0 });
    }

    const orders = await Order.find({ "items.product": { $in: sellerProductIds } })
      .populate("user", "username email")
      .populate("items.product", "sellerUser")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const scopedOrders = orders
      .map((order) => {
        const brandItems = (order.items || [])
          .filter((item) => {
            const productDoc = item.product;
            if (!productDoc) return false;
            const productId = String(productDoc._id || "");
            if (sellerProductIdSet.has(productId)) return true;
            return String(productDoc.sellerUser || "") === sellerId;
          })
          .map((item) => {
            const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
            return {
              product: item.product?._id || null,
              name: item.name,
              image: item.image,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
              lineTotal,
            };
          });

        if (brandItems.length === 0) return null;

        return {
          _id: order._id,
          createdAt: order.createdAt,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          refundStatus: order.refundStatus || "",
          customer: {
            username: order.user?.username || `${order.guestInfo?.firstName || ""} ${order.guestInfo?.lastName || ""}`.trim() || "Guest",
            email: order.user?.email || order.guestInfo?.email || "",
          },
          brandItemsCount: brandItems.length,
          brandLineTotal: brandItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
          items: brandItems,
        };
      })
      .filter(Boolean);

    res.json({ success: true, orders: scopedOrders, total: scopedOrders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/brand/notifications
router.get("/notifications", protect, brandOnly, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("title message type read meta createdAt");

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/brand/notifications/:id/read
router.put("/notifications/:id/read", protect, brandOnly, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    ).select("title message type read meta createdAt");

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/brand/products
router.post("/products", protect, brandOnly, async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      image,
      category,
      subCategory,
      sizes,
      colors,
      stock,
      variants,
      tags,
      isActive,
      discountPrice,
      lowStockAlert,
      material,
      fit,
      isFeatured,
      galleryImages,
      colorImages,
    } = req.body;

    const primaryImage = resolveMediaUrl(image);
    const normalizedGallery = normalizeImageArray(galleryImages);
    const normalizedColorImages = parseColorImagesInput(colorImages);

    const product = await Product.create({
      name,
      price: Number(price || 0),
      description: description || "",
      image: primaryImage,
      galleryImages: normalizedGallery,
      colorImages: normalizedColorImages,
      category: category || "Other",
      subCategory: subCategory || "",
      sizes: splitCsv(sizes, ["S", "M", "L", "XL"]),
      colors: splitCsv(colors, []),
      stock: Number(stock || 0),
      variants: Array.isArray(variants) ? variants : [],
      tags: splitCsv(tags, []),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      lowStockAlert: lowStockAlert ? Number(lowStockAlert) : null,
      material: material || "",
      fit: fit || "",
      adminApproved: false,
      isActive: isActive !== false,
      isFeatured: isFeatured === true,
      brandName: req.user.brandProfile?.brandName || req.user.username,
      sellerUser: req.user._id,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/brand/products/:id
router.put("/products/:id", protect, brandOnly, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, sellerUser: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const {
      name,
      price,
      description,
      image,
      category,
      subCategory,
      sizes,
      colors,
      stock,
      tags,
      isActive,
      discountPrice,
      lowStockAlert,
      material,
      fit,
      isFeatured,
      galleryImages,
      colorImages,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price || 0);
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = resolveMediaUrl(image);
    if (galleryImages !== undefined) product.galleryImages = normalizeImageArray(galleryImages);
    if (colorImages !== undefined) product.colorImages = parseColorImagesInput(colorImages);
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (sizes !== undefined) product.sizes = splitCsv(sizes, product.sizes);
    if (colors !== undefined) product.colors = splitCsv(colors, product.colors);
    if (stock !== undefined) product.stock = Number(stock || 0);
    if (tags !== undefined) product.tags = splitCsv(tags, product.tags);
    if (discountPrice !== undefined) product.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (lowStockAlert !== undefined) product.lowStockAlert = lowStockAlert ? Number(lowStockAlert) : null;
    if (material !== undefined) product.material = material || "";
    if (fit !== undefined) product.fit = fit || "";
    if (isActive !== undefined) product.isActive = !!isActive;
    if (isFeatured !== undefined) product.isFeatured = !!isFeatured;

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/brand/products/:id
router.delete("/products/:id", protect, brandOnly, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, sellerUser: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
