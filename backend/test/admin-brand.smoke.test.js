const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
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

test("Brand pages return HTML", async () => {
  const brandLogin = await request(app).get("/brand/login");
  const brandRegister = await request(app).get("/brand/register");
  const brandDashboard = await request(app).get("/brand/dashboard");

  assert.equal(brandLogin.status, 200);
  assert.equal(brandRegister.status, 200);
  assert.equal(brandDashboard.status, 200);
  assert.match(String(brandLogin.headers["content-type"]), /text\/html/);
});

test("Admin page route returns HTML", async () => {
  const adminPage = await request(app).get("/admin");

  if (adminPage.status === 301 || adminPage.status === 302) {
    const redirected = await request(app).get("/admin/");
    assert.equal(redirected.status, 200);
    assert.match(String(redirected.headers["content-type"]), /text\/html/);
    return;
  }

  assert.equal(adminPage.status, 200);
  assert.match(String(adminPage.headers["content-type"]), /text\/html/);
});

test("Brand and admin API smoke flow works", async () => {
  const brandSignup = await request(app).post("/api/auth/brand/signup").send({
    username: "branduser",
    email: "brand@example.com",
    password: "password123",
    brandName: "Brand One",
  });

  assert.equal(brandSignup.status, 201);
  assert.equal(brandSignup.body.success, true);

  const brandLogin = await request(app).post("/api/auth/brand/login").send({
    email: "brand@example.com",
    password: "password123",
  });

  assert.equal(brandLogin.status, 200);
  assert.equal(brandLogin.body.success, true);

  await User.create({
    username: "admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  });

  const adminLogin = await request(app).post("/api/auth/login").send({
    email: "admin@example.com",
    password: "password123",
  });

  assert.equal(adminLogin.status, 200);
  assert.equal(adminLogin.body.success, true);

  const adminToken = adminLogin.body.token;
  const adminUsers = await request(app)
    .get("/api/admin/users")
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(adminUsers.status, 200);
  assert.equal(adminUsers.body.success, true);
  assert.ok(Array.isArray(adminUsers.body.users));
});