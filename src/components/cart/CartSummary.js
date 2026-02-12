'use client';

import Link from 'next/link';
import styles from './CartItem.module.scss';

const CartSummary = ({ items, classNames, hideBuyButton = false }) => {
  const subtotalNumber = (items || [])
    .reduce((acc, item) => acc + Number(item?.quantity || 0) * Number(item?.price || 0), 0);
  const subtotal = subtotalNumber.toFixed(2);

  const totalNumber = subtotalNumber; // No taxes/shipping logic yet
  const total = totalNumber.toFixed(2);
  const isDisabled = totalNumber <= 0;

  return (
    <div className={styles.summary}>
      <h2 className={styles.summaryTitle}>Summary</h2>
      <p><span className={styles.summarySubtotal}>Subtotal:</span> {subtotal > 0 ? `£` + subtotal : `—` }</p>
      <p className={styles.summaryDelivery}>Estimated Delivery & Handling: Free</p>
      <p><span className={styles.summaryTotal}>Total:</span>  £{total}</p>
      
      {!hideBuyButton && (
        <Link
          href={isDisabled ? "#" : "/checkout"}
          // className={`${classNames?.button} ${isDisabled ? classNames?.disabledButton : ""}`}
          className={styles.summaryButton}
          aria-disabled={isDisabled}
        >
          Checkout
        </Link>
      )}
       
    </div>
  );
};

export default CartSummary;


