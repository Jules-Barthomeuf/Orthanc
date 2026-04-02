"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";

/* ── Glowing input ── */
function GlowInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="w-full relative">
      {label && (
        <label className="block mb-2 text-xs tracking-wider uppercase text-gold-400/60 font-medium">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="peer relative z-10 border border-gold-400/[0.12] h-12 w-full rounded-lg bg-dark-800/60 px-4 text-sm text-white font-light outline-none transition-all duration-200 ease-in-out focus:bg-dark-900 focus:border-gold-400/30 placeholder:text-dark-500 placeholder:font-normal"
          placeholder={placeholder}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        />
        {isHovering && (
          <>
            <div
              className="absolute pointer-events-none top-0 left-0 right-0 h-[1px] z-20 rounded-t-lg overflow-hidden"
              style={{
                background: `radial-gradient(40px circle at ${mousePosition.x}px 0px, rgba(201,169,110,0.7) 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 h-[1px] z-20 rounded-b-lg overflow-hidden"
              style={{
                background: `radial-gradient(40px circle at ${mousePosition.x}px 1px, rgba(201,169,110,0.7) 0%, transparent 70%)`,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ── Social icons ── */
const socialIcons = [
  {
    label: "Instagram",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
        <path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
        <path fill="currentColor" d="M6.94 5a2 2 0 1 1-4-.002a2 2 0 0 1 4 .002M7 8.48H3V21h4zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
        <path fill="currentColor" d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396z" />
      </svg>
    ),
  },
];

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

  /* Cursor glow on the left panel */
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      login(email, password, role);
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
    <div className="min-h-screen w-full bg-dark-900 flex items-center justify-center p-4 relative">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,169,110,0.03)_0%,_transparent_60%)]" />

      {/* Card */}
      <div className="w-[90%] lg:w-[70%] max-w-5xl flex bg-dark-800/50 border border-gold-400/[0.08] rounded-2xl overflow-hidden h-[600px] lg:h-[640px] relative z-10 shadow-2xl shadow-black/40">

        {/* ── Left: Form ── */}
        <div
          className="w-full lg:w-1/2 px-8 md:px-14 relative overflow-hidden flex items-center"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Cursor glow */}
          <div
            className={`absolute pointer-events-none w-[400px] h-[400px] bg-gradient-to-r from-gold-400/10 via-gold-400/5 to-gold-400/10 rounded-full blur-3xl transition-opacity duration-300 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `translate(${mousePosition.x - 200}px, ${mousePosition.y - 200}px)`,
              transition: "transform 0.15s ease-out, opacity 0.3s",
            }}
          />

          <form onSubmit={handleSubmit} className="relative z-10 w-full py-10 flex flex-col gap-5">
            {/* Header */}
            <div className="text-center mb-2">
              <div className="gold-line w-12 mx-auto mb-5 animate-reveal-line" />
              <h1 className="font-display text-3xl md:text-4xl text-white mb-2 animate-fade-up">
                {mode === "login" ? "Sign In" : "Create Account"}
              </h1>

              {/* Social icons */}
              <div className="flex items-center justify-center mt-5 animate-fade-up-d1">
                <ul className="flex gap-3">
                  {socialIcons.map((social, index) => (
                    <li key={index}>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full border border-gold-400/20 bg-dark-900/50 flex items-center justify-center text-dark-400 transition-all duration-300 hover:bg-gold-400/10 hover:text-gold-400 hover:border-gold-400/40 group"
                      >
                        <span className="transition-transform duration-300 group-hover:scale-110">
                          {social.icon}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-dark-500 text-xs mt-4 animate-fade-up-d2">
                or use your {mode === "login" ? "account" : "email"}
              </p>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-4 animate-fade-up-d2">
              <GlowInput
                label="Email"
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <GlowInput
                label="Password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === "signup" && (
                <GlowInput
                  label="Confirm Password"
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-xs">
                {error}
              </div>
            )}

            {/* Forgot password (login only) */}
            {mode === "login" && (
              <a href="#" className="text-dark-500 hover:text-gold-400 transition text-xs text-center">
                Forgot your password?
              </a>
            )}

            {/* Submit button */}
            <div className="flex justify-center animate-fade-up-d3">
              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex justify-center items-center overflow-hidden rounded-lg bg-gold-400/10 border border-gold-400/20 px-8 py-2.5 text-sm font-medium text-gold-400 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-gold-400/10 hover:bg-gold-400/15 hover:border-gold-400/40 disabled:opacity-50 cursor-pointer"
              >
                <span className="relative z-10">
                  {loading
                    ? "Loading..."
                    : mode === "login"
                      ? "Sign In"
                      : "Create Account"}
                </span>
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-13deg)_translateX(100%)]">
                  <div className="relative h-full w-10 bg-gold-400/10" />
                </div>
              </button>
            </div>

            {/* Gold separator */}
            <div className="gold-line w-full mt-1" />

            {/* Toggle link */}
            <div className="text-center text-sm text-dark-500 animate-fade-up-d4">
              {mode === "login" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-gold-400 hover:text-gold-300 transition font-medium">
                    Sign up
                  </Link>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="text-gold-400 hover:text-gold-300 transition font-medium">
                    Sign in
                  </Link>
                </p>
              )}
            </div>
          </form>
        </div>

        {/* ── Right: Image ── */}
        <div className="hidden lg:block w-1/2 h-full relative overflow-hidden">
          <Image
            src="/hero.jpg"
            width={1000}
            height={1000}
            priority
            alt="Luxury estate"
            className="w-full h-full object-cover opacity-40"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-800/80 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 via-transparent to-dark-900/30" />
          {/* Gold corner accent */}
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-gold-400/[0.15] rounded-br-2xl" />
        </div>
      </div>
    </div>
  );
}
