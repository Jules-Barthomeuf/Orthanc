"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { PropertyVault } from "@/components/client/PropertyVault";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Property } from "@/types";

interface VaultPageProps {
  params: Promise<{ id: string }>;
}

export default function VaultPage({ params }: VaultPageProps) {
  const { id } = React.use(params);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Orthanc - Vault';
    (async () => {
      try {
        const res = await fetch("/api/properties");
        if (!res.ok) return;
        const all: Property[] = await res.json();
        const found = all.find((p) => p.id === id) || null;
        setProperty(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-dark-400 text-sm">Loading property...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="heading-luxury text-2xl text-white mb-4">Property not found</h1>
            <div className="gold-line w-16 mx-auto mb-6"></div>
            <Link href="/client/properties" className="luxury-button-primary">
              Back to Properties
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PropertyVault property={property} />
      <Footer />
    </>
  );
}
