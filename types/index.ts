export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  description: string;
  images: string[];
  agentId: string;
  createdAt: Date;
  bedroom: number;
  bathroom: number;
  squareFeet: number;
  yearBuilt: number;
  lot: number;
  documents: Document[];
  maintenanceHistory: MaintenanceRecord[];
  ownershipHistory: OwnershipRecord[];
  marketData: MarketData;
  investmentAnalysis: InvestmentAnalysis;
  annualOpex?: number;
}

export interface Document {
  id: string;
  name: string;
  type: "blueprint" | "permit" | "inspection" | "other";
  url: string;
  uploadedAt: Date;
  analysis: string;
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  description: string;
  cost: number;
  category: string;
}

export interface OwnershipRecord {
  id: string;
  owner: string;
  purchaseDate: Date;
  saleDate: Date;
  purchasePrice: number;
  salePrice: number;
  reason: string;
}

export interface MarketData {
  neighborhood: string;
  city: string;
  neighborhoodVibe: string;
  demographics: {
    population: string;
    medianAge: number;
    medianIncome: number;
    ownerOccupied: number; // percentage
  };
  schools: {
    name: string;
    rating: number; // 1-10
    type: string;
    distance: string;
  }[];
  transportation: {
    transitScore: number;
    walkScore: number;
    bikeScore: number;
    nearbyStations: string[];
  };
  safety: {
    crimeRate: string;
    safetyScore: number; // 0-100
  };
  marketTrends: {
    medianPrice: number;
    avgDaysOnMarket: number;
    pricePerSqFt: number;
    inventoryLevel: string;
    appreciationRate: number; // yearly percentage
  };
  attractions: string[];
  localPolicies: string[];
  zoningInfo: string;
  economicOutlook: string;
  priceHistory: { date: Date; price: number }[];
  agentPerspective?: AgentPerspective[];
}

export interface AgentPerspective {
  category: string;
  info: string;
}

export interface InvestmentAnalysis {
  currentValue: number;
  projectedValue5Year: number;
  projectedValue10Year: number;
  capRate: number;
  roiProjection: number;
  scenarios: InvestmentScenario[];
}

export interface InvestmentScenario {
  name: string;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  monthlyPayment: number;
  totalCost: number;
  equity5Year: number;
  marketValue5Year: number;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  bio: string;
  marketKnowledge: string;
  properties: string[];
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  interestedProperties: string[];
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  role: "agent" | "client";
  createdAt: Date;
}
