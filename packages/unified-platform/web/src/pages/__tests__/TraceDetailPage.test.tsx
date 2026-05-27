import { render, screen } from '@testing-library/react'
import TraceDetailPage from '../TraceDetailPage'

jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'trace-123' }),
}))

jest.mock('@otelverse/api-hooks', () => ({
  useTrace: () => ({
    data: {
      trace: {
        traceId: 'trace-123',
        spans: [
          {
            spanId: 'span-1',
            parentSpanId: null,
            operationName: 'GET /api',
            serviceName: 'api-gateway',
            startTime: '2024-01-01T00:00:00Z',
            duration: 100_000_000,
            statusCode: 0,
            attributes: [],
            events: [],
          },
        ],
      },
    },
    isLoading: false,
    error: null,
  }),
}))

jest.mock('@otelverse/ui-kit', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
  TraceWaterfall: ({ spans }: { spans: unknown[] }) => (
    <div data-testid="waterfall">{spans.length} spans</div>
  ),
}))

describe('TraceDetailPage', () => {
  it('renders trace waterfall with spans', () => {
    render(<TraceDetailPage />)
    expect(screen.getByText('trace-123')).toBeInTheDocument()
    expect(screen.getByTestId('waterfall')).toBeInTheDocument()
    expect(screen.getByText('1 span')).toBeInTheDocument()
  })
})
