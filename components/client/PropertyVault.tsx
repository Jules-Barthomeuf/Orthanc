"use client";

import { useState } from "react";
import { Property } from "@/types";
import { ProvenancePanel } from "./ProvenancePanel";
import { TechnicalPanel } from "./TechnicalPanel";
import { MarketInsightPanel } from "./MarketInsightPanel";
import { InvestmentAdvisorPanel } from "./InvestmentAdvisorPanel";
import { OverviewPanel } from "./OverviewPanel";
import Simulator from "./Simulator";

const TABS = [
  { id: "overview", title: "Overview" },
  { id: "simulator", title: "Simulator" },
  { id: "provenance", title: "Provenance & Legal" },
  { id: "technical", title: "Technical & Structural" },
  { id: "market", title: "Market Insights" },
  { id: "advisor", title: "Investment Advisor" },
];

interface PropertyVaultProps {
  property: Property;
}

export function PropertyVault({ property }: PropertyVaultProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [imgIdx, setImgIdx] = useState(0);
  const images = property.images || [];
  const prevImg = () => setImgIdx((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setImgIdx((i) => (i + 1) % images.length);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Property Hero — split layout */}
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Property Info */}
            <div className="flex flex-col justify-end">
              <p className="label-luxury text-gold-400 mb-3">Single-Family</p>
              <h1 className="font-display text-5xl lg:text-6xl text-white mb-3 tracking-tight">{property.title}</h1>
              <p className="text-dark-300 text-lg mb-6">{property.address}</p>
              <div className="flex gap-10">
                <div>
                  <span className="label-luxury text-dark-400 text-[10px]">Price</span>
                  <p className="font-display text-3xl font-bold text-gold-400">
                    ${(property.price / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div>
                  <span className="label-luxury text-dark-400 text-[10px]">Details</span>
                  <p className="text-xl text-dark-200">
                    {property.bedroom}bd · {property.bathroom}ba · {property.squareFeet.toLocaleString('en-US')} sqft
                  </p>
                </div>
              </div>
            </div>
            {/* Right: Single Image with Arrows */}
            <div className="relative h-80 lg:h-96 rounded-lg overflow-hidden group">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[imgIdx]}
                    alt={`${property.title} ${imgIdx + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImg}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-900/70 hover:bg-dark-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextImg}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-900/70 hover:bg-dark-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => setImgIdx(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? "bg-gold-400" : "bg-white/40 hover:bg-white/70"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-dark-800 flex items-center justify-center">
                  <p className="text-dark-500 text-sm">No image available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="flex gap-0 border-b border-dark-600/30 mb-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-6 py-4 text-sm tracking-wide transition-colors focus:outline-none group"
            >
              <span
                className={`transition-colors duration-300 ${
                  activeTab === tab.id
                    ? "text-gold-400"
                    : "text-dark-500 group-hover:text-dark-300"
                }`}
              >
                {tab.title}
              </span>
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gold-400 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                  activeTab === tab.id
                    ? "w-full opacity-100"
                    : "w-0 opacity-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Panel Content */}
      <div className="max-w-7xl mx-auto px-6 overflow-hidden">
        {activeTab === "overview" ? (
          <div className="flex gap-8">
            <div className="flex-1 min-w-0">
              <OverviewPanel property={property} />
            </div>
            <div className="hidden lg:block w-96 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-5">
                  <h3 className="label-luxury text-dark-300 mb-2">Location</h3>
                  <p className="text-dark-400 text-xs mb-4">{property.address}</p>
                  <div className="rounded-lg overflow-hidden border border-gold-400/10" style={{ height: 480 }}>
                    <iframe
                      title="Property Location"
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(1.1) contrast(1.1)" }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address || '')}&hl=en&z=15&ie=UTF8&iwloc=B&output=embed`}
                    />
                  </div>
                </div>
                <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-5 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-dark-500 text-xs uppercase tracking-wider">Price</span>
                    <span className="font-display text-gold-400 font-bold">${(property.price / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-500 text-xs uppercase tracking-wider">Cap Rate</span>
                    <span className="text-white text-sm">{property.investmentAnalysis?.capRate ? `${property.investmentAnalysis.capRate}%` : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-500 text-xs uppercase tracking-wider">Year Built</span>
                    <span className="text-white text-sm">{property.yearBuilt}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {activeTab === "simulator" && <Simulator address={property.address} price={property.price} />}
            {activeTab === "provenance" && <ProvenancePanel property={property} />}
            {activeTab === "technical" && <TechnicalPanel property={property} />}
            {activeTab === "market" && <MarketInsightPanel property={property} />}
            {activeTab === "advisor" && <InvestmentAdvisorPanel property={property} />}
          </div>
        )}
      </div>
    </div>
  );
}
