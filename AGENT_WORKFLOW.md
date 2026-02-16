# ORTHANC Sovereign Vault — Agent-First Architecture

## 🏗️ System Overview

ORTHANC is a prestige digital vault system designed exclusively for real estate agents to manage ultra-luxury properties. The platform bridges the gap between agent expertise and high-net-worth client expectations through AI-powered ingestion, immutable record-keeping, and sophisticated analytics.

---

## 🎯 Core Workflow: The 4-Step Agent Journey

### 1. **The Entrance (Authentication & Intent)**

```
Landing Page → Sign In/Sign Up → Agent Dashboard
```

- **Minimal, secure landing page** signals "Sovereign Asset" handling
- Agents are authenticated with role-based access control
- Upon entry: Dashboard showcases property portfolio + AI chat interface
- **Security Focus**: Every interaction is logged and auditable

### 2. **The Ingestion (60-Second Property Upload)**

```
AI Chat Prompt → Real-time Entity Creation → Truth Pillars Auto-Populated
```

#### Workflow:
1. Agent describes property in chat: *"$15M off-market, Star Island, owner wants quiet sale"*
2. AI instantly processes the prompt via `/api/ai`
3. System creates `Property Entity` with:
   - Basic metadata (title, address, price, bedrooms, baths, sqft)
   - Auto-populated **Truth Pillars** (mock PropStream integration):
     - ⚖️ **Provenance & Legal**: Generated ownership history, mock deeds
     - 🏗️ **Technical & Structural**: Auto-fetched inspection docs, maintenance records
     - 📊 **Market Insight**: Neighborhood data, attractions, zoning, economic outlook
     - 💰 **Investment & Tax**: Scenario calculations, ROI projections, CAP rate

#### Document Support:
- Agent can drag-and-drop PDFs into the chat
- `/api/upload` endpoint auto-categorizes documents by keyword:
  - `deed` → Provenance
  - `inspection`, `report` → Technical
  - `permit` → Legal
- Documents are merged with AI-generated data during creation

#### Implementation:
- **Endpoint**: `POST /api/ai` — Generates property stub with enriched Truth Pillars
- **Endpoint**: `POST /api/upload` — Categorizes uploaded documents
- **UI**: Chat-based form in `AgentDashboard.tsx` with file upload support
- **Toast Notifications**: Real-time feedback on success/error

---

### 3. **The Management (The "God View")**

```
Properties List → Select Property → Toggle Editor/Client View
```

#### Editor View (Agent Perspective):
- Full property details: descriptions, bedrooms, pricing
- Edit all Truth Pillars:
  - Override AI data with manual corrections ("fix the zoning info")
  - Add "Agent Knowledge": local secrets, market hunches, unique selling angles
  - Update investment simulators (down payment, loan term, interest rate)
- **Seal & Anchor Button**:
  - Calls `/api/seal` to generate immutable blockchain-style hash
  - Hash appended to ownership record as proof of authenticity
  - Hash displayed to agent (with one-click copy)

#### Client View (Read-Only Gallery):
- Agent sees **exactly** what the client experiences
- All four Truth Pillars rendered in interactive panels
- Full property vault with images, charts, analyses
- No editing capabilities
- Button to return to Editor View

#### Implementation:
- **Route**: `/agent/properties/[id]` with view-mode toggle
- **Toggle Button**: "Edit Property" ↔ "View as Client"
- **Seal Endpoint**: `POST /api/seal` — Generates mock blockchain hash
- **Client Route**: `/client/vault/[id]` — Public, view-only property vault
  - Accessible via unique shareable link
  - No authentication required (agent distributes the link)

---

### 4. **The Distribution (The "Link Monopoly")**

```
Share Unique Vault Link → Client Reviews Property → Agent Gains Intelligence
```

#### Strategic Sharing:
**Before Visit**: Link shared to build anticipation, de-risk legal concerns
- Client explores docs, ownership history, market analysis pre-visit
- Client simulates investment scenarios offline
- Increases confidence and deal probability

