"use client";

import { Property } from "@/types";
import { useState } from "react";

interface TechnicalPanelProps {
  property: Property;
}

export function TechnicalPanel({ property }: TechnicalPanelProps) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-2xl font-bold gradient-text mb-6">
        Technical & Structural Analysis
      </h2>

      {/* Documents */}
      <div className="mb-8">
        <h3 className="font-semibold text-gold-400 mb-4">📄 Property Documents</h3>
        {property.documents.length > 0 ? (
          <div className="space-y-3 mb-6">
            {property.documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gold-800 rounded-lg p-4 hover:border-gold-600 transition cursor-pointer"
                onClick={() =>
                  setExpandedDoc(expandedDoc === doc.id ? null : doc.id)
                }
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold mb-1">{doc.name}</h4>
                    <p className="text-sm text-gray-400">
                      {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                    </p>
                  </div>
                  <span className="text-gold-400">
                    {expandedDoc === doc.id ? "−" : "+"}
                  </span>
                </div>

                {expandedDoc === doc.id && (
                  <div className="mt-4 pt-4 border-t border-gold-800">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {doc.analysis}
                    </p>
                    <button className="mt-3 text-gold-400 text-sm hover:text-gold-300">
                      📥 Download Document
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 mb-6">No documents uploaded yet.</p>
        )}
      </div>

      {/* AI Assistant */}
      <div className="bg-dark-700 border border-gold-800 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gold-400 mb-4">🤖 AI Analyst Assistant</h3>
        <p className="text-gray-400 text-sm mb-4">
          Ask our dedicated AI analyst any questions about the property. It stays by your
          side to ensure you don't miss anything important.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about foundations, repairs, renovations..."
            className="luxury-input flex-1"
          />
          <button className="luxury-button-primary">Ask</button>
        </div>
        <div className="mt-4 bg-dark-800 rounded p-3 text-sm text-gray-400">
          <p className="mb-2">
            <span className="text-gold-400">AI:</span> This property has excellent
            structural integrity based on the recent inspection report. The HVAC system was
            upgraded in 2023, and the roof is in good condition. I'd recommend budgeting for
            pool equipment maintenance this year.
          </p>
        </div>
      </div>

      {/* Maintenance History */}
      <div>
        <h3 className="font-semibold text-gold-400 mb-4">🔧 Maintenance History</h3>
        {property.maintenanceHistory.length > 0 ? (
          <div className="space-y-3">
            {property.maintenanceHistory.map((record) => (
              <div
                key={record.id}
                className="flex justify-between items-start p-3 bg-dark-700 rounded-lg border border-gold-800"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm">{record.description}</p>
                  <p className="text-xs text-gray-5 mt-1">{record.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-gold-400 font-semibold">
                    ${record.cost.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No maintenance history available.</p>
        )}
      </div>
    </div>
  );
}
