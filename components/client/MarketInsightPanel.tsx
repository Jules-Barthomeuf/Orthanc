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
  Shield, 
  Home, 
  Gavel, 
  Activity,
  School,
  Building,
  Edit2,
  Save,
  BrainCircuit,
  Plus,
  Trash2,
  User,
  Camera
} from "lucide-react";

interface MarketInsightPanelProps {
  property: Property;
}

const DEFAULT_PERSPECTIVE: AgentPerspective[] = [];

export function MarketInsightPanel({ property }: MarketInsightPanelProps) {
  const data = property.marketData;
  const [perspective, setPerspective] = useState<AgentPerspective[]>(data?.agentPerspective || DEFAULT_PERSPECTIVE);
  const [isEditing, setIsEditing] = useState(false);
  const [agentPhoto, setAgentPhoto] = useState<string>(data?.agentPhoto || "");
  const [agentName, setAgentName] = useState<string>(data?.agentName || "");
  const [photoInput, setPhotoInput] = useState<string>(data?.agentPhoto || "");

  if (!data) return <div className="text-dark-300">Market data not available.</div>;

  const handleSave = () => {
    setAgentPhoto(photoInput);
    setIsEditing(false);
  };

  const handleUpdate = (index: number, field: "category" | "info", value: string) => {
    const updated = [...perspective];
    updated[index][field] = value;
    setPerspective(updated);
  };

  const handleAddCategory = () => {
    setPerspective((prev) => [...prev, { category: "New Category", info: "" }]);
  };

  const handleDeleteCategory = (index: number) => {
    setPerspective((prev) => prev.filter((_, i) => i !== index));
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
          {/* Header */}
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

          {/* Agent profile card */}
          <div className="bg-dark-800/20 rounded-lg p-5 border border-gold-400/10">
            <div className="flex items-center gap-4">
              {/* Photo */}
              <div className="relative flex-shrink-0">
                {agentPhoto ? (
                  <img
                    src={agentPhoto}
                    alt={agentName || "Agent"}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gold-400/30"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gold-400/10 border-2 border-gold-400/20 flex items-center justify-center text-gold-400">
                    <User size={24} />
                  </div>
                )}
              </div>
              {/* Name */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Agent name"
                    className="w-full bg-dark-900 border border-gold-400/30 text-sm text-white px-2 py-1 rounded focus:outline-none focus:border-gold-400"
                  />
                ) : (
                  <div className="text-white font-medium truncate">{agentName || "Agent"}</div>
                )}
                <div className="text-xs text-dark-400 mt-0.5">Market Analysis</div>
              </div>
            </div>
            {/* Photo URL input in edit mode */}
            {isEditing && (
              <div className="mt-4 flex items-center gap-2">
                <Camera size={13} className="text-dark-400 flex-shrink-0" />
                <input
                  type="text"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="Photo URL (https://...)"
                  className="flex-1 bg-dark-900 border border-gold-400/20 text-xs text-white px-2 py-1 rounded focus:outline-none focus:border-gold-400"
                />
              </div>
            )}
          </div>

          {/* Custom categories */}
          <div className="space-y-5">
            {perspective.length === 0 && !isEditing && (
              <p className="text-sm text-dark-500 italic text-center py-4">
                No analysis added yet. Click Edit to get started.
              </p>
            )}
            {perspective.map((item, index) => (
              <div key={index} className="space-y-1.5">
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => handleUpdate(index, "category", e.target.value)}
                        className="flex-1 bg-dark-900 border border-gold-400/30 text-xs uppercase tracking-wider text-gold-400 px-2 py-1 rounded focus:outline-none focus:border-gold-400 font-semibold"
                      />
                      <button
                        onClick={() => handleDeleteCategory(index)}
                        className="text-dark-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <textarea
                      value={item.info}
                      onChange={(e) => handleUpdate(index, "info", e.target.value)}
                      placeholder="Write your analysis here..."
                      className="w-full bg-dark-900 border border-gold-400/20 text-sm text-white p-2 rounded focus:outline-none focus:border-gold-400 min-h-[80px] resize-none"
                    />
                  </>
                ) : (
                  <>
                    <div className="text-xs uppercase tracking-wider text-gold-400/70 font-semibold">
                      {item.category}
                    </div>
                    <div className="text-sm text-white/70 leading-relaxed border-l-2 border-gold-400/20 pl-3 py-1">
                      {item.info || <span className="text-dark-500 italic">No content</span>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add category button */}
          {isEditing && (
            <button
              onClick={handleAddCategory}
              className="w-full flex items-center justify-center gap-2 text-xs text-dark-400 hover:text-gold-400 border border-dashed border-dark-600 hover:border-gold-400/40 rounded-lg py-3 transition-colors"
            >
              <Plus size={13} /> Add Category
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


