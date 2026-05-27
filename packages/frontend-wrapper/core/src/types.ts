export interface OtelConfig {
  collectorUrl?: string
  serviceName?: string
}

export interface OtelInstance {
  shutdown: () => Promise<void>
}
