"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/common/Footer";
import { Navbar } from "@/components/common/Navbar";
import { useAuthStore } from "@/lib/store";
import { Property } from "@/types";

const PAGE_SIZE = 12;

export default function AgentPropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "Orthanc - Properties";
    }
  }, []);

  const fetchPage = useCallback(async (pageNum: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/properties?agentId=${encodeURIComponent(user.id)}&summary=1&page=${pageNum}&limit=${PAGE_SIZE}`
      );
      if (!res.ok) return;
      const json = await res.json();
      setProperties(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "agent") {
      router.push("/login");
      return;
    }
    fetchPage(page);
  }, [user, router, page, fetchPage]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    const q = searchQuery.toLowerCase();
    return properties.filter((property) => property.title?.toLowerCase().includes(q));
  }, [properties, searchQuery]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!user || user.role !== "agent") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 bg-dark-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 animate-fade-up flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="label-luxury text-gold-400/60 mb-3">Portfolio</p>
              <h1 className="heading-luxury text-4xl text-white mb-3">Properties</h1>
              <div className="gold-line-left w-24 animate-reveal-line"></div>
              <p className="text-dark-400 text-sm mt-4">
                {total > 0 ? `${total} properties — page ${page} of ${totalPages}` : "Fast gallery view — only titles and pictures."}
              </p>
            </div>

            <Link
              href="/agent/my-properties"
              className="luxury-button-secondary text-sm self-start lg:self-auto"
            >
              Open Manager
            </Link>
          </div>

          <div className="mb-8 max-w-md animate-fade-up-d1">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by property name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-dark-800 border border-dark-600/30 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-gold-400/40 transition-colors text-sm"
              />
            </div>
          </div>

          {loading && properties.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="bg-dark-800 border border-dark-700/40 rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="h-60 bg-dark-700/60" />
                  <div className="p-5">
                    <div className="h-5 bg-dark-700/60 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProperties.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 animate-fade-up">
              <h3 className="font-sans text-xl text-white mb-2">
                {searchQuery ? "No property found" : "No properties yet"}
              </h3>
              <p className="text-dark-400 text-sm">
                {searchQuery ? "Try another property name." : "Your uploaded properties will appear here."}
              </p>
            </div>
          )}

          {filteredProperties.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property, idx) => (
                <Link
                  key={property.id}
                  href={`/agent/properties/${property.id}`}
                  className="group bg-dark-800 border border-dark-700/50 rounded-2xl overflow-hidden hover:border-gold-400/25 transition-all duration-300"
                  style={{ animation: `fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${0.05 + idx * 0.05}s both` }}
                >
                  <div className="relative h-60 bg-dark-700 overflow-hidden">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-600">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/85 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                      <h2 className="font-sans text-xl font-semibold text-white leading-tight">
                        {property.title}
                      </h2>
                      <div className="w-10 h-10 rounded-full border border-dark-600/40 bg-dark-900/60 flex items-center justify-center text-dark-300 group-hover:border-gold-400/40 group-hover:text-gold-400 transition-colors shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !searchQuery && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-dark-600/40 text-dark-300 hover:border-gold-400/40 hover:text-gold-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] ?? 0) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-dark-500 text-sm">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => goToPage(item as number)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        page === item
                          ? "bg-gold-400/15 border border-gold-400/40 text-gold-400"
                          : "border border-dark-600/40 text-dark-300 hover:border-gold-400/40 hover:text-gold-400"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border border-dark-600/40 text-dark-300 hover:border-gold-400/40 hover:text-gold-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
