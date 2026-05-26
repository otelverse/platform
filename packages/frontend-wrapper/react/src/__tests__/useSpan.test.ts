import { renderHook } from '@testing-library/react'
import { useSpan, useErrorSpan } from '../useSpan'

jest.mock('@opentelemetry/api', () => {
  const mockSpan = {
    addEvent: jest.fn(),
    end: jest.fn(),
    setAttribute: jest.fn(),
    recordException: jest.fn(),
    setStatus: jest.fn(),
  }

  return {
    trace: {
      getTracer: jest.fn().mockReturnValue({
        startSpan: jest.fn().mockReturnValue(mockSpan),
      }),
    },
    SpanStatusCode: { ERROR: 2 },
  }
})

describe('useSpan', () => {
  it('returns span helpers', () => {
    const { result } = renderHook(() => useSpan('test-span'))
    expect(result.current).toHaveProperty('addEvent')
    expect(result.current).toHaveProperty('setAttribute')
    expect(result.current).toHaveProperty('end')
  })

  it('end the span', () => {
    const { result } = renderHook(() => useSpan('test-span'))
    result.current.end()
  })
})

describe('useErrorSpan', () => {
  it('handles error without throwing', () => {
    const { result } = renderHook(() =>
      useErrorSpan('error-span', new Error('test error')),
    )
    expect(result.current).toBeUndefined()
  })
})
