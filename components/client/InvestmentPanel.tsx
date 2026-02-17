"use client";

import { Property } from "@/types";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface InvestmentPanelProps {
  property: Property;
}

export function InvestmentPanel({ property }: InvestmentPanelProps) {
  const [downPayment, setDownPayment] = useState((property.price ?? 0) * 0.25);
  const [selectedScenario, setSelectedScenario] = useState(0);

  const scenarios = property.investmentAnalysis?.scenarios ?? [];
  const scenario = scenarios[selectedScenario];
  if (!scenario) return <div className="p-8 text-dark-400">Investment analysis not available for this property.</div>;
  const loanAmount = property.price - downPayment;

  const monthlyRate = (scenario.interestRate / 100) / 12;
  const numPayments = scenario.loanTerm * 12;
  const monthlyPayment =
    (loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  const chartData = [
    {
      year: "Year 1",
      equity: downPayment + monthlyPayment * 12,
      debt: loanAmount - monthlyPayment * 12,
    },
    {
      year: "Year 5",
      equity: property.investmentAnalysis.scenarios[selectedScenario].equity5Year,
      debt:
        property.price -
        property.investmentAnalysis.scenarios[selectedScenario].equity5Year,
    },
    {
      year: "Year 10",
      equity:
        property.investmentAnalysis.scenarios[selectedScenario].equity5Year * 2,
      debt:
        property.price -
        property.investmentAnalysis.scenarios[selectedScenario].equity5Year * 2,
    },
  ];

  return (
    <div>
      <h2 className="heading-luxury text-2xl text-white mb-2">
        Investment & Tax Optimization
      </h2>
      <div className="gold-line-left w-20 mb-8"></div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {property.investmentAnalysis.scenarios.map((scen, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedScenario(idx);
              setDownPayment(scen.downPayment);
            }}
            className={`p-5 rounded-lg border transition-all text-left ${
              selectedScenario === idx
                ? "bg-dark-900 border-gold-400/30"
                : "bg-dark-900 border-dark-600/20 hover:border-gold-400/15"
            }`}
          >
            <h4 className={`font-semibold text-sm mb-2 ${selectedScenario === idx ? 'text-gold-400' : 'text-white'}`}>
              {scen.name} Plan
            </h4>
            <p className="text-white text-sm mb-1">
              ${(scen.downPayment / 1000000).toFixed(2)}M down
            </p>
            <p className="text-dark-500 text-xs">
              ${Math.round(monthlyPayment).toLocaleString('en-US')}/mo
            </p>
          </button>
        ))}
      </div>

      {/* Interactive Controls */}
      <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-6 mb-8">
        <h3 className="label-luxury text-dark-300 mb-6">Adjust Your Scenario</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-dark-300 text-sm">Down Payment</label>
              <span className="text-gold-400 font-semibold text-sm">
                ${(downPayment / 1000000).toFixed(2)}M ({((downPayment / property.price) * 100).toFixed(1)}%)
              </span>
            </div>
            <input
              type="range"
              min={property.price * 0.1}
              max={property.price * 0.5}
              value={downPayment}
              onChange={(e) => setDownPayment(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-[#c9a96e]"
            />
            <div className="flex justify-between text-dark-500 text-xs mt-2">
              <span>10%</span>
              <span>50%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-800 rounded p-4 border border-dark-600/20">
              <p className="label-luxury text-dark-500 text-[10px] mb-1">Loan Amount</p>
              <p className="text-xl font-display font-bold text-white">
                ${(loanAmount / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className="bg-dark-800 rounded p-4 border border-dark-600/20">
              <p className="label-luxury text-dark-500 text-[10px] mb-1">Monthly Payment</p>
              <p className="text-xl font-display font-bold text-white">
                ${Math.round(monthlyPayment).toLocaleString('en-US')}
              </p>
            </div>
            <div className="bg-dark-800 rounded p-4 border border-dark-600/20">
              <p className="label-luxury text-dark-500 text-[10px] mb-1">Annual Cost</p>
              <p className="text-xl font-display font-bold text-white">
                ${Math.round(monthlyPayment * 12).toLocaleString('en-US')}
              </p>
            </div>
            <div className="bg-dark-800 rounded p-4 border border-dark-600/20">
              <p className="label-luxury text-dark-500 text-[10px] mb-1">Interest Rate</p>
              <p className="text-xl font-display font-bold text-white">
                {scenario.interestRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Equity Growth Chart */}
      <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-6 mb-8">
        <h3 className="label-luxury text-dark-300 mb-6">Equity Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#c9a96e" opacity={0.1} />
            <XAxis dataKey="year" stroke="#555" tick={{ fontSize: 11 }} />
            <YAxis stroke="#555" tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: any) => `$${(Number(value) / 1000000).toFixed(2)}M`}
              contentStyle={{
                backgroundColor: "#141414",
                border: "1px solid rgba(201,169,110,0.2)",
                borderRadius: "6px",
                color: "#f5f0e8",
              }}
            />
            <Legend />
            <Bar dataKey="equity" fill="#c9a96e" name="Equity" radius={[4, 4, 0, 0]} />
            <Bar dataKey="debt" fill="#333" name="Debt" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Investment Projections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-6">
          <p className="label-luxury text-dark-500 text-[10px] mb-3">5-Year Projection</p>
          <p className="font-display text-2xl font-bold text-gold-400 mb-1">
            ${(property.investmentAnalysis.projectedValue5Year / 1000000).toFixed(2)}M
          </p>
          <p className="text-green-400 text-sm">
            +{(((property.investmentAnalysis.projectedValue5Year - property.price) / property.price) * 100).toFixed(1)}%
          </p>
          <div className="gold-line mt-4 mb-3"></div>
          <p className="text-dark-400 text-xs">
            Equity: ${(property.investmentAnalysis.scenarios[selectedScenario].equity5Year / 1000000).toFixed(2)}M
          </p>
        </div>

        <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-6">
          <p className="label-luxury text-dark-500 text-[10px] mb-3">10-Year Projection</p>
          <p className="font-display text-2xl font-bold text-gold-400 mb-1">
            ${(property.investmentAnalysis.projectedValue10Year / 1000000).toFixed(2)}M
          </p>
          <p className="text-green-400 text-sm">
            +{(((property.investmentAnalysis.projectedValue10Year - property.price) / property.price) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-6">
          <p className="label-luxury text-dark-500 text-[10px] mb-3">Cap Rate & ROI</p>
          <p className="font-display text-2xl font-bold text-white mb-1">
            {property.investmentAnalysis.capRate}%
          </p>
          <p className="text-dark-400 text-sm">CAP Rate</p>
          <div className="gold-line mt-4 mb-3"></div>
          <p className="text-dark-400 text-xs">
            ROI: {property.investmentAnalysis.roiProjection}% /year
          </p>
        </div>
      </div>

      {/* Economic Policy Impact */}
      <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-6">
        <h3 className="label-luxury text-dark-300 mb-6">Economic Policy Impact</h3>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-dark-300 text-sm">Interest Rate +1%</span>
              <span className="text-red-400 text-sm">-$15,240/year</span>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-1.5">
              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "65%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-dark-300 text-sm">Property Tax +10%</span>
              <span className="text-yellow-400 text-sm">-$8,500/year</span>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-1.5">
              <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: "35%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-dark-300 text-sm">Market Appreciation +15%</span>
              <span className="text-green-400 text-sm">+$2.3M value</span>
            </div>
            <div className="w-full bg-dark-800 rounded-full h-1.5">
              <div className="bg-green-400 h-1.5 rounded-full" style={{ width: "90%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}