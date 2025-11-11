"use client";
import { useRouter } from 'next/navigation'; 
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useSession } from 'next-auth/react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession(); 
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, [status, session?.user?.id]);

  const fetchFavorites = async () => {
    if (status !== 'authenticated' || !session?.user) {
      setFavorites([]);
      return;
    }
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  const refreshFavorites = async () => {
    if (status !== 'authenticated' || !session?.user) {
      setFavorites([]);
      return;
    }
    try {
      const res = await fetch("/api/favorites", { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch favorites');
      const items = await res.json();
      setFavorites(items);
    } catch (e) {
      console.error('refreshFavorites error', e);
      setFavorites([]);
    }
  };

  const addToFavorites = async (product) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }), // ✅ matches API
      });
      if (res.ok) {
        await refreshFavorites();
      }
    } catch (err) {
      console.error("Error adding to favorites:", err);
    }
  };

  const removeFromFavorites = async (productId) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }), // ✅ matches API
      });
      if (res.ok) {
        await refreshFavorites();
      }
    } catch (err) {
      console.error("Error removing from favorites:", err);
    }
  };

  const toggleFavorite = async (product) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    const isAlreadyFavorite = favorites.some(f => f.productId === product.id);
    try {
      if (isAlreadyFavorite) {
        await removeFromFavorites(product.id);
      } else {
        await addToFavorites(product);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const favoritesCount = useMemo(() => favorites.length, [favorites]);

  return (
    <FavoritesContext.Provider 
      value={{ 
        favorites, 
        setFavorites, 
        refreshFavorites, 
        addToFavorites, 
        removeFromFavorites, 
        favoritesCount, 
        fetchFavorites, 
        toggleFavorite 
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
