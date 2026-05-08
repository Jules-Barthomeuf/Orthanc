"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  TableProperties,
  ChevronDown,
  ChevronUp,
  Percent,
  Layers,
  Target,
} from "lucide-react";
import SimulatorChat, { SimStatePartial } from "./SimulatorChat";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

export interface SimState {
  // Acquisition
  purchasePrice: number;
  closingCostsPct: number;
  holdingPeriod: number;
  capexBudget: number;
  propertyType: string;
  rentableSF: number;
  exitCapRate: number;
  sellingCostsPct: number;
  // Revenue
  baseRentPerSF: number;
  rentGrowthPct: number;
  vacancyRatePct: number;
  concessionMonths: number;
  ancillaryIncomePct: number;
  // OpEx
  expenseGrowthPct: number;
  mgmtFeePct: number;
  propertyTaxes: number;
  insurance: number;
  utilitiesMaintenance: number;
  otherOpex: number;
  // Below-NOI
  recurringCapexPct: number;
  tiPerSF: number;
  leasingCommissionsPct: number;
  // Debt
  ltvPct: number;
  interestRatePct: number;
  loanTermYears: number;
  amortizationYears: number;
  // Scenarios
  scenario: "base" | "upside" | "downside";
}

const PROPERTY_TYPES = [
  "Single Family",
  "Condo",
  "Townhouse",
  "Duplex",
  "Triplex",
  "Small Multifamily (2–4 units)",
  "Multifamily (5+ units)",
  "Mixed-Use",
];

function defaultState(price?: number): SimState {
  const p = price ?? 500_000;
  const sf = Math.round(p / 300);
  return {
    purchasePrice: p,
    closingCostsPct: 2.5,
    holdingPeriod: 5,
    capexBudget: p * 0.02,
    propertyType: "Single Family",
    rentableSF: sf,
    exitCapRate: 5.5,
    sellingCostsPct: 2.0,
    baseRentPerSF: 18,
    rentGrowthPct: 3.0,
    vacancyRatePct: 5.0,
    concessionMonths: 0.5,
    ancillaryIncomePct: 1.0,
    expenseGrowthPct: 2.5,
    mgmtFeePct: 8.0,
    propertyTaxes: p * 0.012,
    insurance: p * 0.004,
    utilitiesMaintenance: sf * 2,
    otherOpex: sf * 0.5,
    recurringCapexPct: 1.0,
    tiPerSF: 8,
    leasingCommissionsPct: 6.0,
    ltvPct: 75,
    interestRatePct: 7.0,
    loanTermYears: 30,
    amortizationYears: 30,
    scenario: "base",
  };
}

/* ═══════════════════════════════════════════════════════════════
   FINANCIAL ENGINE
   ═══════════════════════════════════════════════════════════════ */

interface YearRow {
  year: number;
  gpi: number;
  vacancyLoss: number;
  concessionLoss: number;
  ancillary: number;
  egi: number;
  opex: number;
  noi: number;
  debtService: number;
  recurringCapex: number;
  ti: number;
  lc: number;
  cfad: number;
  dscr: number;
  loanBalance: number;
}

export interface FinancialSummary {
  goingInCapRate: number;
  noiMargin: number;
  cashOnCash: number;
  dscr: number;
  equityMultiple: number;
  irr: number;
  npv: number;
  breakEvenOccupancy: number;
  loanAmount: number;
  equityInvested: number;
  totalCashInvested: number;
  exitValue: number;
  exitProceeds: number;
  rows: YearRow[];
  // chat compat
  noi: number;
  capRate: number;
  irrPercent: number;
  carryRatio: number;
  breakEvenAppreciation: number;
  totalCarryCost: number;
  annualCashFlow: number;
  annualDebtService: number;
  monthlyPayment: number;
  netExitWithBenefit: number;
  effectiveAppreciation: number;
  effectiveRent: number;
  vacancyLoss: number;
  [key: string]: any;
}

