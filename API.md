# ORTHANC - API Documentation & Integration Guide

## Current Architecture

The application currently uses an in-memory database with mock data for demonstration purposes. All data resets when the server restarts.

### Data Models

#### User
```typescript
{
  id: string;
  email: string;
  role: "agent" | "client";
  createdAt: Date;
}
```

#### Agent
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  bio: string;
  marketKnowledge: string;
  properties: string[]; // Array of property IDs
  createdAt: Date;
}
```

#### Property
```typescript
{
  id: string;
  title: string;
  address: string;
  price: number;
  description: string;
  images: string[];
  agentId: string;
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
  createdAt: Date;
}
```

## Authentication

### Current Implementation
- JWT-based authentication with mock tokens
- Tokens stored in browser state (Zustand)
- JWT secret: configurable via environment variables

### Future Production Implementation

```typescript
// API endpoint: POST /api/auth/login
{
  email: string;
  password: string;
  role: "agent" | "client";
}

// Response
{
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  expiresIn: number;
}
```

## API Endpoints (When Implemented)

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Properties

```
GET    /api/properties                # Get all properties
GET    /api/properties/:id            # Get specific property
POST   /api/properties                # Create new property
PUT    /api/properties/:id            # Update property
DELETE /api/properties/:id            # Delete property
GET    /api/properties/agent/:agentId # Get agent's properties
```

### Agents

```
GET    /api/agents/:id                # Get agent profile
PUT    /api/agents/:id                # Update agent profile
POST   /api/agents/:id/knowledge      # Add market knowledge
GET    /api/agents/:id/properties     # Get agent's properties
```

### Documents

```
POST   /api/properties/:id/documents  # Upload document
GET    /api/properties/:id/documents  # Get property documents
DELETE /api/documents/:id             # Delete document
POST   /api/documents/:id/analyze     # AI document analysis
```

### Market Data

```
GET    /api/market/:area              # Get market data
GET    /api/neighborhoods/:id         # Get neighborhood data
GET    /api/predictions/:propertyId   # Get predictions
```

## Data Integration Points

### 1. PropStream Integration

PropStream provides comprehensive real estate data:

```typescript
// Future implementation
import { PropStreamAPI } from '@/lib/services/propstream';

const propstream = new PropStreamAPI(apiKey);

// Get property data
const property = await propstream.getProperty({
  address: '123 Main St',
  city: 'Miami',
  state: 'FL',
  zip: '33139'
});

// Returns comprehensive property data including:
// - Property characteristics
// - Tax information
// - Owner information
// - Property history
// - Assessed value
// - Deed information
```

### 2. MLS (Multiple Listing Service)

For real estate listing data:

```typescript
import { MLSClient } from '@/lib/services/mls';

const mls = new MLSClient(credentials);

// Get listing
const listing = await mls.getProperty(mlsNumber);

// Get market statistics
const stats = await mls.getMarketStats(zipCode);
```

### 3. Blockchain Integration (Future)

For immutable ownership records:

```typescript
import { BlockchainService } from '@/lib/services/blockchain';

const blockchain = new BlockchainService();

// Register property history
const hash = await blockchain.registerProperty({
  propertyId: 'prop-1',
  ownershipHistory: [...],
  documentHash: '0x...',
});

// Verify property
const isValid = await blockchain.verify(hash);
```

### 4. Economic Data & Predictions

Integrate with prediction markets and economic data:

```typescript
import { EconomicForecast } from '@/lib/services/forecasts';

const forecast = new EconomicForecast();

// Get economic predictions
const marketForecast = await forecast.getMarketTrends({
  region: 'Miami Beach',
  timeframe: '5-years'
});

// Get policy predictions
const policyPredictions = await forecast.getPolicyPredictions({
  zip: '33139',
  categories: ['zoning', 'taxes', 'development']
});
```

### 5. Mapping & Location Data

```typescript
import { MapService } from '@/lib/services/maps';

const maps = new MapService(googleMapsApiKey);

// Get neighborhood data
const neighborhood = await maps.getNeighborhoodInfo({
  address: '4521 Ocean Drive, Miami Beach, FL 33139'
});

// Get attractions nearby
const attractions = await maps.getNearbyAttractions({
  lat: 25.789,
  lng: -80.128,
  radius: 5 // miles
});
```

## Document Processing with AI

### Current Implementation
Mock analysis of documents with predefined insights

### Future Implementation

```typescript
import { DocumentAnalyzer } from '@/lib/services/ai-analyzer';

