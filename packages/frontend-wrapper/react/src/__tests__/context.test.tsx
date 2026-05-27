import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { OtelProvider, useOtelVerseContext } from '../context'

function TestChild() {
  const ctx = useOtelVerseContext()
  return (
    <div>
      <span data-testid="session-id">{ctx.sessionId}</span>
    </div>
  )
}

describe('OtelProvider', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('provides context to children', () => {
    render(
      <OtelProvider collectorUrl="http://localhost:4318">
        <TestChild />
      </OtelProvider>,
    )

    const sessionIdEl = screen.getByTestId('session-id')
    expect(sessionIdEl.textContent).toBeTruthy()
  })

  it('renders children', () => {
    render(
      <OtelProvider>
        <div data-testid="child">Child</div>
      </OtelProvider>,
    )

    expect(screen.getByTestId('child')).toHaveTextContent('Child')
  })
})
