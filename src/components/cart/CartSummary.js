'use client';

import Link from 'next/link';
import CheckoutButton from '../checkoutButton/CheckoutButton';

const CartSummary = ({ items, classNames }) => {
  const subtotal = items
    .reduce((acc, item) => acc + Number(item.quantity || 0) * Number(item.productId?.price || 0), 0)
    .toFixed(2);

  const total = subtotal; // No taxes/shipping logic yet
  const isDisabled = subtotal <= 0;

  return (
    <div className={classNames?.container}>
      <h2 className={classNames?.title}>Summary</h2>
      <p>Subtotal:  {subtotal > 0 ? `£` + subtotal : `—` }</p>
      <p>Estimated Delivery & Handling: Free</p>
      <hr className={classNames?.divider} />
      <p>Total: £{total}</p>
      <hr className={classNames?.divider} />
      
      <Link
        href={isDisabled ? "#" : "/checkout"}
        className={`${classNames?.button} ${isDisabled ? classNames?.disabledButton : ""}`}
        aria-disabled={isDisabled}
      >
        Buy
      </Link>
      {/* <CheckoutButton /> */}
    </div>
  );
};

export default CartSummary;


