// import { getProductById } from "@/data/products";
import Product from "@/model/product";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/productDetails/ProductDetails";
import AppleStyleSlider from "@/components/swiper/Swiper";

const ProductDetailsPage = async ({ params }) => {
  const { id } = await params;

  // fetch product from your API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`, {
    cache: "no-store", // avoid stale cache when updating products
  });

  if (!res.ok) {
    return <p>Failed to load product.</p>;
  }
  const product = await res.json();

  return  (
    <>
    <ProductDetails product={product} />
    <AppleStyleSlider />
    </>
  );
  
  
  
};

export default ProductDetailsPage;
