"use client"; 

import CredentialsLoginForm from "@/components/credentialsLoginForm/CredentialsLoginForm";
import LoginForm from "@/components/loginForm/LoginForm";
import { useSession } from "next-auth/react";
import { Elements } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Banner from "@/components/banner/Banner";

export default function Home() {
  const { data: session } = useSession

  return (
    <div>
      {!session && (
        <>
          {/* <CredentialsLoginForm />
          <LoginForm /> */}
        </>
      )}
       
    </div>
  );
}