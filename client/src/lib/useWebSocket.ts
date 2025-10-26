import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { PresentationSession, Slide, Reaction } from '@shared/schema';

interface UseWebSocketOptions {
  onSessionJoined?: (data: { session: PresentationSession; currentSlide: Slide; slides: Slide[]; participantId?: string }) => void;
  onSlideChanged?: (data: { slideIndex: number; slide: Slide }) => void;
  onNewResponse?: (data: { response: any; slideId: string; totalResponses: number }) => void;
  onParticipantCount?: (count: number) => void;
  onSessionUpdate?: (session: PresentationSession) => void;
  onSessionEnded?: () => void;
  onReactionsUpdated?: (data: { slideId: string; reactions: Reaction[] }) => void;
  onEmojiSent?: (data: { emoji: string; participantId?: string }) => void;
  onError?: (error: string) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);

  // Keep options ref up to date
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    console.log('[Socket.IO] Connecting to server...');
    
    const socket = io({
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      withCredentials: true
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

    socket.on('session_joined', (data: { session: PresentationSession; currentSlide: Slide; slides: Slide[]; participantId?: string }) => {
      console.log('[Socket.IO] Session joined:', data);
      if (data.participantId) {
        setParticipantId(data.participantId);
      }
      optionsRef.current.onSessionJoined?.(data);
    });

    socket.on('slide_changed', (data: { slideIndex: number; slide: Slide }) => {
      console.log('[Socket.IO] Slide changed:', data);
      optionsRef.current.onSlideChanged?.(data);
    });

    socket.on('new_response', (data: { response: any; slideId: string; totalResponses: number }) => {
      console.log('[Socket.IO] New response:', data);
      optionsRef.current.onNewResponse?.(data);
    });

    socket.on('participant_count', (data: { count: number }) => {
      console.log('[Socket.IO] Participant count:', data.count);
      optionsRef.current.onParticipantCount?.(data.count);
    });

    socket.on('session_update', (data: { session: PresentationSession }) => {
      console.log('[Socket.IO] Session update:', data);
      optionsRef.current.onSessionUpdate?.(data.session);
    });

    socket.on('session_ended', () => {
      console.log('[Socket.IO] Session ended');
      optionsRef.current.onSessionEnded?.();
    });

    socket.on('reactions_updated', (data: { slideId: string; reactions: Reaction[] }) => {
      console.log('[Socket.IO] Reactions updated:', data);
      optionsRef.current.onReactionsUpdated?.(data);
    });

    socket.on('emoji_sent', (data: { emoji: string; participantId?: string }) => {
      console.log('[Socket.IO] Emoji sent:', data);
      optionsRef.current.onEmojiSent?.(data);
    });

    socket.on('error', (data: { message: string }) => {
      console.error('[Socket.IO] Error:', data.message);
      optionsRef.current.onError?.(data.message);
    });

    return () => {
      console.log('[Socket.IO] Disconnecting...');
      socket.disconnect();
    };
  }, []);

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

  const sendEmoji = useCallback((emoji: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_emoji', { emoji });
    }
  }, []);

  return {
    isConnected,
    participantId,
    joinSession,
    submitResponse,
    navigateSlide,
    sendEmoji
  };
}
