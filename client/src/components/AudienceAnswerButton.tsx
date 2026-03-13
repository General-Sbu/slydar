import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface AudienceAnswerButtonProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export default function AudienceAnswerButton({ 
  label, 
  selected = false, 
  disabled = false,
  compact = false,
  onClick 
}: AudienceAnswerButtonProps) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      size="lg"
      className={`w-full h-auto font-medium relative justify-start ${compact ? 'py-2.5 text-sm sm:text-base' : 'py-6 text-lg'}`}
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-answer-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {selected && (
        <Check className={`mr-2 flex-shrink-0 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
      )}
      <span className="flex-1 text-left">{label}</span>
    </Button>
  );
}
