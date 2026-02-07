"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { mockProperties } from "@/lib/db";
import Link from "next/link";
import { useEffect } from "react";

export default function ClientPropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "client") {
      router.push("/login");
    }
  }, [user, router]);

  if (!user || user.role !== "client") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Available Properties
            </h1>
            <p className="text-gray-400">
              Explore luxury properties selected by top agents
            </p>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProperties.map((property) => (
              <div key={property.id} className="luxury-card group">
                <div className="relative mb-4 overflow-hidden rounded-lg h-48 bg-dark-700">
                  {property.images[0] && (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-gold-600 text-black px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{property.address}</p>

                <div className="flex justify-between mb-4 text-sm">
                  <span className="text-gold-400 font-semibold">
                    ${(property.price / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-gray-400">
                    {property.bedroom}bd • {property.bathroom}ba
                  </span>
                </div>

                <Link
                  href={`/client/vault/${property.id}`}
                  className="luxury-button-primary block text-center w-full"
                >
                  View Vault
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
