"use client";

import { Footer } from "@/components/common/Footer";
import Simulator from "@/components/client/Simulator";
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

interface SimulatorPageProps {
  params: Promise<{ slug: string }>;
}

export default function SimulatorPage({ params }: SimulatorPageProps) {
  const { slug } = React.use(params);
  const [portal, setPortal] = useState<Portal | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [dayMode, setDayMode] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const portalRes = await fetch(`/api/portals?slug=${encodeURIComponent(slug)}`);
        if (!portalRes.ok) {
          setNotFound(true);
          return;
        }
        const portalData: Portal = await portalRes.json();
        setPortal(portalData);

        if (typeof document !== "undefined") {
          document.title = `Simulator - ${portalData.name} - Orthanc`;
        }

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

  useEffect(() => {
    if (dayMode) {
      document.documentElement.classList.add("portal-day");
    } else {
      document.documentElement.classList.remove("portal-day");
    }
    return () => document.documentElement.classList.remove("portal-day");
  }, [dayMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400 text-sm">Loading simulator...</p>
        </div>
      </div>
    );
  }

  if (notFound || !portal) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-2">Portal Not Found</h1>
          <p className="text-dark-400 text-sm">This portal does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(p);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
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
                className="text-sm text-dark-400 hover:text-gold-400 transition-colors"
              >
                My Properties
              </Link>
              <Link
                href={`/portal/${slug}/simulator`}
                className="text-sm text-white hover:text-gold-400 transition-colors font-medium"
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

      <main className="pt-24 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Property selector */}
        <div className="mb-10">
          <h1 className="text-3xl font-light tracking-tight mb-2">
            Investment <span className="text-gold-400">Simulator</span>
          </h1>
          <p className="text-dark-400 text-sm mb-6">Select a property to run simulations</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p) => {
              const isSelected = selectedProperty?.id === p.id;
              const img =
                p.images && p.images.length > 0
                  ? p.images[0]
                  : "/placeholder-property.jpg";
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProperty(isSelected ? null : p)}
                  className={`text-left rounded-xl overflow-hidden border transition-all ${
                    isSelected
                      ? "border-gold-400 ring-1 ring-gold-400/30"
                      : "border-dark-700 hover:border-dark-500"
                  }`}
                >
                  <div className="relative h-36">
                    <img
                      src={img}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-gold-400/10 flex items-center justify-center">
                        <span className="bg-gold-400 text-dark-900 text-xs font-bold px-3 py-1 rounded-full">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-dark-800">
                    <h3 className="text-sm font-medium text-white truncate">{p.title}</h3>
                    <p className="text-xs text-dark-400 truncate">{p.address}</p>
                    <p className="text-sm text-gold-400 mt-1 font-medium">
                      {formatPrice(p.price)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulator */}
        {selectedProperty ? (
          <div className="border-t border-dark-700 pt-10">
            <Simulator
              address={selectedProperty.address}
              price={selectedProperty.price}
            />
          </div>
        ) : (
          <div className="border-t border-dark-700 pt-10 text-center py-20">
            <div className="text-dark-500 text-6xl mb-4">📊</div>
            <p className="text-dark-400">Select a property above to start the simulator</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