function pmt(rate: number, nper: number, pv: number): number {
  if (rate === 0) return pv / nper;
  return (rate * pv * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
}

function calcIRR(cashflows: number[]): number {
  let rate = 0.1;
  for (let i = 0; i < 200; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      npv += cashflows[t] / Math.pow(1 + rate, t);
      dnpv -= (t * cashflows[t]) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(dnpv) < 1e-12) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-8) { rate = newRate; break; }
    rate = newRate;
  }
  return isFinite(rate) ? rate : 0;
}

function calcNPV(cashflows: number[], hurdle: number): number {
  return cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + hurdle, t), 0);
}

function applyScenario(s: SimState): SimState {
  if (s.scenario === "upside")
    return {
      ...s,
      baseRentPerSF: s.baseRentPerSF * 1.1,
      vacancyRatePct: s.vacancyRatePct * 0.8,
      rentGrowthPct: s.rentGrowthPct + 1,
      exitCapRate: s.exitCapRate - 0.5,
    };
  if (s.scenario === "downside")
    return {
      ...s,
      baseRentPerSF: s.baseRentPerSF * 0.9,
      vacancyRatePct: s.vacancyRatePct * 1.3,
      rentGrowthPct: Math.max(0, s.rentGrowthPct - 1),
      exitCapRate: s.exitCapRate + 0.75,
    };
  return s;
}

function computeFinancials(raw: SimState): FinancialSummary {
  const s = applyScenario(raw);
  const {
    purchasePrice: pp, closingCostsPct, holdingPeriod: N, capexBudget,
    rentableSF: sf, exitCapRate, sellingCostsPct,
    baseRentPerSF, rentGrowthPct, vacancyRatePct, concessionMonths,
    ancillaryIncomePct, expenseGrowthPct, mgmtFeePct,
    propertyTaxes, insurance, utilitiesMaintenance, otherOpex,
    recurringCapexPct, tiPerSF, leasingCommissionsPct,
    ltvPct, interestRatePct, amortizationYears,
  } = s;

  const closingCosts = pp * (closingCostsPct / 100);
  const totalAcquisition = pp + closingCosts + capexBudget;
  const loanAmount = pp * (ltvPct / 100);
  const equity = totalAcquisition - loanAmount;

  const monthlyRate = interestRatePct / 100 / 12;
  const nperMonths = amortizationYears * 12;
  const annualDS = pmt(monthlyRate, nperMonths, loanAmount) * 12;

  let loanBal = loanAmount;
  const rows: YearRow[] = [];
  const cfArray: number[] = [-equity];

  for (let yr = 1; yr <= N; yr++) {
    const g = Math.pow(1 + rentGrowthPct / 100, yr - 1);
    const eg = Math.pow(1 + expenseGrowthPct / 100, yr - 1);
    const gpi = baseRentPerSF * sf * g;
    const vacLoss = gpi * (vacancyRatePct / 100);
    const concLoss = (gpi / 12) * concessionMonths * (vacancyRatePct / 100);
    const ancillary = (gpi - vacLoss) * (ancillaryIncomePct / 100);
    const egi = gpi - vacLoss - concLoss + ancillary;

    const mgmt = egi * (mgmtFeePct / 100);
    const opex = (mgmt + propertyTaxes + insurance + utilitiesMaintenance + otherOpex) * eg;
    const noi = egi - opex;

    const recurCapex = noi * (recurringCapexPct / 100);
    const tiCost = sf * tiPerSF * (vacancyRatePct / 100) * 0.3;
    const lcCost = gpi * (leasingCommissionsPct / 100) * (vacancyRatePct / 100) * 0.3;

    const annualInterest = loanBal * (interestRatePct / 100);
    const annualPrincipal = annualDS - annualInterest;
    loanBal = Math.max(0, loanBal - annualPrincipal);

    const cfad = noi - annualDS - recurCapex - tiCost - lcCost;
    const dscr = annualDS > 0 ? noi / annualDS : 999;

    rows.push({
      year: yr, gpi, vacancyLoss: vacLoss, concessionLoss: concLoss, ancillary,
      egi, opex, noi, debtService: annualDS, recurringCapex: recurCapex,
      ti: tiCost, lc: lcCost, cfad, dscr, loanBalance: loanBal,
    });

    if (yr < N) {
      cfArray.push(cfad);
    } else {
      const yr1NxtNOI = noi * (1 + rentGrowthPct / 100);
      const exitPrice = yr1NxtNOI / (exitCapRate / 100);
      const exitNet = exitPrice * (1 - sellingCostsPct / 100) - loanBal;
      cfArray.push(cfad + exitNet);
    }
  }

  const yr1 = rows[0];
  const goingInCapRate = yr1 ? (yr1.noi / pp) * 100 : 0;
  const noiMargin = yr1 ? (yr1.noi / yr1.gpi) * 100 : 0;
  const cashOnCash = equity > 0 ? ((rows[0]?.cfad ?? 0) / equity) * 100 : 0;
  const dscr = yr1?.dscr ?? 0;

  const totalCF = cfArray.reduce((a, b) => a + b, 0);
  const equityMultiple = equity > 0 ? (totalCF + equity) / equity : 0;
  const irr = calcIRR(cfArray) * 100;
  const npv = calcNPV(cfArray, 0.08);

  const yr1OpexFixed = yr1 ? yr1.opex + annualDS : 0;
  const breakEvenOccupancy = yr1 ? (yr1OpexFixed / yr1.gpi) * 100 : 0;

  const lastRow = rows[rows.length - 1];
  const finalNOI = lastRow ? lastRow.noi * (1 + rentGrowthPct / 100) : 0;
  const exitValue = finalNOI / (exitCapRate / 100);
  const exitProceeds = exitValue * (1 - sellingCostsPct / 100) - loanBal;

  return {
    goingInCapRate, noiMargin, cashOnCash, dscr, equityMultiple, irr, npv, breakEvenOccupancy,
    loanAmount, equityInvested: equity, totalCashInvested: totalAcquisition, exitValue, exitProceeds, rows,
    noi: yr1?.noi ?? 0, capRate: goingInCapRate, irrPercent: irr,
    carryRatio: 0, breakEvenAppreciation: breakEvenOccupancy,
    totalCarryCost: yr1?.opex ?? 0, annualCashFlow: yr1?.cfad ?? 0,
    annualDebtService: annualDS, monthlyPayment: annualDS / 12,
    netExitWithBenefit: exitProceeds, effectiveAppreciation: 0,
    effectiveRent: yr1?.egi ?? 0, vacancyLoss: yr1?.vacancyLoss ?? 0,
  };
}

