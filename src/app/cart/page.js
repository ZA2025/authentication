'use client';
import { useBasket } from "@/contexts/BasketContext";
import CartItem from "@/components/cart/CartItem";
import styles from "./cart.module.scss";
import CartSummary from "@/components/cart/CartSummary";
import AppleStyleSlider from "@/components/swiper/Swiper";

const Cart = () => {
  const { basket, addToBasket, removeFromBasket } = useBasket();

  // Increase quantity
  const handleIncrease = (productSlug) => {
    addToBasket(productSlug, 1);
  };

  // Decrease quantity
  const handleDecrease = (productSlug) => {
    removeFromBasket(productSlug);
  };

  // Remove entire item from cart
  const handleRemove = async (productSlug) => {
    try {
      const res = await fetch("/api/basket", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug }),
      });

      if (!res.ok) {
        console.error("Failed to remove item:", await res.text());
      }
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  return (
    <section>
      <div className={styles.bag}>
        <div className={styles.bagLeft}>
          <h1 className={styles.bagTitle}>Your Cart</h1>

          {basket.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <ul>
              {basket.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onIncrease={() => handleIncrease(item.productSlug)}
                  onDecrease={() => handleDecrease(item.productSlug)}
                  onRemove={() => handleRemove(item.productSlug)}
                />
              ))}
            </ul>
          )}
        </div>

        <div className={styles.bagRight}>
          <CartSummary
            items={basket}
            classNames={{
              title: styles.bagSummary,
              divider: styles.bagLine,
              button: styles.bagBtn,
              disabledButton: styles.bagBtnDisabled,
            }}
          />
        </div>
      </div>

      <div>
        <AppleStyleSlider />
      </div>
    </section>
  );
};

export default Cart;
