import { render, screen } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    render(<Button variant="primary">Primary</Button>)
    const btn = screen.getByText('Primary')
    expect(btn.className).toContain('bg-primary-base')
  })

  it('applies size styles', () => {
    render(<Button size="lg">Large</Button>)
    const btn = screen.getByText('Large')
    expect(btn.className).toContain('px-6')
  })

  it('merges custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByText('Custom').className).toContain('custom-class')
  })
})
