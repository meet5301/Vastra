const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const Product = require("../models/Product");
const { connectTestDb, clearTestDb, closeTestDb } = require("./helpers/testDb");

test.before(async () => {
  await connectTestDb();
});

test.beforeEach(async () => {
  await clearTestDb();

  await Product.create([
    {
      name: "Men Blazer",
      price: 5000,
      image: "https://example.com/a.jpg",
      category: "Men",
      isActive: true,
    },
    {
      name: "Women Coat",
      price: 7000,
      image: "https://example.com/b.jpg",
      category: "Women",
      isActive: true,
    },
    {
      name: "Casual Shirt",
      price: 3000,
      image: "https://example.com/c.jpg",
      category: "Men",
      isActive: true,
    },
  ]);
});

test.after(async () => {
  await closeTestDb();
});

test("GET /api/products returns standardized pagination metadata", async () => {
  const res = await request(app).get("/api/products?page=1&limit=2&category=Men");

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.products));
  assert.equal(typeof res.body.pagination, "object");
  assert.equal(res.body.pagination.page, 1);
  assert.equal(res.body.pagination.limit, 2);
  assert.equal(typeof res.body.pagination.totalPages, "number");
  assert.equal(typeof res.body.pagination.hasNextPage, "boolean");
  assert.equal(typeof res.body.pages, "number");
});