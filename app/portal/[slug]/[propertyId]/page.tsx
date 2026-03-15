"use client";

import { Footer } from "@/components/common/Footer";
import { PropertyVault } from "@/components/client/PropertyVault";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Property } from "@/types";

interface Portal {
  id: string;
  name: string;
  slug: string;
  propertyIds: string[];
}

interface PortalVaultPageProps {
  params: Promise<{ slug: string; propertyId: string }>;
}

export default function PortalVaultPage({ params }: PortalVaultPageProps) {
  const { slug, propertyId } = React.use(params);
  const [portal, setPortal] = useState<Portal | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch portal
        const portalRes = await fetch(`/api/portals?slug=${encodeURIComponent(slug)}`);
        if (!portalRes.ok) return;
        const portalData: Portal = await portalRes.json();
        setPortal(portalData);

        // Verify property belongs to portal
        if (!portalData.propertyIds.includes(propertyId)) return;

        // Fetch properties
        const propsRes = await fetch("/api/properties");
        if (!propsRes.ok) return;
        const all: Property[] = await propsRes.json();
        const found = all.find((p) => p.id === propertyId) || null;
        setProperty(found);

        if (found && typeof document !== "undefined") {
          document.title = `${found.title} - ${portalData.name} - Orthanc`;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400 text-sm">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property || !portal) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-luxury text-2xl text-white mb-4">Property not found</h1>
          <div className="gold-line w-16 mx-auto mb-6" />
          <Link href={`/portal/${slug}`} className="luxury-button-primary text-sm">
            Back to Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Minimal nav with back-to-portal link */}
      <nav className="fixed top-0 w-full bg-dark-900/95 backdrop-blur-md border-b border-gold-400/10 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/portal/${slug}`} className="flex items-center gap-3">
              <img src="/logo.svg" alt="Orthanc" className="h-10 w-auto" />
              <span className="text-dark-400 text-xs">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline mr-1">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {portal.name}
              </span>
            </Link>
            <span className="text-dark-400 text-xs tracking-widest uppercase">Property Vault</span>
          </div>
        </div>
      </nav>

      <PropertyVault property={property} />
      <Footer />
    </>
  );
}
