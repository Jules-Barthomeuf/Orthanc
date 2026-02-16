"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { useEffect } from "react";

export default function SignupPage() {
  useEffect(() => { document.title = 'Orthanc - Sign Up'; }, []);
  return <AuthForm mode="signup" />;
}
