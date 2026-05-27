import { useQuery } from '@tanstack/react-query'
import { gqlRequest } from '../client'
import { TRACE_QUERY } from '../queries'
import type { Trace } from '../types'

interface TraceResponse {
  trace: Trace
}

export function useTrace(id: string) {
  return useQuery<TraceResponse>({
    queryKey: ['trace', id],
    queryFn: () => gqlRequest<TraceResponse>(TRACE_QUERY, { id }),
    enabled: !!id,
  })
}