const analyzer = new DocumentAnalyzer();

// Analyze property documents
const analysis = await analyzer.analyzeDocument({
  documentType: 'inspection-report',
  fileUrl: 's3://bucket/file.pdf'
});

// Returns:
{
  summary: string;
  keyIssues: [];
  recommendations: [];
  estimatedRepairCosts: number;
  criticalItems: [];
}
```

## Interactive Simulators

### Investment Scenario Calculator

Current mock data includes scenarios. Future implementation:

```typescript
function calculateScenario({
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  propertyValue: number;
  appreciationRate: number;
  propertyTaxRate: number;
  rentalIncome?: number;
}): InvestmentScenario {
  // Calculate monthly payment
  // Calculate equity growth
  // Project future value
  // Calculate ROI
  // Analyze tax implications
}
```

## Real Estate Market Data Structure

```typescript
interface MarketData {
  // Current market metrics
  medianPrice: number;
  pricePerSqft: number;
  priceHistory: { date: Date; price: number }[];
  
  // Inventory
  daysOnMarket: number;
  activeListing count: number;
  soldProperties: number;
  
  // Neighborhood
  walkScore: number;
  schoolRating: number;
  crimeRate: number;
  population: number;
  
  // Economic indicators
  jobGrowth: number;
  incomeLevel: number;
  unemployment: number;
  
  // Zoning & Development
  zoningType: string;
  developmentPlans: string[];
  upcomingProjects: string[];
}
```

## Authentication & Authorization

### Role-Based Access Control

```typescript
// Types
type UserRole = "agent" | "client" | "admin";

// Permissions
const permissions = {
  agent: {
    uploadProperty: true,
    viewOwnProperties: true,
    viewAllProperties: true,
    editProfile: true,
    accessClientData: false,
  },
  client: {
    uploadProperty: false,
    viewOwnProperties: false,
    viewAllProperties: true,
    editProfile: true,
    accessClientData: true,
  },
  admin: {
    uploadProperty: true,
    viewOwnProperties: true,
    viewAllProperties: true,
    editProfile: true,
    accessClientData: true,
    manage Users: true,
  },
};
```

## Rate Limiting & Throttling

```typescript
// Example for API protection
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit login attempts
});
```

## Caching Strategy

```typescript
// Cache property data
const propertyCache = {
  ttl: 3600, // 1 hour
  key: `property:${id}`,
};

// Cache market data
const marketCache = {
  ttl: 86400, // 24 hours
  key: `market:${region}`,
};
```

## Error Handling

```typescript
interface APIError {
  code: string;
  message: string;
  status: number;
  details?: any;
}

// Example errors
const errors = {
  PROPERTY_NOT_FOUND: {
    code: 'PROP_001',
    status: 404,
    message: 'Property not found',
  },
  UNAUTHORIZED: {
    code: 'AUTH_001',
    status: 401,
    message: 'Unauthorized access',
  },
  INVALID_INPUT: {
    code: 'VAL_001',
    status: 400,
    message: 'Invalid input data',
  },
};
```

## Webhook Integration

For real-time updates:

```typescript
// When property is updated
POST /webhooks/property-updated
{
  propertyId: string;
  changes: {};
  timestamp: Date;
}

// When market conditions change
POST /webhooks/market-updated
{
  region: string;
  metrics: {};
  timestamp: Date;
}
```

## File Upload & Storage

### Current Implementation
Uses Unsplash URLs for demo images

### Future Implementation

```typescript
import { S3Service } from '@/lib/services/s3';

const s3 = new S3Service();

// Upload document
const file = await s3.upload({
  bucket: 'orthanc-documents',
  file: File,
  folder: `properties/${propertyId}`,
});

// Get secure URL
const url = await s3.getSecureUrl(file.key, { expiry: 3600 });
```

## Testing

### Example API Test

```typescript
import { test } from '@jest/globals';

test('GET /api/properties/:id', async () => {
  const response = await fetch('/api/properties/prop-1');
  expect(response.status).toBe(200);
  expect(response.data.id).toBe('prop-1');
});
```

## Rate Limits

Recommended rate limits for production:

- Public routes: 100 req/hour
- Authenticated routes: 1000 req/hour
- Login endpoint: 5 attempts/15 minutes
- Upload endpoint: 10 req/minute

## Version Management

Future API versioning:

```
/api/v1/properties
/api/v2/properties
```

---

For implementation details, see [DEPLOYMENT.md](./DEPLOYMENT.md)
