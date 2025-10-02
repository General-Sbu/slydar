import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface AudienceAnswerButtonProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function AudienceAnswerButton({ 
  label, 
  selected = false, 
  disabled = false,
  onClick 
}: AudienceAnswerButtonProps) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      size="lg"
      className="w-full h-auto py-6 text-lg font-medium relative justify-start"
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-answer-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {selected && (
        <Check className="h-5 w-5 mr-2 flex-shrink-0" />
      )}
      <span className="flex-1 text-left">{label}</span>
    </Button>
  );
}
