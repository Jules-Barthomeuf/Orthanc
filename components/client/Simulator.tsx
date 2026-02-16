'use client';

import { useState, useCallback, useMemo } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import SimulatorChat from './SimulatorChat';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Building2,
  Gem,
  Target,
  ArrowRight,
  Info,
  Landmark,
  CreditCard,
  Percent,
  CalendarClock,
  ShieldCheck,
  ReceiptText,
  Scale,
  Crosshair,
  Timer,
  ChartNoAxesCombined,
  HelpCircle,
  X,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ═══════════════════════════════════════════════════════════════
   TYPES & DEFAULTS
   ═══════════════════════════════════════════════════════════════ */

interface SimState {
  // Property basics
  propertyValue: number;
  grossAnnualRent: number;
  vacancyRate: number; // percentage of gross rent lost to vacancy

  // Luxury operating expenses
  concierge: number;
  specializedSecurity: number;
  highEndLandscaping: number;
  poolMaintenance: number;
  wineClimate: number;
  smartHomeSystems: number;
  propertyManagement: number;

  // Staffing — the "Carry Cost" reality
  liveInStaff: number;
  securityTeam: number;
  propertyManagers: number;
  avgStaffSalary: number;

  // Specialized maintenance
  infinityPool: boolean;
  wineClimateControl: boolean;
  smartHomeUpdates: boolean;

  // Acquisition costs
  closingCosts: number;
  renovationCosts: number;

  // Financing
  ltvRatio: number;
  interestRate: number;
  loanTermYears: number;

  // Holding structure
  holdingStructure: 'personal' | 'llc' | 'trust' | 'foreign';

  // Appreciation & Scarcity
  baseAppreciationRate: number;
  scarcityPrivateBeach: boolean;
  scarcityHistoricHeritage: boolean;
  scarcityStarchitect: boolean;
  scarcityUniqueView: boolean;

  // Hold & exit
  holdPeriodYears: number;
  targetExitProfit: number;

  // Liquidity context
  priceBracket: 'ultra' | 'premium' | 'entry';
  marketRegion: string;

  // Tax
  propertyTaxRate: number;
  annualInsurance: number;
}

const DEFAULT_STATE: SimState = {
  propertyValue: 15_000_000,
  grossAnnualRent: 600_000,
  vacancyRate: 10,

  concierge: 120_000,
  specializedSecurity: 180_000,
  highEndLandscaping: 95_000,
  poolMaintenance: 45_000,
  wineClimate: 25_000,
  smartHomeSystems: 35_000,
  propertyManagement: 60_000,

  liveInStaff: 2,
  securityTeam: 1,
  propertyManagers: 1,
  avgStaffSalary: 85_000,

  infinityPool: true,
  wineClimateControl: false,
  smartHomeUpdates: true,

  closingCosts: 150_000,
  renovationCosts: 0,

  ltvRatio: 50,
  interestRate: 5.5,
  loanTermYears: 30,

  holdingStructure: 'llc',

  baseAppreciationRate: 3.5,
  scarcityPrivateBeach: false,
  scarcityHistoricHeritage: false,
  scarcityStarchitect: false,
  scarcityUniqueView: false,

  holdPeriodYears: 10,
  targetExitProfit: 5_000_000,

  priceBracket: 'ultra',
  marketRegion: 'beverly-hills',

  propertyTaxRate: 1.1,
  annualInsurance: 75_000,
};

/* ── Generate proportional defaults based on property price ── */
function generateScaledDefaults(price: number): Partial<SimState> {
  // Price bracket thresholds
  const isUltra = price >= 10_000_000;
  const isPremium = price >= 5_000_000;

  // Gross rent: ~6% of value for luxury short-term / executive rental
  const grossAnnualRent = round(price * 0.06, 25_000);

  // Closing costs: ~3% of purchase price
  const closingCosts = round(price * 0.03, 5_000);

  // Renovation: scaled by tier
  const renovationCosts = isUltra ? round(price * 0.05, 50_000)
    : isPremium ? round(price * 0.04, 25_000)
    : round(price * 0.06, 25_000); // entry-luxury needs more "lift"

  // Property management: 10% of gross rent
  const propertyManagement = round(grossAnnualRent * 0.10, 5_000);

  // Insurance: ~0.5% of value
  const annualInsurance = round(price * 0.005, 1_000);

  // Property Tax: higher default for entry/premium, adjustable
  const propertyTaxRate = price >= 10_000_000 ? 1.1 : 1.2;

  // Luxury operating expenses — scale with price tier
  const concierge = isPremium ? round(price * 0.008, 10_000) : 0;
  const specializedSecurity = isPremium ? round(price * 0.012, 10_000) : 0;
  const highEndLandscaping = round(price * (isUltra ? 0.006 : isPremium ? 0.004 : 0.0012), 1_000);
  const poolMaintenance = round(price * (isUltra ? 0.003 : isPremium ? 0.002 : 0.0008), 1_000);
  const wineClimate = isUltra ? round(price * 0.0017, 5_000) : 0;
  const smartHomeSystems = isPremium ? round(price * 0.0023, 5_000) : round(price * 0.0012, 1_000);

  // Staffing — only for high-end
  const liveInStaff = isUltra ? 2 : 0;
  const securityTeam = isUltra ? 1 : 0;
  const propertyManagers = isPremium ? 1 : 0;
  const avgStaffSalary = 85_000;

  // Specialized maintenance
  const infinityPool = isPremium;
  const wineClimateControl = false;
  const smartHomeUpdates = isPremium;

  // Price bracket for market DOM data
  const priceBracket: SimState['priceBracket'] = isUltra ? 'ultra' : isPremium ? 'premium' : 'entry';

  // Hold & exit scaled to value
  const holdPeriodYears = 10;
  const targetExitProfit = round(price * 0.30, 500_000) || 500_000;

  return {
    propertyValue: price,
    grossAnnualRent,
    vacancyRate: 10,
    closingCosts,
    renovationCosts,
    concierge,
    specializedSecurity,
    highEndLandscaping,
    poolMaintenance,
    wineClimate,
    smartHomeSystems,
    propertyManagement,
    liveInStaff,
    securityTeam,
    propertyManagers,
    avgStaffSalary,
    infinityPool,
    wineClimateControl,
    smartHomeUpdates,
    priceBracket,
    propertyTaxRate,
    annualInsurance,
    holdPeriodYears,
    targetExitProfit,
  };
}

/** Round to nearest step */
function round(v: number, step: number): number {
  return Math.round(v / step) * step;
}

/* ── Neighborhood detect ── */
const ADDRESS_KEYWORDS: Record<string, string[]> = {
  'miami-beach': ['miami', 'south beach', 'biscayne', 'coral gables', 'brickell', 'key biscayne'],
  'palm-beach': ['palm beach', 'west palm', 'jupiter', 'boca raton'],
  'bel-air': ['bel air', 'bel-air', 'holmby hills'],
  'beverly-hills': ['beverly hills', 'trousdale', 'benedict canyon'],
  'malibu': ['malibu', 'pacific palisades'],
  'hamptons': ['hamptons', 'east hampton', 'southampton', 'montauk'],
  'aspen': ['aspen', 'snowmass'],
  'monaco': ['monaco', 'monte carlo'],
  'manhattan': ['manhattan', 'tribeca', 'soho', 'new york', 'nyc'],
  'mayfair': ['mayfair', 'belgravia', 'knightsbridge', 'london'],
  'saint-tropez': ['saint-tropez', 'st tropez', 'ramatuelle'],
  'paris-16': ['paris', '16e', '16th', 'passy', 'auteuil'],
};

