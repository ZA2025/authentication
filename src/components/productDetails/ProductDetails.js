'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; 
import Link from "next/link";
import styles from './ProductDetails.module.scss';
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react"; 
import { useBasket } from "@/contexts/BasketContext"; // ✅ import Basket context
import { useFavorites } from "@/contexts/FavoritesContext";
 
const ProductDetails = ({ product }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToBasket } = useBasket(); // ✅ get basket function from context
  const { addToFavorites } = useFavorites();
  const { removeFromFavorites } = useFavorites();

  // --- FAVORITES ---
  const fetchFavorite = async () => {
    if (session?.user && product?._id) {
      try {
        const res = await fetch("/api/favorites");
        if (res.ok) {
          const data = await res.json();
          const favIds = data
            .filter(fav => fav.productId && fav.productId._id)
            .map(fav => fav.productId._id);
          setIsFavorite(favIds.includes(product._id));
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    }
  };

  useEffect(() => {
    fetchFavorite();
  }, [session, product._id]);

  const toggleFavorite = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    if (!product?._id) return;

    try {
      if (isFavorite) {
        await removeFromFavorites(product._id);
        setIsFavorite(false);
      } else {
        await addToFavorites(product._id);
        setIsFavorite(true);
      }
      fetchFavorite();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <div className={styles.product}>
      <div className={`${styles.productCol} ${styles.left}`}>
        <Image
          src="/images/tshirt.jpeg"
          alt={product.name}
          width={630}
          height={630}
          className={styles.productImage}
        />
      </div>

      <div className={`${styles.productCol} ${styles.right}`}>
        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productDetails}>{product.description}</p>
          <p className={styles.productPrice}>£{product.price}</p>

          {/* ✅ Use context addToBasket */}
          <button
            onClick={() => addToBasket(product._id, 1)}
            className={styles.productLink}
          >
            Buy It
          </button>

          {/* ❤️ Favorite Button */}
          <button
            onClick={toggleFavorite}
            className={styles.productFavorit}
          >
            <Heart
              size={22}
              className={isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"}
            />
            {isFavorite ? " Remove from Favorites" : " Add to Favorites"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
