import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './Table'

const data = [
  { service: 'api-gateway', status: 'healthy', latency: '12ms' },
  { service: 'auth-service', status: 'degraded', latency: '245ms' },
  { service: 'payment-worker', status: 'down', latency: '0ms' },
]

const columns = [
  { key: 'service', label: 'Service', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'latency', label: 'Latency', sortable: true },
]

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  args: { columns, data },
}

export default meta
type Story = StoryObj<typeof Table>

export const Default: Story = {}
