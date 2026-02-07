"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { findPropertyById, mockAgents } from "@/lib/db";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Property } from "@/types";

interface PropertyPageProps {
  params: { id: string };
}

export default function PropertyEditPage({ params }: PropertyPageProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const property = findPropertyById(params.id);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    if (!user || user.role !== "agent") {
      router.push("/login");
    }
    if (property) {
      setShareLink(`${window.location.origin}/client/vault/${property.id}`);
    }
  }, [user, router, property]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user || user.role !== "agent") {
    return null;
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Property not found</h1>
            <Link href="/agent/dashboard" className="luxury-button-primary">
              Back to Dashboard
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
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <Link href="/agent/dashboard" className="text-gold-400 hover:text-gold-300 mb-4 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
              <p className="text-gray-400">{property.address}</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Property Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Image */}
              <div className="luxury-card p-0 overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-96 object-cover"
                />
              </div>

              {/* Property Details */}
              <div className="luxury-card">
                <h2 className="text-2xl font-bold mb-6">Property Details</h2>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-500 text-sm">Price</p>
                    <p className="text-2xl font-bold text-gold-400">
                      ${(property.price / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Year Built</p>
                    <p className="text-2xl font-bold">{property.yearBuilt}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Bedrooms</p>
                    <p className="text-2xl font-bold">{property.bedroom}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Bathrooms</p>
                    <p className="text-2xl font-bold">{property.bathroom}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Square Feet</p>
                    <p className="text-2xl font-bold">
                      {property.squareFeet.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Lot Size</p>
                    <p className="text-2xl font-bold">{property.lot} acres</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gold-800">
                  <p className="text-gray-500 text-sm mb-3">Description</p>
                  <p className="text-gray-300">{property.description}</p>
                </div>
              </div>

              {/* Documents Section */}
              <div className="luxury-card">
                <h2 className="text-2xl font-bold mb-6">Documents</h2>
                {property.documents.length > 0 ? (
                  <div className="space-y-3">
                    {property.documents.map((doc) => (
                      <div key={doc.id} className="flex justify-between items-start p-4 bg-dark-700 rounded-lg border border-gold-800">
                        <div>
                          <p className="font-semibold">{doc.name}</p>
                          <p className="text-sm text-gray-400">
                            {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                          </p>
                        </div>
                        <button className="text-gold-400 hover:text-gold-300">
                          ✓ Uploaded
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No documents uploaded yet.</p>
                )}
              </div>

              {/* Maintenance History */}
              <div className="luxury-card">
                <h2 className="text-2xl font-bold mb-6">Maintenance History</h2>
                {property.maintenanceHistory.length > 0 ? (
                  <div className="space-y-3">
                    {property.maintenanceHistory.map((record) => (
                      <div key={record.id} className="flex justify-between items-start p-4 bg-dark-700 rounded-lg border border-gold-800">
                        <div>
                          <p className="font-semibold">{record.description}</p>
                          <p className="text-sm text-gray-400">{record.category}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gold-400 font-semibold">
                          ${record.cost.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No maintenance records yet.</p>
                )}
              </div>
            </div>

            {/* Right Column - Sharing & Actions */}
            <div className="space-y-6">
              {/* Share Link Card */}
              <div className="luxury-card sticky top-24">
                <h2 className="text-xl font-bold mb-4">Share with Clients</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Generate a secure link to share this property vault with interested clients.
                </p>
                
                <div className="bg-dark-700 border border-gold-800 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">SECURE LINK</p>
                  <p className="text-sm text-gold-400 break-all font-mono">
                    {shareLink}
                  </p>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="luxury-button-primary w-full mb-3"
                >
                  {copied ? "✓ Copied!" : "Copy Link"}
                </button>

                <div className="space-y-2 text-sm text-gray-400">
                  <p className="flex gap-2">
                    <span className="text-gold-400">✓</span>
                    <span>Secure & encrypted</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-gold-400">✓</span>
                    <span>No login required</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-gold-400">✓</span>
                    <span>View analytics</span>
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="luxury-card">
                <h2 className="text-xl font-bold mb-4">Investment Metrics</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">CURRENT VALUE</p>
                    <p className="text-2xl font-bold text-gold-400">
                      ${(property.investmentAnalysis.currentValue / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">5-YEAR PROJECTION</p>
                    <p className="text-lg font-bold text-green-400">
                      ${(property.investmentAnalysis.projectedValue5Year / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      +
                      {(
                        ((property.investmentAnalysis.projectedValue5Year -
                          property.price) /
                          property.price) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">CAP RATE</p>
                    <p className="text-xl font-bold">
                      {property.investmentAnalysis.capRate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Agent Info */}
              <div className="luxury-card">
                <h2 className="text-xl font-bold mb-4">Your Profile</h2>
                {mockAgents[0] && (
                  <div className="space-y-3">
                    <div>
                      <img
                        src={mockAgents[0].profileImage}
                        alt={mockAgents[0].name}
                        className="w-16 h-16 rounded-full border-2 border-gold-500 mb-3"
                      />
                      <p className="font-semibold">{mockAgents[0].name}</p>
                      <p className="text-sm text-gold-400">{mockAgents[0].phone}</p>
                    </div>
                    <p className="text-sm text-gray-400 border-t border-gold-800 pt-3">
                      {mockAgents[0].marketKnowledge}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
