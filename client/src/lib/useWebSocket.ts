import { useEffect, useRef, useState, useCallback } from 'react';
import type { Session, Slide } from '@shared/schema';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onSessionJoined?: (data: { session: Session; currentSlide: Slide; slides: Slide[]; participantId?: string }) => void;
  onSlideChanged?: (data: { slideIndex: number; slide: Slide }) => void;
  onNewResponse?: (data: { response: any; slideId: string; totalResponses: number }) => void;
  onParticipantCount?: (count: number) => void;
  onSessionUpdate?: (session: Session) => void;
  onSessionEnded?: () => void;
  onError?: (error: string) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        options.onMessage?.(message);

        switch (message.type) {
          case 'session_joined':
            if (message.participantId) {
              setParticipantId(message.participantId);
            }
            options.onSessionJoined?.(message as any);
            break;
          case 'slide_changed':
            options.onSlideChanged?.(message as any);
            break;
          case 'new_response':
            options.onNewResponse?.(message as any);
            break;
          case 'participant_count':
            options.onParticipantCount?.(message.count);
            break;
          case 'session_update':
            options.onSessionUpdate?.(message.session);
            break;
          case 'session_ended':
            options.onSessionEnded?.();
            break;
          case 'error':
            options.onError?.(message.message);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, [options]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const joinSession = useCallback((code: string, role: 'presenter' | 'audience', participantId?: string) => {
    send({ type: 'join_session', code, role, participantId });
  }, [send]);

  const submitResponse = useCallback((slideId: string, answer: string) => {
    send({ type: 'submit_response', slideId, answer });
  }, [send]);

  const navigateSlide = useCallback((slideIndex: number) => {
    send({ type: 'navigate_slide', slideIndex });
  }, [send]);

  return {
    isConnected,
    participantId,
    joinSession,
    submitResponse,
    navigateSlide,
    send
  };
}
