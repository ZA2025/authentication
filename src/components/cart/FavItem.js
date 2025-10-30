'use client';

import Image from 'next/image';
import styles from './CartItem.module.scss';

const FavItem = ({ item }) => {
  if (!item) return null;
  // item now comes as enriched Sanity product shape from /api/favorites GET
  const image = item.imageUrl || item.image; // support legacy
  const name = item.name || 'Product';
  const description = item.details || item.description;
  const price = item.price;

  

  return (
    <li className={styles.cartItem}>
      {image && (
        <div className={styles.cartItemImage}>
          <Image src={image} alt={name} width={400} height={400} />
        </div>
         
      )}
      <div className={styles.cartItemInfo}>
        <div className={styles.cartItemColLeft}>
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
        <div className={styles.cartItemColRight}>
          <p>£{price}</p>
        </div>
      </div>
    </li>
  );
};

export default FavItem;