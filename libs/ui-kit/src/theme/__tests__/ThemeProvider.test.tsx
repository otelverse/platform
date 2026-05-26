import { render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeProvider'

function TestChild() {
  const { theme } = useTheme()
  return <span>{theme}</span>
}

describe('ThemeProvider', () => {
  it('provides theme context', () => {
    render(
      <ThemeProvider>
        <TestChild />
      </ThemeProvider>,
    )
    expect(screen.getByText('dark')).toBeInTheDocument()
  })
})
