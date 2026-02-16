import {
  Agent,
  Client,
  User,
  Property,
  Document,
  MaintenanceRecord,
  OwnershipRecord,
} from "@/types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "agent-1",
    email: "michael.johnson@orthanc.com",
    role: "agent",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "agent-2",
    email: "sarah.williams@orthanc.com",
    role: "agent",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "client-1",
    email: "john.doe@example.com",
    role: "client",
    createdAt: new Date("2024-03-10"),
  },
];

// Mock Agents
export const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Michael Johnson",
    email: "michael.johnson@orthanc.com",
    phone: "+1 (555) 123-4567",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    bio: "Specializing in luxury waterfront properties in Miami Beach. 15+ years of experience in high-end real estate.",
    marketKnowledge:
      "Miami's luxury market is experiencing unprecedented growth. The influx of international buyers and remote work trends have created strong demand for premium properties. Waterfront properties are particularly sought after with prices appreciating 12-15% annually.",
    properties: ["prop-1", "prop-2"],
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "agent-2",
    name: "Sarah Williams",
    email: "sarah.williams@orthanc.com",
    phone: "+1 (555) 987-6543",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    bio: "Top-performing agent in Beverly Hills, specializing in contemporary estates. Decade of experience.",
    marketKnowledge:
      "Beverly Hills continues to attract ultra-high-net-worth individuals. New zoning changes are expected to impact development potential in the area. The local economy is robust with strong institutional support for luxury properties.",
    properties: ["prop-3"],
    createdAt: new Date("2024-02-01"),
  },
];

