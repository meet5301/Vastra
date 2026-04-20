const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const Product = require("../models/Product");
const User = require("../models/User");
const { connectTestDb, clearTestDb, closeTestDb } = require("./helpers/testDb");

test.before(async () => {
  await connectTestDb();
});

test.beforeEach(async () => {
  await clearTestDb();
});

test.after(async () => {
  await closeTestDb();
});

test("POST /api/orders rejects mismatched totals", async () => {
  const product = await Product.create({
    name: "Order Test Product",
    price: 100,
    image: "https://example.com/p.jpg",
    category: "Men",
    isActive: true,
  });

  const res = await request(app).post("/api/orders").send({
    items: [{ product: product._id, quantity: 1, price: 100 }],
    shippingAddress: { address: "123 Test Street", city: "Surat" },
    paymentMethod: "COD",
    subtotal: 100,
    shippingCost: 0,
    discount: 0,
    tax: 0,
    totalAmount: 100,
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /total mismatch/i);
});

test("POST /api/orders creates COD order with computed COD charge", async () => {
  const product = await Product.create({
    name: "Order Test Product 2",
    price: 100,
    image: "https://example.com/p2.jpg",
    category: "Men",
    isActive: true,
  });

  const res = await request(app).post("/api/orders").send({
    items: [{ product: product._id, quantity: 1, price: 100 }],
    shippingAddress: { address: "123 Test Street", city: "Surat" },
    paymentMethod: "COD",
    subtotal: 100,
    shippingCost: 0,
    discount: 0,
    tax: 0,
    totalAmount: 130,
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.order.paymentMethod, "COD");
  assert.equal(res.body.order.codCharge, 30);
  assert.equal(res.body.order.totalAmount, 130);
});

test("Return/refund request lifecycle works for customer and admin", async () => {
  const product = await Product.create({
    name: "Refund Flow Product",
    price: 200,
    image: "https://example.com/r1.jpg",
    category: "Men",
    isActive: true,
  });

  const userSignup = await request(app).post("/api/auth/signup").send({
    username: "refund-user",
    email: "refund-user@example.com",
    password: "password123",
  });
  assert.equal(userSignup.status, 201);
  const userToken = userSignup.body.token;

  const adminSignup = await request(app).post("/api/auth/signup").send({
    username: "refund-admin",
    email: "refund-admin@example.com",
    password: "password123",
  });
  assert.equal(adminSignup.status, 201);

  const adminUser = await User.findOne({ email: "refund-admin@example.com" });
  adminUser.role = "admin";
  await adminUser.save();

  const adminLogin = await request(app).post("/api/auth/login").send({
    email: "refund-admin@example.com",
    password: "password123",
  });
  assert.equal(adminLogin.status, 200);
  const adminToken = adminLogin.body.token;

  const orderRes = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      items: [{ product: product._id, quantity: 1, price: 200, name: "Refund Flow Product", image: "https://example.com/r1.jpg" }],
      shippingAddress: { address: "123 Test Street", city: "Surat" },
      guestInfo: { firstName: "Refund", lastName: "User", email: "refund-user@example.com", phone: "9999999999" },
      paymentMethod: "COD",
      subtotal: 200,
      shippingCost: 0,
      discount: 0,
      tax: 0,
      totalAmount: 230,
    });

  assert.equal(orderRes.status, 201);
  const orderId = orderRes.body.order._id;

  const deliverRes = await request(app)
    .put(`/api/orders/admin/${orderId}/status`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ orderStatus: "Delivered" });
  assert.equal(deliverRes.status, 200);

  const requestReturn = await request(app)
    .post(`/api/orders/${orderId}/return-request`)
    .set("Authorization", `Bearer ${userToken}`)
    .send({ reason: "Wrong size" });

  assert.equal(requestReturn.status, 200);
  assert.equal(requestReturn.body.order.refundStatus, "Requested");

  const refundList = await request(app)
    .get("/api/orders/admin/refund-requests")
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(refundList.status, 200);
  assert.ok(Array.isArray(refundList.body.orders));
  assert.equal(refundList.body.orders[0].refundStatus, "Requested");

  const approveRefund = await request(app)
    .put(`/api/orders/admin/${orderId}/refund`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ action: "approve" });

  assert.equal(approveRefund.status, 200);
  assert.equal(approveRefund.body.order.refundStatus, "Approved");
});

test("Brand orders endpoint returns seller-scoped order lines", async () => {
  const brandSignup = await request(app).post("/api/auth/brand/signup").send({
    username: "brand-seller",
    email: "seller-scope@example.com",
    password: "password123",
    brandName: "Scope Brand",
  });
  assert.equal(brandSignup.status, 201);
  const brandToken = brandSignup.body.token;

  const brandProductRes = await request(app)
    .post("/api/brand/products")
    .set("Authorization", `Bearer ${brandToken}`)
    .send({
      name: "Brand Scope Product",
      price: 120,
      image: "https://example.com/brand.jpg",
      category: "Men",
      stock: 10,
      sizes: ["M"],
      colors: ["Black"],
      description: "Scoped product",
    });
  assert.equal(brandProductRes.status, 201);

  const publicProduct = await Product.create({
    name: "Other Seller Product",
    price: 80,
    image: "https://example.com/other.jpg",
    category: "Men",
    isActive: true,
  });

  const orderRes = await request(app).post("/api/orders").send({
    items: [
      {
        product: brandProductRes.body.product._id,
        quantity: 1,
        price: 120,
        name: "Brand Scope Product",
        image: "https://example.com/brand.jpg",
      },
      {
        product: publicProduct._id,
        quantity: 1,
        price: 80,
        name: "Other Seller Product",
        image: "https://example.com/other.jpg",
      },
    ],
    shippingAddress: { address: "123 Test Street", city: "Surat" },
    guestInfo: { firstName: "Guest", lastName: "Buyer", email: "guest@example.com", phone: "9999999999" },
    paymentMethod: "COD",
    subtotal: 200,
    shippingCost: 0,
    discount: 0,
    tax: 0,
    totalAmount: 230,
  });
  assert.equal(orderRes.status, 201);

  const brandOrders = await request(app)
    .get("/api/brand/orders")
    .set("Authorization", `Bearer ${brandToken}`);

  assert.equal(brandOrders.status, 200);
  assert.equal(brandOrders.body.success, true);
  assert.ok(Array.isArray(brandOrders.body.orders));
  assert.equal(brandOrders.body.orders.length, 1);
  assert.equal(brandOrders.body.orders[0].brandItemsCount, 1);
  assert.equal(brandOrders.body.orders[0].brandLineTotal, 120);
});