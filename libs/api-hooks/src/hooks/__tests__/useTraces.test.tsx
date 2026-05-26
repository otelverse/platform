import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTraces } from '../useTraces'
import type { ReactNode } from 'react'

jest.mock('../../client', () => ({
  gqlRequest: jest.fn().mockResolvedValue({ traces: [] }),
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

describe('useTraces', () => {
  it('should fetch traces', async () => {
    const { result } = renderHook(
      () =>
        useTraces({
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-12-31T23:59:59Z',
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.traces).toEqual([])
  })
})
