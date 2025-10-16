'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const ResetPasswordPage = () => {
    const router = useRouter();
    const params = useParams(); // Get dynamic params
    const token = params?.token; // Extract token safely

    const [error, setError] = useState(null);
    const [verified, setVerified] = useState(false);
    const [user, setUser] = useState(null);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (!token) return; // Prevent unnecessary API call

        const verifyToken = async () => {
            try {
                const res = await fetch('/api/verify-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                if (res.status === 400) {
                    setError("Invalid token or token has expired");
                    setVerified(true);
                } else if (res.status === 200) {
                    const data = await res.json();
                    setError(null);
                    setVerified(true);
                    setUser(data);
                }
            } catch (error) {
                setError('An unexpected error occurred. Please try again.');
            }
        };

        verifyToken();
    }, [token]);

    useEffect(() => {
        if (status === 'authenticated') {
            // come back
            // router.push('/home');
        }
    }, [status, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const password = e.target.password.value;

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password, email: user?.email }),
            });

            if (res.status === 400) {
                setError("Something went wrong, please try again");
            } else if (res.status === 200) {
                setError(null);
                router.push('/');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    if (status === 'loading') {
        return <div className="inner-section">Loading...</div>;
    }

    if (!verified) {
        return (
            <div className="inner-section">
                <h1>Reset Password Page</h1>
                {error && <p className="errorMessage">{error}</p>}
            </div>
        );
    }

    return (
        session !== 'authenticated' && (
            <div className="inner-section">
                <h1>Reset Password Page</h1>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="formRow">
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your new password"
                            className="formInput"
                            required
                        />
                    </div>
                    {error && <p className="errorMessage">{error}</p>}
                    <button 
                        type="submit"
                        className="form-submit" 
                        disabled={error?.length > 0}
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        )
    );
};

export default ResetPasswordPage;
