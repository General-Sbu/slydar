import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Type } from "lucide-react";
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

export default function TextFormatToolbar({ element, onUpdate }: TextFormatToolbarProps) {
  const isBold = element.fontWeight === "bold";
  const isItalic = element.fontStyle === "italic";
  const isUnderline = element.textDecoration === "underline";
  const isStrikethrough = element.textDecoration === "line-through";

  return (
    <div 
      className="absolute -top-14 left-0 right-0 flex items-center justify-center z-50"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex items-center gap-1 bg-popover border border-border rounded-lg shadow-lg p-1.5">
        <Select
          value={element.fontFamily || "Inter"}
          onValueChange={(value) => onUpdate({ fontFamily: value as TextElement["fontFamily"] })}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs" data-testid="select-font-family">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
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
