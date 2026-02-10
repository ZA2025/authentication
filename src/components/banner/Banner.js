"use client";
import styles from './Banner.module.scss';
import Image from 'next/image';
import Link from 'next/link';
 

const Banner = () => {
    return (
        <div className={styles.banner}>
            <div className={styles.bannerInfo}>
                <h2 className={styles.bannerTitle}>Do you have a question?</h2>
                <p className={styles.bannerText}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dum.</p>
                <Link href="/contact" className={styles.bannerLink}>Contact us now</Link>
            </div>
             
             {/* <Image
                src="/images/cookieez.png"
                alt="Banner"
                width={1024}
                height={1024}
                className={styles.bannerImage}
                priority
            /> */}
            
        </div>
         
    );
};

export default Banner;