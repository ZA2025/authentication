'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import styles from './ProductDetails.module.scss';
import { useBasket } from "@/contexts/BasketContext";
import { useFavorites } from "@/contexts/FavoritesContext";

const ProductDetails = ({ product }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToBasket } = useBasket();
  const { favorites, toggleFavorite } = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!product?._id) return;
    const found = favorites.some(f => f.productId === product._id);
    setIsFavorite(found);
  }, [favorites, product?._id]);  

  if (!product) {
    return <div className="inner-section">Product not found.</div>;
  }

  // Safe fields
  const imageUrl =
    product?.imageUrl ||
    product?.image?.asset?.url ||
    "/images/fallback.png";

  const description = product?.details || "";

  const slugValue =
    typeof product?.slug === "string"
      ? product.slug
      : product?.slug?.current || "";


  // ----- Basket -----
  const handleAddToBasket = async () => {
    await addToBasket(
      {
        id: String(product?._id || ""),
        name: String(product?.name || ""),
        price: Number(product?.price ?? 0),
        imageUrl,
        slug: slugValue,
      },
      1
    );
  };

  const handleToggleFavorite = () => {
    toggleFavorite({
      id: product._id,
      name: product.name,
      imageUrl,
      slug: slugValue,
    });
  };

  return (
    <div className={styles.product}>
      <div className={`${styles.productCol} ${styles.left}`}>
        <Image
          src={imageUrl}
          alt={product?.name || "Product image"}
          width={630}
          height={630}
          className={styles.productImage}
        />
      </div>

      <div className={`${styles.productCol} ${styles.right}`}>
        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product?.name}</h1>
          {description && <p className={styles.productDetails}>{description}</p>}
          {typeof product?.price === "number" && (
            <p className={styles.productPrice}>£{product.price}</p>
          )}

          <button
            onClick={handleAddToBasket}
            className={styles.productLink}
            disabled={!product?._id}
            title={!product?._id ? "Product id unavailable for basket" : ""}
          >
            Buy It
          </button>
          {/* ✅ Uses synced state */}
          <button onClick={handleToggleFavorite} className={styles.productFavorite}>
            <Heart
              size={22}
              className={isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"}
            />
            {isFavorite ? " Remove from Favorites" : " Add to Favorites"}
          </button>
           
          <div style={{ marginTop: 16 }}>
            <Link href="/products" className={styles.cardLink}>
              Back to products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;