"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user || session.user.role !== "admin") {
      router.push("/home");
    } else {
      console.log("You are admin!")
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="inner-section">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user.name || "Admin"}!</p>
      <p>You have admin privileges.</p>
      {/* Add more admin features here */}
    </div>
  );
}
