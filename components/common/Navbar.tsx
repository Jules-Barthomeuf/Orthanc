"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import MegaMenu, { MegaMenuItem } from "./MegaMenu";
import {
  LayoutDashboard,
  Building2,
  UserCircle,
  Sparkles,
  FileText,
  BarChart3,
  Shield,
  TrendingUp,
  Search,
} from "lucide-react";

/* ── Menu definitions per role ── */
const agentMenuItems = (navigate: (path: string) => void): MegaMenuItem[] => [
  {
    id: 1,
    label: "Dashboard",
    link: "/agent/dashboard",
    onClick: () => navigate("/agent/dashboard"),
  },
  {
    id: 2,
    label: "Properties",
    subMenus: [
      {
        title: "Manage",
        items: [
          {
            label: "My Properties",
            description: "View & edit your listings",
            icon: Building2,
            href: "/agent/my-properties",
          },
          {
            label: "AI Assistant",
            description: "Generate listings with AI",
            icon: Sparkles,
            href: "/agent/dashboard",
          },
        ],
      },
      {
        title: "Insights",
        items: [
          {
            label: "Market Analysis",
            description: "Trends & valuations",
            icon: BarChart3,
            href: "/agent/my-properties",
          },
          {
            label: "Performance",
            description: "Track listing metrics",
            icon: TrendingUp,
            href: "/agent/my-properties",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Profile",
    link: "/agent/profile",
    onClick: () => navigate("/agent/profile"),
  },
];

const clientMenuItems = (): MegaMenuItem[] => [
  {
    id: 1,
    label: "Properties",
    subMenus: [
      {
        title: "Browse",
        items: [
          {
            label: "All Properties",
            description: "Explore available listings",
            icon: Search,
            href: "/client/properties",
          },
          {
            label: "Documents",
            description: "Access property vaults",
            icon: FileText,
            href: "/client/properties",
          },
        ],
      },
      {
        title: "Insights",
        items: [
          {
            label: "Market Data",
            description: "Latest market intelligence",
            icon: BarChart3,
            href: "/client/properties",
          },
          {
            label: "Due Diligence",
            description: "Provenance & compliance",
            icon: Shield,
            href: "/client/properties",
          },
        ],
      },
    ],
  },
];

/* ── Landing page locked menus ── */
const landingMenuItems: MegaMenuItem[] = [
  { id: 1, label: "Dashboard" },
  {
    id: 2,
    label: "Properties",
    subMenus: [
      {
        title: "Manage",
        items: [
          { label: "My Properties", description: "View & edit your listings", icon: Building2 },
          { label: "AI Assistant", description: "Generate listings with AI", icon: Sparkles },
        ],
      },
      {
        title: "Insights",
        items: [
          { label: "Market Analysis", description: "Trends & valuations", icon: BarChart3 },
          { label: "Performance", description: "Track listing metrics", icon: TrendingUp },
        ],
      },
    ],
  },
  { id: 3, label: "Profile" },
];

export function Navbar({ variant }: { variant?: "landing" | "default" }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const isLanding = variant === "landing";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  /* Route clicks from MegaMenu items that have links */
  const handleMenuNav = (link: string) => {
    router.push(link);
  };

  /* Build items for current role */
  const menuItems = isLanding
    ? landingMenuItems
    : user?.role === "agent"
      ? agentMenuItems(handleMenuNav)
      : user?.role === "client"
        ? clientMenuItems()
        : [];

  return (
    <>
    <nav className="fixed top-0 w-full bg-dark-900/95 backdrop-blur-md border-b border-gold-400/10 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center relative z-10">
            <img
              src="/image.png"
              alt="Orthanc"
              className="h-10 w-auto"
            />
          </Link>

          {/* Center: MegaMenu navigation — absolute center */}
          {(user || isLanding) && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex">
              <MegaMenu
                items={menuItems}
                locked={isLanding}
              />
            </div>
          )}

          {/* Right: auth actions */}
          <div className="flex items-center gap-4 relative z-10">
            {isLanding ? (
              /* Landing page — no auth buttons, just empty spacer for balance */
              <div />
            ) : user ? (
              <>
                <span className="text-dark-400 text-xs hidden lg:inline tracking-wide">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="luxury-button-secondary text-sm py-2 px-4"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-dark-300 hover:text-gold-400 transition text-sm">
                  Sign In
                </Link>
                <Link href="/signup" className="luxury-button-primary text-sm py-2 px-5">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>

      {/* Floating AI Chat FAB — visible for logged-in agents */}
      {!isLanding && user?.role === "agent" && (
        <Link
          href="/agent/dashboard"
          className="fixed bottom-6 right-6 z-50 group"
          title="Open AI Assistant"
        >
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute -inset-2 rounded-full bg-gold-400/20 blur-lg group-hover:bg-gold-400/30 transition-all duration-500 animate-pulse" />
            {/* Button */}
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 shadow-2xl shadow-gold-400/30 group-hover:shadow-gold-400/50 group-hover:scale-110 transition-all duration-300">
              <Sparkles className="w-6 h-6 text-dark-900" />
            </div>
            {/* Label tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-dark-800/95 backdrop-blur-sm border border-gold-400/20 text-gold-400 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl">
              AI Assistant
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 rotate-45 bg-dark-800/95 border-r border-t border-gold-400/20" />
            </div>
            {/* Notification dot */}
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-dark-900 animate-pulse" />
          </div>
        </Link>
      )}
    </>
  );
}
