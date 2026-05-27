import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Label</Badge>)
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    render(<Badge variant="error">Error</Badge>)
    const badge = screen.getByText('Error')
    expect(badge.className).toContain('bg-error-bg')
  })
})
