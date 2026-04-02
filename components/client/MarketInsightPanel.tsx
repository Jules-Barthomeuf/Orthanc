"use client";

import { Property, AgentPerspective } from "@/types";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  MapPin, 
  TrendingUp, 
  Users, 
  GraduationCap, 
  Shield, 
  Train, 
  Home, 
  Gavel, 
  Activity,
  School,
  Building,
  UserCheck,
  Edit2,
  Save,
  BrainCircuit
} from "lucide-react";

interface MarketInsightPanelProps {
  property: Property;
}

const DEFAULT_PERSPECTIVE: AgentPerspective[] = [
  { category: "Insider Tips", info: "Add insider knowledge about this area..." },
  { category: "Future Development", info: "What's coming to this neighborhood?" },
  { category: "Local Lifestyle", info: "Describe the day-to-day vibes..." },
  { category: "Investment Outlook", info: "Agent's prediction on value..." }
];

export function MarketInsightPanel({ property }: MarketInsightPanelProps) {
  const data = property.marketData;
  const [perspective, setPerspective] = useState<AgentPerspective[]>(data?.agentPerspective || DEFAULT_PERSPECTIVE);
  const [isEditing, setIsEditing] = useState(false);

  if (!data) return <div className="text-dark-300">Market data not available.</div>;

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saving perspective:", perspective);
  };

  const handleUpdate = (index: number, newText: string) => {
    const newPerspective = [...perspective];
    newPerspective[index].info = newText;
    setPerspective(newPerspective);
  };

  return (
    <div className="animate-fade-in-up overflow-hidden">
      <div>
        <h2 className="heading-luxury text-3xl text-white mb-2">Market Insights</h2>
        <div className="gold-line-left w-20 mb-6"></div>
        <p className="text-white/80 text-base leading-relaxed max-w-3xl">
          Comprehensive analysis of {data.city}'s {data.neighborhood} district, features real-time market trends, demographic breakdown, and investment potential.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-900/50 border border-gold-400/10 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gold-400 mb-2">
            <TrendingUp size={18} />
            <span className="text-sm font-medium tracking-wider uppercase">Appreciation</span>
          </div>
          <div className="text-2xl text-white font-light">+{data.marketTrends?.appreciationRate}%</div>
          <div className="text-xs text-dark-300">Year over Year</div>
        </div>
        <div className="bg-dark-900/50 border border-gold-400/10 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gold-400 mb-2">
            <Activity size={18} />
            <span className="text-sm font-medium tracking-wider uppercase">Market Speed</span>
          </div>
          <div className="text-2xl text-white font-light">{data.marketTrends?.avgDaysOnMarket} Days</div>
          <div className="text-xs text-dark-300">Avg. on Market</div>
        </div>
        <div className="bg-dark-900/50 border border-gold-400/10 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gold-400 mb-2">
            <Home size={18} />
            <span className="text-sm font-medium tracking-wider uppercase">Inventory</span>
          </div>
          <div className="text-2xl text-white font-light">{data.marketTrends?.inventoryLevel}</div>
          <div className="text-xs text-dark-300">Supply Level</div>
        </div>
        <div className="bg-dark-900/50 border border-gold-400/10 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gold-400 mb-2">
            <Shield size={18} />
            <span className="text-sm font-medium tracking-wider uppercase">Safety Score</span>
          </div>
          <div className="text-2xl text-white font-light">{data.safety?.safetyScore}/100</div>
          <div className="text-xs text-dark-300">{data.safety?.crimeRate} Crime Rate</div>
        </div>
      </div>

      {/* Price Evolution Chart */}
      <div className="bg-dark-900 border border-gold-400/10 rounded-lg p-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="label-luxury text-dark-100 mb-1">Price Evolution</h3>
            <p className="text-sm text-dark-300">5-Year Historical Performance</p>
          </div>
          <div className="flex gap-4 text-sm">
             <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                <span className="text-dark-300">Property Values</span>
             </div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#c9a96e" opacity={0.1} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#555"
                tickFormatter={(date) => new Date(date).getFullYear().toString()}
                tick={{ fontSize: 10, fill: "#666" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#555" 
                tick={{ fontSize: 10, fill: "#666" }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value: any) => [`$${(Number(value) / 1000000).toFixed(2)}M`, "Avg Price"]}
                contentStyle={{
                  backgroundColor: "#0a0a0a",
                  borderColor: "rgba(201,169,110,0.3)",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: "#e5e5e5"
                }}
                itemStyle={{ color: "#c9a96e" }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#c9a96e"
                strokeWidth={2}
                dot={{ fill: "#0a0a0a", stroke: "#c9a96e", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#c9a96e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Neighborhood Vibe & Transport */}
        <div className="space-y-8">
          <div>
             <h3 className="label-luxury text-gold-400 mb-4 flex items-center gap-2">
               <MapPin size={16} /> Neighborhood Vibe
             </h3>
             <div className="bg-dark-800/30 border border-gold-400/5 p-5 rounded-lg">
                <p className="text-base text-white/70 leading-relaxed italic mb-4">
                  "{data.neighborhoodVibe}"
                </p>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gold-400/10">
                   <div className="text-center">
                      <div className="text-xl text-white font-light">{data.transportation?.walkScore}</div>
                      <div className="text-xs text-dark-300 uppercase tracking-widest mt-1">Walk Score</div>
                   </div>
                   <div className="text-center border-l border-gold-400/10">
                      <div className="text-xl text-white font-light">{data.transportation?.transitScore}</div>
                      <div className="text-xs text-dark-300 uppercase tracking-widest mt-1">Transit</div>
                   </div>
                   <div className="text-center border-l border-gold-400/10">
                      <div className="text-xl text-white font-light">{data.transportation?.bikeScore}</div>
                      <div className="text-xs text-dark-300 uppercase tracking-widest mt-1">Bike</div>
                   </div>
                </div>
             </div>
          </div>

          <div>
             <h3 className="label-luxury text-gold-400 mb-4 flex items-center gap-2">
               <Building size={16} /> Demographics
             </h3>
             <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-base text-white/60">Population</span>
                   <span className="text-base text-white font-mono">{data.demographics?.population}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-base text-white/60">Median Age</span>
                   <span className="text-base text-white font-mono">{data.demographics?.medianAge} Years</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-base text-white/60">Median Household Income</span>
                   <span className="text-base text-white font-mono">${data.demographics?.medianIncome?.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-base text-white/60">Owner Occupied</span>
                   <span className="text-base text-white font-mono">{data.demographics?.ownerOccupied}%</span>
                </div>
             </div>
          </div>
        </div>

        {/* Schools & Policies */}
        <div className="space-y-8">
           <div>
             <h3 className="label-luxury text-gold-400 mb-4 flex items-center gap-2">
               <School size={16} /> Nearby Schools
             </h3>
             <div className="space-y-3">
                {data.schools?.map((school, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-dark-800/30 border border-white/5 rounded hover:border-gold-400/20 transition-colors">
                     <div>
                        <div className="text-base text-white font-medium">{school.name}</div>
                        <div className="text-sm text-dark-300 mt-0.5">{school.type} • {school.distance}</div>
                     </div>
                     <div className="h-8 w-8 rounded-full bg-gold-400/10 flex items-center justify-center border border-gold-400/20 text-gold-400 font-bold text-xs">
                        {school.rating}
                     </div>
                  </div>
                ))}
             </div>
           </div>

           <div>
              <h3 className="label-luxury text-gold-400 mb-4 flex items-center gap-2">
                <Gavel size={16} /> Zoning & Policies
              </h3>
              <div className="bg-dark-900/30 p-4 rounded text-sm text-white/70 space-y-3 border-l-2 border-gold-400/30">
                 <div>
                    <span className="text-gold-200 block mb-1 font-medium">Zoning Classification</span>
                    {data.zoningInfo}
                 </div>
                 <div>
                    <span className="text-gold-200 block mb-1 font-medium">Local Guidelines</span>
                    <ul className="list-disc list-inside opacity-80 space-y-1">
                      {data.localPolicies?.map((policy, i) => (
                        <li key={i}>{policy}</li>
                      ))}
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>

    <div className="xl:col-span-1 border-l border-white/5 xl:pl-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="label-luxury text-gold-400 flex items-center gap-2">
              <BrainCircuit size={18} /> Agent's Perspective
            </h3>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="text-xs text-dark-300 hover:text-gold-400 flex items-center gap-1 transition-colors"
            >
              {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>

          <div className="bg-dark-800/20 rounded-lg p-5 border border-gold-400/10">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-400">
                  <UserCheck size={20} />
               </div>
               <div>
                  <div className="text-white text-base font-medium">Combined Knowledge</div>
                  <div className="text-sm text-dark-300">Insights from 32 agents</div>
               </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
               Aggregated intelligence from top-performing agents in the area. This data represents collective on-the-ground experience not found in standard reports.
            </p>
          </div>

          <div className="space-y-4">
             {perspective.map((item, index) => (
               <div key={index} className="space-y-2">
                  <div className="text-sm uppercase tracking-wider text-gold-400/70 font-semibold">{item.category}</div>
                  {isEditing ? (
                    <textarea 
                      value={item.info}
                      onChange={(e) => handleUpdate(index, e.target.value)}
                      className="w-full bg-dark-900 border border-gold-400/30 text-sm text-white p-2 rounded focus:outline-none focus:border-gold-400 min-h-[80px]"
                    />
                  ) : (
                    <div className="text-base text-white/70 leading-relaxed border-l-2 border-white/10 pl-3 py-1">
                       {item.info}
                    </div>
                  )}
               </div>
             ))}
          </div>

          {!isEditing && (
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-gold-400/50 italic">
                Last updated 2 days ago by participating agents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


