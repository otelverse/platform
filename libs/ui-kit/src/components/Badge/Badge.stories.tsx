import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Badge' },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Neutral: Story = { args: { variant: 'neutral' } }
export const Error: Story = { args: { variant: 'error' } }
export const Warning: Story = { args: { variant: 'warning' } }
export const Success: Story = { args: { variant: 'success' } }
export const Info: Story = { args: { variant: 'info' } }
