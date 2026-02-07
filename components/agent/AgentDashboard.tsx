"use client";

import { useState } from "react";
import { Property } from "@/types";
import { mockProperties, findPropertiesByAgentId } from "@/lib/db";
import Link from "next/link";

export function AgentDashboard() {
  const agentId = "agent-1"; // Mock current user
  const properties = findPropertiesByAgentId(agentId);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Your Properties
            </h1>
            <p className="text-gray-400">Manage your listings and reach qualified buyers</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="luxury-button-primary"
          >
            + Upload Property
          </button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {properties.map((property) => (
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
                href={`/agent/properties/${property.id}`}
                className="luxury-button-secondary block text-center w-full"
              >
                Edit & Share
              </Link>
            </div>
          ))}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="luxury-card max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">Upload New Property</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gold-400 hover:text-gold-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-400 mb-4">
                  Our AI chatbot will guide you through the property details. Let's get started!
                </p>

                <div className="bg-dark-700 border border-gold-800 rounded-lg p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Property Assistant</h3>
                    <p className="text-gray-400 mb-4">
                      Hi! I'm here to help you upload your property in under 1 minute.
                    </p>
                    <div className="space-y-3 text-left bg-dark-800 p-4 rounded-lg mb-4">
                      <p className="text-gray-300">
                        <span className="text-gold-400">📍</span> Provide an address or brief description and our AI will draft the property listing.
                      </p>
                      <input
                        type="text"
                        placeholder="Enter address or description..."
                        className="luxury-input w-full"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                      />
                    </div>
                    <div>
                      <button
                        className="luxury-button-primary w-full"
                        onClick={async () => {
                          if (!aiQuery) return;
                          setAiLoading(true);
                          try {
                            const res = await fetch('/api/ai', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ prompt: aiQuery, agentId }),
                            });
                            const data = await res.json();
                            setAiResponse(data);
                          } catch (err) {
                            setAiResponse({ error: 'AI request failed' });
                          } finally {
                            setAiLoading(false);
                          }
                        }}
                      >
                        {aiLoading ? 'Generating...' : 'Continue with AI'}
                      </button>
                    </div>

                    {/* AI Response Preview */}
                    {aiResponse && (
                      <div className="mt-4 bg-dark-800 p-4 rounded-lg border border-gold-800">
                        {aiResponse.error ? (
                          <p className="text-red-400">{aiResponse.error}</p>
                        ) : (
                          <div>
                            <h4 className="font-semibold mb-2">Suggested Listing</h4>
                            <p className="text-gray-300 text-sm mb-2">{aiResponse.title}</p>
                            <p className="text-gray-400 text-sm mb-2">{aiResponse.address}</p>
                            <p className="text-gray-400 text-sm mb-4">${(aiResponse.price || 0).toLocaleString()}</p>
                            <button
                              className="luxury-button-primary w-full mb-2"
                              onClick={async () => {
                                setCreating(true);
                                try {
                                  await fetch('/api/properties', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ...aiResponse, agentId }),
                                  });
                                  // Refresh the page to show new property (simple approach)
                                  window.location.reload();
                                } catch (err) {
                                  console.error(err);
                                  setCreating(false);
                                }
                              }}
                            >
                              {creating ? 'Creating...' : 'Create Property from AI'}
                            </button>
                            <button className="luxury-button-secondary w-full" onClick={() => setAiResponse(null)}>
                              Edit Manually
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowUploadModal(false)}
                  className="luxury-button-secondary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
