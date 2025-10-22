import { useState, useRef, useEffect } from 'react';
import type { SlideElement } from '@shared/schema';
import { Card } from '@/components/ui/card';

interface SlideCanvasProps {
  elements: SlideElement[];
  onElementUpdate?: (elementId: string, updates: Partial<SlideElement>) => void;
  isEditable?: boolean;
}

interface DragState {
  elementId: string;
  startX: number;
  startY: number;
  startElementX: number;
  startElementY: number;
}

interface ResizeState {
  elementId: string;
  corner: 'nw' | 'ne' | 'sw' | 'se';
  startX: number;
  startY: number;
  startElementX: number;
  startElementY: number;
  startElementWidth: number;
  startElementHeight: number;
}

export function SlideCanvas({ elements = [], onElementUpdate, isEditable = false }: SlideCanvasProps) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (!isEditable || !canvasRef.current) return;
    
    e.stopPropagation();
    setSelectedElementId(elementId);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setDragState({
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: element.x,
      startElementY: element.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, elementId: string, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    if (!isEditable || !canvasRef.current) return;
    
    e.stopPropagation();
    setSelectedElementId(elementId);
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setResizeState({
      elementId,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: element.x,
      startElementY: element.y,
      startElementWidth: element.width,
      startElementHeight: element.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

      if (dragState) {
        const deltaX = ((e.clientX - dragState.startX) / rect.width) * 100;
        const deltaY = ((e.clientY - dragState.startY) / rect.height) * 100;
        
        const newX = Math.max(0, Math.min(100, dragState.startElementX + deltaX));
        const newY = Math.max(0, Math.min(100, dragState.startElementY + deltaY));
        
        onElementUpdate?.(dragState.elementId, { x: newX, y: newY });
      }

      if (resizeState) {
        const deltaX = ((e.clientX - resizeState.startX) / rect.width) * 100;
        const deltaY = ((e.clientY - resizeState.startY) / rect.height) * 100;
        
        let newX = resizeState.startElementX;
        let newY = resizeState.startElementY;
        let newWidth = resizeState.startElementWidth;
        let newHeight = resizeState.startElementHeight;

        if (resizeState.corner === 'se') {
          newWidth = Math.max(10, Math.min(100 - newX, resizeState.startElementWidth + deltaX));
          newHeight = Math.max(10, Math.min(100 - newY, resizeState.startElementHeight + deltaY));
        } else if (resizeState.corner === 'sw') {
          const widthDelta = -deltaX;
          newWidth = Math.max(10, resizeState.startElementWidth + widthDelta);
          newX = Math.max(0, resizeState.startElementX - widthDelta);
          newHeight = Math.max(10, Math.min(100 - newY, resizeState.startElementHeight + deltaY));
        } else if (resizeState.corner === 'ne') {
          newWidth = Math.max(10, Math.min(100 - newX, resizeState.startElementWidth + deltaX));
          const heightDelta = -deltaY;
          newHeight = Math.max(10, resizeState.startElementHeight + heightDelta);
          newY = Math.max(0, resizeState.startElementY - heightDelta);
        } else if (resizeState.corner === 'nw') {
          const widthDelta = -deltaX;
          newWidth = Math.max(10, resizeState.startElementWidth + widthDelta);
          newX = Math.max(0, resizeState.startElementX - widthDelta);
          const heightDelta = -deltaY;
          newHeight = Math.max(10, resizeState.startElementHeight + heightDelta);
          newY = Math.max(0, resizeState.startElementY - heightDelta);
        }
        
        onElementUpdate?.(resizeState.elementId, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
      setResizeState(null);
    };

    if (dragState || resizeState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, resizeState, onElementUpdate]);

  const handleCanvasClick = () => {
    if (isEditable) {
      setSelectedElementId(null);
    }
  };

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full bg-background"
      style={{ aspectRatio: '16 / 9' }}
      onClick={handleCanvasClick}
      data-testid="slide-canvas"
    >
      {elements.map((element) => {
        if (element.type === 'image') {
          const isSelected = selectedElementId === element.id && isEditable;
          
          return (
            <div
              key={element.id}
              className={`absolute ${isEditable ? 'cursor-move' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: `${element.width}%`,
                height: `${element.height}%`,
                zIndex: element.zIndex,
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              data-testid={`element-${element.id}`}
            >
              <img
                src={element.src}
                alt="Slide element"
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              
              {isSelected && (
                <>
                  <div
                    className="absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-nw-resize"
                    onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'nw')}
                    data-testid={`resize-nw-${element.id}`}
                  />
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-ne-resize"
                    onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'ne')}
                    data-testid={`resize-ne-${element.id}`}
                  />
                  <div
                    className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-sw-resize"
                    onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'sw')}
                    data-testid={`resize-sw-${element.id}`}
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-se-resize"
                    onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'se')}
                    data-testid={`resize-se-${element.id}`}
                  />
                </>
              )}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
