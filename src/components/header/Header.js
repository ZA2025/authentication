"use client";
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import styles from './Header.module.scss';
import { ShoppingCart, Heart } from "lucide-react";
import { useBasket } from "@/contexts/BasketContext"; // ⬅️ import context
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import Image from 'next/image';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { session, status } = useAuth();
  const { basketCount } = useBasket(); // ⬅️ get basket state from context
  const { refreshBasket } = useBasket();
  const { favoritesCount } = useFavorites();
  const { refreshFavorites } = useFavorites();

  useEffect(() => {
    
    if (status === 'authenticated') {
      refreshBasket(); // Refresh when user logs in
      refreshFavorites();
    }
  }, [status, session?.user?.id]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add('navOpen');
    } else {
      document.documentElement.classList.remove('navOpen');
    }
  }, [isOpen]);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.navLogoContainer}>
          LOGO
        </div>
        <ul className={`${styles.navList} ${isOpen ? styles.navListOpen : ''}`}>
          <li className={styles.navItem}>
            <Link className={styles.navLink} href="/" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link className={styles.navLink} href="/products">
              Products
            </Link>
          </li>

          {session ? (
            <>
              <li className={styles.navItem}>
                <Link className={styles.navLink} href="/profile" onClick={closeMenu}>
                  <Image src="/icons/admin.svg" alt="admin" className={styles.navAdmin} width={24} height={24} />
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link className={styles.navLink} href="/favorites">
                  <div className={styles.navIconWrapper}>
                    <Heart size={24} />
                    {favoritesCount > 0 && (
                      <span className={styles.navBadge}>{favoritesCount}</span>
                    )}
                  </div>
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link className={styles.navLink} href="/cart">
                  <div className={styles.navIconWrapper}>
                    <ShoppingCart size={24} />
                    {basketCount > 0 && (
                      <span className={styles.navBadge}>{basketCount}</span>
                    )}
                  </div>
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link
                  className={styles.navLink}
                  href="/"
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                >
                  Logout
                </Link>
              </li>
               
            </>
          ) : (
            <>
              <li className={styles.navItem}>
                <Link className={styles.navLink} href="/login" onClick={closeMenu}>
                  Login
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link className={styles.navLink} href="/register" onClick={closeMenu}>
                  Join Us
                </Link>
              </li>
            </>
          )}
        </ul>
        <div className={styles.burger} onClick={toggleMenu}>
          <div className={styles.burgerLine}></div>
          <div className={styles.burgerLine}></div>
          <div className={styles.burgerLine}></div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
