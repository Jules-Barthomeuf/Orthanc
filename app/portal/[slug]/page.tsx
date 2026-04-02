"use client";

import { Footer } from "@/components/common/Footer";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Property } from "@/types";

/* Sun / Moon icons */
const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

interface Portal {
  id: string;
  name: string;
  slug: string;
  agentId: string;
  description: string;
  propertyIds: string[];
  createdAt: string;
}

interface PortalPublicPageProps {
  params: Promise<{ slug: string }>;
}

export default function PortalPublicPage({ params }: PortalPublicPageProps) {
  const { slug } = React.use(params);
  const [portal, setPortal] = useState<Portal | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [dayMode, setDayMode] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProperties = properties.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    (async () => {
      try {
        // Fetch portal by slug
        const portalRes = await fetch(`/api/portals?slug=${encodeURIComponent(slug)}`);
        if (!portalRes.ok) {
          setNotFound(true);
          return;
        }
        const portalData: Portal = await portalRes.json();
        setPortal(portalData);

        if (typeof document !== "undefined") {
          document.title = `${portalData.name} - Orthanc`;
        }

        // Fetch all properties and filter by portal
        if (portalData.propertyIds.length > 0) {
          const propsRes = await fetch("/api/properties");
          if (propsRes.ok) {
            const all: Property[] = await propsRes.json();
            const portalProps = all.filter((p) => portalData.propertyIds.includes(p.id));
            setProperties(portalProps);
          }
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400 text-sm">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (notFound || !portal) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-luxury text-3xl text-white mb-4">Portal Not Found</h1>
          <div className="gold-line w-16 mx-auto mb-6" />
          <p className="text-dark-400 text-sm mb-6">This portal link may be invalid or expired.</p>
          <Link href="/" className="luxury-button-secondary text-sm">Go to Homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={dayMode ? "portal-day" : ""}>
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-dark-900/95 backdrop-blur-md border-b border-gold-400/10 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/portal/${slug}`} className="flex items-center">
              <img src="/logo.svg" alt="Orthanc" className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href={`/portal/${slug}`}
                className="text-sm text-white hover:text-gold-400 transition-colors font-medium"
              >
                My Properties
              </Link>
              <Link
                href={`/portal/${slug}/simulator`}
                className="text-sm text-dark-400 hover:text-gold-400 transition-colors"
              >
                Simulator
              </Link>
              <button
                onClick={() => setDayMode(!dayMode)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-400/20 hover:border-gold-400/40 transition-all text-dark-400 hover:text-gold-400"
                title={dayMode ? "Switch to Night" : "Switch to Day"}
              >
                {dayMode ? <MoonIcon /> : <SunIcon />}
                <span className="text-xs tracking-wide">{dayMode ? "Night" : "Day"}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
        </div>
      </nav>

      <main className="pt-24 pb-16 bg-dark-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {/* Portal header */}
          <div className="mb-10 animate-fade-up">
            <p className="label-luxury text-gold-400 mb-3">Portfolio</p>
            <h1 className="font-display text-4xl lg:text-5xl text-white mb-3">{portal.name}</h1>
            <div className="gold-line-left w-24 animate-reveal-line" />
            {portal.description && (
              <p className="text-dark-400 text-sm mt-4 max-w-2xl">{portal.description}</p>
            )}
            <p className="text-dark-500 text-sm mt-3">
              {properties.length} project{properties.length === 1 ? "" : "s"}
            </p>
          </div>

          {/* Search bar */}
          <div className="mb-10 max-w-xl animate-fade-up">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search a project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-dark-800 border border-dark-600/30 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-gold-400/40 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Empty */}
          {filteredProperties.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 animate-fade-up">
              <h3 className="font-display text-xl text-white mb-2">
                {search ? "No matching projects" : "No properties yet"}
              </h3>
              <p className="text-dark-400 text-sm">
                {search ? "Try a different search term." : "Properties will appear here once the agent adds them."}
              </p>
            </div>
          )}

          {/* Properties grid — 2 columns like the reference */}
          {filteredProperties.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProperties.map((property, idx) => (
                <Link
                  key={property.id}
                  href={`/portal/${portal.slug}/${property.id}`}
                  className="group relative rounded-2xl overflow-hidden hover:ring-1 hover:ring-gold-400/20 transition-all duration-300"
                  style={{ animation: `fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${0.05 + idx * 0.07}s both` }}
                >
                  {/* Card image background */}
                  <div className="relative h-72 md:h-80 bg-dark-700 overflow-hidden">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-dark-800" />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-5 left-5">
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-dark-800/70 backdrop-blur-sm text-gold-400 border border-gold-400/20">
                        Featured
                      </span>
                    </div>

                    {/* Title & Address overlaid on image */}
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="font-display text-xl lg:text-2xl font-bold text-white mb-1 leading-tight">
                        {property.title}
                      </h3>
                      <p className="text-white/60 text-sm">{property.address}</p>
                    </div>
                  </div>

                  {/* Stats row at bottom */}
                  <div className="bg-dark-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex gap-8">
                      <div>
                        <p className="label-luxury text-dark-500 text-[10px] mb-1">Price</p>
                        <p className="font-display text-lg text-gold-400 font-bold">
                          ${((property.price ?? 0) / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div>
                        <p className="label-luxury text-dark-500 text-[10px] mb-1">Yield</p>
                        <p className="text-white text-lg font-semibold">
                          {property.capRate ? `${property.capRate}%` : property.investmentAnalysis?.capRate ? `${property.investmentAnalysis.capRate}%` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="label-luxury text-dark-500 text-[10px] mb-1">Surface</p>
                        <p className="text-white text-lg font-semibold">
                          {property.squareFeet ? `${property.squareFeet.toLocaleString()} sqft` : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-dark-600/40 flex items-center justify-center text-dark-400 group-hover:border-gold-400/40 group-hover:text-gold-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
