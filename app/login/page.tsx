"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => { document.title = 'Orthanc - Login'; }, []);
  return <AuthForm mode="login" />;
}
