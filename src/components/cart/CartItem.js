'use client';

import Image from 'next/image';
import styles from './CartItem.module.scss';

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const product = item.productId || {};
  const name = product.name || 'Product';
  const price = Number(product.price || 0);
  const quantity = Number(item.quantity || 0);
  const subtotal = (quantity * price).toFixed(2);

  return (
    <div className={styles.cartItem} key={item._id || product._id}>
      <div className={styles.cartItemImage}>
        {product.image ? (
            <Image
            src="/images/tshirt.jpeg"
            alt={name}
            width={1750}
            height={175}
            />
        ) : null}
      </div>
       
      <div className={styles.cartItemInfo}>
        <div className={styles.cartItemColLeft}>
          <h2 className={styles.cartItemName}>{name}</h2>
          <p className={styles.cartItemPrice}>Price: £{price}</p>
          <p className={styles.cartItemQuantity}>
            Quantity: 
            <button className={styles.cartItemQuantityBtn} onClick={() => onDecrease(product._id)}>-</button>
            <span className={styles.cartItemQuantity}>{quantity}</span>
            <button className={styles.cartItemQuantityBtn} onClick={() => onIncrease(product._id)}>+</button>
            
          </p>
          {quantity === 1 && (
            <button className={styles.cartItemBtn} onClick={() => onRemove(product._id)}>Remove</button>
          )}
        </div>
        <div className={styles.cartItemColRight}>
          <p className={styles.cartItemSubtotal}>£{subtotal}</p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;


