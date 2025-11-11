'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
 
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// import required modules
import { Pagination, Scrollbar, Navigation } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
 
import { useLimitedProducts } from '@/hooks/useLimitedProducts';
import Link from 'next/link';

export default function AppleStyleSlider() {
    // const [products, setProducts] = useState([]);
    // const [loading, setLoading] = useState(true);
    const { products, loading } = useLimitedProducts(10);

    // useEffect(() => {
    //     const fetchProducts = async () => {
    //         try {
    //             const res = await fetch("/api/products");
    //             if (!res.ok) {
    //                 throw new Error("Failed to fetch products");
    //             }

    //             const data = await res.json();
    //             const randomProducts = data.sort(() => 0.5 - Math.random());
                 
    //             const limited = randomProducts.slice(0, 10);
    //             console.log(limited)
    //             setProducts(limited);

    //         } catch (error) {
    //             console.log("Error loading products:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
    //     fetchProducts();

    // }, []);

    if (loading) {
        return <p className='inner-section'>Loading products...</p>;
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
            {products.map((item) => {
                return (
                    <SwiperSlide key={item._id}>
                        <Link href={`/products/${item._id}`}>
                            <Image
                            src="/images/tshirt.avif" // make sure your API returns an image URL
                            alt={item.name}
                            width={400}
                            height={400}
                            className="rounded-xl"
                            priority
                            />
                            <p>{item.name}</p>
                            <p>£{item.price}</p>
                        </Link>
                    </SwiperSlide>
                )
                 
            })}

        </Swiper>
        <div className=""></div>
    </div>
  );
}
