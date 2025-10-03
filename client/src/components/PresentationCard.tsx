import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Play, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PresentationCardProps {
  id: string;
  title: string;
  slideCount: number;
  participantCount?: number;
  lastEdited: string;
  isLive?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPresent?: () => void;
}

export default function PresentationCard({
  title,
  slideCount,
  participantCount = 0,
  lastEdited,
  isLive = false,
  onEdit,
  onDelete,
  onPresent
}: PresentationCardProps) {
  return (
    <Card className="hover-elevate transition-all duration-200 group">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl truncate">{title}</CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {lastEdited}
              </span>
              <span>{slideCount} slides</span>
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            data-testid="button-more-options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {isLive && (
          <Badge variant="default" className="w-fit gap-1">
            <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            Live
          </Badge>
        )}
      </CardHeader>

      <CardFooter className="flex flex-wrap items-center gap-3">
        <Button 
          variant="default" 
          size="sm"
          className="gap-2"
          data-testid="button-present"
          onClick={onPresent}
        >
          <Play className="h-4 w-4" />
          Present
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          data-testid="button-edit"
          onClick={onEdit}
        >
          Edit
        </Button>
        {participantCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
            <Users className="h-4 w-4" />
            {participantCount}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
