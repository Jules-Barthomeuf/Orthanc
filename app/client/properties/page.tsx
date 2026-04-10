"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Property } from "@/types";

const PAGE_SIZE = 9;

export default function ClientPropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/properties?summary=1&page=${pageNum}&limit=${PAGE_SIZE}`
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
  }, []);

  useEffect(() => {
    document.title = 'Orthanc - Properties';
    if (!user || user.role !== "client") {
      router.push("/login");
      return;
    }
    fetchPage(page);
  }, [user, router, page, fetchPage]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!user || user.role !== "client") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 bg-dark-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12 animate-fade-up">
            <p className="label-luxury text-gold-400/60 mb-3">Explore</p>
            <h1 className="heading-luxury text-4xl text-white mb-3">
              Available Properties
            </h1>
            <div className="gold-line-left w-24 animate-reveal-line"></div>
            <p className="text-dark-400 text-sm mt-4">
              {total > 0 ? `${total} properties — page ${page} of ${totalPages}` : "Luxury properties curated by top agents"}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-28">
              <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && properties.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 animate-fade-up">
              <h3 className="font-sans text-xl text-white mb-2">No properties available</h3>
              <p className="text-dark-400 text-sm">Check back later for new listings.</p>
            </div>
          )}

          {/* Properties Grid */}
          {!loading && properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property, idx) => (
                <div key={property.id} className="bg-dark-800 border border-dark-700/50 rounded-lg overflow-hidden group hover:border-gold-400/25 transition-all duration-300" style={{ animation: `fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + idx * 0.1}s both` }}>
                  <div className="relative h-56 bg-dark-700 overflow-hidden">
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
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent"></div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-sans text-xl font-bold text-white mb-4">{property.title}</h3>

                    <Link
                      href={`/client/vault/${property.id}`}
                      className="luxury-button-primary block text-center w-full text-sm"
                    >
                      Open Property
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
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
