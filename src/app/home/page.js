"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginForm from '@/components/loginForm/LoginForm';
import CredentialsLoginForm from '@/components/credentialsLoginForm/CredentialsLoginForm';
import AdminPage from "@/app/admin/page";

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
        <div className="inner-section">
            <h1>Home Page</h1>
            <h4>Welcome to the Home Page {session?.user?.name}</h4>
            {/* <CredentialsLoginForm />
            <LoginForm /> */}
        </div>
    );
};

export default HomePage;