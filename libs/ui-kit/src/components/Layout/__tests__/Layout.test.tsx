import { render, screen } from '@testing-library/react'
import { Layout } from '../Layout'

describe('Layout', () => {
  it('renders sidebar, header, and main content', () => {
    render(
      <Layout sidebar={<nav>Sidebar</nav>} header={<header>Header</header>}>
        <main>Content</main>
      </Layout>,
    )
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
