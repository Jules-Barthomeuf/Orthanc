"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { PropertyVault } from "@/components/client/PropertyVault";
import { findPropertyById } from "@/lib/db";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

interface VaultPageProps {
  params: { id: string };
}

export default function VaultPage({ params }: VaultPageProps) {
  const property = findPropertyById(params.id);

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Property not found</h1>
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
