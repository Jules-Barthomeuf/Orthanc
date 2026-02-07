"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="fixed top-0 w-full bg-luxury-dark border-b border-gold-900 backdrop-blur z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">◆</span>
            <span className="text-xl font-semibold">ORTHANC</span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <span className="text-gold-400 text-sm">
                  {user.email} ({user.role})
                </span>
                {user.role === "agent" && (
                  <Link
                    href="/agent/dashboard"
                    className="text-gold-400 hover:text-gold-300 transition"
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === "client" && (
                  <Link
                    href="/client/properties"
                    className="text-gold-400 hover:text-gold-300 transition"
                  >
                    Properties
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="luxury-button-secondary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gold-400 hover:text-gold-300">
                  Sign In
                </Link>
                <Link href="/signup" className="luxury-button-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
