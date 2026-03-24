import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock DB connect (no-op)
vi.mock("@/lib/mongodb", () => ({
  default: vi.fn(),
}));

// Mock Sanity client
vi.mock("@/lib/sanity", () => ({
  client: {
    fetch: vi.fn(),
  },
}));

// Mock Basket model methods used in route
vi.mock("@/model/basket", () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
    collection: {
      dropIndex: vi.fn(),
      updateMany: vi.fn(),
      createIndex: vi.fn(),
    },
  },
}));

import { auth } from "@/auth";
import Basket from "@/model/basket";
import { client } from "@/lib/sanity";
import { GET, POST, DELETE } from "@/app/api/basket/route";

const makeReq = (body) =>
  new Request("http://localhost:3000/api/basket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const makeDeleteReq = (body) =>
  new Request("http://localhost:3000/api/basket", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/basket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);

    const res = await POST(makeReq({ product: { id: "p1", name: "A", price: 10 } }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when product.id is missing", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });

    const res = await POST(makeReq({ product: { name: "A", price: 10 } }));
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("product.id is required");
  });

  it("returns 400 when size is invalid", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });

    const res = await POST(
      makeReq({
        product: { id: "p1", name: "A", price: 10, size: "x-large" },
      })
    );

    expect(res.status).toBe(400);
    expect(await res.text()).toContain("product.size must be");
  });

  it("returns 400 when stock would be exceeded", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });

    client.fetch.mockResolvedValue({
      sizesStock: { medium: 2 },
      stock: 0,
    });

    Basket.findOne.mockResolvedValue({ quantity: 2 }); // already at max

    const res = await POST(
      makeReq({
        product: { id: "p1", name: "A", price: 10, size: "medium" },
        quantity: 1,
      })
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Only 2");
  });

  it("adds item successfully when payload is valid and stock is available", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });
  
    client.fetch.mockResolvedValue({
      sizesStock: { medium: 5 },
      stock: 5,
    });
  
    Basket.findOne.mockResolvedValue(null);
    Basket.findOneAndUpdate.mockResolvedValue({
      userId: "u1",
      productId: "p1",
      name: "Cookie",
      price: 99,
      size: "medium",
      quantity: 1,
    });
  
    const res = await POST(
      makeReq({
        product: { id: "p1", name: "Shoe", price: 99, size: "medium" },
        quantity: 1,
      })
    );
  
    expect(res.status).toBe(200);
  
    const data = await res.json();
    expect(data.productId).toBe("p1");
    expect(data.size).toBe("medium");
    expect(data.quantity).toBe(1);
  
    expect(Basket.findOneAndUpdate).toHaveBeenCalled();
  });

   
});

describe("DELETE /api/basket", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("DELETE returns 401 when unauthenticated", async () => {
        auth.mockResolvedValue(null);
    
        const req = makeDeleteReq({ productId: "p1" });
    
        const res = await DELETE(req);
        expect(res.status).toBe(401);
    });
    
    it("DELETE returns 400 when productId is missing", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });

    const req = makeDeleteReq({ name: "cookie" });
    
    const res = await DELETE(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("productId is required");
    });

    it("DELETE returns 404 when item not found", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });

    Basket.findOne.mockResolvedValue(null);

    const req = makeDeleteReq({ productId: "p1" });

    const res = await DELETE(req);
    expect(res.status).toBe(404);
    expect(await res.text()).toContain("Item not found");
    });

    it("DELETE decreases quantity when item quantity is greater than 1", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });
    
    const saveMock = vi.fn().mockResolvedValue(undefined);
    
    Basket.findOne.mockResolvedValue({
        _id: "basket1",
        userId: "u1",
        productId: "p1",
        size: "medium",
        quantity: 3,
        save: saveMock,
    });
    
    const req = makeDeleteReq({ productId: "p1", size: "medium" });
    
    const res = await DELETE(req);
    
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.message).toBe("Quantity decreased");
    expect(data.quantity).toBe(2);
    });

    it("DELETE removes item when quantity is 1", async () => {
    auth.mockResolvedValue({ user: { id: "u1" } });
    
    Basket.findOne.mockResolvedValue({
        _id: "basket1",
        userId: "u1",
        productId: "p1",
        size: "medium",
        quantity: 1,
    });
    
    Basket.deleteOne.mockResolvedValue({ deletedCount: 1 });
    
    const req = makeDeleteReq({ productId: "p1", size: "medium" });
    
    const res = await DELETE(req);
    
    expect(Basket.deleteOne).toHaveBeenCalledWith({ _id: "basket1" });
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.message).toBe("Item removed from basket");
    });
});

describe("GET /api/basket", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    //401 unauthenticated
    it("GET returns 401 when unauthenticated", async () => {
        auth.mockResolvedValue(null);
        const res = await GET();
        expect(res.status).toBe(401);
        expect(await res.text()).toContain("Unauthorized");
    });
    //200 authenticated with empty list
    it("GET 200 authenticated with empty list", async () => {
        auth.mockResolvedValue({ user: { id: "u1" } });
        const sortMock = vi.fn().mockResolvedValue([]);
        Basket.find.mockReturnValue({ sort: sortMock });

        const res = await GET();
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual([]);
        expect(Basket.find).toHaveBeenCalledWith({ userId: "u1" });
        expect(sortMock).toHaveBeenCalledWith({ updatedAt: -1 });
    });
    //200 authenticated with sorted items (if you mock return order)
    it("GET 200 authenticated with sorted items", async () => {
        auth.mockResolvedValue({ user: { id: "u1" } });
        const items = [
          { productId: "p2", updatedAt: "2025-01-02T00:00:00.000Z" },
          { productId: "p1", updatedAt: "2025-01-01T00:00:00.000Z" },
        ];
        const sortMock = vi.fn().mockResolvedValue(items);
        Basket.find.mockReturnValue({ sort: sortMock });

        const res = await GET();
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(items);
        expect(sortMock).toHaveBeenCalledWith({ updatedAt: -1 });
    });
});