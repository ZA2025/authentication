"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

const LoginForm = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!session) return; // Avoid running logic if the session isn't loaded

        // ✅ Role-based redirection
        if (session?.user?.role === "admin") {
            router.push("/admin");
        } else if (session?.user?.email) {
            router.push("/home");
        } else if (pathname !== "/") {
            router.push("/");
        }
    }, [session, router, pathname]);

    const handleSignIn = async () => {
        await signIn("google");
    };

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <div>
            {session ? (
                <button className="googleButton" onClick={handleSignOut}>
                    Sign out
                </button>
            ) : (
                <button onClick={handleSignIn} className="googleButton">
                    <Image src="/icons/google.png" alt="Google icon" width={20} height={20} />
                    Sign in with Google
                </button>
            )}
        </div>
    );
};

export default LoginForm;