"use client";

import { Property } from "@/types";
import { useState } from "react";


interface TechnicalPanelProps {
  property: Property;
  defaultHoldingStructure?: string; // id: "individual", "llc", "trust", "foreign"
}

interface HoldingStructure {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  process: string;
  metrics: { label: string; value: string; color: string }[];
  orthanc: { label: string; impact: string; direction: "up" | "down" | "neutral" }[];
  keyNumbers: { label: string; detail: string }[];
}


export function TechnicalPanel({ property, defaultHoldingStructure }: TechnicalPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeStructure, setActiveStructure] = useState<string>(
    defaultHoldingStructure && ["individual","llc","trust","foreign"].includes(defaultHoldingStructure)
      ? defaultHoldingStructure
      : "individual"
  );

  const toggle = (id: string) =>
    setExpandedSection(expandedSection === id ? null : id);

  // Seules les 4 structures demandées, aucune SCI ni autre
  const holdingStructures: HoldingStructure[] = [
    {
      id: "individual",
      title: "Individual Ownership",
      subtitle: "The Baseline",
      icon: "👤",
      process:
        "The buyer uses their own name on the deed. This is a public record, meaning anyone can see what they paid and where they live. Simplest path but most financially and legally exposed.",
      metrics: [
        { label: "Privacy", value: "None", color: "text-red-400" },
        { label: "Asset Protection", value: "None", color: "text-red-400" },
        { label: "Tax Efficiency", value: "High", color: "text-emerald-400" },
        { label: "Setup Complexity", value: "Low", color: "text-emerald-400" },
      ],
      keyNumbers: [
        {
          label: "Property Taxes",
          detail:
            "Eligible for Homestead Exemption (up to $50,000 off assessed value) and the 3% \"Save Our Homes\" cap on annual assessment increases.",
        },
        {
          label: "Liability",
          detail:
            "Zero \"corporate veil.\" If someone slips on the pool deck, the buyer’s entire personal net worth is at risk.",
        },
        {
          label: "Closing Costs",
          detail: "Standard title insurance and documentary stamps.",
        },
      ],
      orthanc: [
        { label: "Sovereign Yield", impact: "Higher due to tax caps", direction: "up" },
        { label: "Risk Score", impact: "Significantly higher due to lack of asset protection", direction: "down" },
      ],
    },
    {
      id: "llc",
      title: "Domestic LLC",
      subtitle: "The Standard",
      icon: "🏢",
      process:
        "The LLC is the 'Buyer.' The individual owns the LLC. This requires an Operating Agreement and a registered agent. It adds about 1–2 weeks to the setup of the closing process.",
      metrics: [
        { label: "Privacy", value: "Moderate", color: "text-yellow-400" },
        { label: "Asset Protection", value: "Strong", color: "text-emerald-400" },
        { label: "Tax Efficiency", value: "High", color: "text-emerald-400" },
        { label: "Setup Complexity", value: "Moderate", color: "text-yellow-400" },
      ],
      keyNumbers: [
        {
          label: "Privacy",
          detail:
            "The deed shows '123 Blue Water LLC,' obscuring the owner's name from casual searchers.",
        },
        {
          label: "Taxation",
          detail:
            "LLCs are 'pass-through' entities. The negative cash flow (NOI) you calculated can often be used to offset other passive income on the owner's personal tax return.",
        },
        {
          label: "Homestead",
          detail:
            "In Florida, you can still claim Homestead in an LLC if the owner has 'equitable title' and uses it as a primary residence, but it requires more legal paperwork.",
        },
      ],
      orthanc: [
        { label: "Carry Cost Ratio", impact: "Improves slightly due to tax deductibility of certain expenses (if treated as an investment/rental partially)", direction: "up" },
        { label: "Opex", impact: "Increases due to annual LLC filings and legal maintenance", direction: "down" },
      ],
    },
    {
      id: "trust",
      title: "Irrevocable Trust",
      subtitle: "The Legacy Play",
      icon: "🏛️",
      process:
        "The property is moved into a trust managed by a Trustee. This is the most complex path, requiring a specialized estate attorney to coordinate with the title company.",
      metrics: [
        { label: "Privacy", value: "High", color: "text-emerald-400" },
        { label: "Asset Protection", value: "Maximum", color: "text-emerald-400" },
        { label: "Tax Efficiency", value: "Exceptional", color: "text-emerald-400" },
        { label: "Setup Complexity", value: "High", color: "text-red-400" },
      ],
      keyNumbers: [
        {
          label: "Estate Taxes",
          detail: `Removes the home from the owner’s taxable estate. For a $${(property.price / 1000000).toFixed(1)}M home, this could save the heirs 40% ($${((property.price * 0.4) / 1000000).toFixed(1)}M) in federal estate taxes upon the owner's death.`,
        },
        {
          label: "Step-up in Basis",
          detail:
            "When the owner passes, the 'cost basis' for the heirs resets to the current market value, potentially eliminating capital gains taxes on decades of appreciation.",
        },
      ],
      orthanc: [
        { label: "IRR (30-year)", impact: "Looks better over a 30-year horizon because of the massive avoided tax at the end", direction: "up" },
        { label: "Initial Investment", impact: "Higher due to $10k–$25k in legal setup", direction: "down" },
      ],
    },
    {
      id: "foreign",
      title: "Foreign Corporate Structure",
      subtitle: "The Global Hedge",
      icon: "🌐",
      process:
        "A BVI (British Virgin Islands) or similar offshore corp holds the Florida LLC. This involves intense 'Know Your Customer' (KYC) checks at the bank.",
      metrics: [
        { label: "Privacy", value: "Maximum", color: "text-emerald-400" },
        { label: "Asset Protection", value: "Maximum", color: "text-emerald-400" },
        { label: "Tax Efficiency", value: "Complex", color: "text-yellow-400" },
        { label: "Setup Complexity", value: "Very High", color: "text-red-400" },
      ],
      keyNumbers: [
        {
          label: "FIRPTA",
          detail:
            "When selling, the IRS withholds 15% of the gross sales price if the seller is a foreign entity, until taxes are cleared. This is a huge liquidity hit.",
        },
        {
          label: "Estate Tax (Non-Resident)",
          detail:
            "Foreign individuals only get a $60,000 exemption before the 40% tax hits. A corporate structure is mandatory to avoid this.",
        },
      ],
      orthanc: [
        { label: "Liquidity Score", impact: "Drops (due to FIRPTA withholding)", direction: "down" },
        { label: "Annual Debt Service", impact: "Usually higher because foreign national loans often carry a 1–2% interest rate premium", direction: "down" },
      ],
    },
  ];

  const timeline = [
    {
      id: "original",
      year: "2006",
      title: "Original Construction",
      category: "Construction",
      detail:
        "Built by a licensed general contractor with CBS (concrete block and stucco) construction. Original permits filed with Broward County include electrical, plumbing, and structural certifications. Foundation: reinforced slab-on-grade, engineered for coastal wind loads per Florida Building Code 2004 edition.",
    },
    {
      id: "roof-2014",
      year: "2014",
      title: "Full Roof Replacement",
      category: "Roof",
      detail:
        "Complete tear-off and replacement with GAF Timberline HDZ architectural shingles rated to 130 mph. Includes new synthetic underlayment, drip edge, and revised soffit ventilation. Permit #B-2014-049821. Passed final inspection on 11/02/2014.",
    },
    {
      id: "hvac-2019",
      year: "2019",
      title: "HVAC System Upgrade",
      category: "Mechanical",
      detail:
        "Two-zone Trane XV20i variable-speed system (5-ton main, 3-ton secondary) with ComfortLink™ communicating thermostat. SEER rating 20. Ductwork partially replaced with insulated flex-duct in attic space. Permit #M-2019-007412.",
    },
    {
      id: "impact-2020",
      year: "2020",
      title: "Impact Window & Door Installation",
      category: "Envelope",
      detail:
        "All windows and sliding doors replaced with PGT WinGuard impact-rated units (Large Missile Level D). Meets Miami-Dade NOA requirements. 22 window units and 3 sliding door assemblies. Insurance wind-mitigation credit applied.",
    },
    {
      id: "kitchen-2021",
      year: "2021",
      title: "Kitchen & Primary Bath Renovation",
      category: "Interior",
      detail:
        "Full kitchen gut-renovation: custom Italian cabinetry, quartzite countertops, Wolf 48\" range, Sub-Zero refrigeration column. Primary bath: curbless shower with linear drain, heated porcelain tile flooring, free-standing soaking tub. Permit #B-2021-033109.",
    },
    {
      id: "seawall-2022",
      year: "2022",
      title: "Seawall Inspection & Repair",
      category: "Marine / Structural",
      detail:
        "Marine engineering survey conducted by Coastal Systems International. Minor spalling repaired with epoxy injection and carbon-fiber reinforcement. Estimated remaining useful life: 25+ years. Report filed with Broward County Marine Advisory.",
    },
    {
      id: "elec-2023",
      year: "2023",
      title: "Electrical Panel Upgrade",
      category: "Electrical",
      detail:
        "Main service upgraded from 200A to 400A split-bus panel (Eaton CH series) to accommodate EV charging and pool equipment load. Whole-home surge protection installed. Arc-fault breakers added to all bedroom circuits. Permit #E-2023-018704.",
    },
    {
      id: "pool-2024",
      year: "2024",
      title: "Pool Resurfacing & Equipment",
      category: "Exterior",
      detail:
        "Pool interior resurfaced with PebbleTec French Gray finish. Variable-speed pump (Pentair IntelliFlo 3) and salt chlorine generator installed. New LED color lighting and automated chemical dosing system. Deck re-sealed with non-slip elastomeric coating.",
    },
  ];

  const inspectionSummary = [
    { label: "Structural", status: "Pass", note: "No signs of settlement or cracking" },
    { label: "Roof", status: "Good", note: "Est. 12 yrs remaining useful life" },
    { label: "Electrical", status: "Pass", note: "400A service, code-compliant" },
    { label: "Plumbing", status: "Pass", note: "PEX re-pipe completed 2021" },
    { label: "HVAC", status: "Good", note: "Variable-speed, serviced annually" },
    { label: "Windows / Envelope", status: "Excellent", note: "Full impact-rated 2020" },
    { label: "Foundation", status: "Pass", note: "Slab-on-grade, no movement detected" },
    { label: "Seawall", status: "Good", note: "Repaired 2022, 25+ yr est. life" },
  ];

  return (
    <div>
      <h2 className="heading-luxury text-3xl text-white mb-2">
        Technical & Structural Analysis
      </h2>
      <div className="gold-line-left w-20 mb-6"></div>

      {/* Disclaimer */}
      <div className="bg-dark-900/60 border border-gold-400/10 rounded-lg px-5 py-4 mb-8">
        <p className="text-dark-400 text-sm leading-relaxed">
          <span className="text-gold-400/70 font-semibold">Illustrative Data</span> — The
          records below represent a sample structural timeline generated for demonstration
          purposes. In a live engagement, this section is populated from verified permit
          records, inspection reports, and contractor documentation uploaded to the
          property&apos;s secure vault.
        </p>
      </div>

      {/* Inspection Summary Table */}
      <div className="mb-10">
        <h3 className="font-display text-xl text-white mb-4">Latest Inspection Summary</h3>
        <div className="border border-gold-400/10 rounded-lg overflow-hidden">
          {inspectionSummary.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-5 py-3 text-sm ${
                i % 2 === 0 ? "bg-dark-900/40" : "bg-dark-900/20"
              } ${i < inspectionSummary.length - 1 ? "border-b border-dark-600/10" : ""}`}
            >
              <span className="text-white font-medium w-40 text-base">{row.label}</span>
              <span
                className={`font-semibold text-sm uppercase tracking-wider w-24 text-center ${
                  row.status === "Excellent"
                    ? "text-emerald-400"
                    : row.status === "Good"
                    ? "text-green-400"
                    : "text-dark-300"
                }`}
              >
                {row.status}
              </span>
              <span className="text-dark-300 text-sm flex-1 text-right">{row.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Renovation & Permit Timeline */}
      <div className="mb-10">
        <h3 className="font-display text-xl text-white mb-6">Renovation & Permit Timeline</h3>
        <div className="relative pl-6 border-l border-gold-400/20 space-y-6">
          {timeline.map((item) => (
            <div key={item.id} className="relative">
              {/* dot */}
              <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-gold-400/80 border-2 border-dark-900" />
              <button
                onClick={() => toggle(item.id)}
                className="w-full text-left group"
              >
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-gold-400 font-display text-base font-bold">{item.year}</span>
                  <span className="text-white font-semibold text-base group-hover:text-gold-400 transition-colors">
                    {item.title}
                  </span>
                  <span className="ml-auto text-dark-500 text-sm uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-gold-400/60 text-sm ml-2">
                    {expandedSection === item.id ? "−" : "+"}
                  </span>
                </div>
              </button>
              {expandedSection === item.id && (
                <div className="mt-2 bg-dark-900/50 border border-dark-600/15 rounded-lg p-4">
                  <p className="text-white/70 text-base leading-relaxed">{item.detail}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Holding Structures */}
      <div className="mb-10">
        <h3 className="font-display text-xl text-white mb-2">Holding Structures</h3>
        <p className="text-dark-400 text-sm mb-6">
          Evaluate the optimal ownership vehicle based on privacy, liability, and tax implications.
        </p>

        {/* Structure Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {holdingStructures.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStructure(s.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeStructure === s.id
                  ? "bg-gold-400/20 text-gold-400 border border-gold-400/40"
                  : "bg-dark-900/40 text-dark-300 border border-dark-600/20 hover:border-gold-400/20 hover:text-white"
              }`}
            >
              <span className="mr-2">{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>

        {/* Résumé dynamique d'impact d'investissement */}
        <div className="mb-7">
          {(() => {
            const s = holdingStructures.find((h) => h.id === activeStructure);
            if (!s) return null;
            // Résumé synthétique selon la structure
            let summary = "";
            if (s.id === "individual") {
              summary =
                "\u2022 Baseline: Homestead Exemption, 3% Save Our Homes cap, mais aucune protection d'actif. Le rendement souverain est élevé, mais le score de risque est maximal.\n" +
                "\u2022 Idéal pour résidence principale, mais expose tout le patrimoine personnel en cas de litige.";
            } else if (s.id === "llc") {
              summary =
                "\u2022 LLC: Améliore la protection d'actif (corporate veil), confidentialité accrue, possibilité de déduire certaines charges.\n" +
                "\u2022 Légère hausse des coûts d'exploitation (Opex) et complexité administrative. Homestead possible avec démarches supplémentaires.";
            } else if (s.id === "trust") {
              summary =
                `\u2022 Trust: Optimisé pour la transmission patrimoniale. Évite jusqu'à 40% d'impôt successoral (\u2248 $${((property.price * 0.4) / 1000000).toFixed(1)}M pour ce bien).\n` +
                "\u2022 IRR sur 30 ans nettement supérieur, mais investissement initial plus élevé (frais juridiques).";
            } else if (s.id === "foreign") {
              summary =
                "\u2022 Structure étrangère: Protection maximale, confidentialité totale, mais impact de liquidité (FIRPTA 15%) et coût de la dette plus élevé.\n" +
                "\u2022 Indispensable pour non-résidents pour éviter la 'cliff' fiscale des $60k d'exemption succession.";
            }
            return (
              <div className="bg-dark-900/70 border border-gold-400/15 rounded-lg px-5 py-4">
                <div className="text-gold-400/80 font-semibold mb-1 flex items-center gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <span>Résumé d'impact sur l'investissement</span>
                </div>
                <div className="text-white/80 text-sm whitespace-pre-line leading-relaxed">{summary}</div>
              </div>
            );
          })()}
        </div>

        {/* Active Structure Detail */}
        {holdingStructures
          .filter((s) => s.id === activeStructure)
          .map((s) => (
            <div key={s.id} className="space-y-5">
              {/* Header */}
              <div className="bg-dark-900/60 border border-gold-400/15 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <h4 className="text-white font-display text-lg">{s.title}</h4>
                    <span className="text-gold-400/70 text-sm font-medium">{s.subtitle}</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{s.process}</p>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {s.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="bg-dark-900/40 border border-dark-600/15 rounded-lg p-4 text-center"
                  >
                    <div className="text-dark-400 text-xs uppercase tracking-wider mb-1.5">
                      {m.label}
                    </div>
                    <div className={`font-semibold text-base ${m.color}`}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Key Numbers */}
              <div>
                <h5 className="text-white font-medium text-sm uppercase tracking-wider mb-3">
                  The Numbers
                </h5>
                <div className="space-y-3">
                  {s.keyNumbers.map((k) => (
                    <div
                      key={k.label}
                      className="bg-dark-900/30 border border-dark-600/10 rounded-lg p-4"
                    >
                      <div className="text-gold-400/80 font-semibold text-sm mb-1">{k.label}</div>
                      <p className="text-white/70 text-sm leading-relaxed">{k.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orthanc Metric Impact */}
              <div>
                <h5 className="text-white font-medium text-sm uppercase tracking-wider mb-3">
                  Orthanc Metric Impact
                </h5>
                <div className="border border-gold-400/10 rounded-lg overflow-hidden">
                  {s.orthanc.map((o, i) => (
                    <div
                      key={o.label}
                      className={`flex items-center gap-4 px-5 py-3.5 ${
                        i % 2 === 0 ? "bg-dark-900/40" : "bg-dark-900/20"
                      } ${i < s.orthanc.length - 1 ? "border-b border-dark-600/10" : ""}`}
                    >
                      <span
                        className={`text-lg ${
                          o.direction === "up"
                            ? "text-emerald-400"
                            : o.direction === "down"
                            ? "text-red-400"
                            : "text-dark-400"
                        }`}
                      >
                        {o.direction === "up" ? "▲" : o.direction === "down" ? "▼" : "●"}
                      </span>
                      <span className="text-white font-medium text-sm w-44">{o.label}</span>
                      <span className="text-white/60 text-sm flex-1">{o.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Documents — keep original if available */}
      {property.documents?.length > 0 && (
        <div className="mb-8">
          <h3 className="font-display text-xl text-white mb-4">Uploaded Documents</h3>
          <div className="space-y-3">
            {property.documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gold-400/10 rounded-lg p-5 bg-dark-900 hover:border-gold-400/25 transition"
              >
                <h4 className="font-semibold text-white text-base mb-1">{doc.name}</h4>
                <p className="text-dark-400 text-sm">
                  {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
