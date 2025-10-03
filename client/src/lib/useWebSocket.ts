import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Session, Slide } from '@shared/schema';

interface UseWebSocketOptions {
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
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log('[Socket.IO] Connecting to server...');
    
    const socket = io({
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected');
      setIsConnected(false);
    });

    socket.on('session_joined', (data: { session: Session; currentSlide: Slide; slides: Slide[]; participantId?: string }) => {
      if (data.participantId) {
        setParticipantId(data.participantId);
      }
      options.onSessionJoined?.(data);
    });

    socket.on('slide_changed', (data: { slideIndex: number; slide: Slide }) => {
      options.onSlideChanged?.(data);
    });

    socket.on('new_response', (data: { response: any; slideId: string; totalResponses: number }) => {
      options.onNewResponse?.(data);
    });

    socket.on('participant_count', (data: { count: number }) => {
      options.onParticipantCount?.(data.count);
    });

    socket.on('session_update', (data: { session: Session }) => {
      options.onSessionUpdate?.(data.session);
    });

    socket.on('session_ended', () => {
      options.onSessionEnded?.();
    });

    socket.on('error', (data: { message: string }) => {
      console.error('[Socket.IO] Error:', data.message);
      options.onError?.(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [options.onSessionJoined, options.onSlideChanged, options.onNewResponse, options.onParticipantCount, options.onSessionUpdate, options.onSessionEnded, options.onError]);

  const joinSession = useCallback((code: string, role: 'presenter' | 'audience', participantId?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_session', { code, role, participantId });
    }
  }, []);

  const submitResponse = useCallback((slideId: string, answer: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('submit_response', { slideId, answer });
    }
  }, []);

  const navigateSlide = useCallback((slideIndex: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('navigate_slide', { slideIndex });
    }
  }, []);

  return {
    isConnected,
    participantId,
    joinSession,
    submitResponse,
    navigateSlide
  };
}
