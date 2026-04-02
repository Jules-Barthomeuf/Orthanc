"use client";

import { useState } from "react";
import { Property } from "@/types";
import { ProvenancePanel } from "./ProvenancePanel";
import { TechnicalPanel } from "./TechnicalPanel";
import { MarketInsightPanel } from "./MarketInsightPanel";
import { InvestmentAdvisorPanel } from "./InvestmentAdvisorPanel";
import { OverviewPanel } from "./OverviewPanel";
import { LeaseAnalysisPanel } from "./LeaseAnalysisPanel";
import Simulator from "./Simulator";

const TABS = [
  { id: "overview", title: "Overview" },
  { id: "market", title: "Market Insights" },
  { id: "technical", title: "Technical" },
  { id: "lease", title: "Lease Analysis" },
  { id: "provenance", title: "Provenance & Legal" },
  { id: "advisor", title: "Investment Advisor" },
];

interface PropertyVaultProps {
  property: Property;
}

export function PropertyVault({ property }: PropertyVaultProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeThumb, setActiveThumb] = useState(0);
  const [showSimulator, setShowSimulator] = useState(false);
  const images = property.images || [];

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Hero: Map + Thumbnails ── */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-3">
          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-dark-600/20" style={{ height: 420 }}>
            <iframe
              title="Property Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address || "")}&hl=en&z=16&ie=UTF8&iwloc=B&output=embed`}
            />
          </div>
          {/* Thumbnail column */}
          {images.length > 0 && (
            <div className="hidden lg:flex flex-col gap-2">
              {images.slice(0, 3).map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`rounded-lg overflow-hidden border-2 transition-colors flex-1 min-h-0 ${
                    activeThumb === i ? "border-gold-400" : "border-transparent hover:border-gold-400/30"
                  }`}
                >
                  <img src={img} alt={`${property.title} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Property Info Row ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl text-white mb-1 tracking-tight">{property.title}</h1>
            <p className="text-dark-400 text-sm">
              {property.squareFeet ? `${property.squareFeet.toLocaleString("en-US")} sqft` : ""}
              {property.squareFeet && property.bedroom ? " · " : ""}
              {property.bedroom ? `${property.bedroom}bd` : ""}
              {property.bathroom ? ` · ${property.bathroom}ba` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-dark-500 text-xs uppercase tracking-wider mb-1">Price</p>
            <p className="font-display text-3xl lg:text-4xl text-gold-400 font-bold">
              ${property.price >= 1000000
                ? `${(property.price / 1000000).toFixed(2)}M`
                : property.price.toLocaleString("en-US")}
            </p>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => setShowSimulator(true)}
            className="luxury-button-primary text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            View Full Simulator
          </button>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-0 border-b border-dark-600/30 mb-10 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-5 py-4 text-sm tracking-wide transition-colors focus:outline-none group whitespace-nowrap"
            >
              <span
                className={`transition-colors duration-300 ${
                  activeTab === tab.id
                    ? "text-white font-medium"
                    : "text-dark-500 group-hover:text-dark-300"
                }`}
              >
                {tab.title}
              </span>
              <span
                className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gold-400 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                  activeTab === tab.id ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Panel Content ── */}
      <div className="max-w-7xl mx-auto px-6 overflow-hidden">
        {activeTab === "overview" && <OverviewPanel property={property} />}
        {activeTab === "lease" && <LeaseAnalysisPanel property={property} />}
        {activeTab === "provenance" && <ProvenancePanel property={property} />}
        {activeTab === "technical" && <TechnicalPanel property={property} />}
        {activeTab === "market" && <MarketInsightPanel property={property} />}
        {activeTab === "advisor" && <InvestmentAdvisorPanel property={property} />}
      </div>

      {/* ── Simulator Modal ── */}
      {showSimulator && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSimulator(false)}
          />
          {/* Modal */}
          <div className="relative w-full max-w-[1400px] max-h-[92vh] mt-[4vh] mx-4 bg-dark-900 border border-gold-400/10 rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <h2 className="font-display text-lg text-white">Financial Simulator</h2>
                <span className="text-dark-500 text-sm">— {property.title}</span>
              </div>
              <button
                onClick={() => setShowSimulator(false)}
                className="w-8 h-8 rounded-full border border-dark-600/30 flex items-center justify-center text-dark-400 hover:text-white hover:border-dark-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Simulator content */}
            <div className="flex-1 overflow-y-auto p-6">
              <Simulator address={property.address} price={property.price} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
