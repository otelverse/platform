import { useQuery } from '@tanstack/react-query'
import { gqlRequest } from '../client'
import { TRACES_QUERY } from '../queries'
import type { Trace, TraceFilters } from '../types'

interface TracesResponse {
  traces: Trace[]
}

export function useTraces(filters: TraceFilters) {
  return useQuery<TracesResponse>({
    queryKey: ['traces', filters],
    queryFn: () => gqlRequest<TracesResponse>(TRACES_QUERY, filters as unknown as Record<string, unknown>),
  })
}
