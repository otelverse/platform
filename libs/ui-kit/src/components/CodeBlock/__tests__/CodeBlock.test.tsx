import { render, screen } from '@testing-library/react'
import { CodeBlock } from '../CodeBlock'

describe('CodeBlock', () => {
  it('renders code content', () => {
    render(<CodeBlock code="console.log('hello')" />)
    expect(screen.getByText("console.log('hello')")).toBeInTheDocument()
  })
})
