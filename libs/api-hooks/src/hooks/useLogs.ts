import { useQuery } from '@tanstack/react-query'
import { gqlRequest } from '../client'
import { LOGS_QUERY } from '../queries'
import type { Log, LogFilters } from '../types'

interface LogsResponse {
  logs: Log[]
}

export function useLogs(filters: LogFilters) {
  return useQuery<LogsResponse>({
    queryKey: ['logs', filters],
    queryFn: () => gqlRequest<LogsResponse>(LOGS_QUERY, filters as unknown as Record<string, unknown>),
  })
}
