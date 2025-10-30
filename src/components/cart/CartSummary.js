'use client';

import Link from 'next/link';

const CartSummary = ({ items, classNames }) => {
  const subtotalNumber = (items || [])
    .reduce((acc, item) => acc + Number(item?.quantity || 0) * Number(item?.price || 0), 0);
  const subtotal = subtotalNumber.toFixed(2);

  const totalNumber = subtotalNumber; // No taxes/shipping logic yet
  const total = totalNumber.toFixed(2);
  const isDisabled = totalNumber <= 0;

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
       
    </div>
  );
};

export default CartSummary;


