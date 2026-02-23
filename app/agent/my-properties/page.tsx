"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useToastStore } from "@/lib/toast";

/* Page title */
if (typeof document !== 'undefined') document.title = 'Orthanc - My Properties';

type SortKey = "newest" | "price-high" | "price-low" | "name";
type ViewMode = "grid" | "list";

export default function MyPropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [lockingAll, setLockingAll] = useState(false);

  const handleToggleLock = async (id: string, currentlyLocked: boolean) => {
    setLockingId(id);
    try {
      const res = await fetch('/api/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, locked: !currentlyLocked }),
      });
      if (res.ok) {
        setProperties((prev) => prev.map((p) => p.id === id ? { ...p, locked: !currentlyLocked } : p));
        addToast({ type: 'success', message: currentlyLocked ? 'Property unlocked' : 'Property locked — it cannot be deleted' });
      } else {
        addToast({ type: 'error', message: 'Failed to update lock status' });
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to update lock status' });
    } finally {
      setLockingId(null);
    }
  };

  const handleLockAll = async () => {
    const unlocked = properties.filter((p) => !p.locked);
    if (unlocked.length === 0) {
      addToast({ type: 'info', message: 'All properties are already locked' });
      return;
    }
    setLockingAll(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockAll: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setProperties((prev) => prev.map((p) => ({ ...p, locked: true })));
        addToast({ type: 'success', message: `${data.count} properties locked successfully` });
      } else {
        addToast({ type: 'error', message: 'Failed to lock all properties' });
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to lock all properties' });
    } finally {
      setLockingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Block deletion of locked properties client-side too
    const prop = properties.find((p) => p.id === id);
    if (prop?.locked) {
      addToast({ type: 'error', message: 'This property is locked. Unlock it first before deleting.' });
      setConfirmDeleteId(null);
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/properties?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        addToast({ type: "success", message: "Property deleted successfully" });
      } else {
        const data = await res.json().catch(() => ({}));
        addToast({ type: "error", message: data.error || "Failed to delete property" });
      }
    } catch {
      addToast({ type: "error", message: "Failed to delete property" });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "agent") return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/properties");
        if (!res.ok) return;
        const all = await res.json();
        const mine = all.filter((p: any) => p.agentId === user.id);
        setProperties(mine);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "agent") {
      router.push("/login");
    }
  }, [user, router]);

  const filtered = useMemo(() => {
    let result = [...properties];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "price-high":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "price-low":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "name":
        result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    return result;
  }, [properties, searchQuery, sortBy]);

  const totalValue = useMemo(
    () => properties.reduce((sum, p) => sum + (p.price || 0), 0),
    [properties]
  );

  if (!user || user.role !== "agent") {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-20 bg-dark-900 min-h-screen">
        {/* Hero header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full animate-soft-glow"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(201,169,110,0.06) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 pt-4 pb-10 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10 animate-fade-up">
              <div>
                <p className="label-luxury text-gold-400/50 mb-3 tracking-[0.3em]">
                  Agent Portfolio
                </p>
                <h1 className="heading-luxury text-5xl lg:text-6xl text-white mb-4">
                  My Properties
                </h1>
                <div className="gold-line-left w-32 animate-reveal-line" />
              </div>
              <Link
                href="/agent/dashboard"
                className="luxury-button-primary text-sm flex items-center gap-2 self-start lg:self-auto"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Upload Property
              </Link>
            </div>

            {/* Stats row */}
            {!loading && properties.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up-d1">
                {[
                  {
                    label: "Total Listings",
                    value: properties.length.toString(),
                  },
                  {
                    label: "Portfolio Value",
                    value: `$${totalValue >= 1_000_000 ? (totalValue / 1_000_000).toFixed(1) + "M" : totalValue.toLocaleString()}`,
                  },
                  {
                    label: "Avg. Price",
                    value: `$${properties.length > 0 ? Math.round(totalValue / properties.length).toLocaleString() : "0"}`,
                  },
                  {
                    label: "Avg. Size",
                    value: `${properties.length > 0 ? Math.round(properties.reduce((s: number, p: any) => s + (p.squareFeet || 0), 0) / properties.length).toLocaleString() : "0"} sqft`,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-dark-800/60 border border-gold-400/[0.07] rounded-xl px-5 py-4 backdrop-blur-sm"
                  >
                    <p className="text-dark-400 text-[11px] font-sans uppercase tracking-widest mb-1">
                      {stat.label}
                    </p>
                    <p className="text-white font-display text-2xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Toolbar */}
          {!loading && properties.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 animate-fade-up-d2">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
                >
                  <circle
                    cx="7"
                    cy="7"
                    r="4.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M10.5 10.5L14 14"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or address..."
                  className="w-full bg-dark-800 border border-dark-600/20 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-colors placeholder:text-dark-500"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="bg-dark-800 border border-dark-600/20 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold-400/40 cursor-pointer appearance-none pr-8"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238b8b8b' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="name">Alphabetical</option>
                </select>

                {/* View toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLockAll}
                    disabled={lockingAll || properties.every((p) => p.locked)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed
                      bg-gold-400/10 text-gold-400 border-gold-400/20 hover:bg-gold-400/20 hover:border-gold-400/30"
                    title="Lock all properties to prevent accidental deletion"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    {lockingAll ? 'Locking...' : 'Lock All'}
                  </button>
                  <div className="flex border border-dark-600/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-gold-400/10 text-gold-400" : "bg-dark-800 text-dark-400 hover:text-white"}`}
                    title="Grid view"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <rect
                        x="1"
                        y="1"
                        width="5.5"
                        height="5.5"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="9.5"
                        y="1"
                        width="5.5"
                        height="5.5"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="1"
                        y="9.5"
                        width="5.5"
                        height="5.5"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <rect
                        x="9.5"
                        y="9.5"
                        width="5.5"
                        height="5.5"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-gold-400/10 text-gold-400" : "bg-dark-800 text-dark-400 hover:text-white"}`}
                    title="List view"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M1 3h14M1 8h14M1 13h14"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-dark-800/60 border border-dark-600/10 rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="h-52 bg-dark-700/50" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-dark-700/50 rounded w-3/4" />
                    <div className="h-3 bg-dark-700/50 rounded w-1/2" />
                    <div className="h-10 bg-dark-700/50 rounded w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && properties.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 animate-fade-up">
              <div className="w-20 h-20 rounded-2xl bg-dark-800 border border-gold-400/10 flex items-center justify-center mb-6">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-gold-400/40"
                >
                  <path
                    d="M4 28V12l12-8 12 8v16H4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="12"
                    y="18"
                    width="8"
                    height="10"
                    rx="0.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <h3 className="font-display text-xl text-white mb-2">
                No properties yet
              </h3>
              <p className="text-dark-400 text-sm mb-8 max-w-sm text-center leading-relaxed">
                Upload your first property to start building your portfolio and
                reach potential clients.
              </p>
              <Link
                href="/agent/dashboard"
                className="luxury-button-primary text-sm"
              >
                Upload Your First Property
              </Link>
            </div>
          )}

          {/* No search results */}
          {!loading &&
            properties.length > 0 &&
            filtered.length === 0 &&
            searchQuery.trim() && (
              <div className="text-center py-20 animate-fade-in">
                <p className="text-dark-400 text-sm">
                  No properties match &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gold-400 text-sm mt-3 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}

          {/* ─── Grid View ─── */}
          {!loading && filtered.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((property, idx) => (
                <Link
                  key={property.id}
                  href={`/agent/properties/${property.id}`}
                  className="group bg-dark-800/70 border border-gold-400/[0.06] rounded-xl overflow-hidden hover:border-gold-400/20 hover:bg-dark-800 transition-all duration-500"
                  style={{
                    animation: `fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${0.05 + idx * 0.08}s both`,
                  }}
                >
                  {/* Image */}
                  <div className="relative h-52 bg-dark-700 overflow-hidden">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 32 32"
                          fill="none"
                          className="text-dark-600"
                        >
                          <path
                            d="M4 28V12l12-8 12 8v16H4z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-dark-900/10 to-transparent" />

                    {/* Price badge */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <span className="font-display text-xl font-bold text-white drop-shadow-lg">
                        ${property.price?.toLocaleString()}
                      </span>
                      {property.locked && (
                        <span className="flex items-center gap-1 bg-gold-400/20 text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gold-400/30">
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold text-white mb-0.5 group-hover:text-gold-300 transition-colors line-clamp-1">
                          {property.title}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleLock(property.id, !!property.locked); }}
                        disabled={lockingId === property.id}
                        className={`shrink-0 p-1.5 rounded-md transition-colors ${
                          property.locked
                            ? 'text-gold-400 hover:text-gold-300 bg-gold-400/10'
                            : 'text-dark-500 hover:text-gold-400 hover:bg-gold-400/10'
                        }`}
                        title={property.locked ? 'Unlock property' : 'Lock property (prevent deletion)'}
                      >
                        {property.locked ? (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteId(property.id); }}
                        className={`shrink-0 p-1.5 rounded-md transition-colors ${property.locked ? 'text-dark-600 cursor-not-allowed' : 'text-dark-500 hover:text-red-400 hover:bg-red-400/10'}`}
                        title={property.locked ? 'Unlock to delete' : 'Delete property'}
                        disabled={!!property.locked}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1m2 0v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4h10zM7 7v4M9 7v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                    <p className="text-dark-400 text-xs mb-4 flex items-center gap-1.5 line-clamp-1">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="shrink-0 text-dark-500"
                      >
                        <path
                          d="M6 1C4.067 1 2.5 2.567 2.5 4.5 2.5 7.5 6 11 6 11s3.5-3.5 3.5-6.5C9.5 2.567 7.933 1 6 1z"
                          stroke="currentColor"
                          strokeWidth="1"
                        />
                        <circle
                          cx="6"
                          cy="4.5"
                          r="1"
                          stroke="currentColor"
                          strokeWidth="1"
                        />
                      </svg>
                      {property.address}
                    </p>

                    {/* Quick stats */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-dark-300 bg-dark-700/50 px-2.5 py-1.5 rounded-md">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className="text-gold-400/60"
                        >
                          <path
                            d="M1 11V7a1 1 0 011-1h3a1 1 0 011 1v4M8 11V4a1 1 0 011-1h3a1 1 0 011 1v7"
                            stroke="currentColor"
                            strokeWidth="1"
                          />
                          <path d="M0 11h14" stroke="currentColor" strokeWidth="1" />
                        </svg>
                        {property.bedroom} bd
                      </span>
                      <span className="flex items-center gap-1.5 text-dark-300 bg-dark-700/50 px-2.5 py-1.5 rounded-md">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className="text-gold-400/60"
                        >
                          <path
                            d="M1 7h12v2a2 2 0 01-2 2H3a2 2 0 01-2-2V7zM2 7V4"
                            stroke="currentColor"
                            strokeWidth="1"
                          />
                        </svg>
                        {property.bathroom} ba
                      </span>
                      <span className="flex items-center gap-1.5 text-dark-300 bg-dark-700/50 px-2.5 py-1.5 rounded-md">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className="text-gold-400/60"
                        >
                          <rect
                            x="2"
                            y="2"
                            width="10"
                            height="10"
                            rx="1"
                            stroke="currentColor"
                            strokeWidth="1"
                          />
                          <path
                            d="M2 7h10M7 2v10"
                            stroke="currentColor"
                            strokeWidth="0.8"
                            strokeDasharray="1.5 1.5"
                          />
                        </svg>
                        {property.squareFeet?.toLocaleString()} ft&sup2;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ─── List View ─── */}
          {!loading && filtered.length > 0 && viewMode === "list" && (
            <div className="space-y-3">
              {filtered.map((property, idx) => (
                <Link
                  key={property.id}
                  href={`/agent/properties/${property.id}`}
                  className="group flex items-center gap-5 bg-dark-800/70 border border-gold-400/[0.06] rounded-xl p-3 pr-6 hover:border-gold-400/20 hover:bg-dark-800 transition-all duration-500"
                  style={{
                    animation: `fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.03 + idx * 0.05}s both`,
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative w-28 h-20 rounded-lg bg-dark-700 overflow-hidden shrink-0">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 32 32"
                          fill="none"
                          className="text-dark-600"
                        >
                          <path
                            d="M4 28V12l12-8 12 8v16H4z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-bold text-white group-hover:text-gold-300 transition-colors truncate">
                        {property.title}
                      </h3>
                      {property.locked && (
                        <span className="flex items-center gap-1 bg-gold-400/20 text-gold-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-gold-400/30 shrink-0">
                          <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          LOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-dark-400 text-xs truncate">
                      {property.address}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="hidden md:flex items-center gap-6 text-xs text-dark-300 shrink-0">
                    <span>{property.bedroom} bd / {property.bathroom} ba</span>
                    <span>{property.squareFeet?.toLocaleString()} ft&sup2;</span>
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right">
                    <span className="font-display text-lg font-bold text-gold-400">
                      ${property.price?.toLocaleString()}
                    </span>
                  </div>

                  {/* Delete + Lock + Arrow */}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleLock(property.id, !!property.locked); }}
                    disabled={lockingId === property.id}
                    className={`shrink-0 p-1.5 rounded-md transition-colors ${
                      property.locked
                        ? 'text-gold-400 hover:text-gold-300 bg-gold-400/10'
                        : 'text-dark-500 hover:text-gold-400 hover:bg-gold-400/10'
                    }`}
                    title={property.locked ? 'Unlock property' : 'Lock property (prevent deletion)'}
                  >
                    {property.locked ? (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteId(property.id); }}
                    className={`shrink-0 p-1.5 rounded-md transition-colors ${property.locked ? 'text-dark-600 cursor-not-allowed' : 'text-dark-500 hover:text-red-400 hover:bg-red-400/10'}`}
                    title={property.locked ? 'Unlock to delete' : 'Delete property'}
                    disabled={!!property.locked}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1m2 0v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4h10zM7 7v4M9 7v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-dark-500 group-hover:text-gold-400 transition-colors shrink-0"
                  >
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          )}

          {/* Result count */}
          {!loading && filtered.length > 0 && (
            <p className="text-dark-500 text-xs mt-6 text-center">
              Showing {filtered.length} of {properties.length} propert{properties.length === 1 ? "y" : "ies"}
            </p>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 border border-gold-400/10 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="font-display text-lg text-white mb-2">Delete Property</h3>
            <p className="text-dark-400 text-sm mb-6">
              Are you sure you want to permanently delete this property? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm text-dark-300 hover:text-white transition-colors rounded-lg border border-dark-600/30 hover:border-dark-500/50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors rounded-lg border border-red-500/20 disabled:opacity-50"
              >
                {deletingId === confirmDeleteId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
