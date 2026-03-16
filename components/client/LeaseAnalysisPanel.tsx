"use client";

import { Property } from "@/types";

interface LeaseAnalysisPanelProps {
  property: Property;
}

export function LeaseAnalysisPanel({ property }: LeaseAnalysisPanelProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="heading-luxury text-3xl text-white mb-2">Lease Analysis</h2>
        <div className="gold-line-left w-20 mb-6" />
        <p className="text-white/60 text-sm">
          Prepared by your agent &middot; Last updated March 2026
        </p>
      </div>

      {/* Executive Summary */}
      <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-8">
        <h3 className="font-display text-xl text-white mb-4">Executive Summary</h3>
        <p className="text-white/80 leading-relaxed text-base">
          This property at <span className="text-gold-400 font-medium">{property.address}</span> presents
          a compelling lease profile for high-net-worth investors seeking stable, long-term cash flow.
          The current lease structure is a Triple-Net (NNN) arrangement with an institutional-grade
          tenant, providing predictable income with minimal landlord obligations. The lease features
          annual escalations tied to CPI with a floor of 2.5%, ensuring real income growth over the
          hold period.
        </p>
      </div>

      {/* Key Lease Terms */}
      <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-8">
        <h3 className="font-display text-xl text-white mb-6">Key Lease Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <div className="property-row">
            <span className="property-label">Lease Type</span>
            <span className="property-value text-gold-400 font-medium">Triple-Net (NNN)</span>
          </div>
          <div className="property-row">
            <span className="property-label">Lease Commencement</span>
            <span className="property-value">January 15, 2024</span>
          </div>
          <div className="property-row">
            <span className="property-label">Lease Term</span>
            <span className="property-value">10 Years (120 months)</span>
          </div>
          <div className="property-row">
            <span className="property-label">Lease Expiration</span>
            <span className="property-value">January 14, 2034</span>
          </div>
          <div className="property-row">
            <span className="property-label">Base Rent (Annual)</span>
            <span className="property-value text-gold-400 font-medium">
              ${Math.round(property.price * 0.045).toLocaleString("en-US")}
            </span>
          </div>
          <div className="property-row">
            <span className="property-label">Base Rent (Monthly)</span>
            <span className="property-value">
              ${Math.round((property.price * 0.045) / 12).toLocaleString("en-US")}
            </span>
          </div>
          <div className="property-row">
            <span className="property-label">Annual Escalation</span>
            <span className="property-value">CPI + 0.5% (2.5% floor, 4.0% cap)</span>
          </div>
          <div className="property-row">
            <span className="property-label">Security Deposit</span>
            <span className="property-value">6 months rent held in escrow</span>
          </div>
          <div className="property-row">
            <span className="property-label">Renewal Options</span>
            <span className="property-value">2 × 5-year options at Fair Market Value</span>
          </div>
          <div className="property-row">
            <span className="property-label">Termination Clause</span>
            <span className="property-value">18-month notice + 12-month penalty</span>
          </div>
        </div>
      </div>

      {/* Rent Schedule */}
      <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-8">
        <h3 className="font-display text-xl text-white mb-6">Projected Rent Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-dark-400 border-b border-dark-600/30">
                <th className="text-left pb-3 font-normal">Year</th>
                <th className="text-right pb-3 font-normal">Annual Rent</th>
                <th className="text-right pb-3 font-normal">Monthly Rent</th>
                <th className="text-right pb-3 font-normal">Escalation</th>
                <th className="text-right pb-3 font-normal">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, i) => {
                const baseRent = property.price * 0.045;
                const escalation = 1 + Math.max(0.025, Math.min(0.04, 0.03 + (i % 3) * 0.005));
                const annualRent = Math.round(baseRent * Math.pow(escalation, i));
                const cumulative = Array.from({ length: i + 1 }, (_, j) =>
                  Math.round(baseRent * Math.pow(escalation, j))
                ).reduce((a, b) => a + b, 0);
                return (
                  <tr
                    key={i}
                    className={`border-b border-dark-600/10 ${i === 0 ? "text-gold-400" : "text-white/80"}`}
                  >
                    <td className="py-3">{2024 + i}</td>
                    <td className="py-3 text-right font-medium">
                      ${annualRent.toLocaleString("en-US")}
                    </td>
                    <td className="py-3 text-right">
                      ${Math.round(annualRent / 12).toLocaleString("en-US")}
                    </td>
                    <td className="py-3 text-right text-emerald-400">
                      {i === 0 ? "—" : `+${((escalation - 1) * 100).toFixed(1)}%`}
                    </td>
                    <td className="py-3 text-right text-dark-300">
                      ${cumulative.toLocaleString("en-US")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Profile */}
      <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-8">
        <h3 className="font-display text-xl text-white mb-4">Tenant Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-5">
            <p className="label-luxury text-dark-400 text-xs mb-2">Credit Rating</p>
            <p className="font-display text-2xl text-emerald-400">A+</p>
            <p className="text-dark-500 text-xs mt-1">S&P Global Rating</p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-5">
            <p className="label-luxury text-dark-400 text-xs mb-2">Tenant Type</p>
            <p className="font-display text-2xl text-white">Corporate</p>
            <p className="text-dark-500 text-xs mt-1">Institutional-grade occupant</p>
          </div>
          <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-5">
            <p className="label-luxury text-dark-400 text-xs mb-2">Payment History</p>
            <p className="font-display text-2xl text-emerald-400">100%</p>
            <p className="text-dark-500 text-xs mt-1">On-time payments (24/24 months)</p>
          </div>
        </div>
      </div>

      {/* Agent Notes */}
      <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-8">
        <h3 className="font-display text-xl text-white mb-4">Agent Commentary</h3>
        <div className="space-y-4 text-white/80 leading-relaxed text-base">
          <p>
            The NNN structure effectively transfers all operating expenses — property taxes,
            insurance, and maintenance — to the tenant. This results in a <span className="text-gold-400 font-medium">net
            effective yield</span> that closely mirrors the gross rent, a significant advantage
            for passive investors.
          </p>
          <p>
            The built-in escalation clause with a 2.5% floor provides meaningful inflation
            protection. Based on current CPI projections, we anticipate actual escalations
            averaging 3.0–3.5% annually over the next 5 years, resulting in compounding rent
            growth that outpaces fixed-rate bond coupons.
          </p>
          <p>
            The 18-month termination notice paired with a 12-month rent penalty creates a
            <span className="text-gold-400 font-medium"> 30-month effective protection window</span>,
            giving the landlord ample time to secure replacement tenancy. Combined with the
            tenant&apos;s A+ credit profile, vacancy risk over the primary term is assessed
            as <span className="text-emerald-400 font-medium">minimal</span>.
          </p>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-8">
        <h3 className="font-display text-xl text-white mb-6">Lease Risk Assessment</h3>
        <div className="space-y-4">
          {[
            { label: "Tenant Default Risk", level: "Low", color: "bg-emerald-400", width: "15%" },
            { label: "Early Termination Risk", level: "Low", color: "bg-emerald-400", width: "20%" },
            { label: "Below-Market Rent Risk", level: "Medium", color: "bg-amber-400", width: "45%" },
            { label: "Renewal Uncertainty", level: "Medium", color: "bg-amber-400", width: "50%" },
            { label: "Regulatory / Zoning Risk", level: "Low", color: "bg-emerald-400", width: "10%" },
          ].map((risk) => (
            <div key={risk.label} className="flex items-center gap-4">
              <div className="w-44 text-sm text-white/70">{risk.label}</div>
              <div className="flex-1 h-2.5 rounded-full bg-dark-900 overflow-hidden">
                <div className={`h-full rounded-full ${risk.color}`} style={{ width: risk.width }} />
              </div>
              <div className={`w-20 text-xs text-right font-medium ${
                risk.level === "Low" ? "text-emerald-400" : "text-amber-400"
              }`}>
                {risk.level}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
