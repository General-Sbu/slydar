import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SlideTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function SlideTypeCard({ icon: Icon, title, description, onClick }: SlideTypeCardProps) {
  return (
    <Card 
      className="cursor-pointer hover-elevate active-elevate-2 transition-all duration-200"
      onClick={onClick}
      data-testid={`card-slide-type-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardHeader className="space-y-2">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
