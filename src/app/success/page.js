"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SuccessPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") return <div className="inner-section"><p>Loading...</p></div>

    if (!session) {
        router.push("/"); // redirect to home if user is not logged in
        return null;
      }
    return (
      <div className="inner-section">
        <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
        <p>Thanks {session.user?.name || "customer"}! Your order is confirmed.</p>
      </div>
    );
  }