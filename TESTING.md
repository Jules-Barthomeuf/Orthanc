# Testing & Development Guide

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test -- --coverage
```

## Test Structure

Tests are located in `__tests__/` directory:

- **components.test.ts** - Component type validation and import verification
- **db.test.ts** - Database layer and mock data integrity tests

## Development Setup

### Prerequisites
- Node.js 18+ (recommended Node.js 20)
- npm 9+

### Installation

```bash
npm install
```

### Running Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Project Structure

```
/app              - Next.js App Router pages and API routes
  /api           - API endpoints (auth, properties)
  /agent         - Agent-specific pages (dashboard, profile, properties)
  /client        - Client-specific pages (properties vault)
  /login, /signup - Authentication pages

/components       - React components
  /agent         - Agent dashboard components
  /client        - Client vault and panel components
  /auth          - Authentication components
  /common        - Shared components (Navbar, Footer)

/lib              - Utility libraries
  db.ts          - Mock database and query functions
  store.ts       - Zustand authentication store
  auth.ts        - Authentication utilities

/styles           - Global styles and Tailwind config
/types            - TypeScript type definitions

/__tests__        - Jest test files
```

## Build & Deployment

### Production Build

```bash
npm run build
npm start
```

### CI/CD

GitHub Actions workflow runs automatically on:
- Push to `main` branch
- Pull Requests to `main` branch

The workflow:
1. Installs dependencies (`npm ci`)
2. Runs build (`npm run build`)
3. Runs linter (`npm run lint`)

## Features Implemented

✅ **Authentication**
- Mock login/signup with role-based access
- Agent and Client user types
- Zustand state management

✅ **Agent Dashboard**
- Property listing and management
- AI chatbot property upload modal
- Profile management

✅ **Client Vault**
- Property browsing and viewing
- Four truth pillars:
  - Provenance & Legal (ownership history)
  - Technical & Structural (documents, maintenance)
  - Market Insight (pricing, trends, attractions)
  - Investment & Tax (scenarios, projections)

✅ **API Endpoints**
- `/api/auth` - Authentication (mock)
- `/api/properties` - Property CRUD operations

✅ **Styling**
- Luxury dark theme with gold accents
- Responsive design with Tailwind CSS
- Smooth animations and transitions

## Next Steps for Development

1. **Database Integration**
   - Replace mock data with real database
   - Implement user authentication with JWT

2. **Additional Features**
   - File upload for documents
   - Real-time notifications
   - User messaging system

3. **Blockchain Integration**
   - Implement ownership record verification
   - Smart contract integration for transfers

4. **AI Integration**
   - Connect to Claude or GPT API
   - Document analysis using AI

## Troubleshooting

### Build Errors
Ensure all TypeScript types are correct:
```bash
npx tsc --noEmit
```

### Development Server Issues
Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

### Test Failures
Update snapshots if needed:
```bash
npm test -- -u
```
