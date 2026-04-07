"use client";

import { PortalSidebar } from "@/components/common/PortalSidebar";
import { FeedbackOverlay } from "@/components/client/FeedbackOverlay";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Property } from "@/types";

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

        // Fetch only portal properties by IDs
        if (portalData.propertyIds.length > 0) {
          const idsParam = encodeURIComponent(portalData.propertyIds.join(","));
          const propsRes = await fetch(`/api/properties?ids=${idsParam}&summary=1`);
          if (propsRes.ok) {
            setProperties(await propsRes.json());
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

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`;
    if (price >= 1000) return `$${Math.round(price / 1000)}K`;
    return `$${price.toLocaleString("en-US")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !portal) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Portal Not Found</h1>
          <div className="gold-line mx-auto mb-6" />
          <p className="text-dark-400 text-sm mb-6">This link is invalid or expired.</p>
          <Link href="/" className="luxury-button-secondary text-sm">Go Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <FeedbackOverlay itemId={slug} itemType="portal" />
      <PortalSidebar slug={slug} portalName={portal.name} />

      <main className="pt-20 min-h-screen">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-8 animate-fade-up">
            <p className="label-luxury text-gold-400 mb-2">PORTFOLIO</p>
            <h1 className="text-3xl font-bold text-white mb-2">My Properties</h1>
            <div className="gold-line mb-4" />
            <p className="text-dark-500 text-sm">{properties.length} propert{properties.length === 1 ? "y" : "ies"} in progress</p>
          </div>

          {/* Search */}
          <div className="mb-8 max-w-2xl animate-fade-up">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" placeholder="Search a property..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-dark-800 border border-dark-600/30 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-gold-400/40 transition-colors text-sm" />
            </div>
          </div>

          {/* Empty */}
          {filteredProperties.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 animate-fade-up">
              <h3 className="text-xl font-semibold text-white mb-2">{search ? "No property found" : "No properties"}</h3>
              <p className="text-dark-400 text-sm">{search ? "Try a different term." : "Properties will appear here."}</p>
            </div>
          )}

          {/* Grid */}
          {filteredProperties.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProperties.map((property, idx) => (
                <Link key={property.id} href={`/portal/${portal.slug}/${property.id}`}
                  className="group relative rounded-2xl overflow-hidden hover:ring-1 hover:ring-gold-400/20 transition-all duration-300 bg-dark-800"
                  style={{ animation: `fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${0.05 + idx * 0.07}s both` }}>
                  <div className="relative h-64 md:h-72 bg-dark-700 overflow-hidden">
                    {property.images?.[0] ? (
                      <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-dark-800 flex items-center justify-center">
                        <svg className="w-12 h-12 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-400/90 text-dark-900">PROSPECT</span>
                    </div>
                    <div className="absolute bottom-4 left-5 right-5">
                      <h3 className="text-lg lg:text-xl font-bold text-white mb-1 leading-tight">{property.title}</h3>
                      <p className="text-white/60 text-sm">{property.address}</p>
                    </div>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-dark-500 mb-1">ASKING PRICE</p>
                        <p className="text-base font-bold text-gold-400">{formatPrice(property.price ?? 0)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-dark-500 mb-1">YIELD</p>
                        <p className="text-base font-bold text-white">{property.capRate ? `${property.capRate}%` : property.investmentAnalysis?.capRate ? `${property.investmentAnalysis.capRate}%` : "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-dark-500 mb-1">AREA</p>
                        <p className="text-base font-bold text-white">{property.squareFeet ? `${property.squareFeet.toLocaleString()} sqft` : "—"}</p>
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
    </div>
  );
}
