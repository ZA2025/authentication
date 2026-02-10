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
  const [selectedSize, setSelectedSize] = useState('medium');

  useEffect(() => {
    if (!product?._id) return;
    const found = favorites.some(f => f.productId === product._id);
    setIsFavorite(found);
  }, [favorites, product?._id]);

  // Check stock availability for sizes
  const getSizeStock = (size) => {
    if (!product?.sizesStock) {
      // Fallback to legacy stock if sizesStock doesn't exist
      return product?.stock ?? 0;
    }
    return product.sizesStock[size] ?? 0;
  };

  const isSizeInStock = (size) => {
    return getSizeStock(size) > 0;
  };

  // Set initial size to first available size, or default to medium
  useEffect(() => {
    if (product?.sizesStock) {
      const availableSizes = ['small', 'medium', 'large'].filter(size => {
        const stock = product.sizesStock[size] ?? 0;
        return stock > 0;
      });
      if (availableSizes.length > 0) {
        const currentStock = product.sizesStock[selectedSize] ?? 0;
        if (currentStock === 0) {
          setSelectedSize(availableSizes[0]);
        }
      }
    }
  }, [product?.sizesStock, selectedSize]);  

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
    // Check if selected size is in stock
    if (!isSizeInStock(selectedSize)) {
      alert(`Sorry, ${selectedSize} size is out of stock.`);
      return;
    }

    await addToBasket(
      {
        id: String(product?._id || ""),
        name: String(product?.name || ""),
        price: Number(product?.price ?? 0),
        imageUrl,
        slug: slugValue,
        size: selectedSize,
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
          <div className={styles.productSizeSelector}>
            <label htmlFor="size-select" className={styles.productSizeLabel}>Size:</label>
            <select
              id="size-select"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className={styles.productSizeSelect}
            >
              <option value="small" disabled={!isSizeInStock('small')}>
                Small {!isSizeInStock('small') && '(Out of Stock)'} {isSizeInStock('small') && `(${getSizeStock('small')} available)`}
              </option>
              <option value="medium" disabled={!isSizeInStock('medium')}>
                Medium {!isSizeInStock('medium') && '(Out of Stock)'} {isSizeInStock('medium') && `(${getSizeStock('medium')} available)`}
              </option>
              <option value="large" disabled={!isSizeInStock('large')}>
                Large {!isSizeInStock('large') && '(Out of Stock)'} {isSizeInStock('large') && `(${getSizeStock('large')} available)`}
              </option>
            </select>
          </div>
          {product?.sizesStock && (
            <div className={styles.productStockInfo}>
              {getSizeStock(selectedSize) > 0 ? (
                <p style={{ color: '#28a745', fontWeight: 'bold' }}>
                  {getSizeStock(selectedSize)} {getSizeStock(selectedSize) === 1 ? 'item' : 'items'} available in {selectedSize}
                </p>
              ) : (
                <p style={{ color: '#dc3545', fontWeight: 'bold' }}>Out of stock in {selectedSize}</p>
              )}
            </div>
          )}
          <div className={styles.productButtons}>
            <button
              onClick={handleAddToBasket}
              className={styles.productLink}
              disabled={!product?._id}
              title={!product?._id ? "Product id unavailable for basket" : ""}
            >
              Buy It
            </button>
            {/* Uses synced state */}
            <button onClick={handleToggleFavorite} className={styles.productFavorite}>
              <Heart
                size={22}
                className={isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"}
              />
              {isFavorite ? " Remove" : " Add to Favorites"}
            </button>
          </div>
          <div style={{ marginTop: 16 }}>
            <Link href="/products" className={styles.productBackBtn}>
              Back to products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;