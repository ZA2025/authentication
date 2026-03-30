import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/queries/users", () => ({
  createUser: vi.fn(),
}));

vi.mock("@/model/user-model", () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock("@/lib/rateLimiter", () => ({
  getClientIP: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("@/lib/mongodb", () => ({
  default: vi.fn(),
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
  },
}));

import { POST } from "@/app/api/register/route";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/mongodb";
import { createUser } from "@/queries/users";
import { getClientIP, rateLimit } from "@/lib/rateLimiter";
import User from "@/model/user-model";

const makeReq = (body) =>
  new Request("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getClientIP.mockReturnValue("127.0.0.1");
    rateLimit.mockReturnValue({ success: true });
    bcrypt.hash.mockResolvedValue("hashed-password");
    User.findOne.mockResolvedValue(null);
    createUser.mockResolvedValue(undefined);
    delete process.env.RESEND_API_KEY;
  });

  it("returns 429 when rate limit is exceeded", async () => {
    rateLimit.mockReturnValue({
      success: false,
      message: "Too many attempts",
      retryAfter: "3600",
    });

    const res = await POST(
      makeReq({ name: "Ali", email: "ali@test.com", password: "Valid1@pass" })
    );

    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBe("Too many attempts");
    expect(res.headers.get("Retry-After")).toBe("3600");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeReq({ email: "ali@test.com", password: "Valid1@pass" }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "All fields are required." });
  });

  it("returns 400 when email format is invalid", async () => {
    const res = await POST(makeReq({ name: "Ali", email: "bad-email", password: "Valid1@pass" }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid email format." });
  });

  it("returns 400 when password is too short", async () => {
    const res = await POST(makeReq({ name: "Ali", email: "ali@test.com", password: "A1@a" }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Password must be at least 8 characters" });
  });

  it("returns 409 when user already exists", async () => {
    User.findOne.mockResolvedValue({ _id: "existing-user" });

    const res = await POST(
      makeReq({ name: "Ali", email: "ali@test.com", password: "Valid1@pass" })
    );

    expect(connectToDatabase).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ email: "ali@test.com" });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ message: "A user with this email already exists" });
  });

  it("returns 500 when createUser fails", async () => {
    createUser.mockRejectedValue(new Error("db failed"));

    const res = await POST(
      makeReq({ name: "Ali", email: "ali@test.com", password: "Valid1@pass" })
    );

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: "Failed to create user" });
  });

  it("returns 201 when registration succeeds", async () => {
    const res = await POST(
      makeReq({ name: "Ali", email: "ali@test.com", password: "Valid1@pass" })
    );

    expect(res.status).toBe(201);
    expect(bcrypt.hash).toHaveBeenCalledWith("Valid1@pass", 12);
    expect(createUser).toHaveBeenCalledWith({
      name: "Ali",
      email: "ali@test.com",
      password: "hashed-password",
    });
    expect(await res.json()).toEqual({
      message: "User registered successfully. Please check your email to verify your account.",
    });
  });
});
