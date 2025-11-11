"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CancelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // If the user isn't logged in, send them home
    if (!session) {
      router.push("/");
    } else {
      // Optionally, send logged-in users back to basket after 3s
      const timeout = setTimeout(() => {
        router.push("/checkout");
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [session, status, router]);

  if (status === "loading") return <div className="inner-section"><p>Loading...</p></div>;

  return (
    <div className="inner-section">
      <h1>Payment Cancelled</h1>
      <p>
        No worries {session?.user?.name || "guest"}, you can try again anytime.
      </p>
      <p>Redirecting you back to your basket...</p>
    </div>
  );
}
