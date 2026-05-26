import { useQuery } from '@tanstack/react-query'
import { gqlRequest } from '../client'
import { UQL_QUERY } from '../queries'

interface UQLResult {
  uql: {
    traces?: Array<{
      traceId: string
      spans: Array<{
        spanId: string
        parentSpanId?: string
        operationName: string
        serviceName: string
        startTime: string
        duration: number
        statusCode: number
        attributes: Array<{ key: string; value: string }>
        events: Array<{ name: string; timestamp: string; attributes: Array<{ key: string; value: string }> }>
      }>
    }>
    logs?: Array<{
      timestamp: string
      severity: string
      body: string
      attributes: Array<{ key: string; value: string }>
    }>
  }
}

export function useUQL(query: string) {
  return useQuery<UQLResult>({
    queryKey: ['uql', query],
    queryFn: () => gqlRequest<UQLResult>(UQL_QUERY, { query }),
    enabled: !!query,
  })
}
