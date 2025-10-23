import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Save } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useNotification } from "@/hooks/useNotification";
import type { Note } from "@shared/schema";

interface PresenterNotesProps {
  slideId: string;
  presentationId: string;
}

export default function PresenterNotes({ slideId, presentationId }: PresenterNotesProps) {
  const { showNotification } = useNotification();
  const [noteContent, setNoteContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: note } = useQuery<Note | null>({
    queryKey: ['/api/notes/slide', slideId],
    enabled: !!slideId,
  });

  useEffect(() => {
    if (note) {
      setNoteContent(note.content);
      setHasChanges(false);
    } else {
      setNoteContent("");
      setHasChanges(false);
    }
  }, [note, slideId]);

  const saveNoteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/notes', {
        slideId,
        presentationId,
        content: noteContent,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes/slide', slideId] });
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setHasChanges(false);
      showNotification("Note saved", "success");
    },
    onError: () => {
      showNotification("Failed to save note", "error");
    },
  });

  const handleContentChange = (value: string) => {
    setNoteContent(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (noteContent.trim()) {
      saveNoteMutation.mutate();
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          <h3 className="font-semibold text-sm">Private Notes</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || saveNoteMutation.isPending}
          data-testid="button-save-note"
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
      <Textarea
        value={noteContent}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Add private notes for this slide..."
        className="min-h-24 resize-none text-sm"
        data-testid="textarea-note-content"
      />
      <p className="text-xs text-muted-foreground mt-2">
        Only visible to you
      </p>
    </Card>
  );
}
