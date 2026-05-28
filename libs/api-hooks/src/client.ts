import { GraphQLClient } from 'graphql-request'

const DEFAULT_ENDPOINT = 'http://localhost:8080/graphql'

let client: GraphQLClient | null = null

export function getClient(endpoint?: string): GraphQLClient {
  if (!client) {
    client = new GraphQLClient(endpoint ?? DEFAULT_ENDPOINT)
  }
  return client
}

export function setEndpoint(endpoint: string): void {
  client = new GraphQLClient(endpoint)
}

export async function gqlRequest<T>(query: string, variables?: Record<string, unknown>, retries = 3): Promise<T> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await getClient().request<T>(query, variables)
    } catch (err: any) {
      attempt++
      const msg = err?.message || ''
      const isTransient = msg.includes('network') || msg.includes('timeout') || msg.includes('502') || msg.includes('503') || msg.includes('fetch failed')
      
      if (attempt >= retries || !isTransient) {
        throw err
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)))
    }
  }
  throw new Error('Unreachable')
}
