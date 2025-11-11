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
           
            {products.map((product) => (
                 
                  <div key={product._id} className={styles.wrapper}>
                    <div className={styles.card}>
                      <div className={styles.cardHeader}>
                      <Image
                        src={urlFor(product.image).url()}
                        alt={product.name}
                        width={600}
                        height={600}
                        className={styles.cardImage}
                      />
                        <div className={styles.cardInfo}>
                          <h1 className={styles.cardTitle}>{product.name}</h1>
                          <p>{product.details}</p>
                          <p className={styles.cardPrice}>£{product.price}</p>
                        </div>
                        <Link href={`/products/${product.slug.current}`} className={styles.cardLink}>Find out more</Link>
                        {/* <Link key={`${product.id}-fav`} href={`/products/${product.id}`} className={styles.cardLink}>Favorit</Link> */}
                      </div>
                    </div>
                  </div>
                
            ))}
        </div>
    );
};

export default ProductList;