"use client";

import { PortalSidebar } from "@/components/common/PortalSidebar";
import { FeedbackOverlay } from "@/components/client/FeedbackOverlay";
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
        const portalRes = await fetch(`/api/portals?slug=${encodeURIComponent(slug)}`);
        if (!portalRes.ok) return;
        const portalData: Portal = await portalRes.json();
        setPortal(portalData);
        if (!portalData.propertyIds.includes(propertyId)) return;
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
          <p className="text-dark-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!property || !portal) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Property Not Found</h1>
          <div className="gold-line mx-auto mb-6" />
          <Link href={`/portal/${slug}`} className="luxury-button-primary text-sm">Back to Properties</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <FeedbackOverlay itemId={propertyId} itemType="property" />
      <PortalSidebar slug={slug} portalName={portal.name} />
      <main className="pt-20">
        <PropertyVault property={property} portalSlug={slug} />
      </main>
    </div>
  );
}
