import { getSessionId } from '@otelverse/web'

export function useSession(): { sessionId: string } {
  const sessionId = getSessionId()
  return { sessionId }
}
