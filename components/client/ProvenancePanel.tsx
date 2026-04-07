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
    </div>
  );
}
