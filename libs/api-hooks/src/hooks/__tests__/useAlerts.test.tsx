import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAlertRules } from '../useAlerts'

jest.mock('graphql-request', () => ({
  request: jest.fn().mockImplementation((url, query) => {
    if (query.includes('GetAlertRules')) {
      return Promise.resolve({
        alertRules: [
          {
            id: '1',
            name: 'Test Rule',
            query: 'FIND traces',
            state: 'OK',
          }
        ]
      })
    }
    return Promise.resolve({})
  }),
}))

describe('useAlerts hook', () => {
  it('should fetch alert rules', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useAlertRules(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.alertRules).toBeDefined()
    expect(result.current.alertRules?.[0].name).toBe('Test Rule')
  })
})
