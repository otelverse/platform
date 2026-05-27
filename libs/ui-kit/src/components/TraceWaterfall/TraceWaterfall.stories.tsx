import type { Meta, StoryObj } from '@storybook/react'
import { TraceWaterfall, type SpanData } from './TraceWaterfall'

const sampleSpans: SpanData[] = [
  {
    spanId: 'span-1',
    parentSpanId: null,
    operationName: 'GET /api/users',
    serviceName: 'api-gateway',
    startTime: '2024-01-01T00:00:00.000Z',
    duration: 200_000_000,
    statusCode: 0,
    attributes: [
      { key: 'http.method', value: 'GET' },
      { key: 'http.route', value: '/api/users' },
      { key: 'http.status_code', value: '200' },
    ],
    events: [
      {
        name: 'cache.miss',
        timestamp: '2024-01-01T00:00:00.050Z',
        attributes: [{ key: 'cache.key', value: 'users:list' }],
      },
    ],
  },
  {
    spanId: 'span-2',
    parentSpanId: 'span-1',
    operationName: 'SELECT users',
    serviceName: 'postgres',
    startTime: '2024-01-01T00:00:00.020Z',
    duration: 100_000_000,
    statusCode: 0,
    attributes: [
      { key: 'db.system', value: 'postgresql' },
      { key: 'db.statement', value: 'SELECT * FROM users LIMIT 50' },
    ],
    events: [
      {
        name: 'connection.acquired',
        timestamp: '2024-01-01T00:00:00.025Z',
        attributes: [{ key: 'pool.size', value: '10' }],
      },
    ],
  },
  {
    spanId: 'span-3',
    parentSpanId: 'span-1',
    operationName: 'redis.get',
    serviceName: 'redis',
    startTime: '2024-01-01T00:00:00.015Z',
    duration: 30_000_000,
    statusCode: 0,
    attributes: [{ key: 'db.system', value: 'redis' }],
    events: [],
  },
  {
    spanId: 'span-4',
    parentSpanId: null,
    operationName: 'POST /api/orders',
    serviceName: 'api-gateway',
    startTime: '2024-01-01T00:00:01.000Z',
    duration: 500_000_000,
    statusCode: 1,
    attributes: [
      { key: 'http.method', value: 'POST' },
      { key: 'http.route', value: '/api/orders' },
      { key: 'http.status_code', value: '500' },
    ],
    events: [],
  },
  {
    spanId: 'span-5',
    parentSpanId: 'span-4',
    operationName: 'INSERT orders',
    serviceName: 'postgres',
    startTime: '2024-01-01T00:00:01.050Z',
    duration: 400_000_000,
    statusCode: 1,
    attributes: [
      { key: 'db.system', value: 'postgresql' },
      { key: 'db.statement', value: 'INSERT INTO orders ...' },
      { key: 'error.message', value: 'deadlock detected' },
    ],
    events: [],
  },
  {
    spanId: 'span-6',
    parentSpanId: 'span-4',
    operationName: 'payment.process',
    serviceName: 'payment-service',
    startTime: '2024-01-01T00:00:01.100Z',
    duration: 250_000_000,
    statusCode: 2,
    attributes: [
      { key: 'payment.provider', value: 'stripe' },
      { key: 'payment.amount', value: '49.99' },
    ],
    events: [
      {
        name: 'payment.retry',
        timestamp: '2024-01-01T00:00:01.200Z',
        attributes: [{ key: 'attempt', value: '2' }],
      },
    ],
  },
]

const meta: Meta<typeof TraceWaterfall> = {
  title: 'Components/TraceWaterfall',
  component: TraceWaterfall,
  args: { spans: sampleSpans },
}

export default meta
type Story = StoryObj<typeof TraceWaterfall>

export const Default: Story = {}

export const Empty: Story = {
  args: { spans: [] },
}

export const SingleSpan: Story = {
  args: {
    spans: [
      {
        spanId: 'span-1',
        parentSpanId: null,
        operationName: 'healthcheck',
        serviceName: 'api-gateway',
        startTime: '2024-01-01T00:00:00.000Z',
        duration: 5_000_000,
        statusCode: 0,
        attributes: [],
        events: [],
      },
    ],
  },
}
