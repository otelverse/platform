import { useQuery } from '@tanstack/react-query'

interface UQLResult {
  data: Record<string, unknown>[]
}

export function useUQL(query: string) {
  return useQuery<UQLResult>({
    queryKey: ['uql', query],
    queryFn: async () => ({ data: [] }),
    enabled: false,
  })
}
