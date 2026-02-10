"use client"; 
import styles from './How.module.scss';
import Image from 'next/image';

const HowItWorks = () => {
    return (
        <section className={styles.How}>
            <div className='inner-section'>
                <h1>How It Works</h1>
                <div className={styles.HowItems}>
                    <div className={styles.HowItem}>
                        <Image src="/icons/cookie.svg" alt="How It Works" width={100} height={100} />
                        <h2 className={styles.HowItemTitle}>Step 1 - Choose your Cookies</h2>
                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p>
                    </div>
                    <div className={styles.HowItem}>
                        <Image src="/icons/delivery.svg" alt="How It Works" width={100} height={100} />
                        <h2 className={styles.HowItemTitle}>Step 2 - Delivery</h2>
                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dum.</p>
                    </div>
                    <div className={styles.HowItem}>
                        <Image src="/icons/jar.svg" alt="How It Works" width={100} height={100} />
                        <h2 className={styles.HowItemTitle}>Step 3 - Enjoy your Cookies</h2>
                        <p>Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries</p>
                    </div>
                </div>
                
                
            </div>
             
        </section>
    )
}

export default HowItWorks;