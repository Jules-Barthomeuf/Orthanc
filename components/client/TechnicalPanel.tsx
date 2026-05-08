"use client";

import { useState } from "react";

interface TechnicalPanelProps {
}

export function TechnicalPanel({}: TechnicalPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedSection(expandedSection === id ? null : id);

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

  return (
    <div>
      <h2 className="heading-luxury text-3xl text-white mb-2">
        Technical & Structural Analysis
      </h2>
      <div className="gold-line-left w-20 mb-6"></div>

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
    </div>
  );
}
