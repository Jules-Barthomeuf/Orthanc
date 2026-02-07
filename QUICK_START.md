# ORTHANC - Quick Start Guide

Get up and running with ORTHANC in 5 minutes!

---

## Prerequisites

- **Node.js** 18 or higher ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- A web browser (Chrome, Firefox, Safari, or Edge)

---

## Installation

### Step 1: Install Dependencies

```bash
cd /workspaces/Orthanc
npm install
```

This will install all required packages including Next.js, React, TailwindCSS, and Recharts.

### Step 2: Start Development Server

```bash
npm run dev
```

You'll see output like:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
```

### Step 3: Open in Browser

Navigate to: **http://localhost:3000**

---

## First Time Using ORTHANC?

### Explore the Platform

#### 1. Home Page
- View the marketing landing page
- See the Four Truth Pillars concept
- Review platform features

#### 2. Sign Up / Login

Choose a role and create an account:

**As an Agent:**
```
Email: michael.johnson@orthanc.com
Password: (any password - it's mock auth)
```

**As a Client:**
```
Email: john.doe@example.com
Password: (any password - it's mock auth)
```

Or create your own account!

---

## Agent Portal Walkthrough

### Dashboard
1. Go to **Agent Dashboard** after signing in
2. See your uploaded properties
3. View property details and stats
4. Click **Edit & Share** to manage

### Your Properties
- **Oceanfront Villa** - Miami Beach ($15.5M)
- **Waterfront Penthouse** - Brickell ($8.75M)

### Upload New Property
1. Click **"+ Upload Property"** button
2. See the AI chatbot interface (demo)
3. Enter property details
4. Generate secure client link

---

## Client Portal Walkthrough

### Step 1: Browse Properties
1. Sign in as a client
2. Go to **Properties** page
3. See all available luxury properties
4. Browse cards with images and prices

### Step 2: Open a Property Vault

Click **"View Vault"** on any property to access the Four Truth Pillars:

#### Pillar 1: Provenance & Legal ⚖️
- See blockchain hash of ownership
- Review full ownership history
- Understand why previous owners sold
- Verify authenticity

#### Pillar 2: Technical & Structural 🏗️
- Download property documents
- Read AI-powered analysis
- Check maintenance history
- Chat with AI analyst about property questions

#### Pillar 3: Market Insight 📊
- View 6-month price history chart
- Learn about neighborhood vibe
- Explore local attractions
- Understand zoning and policies
- See economic outlook

#### Pillar 4: Investment & Tax Optimization 💰

This is the most interactive section!

**Try the Investment Simulator:**

1. **Choose a Plan**
   - Click "Conservative Plan", "Moderate Plan", or "Aggressive Plan"
   - See different down payment options

2. **Adjust Down Payment**
   - Use the slider (10%-50%)
   - Watch calculations update in real-time
   - See monthly payment change
   - Track annual costs

3. **View Results**
   - Monthly Payment: How much you pay per month
   - Annual Cost: Total yearly expense
   - Loan Amount: How much you're borrowing
   - Interest Rate: Annual interest percentage

4. **Analyze Growth**
   - View equity vs debt over time (chart)
   - See 5-year and 10-year projections
   - Check future market value
   - Review CAP rate and ROI

5. **Economic Scenarios**
   - See impact of interest rate increases
   - Check property tax changes
   - Analyze market appreciation effects

---

## Demo Properties & Features

### Property 1: Oceanfront Villa - Miami Beach
- **Price**: $15.5M
- **Beds/Baths**: 6 bed / 7.5 bath
- **Features**: 
  - 2 mock documents (blueprints, inspection report)
  - 3 maintenance records
  - Complete ownership history
  - Investment analysis with growth projections

### Property 2: Waterfront Penthouse - Brickell
- **Price**: $8.75M
- **Beds/Baths**: 4 bed / 4.5 bath
- **Features**:
  - Urban luxury location
  - Strong rental potential
  - Investment scenarios included

### Property 3: Hilltop Estate - Beverly Hills
- **Price**: $22M
- **Beds/Baths**: 7 bed / 9 bath
- **Features**:
  - Celebrity neighborhood
  - Premium location
  - Architectural significance

---

## Key Features to Explore

### ✨ Interactive Investment Simulator

The **most powerful feature** of ORTHANC!

- Drag the down payment slider and watch calculations update instantly
- Compare different financing scenarios
- See equity growth over time with charts
- Understand economic policy impacts

### 💬 AI Assistant (Demo)

In the Technical & Structural panel:
- Type questions about the property
- Get insights about potential issues
- Ask about maintenance and repairs

### 📊 Data Visualization

- **Price History Chart**: See 6-month price trends
- **Equity Growth Chart**: View debt/equity split over years
- **Scenario Comparison**: Compare different investment plans

### 🔐 Security Features

All client vaults are accessed via secure links from their agent.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Search properties (coming soon) |
| `Esc` | Close modals/dialogs |
| `Ctrl+K` | Quick navigation (coming soon) |

---

## Tips & Tricks

### 1. Test Agent Features
- Sign in as Michael Johnson or Sarah Williams
- See their properties and market knowledge
- Understand agent capabilities

### 2. Test Client Features
- Sign in as John Doe
- Access all properties (even those not assigned to you)
- Use investment simulator
- Review all four pillars

### 3. Check Out the Scenarios
- Each property has pre-built investment scenarios
- Conservative plans (safe, lower risk)
- Moderate plans (balanced approach)
- Aggressive plans (higher returns, higher leverage)

### 4. Review Documentation
- While app is running, browse the docs:
  - [README.md](./README.md) - Overview
  - [ARCHITECTURE.md](./ARCHITECTURE.md) - How it works
  - [API.md](./API.md) - Future integrations

---

## Troubleshooting

### "Cannot GET http://localhost:3000"
- Make sure you ran `npm run dev`
- Check that the server is still running
- Try a different port: `npm run dev -- -p 3001`

### "Module not found" errors
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`

### Styling looks broken
- Make sure TailwindCSS is installed: `npm list tailwindcss`
- Rebuild: `npm run dev`

### Investment simulator not working
- Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear browser cache

### Need help?
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development info
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- See [API.md](./API.md) for future enhancements

---

## What's Next?

### For Exploration
1. ✅ Explore all four truth pillars
2. ✅ Test the investment simulator
3. ✅ Compare multiple properties
4. ✅ Review documentations

### For Deployment
1. Build: `npm run build`
2. Start: `npm start`
3. Deploy to [Vercel](https://vercel.com) (1-click deploy)

### For Development
1. Review [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Start building phase 2 features!

---

## Common Questions

**Q: Are the prices real?**
A: No, these are demo properties with realistic content for demonstration.

**Q: Can I create my own properties?**
A: In this version, properties are pre-loaded. Phase 2 will include full property management.

**Q: Is the authentication real?**
A: No, any password works. This is for demo purposes. Real authentication will be added in production.

**Q: Will my changes be saved?**
A: No, data is stored in memory and resets when the server restarts. This will change with database integration.

**Q: Can I deploy this myself?**
A: Yes! See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions.

**Q: What about real property data?**
A: Phase 2 will integrate PropStream API and MLS databases for real data.

---

## Demo Walthrough Script

### 5-Minute Demo
1. Open home page (30 sec)
2. Sign up as client (1 min)
3. Browse properties (1 min)
4. Open a property vault and explore pillars (1.5 min)
5. Use investment simulator (1 min)

### 15-Minute Deep Dive
1. Tour home page (2 min)
2. Sign up and explore agent features (3 min)
3. Test client property discovery (2 min)
4. Deep dive into one property vault (5 min)
5. Explore investment simulator thoroughly (3 min)

---

## Important Ports & URLs

| Service | URL | Port |
|---------|-----|------|
| Development | http://localhost:3000 | 3000 |
| API (when added) | http://localhost:3000/api | 3000 |
| Database (when added) | Depends on DB | - |

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | 18.0.0 | 20.0.0+ |
| npm | 9.0.0 | 10.0.0+ |
| RAM | 512MB | 2GB |
| Disk Space | 500MB | 1GB |
| Internet | Yes | Yes |

---

## Support & Resources

- **Project Docs**: `/README.md`
- **Architecture Guide**: `/ARCHITECTURE.md`
- **Deployment Help**: `/DEPLOYMENT.md`
- **API Reference**: `/API.md`
- **Contributing Guide**: `/CONTRIBUTING.md`
- **Changelog**: `/CHANGELOG.md`

---

## Ready to Go!

You now have everything you need to:
- ✅ Explore ORTHANC's features
- ✅ Understand the architecture
- ✅ Prepare for deployment
- ✅ Plan phase 2 development

**Happy exploring!** 🎉

---

**Questions?** Check the documentation files or review the codebase comments.

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md)

**Want to contribute?** See [CONTRIBUTING.md](./CONTRIBUTING.md)
