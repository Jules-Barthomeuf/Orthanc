"use client";

import { Property } from "@/types";

interface ProvenancePanelProps {
  property: Property;
}

export function ProvenancePanel({ property }: ProvenancePanelProps) {
  return (
    <div className="space-y-10">
      {/* Coming Soon Banner */}
      <div className="bg-gold-400/10 border border-gold-400/30 rounded-xl px-6 py-4 text-center">
        <span className="text-gold-400 font-display text-lg tracking-widest uppercase">Coming Soon</span>
      </div>

      {/* Intro */}
      <div>
        <h2 className="heading-luxury text-3xl text-white mb-2">
          Provenance &amp; Legal Foundation
        </h2>
        <div className="gold-line-left w-20 mb-6"></div>
        <p className="text-white/80 text-base leading-relaxed max-w-3xl">
          The status quo for luxury property data is fragmented and unreliable. Paper files,
          unrecorded verbal history, and siloed legal records create an information gap that
          slows down closings and creates post-offer regret. Orthanc is building the
          infrastructure to fix this by turning a property&apos;s physical and legal history
          into a permanent, auditable record.
        </p>
      </div>

      {/* The Truth Standard */}
      <div className="bg-dark-900 border border-gold-400/10 rounded-xl p-6">
        <h3 className="font-display text-xl text-white mb-3">The Truth Standard</h3>
        <p className="text-white/80 text-base leading-relaxed">
          We are developing a secure vault for the property&apos;s DNA. This includes a
          complete chain of title, permit history, sea wall surveys, and zoning
          determinations. Instead of hunting through county records or relying on memory,
          every stakeholder accesses a single source of truth. This record is tamper-proof,
          meaning the history of the house cannot be edited or faked by third parties.
        </p>
      </div>

      {/* Verified Property DNA */}
      <div>
        <h3 className="font-display text-xl text-white mb-4">Verified Property DNA</h3>
        <p className="text-white/70 text-base mb-5">
          Our platform unifies the nouns of the building with the verbs of the deal. We index:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-900 border border-gold-400/10 rounded-xl p-5">
            <h4 className="text-gold-400 text-base font-semibold mb-2">Structural Integrity</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Documented history of renovations and technical inspections.
            </p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-xl p-5">
            <h4 className="text-gold-400 text-base font-semibold mb-2">Legal Standing</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Clear verification of easements, dockage rights, and title status.
            </p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-xl p-5">
            <h4 className="text-gold-400 text-base font-semibold mb-2">Environmental Data</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Precise mapping of flood zones and elevation certificates.
            </p>
          </div>
        </div>
      </div>

      {/* Zero-Knowledge Privacy */}
      <div className="bg-dark-900 border border-gold-400/10 rounded-xl p-6">
        <h3 className="font-display text-xl text-white mb-3">Zero-Knowledge Privacy</h3>
        <p className="text-white/80 text-base leading-relaxed">
          Your proprietary market knowledge is your most valuable asset. Orthanc is built on the
          principle of data sovereignty. Your team&apos;s &ldquo;secret&rdquo; intelligence
          remains yours. Our security architecture ensures that while the property data is
          auditable and transparent for the buyer, your firm&apos;s specific strategy and
          private notes are never leaked to the public market.
        </p>
      </div>

      {/* Audit Trail */}
      <div className="bg-dark-900 border border-gold-400/10 rounded-xl p-6">
        <h3 className="font-display text-xl text-white mb-3">Audit Trail</h3>
        <p className="text-white/80 text-base leading-relaxed">
          Every simulation and data entry creates a transparent record. When the wire is sent,
          the buyer has total certainty because they have seen the full picture. We provide a
          tamper-proof ledger of the due diligence process. This protects the agent from
          liability and ensures the buyer can move forward with mathematical confidence.
        </p>
      </div>

      {/* Property Snapshot */}
      <div>
        <h3 className="font-display text-lg text-white mb-4">Property Snapshot</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900 border border-gold-400/10 rounded-xl p-5 text-center">
            <span className="label-luxury text-dark-500 text-[10px] block mb-1">Bathrooms</span>
            <p className="font-display text-2xl text-white">{property.bathroom}</p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-xl p-5 text-center">
            <span className="label-luxury text-dark-500 text-[10px] block mb-1">Square Feet</span>
            <p className="font-display text-2xl text-white">
              {(property.squareFeet ?? 0).toLocaleString("en-US")} sqft
            </p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-xl p-5 text-center">
            <span className="label-luxury text-dark-500 text-[10px] block mb-1">Year Built</span>
            <p className="font-display text-2xl text-white">{property.yearBuilt}</p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-xl p-5 text-center">
            <span className="label-luxury text-dark-500 text-[10px] block mb-1">Lot (acres)</span>
            <p className="font-display text-2xl text-white">{property.lot}</p>
          </div>
        </div>
        <p className="text-white/70 text-base mt-4">{property.address}</p>
      </div>

      {/* Ownership History (if available) */}
      {property.ownershipHistory?.length > 0 && (
        <div>
          <h3 className="font-display text-lg text-white mb-4">Chain of Title</h3>
          <div className="space-y-5">
            {property.ownershipHistory.map((record) => (
              <div key={record.id} className="border-l-2 border-gold-400/30 pl-5">
                <div className="flex justify-between mb-2">
                  <h4 className="font-semibold text-white">{record.owner}</h4>
                  <span className="text-dark-400 text-sm">
                    {new Date(record.purchaseDate).getFullYear()} –{" "}
                    {new Date(record.saleDate).getFullYear()}
                  </span>
                </div>
                <p className="text-white/70 text-base mb-3">{record.reason}</p>
                <div className="flex gap-8 text-sm">
                  <div>
                    <span className="label-luxury text-dark-500 text-[10px]">Purchase</span>
                    <p className="text-white font-medium">
                      ${(record.purchasePrice / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <span className="label-luxury text-dark-500 text-[10px]">Sale</span>
                    <p className="text-white font-medium">
                      ${(record.salePrice / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <span className="label-luxury text-dark-500 text-[10px]">Appreciation</span>
                    <p className="text-green-400 font-medium">
                      +
                      {(
                        ((record.salePrice - record.purchasePrice) / record.purchasePrice) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
