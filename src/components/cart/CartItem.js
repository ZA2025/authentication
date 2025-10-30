'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useBasket } from '@/contexts/BasketContext';
import styles from './CartItem.module.scss';

// Snapshot item shape:
// { productId: string, name: string, price: number, imageUrl?: string, slug?: string, quantity: number }
const CartItem = ({ item }) => {
  const { increaseQuantity, decreaseQuantity, removeItem } = useBasket(); 

  if (!item) return null;

  const {
    productId,
    name = '',
    price = 0,
    imageUrl = '/images/fallback.png',
    slug = '',
    quantity = 0,
  } = item;

  const lineTotal = Number(price) * Number(quantity);

  return (
    <li className={styles.cartItem}>
      <div className={styles.cartItemImage}>
        <Image
          src={imageUrl}
          alt={name || 'Product image'}
          width={300}
          height={300}
        />
      </div>

      <div className={styles.cartItemInfo}>
        <div className={styles.cartItemColLeft}>
          <h3 className={styles.cartItemName}>{name}</h3>
          <p className={styles.cartItemPrice}>£{Number(price).toFixed(2)}</p>

          <div className={styles.cartItemQuantity}>
            <button
              type="button"
              className={styles.cartItemQuantityBtn}
              onClick={() => decreaseQuantity(productId)}
              aria-label="Decrease"
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              className={styles.cartItemQuantityBtn}
              onClick={() => increaseQuantity(productId)}
              aria-label="Increase"
            >
              +
            </button>
          </div>

          {slug && (
            <Link href={`/products/${slug}`} className={styles.cartItemBtn}>
              View details
            </Link>
          )}

          <button
            type="button"
            className={styles.cartItemBtn}
            onClick={() => removeItem(productId)}
            aria-label="Remove"
          >
            Remove
          </button>
        </div>

        <div className={styles.cartItemColRight}>
          <span className={styles.cartItemSubtotal}>
            £{lineTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </li>
  );
};

export default CartItem;