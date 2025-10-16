'use client';
import { useBasket } from "@/contexts/BasketContext";
import Image from "next/image";
import CartItem from "@/components/cart/CartItem";
import styles from "./cart.module.scss";
import Link from "next/link";
import CartSummary from "@/components/cart/CartSummary";
// import AppleStyleSlider from "@/components/Swiper";
import AppleStyleSlider from "@/components/swiper/Swiper";


 

const Cart = () => {
  const { basket, addToBasket, setBasket, removeFromBasket } = useBasket(); // setBasket may be needed for delete
  

  const handleIncrease = (productId) => {
    addToBasket(productId, 1); // increase quantity by 1
  };

  const handleDecrease = async (productId) => {
    removeFromBasket(productId);
  };

  const handleRemove = async (productId) => {
    try {
      const res = await fetch("/api/basket", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        setBasket(prev => prev.filter(item => item.productId._id !== productId));
      } else {
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
          <h1 className={styles.bagTitle}>Bag</h1>
          {basket.length === 0 ? <p>Your cart is empty</p> : (
            <ul>
              {basket.map((item) => (
                <CartItem
                  key={item._id || item.productId?._id}
                  item={item}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  onRemove={handleRemove}
                />
              ))}
            </ul>
          )}
        </div>
        <div className={styles.bagRight}>
          <CartSummary
            items={basket}
            classNames={{
              container: styles.bagRight,
              title: styles.bagSummary,
              divider: styles.bagLine,
              button: styles.bagBtn,
              disabledButton: styles.bagBtnDisabled,
            }}
          />
          {/* <Link className={styles.bagBtn} href="/checkout">Checkout</Link> */}
        </div> 
        
      </div>
      <div>
        <AppleStyleSlider />
      </div>
    </section>
     
  );
};

export default Cart;
