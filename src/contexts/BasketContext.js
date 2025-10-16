"use client";
import { useRouter } from 'next/navigation'; 
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useSession } from 'next-auth/react';
const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
    const router = useRouter();
    const { data: session, status } = useSession(); 
    const [basket, setBasket] = useState([]);

    useEffect(() => {
        const fetchBasket = async () => {
            if (status !== 'authenticated' || !session?.user) {
                setBasket([]);
                return;
            }
            try {
                const res = await fetch("/api/basket");
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
     
    // Calculate total quantity from basket items
    const basketCount = useMemo(() => {
        return basket.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }, [basket]);

    const refreshBasket = async () => {
        // Add this check: only fetch if session is authenticated
        if (status !== 'authenticated' || !session?.user) {
          setBasket([]);
          return;
        }
        
        try {
          const res = await fetch('/api/basket', { cache: 'no-store' });
          if (!res.ok) throw new Error('Failed to fetch basket');
          const items = await res.json();
          setBasket(items);
        } catch (e) {
          console.error('refreshBasket error', e);
          setBasket([]);
        }
    };

    // Add item to basket
    const addToBasket = async (productId, quantity = 1) => {
        if (!session?.user) {
          router.push("/login");

          return;
        }
        try {
         
        const res = await fetch("/api/basket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity }),
        });
        if (res.ok) {
            const data = await res.json();
            setBasket(prev => {
            const exists = prev.find(item => item.productId._id === productId);
            if (exists) {
                return prev.map(item =>
                item.productId._id === productId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                );
            }
            return [...prev, data];
            });
        }
        } catch (err) {
        console.error("Error adding to basket:", err);
        }
    };
    // Update quantity of an existing item
    const updateBasketItem = async (productId, quantity) => {
        try {
          const res = await fetch("/api/basket", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity }),
          });
    
          if (res.ok) {
            setBasket(prev =>
              prev.map(item =>
                item.productId._id === productId ? { ...item, quantity } : item
              )
            );
          }
        } catch (err) {
          console.error("Error updating basket item:", err);
        }
    };

    // Remove item from basket
    const removeFromBasket = async (productId) => {
      try {
        const res = await fetch("/api/basket", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
    
        if (res.ok) {
          setBasket(prev =>
            prev
              .map(item =>
                item.productId._id === productId
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              )
              .filter(item => item.quantity > 0) // remove item if quantity is 0
          );
        }
      } catch (err) {
        console.error("Error removing item:", err);
      }
    };
    
    return (
        <BasketContext.Provider
            value={{
                basket,
                setBasket,
                basketCount,
                refreshBasket,
                addToBasket,
                updateBasketItem,
                removeFromBasket,
            }}
        >
            {children}
        </BasketContext.Provider>
    );
};

export const useBasket = () => useContext(BasketContext);
