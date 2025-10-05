import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Note, Presentation, Slide } from "@shared/schema";
import { StickyNote, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface NoteWithDetails extends Note {
  presentation?: Presentation;
  slide?: Slide;
}

export default function Notes() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
    enabled: isAuthenticated,
  });

  const { data: presentations } = useQuery<Presentation[]>({
    queryKey: ['/api/presentations'],
    enabled: isAuthenticated && !!notes && notes.length > 0,
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await apiRequest('DELETE', `/api/notes/${noteId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: "Note deleted",
        description: "Your note has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const notesWithDetails: NoteWithDetails[] = notes?.map(note => {
    const presentation = presentations?.find(p => p.id === note.presentationId);
    return { ...note, presentation };
  }) || [];

  const groupedNotes = notesWithDetails.reduce((acc, note) => {
    const key = note.presentationId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(note);
    return acc;
  }, {} as Record<string, NoteWithDetails[]>);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <StickyNote className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Login Required</h2>
            <p className="text-muted-foreground">
              You need to be logged in to view your notes
            </p>
            <Button onClick={() => setLocation('/login')} data-testid="button-login">
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">My Notes</h1>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8" data-testid="text-page-title">My Notes</h1>
          <Card className="p-12">
            <div className="text-center space-y-4">
              <StickyNote className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold">No notes yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start taking notes during presentations to keep track of important information.
                Your notes will appear here.
              </p>
              <Button onClick={() => setLocation('/dashboard')} data-testid="button-dashboard">
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8" data-testid="text-page-title">My Notes</h1>
        
        <div className="space-y-8">
          {Object.entries(groupedNotes).map(([presentationId, presentationNotes]) => {
            const presentation = presentationNotes[0]?.presentation;
            return (
              <div key={presentationId} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold" data-testid={`text-presentation-${presentationId}`}>
                    {presentation?.title || 'Unknown Presentation'}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {presentationNotes.length} {presentationNotes.length === 1 ? 'note' : 'notes'}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {presentationNotes.map((note) => (
                    <Card key={note.id} data-testid={`card-note-${note.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap" data-testid={`text-note-content-${note.id}`}>
                          {note.content}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNoteMutation.mutate(note.id)}
                          disabled={deleteNoteMutation.isPending}
                          data-testid={`button-delete-note-${note.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
