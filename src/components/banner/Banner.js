"use client";
import styles from './Banner.module.scss';
import Image from 'next/image';

const Banner = () => {
    return (
        <div className={styles.bannerContainer}>
            <div className={styles.banner}>
                <div className={styles.bannerColLeft}>
                    <Image className={styles.bannerImage} src="/images/rocket-clouds.png" alt="Banner" width={500} height={500} />
                </div>
                <div className={styles.bannerColRight}>
                    <div className={styles.bannerInner}>
                        <h2>Buy 1 Get 1 Free</h2>
                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries</p>
                    </div>
                </div>
            </div>
        </div>
         
    );
};

export default Banner;