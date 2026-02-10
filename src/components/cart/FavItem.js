'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './CartItem.module.scss';
import { urlFor } from '@/lib/sanity';

const FavItem = ({ item }) => {
  if (!item) return null;
  
  // Get image URL from Sanity image object or legacy imageUrl
  const imageUrl = item.image ? urlFor(item.image).url() : (item.imageUrl || '');
  const name = item.name || 'Product';
  const details = item.details || item.description || '';
  const price = item.price;
  const category = item.category;
  const stock = item.stock;
  const slug = item.slug?.current || item.slug || item._id;

  if (!imageUrl) return null;

  return (
    <li className={styles.cartItem}>
      <div className={styles.cartItemImage}>
        <Link href={`/products/${slug}`}>
          <Image 
            src={imageUrl}
            alt={name}
            width={400}
            height={400}
          />
        </Link>
      </div>
      <div className={styles.cartItemInfo}>
        <div className={styles.cartItemColLeft}>
          <h2 className={styles.cartItemName}>
            <Link href={`/products/${slug}`}>{name}</Link>
          </h2>
          {details && <p>{details}</p>}
          {/* {category && <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>Category: {category}</p>}
          {typeof stock === 'number' && (
            <p style={{ fontSize: '14px', color: stock > 0 ? '#28a745' : '#dc3545', marginTop: '8px', fontWeight: 'bold' }}>
              {stock > 0 ? `In Stock (${stock} available)` : 'Out of Stock'}
            </p>
          )} */}
          <p className={styles.cartItemPrice}>£{price}</p>
        </div>
        <div className={styles.cartItemColRight}>
           
          <Link href={`/products/${slug}`} className={styles.cartItemBtn}>
            View Details
          </Link>
        </div>
      </div>
    </li>
  );
};

export default FavItem;