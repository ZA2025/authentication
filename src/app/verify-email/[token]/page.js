'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const VerifyEmailPage = () => {
    const params = useParams();
    const token = params?.token;
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await fetch(`/api/verify-email/${token}`, {
                    method: 'GET',
                });

                const data = await res.json();

                if (res.status === 200) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An unexpected error occurred');
            }
        };

        verifyEmail();
    }, [token]);

    if (status === 'loading') {
        return (
            <div className="inner-section">
                <h1>Verifying Email...</h1>
                <p>Please wait while we verify your email address.</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="inner-section">
                <div className='success-container'>
                    <h1>Email Verified Successfully!</h1>
                    <div className="successMessage">
                         
                        <p>{message}</p>
                        <p>You can now log in to your account.</p>
                    </div>
                    <Link href="/login" className="form-submit">
                        Go to Login
                    </Link>
                </div>
                 
            </div>
        );
    }

    return (
        <div className="inner-section">
            <h1>Email Verification Failed</h1>
            <div className="errorMessage">
                <span className="errorIcon">❌</span>
                <p>{message}</p>
            </div>
            <div style={{ marginTop: '20px' }}>
                <Link href="/register" className="link">
                    Register Again
                </Link>
                <br />
                <Link href="/login" className="link">
                    Go to Login
                </Link>
            </div>
        </div>
    );
};

export default VerifyEmailPage;