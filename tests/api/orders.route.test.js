import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/mongodb", () => ({
  default: vi.fn(),
}));

vi.mock("@/model/order", () => ({
  default: {
    find: vi.fn(),
  },
}));

import { auth } from "@/auth";
import Order from "@/model/order";
import { GET } from "@/app/api/orders/route";

describe("GET /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.text()).toBe("Unauthorized");
  });

  it("returns 200 with empty orders list", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });
    const leanMock = vi.fn().mockResolvedValue([]);
    const sortMock = vi.fn().mockReturnValue({ lean: leanMock });
    Order.find.mockReturnValue({ sort: sortMock });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ orders: [] });
    expect(Order.find).toHaveBeenCalledWith({ userId: "u1" });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(leanMock).toHaveBeenCalled();
  });

  it("returns 200 with sorted orders", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });
    const orders = [
      { _id: "o2", userId: "u1", createdAt: "2025-02-02T00:00:00.000Z" },
      { _id: "o1", userId: "u1", createdAt: "2025-01-01T00:00:00.000Z" },
    ];
    const leanMock = vi.fn().mockResolvedValue(orders);
    const sortMock = vi.fn().mockReturnValue({ lean: leanMock });
    Order.find.mockReturnValue({ sort: sortMock });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ orders });
    expect(Order.find).toHaveBeenCalledWith({ userId: "u1" });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
  });
});