**After Visit (Closing Support)**: Link provides final "Truth" seal
- Client confirms data accuracy ("yes, the deed matches our research")
- AI Analyst available for real-time Q&A
- Investment simulators locked in with final numbers

#### Client Insights (Future):
- Agent sees which Truth Pillars client interacted with
- "Client spent 5 min on Provenance, 12 min on Investment scenarios"
- Intelligence feeds back into agent workflow

---

## 📁 File Structure

```
/app
  /page.tsx                      ← Minimal landing page
  /api
    /ai/route.ts                 ← AI ingestion (generates enriched property)
    /upload/route.ts             ← Document categorization
    /seal/route.ts               ← Blockchain-style anchoring
    /properties/route.ts         ← Property CRUD
    /auth/route.ts               ← Agent authentication
  /agent
    /dashboard/page.tsx          ← AI chat + properties list
    /properties/[id]/page.tsx    ← Editor/Client view toggle, seal button
    /profile/page.tsx            ← Agent expertise & credentials
  /client
    /vault/[id]/page.tsx         ← Public read-only property vault (4 pillars)

/components
  /agent/AgentDashboard.tsx      ← Chat-first property ingestion UI
  /client/PropertyVault.tsx      ← 4 Truth Pillars renderer (tabbed)
  /client/ProvenancePanel.tsx    ← Ownership history + blockchain seal display
  /client/TechnicalPanel.tsx     ← Docs + maintenance + AI analyst
  /client/MarketInsightPanel.tsx ← Charts, attractions, policies, economics
  /client/InvestmentPanel.tsx    ← Scenarios, projections, simulators
  /auth/AuthForm.tsx             ← Login/Signup (agent-only)
  /common/Navbar.tsx             ← Navigation (portfolio, profile, logout)
  /common/ToastContainer.tsx     ← Toast notification display
  /common/Footer.tsx             ← Footer

/lib
  /db.ts                         ← Mock database (mock properties, agents, users)
  /store.ts                      ← Zustand auth state (login/logout)
  /toast.ts                      ← Toast notification store
  /auth.ts                       ← Auth utilities

/styles
  tailwind.config.ts             ← Luxury dark theme with gold accents
  globals.css                    ← Global styles + animations
  
/types
  /index.ts                      ← TypeScript interfaces (Property, User, etc.)
```

---

## 🔌 API Endpoints

### Authentication
```http
POST /api/auth
Body: { action: "login|signup", email, password, role: "agent" }
Response: { user, token }
```

### AI Ingestion
```http
POST /api/ai
Body: { prompt: string, agentId: string }
Response: {
  id, title, address, price, description, images,
  agentId, bedroom, bathroom, squareFeet, yearBuilt,
  documents: [],
  maintenanceHistory: [],
  ownershipHistory: [{ owner, purchaseDate, saleDate, purchasePrice, salePrice, reason }],
  marketData: { neighborhoodVibe, attractions[], localPolicies[], zoningInfo, economicOutlook, priceHistory[] },
  investmentAnalysis: { currentValue, projectedValue5Year/10Year, capRate, roiProjection, scenarios[] }
}
```

### Document Upload
```http
POST /api/upload
Body: { files: ["Deed - Property.pdf", "Inspection Report.pdf"] }
Response: { documents: [{ id, name, type, url, uploadedAt, analysis }] }
```

### Blockchain Seal
```http
POST /api/seal
Body: { propertyId: string }
Response: { ok: true, hash: "0x...", record: { ownership record } }
```

### Properties CRUD
```http
GET /api/properties
Response: Array of properties

POST /api/properties
Body: Property object
Response: Created property

PUT /api/properties/[id]
Body: Updated property fields
Response: Updated property

DELETE /api/properties/[id]
Response: 204 No Content
```

---

## 🎨 UI/UX Features

### Dashboard (Agent):
- **Chat-First Interface**: Primary interaction is text prompt
  - "/💬 AI Assistant Chat" panel always visible on right
  - File upload integrated into chat flow
  - "Send & Create" button instantly creates property from AI response

