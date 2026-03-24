"use client";
import { useMemo, useState } from "react";
// import { getAllProducts } from "@/data/products";
import Link from "next/link";

import Image from "next/image";
import styles from "./ProductList.module.scss";

import { useProducts } from "@/hooks/useProducts";
import { urlFor } from "@/lib/sanity";

const ProductList = () => {
    const { products, loading } = useProducts();
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");
    const [sortBy, setSortBy] = useState("default");

    const categories = useMemo(() => {
      const values = products
        .map((product) => product.category)
        .filter(Boolean);
      return Array.from(new Set(values));
    }, [products]);

    const filteredProducts = useMemo(() => {
      let items = [...products];

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        items = items.filter((product) => {
          const name = (product.name || "").toLowerCase();
          const details = (product.details || "").toLowerCase();
          return name.includes(query) || details.includes(query);
        });
      }

      if (categoryFilter !== "all") {
        items = items.filter((product) => product.category === categoryFilter);
      }

      if (stockFilter === "in-stock") {
        items = items.filter((product) => Number(product.stock) > 0);
      } else if (stockFilter === "out-of-stock") {
        items = items.filter((product) => Number(product.stock) <= 0);
      }

      if (sortBy === "price-asc") {
        items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      } else if (sortBy === "price-desc") {
        items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      }

      return items;
    }, [products, searchTerm, categoryFilter, stockFilter, sortBy]);

    if (loading) {
      return <div className="inner-section"><p>Loading products...</p></div> ;
    }

    if (!products.length) {
      return <div className="inner-section"><p>No products found.</p></div>;
    }

    return (
        <div className={styles.products}>
          <div className={styles.filters}>
            <input
              type="text"
              placeholder="Search products..."
              className={styles.filtersInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className={styles.filtersSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className={styles.filtersSelect}
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All stock</option>
              <option value="in-stock">In stock</option>
              <option value="out-of-stock">Out of stock</option>
            </select>

            <select
              className={styles.filtersSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort: default</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>

           <div className={styles.productsWrapper}>
            {filteredProducts.map((product) => {
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
            {!filteredProducts.length && (
              <p className={styles.noResults}>No products match your filters.</p>
            )}
            </div>
        </div>
    );
};

export default ProductList;