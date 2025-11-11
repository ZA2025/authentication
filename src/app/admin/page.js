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
      
      <div style={{ marginTop: '20px' }}>
        <a 
          href="/admin/studio" 
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          Open Sanity Studio
        </a>
      </div>
    </div>
  );
}