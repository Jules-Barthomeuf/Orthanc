"use client";

import { useState } from "react";
import { Property } from "@/types";
import { ProvenancePanel } from "./ProvenancePanel";
import { TechnicalPanel } from "./TechnicalPanel";
import { MarketInsightPanel } from "./MarketInsightPanel";
import { InvestmentPanel } from "./InvestmentPanel";

const PILLARS = [
  {
    id: "provenance",
    title: "Provenance & Legal",
    icon: "⚖️",
    description: "Ownership history and legal framework",
  },
  {
    id: "technical",
    title: "Technical & Structural",
    icon: "🏗️",
    description: "Property files and maintenance",
  },
  {
    id: "market",
    title: "Market Insight",
    icon: "📊",
    description: "Local knowledge and economics",
  },
  {
    id: "investment",
    title: "Investment & Tax",
    icon: "💰",
    description: "Simulations and predictions",
  },
];

interface PropertyVaultProps {
  property: Property;
}

export function PropertyVault({ property }: PropertyVaultProps) {
  const [activePillar, setActivePillar] = useState("provenance");

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Property Header */}
        <div className="mb-12">
          <div className="relative h-96 rounded-lg overflow-hidden mb-6">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
              <p className="text-gold-400 text-lg mb-4">{property.address}</p>
              <div className="flex gap-6">
                <div>
                  <span className="text-gray-400">Price</span>
                  <p className="text-3xl font-bold gradient-text">
                    ${(property.price / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Property Stats</span>
                  <p className="text-xl text-gray-300">
                    {property.bedroom}bd • {property.bathroom}ba • {property.squareFeet.toLocaleString()} sqft
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Truth Pillars Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {PILLARS.map((pillar) => (
            <button
              key={pillar.id}
              onClick={() => setActivePillar(pillar.id)}
              className={`p-4 rounded-lg border transition-all text-left ${
                activePillar === pillar.id
                  ? "luxury-card border-gold-500 bg-dark-700"
                  : "luxury-card border-gold-900 hover:border-gold-700"
              }`}
            >
              <div className="text-3xl mb-2">{pillar.icon}</div>
              <h3 className="font-semibold mb-1">{pillar.title}</h3>
              <p className="text-xs text-gray-400">{pillar.description}</p>
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="luxury-card">
          {activePillar === "provenance" && (
            <ProvenancePanel property={property} />
          )}
          {activePillar === "technical" && (
            <TechnicalPanel property={property} />
          )}
          {activePillar === "market" && (
            <MarketInsightPanel property={property} />
          )}
          {activePillar === "investment" && (
            <InvestmentPanel property={property} />
          )}
        </div>
      </div>
    </div>
  );
}
