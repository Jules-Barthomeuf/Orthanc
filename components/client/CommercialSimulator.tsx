"use client";

import { useMemo, useState } from "react";
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
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Property } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

type Scenario = "base" | "upside" | "downside";

type CREState = {
  purchasePrice: number;
  closingCostsPct: number;
  holdingPeriod: number;
  capexBudget: number;
  propertyType: string;
  rentableSF: number;
  exitCapRate: number;
  sellingCostsPct: number;
  baseRentPerSF: number;
  rentGrowthPct: number;
  vacancyRatePct: number;
  concessionMonths: number;
  ancillaryIncomePct: number;
  expenseGrowthPct: number;
  mgmtFeePct: number;
  propertyTaxes: number;
  insurance: number;
  utilitiesMaintenance: number;
  otherOpex: number;
  recurringCapexPct: number;
  tiPerSF: number;
  leasingCommissionsPct: number;
  ltvPct: number;
  interestRatePct: number;
  amortizationYears: number;
  hurdleRatePct: number;
  scenario: Scenario;
};

type YearRow = {
  year: number;
  gpi: number;
  vacancyLoss: number;
  concessions: number;
  ancillary: number;
  egi: number;
  opex: number;
  noi: number;
  debtService: number;
  recurringCapex: number;
  ti: number;
  lc: number;
  cfBeforeDebt: number;
  cfad: number;
  loanBalance: number;
  dscr: number;
};

const PROPERTY_TYPES = ["Office", "Retail", "Industrial", "Multifamily", "Mixed-Use", "Hotel"];

function pmt(rate: number, nper: number, pv: number): number {
  if (rate === 0) return pv / nper;
  const factor = Math.pow(1 + rate, nper);
  return (rate * pv * factor) / (factor - 1);
}

function irr(cashflows: number[]): number {
  let rate = 0.12;
  for (let i = 0; i < 120; i++) {
    let f = 0;
    let fp = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const d = Math.pow(1 + rate, t);
      f += cashflows[t] / d;
      fp -= (t * cashflows[t]) / (d * (1 + rate));
    }
    if (Math.abs(fp) < 1e-9) break;
    const next = rate - f / fp;
    if (!isFinite(next)) break;
    if (Math.abs(next - rate) < 1e-8) return next;
    rate = next;
  }
  return rate;
}

function npv(cashflows: number[], discountRate: number): number {
  return cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + discountRate, t), 0);
}

function scenarioState(s: CREState): CREState {
  if (s.scenario === "upside") {
    return {
      ...s,
      rentGrowthPct: s.rentGrowthPct + 1,
      vacancyRatePct: Math.max(0, s.vacancyRatePct - 1.5),
      exitCapRate: Math.max(3, s.exitCapRate - 0.5),
    };
  }
  if (s.scenario === "downside") {
    return {
      ...s,
      rentGrowthPct: Math.max(-1, s.rentGrowthPct - 1),
      vacancyRatePct: s.vacancyRatePct + 2,
      exitCapRate: s.exitCapRate + 0.75,
    };
  }
  return s;
}

function createDefaultState(property: Property): CREState {
  const price = property.price || 5_000_000;
  const sf = property.squareFeet || Math.max(5000, Math.round(price / 220));
  return {
    purchasePrice: price,
    closingCostsPct: 2.5,
    holdingPeriod: 10,
    capexBudget: Math.round(price * 0.03),
    propertyType: "Office",
    rentableSF: sf,
    exitCapRate: 6.25,
    sellingCostsPct: 3,
    baseRentPerSF: 32,
    rentGrowthPct: 2.5,
    vacancyRatePct: 8,
    concessionMonths: 1,
    ancillaryIncomePct: 2.5,
    expenseGrowthPct: 2.5,
    mgmtFeePct: 4,
    propertyTaxes: Math.round(price * 0.012),
    insurance: Math.round(price * 0.0028),
    utilitiesMaintenance: Math.round(sf * 5.2),
    otherOpex: Math.round(sf * 2),
    recurringCapexPct: 1,
    tiPerSF: 18,
    leasingCommissionsPct: 5,
    ltvPct: 65,
    interestRatePct: 6.25,
    amortizationYears: 30,
    hurdleRatePct: 10,
    scenario: "base",
  };
}

