import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import emptyStateImage from "@assets/generated_images/Empty_state_character_illustration_1e40ba58.png";

interface EmptyStateProps {
  onCreate?: () => void;
}

export default function EmptyState({ onCreate }: EmptyStateProps = {}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <img 
        src={emptyStateImage} 
        alt="No presentations" 
        className="w-48 h-48 mb-6 opacity-80"
      />
      <h3 className="text-2xl font-semibold mb-2">No presentations yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first interactive presentation and start engaging your audience with live polls and quizzes
      </p>
      <Button 
        size="lg" 
        className="gap-2"
        data-testid="button-create-first"
        onClick={onCreate}
      >
        <PlusCircle className="h-5 w-5" />
        Create Your First Presentation
      </Button>
    </div>
  );
}
