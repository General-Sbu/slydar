import { useRef, useState, useCallback, type ReactNode, type TouchEvent as ReactTouchEvent } from "react";

interface Touch {
  clientX: number;
  clientY: number;
}

interface PinchZoomContainerProps {
  children: ReactNode;
  className?: string;
  minScale?: number;
  maxScale?: number;
}

export default function PinchZoomContainer({
  children,
  className = "",
  minScale = 1,
  maxScale = 4,
}: PinchZoomContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastDistanceRef = useRef<number | null>(null);
  const isPinchingRef = useRef(false);

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const handleTouchStart = useCallback((e: ReactTouchEvent) => {
    if (e.touches.length === 2) {
      isPinchingRef.current = true;
      lastDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      lastTouchRef.current = center;
    } else if (e.touches.length === 1 && scale > 1) {
      lastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: ReactTouchEvent) => {
    if (e.touches.length === 2 && lastDistanceRef.current !== null) {
      e.preventDefault();
      const newDistance = getDistance(e.touches[0], e.touches[1]);
      const scaleChange = newDistance / lastDistanceRef.current;
      
      setScale((prevScale) => {
        const newScale = Math.min(maxScale, Math.max(minScale, prevScale * scaleChange));
        return newScale;
      });
      
      lastDistanceRef.current = newDistance;
    } else if (e.touches.length === 1 && scale > 1 && lastTouchRef.current && !isPinchingRef.current) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - lastTouchRef.current.x;
      const deltaY = e.touches[0].clientY - lastTouchRef.current.y;
      
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const maxTranslateX = (rect.width * (scale - 1)) / 2;
        const maxTranslateY = (rect.height * (scale - 1)) / 2;
        
        setTranslateX((prev) => Math.min(maxTranslateX, Math.max(-maxTranslateX, prev + deltaX)));
        setTranslateY((prev) => Math.min(maxTranslateY, Math.max(-maxTranslateY, prev + deltaY)));
      }
      
      lastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }, [scale, minScale, maxScale]);

  const handleTouchEnd = useCallback((e: ReactTouchEvent) => {
    if (e.touches.length < 2) {
      isPinchingRef.current = false;
      lastDistanceRef.current = null;
    }
    if (e.touches.length === 0) {
      lastTouchRef.current = null;
    }
    if (e.touches.length === 1) {
      lastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }, []);

  const handleDoubleTap = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
    } else {
      setScale(2);
    }
  }, [scale]);

  const lastTapRef = useRef<number>(0);
  
  const handleTap = useCallback((e: ReactTouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    
    if (timeDiff < 300 && timeDiff > 0) {
      handleDoubleTap();
    }
    
    lastTapRef.current = now;
  }, [handleDoubleTap]);

  return (
    <div
      ref={containerRef}
      className={`touch-none overflow-hidden ${className}`}
      onTouchStart={(e) => {
        handleTouchStart(e);
        handleTap(e);
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-testid="pinch-zoom-container"
    >
      <div
        style={{
          transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
          transformOrigin: "center center",
          transition: isPinchingRef.current ? "none" : "transform 0.1s ease-out",
        }}
      >
        {children}
      </div>
      {scale > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
}
