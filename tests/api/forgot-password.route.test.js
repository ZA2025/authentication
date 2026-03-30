import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendEmailMock = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn(function ResendMock() {
    this.emails = { send: sendEmailMock };
  }),
}));

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

import { POST } from "@/app/api/forgot-password/route";
import { getClientIP, rateLimit } from "@/lib/rateLimiter";
import User from "@/model/user-model";

const makeReq = (body) =>
  new Request("http://localhost:3000/api/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "localhost:3000" },
    body: JSON.stringify(body),
  });

describe("POST /api/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    getClientIP.mockReturnValue("127.0.0.1");
    rateLimit.mockReturnValue({ success: true });
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.RESEND_FROM_EMAIL = "noreply@example.com";
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

    const res = await POST(makeReq({ email: "user@test.com" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("3600");
    expect(await res.json()).toEqual({ error: "Too many attempts" });
  });

  it("returns 400 when email does not exist", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await POST(makeReq({ email: "none@test.com" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "Email does not exist" });
  });

  it("returns 403 for oauth users", async () => {
    User.findOne.mockResolvedValue({ authType: "oauth" });

    const res = await POST(makeReq({ email: "oauth@test.com" }));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      message: "Google users cannot reset passwords. Please use Google login.",
    });
  });

  it("returns 500 when email service is not configured", async () => {
    const saveMock = vi.fn().mockResolvedValue(undefined);
    User.findOne.mockResolvedValue({
      name: "User",
      authType: "local",
      save: saveMock,
    });
    delete process.env.RESEND_API_KEY;

    const res = await POST(makeReq({ email: "user@test.com" }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: "Email service is not configured" });
  });

  it("returns 400 when sending email fails", async () => {
    const saveMock = vi.fn().mockResolvedValue(undefined);
    const user = {
      name: "User",
      authType: "local",
      save: saveMock,
    };
    User.findOne.mockResolvedValue(user);
    sendEmailMock.mockRejectedValue(new Error("send failed"));

    const res = await POST(makeReq({ email: "user@test.com" }));
    expect(res.status).toBe(400);
    expect(saveMock).toHaveBeenCalledTimes(2);
    expect(await res.json()).toEqual({ message: "Failed to send email" });
  });

  it("returns 200 when reset email is sent", async () => {
    const saveMock = vi.fn().mockResolvedValue(undefined);
    User.findOne.mockResolvedValue({
      name: "User",
      authType: "local",
      save: saveMock,
    });
    sendEmailMock.mockResolvedValue({ id: "email_1" });

    const res = await POST(makeReq({ email: "user@test.com" }));
    expect(res.status).toBe(200);
    expect(saveMock).toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalled();
    const data = await res.json();
    expect(data.message).toContain("sent a password reset link");
    expect(data.email).toBe("user@test.com");
  });
});
