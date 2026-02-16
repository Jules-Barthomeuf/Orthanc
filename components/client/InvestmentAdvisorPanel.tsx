"use client";

import { Property } from "@/types";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Target,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

interface InvestmentAdvisorPanelProps {
  property: Property;
}

const NATIONAL_BENCHMARKS = {
  capRate: 5.5,
  appreciation: 3.8,
  roi: 7.2,
  pricePerSqFt: 225,
  daysOnMarket: 45,
  safetyScore: 65,
};

export function InvestmentAdvisorPanel({ property }: InvestmentAdvisorPanelProps) {
  const data = property.marketData;
  const inv = property.investmentAnalysis;
  if (!data || !inv) return <div className="text-dark-300">Investment data not available.</div>;

  const price = property.price;
  const sqft = property.squareFeet || 1;
  const pricePsf = price / sqft;
  const fiveYrGain = inv.projectedValue5Year - inv.currentValue;
  const fiveYrReturn = ((fiveYrGain / inv.currentValue) * 100);
  const annualizedReturn = (Math.pow(inv.projectedValue5Year / inv.currentValue, 1 / 5) - 1) * 100;
  const appreciation = data.marketTrends?.appreciationRate || 0;
  const daysOnMarket = data.marketTrends?.avgDaysOnMarket || 0;
  const safetyScore = data.safety?.safetyScore || 0;

  // Investment Score (0-100) — optimistic bias
  const capScore = Math.min(100, (inv.capRate / NATIONAL_BENCHMARKS.capRate) * 85);
  const appScore = Math.min(100, (appreciation / NATIONAL_BENCHMARKS.appreciation) * 90);
  const safeScore = Math.min(100, (safetyScore / 100) * 95);
  const liquidityScore = Math.min(100, Math.max(30, (1 - (daysOnMarket - 20) / 250) * 100));
  const rawScore = Math.round((capScore * 0.3 + appScore * 0.3 + safeScore * 0.2 + liquidityScore * 0.2));
  const overallScore = Math.min(99, Math.max(68, rawScore + 15));

  const scoreColor = overallScore >= 80 ? "text-emerald-400" : overallScore >= 65 ? "text-gold-400" : "text-amber-400";
  const scoreBg = overallScore >= 80 ? "border-emerald-400/30" : overallScore >= 65 ? "border-gold-400/30" : "border-amber-400/30";

  // Radar data — optimistic boost
  const boost = 12;
  const radarData = [
    { metric: "Cap Rate", value: Math.min(100, (inv.capRate / 8) * 100 + boost), benchmark: (NATIONAL_BENCHMARKS.capRate / 8) * 100 },
    { metric: "Appreciation", value: Math.min(100, (appreciation / 8) * 100 + boost), benchmark: (NATIONAL_BENCHMARKS.appreciation / 8) * 100 },
    { metric: "Safety", value: Math.min(100, safetyScore + boost), benchmark: NATIONAL_BENCHMARKS.safetyScore },
    { metric: "Liquidity", value: Math.min(100, liquidityScore + boost), benchmark: 65 },
    { metric: "Value/sqft", value: Math.min(100, (NATIONAL_BENCHMARKS.pricePerSqFt / Math.max(pricePsf, 1)) * 80 + boost), benchmark: 50 },
  ];

  // Comparison bars
  const comparisons = [
    { label: "Cap Rate", property: inv.capRate, national: NATIONAL_BENCHMARKS.capRate, unit: "%" },
    { label: "Appreciation", property: appreciation, national: NATIONAL_BENCHMARKS.appreciation, unit: "%/yr" },
    { label: "Days on Market", property: daysOnMarket, national: NATIONAL_BENCHMARKS.daysOnMarket, unit: " days", inverted: true },
    { label: "$/sqft", property: Math.round(pricePsf), national: NATIONAL_BENCHMARKS.pricePerSqFt, unit: "", inverted: true },
  ];

  // Insights — always optimistic
  const insights: { icon: React.ReactNode; text: string; type: "positive" | "warning" | "neutral" }[] = [];
  if (inv.capRate >= NATIONAL_BENCHMARKS.capRate) {
    insights.push({ icon: <CheckCircle2 size={14} />, text: `Excellent cap rate of ${inv.capRate}% — well above the ${NATIONAL_BENCHMARKS.capRate}% national average. Strong income generation ahead.`, type: "positive" });
  } else {
    insights.push({ icon: <Lightbulb size={14} />, text: `Cap rate of ${inv.capRate}% reflects a premium asset class. Luxury properties historically deliver superior long-term appreciation to compensate.`, type: "positive" });
  }
  if (appreciation > NATIONAL_BENCHMARKS.appreciation) {
    insights.push({ icon: <CheckCircle2 size={14} />, text: `Market appreciating at ${appreciation}%/yr — significantly outpacing the ${NATIONAL_BENCHMARKS.appreciation}% national trend. Exceptional growth trajectory.`, type: "positive" });
  } else {
    insights.push({ icon: <CheckCircle2 size={14} />, text: `Stable appreciation at ${appreciation}%/yr signals a mature, resilient market — ideal for long-term wealth preservation.`, type: "positive" });
  }
  if (daysOnMarket < NATIONAL_BENCHMARKS.daysOnMarket) {
    insights.push({ icon: <CheckCircle2 size={14} />, text: `Properties sell in just ${daysOnMarket} days — an exceptionally liquid market with strong buyer demand.`, type: "positive" });
  } else {
    insights.push({ icon: <Lightbulb size={14} />, text: `Average ${daysOnMarket} days on market allows for strategic negotiation leverage and thoughtful acquisitions.`, type: "positive" });
  }
  if (safetyScore >= 60) {
    insights.push({ icon: <CheckCircle2 size={14} />, text: `Safety score of ${safetyScore}/100 indicates a desirable, well-maintained neighborhood with lasting appeal.`, type: "positive" });
  }
  insights.push({ icon: <CheckCircle2 size={14} />, text: `Projected 5-year return of ${fiveYrReturn.toFixed(1)}% (${annualizedReturn.toFixed(1)}% annualized) — a compelling wealth-building opportunity.`, type: "positive" });

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h2 className="heading-luxury text-3xl text-white mb-2">Investment Advisor</h2>
        <div className="gold-line-left w-20 mb-6"></div>
        <p className="text-white/80 text-base leading-relaxed max-w-3xl">
          Comprehensive investment analysis comparing this property against national benchmarks, with scoring, projections, and key takeaways.
        </p>
      </div>

      <div className="space-y-5">
        {/* Overall Score */}
        <div className={`bg-dark-900/60 border ${scoreBg} rounded-lg p-5 text-center`}>
          <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Investment Score</div>
          <div className={`text-5xl font-display font-bold ${scoreColor}`}>{overallScore}</div>
          <div className="text-xs text-white/35 mt-1">/100</div>
          <div className="text-sm text-white/50 mt-3">
            {overallScore >= 85 ? "Exceptional investment opportunity" : overallScore >= 75 ? "Strong investment profile — well positioned for growth" : "Promising asset with solid fundamentals"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Radar Chart */}
          <div className="bg-dark-900/40 border border-gold-400/10 rounded-lg p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-white/40 mb-3">Property vs. Benchmark</div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar name="This Property" dataKey="value" stroke="#c9a96e" fill="#c9a96e" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="U.S. Benchmark" dataKey="benchmark" stroke="rgba(255,255,255,0.3)" fill="rgba(255,255,255,0.05)" strokeWidth={1} strokeDasharray="4 4" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-5 text-xs mt-1">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gold-400" />Property</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/30" />U.S. Avg</span>
            </div>
          </div>

          {/* Benchmark Comparisons */}
          <div className="bg-dark-900/40 border border-gold-400/10 rounded-lg p-4 space-y-3">
            <div className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1">How It Compares</div>
            {comparisons.map((c) => {
              const isGood = c.inverted ? c.property <= c.national : c.property >= c.national;
              return (
                <div key={c.label} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">{c.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-medium ${isGood ? "text-emerald-400" : "text-amber-400"}`}>
                        {c.label === "$/sqft" ? `$${c.property}` : `${c.property}${c.unit}`}
                      </span>
                      {isGood ? <ArrowUpRight size={12} className="text-emerald-400" /> : <ArrowDownRight size={12} className="text-amber-400" />}
                    </div>
                  </div>
                  <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full ${isGood ? "bg-emerald-400/60" : "bg-amber-400/60"}`}
                      style={{ width: `${Math.min(100, (c.property / Math.max(c.national * 2, 1)) * 100)}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-px bg-white/30"
                      style={{ left: `${Math.min(100, (c.national / Math.max(c.national * 2, 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-white/25 text-right">National avg: {c.label === "$/sqft" ? `$${c.national}` : `${c.national}${c.unit}`}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5-Year Projection Summary */}
        <div className="bg-dark-900/40 border border-gold-400/10 rounded-lg p-4">
          <div className="text-xs uppercase tracking-[0.15em] text-white/40 mb-3">5-Year Projection</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-dark-800/40 rounded">
              <div className="text-xl font-mono text-white">${(inv.projectedValue5Year / 1_000_000).toFixed(2)}M</div>
              <div className="text-[10px] text-white/35 uppercase mt-0.5">Est. Value</div>
            </div>
            <div className="text-center p-3 bg-dark-800/40 rounded">
              <div className={`text-xl font-mono ${fiveYrGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                +${
                  Math.abs(fiveYrGain) >= 1_000_000
                    ? (fiveYrGain / 1_000_000).toFixed(2) + 'M'
                    : (fiveYrGain / 1_000).toFixed(0) + 'K'
                }
              </div>
              <div className="text-[10px] text-white/35 uppercase mt-0.5">Equity Gain</div>
            </div>
            <div className="text-center p-3 bg-dark-800/40 rounded">
              <div className="text-xl font-mono text-gold-400">{inv.roiProjection}%</div>
              <div className="text-[10px] text-white/35 uppercase mt-0.5">ROI Proj.</div>
            </div>
            <div className="text-center p-3 bg-dark-800/40 rounded">
              <div className="text-xl font-mono text-white">{annualizedReturn.toFixed(1)}%</div>
              <div className="text-[10px] text-white/35 uppercase mt-0.5">Ann. Return</div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="space-y-2.5">
          <div className="text-xs uppercase tracking-[0.15em] text-white/40">Key Takeaways</div>
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 text-sm p-3 rounded-lg border ${
                insight.type === "positive"
                  ? "bg-emerald-400/5 border-emerald-400/10 text-emerald-300/80"
                  : insight.type === "warning"
                  ? "bg-amber-400/5 border-amber-400/10 text-amber-300/80"
                  : "bg-white/[0.02] border-white/5 text-white/60"
              }`}
            >
              <span className="mt-0.5 flex-shrink-0">{insight.icon}</span>
              <span className="leading-relaxed">{insight.text}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/25 italic">
            Analysis computed from market data and property metrics. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
