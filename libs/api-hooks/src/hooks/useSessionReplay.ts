import { useQuery } from '@tanstack/react-query';

// In a real app this would come from a config or env var
const REPLAY_SERVICE_URL = 'http://localhost:8082';

export const useSessionReplay = (sessionId: string) => {
  return useQuery({
    queryKey: ['sessionReplay', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await fetch(`${REPLAY_SERVICE_URL}/api/v1/replay/${sessionId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch session replay events');
      }
      return res.json();
    },
    enabled: !!sessionId,
  });
};

export const useSessionList = (limit = 20) => {
  return useQuery({
    queryKey: ['sessionList', limit],
    queryFn: async () => {
      const res = await fetch(`${REPLAY_SERVICE_URL}/api/v1/replay/sessions?limit=${limit}`);
      if (!res.ok) {
        throw new Error('Failed to fetch sessions');
      }
      return res.json();
    },
  });
};