function detectRegion(address: string): string {
  const lower = address.toLowerCase();
  for (const [key, keywords] of Object.entries(ADDRESS_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return key;
  }
  return 'beverly-hills';
}

/* ── Market data for liquidity forecasting ── */
const MARKET_LIQUIDITY: Record<string, { label: string; avgDOM: Record<string, number>; brokerFee: number }> = {
  'miami-beach':   { label: 'Miami Beach, FL',      avgDOM: { ultra: 280, premium: 180, entry: 90 },  brokerFee: 5 },
  'palm-beach':    { label: 'Palm Beach, FL',        avgDOM: { ultra: 320, premium: 200, entry: 110 }, brokerFee: 5 },
  'bel-air':       { label: 'Bel Air, CA',           avgDOM: { ultra: 350, premium: 220, entry: 120 }, brokerFee: 5 },
  'beverly-hills': { label: 'Beverly Hills, CA',     avgDOM: { ultra: 300, premium: 190, entry: 100 }, brokerFee: 5 },
  'malibu':        { label: 'Malibu, CA',            avgDOM: { ultra: 360, premium: 240, entry: 130 }, brokerFee: 5 },
  'hamptons':      { label: 'The Hamptons, NY',      avgDOM: { ultra: 400, premium: 260, entry: 150 }, brokerFee: 5 },
  'aspen':         { label: 'Aspen, CO',             avgDOM: { ultra: 310, premium: 200, entry: 100 }, brokerFee: 6 },
  'monaco':        { label: 'Monte Carlo, Monaco',   avgDOM: { ultra: 450, premium: 300, entry: 160 }, brokerFee: 4 },
  'manhattan':     { label: 'Manhattan, NY',         avgDOM: { ultra: 270, premium: 160, entry: 80 },  brokerFee: 6 },
  'mayfair':       { label: 'Mayfair, London',       avgDOM: { ultra: 380, premium: 250, entry: 140 }, brokerFee: 3 },
  'saint-tropez':  { label: 'Saint-Tropez, France',  avgDOM: { ultra: 500, premium: 340, entry: 200 }, brokerFee: 5 },
  'paris-16':      { label: 'Paris 16e, France',     avgDOM: { ultra: 340, premium: 210, entry: 120 }, brokerFee: 5 },
};

/* ── Tax impact by holding structure ── */
const TAX_PROFILES: Record<string, { label: string; effectiveCapGainRate: number; yearlyBenefit: number; setupCost: number; description: string }> = {
  personal: { label: 'Individual Ownership', effectiveCapGainRate: 0.238, yearlyBenefit: 0,     setupCost: 0,      description: 'Direct ownership. Eligible for Homestead Exemption and 3% Save Our Homes cap. No liability shield.' },
  llc:      { label: 'Domestic LLC',         effectiveCapGainRate: 0.20,  yearlyBenefit: 0.003, setupCost: 15_000, description: 'Florida LLC. Pass-through entity with personal liability protection. Annual filings and legal maintenance.' },
  trust:    { label: 'Irrevocable Trust',    effectiveCapGainRate: 0.15,  yearlyBenefit: 0.005, setupCost: 50_000, description: 'Trust managed by a Trustee. Removes asset from taxable estate. Step-up in basis for heirs.' },
  foreign:  { label: 'Foreign Corporate Structure', effectiveCapGainRate: 0.20, yearlyBenefit: 0.002, setupCost: 30_000, description: 'Offshore corp (e.g. BVI) holds FL LLC. Used by international buyers. FIRPTA 15% withholding applies.' },
};

/* ═══════════════════════════════════════════════════════════════
   FINANCIAL ENGINE
   ═══════════════════════════════════════════════════════════════ */

function useFinancials(s: SimState) {
  return useMemo(() => {
    // ── Operating Expenses ──
    const luxuryOpex =
      s.concierge + s.specializedSecurity + s.highEndLandscaping +
      s.poolMaintenance + s.wineClimate + s.smartHomeSystems + s.propertyManagement;

    const totalStaff = s.liveInStaff + s.securityTeam + s.propertyManagers;
    const staffingCost = totalStaff * s.avgStaffSalary;

    const specializedMaint =
      (s.infinityPool ? 48_000 : 0) +
      (s.wineClimateControl ? 18_000 : 0) +
      (s.smartHomeUpdates ? 22_000 : 0);

    const totalCarryCost = luxuryOpex + staffingCost + specializedMaint +
      (s.propertyValue * s.propertyTaxRate / 100) + s.annualInsurance;

    // ── 1. NOI = (Gross Rental Income − Vacancy Loss) − Operating Expenses ──
    const vacancyLoss = s.grossAnnualRent * (s.vacancyRate / 100);
    const effectiveRent = s.grossAnnualRent - vacancyLoss;
    const noi = effectiveRent - totalCarryCost;

    // ── 2. Cap Rate = NOI / Property Value ──
    const capRate = (noi / s.propertyValue) * 100;

    // ── Debt Service ──
    const loanAmount = s.propertyValue * (s.ltvRatio / 100);
    const equityInvested = s.propertyValue - loanAmount;
    const monthlyRate = s.interestRate / 100 / 12;
    const numPayments = s.loanTermYears * 12;
    const monthlyPayment = loanAmount > 0
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0;
    const annualDebtService = monthlyPayment * 12;
    const dscr = annualDebtService > 0 ? noi / annualDebtService : Infinity;

    // ── 3. Cash-on-Cash = Annual Pre-Tax Cash Flow / Total Cash Invested ──
    // Total Cash Invested = Down Payment + Closing Costs + Immediate Renovations + Structure Setup
    const annualCashFlow = noi - annualDebtService;
    const totalCashInvested = equityInvested + s.closingCosts + s.renovationCosts + TAX_PROFILES[s.holdingStructure].setupCost;
    const cashOnCash = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;

    // ── Scarcity Multiplier ──
    let scarcityBonus = 0;
    if (s.scarcityPrivateBeach) scarcityBonus += 1.2;
    if (s.scarcityHistoricHeritage) scarcityBonus += 0.8;
    if (s.scarcityStarchitect) scarcityBonus += 1.0;
    if (s.scarcityUniqueView) scarcityBonus += 0.6;
    const effectiveAppreciation = s.baseAppreciationRate + scarcityBonus;

    // ── Projected Value / Equity Over Time ──
    const years = Array.from({ length: s.holdPeriodYears }, (_, i) => i + 1);
    const projectedValues = years.map((y) => s.propertyValue * Math.pow(1 + effectiveAppreciation / 100, y));
    const remainingLoan = years.map((y) => {
      if (loanAmount === 0) return 0;
      const paid = y * 12;
      const factor = Math.pow(1 + monthlyRate, numPayments);
      const factorPaid = Math.pow(1 + monthlyRate, paid);
      return loanAmount * (factor - factorPaid) / (factor - 1);
    });
    const equityOverTime = projectedValues.map((v, i) => v - remainingLoan[i]);
    const cumulativeCashFlow = years.map((y) => annualCashFlow * y);

    // ── 4. IRR (Newton-Raphson) ──
    // Year 0: Negative Cash Out = Down Payment + Closing Costs + Renovations + Structure Setup
    // Years 1–N: Annual Cash Flow
    // Year N: + Net Sale Proceeds
    const taxProfile = TAX_PROFILES[s.holdingStructure];
    const exitValue = projectedValues[projectedValues.length - 1] || s.propertyValue;
    const capitalGain = exitValue - s.propertyValue;
    const taxOnGain = Math.max(0, capitalGain) * taxProfile.effectiveCapGainRate;
    const brokerFee = MARKET_LIQUIDITY[s.marketRegion]?.brokerFee ?? 5;
    const sellingCosts = exitValue * (brokerFee / 100);
    const netExitProceeds = exitValue - (remainingLoan[remainingLoan.length - 1] || 0) - taxOnGain - sellingCosts;
    const structureBenefit = taxProfile.yearlyBenefit * s.propertyValue * s.holdPeriodYears;
    const netExitWithBenefit = netExitProceeds + structureBenefit;

    const cashFlows = [-(equityInvested + s.closingCosts + s.renovationCosts + taxProfile.setupCost)];
    for (let y = 0; y < s.holdPeriodYears - 1; y++) {
      cashFlows.push(annualCashFlow + taxProfile.yearlyBenefit * s.propertyValue);
    }
    cashFlows.push(annualCashFlow + netExitWithBenefit);

    // ── 5. Carry Cost Ratio = Annual Holding Costs / Property Value ──
    const carryRatio = (totalCarryCost / s.propertyValue) * 100;

    // ── 6. Break-Even Appreciation Rate ──
    // = (Total Acquisition Costs + Total Holding Costs − Total Rental Income) / (Years Held × Property Value)
    const totalAcquisitionCosts = s.closingCosts + s.renovationCosts + taxProfile.setupCost;
    const totalHoldingCosts = totalCarryCost * s.holdPeriodYears;
    const totalRentalIncome = effectiveRent * s.holdPeriodYears;
    const breakEvenAppreciation = s.holdPeriodYears > 0
      ? ((totalAcquisitionCosts + totalHoldingCosts - totalRentalIncome) / (s.propertyValue * s.holdPeriodYears)) * 100
      : 0;

    let irr = 0.08;
    for (let iter = 0; iter < 200; iter++) {
      let npv = 0, dNpv = 0;
      for (let t = 0; t < cashFlows.length; t++) {
        const disc = Math.pow(1 + irr, t);
        npv += cashFlows[t] / disc;
        if (t > 0) dNpv -= t * cashFlows[t] / Math.pow(1 + irr, t + 1);
      }
      if (Math.abs(dNpv) < 1e-10) break;
      const newIrr = irr - npv / dNpv;
      if (Math.abs(newIrr - irr) < 1e-8) { irr = newIrr; break; }
      irr = newIrr;
    }
    const irrPercent = irr * 100;

    // ── Liquidity Forecast ──
    const mktData = MARKET_LIQUIDITY[s.marketRegion] || MARKET_LIQUIDITY['beverly-hills'];
    const avgDOM = mktData.avgDOM[s.priceBracket] || 300;
    const carryCostDuringListing = (totalCarryCost / 365) * avgDOM;

    // ── Target Exit: Required appreciation ──
    const targetExitValue = s.propertyValue + s.targetExitProfit + sellingCosts + taxOnGain;
    const requiredAppreciation = s.holdPeriodYears > 0
      ? (Math.pow(targetExitValue / s.propertyValue, 1 / s.holdPeriodYears) - 1) * 100
      : 0;

    return {
      luxuryOpex, staffingCost, specializedMaint, totalCarryCost,
      vacancyLoss, effectiveRent,
      noi, capRate,
      loanAmount, equityInvested, totalCashInvested, monthlyPayment, annualDebtService, dscr,
      annualCashFlow, cashOnCash,
      carryRatio, breakEvenAppreciation,
      scarcityBonus, effectiveAppreciation,
      years, projectedValues, equityOverTime, cumulativeCashFlow, remainingLoan,
      irrPercent,
      taxProfile, taxOnGain, sellingCosts, netExitProceeds, netExitWithBenefit, structureBenefit,
      avgDOM, mktData, carryCostDuringListing,
      exitValue, capitalGain,
      requiredAppreciation, targetExitValue,
      totalStaff,
    };
  }, [s]);
}

/* ═══════════════════════════════════════════════════════════════
   UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

function Section({ title, icon, children, defaultOpen = false }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.03]">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-5 text-left group hover:bg-white/[0.02] transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="text-gold-400/50 opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
          <span className="text-base font-medium text-white/90 tracking-wide">{title}</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} className="text-white/30" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-1 space-y-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, step = 1, unit = '', formatFn }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string; formatFn?: (v: number) => string;
}) {
  const display = formatFn ? formatFn(value) : `${value}${unit}`;
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs uppercase tracking-[0.15em] text-white/40 font-medium">{label}</span>
        <span className="text-sm text-gold-400/80 font-mono">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sim-slider w-full" />
    </div>
  );
}

function ToggleGroup({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-xs uppercase tracking-[0.15em] text-white/40 font-medium block mb-2.5">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className={`px-3.5 py-2 text-sm rounded-lg border transition-all duration-200 ${
              value === opt.value
                ? 'bg-gold-400/10 border-gold-400/25 text-gold-400'
                : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/15 hover:text-white/60'
            }`}
          >{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

function NumberStepper({ label, value, onChange, min = 0, max = 10 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/50">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-lg border border-white/10 text-white/40 hover:border-white/25 hover:text-white/80 text-sm flex items-center justify-center transition-colors"
        >−</button>
        <span className="text-base text-white/80 font-mono w-5 text-center">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-lg border border-white/10 text-white/40 hover:border-white/25 hover:text-white/80 text-sm flex items-center justify-center transition-colors"
        >+</button>
      </div>
    </div>
  );
}

function ToggleSwitch({ label, value, onChange, tooltip }: {
  label: string; value: boolean; onChange: (v: boolean) => void; tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/50 flex items-center gap-1.5">
        {label}
        {tooltip && (
          <span className="group relative">
            <Info size={12} className="text-white/20 cursor-help" />
            <span className="invisible group-hover:visible absolute left-5 -top-1 z-50 w-48 p-2 text-xs text-white/70 bg-dark-800 border border-white/10 rounded-lg shadow-xl">
              {tooltip}
            </span>
          </span>
        )}
      </span>
      <button onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all duration-300 relative ${value ? 'bg-gold-400/20' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${
          value ? 'left-[22px] bg-gold-400' : 'left-0.5 bg-white/40'
        }`} />
      </button>
    </div>
  );
}

/* helper: formatted $ */
function fmt$(v: number, decimals = 0): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(decimals || 1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

/* ═══════════════════════════════════════════════════════════════
   KPI CARD
   ═══════════════════════════════════════════════════════════════ */

function KpiCard({ label, value, sub, color = 'white', icon }: {
  label: string; value: string; sub?: string; color?: string; icon?: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    green: 'text-emerald-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
    gold: 'text-gold-400',
    white: 'text-white/80',
  };
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 hover:border-white/[0.1] transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-white/30">{icon}</span>}
        <span className="text-[11px] uppercase tracking-[0.15em] text-white/35 font-medium">{label}</span>
      </div>
      <div className={`text-2xl font-mono font-bold ${colorMap[color] || colorMap.white}`}>{value}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW DASHBOARD
   ═══════════════════════════════════════════════════════════════ */

function OverviewDashboard({ state, fin }: { state: SimState; fin: ReturnType<typeof useFinancials> }) {
  return (
    <div className="sim-visual-card space-y-6">

      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-1">Investment Overview</div>
        <div className="text-2xl font-display text-white/85">Core Financial Metrics</div>
        <div className="text-sm text-white/35 mt-1">
          {fmt$(state.propertyValue)} · {TAX_PROFILES[state.holdingStructure].label} · {state.holdPeriodYears}yr hold
        </div>

        {/* Chiffres avancés et scores synthétiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="bg-dark-900/60 border border-gold-400/10 rounded-lg p-4 text-center">
            <div className="text-xs text-dark-400 mb-1">Initial Investment</div>
            <div className="font-display text-lg text-white">{fmt$(fin.totalCashInvested)}</div>
          </div>
          <div className="bg-dark-900/60 border border-gold-400/10 rounded-lg p-4 text-center">
            <div className="text-xs text-dark-400 mb-1">Annual Opex</div>
            <div className="font-display text-lg text-white">{fmt$(fin.totalCarryCost)}</div>
          </div>
          <div className="bg-dark-900/60 border border-gold-400/10 rounded-lg p-4 text-center">
            <div className="text-xs text-dark-400 mb-1">Liquidity Score</div>
            <div className="font-display text-lg text-emerald-400">{fin.liquidityScore ? fin.liquidityScore : '—'}</div>
          </div>
          <div className="bg-dark-900/60 border border-gold-400/10 rounded-lg p-4 text-center">
            <div className="text-xs text-dark-400 mb-1">Risk Score</div>
            <div className="font-display text-lg text-red-400">{fin.riskScore ? fin.riskScore : '—'}</div>
          </div>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Net Operating Income"
          value={fmt$(fin.noi)}
          sub={`(${fmt$(fin.effectiveRent)} rent − ${state.vacancyRate}% vacancy) − ${fmt$(fin.totalCarryCost)} opex`}
          color={fin.noi >= 0 ? 'green' : 'red'}
          icon={<DollarSign size={14} />}
        />
        <KpiCard
          label="Cap Rate"
          value={`${fin.capRate.toFixed(2)}%`}
          sub={`NOI ${fmt$(fin.noi)} / ${fmt$(state.propertyValue)}`}
          color={fin.capRate >= 3 ? 'green' : fin.capRate >= 1 ? 'amber' : 'red'}
          icon={<Percent size={14} />}
        />
        <KpiCard
          label="Cash-on-Cash Return"
          value={`${fin.cashOnCash.toFixed(2)}%`}
          sub={`${fmt$(fin.annualCashFlow)} / ${fmt$(fin.totalCashInvested)} invested`}
          color={fin.cashOnCash >= 4 ? 'green' : fin.cashOnCash >= 0 ? 'amber' : 'red'}
          icon={<CreditCard size={14} />}
        />
        <KpiCard
          label="IRR"
          value={`${isFinite(fin.irrPercent) ? fin.irrPercent.toFixed(1) : '\u2014'}%`}
          sub={`${state.holdPeriodYears}-year hold`}
          color={fin.irrPercent >= 8 ? 'green' : fin.irrPercent >= 4 ? 'amber' : 'red'}
          icon={<TrendingUp size={14} />}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="LTV"
          value={`${state.ltvRatio}%`}
          sub={`Loan: ${fmt$(fin.loanAmount)}`}
          icon={<Landmark size={14} />}
        />
        <KpiCard
          label="Annual Debt Service"
          value={fmt$(fin.annualDebtService)}
          sub={`Monthly: ${fmt$(fin.monthlyPayment)}`}
          icon={<CalendarClock size={14} />}
        />
        <KpiCard
          label="DSCR"
          value={isFinite(fin.dscr) ? fin.dscr.toFixed(2) : '\u221E'}
          sub={fin.dscr >= 1.25 ? 'Healthy coverage' : fin.dscr >= 1 ? 'Tight' : 'Negative coverage'}
          color={fin.dscr >= 1.25 ? 'green' : fin.dscr >= 1 ? 'amber' : 'red'}
          icon={<ShieldCheck size={14} />}
        />
        <KpiCard
          label="Carry Cost Ratio"
          value={`${fin.carryRatio.toFixed(2)}%`}
          sub={`${fmt$(fin.totalCarryCost)}/yr to hold ${fmt$(state.propertyValue)}`}
          color={fin.carryRatio <= 1.5 ? 'green' : fin.carryRatio <= 3 ? 'amber' : 'red'}
          icon={<Gem size={14} />}
        />
        <KpiCard
          label="Break-Even Appreciation"
          value={`${fin.breakEvenAppreciation.toFixed(2)}%`}
          sub={fin.breakEvenAppreciation <= fin.effectiveAppreciation ? 'Covered by expected growth' : `Need ${(fin.breakEvenAppreciation - fin.effectiveAppreciation).toFixed(1)}% more growth`}
          color={fin.breakEvenAppreciation <= fin.effectiveAppreciation ? 'green' : fin.breakEvenAppreciation <= fin.effectiveAppreciation + 2 ? 'amber' : 'red'}
          icon={<Target size={14} />}
        />
        <KpiCard
          label="Scarcity Multiplier"
          value={`+${fin.scarcityBonus.toFixed(1)}%`}
          sub={`Effective: ${fin.effectiveAppreciation.toFixed(1)}%/yr`}
          color={fin.scarcityBonus > 0 ? 'gold' : 'white'}
          icon={<Gem size={14} />}
        />
      </div>

      {/* Comparison bar: Cap rate vs benchmarks */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
        <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-4">Cap Rate vs Asset Classes</div>
        <div className="space-y-3">
          {[
            { label: 'This Property', value: fin.capRate, color: 'bg-gold-400' },
            { label: 'S&P 500 Div Yield', value: 1.5, color: 'bg-blue-400/60' },
            { label: '10Y Treasury', value: 4.2, color: 'bg-emerald-400/60' },
            { label: 'Prime Commercial RE', value: 5.5, color: 'bg-purple-400/60' },
            { label: 'REIT Average', value: 4.0, color: 'bg-amber-400/60' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-36 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${Math.min(100, (item.value / 8) * 100)}%` }} />
              </div>
              <span className="text-xs font-mono text-white/50 w-12 text-right">{item.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FINANCIAL PROJECTIONS CHART
   ═══════════════════════════════════════════════════════════════ */

function FinancialProjectionsChart({ state, fin }: { state: SimState; fin: ReturnType<typeof useFinancials> }) {
  const labels = fin.years.map((y) => `Y${y}`);

  const data = {
    labels,
    datasets: [
      {
        label: 'Asset Value',
        data: fin.projectedValues,
        borderColor: '#a0a0a8',
        backgroundColor: 'rgba(160,160,168,0.06)',
        fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4,
        yAxisID: 'y' as const,
      },
      {
        label: 'Net Equity',
        data: fin.equityOverTime,
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74,222,128,0.05)',
        fill: true, tension: 0.4, borderWidth: 1.5, pointRadius: 0, borderDash: [4, 4],
        yAxisID: 'y' as const,
      },
      {
        label: 'Cumulative Cash Flow',
        data: fin.cumulativeCashFlow,
        borderColor: fin.annualCashFlow >= 0 ? '#38bdf8' : '#f87171',
        backgroundColor: fin.annualCashFlow >= 0 ? 'rgba(56,189,248,0.05)' : 'rgba(248,113,113,0.05)',
        fill: true, tension: 0.4, borderWidth: 1.5, pointRadius: 0,
        yAxisID: 'y1' as const,
      },
    ],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: true, position: 'top' as const, labels: { color: '#888', font: { size: 12 }, boxWidth: 14, padding: 16 } },
      tooltip: {
        backgroundColor: '#1a1a1e', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        titleColor: '#e0e0e0', bodyColor: '#ccc', padding: 14,
        callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${fmt$(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { ticks: { color: '#555', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.02)' } },
      y: { position: 'left' as const, ticks: { color: '#555', font: { size: 11 }, callback: (v: any) => fmt$(v) }, grid: { color: 'rgba(255,255,255,0.03)' } },
      y1: { position: 'right' as const, ticks: { color: '#555', font: { size: 11 }, callback: (v: any) => fmt$(v) }, grid: { display: false } },
    },
  };

  return (
    <div className="sim-visual-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-1">Financial Projections</div>
          <div className="flex items-center">
            <span className="text-2xl font-display text-white/85">
              {fin.effectiveAppreciation.toFixed(1)}% Effective Growth
              <span className="text-sm text-white/30 ml-2">&middot;</span>
              <span className="text-sm text-white/40 ml-2">{state.ltvRatio}% LTV</span>
              {fin.scarcityBonus > 0 && (
                <span className="text-sm text-gold-400/60 ml-2">+{fin.scarcityBonus.toFixed(1)}% scarcity</span>
              )}
            </span>
            <GraphExplainer
              title="Financial Projections"
              explanation="This chart plots three trajectories over your hold period: Asset Value (total property worth), Net Equity (value minus remaining debt), and Cumulative Cash Flow (total rental income minus all expenses). It shows how leverage amplifies equity growth and whether the property generates positive cash flow year over year."
            />
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-white/35 mb-1">Est. IRR</div>
          <div className={`text-3xl font-mono font-bold ${fin.irrPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {isFinite(fin.irrPercent) ? `${fin.irrPercent.toFixed(1)}%` : '\u2014'}
          </div>
        </div>
      </div>
      <div className="h-[380px]"><Line data={data} options={options} /></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CARRY COST BREAKDOWN
   ═══════════════════════════════════════════════════════════════ */

function CarryCostBreakdown({ state, fin }: { state: SimState; fin: ReturnType<typeof useFinancials> }) {
  const taxCost = state.propertyValue * state.propertyTaxRate / 100;
  const labels = [
    'Concierge & Services', 'Specialized Security', 'Landscaping', 'Pool & Water',
    'Wine Climate', 'Smart Home', 'Property Mgmt', 'Staffing', 'Spec. Maintenance',
    'Property Tax', 'Insurance',
  ];
  const values = [
    state.concierge, state.specializedSecurity, state.highEndLandscaping, state.poolMaintenance,
    state.wineClimate, state.smartHomeSystems, state.propertyManagement, fin.staffingCost, fin.specializedMaint,
    taxCost, state.annualInsurance,
  ];
  const colors = [
    'rgba(201,169,110,0.6)', 'rgba(248,113,113,0.6)', 'rgba(74,222,128,0.5)', 'rgba(56,189,248,0.5)',
    'rgba(168,85,247,0.5)', 'rgba(251,191,36,0.5)', 'rgba(160,160,180,0.5)', 'rgba(236,72,153,0.5)',
    'rgba(52,211,153,0.5)', 'rgba(239,68,68,0.4)', 'rgba(100,116,139,0.5)',
  ];

  // ── Doughnut chart data ──
  const doughnutData = { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: 'rgba(20,20,20,1)', borderWidth: 2 }] };
  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '62%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1e', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        titleColor: '#e0e0e0', bodyColor: '#ccc', padding: 10,
        callbacks: { label: (ctx: any) => `${ctx.label}: ${fmt$(ctx.parsed)}` },
      },
    },
  };

  // ── Horizontal Bar chart — sorted cost categories ──
  const sorted = labels.map((l, i) => ({ label: l, value: values[i], color: colors[i] })).sort((a, b) => b.value - a.value);
  const barData = {
    labels: sorted.map(s => s.label),
    datasets: [{
      data: sorted.map(s => s.value),
      backgroundColor: sorted.map(s => s.color),
      borderColor: 'rgba(20,20,20,1)',
      borderWidth: 1,
      borderRadius: 4,
      barThickness: 18,
    }],
  };
  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.35)', callback: (v: any) => fmt$(v) }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }, grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1e', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        titleColor: '#e0e0e0', bodyColor: '#ccc', padding: 10,
        callbacks: { label: (ctx: any) => `${ctx.label}: ${fmt$(ctx.parsed.x)}` },
      },
    },
  };

  // ── Line chart — 12-month cumulative cost projection ──
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyCost = fin.totalCarryCost / 12;
  const monthlyRent = fin.effectiveRent / 12;
  const cumulCosts = monthLabels.map((_, i) => monthlyCost * (i + 1));
  const cumulIncome = monthLabels.map((_, i) => monthlyRent * (i + 1));
  const cumulNet = monthLabels.map((_, i) => (monthlyRent - monthlyCost) * (i + 1));

  const lineData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Cumulative Costs',
        data: cumulCosts,
        borderColor: 'rgba(248,113,113,0.8)',
        backgroundColor: 'rgba(248,113,113,0.08)',
        fill: true, tension: 0.3, pointRadius: 3, pointHoverRadius: 5,
      },
      {
        label: 'Cumulative Rental Income',
        data: cumulIncome,
        borderColor: 'rgba(74,222,128,0.8)',
        backgroundColor: 'rgba(74,222,128,0.08)',
        fill: true, tension: 0.3, pointRadius: 3, pointHoverRadius: 5,
      },
      {
        label: 'Net Cash Flow',
        data: cumulNet,
        borderColor: 'rgba(201,169,110,0.9)',
        backgroundColor: 'rgba(201,169,110,0.06)',
        fill: true, tension: 0.3, borderDash: [5, 3], pointRadius: 3, pointHoverRadius: 5,
      },
    ],
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.35)' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.35)', callback: (v: any) => fmt$(v) }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.5)', usePointStyle: true, pointStyle: 'circle', padding: 16 } },
      tooltip: {
        backgroundColor: '#1a1a1e', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        titleColor: '#e0e0e0', bodyColor: '#ccc', padding: 10,
        callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${fmt$(ctx.parsed.y)}` },
      },
    },
  };

  return (
    <div className="sim-visual-card space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-1">Ownership Economics &mdash; Annual Holding Analysis</div>
        <div className="text-2xl font-display text-white/85 mb-1">
          {fmt$(fin.totalCarryCost)}<span className="text-sm text-white/30 ml-1">/year</span>
        </div>
        <div className="text-sm text-white/30">
          {fmt$(fin.totalCarryCost / 12)}/month &middot; {fin.carryRatio.toFixed(2)}% of value
        </div>
      </div>

      {/* Row 1: Doughnut + legend */}
      <div>
        <h4 className="text-xs uppercase tracking-[0.15em] text-white/40 mb-4">Cost Distribution</h4>
        <div className="flex gap-6 flex-col lg:flex-row">
          <div className="h-[280px] w-[280px] relative flex-shrink-0 mx-auto lg:mx-0">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-white/35 uppercase tracking-wider">Monthly</span>
              <span className="text-lg font-mono text-white/70">{fmt$(fin.totalCarryCost / 12)}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[280px] sim-scrollbar">
            {labels.map((lbl, i) => (
              <div key={lbl} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i] }} />
                  <span className="text-white/50">{lbl}</span>
                </span>
                <span className="text-white/70 font-mono">{fmt$(values[i])}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-white/60 font-medium text-sm">Net after rent</span>
              <span className={`font-mono text-sm font-bold ${fin.noi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fin.noi >= 0 ? '+' : ''}{fmt$(fin.noi)}/yr
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Horizontal bar — ranked costs */}
      <div>
        <h4 className="text-xs uppercase tracking-[0.15em] text-white/40 mb-4">Cost Ranking</h4>
        <div className="h-[340px]">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Row 3: 12-month cumulative cash-flow projection */}
      <div>
        <h4 className="text-xs uppercase tracking-[0.15em] text-white/40 mb-4">12-Month Cumulative Cash Flow</h4>
        <div className="h-[280px]">
          <Line data={lineData} options={lineOptions} />
        </div>
        <div className="mt-3 flex gap-4 text-xs text-white/35">
          <span>Year-end costs: <span className="text-red-400 font-mono">{fmt$(fin.totalCarryCost)}</span></span>
          <span>Year-end income: <span className="text-emerald-400 font-mono">{fmt$(fin.effectiveRent)}</span></span>
          <span>Year-end net: <span className={`font-mono ${fin.noi >= 0 ? 'text-gold-400' : 'text-red-400'}`}>{fin.noi >= 0 ? '+' : ''}{fmt$(fin.noi)}</span></span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAX & STRUCTURING PANEL
   ═══════════════════════════════════════════════════════════════ */

