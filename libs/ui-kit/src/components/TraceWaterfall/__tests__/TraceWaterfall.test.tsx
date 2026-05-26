import { render, screen, fireEvent } from '@testing-library/react'
import { TraceWaterfall, type SpanData } from '../TraceWaterfall'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

const sampleSpans: SpanData[] = [
  {
    spanId: 'span-1',
    parentSpanId: null,
    operationName: 'GET /api/users',
    serviceName: 'api-gateway',
    startTime: '2024-01-01T00:00:00.000Z',
    duration: 100_000_000,
    statusCode: 0,
    attributes: [
      { key: 'http.method', value: 'GET' },
      { key: 'http.route', value: '/api/users' },
    ],
    events: [
      {
        name: 'cache.miss',
        timestamp: '2024-01-01T00:00:00.050Z',
        attributes: [{ key: 'cache.key', value: 'users:list' }],
      },
    ],
  },
  {
    spanId: 'span-2',
    parentSpanId: 'span-1',
    operationName: 'SELECT users',
    serviceName: 'postgres',
    startTime: '2024-01-01T00:00:00.010Z',
    duration: 50_000_000,
    statusCode: 0,
    attributes: [{ key: 'db.system', value: 'postgresql' }],
    events: [],
  },
  {
    spanId: 'span-3',
    parentSpanId: 'span-1',
    operationName: 'redis.get',
    serviceName: 'redis',
    startTime: '2024-01-01T00:00:00.015Z',
    duration: 20_000_000,
    statusCode: 1,
    attributes: [{ key: 'db.system', value: 'redis' }],
    events: [],
  },
]

describe('TraceWaterfall', () => {
  it('renders root span and headers', () => {
    render(<TraceWaterfall spans={sampleSpans} />)
    expect(screen.getByText('api-gateway')).toBeInTheDocument()
    expect(screen.getByText('Service')).toBeInTheDocument()
    expect(screen.getByText('Operation')).toBeInTheDocument()
    expect(screen.getByText('Duration')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('shows empty state when no spans provided', () => {
    render(<TraceWaterfall spans={[]} />)
    expect(screen.getByText('No spans to display')).toBeInTheDocument()
  })

  it('expands and shows child spans', () => {
    render(<TraceWaterfall spans={sampleSpans} />)
    const toggleButtons = screen.getAllByRole('button')
    expect(toggleButtons.length).toBeGreaterThan(0)

    fireEvent.click(toggleButtons[0])
    expect(screen.getByText('postgres')).toBeInTheDocument()
    expect(screen.getByText('redis')).toBeInTheDocument()
  })

  it('selects a span and shows detail panel', () => {
    render(<TraceWaterfall spans={sampleSpans} />)
    fireEvent.click(screen.getByText('api-gateway'))
    expect(screen.getByText('Span Details')).toBeInTheDocument()
    const operationLabels = screen.getAllByText('GET /api/users')
    expect(operationLabels.length).toBe(2)
  })

  it('shows attributes in detail panel', () => {
    render(<TraceWaterfall spans={sampleSpans} />)
    fireEvent.click(screen.getByText('api-gateway'))
    expect(screen.getByText('http.method')).toBeInTheDocument()
    expect(screen.getByText('GET')).toBeInTheDocument()
  })

  it('shows events in detail panel', () => {
    render(<TraceWaterfall spans={sampleSpans} />)
    fireEvent.click(screen.getByText('api-gateway'))
    expect(screen.getByText('cache.miss')).toBeInTheDocument()
    expect(screen.getByText('cache.key')).toBeInTheDocument()
    expect(screen.getByText('users:list')).toBeInTheDocument()
  })

  it('closes detail panel when close button is clicked', () => {
    render(<TraceWaterfall spans={sampleSpans} />)
    fireEvent.click(screen.getByText('api-gateway'))
    expect(screen.getByText('Span Details')).toBeInTheDocument()

    const allButtons = screen.getAllByRole('button')
    const closeBtn = allButtons.find((btn) => btn.closest('.w-80'))
    expect(closeBtn).toBeTruthy()
    if (closeBtn) {
      fireEvent.click(closeBtn)
      expect(screen.queryByText('Span Details')).not.toBeInTheDocument()
    }
  })

  it('handles root spans only (no nesting)', () => {
    const flatSpans = sampleSpans.map((s) => ({ ...s, parentSpanId: null }))
    render(<TraceWaterfall spans={flatSpans} />)
    expect(screen.getByText('api-gateway')).toBeInTheDocument()
    expect(screen.getByText('postgres')).toBeInTheDocument()
    expect(screen.getByText('redis')).toBeInTheDocument()
  })
})
