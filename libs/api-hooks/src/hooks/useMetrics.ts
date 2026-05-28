import { useQuery } from '@tanstack/react-query'
import { gqlRequest } from '../client'
import { METRICS_QUERY } from '../queries'
import type { MetricQueryResult } from '../types'

interface MetricsResponse {
  metrics: MetricQueryResult[]
}

export interface MetricFilters {
  query: string
  startTime: string
  endTime: string
  step: number
}

export function useMetrics(filters: MetricFilters) {
  return useQuery<MetricsResponse>({
    queryKey: ['metrics', filters],
    queryFn: () => gqlRequest<MetricsResponse>(METRICS_QUERY, filters as unknown as Record<string, unknown>),
    enabled: !!filters.query && !!filters.startTime && !!filters.endTime && !!filters.step,
  })
}
