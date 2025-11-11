"use client";
import RegisterationForm from "@/components/registerationForm/RegisterationForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const RegisterPage = () => {
    const router = useRouter();
    const { isAuthenticated, user, status } = useAuth();

    useEffect(() => {
        if (status === 'loading') return;
        if (isAuthenticated) {
            router.push("/home");
        }
    }, [isAuthenticated, status, router]);

    if (status === 'loading' || isAuthenticated) return null;

    return (
        <div className="inner-section">
            <RegisterationForm />
        </div>
    );
};

export default RegisterPage;