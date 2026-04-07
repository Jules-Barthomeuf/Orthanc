"use client";

import { Property } from "@/types";

interface LeaseAnalysisPanelProps {
  property: Property;
}

export function LeaseAnalysisPanel({ property }: LeaseAnalysisPanelProps) {
  return (
    <div className="space-y-8">
      {/* Coming Soon Banner */}
      <div className="bg-gold-400/10 border border-gold-400/30 rounded-xl px-6 py-4 text-center">
        <span className="text-gold-400 font-display text-lg tracking-widest uppercase">Coming Soon</span>
      </div>
    </div>
  );
}
