import { useState, useRef, useEffect } from 'react';
import type { SlideElement, TextElement } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

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

interface RotateState {
  elementId: string;
  startAngle: number;
  startRotation: number;
  centerX: number;
  centerY: number;
}

export function SlideCanvas({ elements = [], onElementUpdate, isEditable = false }: SlideCanvasProps) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [rotateState, setRotateState] = useState<RotateState | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextContent, setEditingTextContent] = useState<string>('');
  const canvasRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (clientX: number, clientY: number, elementId: string) => {
    if (!isEditable || !canvasRef.current) return;
    
    setSelectedElementId(elementId);
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setDragState({
      elementId,
      startX: clientX,
      startY: clientY,
      startElementX: element.x,
      startElementY: element.y,
    });
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    handlePointerDown(e.clientX, e.clientY, elementId);
  };

  const handleTouchStart = (e: React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent scrolling while dragging
    if (e.touches.length > 0) {
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, elementId);
    }
  };

  const handleResizePointerDown = (clientX: number, clientY: number, elementId: string, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    if (!isEditable || !canvasRef.current) return;
    
    setSelectedElementId(elementId);
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setResizeState({
      elementId,
      corner,
      startX: clientX,
      startY: clientY,
      startElementX: element.x,
      startElementY: element.y,
      startElementWidth: element.width || 50, // Default width if not set
      startElementHeight: element.type === 'text' ? 0 : (element.height || 30),
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, elementId: string, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    e.stopPropagation();
    handleResizePointerDown(e.clientX, e.clientY, elementId, corner);
  };

  const handleResizeTouchStart = (e: React.TouchEvent, elementId: string, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    e.stopPropagation();
    e.preventDefault(); // Prevent scrolling while resizing
    if (e.touches.length > 0) {
      handleResizePointerDown(e.touches[0].clientX, e.touches[0].clientY, elementId, corner);
    }
  };

  const handleRotatePointerDown = (clientX: number, clientY: number, elementId: string) => {
    if (!isEditable || !canvasRef.current) return;
    
    setSelectedElementId(elementId);
    
    const element = elements.find(el => el.id === elementId);
    if (!element || element.type !== 'text') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const elementCenterX = rect.left + (rect.width * (element.x + element.width / 2) / 100);
    const elementCenterY = rect.top + (rect.height * (element.y + 10) / 100); // Approximate center

    const startAngle = Math.atan2(clientY - elementCenterY, clientX - elementCenterX) * (180 / Math.PI);

    setRotateState({
      elementId,
      startAngle,
      startRotation: element.rotation || 0,
      centerX: elementCenterX,
      centerY: elementCenterY,
    });
  };

  const handleRotateMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    handleRotatePointerDown(e.clientX, e.clientY, elementId);
  };

  const handleRotateTouchStart = (e: React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.touches.length > 0) {
      handleRotatePointerDown(e.touches[0].clientX, e.touches[0].clientY, elementId);
    }
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

      if (dragState) {
        const deltaX = ((clientX - dragState.startX) / rect.width) * 100;
        const deltaY = ((clientY - dragState.startY) / rect.height) * 100;
        
        const newX = Math.max(0, Math.min(100, dragState.startElementX + deltaX));
        const newY = Math.max(0, Math.min(100, dragState.startElementY + deltaY));
        
        onElementUpdate?.(dragState.elementId, { x: newX, y: newY });
      }

      if (resizeState) {
        const element = elements.find(el => el.id === resizeState.elementId);
        
        if (element?.type === 'text') {
          // For text elements, resize changes font size and width based on corner
          const deltaX = ((clientX - resizeState.startX) / rect.width) * 100;
          const currentElement = element;
          
          let newX = resizeState.startElementX;
          let newWidth = resizeState.startElementWidth;
          
          // Ensure we have a valid starting width to avoid NaN
          if (resizeState.startElementWidth <= 0) {
            console.warn('Invalid startElementWidth, skipping resize');
            return;
          }
          
          // Handle different corners for text resizing
          if (resizeState.corner === 'se') {
            // Southeast: increase width to the right
            newWidth = Math.max(10, Math.min(100 - newX, resizeState.startElementWidth + deltaX));
          } else if (resizeState.corner === 'sw') {
            // Southwest: increase width to the left
            const widthDelta = -deltaX;
            newWidth = Math.max(10, resizeState.startElementWidth + widthDelta);
            newX = Math.max(0, Math.min(resizeState.startElementX - widthDelta, 100 - 10));
          } else if (resizeState.corner === 'ne') {
            // Northeast: increase width to the right
            newWidth = Math.max(10, Math.min(100 - newX, resizeState.startElementWidth + deltaX));
          } else if (resizeState.corner === 'nw') {
            // Northwest: increase width to the left
            const widthDelta = -deltaX;
            newWidth = Math.max(10, resizeState.startElementWidth + widthDelta);
            newX = Math.max(0, Math.min(resizeState.startElementX - widthDelta, 100 - 10));
          }
          
          // Calculate font size change based on width change
          const widthRatio = newWidth / resizeState.startElementWidth;
          const newFontSize = Math.max(12, Math.min(200, Math.round(currentElement.fontSize * widthRatio)));
          
          onElementUpdate?.(resizeState.elementId, {
            x: newX,
            width: newWidth,
            fontSize: newFontSize,
          });
        } else {
          // For image elements, resize changes dimensions
          const deltaX = ((clientX - resizeState.startX) / rect.width) * 100;
          const deltaY = ((clientY - resizeState.startY) / rect.height) * 100;
          
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
      }

      if (rotateState) {
        const currentAngle = Math.atan2(clientY - rotateState.centerY, clientX - rotateState.centerX) * (180 / Math.PI);
        const angleDelta = currentAngle - rotateState.startAngle;
        let newRotation = rotateState.startRotation + angleDelta;
        
        // Normalize to 0-360 range
        newRotation = ((newRotation % 360) + 360) % 360;
        
        onElementUpdate?.(rotateState.elementId, {
          rotation: Math.round(newRotation),
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setDragState(null);
      setResizeState(null);
      setRotateState(null);
    };

    if (dragState || resizeState || rotateState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [dragState, resizeState, rotateState, onElementUpdate, elements]);

  const handleCanvasClick = () => {
    if (isEditable) {
      setSelectedElementId(null);
    }
  };

  const handleTextDoubleClick = (element: TextElement) => {
    if (!isEditable) return;
    setEditingTextId(element.id);
    setEditingTextContent(element.content);
  };

  const handleTextEditBlur = () => {
    if (editingTextId && editingTextContent !== undefined) {
      onElementUpdate?.(editingTextId, { content: editingTextContent });
    }
    setEditingTextId(null);
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
        const isSelected = selectedElementId === element.id && isEditable;
        
        if (element.type === 'image') {
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
              onTouchStart={(e) => handleTouchStart(e, element.id)}
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
                    className="absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-nw-resize touch-none"
                    onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'nw')}
                    onTouchStart={(e) => handleResizeTouchStart(e, element.id, 'nw')}
                    data-testid={`resize-nw-${element.id}`}
                  />
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-ne-resize touch-none"
                    onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'ne')}
                    onTouchStart={(e) => handleResizeTouchStart(e, element.id, 'ne')}
                    data-testid={`resize-ne-${element.id}`}
                  />
                  <div
                    className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-sw-resize touch-none"
                    onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'sw')}
                    onTouchStart={(e) => handleResizeTouchStart(e, element.id, 'sw')}
                    data-testid={`resize-sw-${element.id}`}
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-se-resize touch-none"
                    onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'se')}
                    onTouchStart={(e) => handleResizeTouchStart(e, element.id, 'se')}
                    data-testid={`resize-se-${element.id}`}
                  />
                </>
              )}
            </div>
          );
        }
        
        if (element.type === 'text') {
          const isEditingThis = editingTextId === element.id;
          
          return (
            <div
              key={element.id}
              className={`absolute ${isEditable && !isEditingThis ? 'cursor-move' : ''} ${isSelected ? 'ring-2 ring-primary' : ''} select-none`}
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: `${element.width}%`,
                zIndex: element.zIndex,
                fontSize: `${element.fontSize}px`,
                fontWeight: element.fontWeight,
                textAlign: element.textAlign,
                color: element.color || 'inherit',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                transform: `rotate(${element.rotation || 0}deg)`,
                transformOrigin: 'center center',
              }}
              onClick={(e) => {
                if (!isEditingThis && isEditable) {
                  e.stopPropagation();
                  setSelectedElementId(element.id);
                }
              }}
              onMouseDown={(e) => !isEditingThis && handleMouseDown(e, element.id)}
              onTouchStart={(e) => !isEditingThis && handleTouchStart(e, element.id)}
              onDoubleClick={() => handleTextDoubleClick(element)}
              data-testid={`element-${element.id}`}
            >
              {isEditingThis ? (
                <Textarea
                  value={editingTextContent}
                  onChange={(e) => setEditingTextContent(e.target.value)}
                  onBlur={handleTextEditBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' || e.key === 'Enter') {
                      e.preventDefault();
                      handleTextEditBlur();
                    }
                  }}
                  autoFocus
                  className="w-full h-auto resize-none bg-transparent border-2 border-dashed border-primary/50 p-2"
                  style={{
                    fontSize: `${element.fontSize}px`,
                    fontWeight: element.fontWeight,
                    textAlign: element.textAlign,
                    color: element.color || 'inherit',
                    minHeight: '60px',
                  }}
                  data-testid={`textarea-edit-${element.id}`}
                />
              ) : (
                <div className="pointer-events-none">
                  {element.content}
                </div>
              )}
              
              {isSelected && !isEditingThis && (
                <>
                  {/* Rotation handle at top center */}
                  <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-accent border-2 border-background rounded-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
                    onMouseDown={(e) => handleRotateMouseDown(e, element.id)}
                    onTouchStart={(e) => handleRotateTouchStart(e, element.id)}
                    data-testid={`rotate-${element.id}`}
                  >
                    <svg className="w-4 h-4 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  {/* Resize handle at bottom right */}
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-2 border-background rounded-full cursor-se-resize touch-none"
                    onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'se')}
                    onTouchStart={(e) => handleResizeTouchStart(e, element.id, 'se')}
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
