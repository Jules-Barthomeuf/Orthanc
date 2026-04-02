"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface PortalSidebarProps {
  slug: string;
  portalName?: string;
  mode?: "client" | "admin";
}

export function PortalSidebar({ slug, portalName, mode = "client" }: PortalSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === `/portal/${slug}`) return pathname === `/portal/${slug}`;
    return pathname.startsWith(path);
  };

  const navItems = [
    { label: "Dashboard", href: `/portal/${slug}` },
    { label: "My Properties", href: `/portal/${slug}` },
    { label: "Simulator", href: `/portal/${slug}/simulator` },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-dark-900/95 backdrop-blur-xl border-b border-gold-400/10 z-50 flex items-center px-6 lg:px-8">
      {/* Logo */}
      <Link href={`/portal/${slug}`} className="flex items-center mr-10 flex-shrink-0">
        <img src="/logo.svg" alt="Orthanc" className="h-8 w-auto" />
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "text-gold-400 bg-gold-400/10"
                  : "text-dark-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        {/* Portal name badge */}
        <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-800 border border-dark-700/50 text-xs text-dark-300">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
          {portalName || "Client Portal"}
        </span>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center cursor-pointer hover:bg-gold-400/30 transition-colors">
          <span className="text-gold-400 text-xs font-bold">
            {portalName ? portalName.charAt(0).toUpperCase() : "U"}
          </span>
        </div>
      </div>
    </nav>
  );
}
