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
  const [downPayment, setDownPayment] = useState(property.price * 0.25);
  const [selectedScenario, setSelectedScenario] = useState(0);

  const scenario = property.investmentAnalysis.scenarios[selectedScenario];
  const loanAmount = property.price - downPayment;

  // Calculate monthly payment
  const monthlyRate = (scenario.interestRate / 100) / 12;
  const numPayments = scenario.loanTerm * 12;
  const monthlyPayment =
    (loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Generate amortization chart data
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
      <h2 className="text-2xl font-bold gradient-text mb-6">
        Investment & Tax Optimization
      </h2>

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {property.investmentAnalysis.scenarios.map((scen, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedScenario(idx);
              setDownPayment(scen.downPayment);
            }}
            className={`p-4 rounded-lg border transition-all text-left ${
              selectedScenario === idx
                ? "luxury-card border-gold-500 bg-dark-700"
                : "luxury-card border-gold-900 hover:border-gold-700"
            }`}
          >
            <h4 className="font-semibold mb-2">{scen.name} Plan</h4>
            <p className="text-gold-400 text-sm mb-1">
              ${(scen.downPayment / 1000000).toFixed(2)}M down
            </p>
            <p className="text-gray-400 text-xs">
              ${Math.round(monthlyPayment).toLocaleString()}/mo
            </p>
          </button>
        ))}
      </div>

      {/* Interactive Controls */}
      <div className="bg-dark-700 border border-gold-800 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gold-400 mb-4">🎮 Adjust Your Scenario</h3>
        <div className="space-y-6">
          {/* Down Payment Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-gray-300 text-sm">Down Payment</label>
              <span className="text-gold-400 font-semibold">
                ${(downPayment / 1000000).toFixed(2)}M (
                {((downPayment / property.price) * 100).toFixed(1)}%)
              </span>
            </div>
            <input
              type="range"
              min={property.price * 0.1}
              max={property.price * 0.5}
              value={downPayment}
              onChange={(e) => setDownPayment(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-gold-500"
            />
            <div className="flex justify-between text-gray-500 text-xs mt-2">
              <span>10%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-800 rounded p-3">
              <p className="text-gray-500 text-xs">Loan Amount</p>
              <p className="text-xl font-semibold text-gold-400">
                ${(loanAmount / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className="bg-dark-800 rounded p-3">
              <p className="text-gray-500 text-xs">Monthly Payment</p>
              <p className="text-xl font-semibold text-gold-400">
                ${Math.round(monthlyPayment).toLocaleString()}
              </p>
            </div>
            <div className="bg-dark-800 rounded p-3">
              <p className="text-gray-500 text-xs">Annual Cost</p>
              <p className="text-xl font-semibold text-gold-400">
                ${Math.round(monthlyPayment * 12).toLocaleString()}
              </p>
            </div>
            <div className="bg-dark-800 rounded p-3">
              <p className="text-gray-500 text-xs">Interest Rate</p>
              <p className="text-xl font-semibold text-gold-400">
                {scenario.interestRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Equity Growth Chart */}
      <div className="bg-dark-700 border border-gold-800 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gold-400 mb-4">📊 Equity Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d4a855" opacity={0.1} />
            <XAxis dataKey="year" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              formatter={(value: any) => `$${(Number(value) / 1000000).toFixed(2)}M`}
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #d4a855",
              }}
            />
            <Legend />
            <Bar dataKey="equity" fill="#d4a855" name="Equity" />
            <Bar dataKey="debt" fill="#545454" name="Debt" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Investment Projections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-700 border border-gold-800 rounded-lg p-6">
          <p className="text-gray-500 text-xs mb-2">5-Year Projection</p>
          <div className="mb-2">
            <p className="text-2xl font-bold gradient-text">
              ${(property.investmentAnalysis.projectedValue5Year / 1000000).toFixed(2)}M
            </p>
            <p className="text-green-400 text-sm">
              +
              {(
                ((property.investmentAnalysis.projectedValue5Year -
                  property.price) /
                  property.price) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
          <div className="text-xs text-gray-400 border-t border-gold-800 pt-3 mt-3">
            <p>
              Equity: $
              {(
                property.investmentAnalysis.scenarios[selectedScenario]
                  .equity5Year / 1000000
              ).toFixed(2)}
              M
            </p>
          </div>
        </div>

        <div className="bg-dark-700 border border-gold-800 rounded-lg p-6">
          <p className="text-gray-500 text-xs mb-2">10-Year Projection</p>
          <div className="mb-2">
            <p className="text-2xl font-bold gradient-text">
              ${(property.investmentAnalysis.projectedValue10Year / 1000000).toFixed(2)}M
            </p>
            <p className="text-green-400 text-sm">
              +
              {(
                ((property.investmentAnalysis.projectedValue10Year -
                  property.price) /
                  property.price) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>

        <div className="bg-dark-700 border border-gold-800 rounded-lg p-6">
          <p className="text-gray-500 text-xs mb-2">CAP Rate & ROI</p>
          <div className="mb-2">
            <p className="text-2xl font-bold text-gold-400">
              {property.investmentAnalysis.capRate}%
            </p>
            <p className="text-gray-400 text-sm">CAP Rate</p>
          </div>
          <div className="text-xs text-gray-400 border-t border-gold-800 pt-3 mt-3">
            <p>
              ROI: {property.investmentAnalysis.roiProjection}% /year
            </p>
          </div>
        </div>
      </div>

      {/* Economic Scenarios */}
      <div className="bg-dark-700 border border-gold-800 rounded-lg p-6">
        <h3 className="font-semibold text-gold-400 mb-4">
          🔮 Economic Policy Impact
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300 text-sm">Interest Rate +1%</span>
              <span className="text-red-400 text-sm">-$15,240/year</span>
            </div>
            <div className="w-full bg-dark-800 rounded h-2">
              <div className="bg-red-500 h-2 rounded" style={{ width: "65%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300 text-sm">Property Tax +10%</span>
              <span className="text-yellow-400 text-sm">-$8,500/year</span>
            </div>
            <div className="w-full bg-dark-800 rounded h-2">
              <div className="bg-yellow-500 h-2 rounded" style={{ width: "35%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300 text-sm">Market Appreciation +15%</span>
              <span className="text-green-400 text-sm">+$2.3M value</span>
            </div>
            <div className="w-full bg-dark-800 rounded h-2">
              <div className="bg-green-500 h-2 rounded" style={{ width: "90%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
