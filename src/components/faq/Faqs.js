import styles from './Faqs.module.scss';

const Faqs = () => {
    return (
        <section className={styles.Faqs}>
            <div className="inner-section">
                <h2>FAQs</h2>
                <p>Find answers to our most frequently asked questions below. If you can't find what you're looking for please contact us and we'll get in touch with 24 hours.</p>
                <div className={styles.FaqsList}>
                    
                </div>
            </div>
        </section>
    )
}

export default Faqs;