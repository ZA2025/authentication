"use client";
import { useEffect, useState } from "react";
// import { getAllProducts } from "@/data/products";
import Link from "next/link";

import Image from "next/image";
import styles from "./ProductList.module.scss";

import { useProducts } from "@/hooks/useProducts";

const ProductList = () => {
    // const products = getAllProducts();
    // const [products, setProducts] = useState([]);
    // const [loading, setLoading] = useState(true);
    const { products, loading } = useProducts();

    // useEffect(() => {
    //   const fetchProducts = async () => {
    //     try {
    //       const res = await fetch("/api/products");
    //       if (!res.ok) {
    //         throw new Error("Failed to fetch products");
    //       }

    //       const data = await res.json();
    //       // console.log("data", data);
    //       setProducts(data);

    //     } catch (error) {
    //       console.error("Error loading products:", error);
    //     } finally {
    //       setLoading(false);
    //     }
    //   }
    //   fetchProducts();
    // }, []);

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
                          src="/images/tshirt.avif"
                          alt={product.name}
                          width={600}
                          height={600}
                          className={styles.cardImage}
                        />
                        <div className={styles.cardInfo}>
                          <h1 className={styles.cardTitle}>{product.name}</h1>
                          <p>{product.description}</p>
                          <p className={styles.cardPrice}>£{product.price}</p>
                        </div>
                        <Link key={product._id} href={`/products/${product._id}`} className={styles.cardLink}>Find out more</Link>
                        {/* <Link key={`${product.id}-fav`} href={`/products/${product.id}`} className={styles.cardLink}>Favorit</Link> */}
                      </div>
                    </div>
                  </div>
                
            ))}
        </div>
    );
};

export default ProductList;