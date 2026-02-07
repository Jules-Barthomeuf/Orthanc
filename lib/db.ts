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
    title: "Luxury Oceanfront Villa - Miami Beach Mansion",
    address: "4521 Ocean Drive, Miami Beach, FL 33139",
    price: 15500000,
    description:
      "Stunning oceanfront mansion with 180-degree views of the Atlantic Ocean. Featuring 6 bedrooms, 7.5 bathrooms, and state-of-the-art amenities.",
    images: [
      "https://images.unsplash.com/photo-1613490900233-141ee9f9e0a0?w=1200",
      "https://images.unsplash.com/photo-1600585152552-5d5ef8e2b0f8?w=1200",
      "https://images.unsplash.com/photo-1590672894672-f26ff92e998d?w=1200",
    ],
    agentId: "agent-1",
    createdAt: new Date("2024-03-01"),
    bedroom: 6,
    bathroom: 7.5,
    squareFeet: 9500,
    yearBuilt: 2015,
    lot: 2.5,
    documents: [
      {
        id: "doc-1",
        name: "Floor Plans - Full Property",
        type: "blueprint",
        url: "#",
        uploadedAt: new Date("2024-03-01"),
        analysis:
          "Property features open concept living areas with seamless indoor-outdoor transitions. Each bedroom suite is independently designed with luxury finishes.",
      },
      {
        id: "doc-2",
        name: "2024 Property Inspection Report",
        type: "inspection",
        url: "#",
        uploadedAt: new Date("2024-03-01"),
        analysis:
          "Excellent structural condition. Minor updates recommended for pool equipment. Foundation is solid with no concerns.",
      },
    ],
    maintenanceHistory: [
      {
        id: "maint-1",
        date: new Date("2024-01-15"),
        description: "Annual pool equipment service and cleaning",
        cost: 8500,
        category: "Pool & Spa",
      },
      {
        id: "maint-2",
        date: new Date("2023-10-20"),
        description: "Roof inspection and minor repairs",
        cost: 12000,
        category: "Roofing",
      },
      {
        id: "maint-3",
        date: new Date("2023-06-10"),
        description: "HVAC system upgrade and maintenance",
        cost: 25000,
        category: "HVAC",
      },
    ],
    ownershipHistory: [
      {
        id: "own-1",
        owner: "James & Patricia Anderson",
        purchaseDate: new Date("2015-08-10"),
        saleDate: new Date("2024-04-30"),
        purchasePrice: 11200000,
        salePrice: 15500000,
        reason:
          "Relocating to London for business opportunity. Property has appreciated significantly.",
      },
    ],
    marketData: {
      neighborhoodVibe:
        "Exclusive oceanfront community with private beach access, world-class dining, high-end shopping on Lincoln Road",
      attractions: [
        "Miami Beach Boardwalk",
        "Art Deco Historic District",
        "South Pointe Park",
        "Lincoln Road Mall",
        "Miami Museum of Art",
      ],
      localPolicies: [
        "New short-term rental restrictions coming in 2024",
        "Property tax reassessment expected",
      ],
      zoningInfo: "Residential High-Rise Zone, 150ft height limit",
      economicOutlook:
        "Miami's economy growing 4.2% annually. Tourism at record levels. Tech and finance sectors expanding.",
      priceHistory: [
        { date: new Date("2023-01-01"), price: 11800000 },
        { date: new Date("2023-04-01"), price: 12300000 },
        { date: new Date("2023-07-01"), price: 12900000 },
        { date: new Date("2023-10-01"), price: 13500000 },
        { date: new Date("2024-01-01"), price: 14200000 },
        { date: new Date("2024-04-30"), price: 15500000 },
      ],
    },
    investmentAnalysis: {
      currentValue: 15500000,
      projectedValue5Year: 19440000,
      projectedValue10Year: 24320000,
      capRate: 3.5,
      roiProjection: 4.8,
      scenarios: [
        {
          name: "Conservative",
          downPayment: 5000000,
          loanTerm: 30,
          interestRate: 6.5,
          monthlyPayment: 63500,
          totalCost: 22860000,
          equity5Year: 8200000,
          marketValue5Year: 19440000,
        },
        {
          name: "Moderate",
          downPayment: 3875000,
          loanTerm: 20,
          interestRate: 6.5,
          monthlyPayment: 81200,
          totalCost: 22320000,
          equity5Year: 9800000,
          marketValue5Year: 19440000,
        },
      ],
    },
  },
  {
    id: "prop-2",
    title: "Modern Waterfront Penthouse - Brickell",
    address: "888 Brickell Avenue, Miami, FL 33131",
    price: 8750000,
    description:
      "Spectacular penthouse with wraparound terraces and panoramic views. 4 bedrooms, 4.5 bathrooms.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      "https://images.unsplash.com/photo-1559080241-7a37deadfa19?w=1200",
    ],
    agentId: "agent-1",
    createdAt: new Date("2024-02-20"),
    bedroom: 4,
    bathroom: 4.5,
    squareFeet: 6200,
    yearBuilt: 2018,
    lot: 0.0,
    documents: [],
    maintenanceHistory: [],
    ownershipHistory: [],
    marketData: {
      neighborhoodVibe:
        "Contemporary urban living with world-class amenities, fine dining, and financial district proximity",
      attractions: [
        "Brickell City Centre",
        "Brickell Park",
        "Miami Riverwalk",
        "Wynwood Walls",
      ],
      localPolicies: ["Urban development zone", "Tax incentives available"],
      zoningInfo: "Residential Multi-Use Zone",
      economicOutlook:
        "Strong rental demand. Brickell seeing 8-10% annual appreciation.",
      priceHistory: [
        { date: new Date("2023-01-01"), price: 7800000 },
        { date: new Date("2024-01-01"), price: 8500000 },
        { date: new Date("2024-02-20"), price: 8750000 },
      ],
    },
    investmentAnalysis: {
      currentValue: 8750000,
      projectedValue5Year: 10937500,
      projectedValue10Year: 13671875,
      capRate: 4.2,
      roiProjection: 5.1,
      scenarios: [
        {
          name: "Conservative",
          downPayment: 2625000,
          loanTerm: 30,
          interestRate: 6.5,
          monthlyPayment: 37750,
          totalCost: 13605000,
          equity5Year: 4500000,
          marketValue5Year: 10937500,
        },
        {
          name: "Aggressive",
          downPayment: 1312500,
          loanTerm: 20,
          interestRate: 6.5,
          monthlyPayment: 46280,
          totalCost: 12396000,
          equity5Year: 3500000,
          marketValue5Year: 10937500,
        },
      ],
    },
  },
  {
    id: "prop-3",
    title: "Contemporary Hilltop Estate - Beverly Hills",
    address: "1247 Mulholland Drive, Los Angeles, CA 90046",
    price: 22000000,
    description:
      "Architectural masterpiece with smart home integration and resort-style amenities. 7 bedrooms, 9 bathrooms.",
    images: [
      "https://images.unsplash.com/photo-1600047915290-1bc07cecedfa?w=1200",
      "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=1200",
      "https://images.unsplash.com/photo-1611208626889-7d4d4a1f85cf?w=1200",
    ],
    agentId: "agent-2",
    createdAt: new Date("2024-03-15"),
    bedroom: 7,
    bathroom: 9,
    squareFeet: 12000,
    yearBuilt: 2019,
    lot: 3.0,
    documents: [],
    maintenanceHistory: [],
    ownershipHistory: [],
    marketData: {
      neighborhoodVibe:
        "Exclusive hillside community with celebrity residents, privacy gates, and stunning canyon views",
      attractions: [
        "Beverly Hills Hotel",
        "Rodeo Drive",
        "Greystone Mansion",
        "Hollywood Sign",
      ],
      localPolicies: [
        "Strict building codes",
        "Earthquake retrofitting recommended",
      ],
      zoningInfo: "Hillside Residential Zone, Standard Lot",
      economicOutlook:
        "Beverly Hills maintaining premium pricing. 3-5% annual appreciation expected.",
      priceHistory: [
        { date: new Date("2023-01-01"), price: 20000000 },
        { date: new Date("2024-01-01"), price: 21500000 },
        { date: new Date("2024-03-15"), price: 22000000 },
      ],
    },
    investmentAnalysis: {
      currentValue: 22000000,
      projectedValue5Year: 25300000,
      projectedValue10Year: 29095000,
      capRate: 2.8,
      roiProjection: 3.2,
      scenarios: [
        {
          name: "Conservative",
          downPayment: 6600000,
          loanTerm: 30,
          interestRate: 6.5,
          monthlyPayment: 95200,
          totalCost: 34280000,
          equity5Year: 10500000,
          marketValue5Year: 25300000,
        },
      ],
    },
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
