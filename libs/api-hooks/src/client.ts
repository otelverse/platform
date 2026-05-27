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

export async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  return getClient().request<T>(query, variables)
}
