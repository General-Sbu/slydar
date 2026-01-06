import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Play, Users, Calendar, Trash2, Edit2, BarChart3, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  onRename?: (newName: string) => void;
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
  onAnalytics,
  onRename
}: PresentationCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newName, setNewName] = useState(title);

  const handleRename = () => {
    if (newName.trim() && newName !== title) {
      onRename?.(newName.trim());
    }
    setShowRenameDialog(false);
  };

  const handleDelete = () => {
    onDelete?.();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="border-0 bg-card/50 hover:bg-card transition-smooth hover-lift group overflow-hidden">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-semibold tracking-tight truncate">{title}</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs">
                  <Calendar className="h-3.5 w-3.5" />
                  {lastEdited}
                </span>
                <span className="text-xs">{slideCount} slides</span>
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-smooth"
                  data-testid="button-more-options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem onClick={onEdit} data-testid="menu-item-edit">
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowRenameDialog(true)} data-testid="menu-item-rename">
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Rename</span>
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
            <Badge variant="default" className="w-fit gap-1.5">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              Live
            </Badge>
          )}
        </CardHeader>

        <CardFooter className="flex flex-wrap items-center gap-3 pt-0">
          <Button 
            variant="default" 
            size="sm"
            className="gap-2 transition-smooth"
            data-testid="button-present"
            onClick={onPresent}
          >
            <Play className="h-4 w-4" />
            Present
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="transition-smooth"
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

      <Dialog open={showRenameDialog} onOpenChange={(open) => {
        setShowRenameDialog(open);
        if (!open) setNewName(title);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Presentation</DialogTitle>
            <DialogDescription>
              Enter a new name for your presentation.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Presentation name"
            data-testid="input-rename-presentation"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)} data-testid="button-cancel-rename">
              Cancel
            </Button>
            <Button 
              onClick={handleRename}
              disabled={!newName.trim() || newName === title}
              data-testid="button-confirm-rename"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
