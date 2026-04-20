const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
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

test("POST /api/auth/signup rejects invalid payload", async () => {
  const res = await request(app).post("/api/auth/signup").send({
    username: "A",
    email: "not-an-email",
    password: "123",
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.ok(Array.isArray(res.body.errors));
});

test("POST /api/auth/signup and /api/auth/login succeeds", async () => {
  const signup = await request(app).post("/api/auth/signup").send({
    username: "testuser",
    email: "test@example.com",
    password: "password123",
  });

  assert.equal(signup.status, 201);
  assert.equal(signup.body.success, true);
  assert.ok(signup.body.token);

  const login = await request(app).post("/api/auth/login").send({
    email: "test@example.com",
    password: "password123",
  });

  assert.equal(login.status, 200);
  assert.equal(login.body.success, true);
  assert.equal(login.body.user.email, "test@example.com");
});