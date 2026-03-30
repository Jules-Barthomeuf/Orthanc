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
      {/* Minimal nav */}
      <nav className="fixed top-0 w-full bg-dark-900/95 backdrop-blur-md border-b border-gold-400/10 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="Orthanc" className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDayMode(!dayMode)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-400/20 hover:border-gold-400/40 transition-all text-dark-400 hover:text-gold-400"
                title={dayMode ? "Switch to Night" : "Switch to Day"}
              >
                {dayMode ? <MoonIcon /> : <SunIcon />}
                <span className="text-xs tracking-wide">{dayMode ? "Night" : "Day"}</span>
              </button>
              <span className="text-dark-400 text-xs tracking-widest uppercase">Client Portal</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 bg-dark-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {/* Portal header */}
          <div className="mb-12 animate-fade-up">
            <p className="label-luxury text-gold-400/60 mb-3">Curated Collection</p>
            <h1 className="heading-luxury text-4xl lg:text-5xl text-white mb-3">{portal.name}</h1>
            <div className="gold-line-left w-24 animate-reveal-line" />
            {portal.description && (
              <p className="text-dark-400 text-sm mt-4 max-w-2xl">{portal.description}</p>
            )}
            <p className="text-dark-500 text-xs mt-3">
              {properties.length} propert{properties.length === 1 ? "y" : "ies"} in this collection
            </p>
          </div>

          {/* Empty */}
          {properties.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 animate-fade-up">
              <h3 className="font-display text-xl text-white mb-2">No properties yet</h3>
              <p className="text-dark-400 text-sm">Properties will appear here once the agent adds them.</p>
            </div>
          )}

          {/* Properties grid */}
          {properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property, idx) => (
                <Link
                  key={property.id}
                  href={`/portal/${portal.slug}/${property.id}`}
                  className="group bg-dark-800 border border-gold-400/10 rounded-lg overflow-hidden hover:border-gold-400/25 transition-all duration-300"
                  style={{ animation: `fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + idx * 0.1}s both` }}
                >
                  <div className="relative h-56 bg-dark-700 overflow-hidden">
                    {property.images?.[0] && (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="label-luxury text-gold-400 bg-dark-900/80 px-3 py-1 rounded text-[10px]">Featured</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-white mb-1">{property.title}</h3>
                    <p className="text-dark-400 text-sm mb-5">{property.address}</p>

                    <div className="space-y-0 mb-6">
                      <div className="property-row">
                        <span className="property-label">Price</span>
                        <span className="property-value text-gold-400">
                          ${((property.price ?? 0) / 1000000).toFixed(2)}M
                        </span>
                      </div>
                      <div className="property-row">
                        <span className="property-label">Details</span>
                        <span className="property-value">{property.bedroom}bd &middot; {property.bathroom}ba &middot; {property.squareFeet?.toLocaleString()} sqft</span>
                      </div>
                    </div>

                    <span className="luxury-button-primary block text-center w-full text-sm">
                      View Property
                    </span>
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
