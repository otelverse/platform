import React from 'react'
import type { Preview } from '@storybook/react'
import { ThemeProvider } from '../src/theme'
import '../src/globals.css'

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="bg-bg-default text-text-primary min-h-screen p-8">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}

export default preview
