import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/mongodb", () => ({
  default: vi.fn(),
}));

vi.mock("@/model/user-model", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock("@/lib/rateLimiter", () => ({
  getClientIP: vi.fn(),
  rateLimit: vi.fn(),
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
  },
}));

import { POST } from "@/app/api/reset-password/route";
import bcrypt from "bcrypt";
import { getClientIP, rateLimit } from "@/lib/rateLimiter";
import User from "@/model/user-model";

const makeReq = (body) =>
  new Request("http://localhost:3000/api/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    getClientIP.mockReturnValue("127.0.0.1");
    rateLimit.mockReturnValue({ success: true });
    bcrypt.hash.mockResolvedValue("hashed-password");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 429 when rate limit is exceeded", async () => {
    rateLimit.mockReturnValue({
      success: false,
      message: "Too many attempts",
      retryAfter: "3600",
    });

    const res = await POST(
      makeReq({ email: "user@test.com", password: "Valid1@pass", token: "abc" })
    );
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("3600");
    expect(await res.json()).toEqual({ error: "Too many attempts" });
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeReq({ email: "user@test.com", password: "Valid1@pass" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      message: "Email, password, and token are required",
    });
  });

  it("returns 400 when password is weak", async () => {
    const res = await POST(makeReq({ email: "user@test.com", password: "short", token: "abc" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      message: "Password must be at least 8 characters",
    });
  });

  it("returns 400 when token is invalid or expired", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await POST(
      makeReq({ email: "user@test.com", password: "Valid1@pass", token: "bad-token" })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "Invalid or expired reset token" });
  });

  it("returns 200 when password is reset successfully", async () => {
    const saveMock = vi.fn().mockResolvedValue(undefined);
    const user = {
      password: "",
      resetToken: "hashed",
      resetTokenExpiry: Date.now() + 1000,
      save: saveMock,
    };
    User.findOne.mockResolvedValue(user);

    const res = await POST(
      makeReq({ email: "user@test.com", password: "Valid1@pass", token: "good-token" })
    );

    expect(res.status).toBe(200);
    expect(bcrypt.hash).toHaveBeenCalledWith("Valid1@pass", 12);
    expect(saveMock).toHaveBeenCalled();
    expect(await res.json()).toEqual({ message: "Password updated successfully" });
  });

  it("returns 500 when unexpected error occurs", async () => {
    User.findOne.mockRejectedValue(new Error("db failure"));

    const res = await POST(
      makeReq({ email: "user@test.com", password: "Valid1@pass", token: "good-token" })
    );

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: "Failed to update password" });
  });
});
