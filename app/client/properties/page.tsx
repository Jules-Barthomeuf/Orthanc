"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Property } from "@/types";

export default function ClientPropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Orthanc - Properties';
    if (!user || user.role !== "client") {
      router.push("/login");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/properties?summary=1");
        if (!res.ok) return;
        const all: Property[] = await res.json();
        setProperties(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, router]);

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
              Luxury properties curated by top agents
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
        </div>
      </main>
      <Footer />
    </>
  );
}
