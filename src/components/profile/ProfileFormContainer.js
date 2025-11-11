"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserInfoForm from "../userInfoForm/UserInfoForm";

export default function ProfileFormContainer() {
    const { data: session, status } = useSession();
    const router = useRouter();
  
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postcode: "",
      country: "",
    });
  
    const [message, setMessage] = useState("");
    const [isExistingUserInfo, setIsExistingUserInfo] = useState(false);
  
    useEffect(() => {
      if (status === "loading") return;
      if (!session) {
        router.push("/"); // Redirect if not authenticated
      }
      if (status === "authenticated") {
        fetchUserInfo();
      }
    }, [session, status, router]);
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const method = isExistingUserInfo ? "PUT" : "POST";
      const res = await fetch("/api/user-info", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
      if (res.ok) {
        setMessage("Personal information saved!");
        setIsExistingUserInfo(true);
      } else {
        setMessage(data.message || "Error saving data");
      }
    };
  
    const fetchUserInfo = async () => {
      const res = await fetch("/api/user-info");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setFormData(data);
          setIsExistingUserInfo(true);
        }
      }
    };
  
    if (status === "loading") return <p>Loading...</p>;
  
    return (
      <>
        <p>Welcome to the Profile Page <span className="text-primary">{session?.user?.name}</span></p>
        {session?.user?.role === "admin" && <p>You are: <span className="text-primary">Admin</span></p>}
        
        <UserInfoForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          message={message}
        />
      </>
    );
}