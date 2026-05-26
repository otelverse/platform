import { getSessionId, resetSessionId } from '../session'

beforeEach(() => {
  sessionStorage.clear()
  resetSessionId()
})

describe('getSessionId', () => {
  it('generates a valid UUID v4 format', () => {
    const id = getSessionId()
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
  })

  it('returns the same ID on subsequent calls', () => {
    const id1 = getSessionId()
    const id2 = getSessionId()
    expect(id1).toBe(id2)
  })

  it('persists the session ID in sessionStorage', () => {
    const id = getSessionId()
    expect(sessionStorage.getItem('otelverse_session_id')).toBe(id)
  })

  it('returns an existing session ID from sessionStorage', () => {
    sessionStorage.setItem('otelverse_session_id', 'test-session-id')
    expect(getSessionId()).toBe('test-session-id')
  })
})