function TaxStructuringPanel({ state, fin }: { state: SimState; fin: ReturnType<typeof useFinancials> }) {
  const structures = Object.entries(TAX_PROFILES).map(([key, profile]) => {
    const gain = fin.capitalGain;
    const tax = Math.max(0, gain) * profile.effectiveCapGainRate;
    const benefit = profile.yearlyBenefit * state.propertyValue * state.holdPeriodYears;
    const net = fin.exitValue - (fin.remainingLoan[fin.remainingLoan.length - 1] || 0) - tax - fin.sellingCosts + benefit - profile.setupCost;
    const isActive = key === state.holdingStructure;
    return { key, ...profile, tax, benefit, net, isActive };
  });

  const bestStructure = structures.reduce((a, b) => a.net > b.net ? a : b);

  return (
    <div className="sim-visual-card space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-1">Tax Efficiency & Structuring</div>
        <div className="text-2xl font-display text-white/85">Holding Structure Comparison</div>
        <div className="text-sm text-white/35 mt-1">
          Estimated capital gain: {fmt$(fin.capitalGain)} over {state.holdPeriodYears} years
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {structures.map((s) => (
          <div key={s.key}
            className={`relative rounded-xl border p-5 transition-all ${
              s.isActive
                ? 'bg-gold-400/[0.06] border-gold-400/25'
                : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]'
            }`}
          >
            {s.key === bestStructure.key && (
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-emerald-400/15 text-emerald-400 border border-emerald-400/25 rounded-full">
                Optimal
              </span>
            )}
            <div className="flex items-center gap-2 mb-3">
              <Scale size={14} className={s.isActive ? 'text-gold-400' : 'text-white/30'} />
              <span className={`text-sm font-semibold ${s.isActive ? 'text-gold-400' : 'text-white/70'}`}>{s.label}</span>
            </div>
            <p className="text-xs text-white/30 mb-4 leading-relaxed">{s.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Effective CG Rate</span>
                <span className="text-white/60 font-mono">{(s.effectiveCapGainRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Tax on Exit</span>
                <span className="text-red-400/70 font-mono">&minus;{fmt$(s.tax)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Annual Benefit</span>
                <span className="text-emerald-400/70 font-mono">+{fmt$(s.benefit)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Setup Cost</span>
                <span className="text-white/50 font-mono">{fmt$(s.setupCost)}</span>
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex justify-between">
                <span className="text-white/60 text-xs font-medium">Net Proceeds</span>
                <span className={`font-mono text-sm font-bold ${s.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmt$(s.net)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scarcity Value section */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gem size={14} className="text-gold-400/60" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/35 font-medium">Scarcity Value Premium</span>
        </div>
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-3xl font-mono font-bold text-gold-400">+{fin.scarcityBonus.toFixed(1)}%</span>
          <span className="text-sm text-white/35">added to {state.baseAppreciationRate}% base &rarr; {fin.effectiveAppreciation.toFixed(1)}% effective</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Private Beach Access', active: state.scarcityPrivateBeach, bonus: '+1.2%' },
            { label: 'Historic Heritage', active: state.scarcityHistoricHeritage, bonus: '+0.8%' },
            { label: '"Starchitect" Design', active: state.scarcityStarchitect, bonus: '+1.0%' },
            { label: 'Unique Panoramic View', active: state.scarcityUniqueView, bonus: '+0.6%' },
          ].map((f) => (
            <div key={f.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
              f.active ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20' : 'bg-white/[0.02] text-white/30 border border-white/[0.04]'
            }`}>
              {f.active ? '\u2605' : '\u2606'} {f.label} <span className="ml-auto font-mono">{f.bonus}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXIT STRATEGY & LIQUIDITY PANEL
   ═══════════════════════════════════════════════════════════════ */

function ExitStrategyPanel({ state, fin }: { state: SimState; fin: ReturnType<typeof useFinancials> }) {
  const waterfallLabels = ['Purchase', 'Appreciation', 'Tax on Gain', 'Selling Costs', 'Remaining Debt', 'Net Proceeds'];
  const appreciation = fin.exitValue - state.propertyValue;
  const remainDebt = fin.remainingLoan[fin.remainingLoan.length - 1] || 0;
  const waterfallData = [
    state.propertyValue, appreciation, -fin.taxOnGain, -fin.sellingCosts, -remainDebt, fin.netExitWithBenefit,
  ];
  const waterfallColors = [
    'rgba(160,160,180,0.4)', 'rgba(74,222,128,0.5)', 'rgba(248,113,113,0.5)',
    'rgba(168,85,247,0.4)', 'rgba(251,191,36,0.4)', 'rgba(160,160,180,0.6)',
  ];

  const barData = {
    labels: waterfallLabels,
    datasets: [{
      label: 'Exit Waterfall',
      data: waterfallData,
      backgroundColor: waterfallColors,
      borderColor: 'rgba(20,20,20,1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };
  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1e', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        titleColor: '#e0e0e0', bodyColor: '#ccc',
        callbacks: { label: (ctx: any) => `${ctx.parsed.y >= 0 ? '+' : ''}${fmt$(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { ticks: { color: '#555', font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: '#555', font: { size: 11 }, callback: (v: any) => fmt$(v) }, grid: { color: 'rgba(255,255,255,0.03)' } },
    },
  };

  const totalGain = fin.netExitWithBenefit - fin.equityInvested;
  const profitMultiple = fin.equityInvested > 0 ? fin.netExitWithBenefit / fin.equityInvested : 0;

  return (
    <div className="space-y-4">
      {/* Exit Waterfall */}
      <div className="sim-visual-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-1">Exit Strategy</div>
            <div className="text-2xl font-display text-white/85">
              {state.holdPeriodYears}yr Hold &middot; {TAX_PROFILES[state.holdingStructure].label}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-white/35 mb-1">Net Gain</div>
            <div className={`text-3xl font-mono font-bold ${totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}{fmt$(totalGain)}
            </div>
            <div className="text-xs text-white/30 mt-0.5">{profitMultiple.toFixed(2)}x equity</div>
          </div>
        </div>
        <div className="h-[300px]"><Bar data={barData} options={barOptions} /></div>
      </div>

      {/* Liquidity Forecasting */}
      <div className="sim-visual-card">
        <div className="flex items-center gap-2 mb-5">
          <Timer size={16} className="text-gold-400/60" />
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-0.5">Liquidity Forecasting</div>
            <div className="text-lg font-display text-white/80">
              {fin.mktData.label} &middot; {state.priceBracket === 'ultra' ? '$10M+' : state.priceBracket === 'premium' ? '$5\u201310M' : '$2\u20135M'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
            <div className="text-[11px] uppercase tracking-wider text-white/30 mb-1">Avg Days on Market</div>
            <div className="text-3xl font-mono font-bold text-amber-400">{fin.avgDOM}</div>
            <div className="text-xs text-white/30 mt-1">&asymp; {Math.round(fin.avgDOM / 30)} months</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
            <div className="text-[11px] uppercase tracking-wider text-white/30 mb-1">Carry During Listing</div>
            <div className="text-2xl font-mono font-bold text-red-400">{fmt$(fin.carryCostDuringListing)}</div>
            <div className="text-xs text-white/30 mt-1">Burned while waiting</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
            <div className="text-[11px] uppercase tracking-wider text-white/30 mb-1">Broker Fee</div>
            <div className="text-2xl font-mono font-bold text-white/60">{fin.mktData.brokerFee}%</div>
            <div className="text-xs text-white/30 mt-1">{fmt$(fin.sellingCosts)} on exit</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
            <div className="text-[11px] uppercase tracking-wider text-white/30 mb-1">Illiquidity Risk</div>
            <div className={`text-2xl font-mono font-bold ${fin.avgDOM > 360 ? 'text-red-400' : fin.avgDOM > 200 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {fin.avgDOM > 360 ? 'High' : fin.avgDOM > 200 ? 'Medium' : 'Low'}
            </div>
            <div className="text-xs text-white/30 mt-1">
              {fin.avgDOM > 360 ? 'Plan for 12mo+ exit' : fin.avgDOM > 200 ? '6\u201312mo typical' : 'Relatively liquid'}
            </div>
          </div>
        </div>

        {/* Illiquidity bar by region */}
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
          <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-3">Average DOM by Market ({state.priceBracket === 'ultra' ? '$10M+' : state.priceBracket === 'premium' ? '$5\u201310M' : '$2\u20135M'})</div>
          <div className="space-y-2">
            {Object.entries(MARKET_LIQUIDITY)
              .sort(([, a], [, b]) => a.avgDOM[state.priceBracket] - b.avgDOM[state.priceBracket])
              .map(([key, mktDataItem]) => {
                const dom = mktDataItem.avgDOM[state.priceBracket];
                const active = key === state.marketRegion;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className={`text-xs w-40 flex-shrink-0 ${active ? 'text-gold-400 font-semibold' : 'text-white/40'}`}>
                      {active ? '\u25B8 ' : ''}{mktDataItem.label}
                    </span>
                    <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        active ? 'bg-gold-400/70' : dom > 360 ? 'bg-red-400/40' : dom > 200 ? 'bg-amber-400/40' : 'bg-emerald-400/40'
                      }`} style={{ width: `${Math.min(100, (dom / 550) * 100)}%` }} />
                    </div>
                    <span className={`text-xs font-mono w-16 text-right ${active ? 'text-gold-400' : 'text-white/40'}`}>{dom}d</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Target Exit Price */}
      <div className="sim-visual-card">
        <div className="flex items-center gap-2 mb-5">
          <Crosshair size={16} className="text-gold-400/60" />
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-0.5">Target Exit Price Solver</div>
            <div className="text-lg font-display text-white/80">What appreciation do you need?</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
            <div className="text-[11px] uppercase tracking-wider text-white/30 mb-2">Your Target Profit</div>
            <div className="text-3xl font-mono font-bold text-gold-400">{fmt$(state.targetExitProfit)}</div>
            <div className="text-xs text-white/30 mt-1">Net of taxes & fees</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 flex flex-col items-center justify-center">
            <ArrowRight size={20} className="text-white/20 mb-2" />
            <div className="text-[11px] uppercase tracking-wider text-white/30 mb-1">Required Annual Appreciation</div>
            <div className={`text-3xl font-mono font-bold ${fin.requiredAppreciation <= fin.effectiveAppreciation ? 'text-emerald-400' : fin.requiredAppreciation <= fin.effectiveAppreciation + 2 ? 'text-amber-400' : 'text-red-400'}`}>
              {fin.requiredAppreciation.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
            <div className="text-[11px] uppercase tracking-wider text-white/30 mb-2">Current Effective Rate</div>
            <div className="text-3xl font-mono font-bold text-white/60">{fin.effectiveAppreciation.toFixed(1)}%</div>
            <div className={`text-xs mt-1 ${fin.requiredAppreciation <= fin.effectiveAppreciation ? 'text-emerald-400' : 'text-red-400'}`}>
              {fin.requiredAppreciation <= fin.effectiveAppreciation
                ? '\u2713 Target achievable at current rate'
                : `\u2717 Gap of ${(fin.requiredAppreciation - fin.effectiveAppreciation).toFixed(1)}% needed`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GRAPH EXPLAINER TOOLTIP
   ═══════════════════════════════════════════════════════════════ */

function GraphExplainer({ title, explanation }: { title: string; explanation: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex ml-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-gold-400/70 transition-colors cursor-pointer"
        title="What does this graph mean?"
      >
        <HelpCircle size={15} />
        <span className="hidden sm:inline">What does this mean?</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-8 z-50 w-80 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-semibold text-white/80">{title}</span>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   A. MACRO-SHOCK SENSITIVITY HEATMAP
   ═══════════════════════════════════════════════════════════════ */

function MacroShockHeatmap({ state, fin }: { state: SimState; fin: ReturnType<typeof useFinancials> }) {
  // Stress-test: how does property value change with ±rate shifts?
  const rateShifts = [-2, -1, -0.5, 0, +0.5, +1, +2];
  const appreciationShifts = [-2, -1, 0, +1, +2];

  const grid = appreciationShifts.map((appShift) =>
    rateShifts.map((rateShift) => {
      const newRate = state.interestRate + rateShift;
      const newAppreciation = fin.effectiveAppreciation + appShift;
      const futureValue = state.propertyValue * Math.pow(1 + newAppreciation / 100, state.holdPeriodYears);
      // Recalculate debt service
      const loan = state.propertyValue * (state.ltvRatio / 100);
      const mRate = Math.max(0.001, newRate) / 100 / 12;
      const nPay = state.loanTermYears * 12;
      const monthly = loan > 0 ? loan * (mRate * Math.pow(1 + mRate, nPay)) / (Math.pow(1 + mRate, nPay) - 1) : 0;
      const annualDS = monthly * 12;
      const netCF = fin.effectiveRent - fin.totalCarryCost - annualDS;
      const totalReturn = (futureValue - state.propertyValue) + (netCF * state.holdPeriodYears);
      return totalReturn;
    })
  );

  const maxAbs = Math.max(...grid.flat().map(Math.abs), 1);

  function cellColor(val: number): string {
    const ratio = val / maxAbs;
    if (ratio > 0.5) return 'bg-emerald-500/40 text-emerald-300';
    if (ratio > 0.15) return 'bg-emerald-500/20 text-emerald-400/80';
    if (ratio > -0.15) return 'bg-white/[0.04] text-white/50';
    if (ratio > -0.5) return 'bg-red-500/20 text-red-400/80';
    return 'bg-red-500/40 text-red-300';
  }

  return (
    <div className="sim-visual-card">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-1">Macro-Shock Sensitivity</div>
          <div className="flex items-center">
            <span className="text-2xl font-display text-white/85">Interest Rate × Appreciation Stress Test</span>
            <GraphExplainer
              title="Macro-Shock Sensitivity Heatmap"
              explanation="This grid shows how your total investment return changes under different economic scenarios. Each cell combines an interest rate shift (columns) with an appreciation rate shift (rows). Green cells mean positive return, red cells mean negative. It stress-tests your investment against the economy — so you can see exactly what happens if rates spike or the market slows."
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto sim-scrollbar-h">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-[10px] uppercase tracking-wider text-white/25 text-left p-2 w-32">Apprec. \ Rate</th>
              {rateShifts.map((s) => (
                <th key={s} className="text-[10px] uppercase tracking-wider text-white/35 p-2 text-center font-mono">
                  {s >= 0 ? '+' : ''}{s}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appreciationShifts.map((appShift, rowIdx) => (
              <tr key={appShift}>
                <td className="text-xs text-white/40 p-2 font-mono">
                  {appShift >= 0 ? '+' : ''}{appShift}% appr.
                </td>
                {grid[rowIdx].map((val, colIdx) => (
                  <td key={colIdx} className="p-1.5">
                    <div className={`rounded-lg p-2.5 text-center text-xs font-mono font-semibold transition-colors ${cellColor(val)}`}>
                      {val >= 0 ? '+' : ''}{fmt$(val)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 mt-4 text-[10px] text-white/30 uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/40" /> Strong Return</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white/[0.06]" /> Neutral</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/40" /> Loss</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   B. LIFESTYLE BURN RATE GAUGE
   ═══════════════════════════════════════════════════════════════ */

function LifestyleBurnRateGauge({ state, fin }: { state: SimState; fin: ReturnType<typeof useFinancials> }) {
  const dailyCost = fin.totalCarryCost / 365;
  const hourlyCost = dailyCost / 24;
  const monthlyCost = fin.totalCarryCost / 12;
  const perMinute = hourlyCost / 60;

  // Gauge: fill from 0 to max (let max be $2000/day for perspective)
  const maxDailyCost = 2000;
  const fillPercent = Math.min(100, (dailyCost / maxDailyCost) * 100);

  return (
    <div className="sim-visual-card">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-1">Lifestyle Burn Rate</div>
          <div className="flex items-center">
            <span className="text-2xl font-display text-white/85">Daily Cost of Ownership</span>
            <GraphExplainer
              title="Lifestyle Burn Rate Gauge"
              explanation="This gauge turns your scary annual tax and maintenance bill into a digestible daily number. UHNW individuals think in terms of 'burn rates' — this shows you exactly what it costs to own this estate every single day, hour, and minute. It also compares the daily cost to luxury lifestyle benchmarks for perspective."
            />
          </div>
        </div>
      </div>

      {/* Main gauge */}
      <div className="flex flex-col items-center py-8">
        <div className="relative w-64 h-32 overflow-hidden">
          {/* Gauge background arc */}
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 10 95 A 85 85 0 0 1 190 95"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Filled arc */}
            <path
              d="M 10 95 A 85 85 0 0 1 190 95"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${fillPercent * 2.67} 267`}
            />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className="text-4xl font-mono font-bold text-white/90">${Math.round(dailyCost).toLocaleString()}</span>
            <span className="text-xs text-white/35 uppercase tracking-wider">per day</span>
          </div>
        </div>

        {/* Sub-metrics */}
        <div className="grid grid-cols-3 gap-8 mt-8 text-center">
          <div>
            <div className="text-xl font-mono font-bold text-white/70">${Math.round(hourlyCost).toLocaleString()}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/30">per hour</div>
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-gold-400">{fmt$(monthlyCost)}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/30">per month</div>
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-white/70">${perMinute.toFixed(1)}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/30">per minute</div>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   C. HIDDEN DNA LAYER CAKE
   ═══════════════════════════════════════════════════════════════ */

function HiddenDNALayerCake({ state, fin }: { state: SimState; fin: ReturnType<typeof useFinancials> }) {
  // Estimate value breakdown — these ratios shift by price bracket
  const isUltra = state.propertyValue >= 10_000_000;
  const isPremium = state.propertyValue >= 5_000_000;

  // Land value tends to be higher for ultra-luxury (location drives price)
  const landRatio = isUltra ? 0.55 : isPremium ? 0.45 : 0.35;
  const structureRatio = isUltra ? 0.25 : isPremium ? 0.35 : 0.45;
  const intangibleRatio = 1 - landRatio - structureRatio;

  const landValue = state.propertyValue * landRatio;
  const structureValue = state.propertyValue * structureRatio;
  const intangibleValue = state.propertyValue * intangibleRatio;

  // Intangible breakdown
  const intangibles = [
    { label: 'Water Frontage / Views', pct: state.scarcityUniqueView || state.scarcityPrivateBeach ? 40 : 15 },
    { label: 'Zoning & Development Rights', pct: 20 },
    { label: 'Privacy & Exclusivity', pct: state.scarcityPrivateBeach ? 25 : 15 },
    { label: 'Brand / Architect Premium', pct: state.scarcityStarchitect ? 30 : 10 },
    { label: 'Heritage & Provenance', pct: state.scarcityHistoricHeritage ? 25 : 10 },
  ];
  const intangibleTotal = intangibles.reduce((a, b) => a + b.pct, 0);
  const normalizedIntangibles = intangibles.map((i) => ({ ...i, value: intangibleValue * (i.pct / intangibleTotal) }));

  const layers = [
    { label: 'Land Value', value: landValue, color: 'from-emerald-600/30 to-emerald-500/10', border: 'border-emerald-500/25', textColor: 'text-emerald-400', pct: landRatio * 100 },
    { label: 'Structure Value', value: structureValue, color: 'from-blue-600/30 to-blue-500/10', border: 'border-blue-500/25', textColor: 'text-blue-400', pct: structureRatio * 100 },
    { label: 'Intangible Value', value: intangibleValue, color: 'from-gold-400/20 to-gold-400/5', border: 'border-gold-400/25', textColor: 'text-gold-400', pct: intangibleRatio * 100 },
  ];

  // Safety score: higher land ratio = safer investment
  const safetyScore = landRatio >= 0.5 ? 'High' : landRatio >= 0.35 ? 'Moderate' : 'Low';
  const safetyColor = landRatio >= 0.5 ? 'text-emerald-400' : landRatio >= 0.35 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="sim-visual-card">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-1">Hidden DNA</div>
          <div className="flex items-center">
            <span className="text-2xl font-display text-white/85">Value Layer Breakdown</span>
            <GraphExplainer
              title="Hidden DNA Layer Cake"
              explanation="This vertical stack shows the different layers that make up your property's value: Land, Structure, and Intangibles (e.g., water frontage, zoning rights, architect prestige). If a $10M house sits on $5.5M of land, you're much safer than if it's $3.5M of land and $4.5M of architecture that could become dated. Higher land percentage = more resilient investment."
            />
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Investment Safety</div>
          <div className={`text-xl font-mono font-bold ${safetyColor}`}>{safetyScore}</div>
        </div>
      </div>

      {/* Vertical layer cake */}
      <div className="space-y-2 mb-6">
        {layers.map((layer) => (
          <div key={layer.label} className={`bg-gradient-to-r ${layer.color} border ${layer.border} rounded-xl p-5 transition-all`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-semibold ${layer.textColor}`}>{layer.label}</div>
                <div className="text-xs text-white/30 mt-1">{layer.pct.toFixed(0)}% of total value</div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-mono font-bold ${layer.textColor}`}>{fmt$(layer.value)}</div>
              </div>
            </div>
            {/* Proportional bar */}
            <div className="mt-3 h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${layer.textColor.replace('text-', 'bg-')}/30`}
                style={{ width: `${layer.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Intangible breakdown */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5">
        <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-4">Intangible Value Breakdown</div>
        <div className="space-y-2.5">
          {normalizedIntangibles.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-44 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gold-400/30 transition-all duration-500"
                  style={{ width: `${(item.pct / intangibleTotal) * 100}%` }} />
              </div>
              <span className="text-xs font-mono text-gold-400/70 w-16 text-right">{fmt$(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   D. UPGRADE ROI FRONTIER
   ═══════════════════════════════════════════════════════════════ */

function UpgradeROIFrontier({ state, fin }: { state: SimState; fin: ReturnType<typeof useFinancials> }) {
  // Potential upgrades with estimated cost and ARV (After Repair Value) boost
  const isUltra = state.propertyValue >= 10_000_000;
  const priceFactor = state.propertyValue / 15_000_000; // normalize to $15M baseline

  const upgrades = [
    { label: 'Chef\'s Kitchen Remodel', cost: round(350_000 * priceFactor, 25_000) || 100_000, arvBoost: round(550_000 * priceFactor, 25_000) || 175_000, roi: 0, icon: '🍽️' },
    { label: 'Primary Suite Expansion', cost: round(250_000 * priceFactor, 25_000) || 75_000, arvBoost: round(400_000 * priceFactor, 25_000) || 125_000, roi: 0, icon: '🛏️' },
    { label: 'Infinity Pool / Water Feature', cost: round(450_000 * priceFactor, 25_000) || 150_000, arvBoost: round(600_000 * priceFactor, 25_000) || 200_000, roi: 0, icon: '🏊' },
    { label: 'Smart Home Integration', cost: round(180_000 * priceFactor, 10_000) || 60_000, arvBoost: round(250_000 * priceFactor, 10_000) || 80_000, roi: 0, icon: '🤖' },
    { label: 'Home Theater / Entertainment', cost: round(200_000 * priceFactor, 25_000) || 75_000, arvBoost: round(280_000 * priceFactor, 25_000) || 100_000, roi: 0, icon: '🎬' },
    { label: 'Sea Wall / Coastal Protection', cost: round(300_000 * priceFactor, 25_000) || 100_000, arvBoost: round(500_000 * priceFactor, 25_000) || 175_000, roi: 0, icon: '🌊' },
    { label: 'Landscaping & Outdoor Living', cost: round(220_000 * priceFactor, 25_000) || 75_000, arvBoost: round(380_000 * priceFactor, 25_000) || 125_000, roi: 0, icon: '🌿' },
    { label: 'Wine Cellar & Tasting Room', cost: round(150_000 * priceFactor, 10_000) || 50_000, arvBoost: round(200_000 * priceFactor, 10_000) || 70_000, roi: 0, icon: '🍷' },
  ].map((u) => ({ ...u, roi: ((u.arvBoost - u.cost) / u.cost) * 100, netGain: u.arvBoost - u.cost }))
   .sort((a, b) => b.roi - a.roi);

  const labels = upgrades.map((u) => u.label);
  const costs = upgrades.map((u) => u.cost);
  const arvBoosts = upgrades.map((u) => u.arvBoost);

  const data = {
    labels,
    datasets: [
      {
        label: 'Investment Cost',
        data: costs,
        backgroundColor: 'rgba(248,113,113,0.35)',
        borderColor: 'rgba(248,113,113,0.6)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Value Added (ARV)',
        data: arvBoosts,
        backgroundColor: 'rgba(74,222,128,0.35)',
        borderColor: 'rgba(74,222,128,0.6)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: true, position: 'top' as const, labels: { color: '#888', font: { size: 11 }, boxWidth: 12, padding: 14 } },
      tooltip: {
        backgroundColor: '#1a1a1e', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        titleColor: '#e0e0e0', bodyColor: '#ccc', padding: 12,
        callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${fmt$(ctx.parsed.x)}` },
      },
    },
    scales: {
      x: { ticks: { color: '#555', font: { size: 10 }, callback: (v: any) => fmt$(v) }, grid: { color: 'rgba(255,255,255,0.03)' } },
      y: { ticks: { color: '#777', font: { size: 11 } }, grid: { display: false } },
    },
  };

  const totalCostAll = upgrades.reduce((a, b) => a + b.cost, 0);
  const totalARVAll = upgrades.reduce((a, b) => a + b.arvBoost, 0);

  return (
    <div className="sim-visual-card">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/35 mb-1">Upgrade ROI Frontier</div>
          <div className="flex items-center">
            <span className="text-2xl font-display text-white/85">After Repair Value Potential</span>
            <GraphExplainer
              title="Upgrade ROI Frontier"
              explanation="This chart shows how much value each potential upgrade adds compared to its cost. The green bar is the estimated value added (After Repair Value), while the red bar is the investment cost. The ROI percentage tells you your return on each upgrade dollar. It turns the 'work' of renovation into a clear profit calculation — showing exactly where your renovation budget creates the most equity."
            />
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Total Potential ARV</div>
          <div className="text-xl font-mono font-bold text-emerald-400">+{fmt$(totalARVAll)}</div>
          <div className="text-xs text-white/30">for {fmt$(totalCostAll)} invested</div>
        </div>
      </div>

      <div className="h-[380px]">
        <Bar data={data} options={options} />
      </div>

      {/* ROI detail cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-5">
        {upgrades.slice(0, 4).map((u) => (
          <div key={u.label} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5">
            <div className="text-lg mb-1">{u.icon}</div>
            <div className="text-[11px] text-white/40 mb-1 truncate">{u.label}</div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-lg font-mono font-bold ${u.roi >= 40 ? 'text-emerald-400' : u.roi >= 20 ? 'text-amber-400' : 'text-white/50'}`}>
                {u.roi.toFixed(0)}%
              </span>
              <span className="text-[10px] text-white/25">ROI</span>
            </div>
            <div className="text-xs text-white/30 mt-1">
              +{fmt$(u.netGain)} net gain
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SIMULATOR
   ═══════════════════════════════════════════════════════════════ */

export default function Simulator({ address, price }: { address?: string; price?: number }) {
  const [state, setState] = useState<SimState>(() => {
    const detectedRegion = address ? detectRegion(address) : 'beverly-hills';
    const base: SimState = {
      ...DEFAULT_STATE,
      marketRegion: detectedRegion,
    };
    // When a price is provided, scale ALL defaults to match the property value
    if (price != null) {
      return { ...base, ...generateScaledDefaults(price), marketRegion: detectedRegion };
    }
    return base;
  });

  const [activeTab, setActiveTab] = useState('overview');

  const update = useCallback((partial: Partial<SimState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const fin = useFinancials(state);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <ChartNoAxesCombined size={15} /> },
    { key: 'projections', label: 'Projections', icon: <TrendingUp size={15} /> },
    { key: 'carry', label: 'Ownership Economics', icon: <PieChart size={15} /> },
    { key: 'tax', label: 'Tax & Structure', icon: <Scale size={15} /> },
    { key: 'exit', label: 'Exit & Liquidity', icon: <BarChart3 size={15} /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-0 bg-dark-900 rounded-xl border border-white/[0.04] overflow-hidden">
      {/* LEFT PANEL: Parameters */}
      <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col border-r border-white/[0.04] bg-[#0c0c0e]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] bg-gradient-to-b from-gold-400/[0.04] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-400/5 border border-gold-400/25 flex items-center justify-center">
              <Building2 size={18} className="text-gold-400" />
            </div>
            <div>
              <div className="text-base font-semibold text-white/80 tracking-wide">Luxury Investment Simulator</div>
              <div className="text-xs text-gold-400/50">{fmt$(state.propertyValue)} &middot; {TAX_PROFILES[state.holdingStructure].label}</div>
            </div>
          </div>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto sim-scrollbar">
          {/* 1. Core Financial Parameters */}
          <Section title="Core Financials" icon={<DollarSign size={15} />} defaultOpen>
            <SliderInput label="Property Value" value={state.propertyValue} onChange={(v) => update({ propertyValue: v })}
              min={1_000_000} max={100_000_000} step={500_000} formatFn={(v) => fmt$(v)} />
            <SliderInput label="Gross Annual Rent" value={state.grossAnnualRent} onChange={(v) => update({ grossAnnualRent: v })}
              min={0} max={3_000_000} step={25_000} formatFn={(v) => fmt$(v)} />
            <SliderInput label="Vacancy Rate" value={state.vacancyRate} onChange={(v) => update({ vacancyRate: v })}
              min={0} max={50} step={1} unit="%" />

            <div className="h-px bg-white/[0.04] my-3" />
            <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-3">Acquisition Costs</div>
            <SliderInput label="Closing Costs" value={state.closingCosts} onChange={(v) => update({ closingCosts: v })}
              min={0} max={1_000_000} step={10_000} formatFn={(v) => fmt$(v)} />
            <SliderInput label="Immediate Renovations" value={state.renovationCosts} onChange={(v) => update({ renovationCosts: v })}
              min={0} max={5_000_000} step={50_000} formatFn={(v) => fmt$(v)} />

            <div className="h-px bg-white/[0.04] my-3" />
            <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-3">Debt Structure</div>
            <SliderInput label="LTV Ratio" value={state.ltvRatio} onChange={(v) => update({ ltvRatio: v })}
              min={0} max={80} step={5} formatFn={(v) => v === 0 ? 'All-Cash' : `${v}%`} />
            <SliderInput label="Interest Rate (Jumbo)" value={state.interestRate} onChange={(v) => update({ interestRate: v })}
              min={2} max={10} step={0.25} unit="%" />
            <SliderInput label="Loan Term" value={state.loanTermYears} onChange={(v) => update({ loanTermYears: v })}
              min={5} max={30} step={5} unit=" years" />

            <div className="h-px bg-white/[0.04] my-3" />
            <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-3">Appreciation & Scarcity</div>
            <SliderInput label="Base Appreciation Rate" value={state.baseAppreciationRate} onChange={(v) => update({ baseAppreciationRate: v })}
              min={0} max={12} step={0.5} unit="%/yr" />
          </Section>

          {/* 2. Luxury Carry Costs */}
          <Section title="Luxury Carry Costs" icon={<ReceiptText size={15} />}>
            <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-3">Luxury Operating Expenses</div>
            <SliderInput label="Concierge & Services" value={state.concierge} onChange={(v) => update({ concierge: v })}
              min={0} max={500_000} step={10_000} formatFn={(v) => fmt$(v)} />
            <SliderInput label="Specialized Security" value={state.specializedSecurity} onChange={(v) => update({ specializedSecurity: v })}
              min={0} max={1_000_000} step={10_000} formatFn={(v) => fmt$(v)} />
            <SliderInput label="High-End Landscaping" value={state.highEndLandscaping} onChange={(v) => update({ highEndLandscaping: v })}
              min={0} max={300_000} step={5_000} formatFn={(v) => fmt$(v)} />
            <SliderInput label="Pool & Water Features" value={state.poolMaintenance} onChange={(v) => update({ poolMaintenance: v })}
              min={0} max={200_000} step={5_000} formatFn={(v) => fmt$(v)} />
            <SliderInput label="Wine Cellar Climate" value={state.wineClimate} onChange={(v) => update({ wineClimate: v })}
              min={0} max={100_000} step={5_000} formatFn={(v) => fmt$(v)} />
            <SliderInput label="Smart Home Systems" value={state.smartHomeSystems} onChange={(v) => update({ smartHomeSystems: v })}
              min={0} max={200_000} step={5_000} formatFn={(v) => fmt$(v)} />
            <SliderInput label="Property Management" value={state.propertyManagement} onChange={(v) => update({ propertyManagement: v })}
              min={0} max={300_000} step={5_000} formatFn={(v) => fmt$(v)} />

            <div className="h-px bg-white/[0.04] my-3" />
            <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-3">Staffing</div>
            <NumberStepper label="Live-In Staff" value={state.liveInStaff} onChange={(v) => update({ liveInStaff: v })} />
            <NumberStepper label="Security Team" value={state.securityTeam} onChange={(v) => update({ securityTeam: v })} />
            <NumberStepper label="Property Managers" value={state.propertyManagers} onChange={(v) => update({ propertyManagers: v })} />
            <SliderInput label="Avg Staff Salary" value={state.avgStaffSalary} onChange={(v) => update({ avgStaffSalary: v })}
              min={40_000} max={200_000} step={5_000} formatFn={(v) => fmt$(v)} />

            <div className="h-px bg-white/[0.04] my-3" />
            <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-3">Specialized Maintenance</div>
            <ToggleSwitch label="Infinity Pool Servicing" value={state.infinityPool} onChange={(v) => update({ infinityPool: v })}
              tooltip="$48K/yr for heated infinity pool maintenance" />
            <ToggleSwitch label="Climate-Controlled Wine Cellar" value={state.wineClimateControl} onChange={(v) => update({ wineClimateControl: v })}
              tooltip="$18K/yr for precision humidity & temp" />
            <ToggleSwitch label="Smart Home System Updates" value={state.smartHomeUpdates} onChange={(v) => update({ smartHomeUpdates: v })}
              tooltip="$22K/yr for Crestron/Savant system updates" />
          </Section>

          {/* 3. Tax & Structure */}
          <Section title="Tax & Holding Structure" icon={<Scale size={15} />}>
            <ToggleGroup label="Holding Structure" value={state.holdingStructure}
              onChange={(v) => update({ holdingStructure: v as SimState['holdingStructure'] })}
              options={[
                { value: 'personal', label: 'Individual Ownership' },
                { value: 'llc', label: 'Domestic LLC' },
                { value: 'trust', label: 'Irrevocable Trust' },
                { value: 'foreign', label: 'Foreign Corporate Structure' },
              ]} />
            <SliderInput label="Property Tax Rate" value={state.propertyTaxRate} onChange={(v) => update({ propertyTaxRate: v })}
              min={0} max={3} step={0.1} unit="%" />
            <SliderInput label="Annual Insurance" value={state.annualInsurance} onChange={(v) => update({ annualInsurance: v })}
              min={10_000} max={500_000} step={5_000} formatFn={(v) => fmt$(v)} />

            <div className="h-px bg-white/[0.04] my-3" />
            <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-3">Scarcity Multiplier</div>
            <ToggleSwitch label="Private Beach Access" value={state.scarcityPrivateBeach}
              onChange={(v) => update({ scarcityPrivateBeach: v })} tooltip="+1.2% annual appreciation uplift" />
            <ToggleSwitch label="Historic Heritage" value={state.scarcityHistoricHeritage}
              onChange={(v) => update({ scarcityHistoricHeritage: v })} tooltip="+0.8% annual appreciation uplift" />
            <ToggleSwitch label="&quot;Starchitect&quot; Design" value={state.scarcityStarchitect}
              onChange={(v) => update({ scarcityStarchitect: v })} tooltip="+1.0% annual appreciation uplift" />
            <ToggleSwitch label="Unique Panoramic View" value={state.scarcityUniqueView}
              onChange={(v) => update({ scarcityUniqueView: v })} tooltip="+0.6% annual appreciation uplift" />
          </Section>

          {/* 4. Exit & Liquidity */}
          <Section title="Exit & Liquidity" icon={<Target size={15} />}>
            <SliderInput label="Hold Period" value={state.holdPeriodYears} onChange={(v) => update({ holdPeriodYears: v })}
              min={3} max={30} step={1} unit=" years" />
            <SliderInput label="Target Exit Profit" value={state.targetExitProfit} onChange={(v) => update({ targetExitProfit: v })}
              min={0} max={50_000_000} step={500_000} formatFn={(v) => fmt$(v)} />

            <div className="h-px bg-white/[0.04] my-3" />
            <div className="text-[11px] uppercase tracking-[0.15em] text-white/30 mb-3">Market Context</div>
            <ToggleGroup label="Price Bracket" value={state.priceBracket}
              onChange={(v) => update({ priceBracket: v as SimState['priceBracket'] })}
              options={[
                { value: 'entry', label: '$2\u20135M' },
                { value: 'premium', label: '$5\u201310M' },
                { value: 'ultra', label: '$10M+' },
              ]} />
            <ToggleGroup label="Market Region" value={state.marketRegion}
              onChange={(v) => update({ marketRegion: v })}
              options={[
                { value: 'beverly-hills', label: 'Beverly Hills' },
                { value: 'miami-beach', label: 'Miami Beach' },
                { value: 'manhattan', label: 'Manhattan' },
                { value: 'hamptons', label: 'Hamptons' },
                { value: 'monaco', label: 'Monaco' },
                { value: 'mayfair', label: 'London' },
              ]} />
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { value: 'bel-air', label: 'Bel Air' },
                { value: 'malibu', label: 'Malibu' },
                { value: 'palm-beach', label: 'Palm Beach' },
                { value: 'aspen', label: 'Aspen' },
                { value: 'saint-tropez', label: 'St-Tropez' },
                { value: 'paris-16', label: 'Paris 16e' },
              ].map((opt) => (
                <button key={opt.value} onClick={() => update({ marketRegion: opt.value })}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    state.marketRegion === opt.value
                      ? 'bg-gold-400/10 border-gold-400/25 text-gold-400'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/15'
                  }`}
                >{opt.label}</button>
              ))}
            </div>
          </Section>

          <div className="h-6" />
        </div>
      </div>

      {/* RIGHT PANEL: Visualizations */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <div className="flex-shrink-0 border-b border-white/[0.04] bg-[#0e0e10] sticky top-0 z-10">
          <div className="flex overflow-x-auto sim-scrollbar-h px-3 py-2.5 gap-1.5">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === t.key
                    ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03] border border-transparent'
                }`}
              >{t.icon}{t.label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
              {activeTab === 'overview' && <OverviewDashboard state={state} fin={fin} />}
              {activeTab === 'projections' && (
                <div className="space-y-4">
                  <FinancialProjectionsChart state={state} fin={fin} />
                  <MacroShockHeatmap state={state} fin={fin} />
                  <LifestyleBurnRateGauge state={state} fin={fin} />
                  <HiddenDNALayerCake state={state} fin={fin} />
                  <UpgradeROIFrontier state={state} fin={fin} />
                </div>
              )}
              {activeTab === 'carry' && <CarryCostBreakdown state={state} fin={fin} />}
              {activeTab === 'tax' && <TaxStructuringPanel state={state} fin={fin} />}
              {activeTab === 'exit' && <ExitStrategyPanel state={state} fin={fin} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* AI Chat */}
      <SimulatorChat currentState={state} financials={fin} onUpdateParams={update} />
    </div>
  );
}
