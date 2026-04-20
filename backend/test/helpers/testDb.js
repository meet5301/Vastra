const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

async function connectTestDb() {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
  process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "1h";
  process.env.COD_EXTRA_CHARGE = process.env.COD_EXTRA_CHARGE || "30";

  await mongoose.connect(process.env.MONGO_URI);
}

async function clearTestDb() {
  const collections = mongoose.connection.collections;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
}

async function closeTestDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
}

module.exports = {
  connectTestDb,
  clearTestDb,
  closeTestDb,
};