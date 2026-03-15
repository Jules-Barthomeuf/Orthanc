# ORTHANC - Luxury Real Estate Digital Vault

A premium digital platform for ultra-luxury real estate investment analysis and collaboration between agents and high-net-worth clients.

## Overview

Orthanc is a sophisticated two-sided platform that transforms how luxury real estate professionals and clients manage property investments. The platform provides agents with tools to showcase properties comprehensively while giving clients complete transparency and analysis tools.

### Key Features

#### 🏗️ For Agents
- **Fast Property Upload**: Upload properties in under 1 minute via AI chatbot
- **Market Knowledge Base**: Build and share your expertise about local markets
- **Secure Sharing**: Generate unique secure links for client access
- **Dashboard Analytics**: Monitor property performance and client engagement

#### 💎 For Clients
- **The Four Truth Pillars**: Comprehensive property analysis framework
  1. **Provenance & Legal**: Blockchain-verified ownership history
  2. **Technical & Structural**: Complete document access with AI analysis
  3. **Market Insight**: Local economic data and neighborhood analysis
  4. **Investment & Tax**: Interactive simulators and scenario planning

## The Four Truth Pillars

### 1. Provenance & Legal
- Immutable blockchain-hashed ownership history
- Complete ownership records with transaction details
- Analysis of why previous owners sold
- Verification of property authenticity

### 2. Technical & Structural
- Access to all property files (blueprints, permits, inspections)
- AI-powered document analysis highlighting key issues
- Complete maintenance and renovation history
- Dedicated AI analyst for property questions

### 3. Market Insight
- Political environment analysis and zoning changes
- Agent's local knowledge and economic perspective
- Neighborhood attractions and community vibe
- Real-time price history and market trends

### 4. Investment & Tax Optimization
- Interactive investment simulators
- Multiple financial scenarios (conservative, moderate, aggressive)
- Economic policy impact analysis
- 5-year and 10-year projections
- CAP rate and ROI calculations

## Technology Stack

- **Frontend**: Next.js 14 + React 18 with TypeScript
- **Styling**: TailwindCSS with custom premium dark theme
- **Charts**: Recharts for data visualization
- **State Management**: Zustand
- **Auth**: JWT tokens (upgradeable to NextAuth.js)
- **Database**: Supabase Postgres (persistent property store)
- **API**: Next.js API routes

## Project Structure

```
orthanc/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   ├── agent/
│   │   ├── dashboard/           # Agent dashboard page
│   │   └── properties/          # Agent property management
│   ├── client/
│   │   ├── properties/          # Client property listing
│   │   └── vault/[id]/          # Property vault detail page
│   ├── login/                   # Authentication
│   ├── signup/                  # Registration
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/
│   ├── common/                  # Shared components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── auth/                    # Authentication components
│   │   └── AuthForm.tsx
│   ├── agent/                   # Agent-only components
│   │   └── AgentDashboard.tsx
│   └── client/                  # Client-only components
│       ├── PropertyVault.tsx
│       ├── ProvenancePanel.tsx
│       ├── TechnicalPanel.tsx
│       ├── MarketInsightPanel.tsx
│       └── InvestmentPanel.tsx
├── lib/
│   ├── auth.ts                  # Authentication utilities
│   ├── db.ts                    # Mock database
│   └── store.ts                 # Zustand state management
├── types/
│   └── index.ts                 # TypeScript types and interfaces
└── styles/
    └── tailwind.config.ts       # TailwindCSS configuration
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables (already configured in .env.local)
# Review .env.local and update as needed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Supabase Configuration

1. Create a Supabase project (free tier is fine) and wait for the database to provision.
2. In the SQL editor, run:

```sql
create table if not exists public.properties (
  id text primary key,
  title text not null,
  address text not null,
  price bigint not null,
  description text,
  images jsonb default '[]'::jsonb,
  agent_id text,
  created_at timestamptz default now(),
  bedroom int,
  bathroom int,
  square_feet int,
  year_built int,
  lot numeric,
  documents jsonb default '[]'::jsonb,
  maintenance_history jsonb default '[]'::jsonb,
  ownership_history jsonb default '[]'::jsonb,
  market_data jsonb default '{}'::jsonb,
  investment_analysis jsonb default '{}'::jsonb,
  annual_opex numeric,
  liquidity_score numeric,
  risk_score numeric,
  cap_rate numeric,
  irr numeric,
  locked boolean default true
);
```

3. Copy the **Project URL**, **service_role** key, and (optionally) **anon** key from Settings → API.
4. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, and `SUPABASE_ANON_KEY` in `.env.local` (and in Render/Vercel env vars for production).
5. Seed data (optional) via `node scripts/migrate-properties-to-supabase.js` or by uploading `orthanc-backup.json` to `/api/properties/backup`.

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code (when eslint is configured)
npm run lint
```

## Demo Credentials

The platform includes mock data for testing:

### Agent Account
- **Email**: michael.johnson@orthanc.com OR sarah.williams@orthanc.com
- **Password**: Any password (mock authentication)
- **Role**: Agent

### Client Account
- **Email**: john.doe@example.com
- **Password**: Any password (mock authentication)
- **Role**: Client

## Mock Data

Property data now lives in Supabase, so entries survive restarts and redeploys. The repository still includes `data/properties.json` and `orthanc-backup.json` as seed files—import them via `POST /api/properties/backup` or by running `node scripts/migrate-properties-to-supabase.js` to pre-fill your Supabase project with sample luxury listings (Miami Beach villa, Brickell penthouse, Beverly Hills estate, etc.).

## Design Philosophy

### Dark & Gold Luxury Theme
- **Primary Background**: Deep black (#0f0f0f)
- **Secondary Background**: Dark gray (#1a1a1a)
- **Accent Color**: Gold (#d4a855)
- **Text**: Off-white (#f5f5f5)

The design emphasizes exclusivity, sophistication, and premium positioning through:
- Minimal, clean interfaces
- Strategic use of gold accents
- High-quality typography
- Spacious layouts suggesting exclusivity
- Dark theme reducing eye strain (luxury consideration)

## Future Enhancements

### Phase 2 - Real Data Integration
- Connect to PropStream API for real property data
- Integrate with MLS databases
- Real blockchain implementation for ownership verification
- Prediction market integration for economic forecasts

### Phase 3 - Advanced Features
- Video property tours with AI guide
- 3D property walkthroughs
- Neighborhood AR experience
- Advanced tax planning integration
- Client CRM and deal tracking

### Phase 4 - Scaling
- Multi-language support
- International property support
- Team collaboration features
- White-label options for agencies

## API Endpoints (Future)

Currently the app uses mock data. Future API structure:

```
GET    /api/auth/login              # Login endpoint
POST   /api/auth/signup             # Register endpoint
GET    /api/properties              # List all properties
GET    /api/properties/:id          # Get property details
POST   /api/properties              # Create property
GET    /api/agents/:id              # Get agent profile
PUT    /api/agents/:id              # Update agent profile
```

## Security Notes

- Current implementation uses mock JWT for demo purposes
- In production: Update JWT_SECRET in .env
- In production: Implement proper password hashing and validation
- In production: Add HTTPS enforcement
- In production: Implement rate limiting and input validation

## Performance Considerations

- Images are optimized via Unsplash CDN (demo)
- Use Next.js Image component for production images
- Implement caching strategies for property data
- Consider CDN for static assets
- Database queries should be optimized with proper indexing

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## License

Proprietary - All rights reserved

## Contact

For inquiries about ORTHANC:
- Email: hello@orthanc.com
- Website: orthanc.com

---

**Built with precision for the ultra-luxury real estate market.**