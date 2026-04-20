const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const fs = require("fs");
const { authLimiter, adminLimiter } = require("./middleware/rateLimit");

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = String(process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked for this origin"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/robots.txt", (req, res) => {
  const siteUrl = String(process.env.SITE_URL || `http://localhost:${process.env.PORT || 5001}`).replace(/\/$/, "");
  res.type("text/plain");
  res.set("Cache-Control", "public, max-age=3600");
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
});

app.get("/sitemap.xml", (req, res) => {
  const siteUrl = String(process.env.SITE_URL || `http://localhost:${process.env.PORT || 5001}`).replace(/\/$/, "");
  const staticPaths = [
    "/",
    "/men",
    "/women",
    "/kids",
    "/accessories",
    "/categories",
    "/about",
    "/journal",
    "/story",
    "/review",
    "/search",
  ];
  const lastMod = new Date().toISOString();
  const urls = staticPaths
    .map((p) => `  <url><loc>${siteUrl}${p}</loc><lastmod>${lastMod}</lastmod></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  res.type("application/xml");
  res.set("Cache-Control", "public, max-age=3600");
  res.send(xml);
});

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "index.html"))
);

app.get("/index", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "index.html"))
);

app.get("/shop", (req, res) => res.redirect("/men"));

app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "login.html"))
);

app.get("/signup", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "signup.html"))
);

app.get("/brand/login", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "brand-login.html"))
);

app.get("/brand/register", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "brand-register.html"))
);

app.get("/brand/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "brand-dashboard.html"))
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

app.get("/kids", (req, res) =>
  res.sendFile(path.join(__dirname, "templates", "kids.html"))
);

app.get("/contact", (req, res) => res.redirect("/profile"));

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

const adminDist = path.join(__dirname, "../admin/dist");
const adminIndex = path.join(adminDist, "index.html");

if (fs.existsSync(adminIndex)) {
  app.use("/admin", express.static(adminDist));
  app.get(["/admin", "/admin/*"], (req, res) => {
    res.sendFile(adminIndex);
  });
} else {
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
}

app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", adminLimiter, require("./routes/admin"));
app.use("/api/brands", require("./routes/brands"));
app.use("/api/brand", require("./routes/brand"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/placements", require("./routes/placements"));

module.exports = app;