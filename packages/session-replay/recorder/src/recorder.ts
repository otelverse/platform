import { record } from 'rrweb';
import { getSessionId } from '@otelverse/web';

export interface RecorderConfig {
  uploadUrl: string;
  flushIntervalMs?: number;
  maskText?: boolean;
  maskImages?: boolean;
}

export class SessionRecorder {
  private config: Required<RecorderConfig>;
  private events: any[] = [];
  private stopFn?: () => void;
  private intervalId?: any;

  constructor(config: RecorderConfig) {
    this.config = {
      uploadUrl: config.uploadUrl,
      flushIntervalMs: config.flushIntervalMs || 5000,
      maskText: config.maskText ?? true,
      maskImages: config.maskImages ?? true,
    };
  }

  public start() {
    if (this.stopFn) return; // already started

    this.stopFn = record({
      emit: (event) => {
        this.events.push(event);
      },
      maskTextClass: this.config.maskText ? '.*' : undefined, // mask all text by default
      maskTextSelector: this.config.maskText ? '*' : undefined,
      maskAllInputs: true,
      // Further privacy configuration can be added here
    });

    this.intervalId = setInterval(() => {
      this.flush();
    }, this.config.flushIntervalMs);

    window.addEventListener('beforeunload', () => this.flush());
    window.addEventListener('error', () => this.flush());
  }

  public stop() {
    if (this.stopFn) {
      this.stopFn();
      this.stopFn = undefined;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.flush();
  }

  private async flush() {
    if (this.events.length === 0) return;

    const currentEvents = [...this.events];
    this.events = [];

    const sessionId = getSessionId();
    if (!sessionId) return;

    const payload = {
      sessionId,
      events: currentEvents,
      timestamp: Date.now(),
      href: window.location.href,
    };

    try {
      // Using fetch with keepalive ensures it finishes even if the page unloads
      await fetch(this.config.uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (e) {
      console.error('Failed to upload session replay events', e);
      // Re-queue events on failure
      this.events = [...currentEvents, ...this.events];
    }
  }
}

export function startReplay(config: RecorderConfig): SessionRecorder {
  const recorder = new SessionRecorder(config);
  recorder.start();
  return recorder;
}
