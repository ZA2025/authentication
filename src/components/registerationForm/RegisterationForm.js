'use client';
import styles from './RegisterationForm.module.scss';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Link from 'next/link';
import { Eye, EyeOff } from "lucide-react";

const RegisterationForm = () => {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [hasInteractedWithPassword, setHasInteractedWithPassword] = useState(false);

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

    // Real-time password strength feedback
    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setPasswordStrength(getPasswordStrength(password));
        
        // Clear error when user starts typing
        if (error) setError(null);
    };

    // Clear messages after 5 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.target);
        const name = formData.get('name')?.trim();
        const email = formData.get('email')?.trim();
        const password = formData.get('password');

        // Client-side validation
        if (!name || name.length < 2) {
            setError('Please enter your full name (at least 2 characters).');
            setLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest' // CSRF protection
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.status === 201) {
                setSuccess('Registration successful! Please check your email to verify your account.');
                setError(null);
                // Reset form
                event.target.reset();
                setPasswordStrength(0);
            } else if (response.status === 429) {
                setError('Too many registration attempts. Please try again later.');
            } else {
                setError(data.error || data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

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

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Create Account</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                    <label htmlFor="name" className={styles.formLabel}>
                        Full Name *
                    </label>
                    <input 
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        className={styles.formInput}
                        required
                        minLength={2}
                        maxLength={50}
                        autoComplete="name"
                    />
                </div>

                <div className={styles.formRow}>
                    <label htmlFor="email" className={styles.formLabel}>
                        Email Address *
                    </label>
                    <input 
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email address"
                        className={styles.formInput}
                        required
                        maxLength={100}
                        autoComplete="email"
                    />
                </div>

                <div className={styles.formRow}>
                    <label htmlFor="password" className={styles.formLabel}>
                        Password *
                    </label>
                    <div className={styles.passwordContainer}>
                        <input 
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder="Create a strong password"
                            className={styles.formInput}
                            required
                            minLength={8}
                            maxLength={128}
                            autoComplete="new-password"
                            onChange={(e) => {
                                handlePasswordChange(e);
                                setHasInteractedWithPassword(true);
                            }}
                        />
                        <button
                            type="button"
                            className={styles.passwordToggle}
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? <Eye size={20} />  :  <EyeOff size={20} />}
                        </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {passwordStrength > 0 && (
                        <div className={styles.passwordStrength}>
                            <div className={styles.strengthBar}>
                                <div 
                                    className={styles.strengthFill}
                                    style={{ 
                                        width: `${(passwordStrength / 5) * 100}%`,
                                        backgroundColor: getStrengthColor(passwordStrength)
                                    }}
                                />
                            </div>
                            <span 
                                className={styles.strengthText}
                                style={{ color: getStrengthColor(passwordStrength) }}
                            >
                                {getStrengthText(passwordStrength)}
                            </span>
                        </div>
                    )}
                    
                    {/* Password Requirements */}
                    {hasInteractedWithPassword && passwordStrength < 5 && (
                        <div className={styles.passwordRequirements}>
                            <p>Password must contain:</p>
                            <ul className={styles.formList}>
                                <li>At least 8 characters</li>
                                <li>One uppercase letter</li>
                                <li>One lowercase letter</li>
                                <li>One number</li>
                                <li>One special character</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="errorMessage">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className={styles.successMessage}>
                        {success}
                        <Link className={styles.successLink} href="/login">
                            Go to Login
                        </Link>
                    </div>
                )}

                <button 
                    className={`form-submit ${loading ? styles.loading : ''}`}
                    type="submit" 
                    disabled={loading || !!success}
                >
                    {loading ? (
                        <>
                            <span className={styles.spinner}></span>
                            Creating Account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </button>

                <div className="link-primary">
                    Already have an account? 
                    <Link  href="/login" className='link-secondary' >
                        Sign in here
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterationForm;