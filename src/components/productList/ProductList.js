"use client";
import { useEffect, useState } from "react";
// import { getAllProducts } from "@/data/products";
import Link from "next/link";

import Image from "next/image";
import styles from "./ProductList.module.scss";

import { useProducts } from "@/hooks/useProducts";
import { urlFor } from "@/lib/sanity";

const ProductList = () => {
    const { products, loading } = useProducts();

    if (loading) {
      return <div className="inner-section"><p>Loading products...</p></div> ;
    }

    if (!products.length) {
      return <div className="inner-section"><p>No products found.</p></div>;
    }

    return (
        <div className={styles.products}>
           <div className={styles.productsWrapper}>
            {products.map((product) => {
                const imageUrl = product.image ? urlFor(product.image).url() : "";
                const slug = product.slug?.current || product._id;
                
                if (!imageUrl) return null;
                
                return (
                <div key={product._id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    
                  <div className={styles.cardImage}>
                  <Image 
                    src={imageUrl}
                    alt={product.name}
                    width={600}
                    height={600}
                    className={styles.cardImage}
                  />
                  </div>
                    <div className={styles.cardInfo}>
                      <h1 className={styles.cardTitle}>{product.name}</h1>
                      <p>{product.details}</p>
                      <p className={styles.cardPrice}>£{product.price}</p>
                    </div>
                    <Link href={`/products/${slug}`} className={ styles.cardLink}>View</Link>
                    {/* <Link key={`${product.id}-fav`} href={`/products/${product.id}`} className={styles.cardLink}>Favorit</Link> */}
                  </div>
                </div>
                );
            })}
            </div>
        </div>
    );
};

export default ProductList;