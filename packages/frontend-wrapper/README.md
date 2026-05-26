# OTelVerse Frontend Wrapper

A framework-agnostic browser library that auto-instruments page views, network calls, Web Vitals, and errors, then exports OTLP directly to the OTelVerse Platform. A React wrapper provides idiomatic hooks.

## Packages

- `@otelverse/web` — Core browser auto-instrumentation library
- `@otelverse/react` — React hooks and provider

## Installation

```bash
npm install @otelverse/web @otelverse/react
```

## Core Usage

```typescript
import { initOtel, getSessionId } from '@otelverse/web'

const otel = initOtel({
  collectorUrl: 'http://localhost:4318',
  serviceName: 'my-web-app',
})

// Later, when done:
// await otel.shutdown()
```

### Session ID

Every span is automatically tagged with a `session.id` attribute. This session ID is persisted in `sessionStorage` and links frontend traces to backend traces.

```typescript
import { getSessionId } from '@otelverse/web'
const sessionId = getSessionId()
```

## React Usage

```tsx
import { OtelProvider, useSpan, useSession } from '@otelverse/react'

function App() {
  return (
    <OtelProvider collectorUrl="http://localhost:4318" serviceName="my-app">
      <MyComponent />
    </OtelProvider>
  )
}

function MyComponent() {
  const { addEvent, end } = useSpan('my-component-render')
  const { sessionId } = useSession()

  // Add custom events to the span
  addEvent('data-loaded', { count: '42' })

  // End the span when done
  useEffect(() => {
    return () => end()
  }, [])

  return <div>Session: {sessionId}</div>
}
```

### Error Tracking

```tsx
import { useErrorSpan } from '@otelverse/react'

function DataFetcher() {
  const handleError = (error: Error) => {
    useErrorSpan('fetch-error', error)
  }
  // ...
}
```

## CDN Usage

```html
<script src="https://cdn.jsdelivr.net/npm/@otelverse/web/dist/otelverse-web.iife.js"></script>
<script>
  const otel = OtelverseWeb.initOtel({
    collectorUrl: 'http://localhost:4318',
    serviceName: 'my-app',
  })
</script>
```

## Auto-Instrumentation

Once initialized, the library automatically captures:

- **Page Views** — Navigation and document-load timing spans
- **Network Calls** — Fetch and XMLHttpRequest spans with trace propagation
- **Web Vitals** — LCP, FCP, CLS, TTFB, INP reported as OTel metrics
- **Errors** — Uncaught exceptions and unhandled promise rejections as error spans

## Session Tracking

The session ID is:
- Generated as a UUID v4
- Persisted in `sessionStorage` for the browser tab session
- Attached as `session.id` resource attribute on all spans
- Shared with backend traces for full-stack distributed tracing

## Development

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm --filter @otelverse/web build
pnpm --filter @otelverse/react build

# Build CDN bundles
pnpm --filter @otelverse/web build:bundle
pnpm --filter @otelverse/react build:bundle

# Run tests
pnpm --filter @otelverse/web test
pnpm --filter @otelverse/react test

# Run all tests
bazel test //packages/frontend-wrapper/...
```

## License

MIT - see LICENSE
