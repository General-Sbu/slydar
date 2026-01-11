import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type { TextElement } from "@shared/schema";

interface TextFormatToolbarProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
}

const fontFamilies = [
  { value: "Inter", label: "Inter" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Arial", label: "Arial" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
];

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96, 128];

export default function TextFormatToolbar({ element, onUpdate }: TextFormatToolbarProps) {
  const isBold = element.fontWeight === "bold";
  const isItalic = element.fontStyle === "italic";
  const isUnderline = element.textDecoration === "underline";
  const isStrikethrough = element.textDecoration === "line-through";

  const preventBlur = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className="absolute -top-14 left-0 right-0 flex items-center justify-center z-50"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={preventBlur}
      onPointerDown={preventBlur}
    >
      <div className="flex items-center gap-1 bg-popover border border-border rounded-lg shadow-lg p-1.5">
        <Select
          value={element.fontFamily || "Inter"}
          onValueChange={(value) => onUpdate({ fontFamily: value as TextElement["fontFamily"] })}
        >
          <SelectTrigger 
            className="w-[110px] h-8 text-xs" 
            data-testid="select-font-family"
            onPointerDown={preventBlur}
          >
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
            {fontFamilies.map((font) => (
              <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(element.fontSize || 32)}
          onValueChange={(value) => onUpdate({ fontSize: parseInt(value, 10) })}
        >
          <SelectTrigger 
            className="w-[70px] h-8 text-xs" 
            data-testid="select-font-size"
            onPointerDown={preventBlur}
          >
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
            {fontSizes.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant={isBold ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdate({ fontWeight: isBold ? "normal" : "bold" })}
          data-testid="button-bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          variant={isItalic ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdate({ fontStyle: isItalic ? "normal" : "italic" })}
          data-testid="button-italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant={isUnderline ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdate({ textDecoration: isUnderline ? "none" : "underline" })}
          data-testid="button-underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Button
          variant={isStrikethrough ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdate({ textDecoration: isStrikethrough ? "none" : "line-through" })}
          data-testid="button-strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant={element.textAlign === "left" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdate({ textAlign: "left" })}
          data-testid="button-align-left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          variant={element.textAlign === "center" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdate({ textAlign: "center" })}
          data-testid="button-align-center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          variant={element.textAlign === "right" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdate({ textAlign: "right" })}
          data-testid="button-align-right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
