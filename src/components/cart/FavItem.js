'use client';

import Image from 'next/image';
import styles from './CartItem.module.scss';

const FavItem = ({ item }) => {
  if (!item) return null;
  const image = item.image || item.productId?.image;
  const name = item.name || item.productId?.name || 'Product';
  const description = item.description || item.productId?.description;
  const price = item.price || item.productId?.price;

  

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