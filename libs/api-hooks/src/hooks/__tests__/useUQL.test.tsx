import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUQL } from '../useUQL'
import type { ReactNode } from 'react'

jest.mock('../../client', () => ({
  gqlRequest: jest.fn().mockResolvedValue({
    uql: {
      traces: [
        {
          traceId: 'abc123',
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
      ],
    },
  }),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useUQL', () => {
  it('should fetch UQL results', async () => {
    const { result } = renderHook(
      () => useUQL('traces | where service.name = "api" | limit 5'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.uql.traces).toHaveLength(1)
    expect(result.current.data?.uql.traces?.[0].traceId).toBe('abc123')
  })

  it('should not fetch when query is empty', () => {
    const { result } = renderHook(() => useUQL(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
  })
})
