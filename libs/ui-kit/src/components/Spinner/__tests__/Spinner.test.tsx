import { render } from '@testing-library/react'
import { Spinner } from '../Spinner'

describe('Spinner', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('accepts custom size', () => {
    const { container } = render(<Spinner size={48} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('48')
  })
})