/* ═══════════════════════════════════════════════════════════════
   UI HELPERS
   ═══════════════════════════════════════════════════════════════ */

function fmtN(n: number, d = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtUSD(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${fmtN(n)}`;
}
function fmtPct(n: number) { return `${n.toFixed(2)}%`; }

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  unit?: string;
}

function Slider({ label, value, min, max, step, onChange, format, unit }: SliderProps) {
  const display = format ? format(value) : `${value}${unit ?? ""}`;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="label-luxury">{label}</span>
        <span className="text-gold-400 text-xs font-mono">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded appearance-none bg-dark-700 accent-gold-400 cursor-pointer"
      />
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  negative?: boolean;
}

function KPICard({ label, value, sub, highlight, negative }: KPICardProps) {
  return (
    <div className={`rounded-xl p-3 border ${highlight ? "border-gold-400/60 bg-gold-900/10" : "border-dark-700 bg-dark-800"}`}>
      <div className="label-luxury mb-1">{label}</div>
      <div className={`text-xl font-bold ${negative ? "text-red-400" : highlight ? "text-gold-400" : "text-white"}`}>{value}</div>
      {sub && <div className="text-dark-400 text-xs mt-0.5">{sub}</div>}
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-dark-700 rounded-xl mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-dark-800 hover:bg-dark-750 transition-colors"
      >
        <div className="flex items-center gap-2 label-luxury text-gold-400/80">
          {icon}
          {title}
        </div>
        {open ? <ChevronUp size={14} className="text-dark-400" /> : <ChevronDown size={14} className="text-dark-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-dark-900/60">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHARTS
   ═══════════════════════════════════════════════════════════════ */

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#8a8a8a", font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: "#666" }, grid: { color: "#1e1e1e" } },
    y: { ticks: { color: "#666" }, grid: { color: "#1e1e1e" } },
  },
};

function IncomeWaterfallChart({ rows }: { rows: YearRow[] }) {
  const labels = rows.map((r) => `Yr ${r.year}`);
  const data = {
    labels,
    datasets: [
      { label: "NOI", data: rows.map((r) => r.noi), backgroundColor: "rgba(201,169,110,0.85)", stack: "s" },
      { label: "OpEx", data: rows.map((r) => r.opex), backgroundColor: "rgba(100,80,40,0.7)", stack: "s" },
      { label: "Vacancy Loss", data: rows.map((r) => r.vacancyLoss), backgroundColor: "rgba(60,60,60,0.9)", stack: "s" },
    ],
  };
  return <div style={{ height: 280 }}><Bar data={data} options={CHART_OPTS as any} /></div>;
}

function CashFlowChart({ rows, exitProceeds }: { rows: YearRow[]; exitProceeds: number }) {
  const labels = rows.map((r) => `Yr ${r.year}`);
  const cfValues = rows.map((r, i) => i === rows.length - 1 ? r.cfad + exitProceeds : r.cfad);
  const data = {
    labels,
    datasets: [{
      label: "Cash Flow After Debt",
      data: cfValues,
      backgroundColor: cfValues.map((v) => v >= 0 ? "rgba(201,169,110,0.8)" : "rgba(200,60,60,0.7)"),
    }],
  };
  return <div style={{ height: 280 }}><Bar data={data} options={CHART_OPTS as any} /></div>;
}

function CumulativeEquityChart({ rows }: { rows: YearRow[] }) {
  const labels = rows.map((r) => `Yr ${r.year}`);
  let cumCF = 0;
  const cumData = rows.map((r) => { cumCF += r.cfad; return cumCF / 1000; });
  const firstBal = rows[0]?.loanBalance ?? 0;
  const principalPaid = rows.map((r) => (firstBal - r.loanBalance) / 1000);
  const data = {
    labels,
    datasets: [
      { label: "Cumulative CFAD ($K)", data: cumData, borderColor: "#c9a96e", backgroundColor: "rgba(201,169,110,0.1)", fill: true, tension: 0.3 },
      { label: "Principal Paid ($K)", data: principalPaid, borderColor: "#4ade80", backgroundColor: "transparent", tension: 0.3 },
    ],
  };
  return <div style={{ height: 280 }}><Line data={data} options={CHART_OPTS as any} /></div>;
}

function ExpensePieChart({ rows }: { rows: YearRow[] }) {
  const yr1 = rows[0];
  if (!yr1) return null;
  const data = {
    labels: ["OpEx", "Debt Service", "Recurring CapEx", "TI", "LC"],
    datasets: [{
      data: [yr1.opex, yr1.debtService, yr1.recurringCapex, yr1.ti, yr1.lc],
      backgroundColor: ["#c9a96e", "#5a4020", "#8a6a30", "#3a3a3a", "#2a2a2a"],
      borderColor: "#1a1a1a",
      borderWidth: 2,
    }],
  };
  return <div style={{ height: 280 }} className="flex justify-center"><Doughnut data={data} options={{ ...CHART_OPTS, scales: {} } as any} /></div>;
}

function SensitivityHeatmap({ baseState }: { baseState: SimState }) {
  const rentGrowthVals = [-1, 0, 1, 2, 3, 4];
  const exitCapVals = [4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5];
  const cells = rentGrowthVals.map((rg) =>
    exitCapVals.map((ec) => computeFinancials({ ...baseState, rentGrowthPct: rg, exitCapRate: ec, scenario: "base" }).irr)
  );
  const allVals = cells.flat();
  const minV = Math.min(...allVals), maxV = Math.max(...allVals);
  function color(v: number) {
    const t = maxV !== minV ? (v - minV) / (maxV - minV) : 0.5;
    return `rgb(${Math.round(180 * (1 - t) + 40 * t)},${Math.round(60 * (1 - t) + 160 * t)},${Math.round(40 * (1 - t) + 80 * t)})`;
  }
  return (
    <div className="overflow-x-auto">
      <div className="text-xs text-dark-400 mb-2 text-center">IRR (%) — Rent Growth % (rows) vs Exit Cap Rate % (cols)</div>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-dark-400 pr-2 pb-2">RG \ EC</th>
            {exitCapVals.map((ec) => <th key={ec} className="text-dark-400 px-2 pb-2">{ec.toFixed(1)}</th>)}
          </tr>
        </thead>
        <tbody>
          {rentGrowthVals.map((rg, ri) => (
            <tr key={rg}>
              <td className="text-dark-400 pr-2 py-1">{rg >= 0 ? `+${rg}` : rg}%</td>
              {exitCapVals.map((ec, ci) => {
                const v = cells[ri][ci];
                return (
                  <td key={ec} className="px-2 py-1 text-center font-mono rounded"
                    style={{ backgroundColor: `${color(v)}33`, color: color(v) }}>
                    {v.toFixed(1)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnnualTable({ rows }: { rows: YearRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-dark-400 border-b border-dark-700">
            {["Yr", "GPI", "Vac Loss", "EGI", "OpEx", "NOI", "Debt Svc", "CFAD", "DSCR", "Loan Bal"].map((h) => (
              <th key={h} className="py-2 px-2 text-right first:text-left whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.year} className="border-b border-dark-800 hover:bg-dark-800/50">
              <td className="py-2 px-2 text-gold-400 font-semibold">{r.year}</td>
              <td className="py-2 px-2 text-right">{fmtUSD(r.gpi)}</td>
              <td className="py-2 px-2 text-right text-red-400">({fmtUSD(r.vacancyLoss)})</td>
              <td className="py-2 px-2 text-right">{fmtUSD(r.egi)}</td>
              <td className="py-2 px-2 text-right text-red-400">({fmtUSD(r.opex)})</td>
              <td className="py-2 px-2 text-right text-gold-400 font-semibold">{fmtUSD(r.noi)}</td>
              <td className="py-2 px-2 text-right">({fmtUSD(r.debtService)})</td>
              <td className={`py-2 px-2 text-right font-semibold ${r.cfad >= 0 ? "text-green-400" : "text-red-400"}`}>{fmtUSD(r.cfad)}</td>
              <td className={`py-2 px-2 text-right ${r.dscr >= 1.25 ? "text-green-400" : r.dscr >= 1.0 ? "text-yellow-400" : "text-red-400"}`}>{r.dscr.toFixed(2)}x</td>
              <td className="py-2 px-2 text-right text-dark-400">{fmtUSD(r.loanBalance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SIMULATOR
   ═══════════════════════════════════════════════════════════════ */

const CHART_TABS = [
  { id: "waterfall", label: "Income Waterfall", icon: <BarChart3 size={13} /> },
  { id: "cashflow", label: "Cash Flow", icon: <TrendingUp size={13} /> },
  { id: "equity", label: "Equity Build", icon: <Layers size={13} /> },
  { id: "expenses", label: "Expense Breakdown", icon: <PieChart size={13} /> },
  { id: "sensitivity", label: "Sensitivity", icon: <Target size={13} /> },
  { id: "table", label: "Annual Table", icon: <TableProperties size={13} /> },
] as const;

type ChartTab = typeof CHART_TABS[number]["id"];

export default function Simulator({ address, price }: { address?: string; price?: number }) {
  const [state, setState] = useState<SimState>(() => defaultState(price));
  const [activeTab, setActiveTab] = useState<ChartTab>("waterfall");

  const fin = useMemo(() => computeFinancials(state), [state]);

  const update = useCallback((partial: Partial<SimState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const chatUpdate = useCallback((partial: Partial<SimStatePartial>) => {
    const mapped: Partial<SimState> = {};
    if (partial.vacancyRate !== undefined) mapped.vacancyRatePct = partial.vacancyRate;
    if (partial.interestRate !== undefined) mapped.interestRatePct = partial.interestRate;
    if (partial.holdPeriodYears !== undefined) mapped.holdingPeriod = partial.holdPeriodYears;
    if (partial.ltvRatio !== undefined) mapped.ltvPct = partial.ltvRatio;
    if (partial.grossAnnualRent !== undefined) mapped.baseRentPerSF = partial.grossAnnualRent / state.rentableSF;
    setState((prev) => ({ ...prev, ...mapped }));
  }, [state.rentableSF]);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <div className="border-b border-dark-700 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Building2 size={20} className="text-gold-400" />
          <div>
            <h2 className="text-white font-semibold text-lg">Investment Simulator</h2>
            {address && <div className="text-dark-400 text-xs mt-0.5">{address}</div>}
          </div>
        </div>
        <div className="flex gap-1 bg-dark-800 rounded-lg p-1">
          {(["base", "upside", "downside"] as const).map((sc) => (
            <button
              key={sc}
              onClick={() => update({ scenario: sc })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                state.scenario === sc
                  ? sc === "upside" ? "bg-green-700 text-white" : sc === "downside" ? "bg-red-800 text-white" : "bg-gold-700 text-dark-900"
                  : "text-dark-400 hover:text-white"
              }`}
            >
              {sc}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 px-6 py-4 border-b border-dark-700">
        <KPICard label="Going-In Cap" value={fmtPct(fin.goingInCapRate)} highlight />
        <KPICard label="NOI Margin" value={fmtPct(fin.noiMargin)} />
        <KPICard label="Cash-on-Cash" value={fmtPct(fin.cashOnCash)} negative={fin.cashOnCash < 0} />
        <KPICard label="DSCR Yr 1" value={`${fin.dscr.toFixed(2)}x`} negative={fin.dscr < 1.25} />
        <KPICard label="Equity Multiple" value={`${fin.equityMultiple.toFixed(2)}x`} highlight />
        <KPICard label="IRR" value={fmtPct(fin.irr)} highlight negative={fin.irr < 0} />
        <KPICard label="NPV @8%" value={fmtUSD(fin.npv)} negative={fin.npv < 0} />
        <KPICard label="Break-Even Occ" value={fmtPct(fin.breakEvenOccupancy)} />
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left: Inputs */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0 border-r border-dark-700 p-4 overflow-y-auto lg:max-h-[calc(100vh-220px)]">
          <Section title="Acquisition" icon={<Building2 size={12} />}>
            <Slider label="Purchase Price" value={state.purchasePrice} min={500000} max={50000000} step={100000} onChange={(v) => update({ purchasePrice: v })} format={fmtUSD} />
            <Slider label="Closing Costs %" value={state.closingCostsPct} min={0.5} max={6} step={0.1} onChange={(v) => update({ closingCostsPct: v })} unit="%" />
            <Slider label="Holding Period" value={state.holdingPeriod} min={1} max={20} step={1} onChange={(v) => update({ holdingPeriod: v })} unit=" yrs" />
            <Slider label="CapEx Budget" value={state.capexBudget} min={0} max={state.purchasePrice * 0.1} step={10000} onChange={(v) => update({ capexBudget: v })} format={fmtUSD} />
            <Slider label="Rentable Sqft" value={state.rentableSF} min={500} max={50000} step={100} onChange={(v) => update({ rentableSF: v })} format={(v) => `${fmtN(v)} sqft`} />
            <Slider label="Exit Cap Rate %" value={state.exitCapRate} min={3} max={12} step={0.25} onChange={(v) => update({ exitCapRate: v })} unit="%" />
            <Slider label="Selling Costs %" value={state.sellingCostsPct} min={0.5} max={5} step={0.1} onChange={(v) => update({ sellingCostsPct: v })} unit="%" />
            <div className="mb-3">
              <div className="label-luxury mb-1">Property Type</div>
              <select value={state.propertyType} onChange={(e) => update({ propertyType: e.target.value })} className="luxury-input w-full">
                {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </Section>

          <Section title="Revenue" icon={<DollarSign size={12} />} defaultOpen={false}>
            <Slider label="Rent ($/sqft/yr)" value={state.baseRentPerSF} min={5} max={80} step={0.5} onChange={(v) => update({ baseRentPerSF: v })} format={(v) => `$${v.toFixed(2)}/sqft`} />
            <Slider label="Rent Growth %" value={state.rentGrowthPct} min={-2} max={8} step={0.25} onChange={(v) => update({ rentGrowthPct: v })} unit="%" />
            <Slider label="Vacancy Rate %" value={state.vacancyRatePct} min={0} max={30} step={0.5} onChange={(v) => update({ vacancyRatePct: v })} unit="%" />
            <Slider label="Concessions (mo)" value={state.concessionMonths} min={0} max={12} step={0.5} onChange={(v) => update({ concessionMonths: v })} unit=" mo" />
            <Slider label="Ancillary Income %" value={state.ancillaryIncomePct} min={0} max={15} step={0.25} onChange={(v) => update({ ancillaryIncomePct: v })} unit="%" />
          </Section>

          <Section title="Operating Expenses" icon={<Percent size={12} />} defaultOpen={false}>
            <Slider label="Expense Growth %" value={state.expenseGrowthPct} min={0} max={6} step={0.25} onChange={(v) => update({ expenseGrowthPct: v })} unit="%" />
            <Slider label="Mgmt Fee %" value={state.mgmtFeePct} min={1} max={10} step={0.25} onChange={(v) => update({ mgmtFeePct: v })} unit="%" />
            <Slider label="Property Taxes" value={state.propertyTaxes} min={0} max={state.purchasePrice * 0.03} step={1000} onChange={(v) => update({ propertyTaxes: v })} format={fmtUSD} />
            <Slider label="Insurance" value={state.insurance} min={0} max={state.purchasePrice * 0.015} step={500} onChange={(v) => update({ insurance: v })} format={fmtUSD} />
            <Slider label="Utilities & Maint." value={state.utilitiesMaintenance} min={0} max={state.rentableSF * 10} step={500} onChange={(v) => update({ utilitiesMaintenance: v })} format={fmtUSD} />
            <Slider label="Other Expenses" value={state.otherOpex} min={0} max={state.rentableSF * 5} step={500} onChange={(v) => update({ otherOpex: v })} format={fmtUSD} />
          </Section>

          <Section title="Reserves & Leasing" icon={<Layers size={12} />} defaultOpen={false}>
            <Slider label="Recurring CapEx %" value={state.recurringCapexPct} min={0} max={5} step={0.1} onChange={(v) => update({ recurringCapexPct: v })} unit="%" />
            <Slider label="Turnover Cost ($/sqft)" value={state.tiPerSF} min={0} max={60} step={1} onChange={(v) => update({ tiPerSF: v })} format={(v) => `$${v}/sqft`} />
            <Slider label="Leasing Fee %" value={state.leasingCommissionsPct} min={0} max={12} step={0.25} onChange={(v) => update({ leasingCommissionsPct: v })} unit="%" />
          </Section>

          <Section title="Debt Structure" icon={<TrendingUp size={12} />} defaultOpen={false}>
            <Slider label="LTV %" value={state.ltvPct} min={0} max={85} step={1} onChange={(v) => update({ ltvPct: v })} unit="%" />
            <Slider label="Interest Rate %" value={state.interestRatePct} min={3} max={12} step={0.125} onChange={(v) => update({ interestRatePct: v })} unit="%" />
            <Slider label="Loan Term (yrs)" value={state.loanTermYears} min={3} max={30} step={1} onChange={(v) => update({ loanTermYears: v })} unit=" yrs" />
            <Slider label="Amortization (yrs)" value={state.amortizationYears} min={10} max={40} step={1} onChange={(v) => update({ amortizationYears: v })} unit=" yrs" />
            <div className="mt-3 p-3 rounded-lg bg-dark-800 border border-dark-700 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-dark-400">Loan Amount</span><span className="text-white font-mono">{fmtUSD(fin.loanAmount)}</span></div>
              <div className="flex justify-between"><span className="text-dark-400">Equity Invested</span><span className="text-gold-400 font-mono">{fmtUSD(fin.equityInvested)}</span></div>
              <div className="flex justify-between"><span className="text-dark-400">Annual Debt Svc</span><span className="text-white font-mono">{fmtUSD(fin.annualDebtService)}</span></div>
              <div className="flex justify-between"><span className="text-dark-400">Projected Exit</span><span className="text-gold-400 font-mono">{fmtUSD(fin.exitValue)}</span></div>
            </div>
          </Section>

          {/* ── Monthly Payment Estimator ── */}
          <Section title="Monthly Payment Estimator" icon={<DollarSign size={12} />} defaultOpen={false}>
            {(() => {
              const pi = fin.monthlyPayment;
              const taxes = state.propertyTaxes / 12;
              const insurance = state.insurance / 12;
              const total = pi + taxes + insurance;
              const downPayment = state.purchasePrice * (1 - state.ltvPct / 100);
              return (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-dark-800 border border-dark-700 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-dark-400">Down Payment ({(100 - state.ltvPct).toFixed(0)}%)</span>
                      <span className="text-white font-mono">{fmtUSD(downPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark-400">Loan Amount</span>
                      <span className="text-white font-mono">{fmtUSD(fin.loanAmount)}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-dark-900 border border-gold-400/20 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-dark-300">Principal & Interest</span>
                      <span className="text-white font-mono">{fmtUSD(pi)}<span className="text-dark-500">/mo</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark-300">Property Taxes</span>
                      <span className="text-white font-mono">{fmtUSD(taxes)}<span className="text-dark-500">/mo</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark-300">Insurance</span>
                      <span className="text-white font-mono">{fmtUSD(insurance)}<span className="text-dark-500">/mo</span></span>
                    </div>
                    <div className="border-t border-dark-700 pt-2 flex justify-between items-center">
                      <span className="text-gold-400 font-semibold uppercase tracking-wider text-[10px]">Est. Monthly Total</span>
                      <span className="text-gold-400 font-bold text-base font-mono">{fmtUSD(total)}<span className="text-gold-400/50 text-xs">/mo</span></span>
                    </div>
                  </div>
                  <p className="text-dark-500 text-[10px] leading-relaxed">
                    Estimate based on current rate ({state.interestRatePct}%), {state.amortizationYears}-yr amortization, {(100 - state.ltvPct).toFixed(0)}% down. Excludes HOA, PMI, and utilities.
                  </p>
                </div>
              );
            })()}
          </Section>
        </div>

        {/* Right: Charts */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex gap-1 px-4 pt-4 border-b border-dark-700 flex-wrap">
            {CHART_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium transition-all border-b-2 -mb-px ${
                  activeTab === t.id
                    ? "border-gold-400 text-gold-400 bg-dark-800"
                    : "border-transparent text-dark-400 hover:text-white"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "waterfall" && <IncomeWaterfallChart rows={fin.rows} />}
                {activeTab === "cashflow" && <CashFlowChart rows={fin.rows} exitProceeds={fin.exitProceeds} />}
                {activeTab === "equity" && <CumulativeEquityChart rows={fin.rows} />}
                {activeTab === "expenses" && <ExpensePieChart rows={fin.rows} />}
                {activeTab === "sensitivity" && <SensitivityHeatmap baseState={state} />}
                {activeTab === "table" && <AnnualTable rows={fin.rows} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* AI Chat */}
      <SimulatorChat
        currentState={state as any}
        financials={fin as any}
        onUpdateParams={chatUpdate as any}
      />
    </div>
  );
}
