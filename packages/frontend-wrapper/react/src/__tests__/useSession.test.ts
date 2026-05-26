import { renderHook } from '@testing-library/react'
import { useSession } from '../useSession'

jest.mock('@otelverse/web', () => ({
  getSessionId: jest.fn(() => 'test-session-id'),
}))

describe('useSession', () => {
  it('returns the session ID', () => {
    const { result } = renderHook(() => useSession())
    expect(result.current.sessionId).toBe('test-session-id')
  })
})
