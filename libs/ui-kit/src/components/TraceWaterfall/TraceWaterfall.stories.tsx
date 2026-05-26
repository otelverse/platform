import type { Meta, StoryObj } from '@storybook/react'
import { TraceWaterfall } from './TraceWaterfall'

const meta: Meta<typeof TraceWaterfall> = {
  title: 'Components/TraceWaterfall',
  component: TraceWaterfall,
}

export default meta
type Story = StoryObj<typeof TraceWaterfall>

export const Default: Story = {}
