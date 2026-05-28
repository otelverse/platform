import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { request } from 'graphql-request'

const API_URL = 'http://localhost:8080/graphql'

export interface AlertRule {
  id: string
  name: string
  description: string
  query: string
  intervalSeconds: number
  state: string
  lastEvaluatedAt: string | null
}

export interface AlertEvent {
  id: string
  alertRuleId: string
  timestamp: string
  state: string
  queryResultCount: number
  notificationSent: boolean
}

export interface NotificationChannel {
  id: string
  name: string
  type: string
  config: any
}

export interface SilenceRule {
  id: string
  matchers: { key: string; value: string }[]
  startsAt: string
  endsAt: string
  comment: string
}

const GET_ALERT_RULES = `
  query GetAlertRules {
    alertRules {
      id
      name
      description
      query
      intervalSeconds
      state
      lastEvaluatedAt
    }
  }
`

const GET_ALERT_RULE = `
  query GetAlertRule($id: String!) {
    alertRule(id: $id) {
      id
      name
      description
      query
      intervalSeconds
      state
      lastEvaluatedAt
    }
  }
`

const GET_ALERT_HISTORY = `
  query GetAlertHistory($ruleId: String, $limit: Int) {
    alertHistory(ruleId: $ruleId, limit: $limit) {
      id
      alertRuleId
      timestamp
      state
      queryResultCount
      notificationSent
    }
  }
`

export function useAlertRules() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['alertRules'],
    queryFn: async () => {
      const res = await request<any>(API_URL, GET_ALERT_RULES)
      return res.alertRules as AlertRule[]
    }
  })

  return {
    alertRules: data,
    isLoading,
    isError: error,
    mutate: refetch,
  }
}

export function useAlertRule(id: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['alertRule', id],
    queryFn: async () => {
      const res = await request<any>(API_URL, GET_ALERT_RULE, { id })
      return res.alertRule as AlertRule
    },
    enabled: !!id,
  })

  return {
    alertRule: data,
    isLoading,
    isError: error,
    mutate: refetch,
  }
}

export function useAlertHistory(ruleId?: string, limit: number = 100) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['alertHistory', ruleId, limit],
    queryFn: async () => {
      const res = await request<any>(API_URL, GET_ALERT_HISTORY, { ruleId, limit })
      return res.alertHistory as AlertEvent[]
    }
  })

  return {
    history: data,
    isLoading,
    isError: error,
    mutate: refetch,
  }
}

export async function createAlertRule(input: any) {
  const mutation = `
    mutation CreateAlertRule($input: AlertRuleInput!) {
      createAlertRule(input: $input) {
        id
        name
      }
    }
  `
  return request(API_URL, mutation, { input })
}

export async function deleteAlertRule(id: string) {
  const mutation = `
    mutation DeleteAlertRule($id: String!) {
      deleteAlertRule(id: $id)
    }
  `
  return request(API_URL, mutation, { id })
}
