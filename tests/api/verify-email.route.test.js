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

import { POST } from "@/app/api/verify-email/route";
import User from "@/model/user-model";

const makeReq = (body) =>
  new Request("http://localhost:3000/api/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.RESEND_FROM_EMAIL = "noreply@example.com";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(makeReq({}));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Email is required" });
  });

  it("returns 404 when user is not found", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await POST(makeReq({ email: "user@test.com" }));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "User not found" });
  });

  it("returns 200 when email is already verified", async () => {
    User.findOne.mockResolvedValue({ emailVerified: true });

    const res = await POST(makeReq({ email: "user@test.com" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: "Email already verified" });
  });

  it("returns 500 when email service is not configured", async () => {
    const saveMock = vi.fn().mockResolvedValue(undefined);
    User.findOne.mockResolvedValue({
      name: "User",
      emailVerified: false,
      save: saveMock,
    });
    delete process.env.RESEND_API_KEY;

    const res = await POST(makeReq({ email: "user@test.com" }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Email service is not configured" });
  });

  it("returns 500 when resend returns an error", async () => {
    const saveMock = vi.fn().mockResolvedValue(undefined);
    User.findOne.mockResolvedValue({
      name: "User",
      emailVerified: false,
      save: saveMock,
    });
    sendEmailMock.mockResolvedValue({ data: null, error: { message: "send failed" } });

    const res = await POST(makeReq({ email: "user@test.com" }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to send verification email" });
  });

  it("returns 200 when verification email is sent", async () => {
    const saveMock = vi.fn().mockResolvedValue(undefined);
    const user = {
      name: "User",
      emailVerified: false,
      save: saveMock,
    };
    User.findOne.mockResolvedValue(user);
    sendEmailMock.mockResolvedValue({ data: { id: "email_1" }, error: null });

    const res = await POST(makeReq({ email: "user@test.com" }));

    expect(saveMock).toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: "Verification email sent" });
  });
});
