// components/CheckoutButton.js
"use client"; // Required for client-side interactivity in App Router

import { loadStripe } from "@stripe/stripe-js";
import styles from './CheckoutBtn.module.scss';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutButton() {
    
  const handleCheckout = async () => {
    const stripe = await stripePromise;
    if (!stripe) {
      console.error("Stripe not initialized. Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      return;
    }

    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      console.error("Checkout error:", data.error || `HTTP ${res.status}`);
      return;
    }

    if (data.id) {
      await stripe.redirectToCheckout({ sessionId: data.id });
    } else {
      console.error("Checkout error: No session ID returned");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className={styles.btn}
    >
      Checkout
    </button>
  );
}
