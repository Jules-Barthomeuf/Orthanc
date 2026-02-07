# Contributing to ORTHANC

We appreciate your interest in contributing to ORTHANC! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others when possible
- Follow professional standards

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/orthanc.git
   cd orthanc
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Make your changes**
   - Write code following the existing style
   - Add tests if applicable
   - Update documentation

5. **Test your changes**
   ```bash
   npm run dev
   # Test manually in browser
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: describe your changes"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Provide a clear title and description
   - Reference any related issues
   - Wait for review and feedback

## Development Standards

### Code Style

- Use TypeScript for type safety
- Follow the existing code structure
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic

### Naming Conventions

```typescript
// Components: PascalCase
function PropertyCard() { }

// Functions: camelCase
function calculateMonthlyPayment() { }

// Constants: UPPER_SNAKE_CASE
const MAX_PROPERTY_PRICE = 1000000000;

// Types: PascalCase
interface PropertyVault { }
type UserRole = "agent" | "client";

// Filenames: 
// - Components: PascalCase.tsx
// - Utils: camelCase.ts
// - Styles: globals.css
```

### TypeScript Best Practices

```typescript
// ✓ Good: Explicit types
function getProperty(id: string): Property | null {
  // ...
}

// ✗ Avoid: Any types
function getProperty(id: any): any {
  // ...
}

// ✓ Good: Interface for props
interface PropertyCardProps {
  property: Property;
  onSelect?: (id: string) => void;
}

// ✗ Avoid: implicit types in props
function PropertyCard({ property, onSelect }) {
  // ...
}
```

## Component Development

### Component Structure

```typescript
"use client"; // Add if using client features

import { useState } from "react";
import { Property } from "@/types";

interface MyComponentProps {
  title: string;
  data: Property;
  onUpdate?: (data: Property) => void;
}

export function MyComponent({ title, data, onUpdate }: MyComponentProps) {
  const [state, setState] = useState<string>("");

  const handleChange = (newValue: string) => {
    setState(newValue);
    onUpdate?.({ ...data });
  };

  return (
    <div className="p-4">
      <h2>{title}</h2>
      {/* Component JSX */}
    </div>
  );
}
```

### Style Guidelines

- Use TailwindCSS utilities
- Define custom classes in globals.css when needed
- Maintain consistent spacing and sizing
- Follow the dark/gold theme

```typescript
// ✓ Good: TailwindCSS utilities
<div className="bg-dark-800 border border-gold-700 rounded-lg p-6">

// ✓ Good: Custom utility classes
<button className="luxury-button-primary">

// ✗ Avoid: Inline styles
<div style={{ backgroundColor: "#1a1a1a" }}>
```

## Testing Guidelines

### Adding Tests

```typescript
// Example test
import { test, expect } from "@jest/globals";
import { calculateROI } from "@/lib/calculations";

test("calculateROI returns correct percentage", () => {
  const roi = calculateROI(100000, 150000);
  expect(roi).toBe(50);
});
```

### Test Coverage

- Unit tests for utility functions
- Component tests for complex components
- E2E tests for critical user flows
- Aim for >80% coverage on core features

## Documentation

### Update Documentation When:

- Adding new features
- Changing API structure
- Modifying file organization
- Adding new dependencies
- Changing configuration

### Documentation Should Include:

- Clear description of changes
- Code examples
- Why the change was made
- Any breaking changes

## Git Workflow

### Commit Messages

```
feat: add new feature
fix: fix bug in property vault
docs: update deployment guide
style: reformat component code
refactor: improve state management
test: add unit tests
chore: update dependencies
```

### Pull Request Process

1. Update documentation
2. Add tests if applicable
3. Ensure code builds without errors
4. Request review from maintainers
5. Address feedback
6. Squash commits if requested
7. Merge to main branch

## Issue Reporting

### Bug Report Template

```
Title: [BUG] Brief description

Environment:
- Browser: 
- OS:
- Version:

Steps to reproduce:
1. 
2.
3.

Expected behavior:
Actual behavior:
Screenshots/logs:
```

### Feature Request Template

```
Title: [FEATURE] Brief description

Problem statement:
Why do we need this?

Proposed solution:
How would you implement it?

Alternatives considered:
Other possible approaches?
```

## Performance Optimization

When contributing, consider:

- Bundle size impact
- Render performance
- Network requests
- Memory usage

```typescript
// ✓ Good: Memoize expensive components
const PropertyCard = memo(({ property }) => {
  return <div>{property.title}</div>;
});

// ✓ Good: Lazy load components
const PropertyVault = lazy(() => import('./PropertyVault'));

// ✗ Avoid: Unnecessary re-renders
function PropertyList({ properties }) {
  const sorted = properties.sort(); // Every render!
}
```

## Security Considerations

- Never commit sensitive data (.env files)
- Validate user input
- Sanitize output
- Use HTTPS for API calls
- Follow OWASP guidelines
- Report security issues privately

## Questions?

- Check existing documentation
- Review similar code in the project
- Ask in pull request discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (Proprietary).

---

Thank you for contributing to ORTHANC!
