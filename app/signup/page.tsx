"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <>
      <Navbar />
      <AuthForm mode="signup" />
      <Footer />
    </>
  );
}
