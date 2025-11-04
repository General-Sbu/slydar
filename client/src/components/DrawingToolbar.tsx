import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Pen,
  Highlighter,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Type,
  Trash2
} from "lucide-react";
import { AnnotationToolType } from "@shared/schema";

interface DrawingToolbarProps {
  activeTool: AnnotationToolType | null;
  activeColor: string;
  isDrawingMode: boolean;
  onToolSelect: (tool: AnnotationToolType) => void;
  onColorSelect: (color: string) => void;
  onToggleDrawingMode: () => void;
  onClearAnnotations: () => void;
}

const DRAWING_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#000000", // black
  "#ffffff", // white
];

export default function DrawingToolbar({
  activeTool,
  activeColor,
  isDrawingMode,
  onToolSelect,
  onColorSelect,
  onToggleDrawingMode,
  onClearAnnotations,
}: DrawingToolbarProps) {
  const tools: Array<{ type: AnnotationToolType; icon: any; label: string }> = [
    { type: "pen", icon: Pen, label: "Pen" },
    { type: "highlighter", icon: Highlighter, label: "Highlighter" },
    { type: "eraser", icon: Eraser, label: "Eraser" },
    { type: "rectangle", icon: Square, label: "Rectangle" },
    { type: "circle", icon: Circle, label: "Circle" },
    { type: "arrow", icon: ArrowRight, label: "Arrow" },
    { type: "line", icon: Minus, label: "Line" },
    { type: "text", icon: Type, label: "Text" },
  ];

  return (
    <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 p-2 shadow-lg">
      <div className="flex items-center gap-2">
        {/* Toggle Drawing Mode */}
        <Button
          variant={isDrawingMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleDrawingMode}
          data-testid="button-toggle-drawing"
          className="gap-2"
        >
          <Pen className="h-4 w-4" />
          {isDrawingMode ? "Drawing" : "Draw"}
        </Button>

        {isDrawingMode && (
          <>
            <div className="h-6 w-px bg-border" />

            {/* Drawing Tools */}
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.type}
                  variant={activeTool === tool.type ? "default" : "ghost"}
                  size="icon"
                  onClick={() => onToolSelect(tool.type)}
                  data-testid={`button-tool-${tool.type}`}
                  title={tool.label}
                  className="h-9 w-9"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}

            <div className="h-6 w-px bg-border" />

            {/* Color Palette */}
            <div className="flex gap-1" data-testid="color-palette">
              {DRAWING_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorSelect(color)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    activeColor === color ? "border-primary scale-110" : "border-border"
                  } transition-all hover-elevate`}
                  style={{ backgroundColor: color }}
                  data-testid={`button-color-${color}`}
                  title={color}
                />
              ))}
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Clear Annotations */}
            <Button
              variant="outline"
              size="icon"
              onClick={onClearAnnotations}
              data-testid="button-clear-annotations"
              title="Clear All Annotations"
              className="h-9 w-9"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
