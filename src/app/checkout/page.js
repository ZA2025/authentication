'use client';

import { useEffect, useState } from "react";
import CartSummary from "@/components/cart/CartSummary";
import { useBasket } from "@/contexts/BasketContext";
import styles from "../cart/cart.module.scss";
import ProfileFormContainer from "@/components/profile/ProfileFormContainer";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutButton from "@/components/checkoutButton/CheckoutButton";
 

const CheckoutPage = () => {
    const { basket } = useBasket();
    const [userInfo, setUserInfo] = useState(null);
    const [userPayment, setUserPayment] = useState(null);
     
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await fetch('/api/user-info', { method: 'GET' });
                if (!res.ok) throw new Error('Failed to fetch user info');
                const data = await res.json();
                setUserInfo(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const isDisabled = !userInfo && !loading;

    return (
        <div className="inner-section">
            <h1>Checkout</h1>
            <section className={styles.bag}>
                <div className={styles.bagLeft}>
                    {/* Delivery Section */}
                    <div className={styles.bagDelivery}>
                        <h2 className={styles.bagDeliveryTitle}>Delivery Options</h2>

                        {loading ? (
                            <p>Loading...</p>
                        ) : userInfo ? (
                            <div>
                                <p><strong>Name:</strong> {userInfo.name}</p>
                                <p><strong>Email:</strong> {userInfo.email}</p>
                                <p><strong>Phone:</strong> {userInfo.phone}</p>
                                <p>
                                    <strong>Address:</strong> {userInfo.addressLine1}, {userInfo.addressLine2},{" "}
                                    {userInfo.city}, {userInfo.postcode}, {userInfo.country}
                                </p>
                            </div>
                        ) : (
                            <ProfileFormContainer onSuccess={setUserInfo} />
                        )}
                    </div>

                    {/* Payment Section */}
                    <div className={`${styles.bagPayment} ${isDisabled ? styles.disabledSection : ""}`}>
                        <h2 className={styles.bagPaymentTitle}>Payment Options</h2>
                        {!userInfo && !loading && <p>Please complete delivery info first.</p>}
                        {userInfo && !loading && <div>
                            <CheckoutButton />
                        </div>}
                    </div>

                    {/* Order Summary Section */}
                    <div className={`${styles.bagSummary} ${isDisabled ? styles.disabledSection : ""}`}>
                        <h2 className={styles.bagSummaryTitle}>Order Summary</h2>
                        {/* {!userPayment && !loading && <p>-</p>} */}
                        {userInfo && userPayment && !loading && <div>Summary</div>}
                    </div>
                </div>

                {/* Right Side Cart Summary */}
                <div className={`${styles.bagRight} ${isDisabled ? styles.disabledSection : ""}`}>
                    <CartSummary
                        items={basket}
                        hideBuyButton={userInfo && !loading}
                        classNames={{
                            container: styles.bagRight,
                            title: styles.bagSummary1,
                            divider: styles.bagLine,
                            button: styles.bagBtn,
                        }}
                    />
                </div>
            </section>
        </div>
    );
};

export default CheckoutPage;
