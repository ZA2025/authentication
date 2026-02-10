"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";

const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [basket, setBasket] = useState([]);

  // ✅ Fetch basket when user logs in
  useEffect(() => {
    const fetchBasket = async () => {
      if (status !== "authenticated" || !session?.user) {
        setBasket([]);
        return;
      }

      try {
        const res = await fetch("/api/basket", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setBasket(data);
        }
      } catch (err) {
        console.error("Error fetching basket:", err);
      }
    };

    fetchBasket();
  }, [status, session?.user?.id]);

  // ✅ Basket count
  const basketCount = useMemo(
    () => basket.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [basket]
  );

  // ✅ Refresh basket manually
  const refreshBasket = async () => {
     
    if (status !== "authenticated" || !session?.user) {
      setBasket([]);
      return;
    }

    try {
      const res = await fetch("/api/basket", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch basket");
      const items = await res.json();
      setBasket(items);
      
    } catch (err) {
      console.error("refreshBasket error:", err);
      setBasket([]);
    }
  };

  // ✅ Add item to basket
  const addToBasket = async (product, quantity = 1) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
  
    const snapshot = {
      id: String(product?.id || ""),
      name: String(product?.name || ""),
      price: Number(product?.price ?? NaN),
      imageUrl:
        product?.imageUrl ||
        product?.image?.asset?.url ||
        "/images/fallback.png",
      slug:
        typeof product?.slug === "string"
          ? product.slug
          : product?.slug?.current || "",
      size: product?.size || 'medium',
    };
  
    if (!snapshot.id || !snapshot.name || !Number.isFinite(snapshot.price)) {
      console.error("Invalid product snapshot sent to basket:", snapshot);
      return;
    }
  
    const res = await fetch("/api/basket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: snapshot, quantity: Number(quantity) || 1 }),
    });
  
    if (!res.ok) {
      let errorMessage = 'Failed to add item to basket';
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
        alert(errorMessage);
      } catch (e) {
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const parsed = JSON.parse(errorText);
              errorMessage = parsed.error || errorMessage;
            } catch {
              errorMessage = errorText;
            }
          }
        } catch (e2) {
          // Could not read error message
        }
        if (res.status === 400) {
          alert(errorMessage);
        }
      }
      console.error("Add to basket failed", res.status, errorMessage);
      return;
    }
  
    const saved = await res.json();
    setBasket(prev => {
      const exists = prev.find(it => it.productId === saved.productId && it.size === saved.size);
      return exists
        ? prev.map(it =>
            it.productId === saved.productId && it.size === saved.size
              ? { ...it, quantity: it.quantity + (Number(quantity) || 1) }
              : it
          )
        : [...prev, saved];
    });
  };

  // ✅ Increase quantity
  const increaseQuantity = async (productId, size) => {
    const existing = basket.find(it => it.productId === productId && (!size || it.size === size));
    if (!existing) return;
  
    // ✅ Map DB shape to expected snapshot shape
    const product = {
      id: existing.productId,
      name: existing.name,
      price: existing.price,
      imageUrl: existing.imageUrl,
      slug: existing.slug,
      size: existing.size || 'medium',
    };
  
    await addToBasket(product, 1);
  };

  // ✅ Decrease quantity
  const decreaseQuantity = async (productId) => {
    try {
      const res = await fetch("/api/basket", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }), // ✅ API expects productId
      });
      if (res.ok) await refreshBasket();
    } catch (err) {
      console.error("Error decreasing quantity:", err);
    }
  };

  // ✅ Remove item completely
  const removeItem = async (productId, size) => {
    try {
      const item = basket.find(it => it.productId === productId && (!size || it.size === size));
      if (!item) return;
      const sizeToUse = size || item.size;
      
      // keep deleting until item gone
      for (let i = 0; i < item.quantity; i++) {
        await fetch("/api/basket", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, size: sizeToUse }),
        });
      }
      await refreshBasket();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  return (
    <BasketContext.Provider
      value={{
        basket,
        basketCount,
        refreshBasket,
        addToBasket,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => useContext(BasketContext);
