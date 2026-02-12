'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useProducts } from "@/hooks/useProducts";
 
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// import required modules
import { Pagination, Scrollbar, Navigation } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import styles from "./Swiper.module.scss";
 
import Link from 'next/link';
import { urlFor } from "@/lib/sanity";

export default function AppleStyleSlider() {
    const { products, loading } = useProducts(10);

    if (loading) {
        return <p className='inner-section'>Loading products...</p>;
    }

    if (!products.length) {
        return <p className='inner-section'>No products found.</p>;
    }

  return (

    <div className="apple-swiper">
        <Swiper
        slidesPerView={1}
        centeredSlides={false}
        spaceBetween={10}
        slidesOffsetBefore={20}
        slidesOffsetAfter={20}
        breakpoints={{
        640: {
            slidesPerView: 2,
            spaceBetween: 20,
            slidesOffsetBefore: 20,
            slidesOffsetAfter: 20,
        },
        768: {
            slidesPerView: 3,
            spaceBetween: 25,
            slidesOffsetBefore: 20,
            slidesOffsetAfter: 20,
        },
        1024: {
            slidesPerView: 4,
            spaceBetween: 30,
            slidesOffsetBefore: 85,
            slidesOffsetAfter: 0,
        },
        }}
        scrollbar={{
            el: '.custom-scrollbar',
            draggable: true,
            hide: false,
        }}
        // pagination={{
        // clickable: true,
        // }}
        navigation
        modules={[Pagination, Scrollbar, Navigation]}
        className="mySwiper"
        >
            {products.map((item, index) => {
                const slug = item.slug?.current || item._id || item._key;
                const key = slug || `product-${index}`;
                const imageUrl = item.image ? urlFor(item.image).url() : "";

                if (!imageUrl || !slug) return null;

                return (
                    <SwiperSlide key={key} className={styles.slide}>
                        <Link
                            href={`/products/${slug}`}
                            className={styles.slideLink}
                            aria-label={`View ${item.name}`}
                        >
                            <div className={styles.slideImage}>
                                <Image
                                    src={imageUrl}
                                    alt={item.name}
                                    width={400}
                                    height={400}
                                    className="rounded-xl"
                                    priority
                                />
                            </div>
                            <div className={styles.slideInfo}>
                                <h3 className={styles.slideInfoName}>{item.name}</h3>
                                <p className={styles.slideInfoPrice}>£{item.price}</p>
                                 
                            </div>
                        </Link>
                    </SwiperSlide>
                );
            })}

        </Swiper>
        <div className=""></div>
    </div>
  );
}
