# ORTHANC - Architecture & Development Guide

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│            (Next.js 14 + React 18 + TypeScript)            │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌────────┐   ┌─────────┐   ┌──────────┐
    │ Pages  │   │Component│   │  Styles  │
    │        │   │         │   │          │
    │ Home   │   │ Navbar  │   │Tailwind  │
    │ Login  │   │ Footer  │   │CSS       │
    │ Agent  │   │ Forms   │   └──────────┘
    │ Client │   │ Panels  │
    └────────┘   └─────────┘

        ┌──────────────┬──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌────────┐   ┌──────────┐   ┌──────────┐
    │  State │   │ Services │   │   Types  │
    │        │   │          │   │          │
    │Zustand │   │Auth      │   │Interface │
    │Store   │   │DB        │   │Entities  │
    └────────┘   │Utils     │   └──────────┘
                 └──────────┘
```

### Component Hierarchy

```
App (Layout)
├── Navbar (Global)
├── Routes
│   ├── / (Home)
│   ├── /login (AuthForm)
│   ├── /signup (AuthForm)
│   ├── /agent/dashboard
│   │   └── AgentDashboard
│   │       └── PropertyCard[]
│   ├── /agent/properties/:id
│   │   └── PropertyEditor
│   ├── /client/properties
│   │   └── PropertyGrid
│   └── /client/vault/:id
│       └── PropertyVault
│           ├── ProvenancePanel
│           ├── TechnicalPanel
│           ├── MarketInsightPanel
│           └── InvestmentPanel
└── Footer (Global)
```

## Data Flow

### Authentication Flow

```
User Input
    │
    ▼
[AuthForm Component]
    │
    ├─ Validates input
    │
    ▼
[useAuthStore.login()]
    │
    ├─ Stores user data
    ├─ Generates JWT token
    │
    ▼
[Redirect to Dashboard]
    │
    ├─ useEffect checks user role
    │
    ▼
[Protected Route Component]
```

### Property Data Flow

```
Database (Mock)
    │
    ▼
[lib/db.ts - Data Layer]
    │
    ├─ findPropertyById()
    ├─ findPropertiesByAgentId()
    │
    ▼
[Components]
    │
    ├─ PropertyVault
    ├─ AgentDashboard
    │
    ▼
[UI Rendering]
```

## State Management

### Zustand Store

```typescript
useAuthStore
├── user: User | null
├── agent: Agent | null
├── client: Client | null
├── token: string | null
├── login(email, password, role)
└── logout()
```

### Local Component State

```typescript
// PropertyVault
├── activePillar: string (state)
└── setActivePillar(pillar)

// InvestmentPanel
├── downPayment: number (state)
├── selectedScenario: number (state)
├── setDownPayment(amount)
└── setSelectedScenario(index)

// AuthForm
├── email: string (state)
├── password: string (state)
├── role: "agent" | "client" (state)
├── error: string (state)
└── loading: boolean (state)
```

## File Organization

### By Feature (Current Structure)

```
components/
├── common/          # Shared components
│   ├── Navbar.tsx
│   └── Footer.tsx
├── auth/            # Authentication
│   └── AuthForm.tsx
├── agent/           # Agent features
│   └── AgentDashboard.tsx
└── client/          # Client features
    ├── PropertyVault.tsx
    ├── ProvenancePanel.tsx
    ├── TechnicalPanel.tsx
    ├── MarketInsightPanel.tsx
    └── InvestmentPanel.tsx

lib/
├── auth.ts          # JWT utilities
├── db.ts            # Data layer
└── store.ts         # State management

types/
└── index.ts         # TypeScript definitions

app/
├── (routes)
├── globals.css      # Global styles
├── layout.tsx       # Root layout
└── page.tsx         # Home page
```

## Component Communication Patterns

### Parent to Child (Props)
```typescript
<PropertyVault property={property} />

// ProvenancePanel expects:
interface ProvenancePanelProps {
  property: Property;
}
```

### Child to Parent (Callbacks)
```typescript
<ProductionPanelComponent 
  onUpdate={(data) => updateProperty(data)} 
/>
```

### Sibling Communication (State)
```typescript
// Shared state via Zustand
const { user, logout } = useAuthStore();
```

### Global State
```typescript
// Authentication state
const auth = useAuthStore();

// Access in any component
const { user, token } = auth;
```

## Styling Strategy

### TailwindCSS Approach

```typescript
// Utility classes for styling
<div className="px-4 py-2 rounded-lg bg-dark-800 border border-gold-800">
  Content
</div>

// Custom CSS classes in globals.css
.luxury-card {
  @apply bg-dark-800 border border-gold-900 rounded-lg p-6;
}

