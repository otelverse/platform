import React, { useEffect, useRef } from 'react';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';

export interface SessionReplayPlayerProps {
  events: any[];
  width?: number;
  height?: number;
}

export const SessionReplayPlayer: React.FC<SessionReplayPlayerProps> = ({
  events,
  width = 800,
  height = 600,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (events.length < 2) return; // rrweb needs at least 2 events

    if (containerRef.current) {
      playerRef.current = new rrwebPlayer({
        target: containerRef.current,
        props: {
          events,
          width,
          height,
          autoPlay: true,
        },
      });
    }

    return () => {
      // Clean up player instance on unmount if rrweb-player supports it
      if (playerRef.current) {
        // The DOM node is cleared automatically by React, but we can pause it
        playerRef.current.pause();
      }
    };
  }, [events, width, height]);

  if (!events || events.length < 2) {
    return <div className="p-4 text-gray-500">Not enough session events to replay.</div>;
  }

  return (
    <div
      ref={containerRef}
      className="session-replay-player border border-gray-300 rounded overflow-hidden shadow-lg"
      style={{ width, height }}
    />
  );
};
