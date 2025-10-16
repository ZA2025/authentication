"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CredentialsLoginForm from "@/components/credentialsLoginForm/CredentialsLoginForm";
import { useAuth } from "@/contexts/AuthContext";


export default function LoginPage() {
    const { session, status, isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
         
        if (status === "loading") return;
        if (status === "authenticated") {
            const role = session?.user?.role;

            if (role === "admin") {
                router.push("/admin")
            } else {
                router.push("/home")
            }
        }
    }, [session, status, router]);

    return (
        <div className="inner-section">
            
            {!isAuthenticated && (
                <>
                    <h1>Login Page</h1>
                    <CredentialsLoginForm />
                    {/* <LoginForm /> */}
                </>
            )}
             
        </div>
    );

}