function fmtUsd(value: number) {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function fmtPct(value: number) {
  return `${value.toFixed(2)}%`;
}

function buildModel(raw: CREState) {
  const s = scenarioState(raw);
  const loanAmount = s.purchasePrice * (s.ltvPct / 100);
  const equity = s.purchasePrice + s.purchasePrice * (s.closingCostsPct / 100) + s.capexBudget - loanAmount;

  const monthlyRate = s.interestRatePct / 100 / 12;
  const annualDebtService = pmt(monthlyRate, s.amortizationYears * 12, loanAmount) * 12;

  let loanBalance = loanAmount;
  const rows: YearRow[] = [];
  const cashflows = [-equity];

  for (let year = 1; year <= s.holdingPeriod; year++) {
    const rentGrowth = Math.pow(1 + s.rentGrowthPct / 100, year - 1);
    const expenseGrowth = Math.pow(1 + s.expenseGrowthPct / 100, year - 1);

    const gpi = s.baseRentPerSF * s.rentableSF * rentGrowth;
    const vacancyLoss = gpi * (s.vacancyRatePct / 100);
    const concessions = gpi * (s.concessionMonths / 12) * 0.15;
    const ancillary = gpi * (s.ancillaryIncomePct / 100);
    const egi = gpi - vacancyLoss - concessions + ancillary;

    const mgmtFee = egi * (s.mgmtFeePct / 100);
    const opexBase = mgmtFee + s.propertyTaxes + s.insurance + s.utilitiesMaintenance + s.otherOpex;
    const opex = opexBase * expenseGrowth;
    const noi = egi - opex;

    const recurringCapex = egi * (s.recurringCapexPct / 100);
    const turnoverFactor = Math.max(0.05, s.vacancyRatePct / 100);
    const ti = s.tiPerSF * s.rentableSF * turnoverFactor * 0.2;
    const lc = gpi * (s.leasingCommissionsPct / 100) * turnoverFactor * 0.2;

    const annualInterest = loanBalance * (s.interestRatePct / 100);
    const annualPrincipal = Math.max(0, annualDebtService - annualInterest);
    loanBalance = Math.max(0, loanBalance - annualPrincipal);

    const cfBeforeDebt = noi - recurringCapex - ti - lc;
    const cfad = cfBeforeDebt - annualDebtService;
    const dscr = annualDebtService > 0 ? noi / annualDebtService : 99;

    rows.push({
      year,
      gpi,
      vacancyLoss,
      concessions,
      ancillary,
      egi,
      opex,
      noi,
      debtService: annualDebtService,
      recurringCapex,
      ti,
      lc,
      cfBeforeDebt,
      cfad,
      loanBalance,
      dscr,
    });

    if (year < s.holdingPeriod) {
      cashflows.push(cfad);
    }
  }

  const lastNoi = rows[rows.length - 1]?.noi ?? 0;
  const exitNoi = lastNoi * (1 + s.rentGrowthPct / 100);
  const exitPriceGross = exitNoi / (s.exitCapRate / 100);
  const exitPriceNet = exitPriceGross * (1 - s.sellingCostsPct / 100);
  const saleProceeds = exitPriceNet - loanBalance;

  const lastYearIndex = cashflows.length - 1;
  cashflows[lastYearIndex] = (cashflows[lastYearIndex] || 0) + saleProceeds;

  const goingInCapRate = (rows[0]?.noi ?? 0) / s.purchasePrice;
  const noiMargin = (rows[0]?.noi ?? 0) / Math.max(1, rows[0]?.egi ?? 1);
  const cashOnCash = (rows[0]?.cfad ?? 0) / Math.max(1, equity);
  const irrPct = irr(cashflows) * 100;
  const npvValue = npv(cashflows, s.hurdleRatePct / 100);
  const totalReturned = cashflows.slice(1).reduce((a, b) => a + b, 0);
  const equityMultiple = totalReturned / Math.max(1, equity);
  const minDscr = Math.min(...rows.map((r) => r.dscr));
  const maxDscr = Math.max(...rows.map((r) => r.dscr));

  const avgFixed = (rows[0]?.opex ?? 0) + annualDebtService + (rows[0]?.recurringCapex ?? 0);
  const breakEvenOccupancy = (avgFixed / Math.max(1, rows[0]?.gpi ?? 1)) * 100;

  return {
    state: s,
    rows,
    cashflows,
    loanAmount,
    equity,
    annualDebtService,
    saleProceeds,
    exitPriceGross,
    metrics: {
      goingInCapRate: goingInCapRate * 100,
      noiMargin: noiMargin * 100,
      cashOnCash: cashOnCash * 100,
      irr: irrPct,
      npv: npvValue,
      equityMultiple,
      minDscr,
      maxDscr,
      breakEvenOccupancy,
    },
  };
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="text-cyan-300 font-medium">{format ? format(value) : value}</span>
      </div>
      <input
        className="w-full accent-cyan-400"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export default function CommercialSimulator({ property }: { property: Property }) {
  const [state, setState] = useState<CREState>(() => createDefaultState(property));
  const [tab, setTab] = useState<"income" | "cash" | "equity" | "expense" | "bridge" | "table">("income");

  const model = useMemo(() => buildModel(state), [state]);

  const update = (partial: Partial<CREState>) => setState((prev) => ({ ...prev, ...partial }));

  const years = model.rows.map((r) => `Y${r.year}`);

  const incomeData = {
    labels: years,
    datasets: [
      { label: "GPI", data: model.rows.map((r) => r.gpi), borderColor: "#22d3ee", backgroundColor: "rgba(34,211,238,0.15)", fill: true, tension: 0.3 },
      { label: "EGI", data: model.rows.map((r) => r.egi), borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.1)", fill: true, tension: 0.3 },
      { label: "OpEx", data: model.rows.map((r) => r.opex), borderColor: "#f97316", backgroundColor: "rgba(249,115,22,0.1)", fill: true, tension: 0.3 },
      { label: "NOI", data: model.rows.map((r) => r.noi), borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.12)", fill: true, tension: 0.3 },
    ],
  };

  const cashData = {
    labels: years,
    datasets: [
      { label: "Pre-Debt CF", data: model.rows.map((r) => r.cfBeforeDebt), backgroundColor: "rgba(14,165,233,0.65)" },
      {
        label: "Post-Debt CF (CFAD)",
        data: model.rows.map((r, idx) => (idx === model.rows.length - 1 ? r.cfad + model.saleProceeds : r.cfad)),
        backgroundColor: "rgba(16,185,129,0.70)",
      },
    ],
  };

  const cumulativeData = {
    labels: years,
    datasets: [
      {
        label: "Cumulative CFAD",
        data: model.rows.reduce<number[]>((acc, r) => {
          const prev = acc.length ? acc[acc.length - 1] : 0;
          acc.push(prev + r.cfad);
          return acc;
        }, []),
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34,211,238,0.12)",
        fill: true,
        tension: 0.25,
      },
      {
        label: "Principal Paydown",
        data: model.rows.map((r) => model.loanAmount - r.loanBalance),
        borderColor: "#f59e0b",
        backgroundColor: "transparent",
        tension: 0.25,
      },
    ],
  };

  const y1 = model.rows[0];
  const expenseData = {
    labels: ["Taxes", "Insurance", "Util+Maint", "Other OpEx", "Mgmt Fee"],
    datasets: [
      {
        data: y1
          ? [
              state.propertyTaxes,
              state.insurance,
              state.utilitiesMaintenance,
              state.otherOpex,
              y1.egi * (state.mgmtFeePct / 100),
            ]
          : [0, 0, 0, 0, 0],
        backgroundColor: ["#22d3ee", "#0ea5e9", "#f59e0b", "#f97316", "#10b981"],
      },
    ],
  };

  const bridgeData = {
    labels: ["Going-in Cap", "Exit Cap", "Market Ref"],
    datasets: [
      {
        data: [model.metrics.goingInCapRate, state.exitCapRate, (model.metrics.goingInCapRate + state.exitCapRate) / 2],
        backgroundColor: ["rgba(16,185,129,0.7)", "rgba(249,115,22,0.7)", "rgba(56,189,248,0.7)"],
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#cbd5e1" } } },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.12)" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.12)" } },
    },
  } as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Commercial Engine</p>
            <h2 className="text-xl font-semibold">CRE Simulator</h2>
            <p className="text-xs text-slate-400">{property.address || property.title}</p>
          </div>
          <div className="flex gap-2">
            {(["base", "upside", "downside"] as Scenario[]).map((sc) => (
              <button
                key={sc}
                onClick={() => update({ scenario: sc })}
                className={`px-3 py-1.5 rounded text-xs uppercase tracking-wide border ${
                  state.scenario === sc
                    ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
                    : "border-slate-700 text-slate-400"
                }`}
              >
                {sc}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-4 border-b border-slate-800">
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-3"><p className="text-xs text-slate-400">IRR</p><p className="text-lg text-cyan-300 font-semibold">{fmtPct(model.metrics.irr)}</p></div>
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-3"><p className="text-xs text-slate-400">Equity Multiple</p><p className="text-lg text-emerald-300 font-semibold">{model.metrics.equityMultiple.toFixed(2)}x</p></div>
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-3"><p className="text-xs text-slate-400">Going-in Cap</p><p className="text-lg text-sky-300 font-semibold">{fmtPct(model.metrics.goingInCapRate)}</p></div>
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-3"><p className="text-xs text-slate-400">DSCR (min/max)</p><p className="text-lg text-amber-300 font-semibold">{model.metrics.minDscr.toFixed(2)}x / {model.metrics.maxDscr.toFixed(2)}x</p></div>
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-3"><p className="text-xs text-slate-400">NPV @{state.hurdleRatePct}%</p><p className="text-lg text-violet-200 font-semibold">{fmtUsd(model.metrics.npv)}</p></div>
      </div>

      <div className="flex flex-col xl:flex-row">
        <aside className="xl:w-[360px] p-4 border-r border-slate-800 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-3">
            <p className="text-sm font-medium text-cyan-200">Acquisition</p>
            <Slider label="Purchase Price" value={state.purchasePrice} min={500000} max={100000000} step={100000} onChange={(v) => update({ purchasePrice: v })} format={fmtUsd} />
            <Slider label="Closing Costs %" value={state.closingCostsPct} min={1} max={5} step={0.1} onChange={(v) => update({ closingCostsPct: v })} format={(v) => fmtPct(v)} />
            <Slider label="Holding Period" value={state.holdingPeriod} min={3} max={15} step={1} onChange={(v) => update({ holdingPeriod: v })} format={(v) => `${v}y`} />
            <Slider label="Renovation / CapEx" value={state.capexBudget} min={0} max={20000000} step={50000} onChange={(v) => update({ capexBudget: v })} format={fmtUsd} />
            <Slider label="Exit Cap Rate" value={state.exitCapRate} min={4} max={10} step={0.1} onChange={(v) => update({ exitCapRate: v })} format={(v) => fmtPct(v)} />
            <select className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm" value={state.propertyType} onChange={(e) => update({ propertyType: e.target.value })}>
              {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-3">
            <p className="text-sm font-medium text-cyan-200">Revenue</p>
            <Slider label="Base Rent ($/SF/yr)" value={state.baseRentPerSF} min={5} max={150} step={0.5} onChange={(v) => update({ baseRentPerSF: v })} format={(v) => `$${v.toFixed(2)}`} />
            <Slider label="Rent Growth %" value={state.rentGrowthPct} min={0} max={5} step={0.1} onChange={(v) => update({ rentGrowthPct: v })} format={(v) => fmtPct(v)} />
            <Slider label="Vacancy %" value={state.vacancyRatePct} min={0} max={20} step={0.25} onChange={(v) => update({ vacancyRatePct: v })} format={(v) => fmtPct(v)} />
            <Slider label="Concessions (months)" value={state.concessionMonths} min={0} max={6} step={0.25} onChange={(v) => update({ concessionMonths: v })} format={(v) => `${v.toFixed(1)} mo`} />
            <Slider label="Ancillary Income %" value={state.ancillaryIncomePct} min={0} max={12} step={0.25} onChange={(v) => update({ ancillaryIncomePct: v })} format={(v) => fmtPct(v)} />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-3">
            <p className="text-sm font-medium text-cyan-200">OpEx + Debt</p>
            <Slider label="Expense Growth %" value={state.expenseGrowthPct} min={1} max={4} step={0.1} onChange={(v) => update({ expenseGrowthPct: v })} format={(v) => fmtPct(v)} />
            <Slider label="Mgmt Fee % EGI" value={state.mgmtFeePct} min={3} max={5} step={0.1} onChange={(v) => update({ mgmtFeePct: v })} format={(v) => fmtPct(v)} />
            <Slider label="Recurring CapEx % EGI" value={state.recurringCapexPct} min={0.5} max={2} step={0.1} onChange={(v) => update({ recurringCapexPct: v })} format={(v) => fmtPct(v)} />
            <Slider label="TI $/SF" value={state.tiPerSF} min={0} max={120} step={1} onChange={(v) => update({ tiPerSF: v })} format={(v) => `$${Math.round(v)}`} />
            <Slider label="LC % Lease Value" value={state.leasingCommissionsPct} min={2} max={6} step={0.1} onChange={(v) => update({ leasingCommissionsPct: v })} format={(v) => fmtPct(v)} />
            <Slider label="LTV %" value={state.ltvPct} min={0} max={80} step={1} onChange={(v) => update({ ltvPct: v })} format={(v) => fmtPct(v)} />
            <Slider label="Interest Rate %" value={state.interestRatePct} min={3} max={8} step={0.05} onChange={(v) => update({ interestRatePct: v })} format={(v) => fmtPct(v)} />
            <Slider label="Amortization (years)" value={state.amortizationYears} min={5} max={30} step={1} onChange={(v) => update({ amortizationYears: v })} format={(v) => `${v}y`} />
            <Slider label="NPV Hurdle %" value={state.hurdleRatePct} min={8} max={12} step={0.25} onChange={(v) => update({ hurdleRatePct: v })} format={(v) => fmtPct(v)} />
          </div>
        </aside>

        <section className="flex-1 p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {["income", "cash", "equity", "expense", "bridge", "table"].map((k) => (
              <button
                key={k}
                onClick={() => setTab(k as typeof tab)}
                className={`px-3 py-1.5 rounded text-xs uppercase tracking-wide border ${
                  tab === k ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-100" : "border-slate-700 text-slate-400"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4" style={{ height: 420 }}>
            {tab === "income" && <Line data={incomeData} options={commonOptions} />}
            {tab === "cash" && <Bar data={cashData} options={commonOptions} />}
            {tab === "equity" && <Line data={cumulativeData} options={commonOptions} />}
            {tab === "expense" && <Doughnut data={expenseData} options={{ plugins: { legend: { labels: { color: "#cbd5e1" } } } }} />}
            {tab === "bridge" && <Bar data={bridgeData} options={commonOptions} />}
            {tab === "table" && (
              <div className="h-full overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2">Year</th>
                      <th className="text-right">EGI</th>
                      <th className="text-right">NOI</th>
                      <th className="text-right">Debt</th>
                      <th className="text-right">CFAD</th>
                      <th className="text-right">DSCR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.rows.map((r) => (
                      <tr key={r.year} className="border-b border-slate-800">
                        <td className="py-2">{r.year}</td>
                        <td className="text-right">{fmtUsd(r.egi)}</td>
                        <td className="text-right">{fmtUsd(r.noi)}</td>
                        <td className="text-right">{fmtUsd(r.debtService)}</td>
                        <td className={`text-right ${r.cfad >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{fmtUsd(r.cfad)}</td>
                        <td className="text-right">{r.dscr.toFixed(2)}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-cyan-200 mb-2">Validation</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className={`rounded p-2 border ${model.metrics.minDscr < 1 ? "border-rose-400/40 text-rose-300" : "border-emerald-400/30 text-emerald-300"}`}>
                DSCR min: {model.metrics.minDscr.toFixed(2)}x
              </div>
              <div className={`rounded p-2 border ${model.metrics.irr < 0 ? "border-rose-400/40 text-rose-300" : "border-emerald-400/30 text-emerald-300"}`}>
                Levered IRR: {fmtPct(model.metrics.irr)}
              </div>
              <div className="rounded p-2 border border-sky-400/30 text-sky-200">
                Break-even Occupancy: {fmtPct(model.metrics.breakEvenOccupancy)}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Exit proceeds: {fmtUsd(model.saleProceeds)} · Exit value: {fmtUsd(model.exitPriceGross)} · Initial equity: {fmtUsd(model.equity)}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
