import { SessionRecorder } from '../src/recorder';

// Mock rrweb
jest.mock('rrweb', () => ({
  record: jest.fn().mockImplementation(({ emit }) => {
    // Simulate emitting an event
    setTimeout(() => emit({ type: 2, data: {} }), 10);
    return jest.fn(); // stop function
  }),
}));

// Mock @otelverse/web
jest.mock('@otelverse/web', () => ({
  getSessionId: jest.fn().mockReturnValue('test-session-123'),
}));

describe('SessionRecorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn().mockResolvedValue({});
  });

  it('should start recording and flush events', (done) => {
    const recorder = new SessionRecorder({
      uploadUrl: 'http://localhost/upload',
      flushIntervalMs: 100, // flush quickly
    });

    recorder.start();

    // After flush interval, it should have flushed
    setTimeout(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      const callArgs = (globalThis.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe('http://localhost/upload');
      
      const payload = JSON.parse(callArgs[1].body);
      expect(payload.sessionId).toBe('test-session-123');
      expect(payload.events.length).toBeGreaterThan(0);
      
      recorder.stop();
      done();
    }, 150);
  });
});
