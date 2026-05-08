"use client";

import { Property } from "@/types";

interface OverviewPanelProps {
  property: Property;
}

export function OverviewPanel({ property }: OverviewPanelProps) {
  const encodedAddress = encodeURIComponent(property.address);

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-dark-800 border border-dark-700/50 rounded-lg p-8">
        <h2 className="font-sans text-xl text-white mb-2">About this Property</h2>
        <div className="gold-line-left w-20 mb-6"></div>
        <p className="text-white/80 leading-relaxed text-base">
          {property.description}
        </p>
      </div>

      {/* Key Details Grid */}
      <div className="bg-dark-800 border border-dark-700/50 rounded-lg p-8">
        <h3 className="font-sans text-xl text-white mb-6">Property Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-dark-900 border border-dark-700/50 rounded-lg p-5">
            <p className="label-luxury text-dark-400 text-xs mb-2">Bedrooms</p>
            <p className="font-sans text-3xl text-white">{property.bedroom}</p>
          </div>
          <div className="bg-dark-900 border border-dark-700/50 rounded-lg p-5">
            <p className="label-luxury text-dark-400 text-xs mb-2">Bathrooms</p>
            <p className="font-sans text-3xl text-white">{property.bathroom}</p>
          </div>
          <div className="bg-dark-900 border border-dark-700/50 rounded-lg p-5">
            <p className="label-luxury text-dark-400 text-xs mb-2">Living Area</p>
            <p className="font-sans text-3xl text-white">{property.squareFeet?.toLocaleString('en-US')}<span className="text-dark-400 text-sm ml-1">sqft</span></p>
          </div>
          <div className="bg-dark-900 border border-dark-700/50 rounded-lg p-5">
            <p className="label-luxury text-dark-400 text-xs mb-2">Year Built</p>
            <p className="font-sans text-3xl text-white">{property.yearBuilt}</p>
          </div>
          <div className="bg-dark-900 border border-dark-700/50 rounded-lg p-5">
            <p className="label-luxury text-dark-400 text-xs mb-2">Lot Size</p>
            <p className="font-sans text-3xl text-white">{property.lot}<span className="text-dark-400 text-sm ml-1">acres</span></p>
          </div>
          <div className="bg-dark-900 border border-dark-700/50 rounded-lg p-5">
            <p className="label-luxury text-dark-400 text-xs mb-2">Price / sqft</p>
            <p className="font-sans text-3xl text-gold-400">
              ${property.squareFeet ? Math.round(property.price / property.squareFeet).toLocaleString('en-US') : "—"}
            </p>
          </div>
        </div>

      </div>

      {/* Neighborhood & Market Summary */}
      <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-8">
        <h3 className="font-display text-xl text-white mb-6">Neighborhood & Market</h3>
        <div className="space-y-0">
          <div className="property-row">
            <span className="property-label">Neighborhood Vibe</span>
            <span className="property-value">{property.marketData?.neighborhoodVibe || "Premium residential area"}</span>
          </div>
          <div className="property-row">
            <span className="property-label">Zoning</span>
            <span className="property-value">{property.marketData?.zoningInfo || "Residential"}</span>
          </div>
          <div className="property-row">
            <span className="property-label">Economic Outlook</span>
            <span className="property-value">{property.marketData?.economicOutlook || "Positive growth trends"}</span>
          </div>
          {property.marketData?.attractions && property.marketData.attractions.length > 0 && (
            <div className="property-row">
              <span className="property-label">Nearby Attractions</span>
              <span className="property-value">{property.marketData.attractions.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Investment Snapshot */}
      <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-8">
        <h3 className="font-display text-xl text-white mb-6">Investment Snapshot</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-5 text-center">
            <p className="label-luxury text-dark-400 text-xs mb-2">Current Value</p>
            <p className="font-display text-2xl text-gold-400">
              ${((property.investmentAnalysis?.currentValue || property.price) / 1_000_000).toFixed(2)}M
            </p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-5 text-center">
            <p className="label-luxury text-dark-400 text-xs mb-2">5-Year Projection</p>
            <p className="font-display text-2xl text-gold-400">
              ${((property.investmentAnalysis?.projectedValue5Year || property.price) / 1_000_000).toFixed(2)}M
            </p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-5 text-center">
            <p className="label-luxury text-dark-400 text-xs mb-2">Cap Rate</p>
            <p className="font-display text-2xl text-white">
              {property.investmentAnalysis?.capRate ? `${property.investmentAnalysis.capRate}%` : "—"}
            </p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-5 text-center">
            <p className="label-luxury text-dark-400 text-xs mb-2">ROI Projection</p>
            <p className="font-display text-2xl text-white">
              {property.investmentAnalysis?.roiProjection ? `${property.investmentAnalysis.roiProjection}%` : "—"}
            </p>
          </div>
        </div>

        {/* Autres chiffres et métriques avancées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-5 text-center">
            <p className="label-luxury text-dark-400 text-xs mb-2">Initial Investment</p>
            <p className="font-display text-xl text-white">
              {property.investmentAnalysis?.scenarios?.[0]?.downPayment ? `$${property.investmentAnalysis.scenarios[0].downPayment.toLocaleString('en-US')}` : "—"}
            </p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-5 text-center">
            <p className="label-luxury text-dark-400 text-xs mb-2">Annual Opex</p>
            <p className="font-display text-xl text-white">
              {property.annualOpex ? `$${property.annualOpex.toLocaleString('en-US')}` : "—"}
            </p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-5 text-center">
            <p className="label-luxury text-dark-400 text-xs mb-2">Liquidity Score</p>
            <p className="font-display text-xl text-emerald-400">
              {property.liquidityScore ? property.liquidityScore : "—"}
            </p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-5 text-center">
            <p className="label-luxury text-dark-400 text-xs mb-2">Risk Score</p>
            <p className="font-display text-xl text-red-400">
              {property.riskScore ? property.riskScore : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
