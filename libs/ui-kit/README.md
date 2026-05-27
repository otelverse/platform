# @otelverse/ui-kit

Shared UI component library for the OTelVerse platform. Built with React, Tailwind CSS,
Radix UI primitives, and Lucide icons. Design tokens are managed via Style Dictionary.

## Getting Started

```bash
# Install dependencies
pnpm install

# Build design tokens
pnpm build:tokens

# Start Storybook
pnpm storybook

# Run tests
pnpm test
```

## Usage

```tsx
import { Button, Card, ThemeProvider } from '@otelverse/ui-kit'

function App() {
  return (
    <ThemeProvider>
      <Card title="Welcome">
        <Button variant="primary">Get Started</Button>
      </Card>
    </ThemeProvider>
  )
}
```

## Design Tokens

Tokens are defined in `design-tokens/tokens/*.json` using the DTCG format.
Run `pnpm build:tokens` to regenerate `dist/tokens.css` and `dist/tokens.json`.

### Token categories

- **Color**: grayscale palette, semantic aliases (bg, text, border, primary, error, etc.)
- **Typography**: font families, sizes, weights, line heights
- **Spacing**: consistent spacing scale (4px base unit)
- **Shadows**: elevation shadows (sm, md, lg, xl)
- **Border Radius**: rounded corner scale

## Components

| Component | Description |
|-----------|-------------|
| Button | Variants: primary, secondary, outline, ghost. Sizes: sm, md, lg |
| Card | Container with optional title |
| Input | Text input with error state |
| Spinner | Animated loading indicator |
| Badge | Inline label with color variants |
| Layout | App shell with sidebar, header, main |
| Table | Sortable data table |
| CodeBlock | Code display with copy button |
| TraceWaterfall | Trace visualization placeholder |

## Conventions

- All colors reference CSS variables from `dist/tokens.css` — no hardcoded hex values
- Components accept `className` prop for overrides
- All components have Storybook stories and Jest unit tests
