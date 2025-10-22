import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Eye, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LibraryCardProps {
  id: string;
  title: string;
  slideCount: number;
  presenterName: string;
  lastEdited: string;
  isOwner: boolean;
  onPresent: () => void;
  onView: () => void;
}

export default function LibraryCard({
  title,
  slideCount,
  presenterName,
  lastEdited,
  isOwner,
  onPresent,
  onView
}: LibraryCardProps) {
  return (
    <Card className="hover-elevate transition-all duration-200" data-testid="library-card">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl truncate">{title}</CardTitle>
              {isOwner && (
                <Badge variant="secondary" data-testid="badge-owner">
                  Yours
                </Badge>
              )}
            </div>
            <CardDescription className="space-y-1">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{presenterName}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {lastEdited}
                </span>
                <span>{slideCount} slides</span>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="flex flex-wrap items-center gap-3">
        {isOwner ? (
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
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
            data-testid="button-view"
            onClick={onView}
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
