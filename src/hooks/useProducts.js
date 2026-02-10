import { useEffect, useState } from "react";

export function useProducts(limit) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/sanity-products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        let items = Array.isArray(data) ? data : [];
        if (typeof limit === "number") {
          // Shuffle then take the requested amount to keep the selection varied
          items = [...items].sort(() => 0.5 - Math.random()).slice(0, limit);
        }

        setProducts(items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [limit]);

  return { products, loading };
}