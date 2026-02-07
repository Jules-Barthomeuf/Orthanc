"use client";

import { Property } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MarketInsightPanelProps {
  property: Property;
}

export function MarketInsightPanel({ property }: MarketInsightPanelProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold gradient-text mb-6">Market Insight</h2>

      {/* Price History Chart */}
      <div className="bg-dark-700 border border-gold-800 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gold-400 mb-4">📈 Price History</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={property.marketData.priceHistory as any}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d4a855" opacity={0.1} />
            <XAxis
              dataKey="date"
              stroke="#999"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString()
              }
            />
            <YAxis stroke="#999" />
            <Tooltip
              formatter={(value: any) => `$${(Number(value) / 1000000).toFixed(2)}M`}
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #d4a855",
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#d4a855"
              strokeWidth={2}
              dot={{ fill: "#d4a855", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Neighborhood & Attractions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-dark-700 border border-gold-800 rounded-lg p-6">
          <h3 className="font-semibold text-gold-400 mb-3">🏘️ Neighborhood Vibe</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {property.marketData.neighborhoodVibe}
          </p>
        </div>

        <div className="bg-dark-700 border border-gold-800 rounded-lg p-6">
          <h3 className="font-semibold text-gold-400 mb-3">⭐ Local Attractions</h3>
          <ul className="space-y-2">
            {property.marketData.attractions.map((attraction, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-start">
                <span className="text-gold-400 mr-2 mt-1">•</span>
                <span>{attraction}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Political & Economic Environment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-700 border border-gold-800 rounded-lg p-6">
          <h3 className="font-semibold text-gold-400 mb-3">📋 Zoning & Policies</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-xs">ZONING</p>
              <p className="text-gray-300 text-sm">{property.marketData.zoningInfo}</p>
            </div>
            <div className="pt-4 border-t border-gold-800">
              <p className="text-gray-500 text-xs">POLICY OUTLOOK</p>
              <ul className="text-gray-300 text-sm space-y-1 mt-2">
                {property.marketData.localPolicies.map((policy, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-gold-400">•</span>
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-dark-700 border border-gold-800 rounded-lg p-6">
          <h3 className="font-semibold text-gold-400 mb-3">📊 Economic Outlook</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {property.marketData.economicOutlook}
          </p>
          <div className="mt-4 pt-4 border-t border-gold-800">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Market Sentiment</span>
              <span className="text-green-400 font-semibold">↗ Positive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent's Knowledge */}
      <div className="bg-gold-900/20 border border-gold-700/50 rounded-lg p-4 mt-6">
        <p className="text-gray-300 text-sm">
          <span className="text-gold-400 font-semibold">👨‍💼 Agent's Insight:</span> Based on
          local market data, this property is positioned in a prime location with strong
          appreciation potential. The neighborhood continues to attract high-net-worth
          individuals and has shown consistent growth over the past 5 years.
        </p>
      </div>
    </div>
  );
}
