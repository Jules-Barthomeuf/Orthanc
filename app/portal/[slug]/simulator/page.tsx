"use client";

import { PortalSidebar } from "@/components/common/PortalSidebar";
import Simulator from "@/components/client/Simulator";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Property } from "@/types";

interface Portal {
  id: string; name: string; slug: string; agentId: string;
  description: string; propertyIds: string[]; createdAt: string;
}

interface SimulatorPageProps { params: Promise<{ slug: string }>; }

export default function SimulatorPage({ params }: SimulatorPageProps) {
  const { slug } = React.use(params);
  const [portal, setPortal] = useState<Portal | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const portalRes = await fetch(`/api/portals?slug=${encodeURIComponent(slug)}`);
        if (!portalRes.ok) { setNotFound(true); return; }
        const portalData: Portal = await portalRes.json();
        setPortal(portalData);
        if (typeof document !== "undefined") document.title = `Simulator - ${portalData.name} - Orthanc`;
        if (portalData.propertyIds.length > 0) {
          const propsRes = await fetch("/api/properties");
          if (propsRes.ok) {
            const all: Property[] = await propsRes.json();
            setProperties(all.filter((p) => portalData.propertyIds.includes(p.id)));
          }
        }
      } catch (err) { console.error(err); setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !portal) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Portal Not Found</h1>
          <p className="text-dark-400 text-sm">This portal does not exist.</p>
        </div>
      </div>
    );
  }

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <PortalSidebar slug={slug} portalName={portal.name} />

      <main className="ml-[220px] py-8 px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="label-luxury text-teal-400 mb-2">TOOLS</p>
          <h1 className="text-3xl font-bold text-white mb-2">
            Simulator
          </h1>
          <div className="gold-line mb-4" />
          <p className="text-dark-400 text-sm">Select a project to start the simulation</p>
        </div>

        {/* Property cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {properties.map((p) => {
            const isSelected = selectedProperty?.id === p.id;
            const img = p.images && p.images.length > 0 ? p.images[0] : "/placeholder-property.jpg";
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProperty(isSelected ? null : p)}
                className={`text-left rounded-xl overflow-hidden border transition-all ${
                  isSelected ? "border-teal-400 ring-1 ring-teal-400/30" : "border-dark-700 hover:border-dark-500"
                }`}
              >
                <div className="relative h-36">
                  <img src={img} alt={p.title} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-teal-400/10 flex items-center justify-center">
                      <span className="bg-teal-400 text-dark-900 text-xs font-bold px-3 py-1 rounded-full">Selected</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-dark-800">
                  <h3 className="text-sm font-medium text-white truncate">{p.title}</h3>
                  <p className="text-xs text-dark-400 truncate">{p.address}</p>
                  <p className="text-sm text-teal-400 mt-1 font-semibold">{formatPrice(p.price)}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Simulator */}
        {selectedProperty ? (
          <div className="border-t border-dark-700 pt-10">
            <Simulator address={selectedProperty.address} price={selectedProperty.price} />
          </div>
        ) : (
          <div className="border-t border-dark-700 pt-10 text-center py-20">
            <div className="text-dark-500 text-6xl mb-4">📊</div>
            <p className="text-dark-400">Select a project above to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
