import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

// Mock Favorite model methods used in route
vi.mock("@/model/favorite", () => ({
    default: {
        find: vi.fn(),
        findOne: vi.fn(),
        findOneAndUpdate: vi.fn(),
        findOneAndDelete: vi.fn(),
    },
}));

import { auth } from "@/auth";
import Favorite from "@/model/favorite";
import { client } from "@/lib/sanity";
import { GET, POST, DELETE } from "@/app/api/favorites/route";

const makeReq = (body) =>
    new Request("http://localhost:3000/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

const makeDeleteReq = (body) =>
    new Request("http://localhost:3000/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("POST /api/favorites", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    //401 unauthenticated
    it("POST returns 401 when unauthenticated", async () => {
        auth.mockResolvedValue(null);
        const res = await POST(makeReq({ product: { id: "p1", name: "A", price: 10 } }));
        expect(res.status).toBe(401);
    });
    //201 authenticated with product added
    it("POST 201 authenticated with product added", async () => {
        auth.mockResolvedValue({ user: { id: "u1" } });
        Favorite.findOne.mockResolvedValue(null);
        Favorite.findOneAndUpdate.mockResolvedValue({
            userId: "u1",
            productId: "p1",
            name: "A",
            imageUrl: "",
            slug: "",
        });
        const res = await POST(makeReq({ product: { id: "p1", name: "A", price: 10 } }));
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.productId).toBe("p1");
    });

    it("POST 400 when product.id is missing", async () => {
        auth.mockResolvedValue({ user: { id: "u1" } });
        const res = await POST(makeReq({ product: { name: "A", price: 10 } }));
        expect(res.status).toBe(400);
        expect(await res.text()).toContain("product.id is required");
    });

    it("POST 400 when item is already in favorites", async () => {
        auth.mockResolvedValue({ user: { id: "u1" } });
        Favorite.findOne.mockResolvedValue({ _id: "existing-favorite" });
        const res = await POST(makeReq({ product: { id: "p1", name: "A", price: 10 } }));
        expect(res.status).toBe(400);
        expect(await res.text()).toContain("Already in favorites");
    });
});

describe("DELETE /api/favorites", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    //401 unauthenticated
    it("DELETE returns 401 when unauthenticated", async () => {
        auth.mockResolvedValue(null);

        const req = makeDeleteReq({ productId: "p1" });
        const res = await DELETE(req);

        expect(res.status).toBe(401);
        expect(await res.text()).toContain("not authenticated");
    });

    //400 when productId is missing
    it("DELETE returns 400 when productId is missing", async () => {
        auth.mockResolvedValue({ user: { id: "u1" } });

        const req = makeDeleteReq({});
        const res = await DELETE(req);

        expect(res.status).toBe(400);
        expect(await res.text()).toContain("productId is required");
    });

    //404 when item not found
    it("DELETE returns 404 when favorite is not found", async () => {
        auth.mockResolvedValue({ user: { id: "u1" } });
        Favorite.findOneAndDelete.mockResolvedValue(null);

        const req = makeDeleteReq({ productId: "p1" });
        const res = await DELETE(req);

        expect(Favorite.findOneAndDelete).toHaveBeenCalledWith({
            userId: "u1",
            productId: "p1",
        });
        expect(res.status).toBe(404);
        expect(await res.text()).toContain("Favorite not found");
    });

    //200 when item is removed from favorites
    it("DELETE returns 200 when favorite is removed", async () => {
        auth.mockResolvedValue({ user: { id: "u1" } });
        Favorite.findOneAndDelete.mockResolvedValue({
            _id: "fav1",
            userId: "u1",
            productId: "p1",
        });

        const req = makeDeleteReq({ productId: "p1" });
        const res = await DELETE(req);

        expect(Favorite.findOneAndDelete).toHaveBeenCalledWith({
            userId: "u1",
            productId: "p1",
        });
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.message).toBe("Removed from favorites");
    });
});

describe("GET /api/favorites", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    //401 unauthenticated
    it("GET returns 401 when unauthenticated", async () => {
        auth.mockResolvedValue(null);
        const res = await GET();
        expect(res.status).toBe(401);
        expect(await res.text()).toBe("You are not authenticated!");
    });

    //200 authenticated with empty list
    it("GET 200 authenticated with empty list", async () => {
        auth.mockResolvedValue({ user: { id: "u1" } });
        const sortMock = vi.fn().mockResolvedValue([]);
        Favorite.find.mockReturnValue({ sort: sortMock });
        const res = await GET();
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual([]);
        expect(Favorite.find).toHaveBeenCalledWith({ userId: "u1" });
        expect(sortMock).toHaveBeenCalledWith({ updatedAt: -1 });
    });

    //200 authenticated with enriched favorites (product data from Sanity merged in)
    it("GET 200 authenticated with enriched favorites", async () => {
        auth.mockResolvedValue({ user: { id: "u1" } });
        const favorites = [
            {
                _id: "fav1",
                userId: "u1",
                productId: "p1",
                name: "A",
                imageUrl: "image1.jpg",
                slug: "product1",
                toObject: vi.fn().mockReturnValue({
                    _id: "fav1",
                    userId: "u1",
                    productId: "p1",
                    name: "A",
                    imageUrl: "image1.jpg",
                    slug: "product1",
                }),
            },
        ];
        const sortMock = vi.fn().mockResolvedValue(favorites);
        Favorite.find.mockReturnValue({ sort: sortMock });
        client.fetch.mockResolvedValue({
            _id: "p1",
            name: "A",
            price: 10,
            details: "Details",
            description: "Description",
            category: "Category",
            stock: 10,
            featured: true,
            image: "image1.jpg",
            slug: { current: "product-1" },
        });
        const res = await GET();
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toHaveLength(1);
        expect(data[0].productId).toBe("p1");
        expect(data[0].name).toBe("A");
        expect(data[0].price).toBe(10);
        expect(data[0].details).toBe("Details");
        expect(Favorite.find).toHaveBeenCalledWith({ userId: "u1" });
        expect(sortMock).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(client.fetch).toHaveBeenCalled();
        expect(client.fetch).toHaveBeenCalledWith(expect.any(String), { productId: "p1" });
    });

    //500 error
    it("GET 500 error", async () => {
        auth.mockResolvedValue({ user: { id: "u1" } });
        const sortMock = vi.fn().mockRejectedValue(new Error("Database error"));
        Favorite.find.mockReturnValue({ sort: sortMock });
        const res = await GET();
        expect(res.status).toBe(500);
        expect(await res.text()).toBe("Internal Server Error");
    });
});