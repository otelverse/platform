import { render, screen } from '@testing-library/react'
import { Input } from '../Input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('applies error border style when error is set', () => {
    render(<Input error="Error" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-error-base')
  })
})
