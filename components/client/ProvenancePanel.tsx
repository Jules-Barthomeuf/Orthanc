"use client";

import { Property } from "@/types";

interface ProvenancePanelProps {
  property: Property;
}

export function ProvenancePanel({ property }: ProvenancePanelProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold gradient-text mb-6">
        Provenance & Legal Foundation
      </h2>

      {/* Blockchain Hash */}
      <div className="bg-dark-700 border border-gold-800 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gold-400 mb-3">🔐 Immutable Record</h3>
        <p className="text-gray-400 text-sm mb-3">
          This property's history is secured on blockchain for absolute authenticity:
        </p>
        <div className="bg-dark-800 rounded p-3 font-mono text-xs text-gold-400 break-all">
          0x4a5b3c9d2e1f6a7b8c9d0e1f2a3b4c5d6e7f8a9b
        </div>
        <p className="text-gray-500 text-xs mt-2">
          This hash ensures the property's history is immutable and verifiable.
        </p>
      </div>

      {/* Ownership History */}
      <div className="mb-6">
        <h3 className="font-semibold text-gold-400 mb-4">📜 Ownership History</h3>
        <div className="space-y-4">
          {property.ownershipHistory.length > 0 ? (
            property.ownershipHistory.map((record, idx) => (
              <div key={record.id} className="border-l-2 border-gold-700 pl-4">
                <div className="flex justify-between mb-2">
                  <h4 className="font-semibold">{record.owner}</h4>
                  <span className="text-gold-400">
                    {new Date(record.purchaseDate).getFullYear()} -
                    {new Date(record.saleDate).getFullYear()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{record.reason}</p>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Purchase Price</span>
                    <p className="text-gold-400">
                      ${(record.purchasePrice / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Sale Price</span>
                    <p className="text-gold-400">
                      ${(record.salePrice / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Appreciation</span>
                    <p className="text-green-400">
                      +
                      {(
                        ((record.salePrice - record.purchasePrice) /
                          record.purchasePrice) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No ownership history available.</p>
          )}
        </div>
      </div>

      {/* Analysis Note */}
      <div className="bg-gold-900/20 border border-gold-700/50 rounded-lg p-4">
        <p className="text-gray-300 text-sm">
          <span className="text-gold-400 font-semibold">💡 Key Insight:</span> This property
          has maintained consistent owner profiles, suggesting good investment characteristics.
          The current seller's move aligns with typical market patterns for wealth
          diversification.
        </p>
      </div>
    </div>
  );
}
