"use client";
import Link from "next/link";
import styles from './Footer.module.scss';

const Footer = () => {
    return (
        <footer className={styles.Footer}>
            <div className="inner-section">
                <ul>
                    <li>
                        <Link href="/">Home</Link>
                    </li>
                    <li>
                        <Link href="/products">Products</Link>
                    </li>
                    <li>
                        <Link href="/contact">Contact</Link>
                    </li>
                    <li>
                        <Link href="/faq">FAQ</Link>
                    </li>
                    <li>
                        <Link href="/terms-of-service">Terms of Service</Link>
                    </li>
                    <li>
                        <Link href="/cookie-policy">Cookie Policy</Link>
                    </li>
                </ul>
            </div>
        </footer>
    );
}

export default Footer;
