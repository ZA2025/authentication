"use client";

import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from "./CredentialsLoginForm.module.scss";
import Link from "next/link";
import LoginForm from "../loginForm/LoginForm";

const CredentialsLoginForm = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [error, setError] = useState(null);

    // Redirect when authenticated
    useEffect(() => {
        
        if (status === "authenticated" && session?.user) {
            if (session.user.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/home");
            }
        }
    }, [status,session, router]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null); // Reset error state

        const formData = new FormData(event.target);
        const email = formData.get("email");
        const password = formData.get("password");

        // Client-side validation
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            const response = await signIn("credentials", {
                email,
                password,
                redirect: false, // Prevent full-page reload
            });

            if (response?.error) {
                setError("The email address or password you entered isn't connected to an account.");
            }
        } catch (error) {
            console.error("Login Error:", error);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <>
            {status !== "authenticated" && (
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formRow}>
                            {/*<label htmlFor="email" className={styles.formLabel}>Email</label>*/}
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                placeholder="Enter your email"
                                className={styles.formInput} 
                                required
                            />
                        </div>
                        <div className={styles.formRow}>
                            {/*<label htmlFor="password" className={styles.formLabel}>Password</label>*/}
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                placeholder="Enter your password"
                                className={styles.formInput} 
                                required
                            />
                        </div>
                        {error && <p className="errorMessage">{error}</p>}
                        <button className="form-submit" type="submit">Log in</button>
                    </form>
                    Not Registered? <Link className={styles.register} href="/register">Create new account.</Link> <Link className={styles.register} href="/forgot-password">Forgot password?  </Link>
                </div>
            )}
        </>
    );
};

export default CredentialsLoginForm;
