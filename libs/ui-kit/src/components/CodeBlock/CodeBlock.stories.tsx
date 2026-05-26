import type { Meta, StoryObj } from '@storybook/react'
import { CodeBlock } from './CodeBlock'

const sampleCode = `{
  "service": "api-gateway",
  "status": "healthy",
  "latency_ms": 12
}`

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  args: { code: sampleCode },
}

export default meta
type Story = StoryObj<typeof CodeBlock>

export const Default: Story = {}
