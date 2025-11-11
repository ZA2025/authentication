'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Eye, EyeOff } from "lucide-react";

const ResetPasswordPage = () => {
    const router = useRouter();
    const params = useParams();
    const token = params?.token;

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [verified, setVerified] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const { data: session, status } = useSession();

    // Password strength indicator
    const getPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        return strength;
    };

    // Password validation (same as registration)
    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
        if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
        if (!hasNumbers) return 'Password must contain at least one number';
        if (!hasSpecialChar) return 'Password must contain at least one special character';
        
        return null; // Valid password
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setPasswordStrength(getPasswordStrength(password));
        if (error) setError(null);
    };

    useEffect(() => {
        if (!token) return;

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
            // router.push('/home');
        }
    }, [status, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        const password = e.target.password.value;

        // Client-side validation
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password, email: user?.email }),
            });

            const data = await res.json();

            if (res.status === 400) {
                setError(data.message || "Something went wrong, please try again");
            } else if (res.status === 200) {
                setError(null);
                setSuccess(data.message);
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = (strength) => {
        if (strength <= 2) return '#ff4444';
        if (strength <= 3) return '#ffaa00';
        return '#00aa44';
    };

    const getStrengthText = (strength) => {
        if (strength <= 2) return 'Weak';
        if (strength <= 3) return 'Medium';
        return 'Strong';
    };

    if (status === 'loading') {
        return <div className="inner-section">Loading...</div>;
    }

    if (!verified) {
        return (
            <div className="inner-section">
                <h1>Reset Password</h1>
                {error && <p className="errorMessage">{error}</p>}
            </div>
        );
    }

    return (
        session !== 'authenticated' && (
            <div className="inner-section">
                <h1>Reset Password</h1>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="formRow">
                        <label htmlFor="password" className="formLabel">
                            New Password *
                        </label>
                        <div className="passwordContainer">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter your new password"
                                className="formInput"
                                required
                                minLength={8}
                                maxLength={128}
                                onChange={handlePasswordChange}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="passwordToggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                 
                                {showPassword ? <Eye size={20} />  :  <EyeOff size={20} />}
                            </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {passwordStrength > 0 && (
                            <div className="passwordStrength">
                                <div className="strengthBar">
                                    <div 
                                        className="strengthFill"
                                        style={{ 
                                            width: `${(passwordStrength / 5) * 100}%`,
                                            backgroundColor: getStrengthColor(passwordStrength)
                                        }}
                                    />
                                </div>
                                <span 
                                    className="strengthText"
                                    style={{ color: getStrengthColor(passwordStrength) }}
                                >
                                    {getStrengthText(passwordStrength)}
                                </span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="errorMessage">
                            
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="successMessage">
                            
                            {success} 
                            <Link href="/login" className="link">
                                Go to Login
                            </Link>
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="form-submit" 
                        disabled={loading || !!success}
                    >
                        {loading ? 'Updating Password...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        )
    );
};

export default ResetPasswordPage;