- **Property Grid**: 2-column grid of agent's properties
  - Image, title, address, price, specs
  - "Edit & Share" button per property

- **Responsive**: Adapts to tablet (1 col) and mobile (full-width chat)

### Property Editor:
- **View Toggle**: "Edit Property" ↔ "View as Client" button in top-right
- **Editor Mode**:
  - Full metadata form (editable)
  - 4 Truth Pillars editable
  - "Seal & Anchor" button → displays hash
  
- **Client Mode**:
  - Same layout as `/client/vault/[id]`
  - Read-only rendition of all pillars
  - Toggle back to Edit mode

### Truth Pillars (Client View):
- **Tabbed Interface** with 4 tabs:
  1. ⚖️ Provenance & Legal
  2. 🏗️ Technical & Structural
  3. 📊 Market Insight
  4. 💰 Investment & Tax

- **Provenance Panel**:
  - Blockchain hash display (sealed records)
  - Ownership history timeline
  - Price appreciation calculations

- **Technical Panel**:
  - Document list with expandable analysis
  - Maintenance history with costs
  - AI Analyst chat interface (mock)

- **Market Panel**:
  - Price history chart (recharts)
  - Neighborhood vibe, attractions, zoning
  - Local policies, economic outlook
  - Agent insights callout

- **Investment Panel**:
  - Scenario selector (Conservative/Moderate/Aggressive)
  - Interactive down-payment slider
  - Equity growth bar chart
  - Projections (5yr/10yr values)
  - Policy impact analysis (rate +1%, tax +10%, etc.)

---

## 🔐 Security & Authentication

- **Sign In Form** (agent-only role, hardcoded)
- **Zustand Auth Store** tracks current user
- **Protected Routes**: `/agent/*` redirect to `/login` if not authenticated
- **Public Routes**: `/client/vault/[id]` publicly accessible (no auth)
- **Mock JWT**: Simple token generation in auth endpoint

---

## 🧪 Testing

```bash
npm test           # Run Jest suite
npm test:watch     # Watch mode
```

Tests include:
- Component imports validation
- Database layer (mock data integrity)
- Type definitions verification

---

## 🚀 Development & Deployment

### Development Server
```bash
npm run dev        # http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### CI/CD
- GitHub Actions workflow (`.github/workflows/ci.yml`)
- Runs on push to `main` and PRs
- Steps: `npm ci` → `npm run build` → `npm run lint`

---

## 🎯 Key Differentiators

1. **Chat-First Ingestion**
   - Natural language → Property entity in 10 seconds
   - No forms, no tedious data entry

2. **Autonomous Truth Pillars**
   - Mock PropStream integration auto-fetches deeds, inspections, market data
   - Agent saves hours of research per listing

3. **Immutable Provenance**
   - Blockchain-style seal (hash) proves data authenticity
   - Appeals to high-net-worth clients' risk-aversion

4. **Dual Perspective**
   - Agent edits; client views pristine read-only vault
   - Agent controls narrative and data accuracy

5. **Strategic Link Distribution**
   - Share before/after visit
   - No email chains, no confusion
   - Client gets "God's truth" in one place

---

## 🔄 Future Enhancements

- [ ] Real database (PostgreSQL)
- [ ] Production auth (NextAuth.js with JWT)
- [ ] Real PropStream API integration
- [ ] File upload to cloud storage (S3)
- [ ] Actual blockchain anchoring (Ethereum/Arweave)
- [ ] Email invitations and sharing analytics
- [ ] Client engagement tracking (time spent, pages viewed)
- [ ] Collaborative editing (multiple agents per property)
- [ ] Real AI services (Claude, GPT-4V for doc analysis)
- [ ] Payment tier system (free vs. premium properties)

---

## 📞 Support & Docs

- [TESTING.md](./TESTING.md) — Setup and test guide
- [.env.example](./.env.example) — Environment template
- [API.md](./API.md) — Endpoint reference (if present)

---

**Built for agents who demand Sovereign Control over their luxury listings.**
