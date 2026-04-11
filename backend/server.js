const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// ✅ BEST PRACTICE: .env se lo (hardcode hata diya)
connectDB();

const app = express();

// ─── MIDDLEWARE ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── STATIC FILES ───────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/images", express.static(path.join(__dirname, "images")));

// ─── USER ROUTES ────────────────────────────────────────────
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "index.html"))
);

app.get("/index", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "index.html"))
);

app.get("/shop", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "shop.html"))
);

app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "login.html"))
);

app.get("/signup", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "signup.html"))
);

app.get("/navbar", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "navbar.html"))
);

app.get("/templates/footer.html", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "footer.html"))
);

app.get("/detail", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "detail.html"))
);

app.get("/shopingbag", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "shopingbag.html"))
);

app.get("/checkout", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "checkout.html"))
);

app.get("/profile", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "profile.html"))
);

app.get("/journal", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "journal.html"))
);

app.get("/story", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "story.html"))
);

app.get("/about", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "about.html"))
);

app.get("/contact", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "contact.html"))
);

app.get("/review", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "review.html"))
);

app.get("/categories", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "categories.html"))
);

app.get("/men", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "men.html"))
);

app.get("/women", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "women.html"))
);

app.get("/accessories", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "accessories.html"))
);

app.get("/wishlist", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "wishlist.html"))
);

app.get("/search", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "search.html"))
);

// ─── ADMIN ROUTES ───────────────────────────────────────────
app.use("/admin", express.static(path.join(__dirname, "../frontend-admin/public")));

app.get("/admin", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend-admin/templates/admin-login.html"))
);

app.get("/admin/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend-admin/templates/dashboard.html"))
);

app.get("/admin/products", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend-admin/templates/admin-products.html"))
);

app.get("/admin/orders", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend-admin/templates/admin-orders.html"))
);

app.get("/admin/users", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend-admin/templates/admin-users.html"))
);

// ─── API ROUTES ─────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./routes/admin"));

// ─── SERVER START ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});