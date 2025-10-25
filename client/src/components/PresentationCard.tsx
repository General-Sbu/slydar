import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Play, Users, Calendar, Trash2, Edit2, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

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
  onAnalytics?: () => void;
}

export default function PresentationCard({
  title,
  slideCount,
  participantCount = 0,
  lastEdited,
  isLive = false,
  onEdit,
  onDelete,
  onPresent,
  onAnalytics
}: PresentationCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete?.();
    setShowDeleteDialog(false);
  };

  return (
    <>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  data-testid="button-more-options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit} data-testid="menu-item-edit">
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onAnalytics} data-testid="menu-item-analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                  data-testid="menu-item-delete"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Presentation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{title}"? This action cannot be undone and will permanently delete the presentation and all its slides.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
