"use client"; 
import { useEffect, useState } from 'react';
import styles from './Faqs.module.scss';
import { faqs } from './faqs.data';

const Faqs = () => {
    const [faqItems, setFaqItems] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        setFaqItems(faqs);
    }, []);

    const toggleOpen = (index) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    return (
        <div className={styles.faq}>
        <h1>FAQ</h1>
        {faqItems.map((item, index) => (
            <div key={index} className={styles.faqItem}>
                <button onClick={() => toggleOpen(index)} className={`${styles.question} ${openIndex === index ? styles.open : ''}`} aria-expanded={openIndex === index}>
                    <span>{item.question}</span>
                    <span className={styles.icon} aria-hidden>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>
                <div className={`${styles.answer} ${openIndex === index ? styles.answerOpen : ''}`}>
                    <p>{item.answer}</p>
                </div>
            </div>
        ))}
    </div>
    )
}

export default Faqs;