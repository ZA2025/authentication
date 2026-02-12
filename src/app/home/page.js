"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginForm from '@/components/loginForm/LoginForm';
import CredentialsLoginForm from '@/components/credentialsLoginForm/CredentialsLoginForm';
import AdminPage from "@/app/admin/page";
import styles from './Home.module.scss';

const HomePage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
     
    useEffect(() => {
         
        if (!session) router.push('/'); // Redirect to home if not authenticated
        if (status === "loading") return; // Do nothing while loading
        if (session) {
            console.log(session, status);
        }
         
    }, [session, status, router]);

    if (status === "loading") {
        return <div className="inner-section">Loading...</div>; // Show a loading state while session is being fetched
    }

    if (!session) {
        return null; // If no session exists, show nothing
    }

    return (
        <section className={styles.home}>
            <div className="inner-section">
               
                <h4 className={styles.homeTitle}>Welcome Back {session?.user?.name}</h4>
                {/* <CredentialsLoginForm />
                <LoginForm /> */}
            </div>
        </section>
         
    );
};

export default HomePage;