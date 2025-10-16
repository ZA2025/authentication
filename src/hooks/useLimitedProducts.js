import { useEffect, useState } from "react";

export function useLimitedProducts(limit = 10) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLimitedProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        const randomProducts = data.sort(() => 0.5 - Math.random());
        setProducts(randomProducts.slice(0, limit));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchLimitedProducts();
  }, [limit]);

  return { products, loading };
}