.luxury-button-primary {
  @apply px-6 py-2 rounded-lg font-semibold transition-all;
  @apply bg-gradient-gold text-black hover:shadow-lg;
}
```

### Color Palette

```typescript
// Dark theme
--background: #0f0f0f
--luxury-dark: #0f0f0f
--luxury-bg: #1a1a1a
--dark-800: #2d2d2d
--dark-700: #3d3d3d

// Gold accents
--gold-400: #e6bc78
--gold-500: #d4a855
--gold-600: #b8893d
--gold-700: #9c6d31
--gold-900: #3d2813
```

## Performance Considerations

### Code Splitting

Next.js automatically code-splits at the route level:

```
app/agent/dashboard/page.tsx (chunk 1)
app/client/vault/[id]/page.tsx (chunk 2)
app/page.tsx (chunk 3)
```

### Image Optimization

```typescript
// Use Next.js Image component
<Image 
  src={property.images[0]}
  alt={property.title}
  width={1200}
  height={400}
  priority
/>
```

### Component Memoization

```typescript
// For expensive components
const PropertyCard = memo(({ property }) => {
  return <div>{property.title}</div>;
});
```

## Testing Strategy

### Unit Testing (jest)

```typescript
// Test utility functions
test('calculateMonthlyPayment', () => {
  const payment = calculateMonthlyPayment({
    loanAmount: 10000000,
    interestRate: 6.5,
    loanTerm: 30,
  });
  expect(payment).toBe(expectedValue);
});
```

### Component Testing (React Testing Library)

```typescript
test('AuthForm submits with correct data', async () => {
  render(<AuthForm mode="login" />);
  
  fireEvent.change(screen.getByPlaceholderText('email'), {
    target: { value: 'test@example.com' },
  });
  
  fireEvent.click(screen.getByText('Sign In'));
  
  expect(mockLogin).toHaveBeenCalledWith('test@example.com', expect.any(String));
});
```

### E2E Testing (Playwright)

```typescript
test('User login flow', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('[type=email]', 'test@example.com');
  await page.fill('[type=password]', 'password');
  await page.click('button:has-text("Sign In")');
  await expect(page).toHaveURL(/\/agent\/dashboard/);
});
```

## Dependency Management

### Critical Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "recharts": "^2.10.0",
    "zustand": "^4.4.5"
  }
}
```

### Security Updates

```bash
# Check for vulnerabilities
npm audit

# Update dependencies safely
npm update

# Audit fix (with caution)
npm audit fix
```

## Error Handling

### Application Level

```typescript
// Global error boundary (Future enhancement)
<ErrorBoundary>
  <Application />
</ErrorBoundary>
```

### Route Level

```typescript
// Handle not found
if (!property) {
  return <div>Property not found</div>;
}
```

### Form Level

```typescript
// Validation and error display
if (!email) setError('Email required');
if (password !== confirmPassword) setError('Passwords not matching');
```

## Logging Strategy

```typescript
// For development
console.log('[PropertyVault] Loading property:', propertyId);

// For production (when implemented)
import * as Sentry from "@sentry/nextjs";

Sentry.captureException(new Error('Property load failed'));
```

## Security Best Practices

### Input Validation

```typescript
// Validate form inputs
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

if (!validateEmail(email)) {
  setError('Invalid email');
  return;
}
```

### XSS Prevention

```typescript
// React automatically escapes by default
<div> {property.description} </div> // Safe

// For HTML content (use with caution)
<div dangerouslySetInnerHTML={{ __html: htmlContent }} />
```

### CSRF Protection

```typescript
// Implement for production
// Use SameSite cookies
// Verify origin headers
```

## SEO Optimization

```typescript
// Dynamic meta tags in layout
export const metadata: Metadata = {
  title: 'ORTHANC - Luxury Real Estate Vault',
  description: 'The private digital vault system for ultra-luxury real estate',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
};

// For dynamic pages
export async function generateMetadata({ params }: Props) {
  const property = findPropertyById(params.id);
  
  return {
    title: property.title,
    description: property.description,
  };
}
```

## Continuous Integration/Deployment

### GitHub Actions Example

```yaml
name: Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm test
      - uses: vercel/action@main
```

## Development Workflow

### Feature Development

```
1. Create feature branch
   git checkout -b feature/new-feature

2. Implement feature
   - Update components
   - Add types
   - Update styles

3. Test locally
   npm run dev

4. Commit changes
   git add .
   git commit -m "feat: add new feature"

5. Push and create PR
   git push origin feature/new-feature
```

### Code Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] Components are properly typed
- [ ] Styles use TailwindCSS utilities
- [ ] No console.log in production code
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
- [ ] No breaking changes

---

For more details:
- [README.md](./README.md) - Project overview
- [API.md](./API.md) - API documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
