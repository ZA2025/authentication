import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createSessionMock } = vi.hoisted(() => ({
  createSessionMock: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: vi.fn(function StripeMock() {
    this.checkout = {
      sessions: {
        create: createSessionMock,
      },
    };
  }),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/mongodb", () => ({
  default: vi.fn(),
}));

vi.mock("@/model/basket", () => ({
  default: {
    find: vi.fn(),
  },
}));

import { auth } from "@/auth";
import Basket from "@/model/basket";
import { POST } from "@/app/api/checkout/route";

const makeReq = () =>
  new Request("http://localhost:3000/api/checkout", {
    method: "POST",
  });

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);

    const res = await POST(makeReq());
    expect(res.status).toBe(401);
    expect(await res.text()).toBe("Unauthorized");
  });

  it("returns 400 when basket is empty", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });
    Basket.find.mockResolvedValue([]);

    const res = await POST(makeReq());
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Basket is empty" });
  });

  it("returns 400 when basket has no valid items", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });
    Basket.find.mockResolvedValue([
      { name: "", price: 0, quantity: 1 },
      { name: "Cookie", price: -1, quantity: 1 },
      { name: "", price: 10, quantity: 2 },
    ]);

    const res = await POST(makeReq());
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "No valid items in basket" });
  });

  it("returns 200 with session id for valid basket", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });
    Basket.find.mockResolvedValue([
      { name: "Cookie Box", price: 12.5, quantity: 2 },
      { name: "Brownie", price: 3, quantity: 1 },
    ]);
    createSessionMock.mockResolvedValue({ id: "cs_test_123" });

    const res = await POST(makeReq());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "cs_test_123" });

    expect(createSessionMock).toHaveBeenCalledWith({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: "Cookie Box" },
            unit_amount: 1250,
          },
          quantity: 2,
        },
        {
          price_data: {
            currency: "gbp",
            product_data: { name: "Brownie" },
            unit_amount: 300,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      metadata: { userId: "u1" },
    });
  });

  it("returns 500 when stripe create session fails", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });
    Basket.find.mockResolvedValue([{ name: "Cookie", price: 10, quantity: 1 }]);
    createSessionMock.mockRejectedValue(new Error("stripe failed"));

    const res = await POST(makeReq());
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "stripe failed" });
  });
});
