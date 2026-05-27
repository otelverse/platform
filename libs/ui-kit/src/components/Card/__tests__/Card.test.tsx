import { render, screen } from '@testing-library/react'
import { Card } from '../Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<Card title="My Title">Content</Card>)
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })
})
