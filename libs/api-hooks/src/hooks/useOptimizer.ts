import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gqlRequest } from '../client'
import type { Pipeline } from '../types'

export interface TelemetryStats {
  totalSpans: number
  spansPerService: {
    serviceName: string
    spanCount: number
    errorCount: number
    averageDuration: number
  }[]
  errorRate: number
  averageLatency: number
}

export interface OptimizationRecommendation {
  id: string
  type: 'TAIL_SAMPLING' | 'PII_REDACTION' | 'PROBABILISTIC_SAMPLING'
  description: string
  affectedServices: string[]
  proposedConfig: any
  potentialSavings: number
  confidence: number
}

export const useTelemetryStats = (startTime: string, endTime: string) => {
  return useQuery<{ telemetryStats: TelemetryStats }>({
    queryKey: ['telemetryStats', startTime, endTime],
    queryFn: async () => {
      const query = `
        query($startTime: DateTime!, $endTime: DateTime!) {
          telemetryStats(startTime: $startTime, endTime: $endTime) {
            totalSpans
            errorRate
            averageLatency
            spansPerService {
              serviceName
              spanCount
              errorCount
              averageDuration
            }
          }
        }
      `
      return gqlRequest(query, { startTime, endTime })
    },
    enabled: !!startTime && !!endTime,
  })
}

export const useOptimizationRecommendations = (pipelineId: string, startTime: string, endTime: string) => {
  return useQuery<{ optimizationRecommendations: OptimizationRecommendation[] }>({
    queryKey: ['optimizationRecommendations', pipelineId, startTime, endTime],
    queryFn: async () => {
      const query = `
        query($pipelineId: ID!, $startTime: DateTime!, $endTime: DateTime!) {
          optimizationRecommendations(pipelineId: $pipelineId, startTime: $startTime, endTime: $endTime) {
            id
            type
            description
            affectedServices
            proposedConfig
            potentialSavings
            confidence
          }
        }
      `
      return gqlRequest(query, { pipelineId, startTime, endTime })
    },
    enabled: !!pipelineId && !!startTime && !!endTime,
  })
}

export const useApplyRecommendation = () => {
  const queryClient = useQueryClient()
  return useMutation<{ applyRecommendation: Pipeline }, Error, { pipelineId: string; recommendationId: string }>({
    mutationFn: async ({ pipelineId, recommendationId }) => {
      const mutation = `
        mutation($pipelineId: ID!, $recommendationId: ID!) {
          applyRecommendation(pipelineId: $pipelineId, recommendationId: $recommendationId) {
            id
            name
            nodes {
              id
              type
              label
              properties
              position { x y }
            }
            edges {
              id
              source
              target
              sourceHandle
              targetHandle
            }
          }
        }
      `
      return gqlRequest(mutation, { pipelineId, recommendationId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}