// Mock Properties
export const mockProperties: Property[] = [
  {
    id: "prop-1",
    title: "Villa Miami Beach",
    address: "123 Ocean Drive, Miami Beach, FL",
    price: 2500000,
    createdAt: new Date("2024-01-15"),
    yearBuilt: 2015,
    bedroom: 4,
    bathroom: 3,
    squareFeet: 3200,
    lot: 0.5,
    images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb"],
    description: "Superbe villa moderne avec vue sur l'océan et piscine à débordement.",
    agentId: "agent-1",
    documents: [],
    maintenanceHistory: [],
    marketData: {
      neighborhood: "South of Fifth",
      city: "Miami Beach",
      neighborhoodVibe: "Luxury living with vibrant nightlife and pristine beaches. Highly walkable and exclusive.",
      demographics: {
        population: "92,300",
        medianAge: 40,
        medianIncome: 85000,
        ownerOccupied: 45
      },
      schools: [
        { name: "South Pointe Elementary", rating: 9, type: "Public", distance: "0.5 miles" },
        { name: "Miami Beach Senior High", rating: 8, type: "Public", distance: "2.1 miles" }
      ],
      transportation: {
        transitScore: 70,
        walkScore: 92,
        bikeScore: 85,
        nearbyStations: ["Alton Rd & 4th St", "Washington Ave & 3rd St"]
      },
      safety: {
        crimeRate: "Low",
        safetyScore: 88
      },
      marketTrends: {
        medianPrice: 2100000,
        avgDaysOnMarket: 45,
        pricePerSqFt: 1250,
        inventoryLevel: "Balanced",
        appreciationRate: 12.5
      },
      attractions: ["South Pointe Park", "Art Deco Historic District", "Miami Beach Marina"],
      localPolicies: ["Short-term rental restrictions apply", "Historic preservation guidelines"],
      zoningInfo: "Residential Single Family (RS-4)",
      economicOutlook: "Strong growth driven by tech migration and tourism recovery.",
      priceHistory: [
        { date: new Date("2020-01-01"), price: 1800000 },
        { date: new Date("2021-01-01"), price: 1950000 },
        { date: new Date("2022-01-01"), price: 2200000 },
        { date: new Date("2023-01-01"), price: 2350000 },
        { date: new Date("2024-01-01"), price: 2500000 },
      ],
    },
    investmentAnalysis: {
      currentValue: 2500000,
      projectedValue5Year: 3200000,
      projectedValue10Year: 4100000,
      roiProjection: 28,
      scenarios: [],
      capRate: 4.2,
    },
    ownershipHistory: []
  },
  {
    id: "prop-2",
    title: "Penthouse Beverly Hills",
    address: "456 Sunset Blvd, Beverly Hills, CA",
    price: 4200000,
    createdAt: new Date("2024-02-20"),
    yearBuilt: 2018,
    bedroom: 5,
    bathroom: 4,
    squareFeet: 4100,
    lot: 0.7,
    images: ["https://images.unsplash.com/photo-1464983953574-0892a716854b"],
    description: "Penthouse luxueux avec rooftop et vue panoramique sur la ville.",
    agentId: "agent-2",
    documents: [],
    maintenanceHistory: [],
    marketData: {
      neighborhood: "The Flats",
      city: "Beverly Hills",
      neighborhoodVibe: "World-famous luxury destination with high-end shopping and dining. Quiet, tree-lined streets.",
      demographics: {
        population: "34,000",
        medianAge: 46,
        medianIncome: 150000,
        ownerOccupied: 60
      },
      schools: [
        { name: "Beverly Hills High", rating: 10, type: "Public", distance: "1.2 miles" },
        { name: "Hawthorne Elementary", rating: 10, type: "Public", distance: "0.8 miles" }
      ],
      transportation: {
        transitScore: 45,
        walkScore: 88,
        bikeScore: 65,
        nearbyStations: ["Wilshire / Rodeo"]
      },
      safety: {
        crimeRate: "Very Low",
        safetyScore: 95
      },
      marketTrends: {
        medianPrice: 3800000,
        avgDaysOnMarket: 30,
        pricePerSqFt: 1800,
        inventoryLevel: "Low",
        appreciationRate: 8.4
      },
      attractions: ["Rodeo Drive", "Beverly Gardens Park", "Greystone Mansion"],
      localPolicies: ["Strict noise ordinances", "Height restrictions for new construction"],
      zoningInfo: "R-1 Single Family Residential",
      economicOutlook: "Stable luxury market with consistent international demand.",
      agentPerspective: [
        { category: "Insider Tips", info: "The north side of the street gets significantly less traffic noise. The neighbors are known for their annual summer block party." },
        { category: "Future Development", info: "Rumors of a new upscale organic grocer opening two blocks away next year. City planning just approved a new park renovation nearby." },
        { category: "Local Lifestyle", info: "Sunday farmers market is a must. The community is very private but friendly, with a strong focus on security and privacy." },
        { category: "Investment Outlook", info: "Prices here have been resilient even during downturns due to the school district. Expect steady appreciation." }
      ],
      priceHistory: [
        { date: new Date("2020-01-01"), price: 3500000 },
        { date: new Date("2021-01-01"), price: 3700000 },
        { date: new Date("2022-01-01"), price: 3950000 },
        { date: new Date("2023-01-01"), price: 4100000 },
        { date: new Date("2024-01-01"), price: 4200000 },
      ],
    },
    investmentAnalysis: {
      currentValue: 4200000,
      projectedValue5Year: 5000000,
      projectedValue10Year: 6200000,
      roiProjection: 20,
      scenarios: [],
      capRate: 3.8,
    },
    ownershipHistory: []
  },
];

// Mock Clients
export const mockClients: Client[] = [
  {
    id: "client-1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 111-2222",
    interestedProperties: ["prop-1", "prop-2"],
    createdAt: new Date("2024-03-10"),
  },
];

// In-memory "database"
export const db = {
  users: mockUsers,
  agents: mockAgents,
  clients: mockClients,
  properties: mockProperties,
};

export function findUserByEmail(email: string): User | undefined {
  return db.users.find((u) => u.email === email);
}

export function findAgentById(id: string): Agent | undefined {
  return db.agents.find((a) => a.id === id);
}

export function findPropertyById(id: string): Property | undefined {
  return db.properties.find((p) => p.id === id);
}

export function findPropertiesByAgentId(agentId: string): Property[] {
  return db.properties.filter((p) => p.agentId === agentId);
}

export function createUser(user: User): User {
  db.users.push(user);
  return user;
}

export function createProperty(property: Property): Property {
  db.properties.push(property);
  const agent = findAgentById(property.agentId);
  if (agent) {
    agent.properties.push(property.id);
  }
  return property;
}
