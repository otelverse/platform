import type { Meta, StoryObj } from '@storybook/react'
import { Layout } from './Layout'

const meta: Meta<typeof Layout> = {
  title: 'Components/Layout',
  component: Layout,
  args: {
    sidebar: <nav className="flex flex-col gap-2"><a className="text-text-secondary hover:text-text-primary">Dashboard</a><a className="text-text-secondary hover:text-text-primary">Traces</a></nav>,
    header: <div className="font-semibold">Header</div>,
    children: <div className="text-text-secondary">Main content area</div>,
  },
}

export default meta
type Story = StoryObj<typeof Layout>

export const Default: Story = {}
