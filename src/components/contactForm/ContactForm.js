"use client";
import styles from './ContactForm.module.scss';
import Image from 'next/image';

const ContactForm = () => {
    return (
        <>
            <div className={styles.contact}>
                <div className={styles.contactInnerContent}>
                <section className={styles.contactLeft}>
                    <h2 className={styles.contactTitle}>Contact</h2>
                    <p>Send us a message!</p>
                    <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</p>
                    <form className={styles.contactForm}>
                        <div className={styles.formGrid}>
                            <div className={styles.column}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Name:</label>
                                    <input type="text" id="name" name="name" placeholder='Full Name' />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email:</label>
                                    <input type="email" id="email" name="email" placeholder='Email' />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor='phone'>Phone:</label>
                                    <input type='tel' id='phone' name='phone' placeholder='Phone' />
                                </div>
                            </div>
                            <div className={styles.column}>
                                
                                <div className={styles.formGroupTextarea}>
                                    <label htmlFor="message">Message:</label>
                                    <textarea id="message" name="message" required="required" rows="3" placeholder="Message"></textarea>
                                </div>
                            </div>
                            <div className={styles.row}>
                                <button type="submit" className={styles.button}>Send</button>
                            </div>
                        </div>
                    </form>
                </section>
                <section className={styles.contactRight}>
                    <Image className={styles.contactImage} src="/images/cookieez.png" alt="Contact Form Right" width={1300} height={1300} />
                </section>
                </div>
                 
            </div>
        </>
    );
};

export default ContactForm;