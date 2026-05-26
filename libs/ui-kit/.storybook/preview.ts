import type { Preview } from '@storybook/react'
import '../src/globals.css'

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
  },
  decorators: [
    (Story) => (
      <div className="bg-bg-default text-text-primary min-h-screen p-8">
        <Story />
      </div>
    ),
  ],
}

export default preview
