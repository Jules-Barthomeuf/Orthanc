"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const role: "agent" | "client" = "agent";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Mock authentication
      login(email, password, role);

      // Redirect based on role
      if (role === "agent") {
        router.push("/agent/dashboard");
      } else {
        router.push("/client/properties");
      }
    } catch (err) {
      setError("Authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">ORTHANC</h1>
          <p className="text-gray-400">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <div className="luxury-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role is fixed to Agent — platform for agents only */}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gold-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="luxury-input w-full"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gold-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="luxury-input w-full"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password (Signup only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-semibold text-gold-400 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="luxury-input w-full"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="luxury-button-primary w-full disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>

            {/* Toggle Link */}
            <div className="text-center text-sm text-gray-400">
              {mode === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-gold-400 hover:text-gold-300">
                    Sign up
                  </Link>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="text-gold-400 hover:text-gold-300">
                    Sign in
                  </Link>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
