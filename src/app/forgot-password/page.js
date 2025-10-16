'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const ForgotPasswordPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            //come back
            // router.push('/home');
        }
    }, [status, router]);

    const isEmailValid = (email) => {
        const format = /\S+@\S+\.\S+/;
        return format.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        
        if (!isEmailValid(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            
            if (res.status === 400) {
                setError("User doesn't exist: User not registered with this email address");
                setMessage(null);
            }
            if (res.status === 200) {
                setMessage(data.message);
                 
                setError(null);
                router.push('/');
            }
            if (res.status === 403) {
                setError('Google users cannot reset passwords. Please use Google login.');
                setMessage(null);
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
            setMessage(null);
        }
    };

    if (status === 'loading') {
        return <div className="inner-section">Loading...</div>;
    }

    return (
        session !== 'authenticated' && (
            <div className="inner-section">
                <h1>Forgot Password Page</h1>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="formRow">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            className="formInput"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="errorMessage">{error}</p>}
                    {message && <p className="successMessage">{message}</p>}
                    <button className="form-submit" type="submit">Submit</button>
                </form>
            </div>
        )
    );
};

export default ForgotPasswordPage;