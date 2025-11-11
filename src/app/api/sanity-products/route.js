import { client } from '@/lib/sanity';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `*[_type == "product"] | order(_createdAt desc) {
      _id,
      name,
      slug,
      price,
      details,
      category,
      stock,
      featured,
      "image": image.asset->_id,
    }`;
    
    const products = await client.fetch(query);
    
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}