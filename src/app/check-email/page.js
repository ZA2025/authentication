'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const CheckEmailPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email');
    const [resendStatus, setResendStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleResendVerification = async () => {
        if (!email) {
            setResendStatus({ type: 'error', message: 'Email not found' });
            return;
        }

        setLoading(true);
        setResendStatus(null);

        try {
            const response = await fetch('/api/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setResendStatus({ 
                    type: 'success', 
                    message: 'Verification email sent successfully! Please check your inbox.' 
                });
            } else {
                setResendStatus({ 
                    type: 'error', 
                    message: data.error || 'Failed to resend verification email' 
                });
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            setResendStatus({ 
                type: 'error', 
                message: 'Network error. Please try again later.' 
            });
        } finally {
            setLoading(false);
        }
    };

    // If no email parameter, redirect to register
    useEffect(() => {
        if (!email) {
            router.push('/register');
        }
    }, [email, router]);

    if (!email) {
        return null; // Will redirect
    }

    return (
        <div className="inner-section">
            <div className="success-container" style={{ 
                maxWidth: '600px', 
                margin: '0 auto', 
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{ 
                    fontSize: '4rem', 
                    marginBottom: '1rem' 
                }}>
                    📧
                </div>
                
                <h1 style={{ 
                    marginBottom: '1rem',
                    color: '#333'
                }}>
                    Check Your Email
                </h1>
                
                <div className="successMessage" style={{ 
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                }}>
                    <p style={{ 
                        fontSize: '1.1rem', 
                        marginBottom: '0.5rem',
                        color: '#1e40af'
                    }}>
                        We've sent a verification email to:
                    </p>
                    <p style={{ 
                        fontWeight: 'bold',
                        color: '#1e3a8a',
                        wordBreak: 'break-all'
                    }}>
                        {email}
                    </p>
                    <p style={{ 
                        marginTop: '1rem',
                        color: '#64748b',
                        fontSize: '0.95rem'
                    }}>
                        Please click the verification link in the email to activate your account.
                    </p>
                    <p style={{ 
                        marginTop: '0.5rem',
                        color: '#64748b',
                        fontSize: '0.9rem',
                        fontStyle: 'italic'
                    }}>
                        The link will expire in 24 hours.
                    </p>
                </div>

                {/* Resend Verification Section */}
                <div style={{ 
                    marginBottom: '2rem',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px'
                }}>
                    <p style={{ 
                        marginBottom: '1rem',
                        color: '#475569',
                        fontSize: '0.95rem'
                    }}>
                        Didn't receive the email?
                    </p>
                    
                    {resendStatus && (
                        <div style={{ 
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            backgroundColor: resendStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
                            color: resendStatus.type === 'success' ? '#065f46' : '#991b1b',
                            fontSize: '0.9rem'
                        }}>
                            {resendStatus.message}
                        </div>
                    )}

                    <button
                        onClick={handleResendVerification}
                        disabled={loading}
                        className="form-submit"
                        style={{
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                </div>

                {/* Navigation Links */}
                <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <Link 
                        href="/login" 
                        className="link-primary"
                        style={{
                            textDecoration: 'none',
                            color: '#3b82f6'
                        }}
                    >
                        Already verified? Go to Login
                    </Link>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <Link 
                        href="/register" 
                        className="link-secondary"
                        style={{
                            textDecoration: 'none',
                            color: '#64748b'
                        }}
                    >
                        Back to Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckEmailPage;

