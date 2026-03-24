import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach } from "vitest";

beforeAll(async () => {
  process.env.NEXTAUTH_SECRET = "test-secret";
  process.env.NEXTAUTH_URL = "http://localhost:3000";
  const mongoUri = process.env.TEST_MONGODB_URI;

  // Use a real test Mongo URI when available.
  // This avoids mongodb-memory-server binary startup issues in some local envs.
  if (mongoUri) {
    process.env.MONGODB_URI = mongoUri;
    await mongoose.connect(mongoUri, {
      dbName: process.env.TEST_DB_NAME || "nextjs_auth_test",
    });
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState !== 1) return;
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});
