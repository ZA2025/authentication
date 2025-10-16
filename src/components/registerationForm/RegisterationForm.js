'use client';
import styles from './RegisterationForm.module.scss';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Link from 'next/link';

const RegisterationForm = () => {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.target)
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        // Validate all fields
        if (!name || name.length < 2) {
            setError('Please enter your full name.');
            setLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }
        try {
             
            const response = await fetch(`/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            if (response.status === 201) {
                setSuccess('Registration successful! You can now log in.');
                setError(null);
            } else {
                const data = await response.json();
                if (data.message) {
                    setError(data.message);
                } else {
                    setError('An unexpected error occurred. Please try again.');
                }
            }

        } catch (error) {
            console.error('error', error);
        } finally {
            setLoading(false);
        }
    }

    const validateEmail = (email) => {
        const format = /\S+@\S+\.\S+/;
        return format.test(email);
    }
    
    
    return (
        <>
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                    <label htmlFor="name" className={styles.formLabel}>Name</label>
                    <input 
                        type="name" 
                        id="name" 
                        name="name" 
                        placeholder='Enter full name'
                        className={styles.formInput} 
                        required 
                    />
                </div>
                <div className={styles.formRow}>
                    <label htmlFor="email" className={styles.formLabel}>Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder='Enter email address'
                        className={styles.formInput} 
                        required 
                    />
                </div>
                <div className={styles.formRow}>
                    <label htmlFor="password" className={styles.formLabel}>Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        placeholder='Enter password'
                        className={styles.formInput} 
                        required 
                    />
                </div>
                {error && <p className="errorMessage">{error}</p>}
                {success && (
                    <p className={styles.success}>
                        Registration successful! You can now log in.
                        <Link className={styles.successLink} href="/login"> Go to Login</Link>
                    </p>
                )}
                <button className="form-submit" type="submit" disabled={loading || !!success}>
                    {loading ? 'Submitting...' : 'Register'}
                </button>
            </form>
        </div>
        </>
    )
};

export default RegisterationForm;