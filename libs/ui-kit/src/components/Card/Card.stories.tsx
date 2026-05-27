import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: { children: <p className="text-text-secondary">Card content goes here.</p> },
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {}
export const WithTitle: Story = { args: { title: 'Card Title' } }
