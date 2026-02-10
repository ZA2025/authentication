// app/products/[slug]/page.js
import { client } from "@/lib/sanity";
import ProductDetails from "@/components/productDetails/ProductDetails";

async function getProduct(slug) {
  const query = `*[_type == "product" && slug.current == $slug][0]{
    _id,
    name,
    price,
    details,
    description,
    category,
    stock,
    sizesStock,
    "imageUrl": image.asset->url
  }`;
  return client.fetch(query, { slug });
}

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params; // Next 15 pattern
  const product = await getProduct(slug);

  if (!product) {
    return <div className="inner-section">Product not found.</div>;
  }

  return <ProductDetails product={product} />;
}