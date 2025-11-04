import { useRef, useEffect, useState, useCallback } from "react";
import type { AnnotationData, AnnotationToolType } from "@shared/schema";

interface DrawingCanvasProps {
  annotations: AnnotationData[];
  activeTool: AnnotationToolType | null;
  activeColor: string;
  isDrawingMode: boolean;
  onAnnotationAdd: (annotation: AnnotationData) => void;
}

export default function DrawingCanvas({
  annotations,
  activeTool,
  activeColor,
  isDrawingMode,
  onAnnotationAdd,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);

  // Normalize coordinates to 0-1 range (percentage)
  const normalizeCoordinate = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    return {
      x: x / canvas.width,
      y: y / canvas.height,
    };
  };

  // Denormalize coordinates from 0-1 range to pixels
  const denormalizeCoordinate = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    return {
      x: x * canvas.width,
      y: y * canvas.height,
    };
  };

  // Get coordinates relative to canvas
  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0]?.clientX || 0;
      clientY = e.touches[0]?.clientY || 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Render all annotations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render each annotation (denormalize coordinates for current canvas size)
    annotations.forEach((annotation) => {
      if (annotation.type === "pen" || annotation.type === "highlighter" || annotation.type === "eraser") {
        // Draw path
        if (annotation.points.length < 2) return;

        // Denormalize all points
        const denormalizedPoints = annotation.points.map(p => denormalizeCoordinate(p.x, p.y));

        ctx.beginPath();
        ctx.moveTo(denormalizedPoints[0].x, denormalizedPoints[0].y);

        for (let i = 1; i < denormalizedPoints.length; i++) {
          ctx.lineTo(denormalizedPoints[i].x, denormalizedPoints[i].y);
        }

        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = annotation.strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (annotation.type === "highlighter") {
          ctx.globalAlpha = 0.3;
        } else if (annotation.type === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
        }

        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      } else if (annotation.type === "rectangle") {
        // Denormalize coordinates
        const start = denormalizeCoordinate(annotation.startX, annotation.startY);
        const end = denormalizeCoordinate(annotation.endX, annotation.endY);
        const width = end.x - start.x;
        const height = end.y - start.y;

        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = annotation.strokeWidth;

        if (annotation.fillColor) {
          ctx.fillStyle = annotation.fillColor;
          ctx.fillRect(start.x, start.y, width, height);
        }

        ctx.strokeRect(start.x, start.y, width, height);
      } else if (annotation.type === "circle") {
        // Denormalize coordinates
        const start = denormalizeCoordinate(annotation.startX, annotation.startY);
        const end = denormalizeCoordinate(annotation.endX, annotation.endY);
        
        const radiusX = Math.abs(end.x - start.x) / 2;
        const radiusY = Math.abs(end.y - start.y) / 2;
        const centerX = start.x + (end.x - start.x) / 2;
        const centerY = start.y + (end.y - start.y) / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = annotation.strokeWidth;

        if (annotation.fillColor) {
          ctx.fillStyle = annotation.fillColor;
          ctx.fill();
        }

        ctx.stroke();
      } else if (annotation.type === "line") {
        // Denormalize coordinates
        const start = denormalizeCoordinate(annotation.startX, annotation.startY);
        const end = denormalizeCoordinate(annotation.endX, annotation.endY);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);

        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = annotation.strokeWidth;
        ctx.lineCap = "round";

        ctx.stroke();
      } else if (annotation.type === "arrow") {
        // Denormalize coordinates
        const start = denormalizeCoordinate(annotation.startX, annotation.startY);
        const end = denormalizeCoordinate(annotation.endX, annotation.endY);
        
        const headLength = 15;
        const angle = Math.atan2(end.y - start.y, end.x - start.x);

        // Draw line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);

        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = annotation.strokeWidth;
        ctx.lineCap = "round";

        ctx.stroke();

        // Draw arrow head
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle - Math.PI / 6),
          end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle + Math.PI / 6),
          end.y - headLength * Math.sin(angle + Math.PI / 6)
        );

        ctx.stroke();
      } else if (annotation.type === "text") {
        // Denormalize coordinates
        const pos = denormalizeCoordinate(annotation.x, annotation.y);
        
        ctx.font = `${annotation.fontSize}px Arial`;
        ctx.fillStyle = annotation.color;
        ctx.fillText(annotation.content, pos.x, pos.y);
      }
    });
  }, [annotations]);

  // Render current drawing in progress
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isDrawing || !activeTool) return;

    const strokeWidth = activeTool === "highlighter" ? 12 : activeTool === "pen" ? 2 : 10;

    if ((activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser") && currentPath.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);

      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }

      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (activeTool === "highlighter") {
        ctx.globalAlpha = 0.3;
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (startPoint && currentPath.length > 0) {
      const endPoint = currentPath[currentPath.length - 1];

      if (activeTool === "rectangle") {
        const width = endPoint.x - startPoint.x;
        const height = endPoint.y - startPoint.y;

        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
      } else if (activeTool === "circle") {
        const radiusX = Math.abs(endPoint.x - startPoint.x) / 2;
        const radiusY = Math.abs(endPoint.y - startPoint.y) / 2;
        const centerX = startPoint.x + (endPoint.x - startPoint.x) / 2;
        const centerY = startPoint.y + (endPoint.y - startPoint.y) / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (activeTool === "line") {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);

        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      } else if (activeTool === "arrow") {
        const headLength = 15;
        const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);

        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);

        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(endPoint.x, endPoint.y);
        ctx.lineTo(
          endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
          endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endPoint.x, endPoint.y);
        ctx.lineTo(
          endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
          endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
        );

        ctx.stroke();
      }
    }
  }, [isDrawing, currentPath, startPoint, activeTool, activeColor]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDrawingMode || !activeTool) return;

    const point = getCanvasCoordinates(e);

    if (activeTool === "text") {
      setTextInput({ x: point.x, y: point.y, content: "" });
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPath([point]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !activeTool) return;

    const point = getCanvasCoordinates(e);
    setCurrentPath((prev) => [...prev, point]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !activeTool) return;

    const strokeWidth = activeTool === "highlighter" ? 12 : activeTool === "pen" ? 2 : 10;

    if (activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser") {
      if (currentPath.length > 0) {
        // Normalize all points to 0-1 range
        const normalizedPoints = currentPath.map(p => normalizeCoordinate(p.x, p.y));
        
        onAnnotationAdd({
          type: activeTool,
          id: `${activeTool}-${Date.now()}`,
          points: normalizedPoints,
          color: activeColor,
          strokeWidth,
        });
      }
    } else if (startPoint && currentPath.length > 0) {
      const endPoint = currentPath[currentPath.length - 1];

      if (activeTool === "rectangle" || activeTool === "circle" || activeTool === "line" || activeTool === "arrow") {
        // Normalize start and end points to 0-1 range
        const normalizedStart = normalizeCoordinate(startPoint.x, startPoint.y);
        const normalizedEnd = normalizeCoordinate(endPoint.x, endPoint.y);
        
        onAnnotationAdd({
          type: activeTool,
          id: `${activeTool}-${Date.now()}`,
          startX: normalizedStart.x,
          startY: normalizedStart.y,
          endX: normalizedEnd.x,
          endY: normalizedEnd.y,
          color: activeColor,
          strokeWidth: 2,
        });
      }
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setStartPoint(null);
  };

  const handleTextSubmit = () => {
    if (textInput && textInput.content.trim()) {
      // Normalize text position to 0-1 range
      const normalizedPos = normalizeCoordinate(textInput.x, textInput.y);
      
      onAnnotationAdd({
        type: "text",
        id: `text-${Date.now()}`,
        content: textInput.content,
        x: normalizedPos.x,
        y: normalizedPos.y,
        color: activeColor,
        fontSize: 24,
      });
    }
    setTextInput(null);
  };

  // Resize canvas to match parent
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (!canvas || !overlayCanvas) return;

      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      overlayCanvas.width = parent.clientWidth;
      overlayCanvas.height = parent.clientHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        data-testid="drawing-canvas"
      />
      <canvas
        ref={overlayCanvasRef}
        className={`absolute inset-0 ${isDrawingMode ? "pointer-events-auto cursor-crosshair" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => handleMouseDown(e as any)}
        onTouchMove={(e) => handleMouseMove(e as any)}
        onTouchEnd={handleMouseUp}
        data-testid="drawing-overlay"
      />

      {/* Text Input Modal */}
      {textInput && (
        <div
          className="absolute bg-background border rounded-md p-2 shadow-lg"
          style={{
            left: textInput.x,
            top: textInput.y,
            zIndex: 100,
            pointerEvents: "auto",
          }}
          data-testid="text-input-modal"
        >
          <input
            type="text"
            autoFocus
            value={textInput.content}
            onChange={(e) => setTextInput({ ...textInput, content: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTextSubmit();
              if (e.key === "Escape") setTextInput(null);
            }}
            className="border rounded px-2 py-1 text-sm"
            placeholder="Enter text..."
            data-testid="input-annotation-text"
          />
          <div className="flex gap-1 mt-1">
            <button
              onClick={handleTextSubmit}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover-elevate"
              data-testid="button-text-submit"
            >
              Add
            </button>
            <button
              onClick={() => setTextInput(null)}
              className="px-2 py-1 text-xs border rounded hover-elevate"
              data-testid="button-text-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
