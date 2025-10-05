import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Logo from "@/components/Logo";
import AudienceAnswerButton from "@/components/AudienceAnswerButton";
import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Check, Loader2, StickyNote, Save } from "lucide-react";
import { useWebSocket } from "@/lib/useWebSocket";
import type { Slide, PresentationSession, Note } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Audience() {
  const [, params] = useRoute("/audience/:code");
  const { toast } = useToast();
  const roomCode = params?.code?.toUpperCase();

  const [session, setSession] = useState<PresentationSession | null>(null);
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const { user, isAuthenticated } = useAuth();

  const { data: existingNote } = useQuery<Note | null>({
    queryKey: ['/api/notes/slide', currentSlide?.id],
    enabled: isAuthenticated && !!currentSlide?.id,
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentSlide || !session) throw new Error("No slide or session");
      const res = await apiRequest('POST', '/api/notes', {
        slideId: currentSlide.id,
        presentationId: session.presentationId,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes/slide', currentSlide?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setIsSavingNote(false);
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      });
    },
    onError: () => {
      setIsSavingNote(false);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    },
  });

  const { isConnected, joinSession, submitResponse } = useWebSocket({
    onSessionJoined: (data) => {
      setSession(data.session);
      setCurrentSlide(data.currentSlide);
      setParticipantId(data.participantId || null);
      setSubmitted(false);
      setSelectedAnswer(null);
      setTextAnswer("");
    },
    onSlideChanged: (data) => {
      setCurrentSlide(data.slide);
      setSubmitted(false);
      setSelectedAnswer(null);
      setTextAnswer("");
    },
    onSessionEnded: () => {
      toast({
        title: "Session ended",
        description: "The presentation has been closed by the presenter"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (roomCode && isConnected && !session) {
      const storedParticipantId = localStorage.getItem(`participant_${roomCode}`);
      joinSession(roomCode, 'audience', storedParticipantId || undefined);
    }
  }, [roomCode, isConnected, session]);

  useEffect(() => {
    if (participantId && roomCode) {
      localStorage.setItem(`participant_${roomCode}`, participantId);
    }
  }, [participantId, roomCode]);

  useEffect(() => {
    if (existingNote) {
      setNoteContent(existingNote.content);
    } else if (currentSlide) {
      setNoteContent("");
    }
  }, [existingNote, currentSlide]);

  const handleSaveNote = () => {
    if (noteContent.trim() && currentSlide) {
      setIsSavingNote(true);
      saveNoteMutation.mutate(noteContent.trim());
    }
  };

  const handleMultipleChoiceAnswer = (answer: string) => {
    if (!submitted && currentSlide) {
      setSelectedAnswer(answer);
      submitResponse(currentSlide.id, answer);
      setSubmitted(true);
    }
  };

  const handleTextSubmit = () => {
    if (textAnswer.trim() && currentSlide) {
      submitResponse(currentSlide.id, textAnswer.trim());
      setSubmitted(true);
    }
  };

  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Invalid room code</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !session || !currentSlide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <Logo size="sm" />
              <div className="text-sm text-muted-foreground">
                Room: <span className="font-mono font-semibold">{roomCode}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Connecting...</h2>
                <p className="text-muted-foreground">
                  Joining presentation
                </p>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Logo size="sm" />
            <div className="text-sm text-muted-foreground">
              Room: <span className="font-mono font-semibold" data-testid="text-room-code">{session.code}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentSlide.type === 'heading' ? (
          <Card className="p-12 text-center">
            <h1 className="text-4xl font-bold">{currentSlide.question || "Heading"}</h1>
          </Card>
        ) : currentSlide.type === 'image' ? (
          <Card className="p-0 overflow-hidden">
            <img 
              src={currentSlide.question || ''} 
              alt="Presentation slide" 
              className="w-full h-auto"
              data-testid="img-slide"
            />
          </Card>
        ) : submitted ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Response Submitted!</h2>
                <p className="text-muted-foreground">
                  Waiting for the next question...
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold" data-testid="text-question">
                {currentSlide.question || "Question"}
              </h1>
              {currentSlide.type === 'multiple_choice' && (
                <p className="text-muted-foreground">Select one option</p>
              )}
              {(currentSlide.type === 'open_ended' || currentSlide.type === 'word_cloud') && (
                <p className="text-muted-foreground">Type your answer below</p>
              )}
            </div>

            {currentSlide.type === 'multiple_choice' && currentSlide.options && (
              <div className="grid gap-3">
                {currentSlide.options.map((option, index) => (
                  <AudienceAnswerButton
                    key={index}
                    label={option}
                    selected={selectedAnswer === option}
                    onClick={() => handleMultipleChoiceAnswer(option)}
                    data-testid={`button-option-${index}`}
                  />
                ))}
              </div>
            )}

            {(currentSlide.type === 'open_ended' || currentSlide.type === 'word_cloud') && (
              <div className="space-y-4">
                <Input
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder={currentSlide.type === 'word_cloud' ? 'Enter a word or phrase...' : 'Type your answer...'}
                  className="text-lg h-14"
                  data-testid="input-text-answer"
                  onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                />
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleTextSubmit}
                  disabled={!textAnswer.trim()}
                  data-testid="button-submit-text"
                >
                  Submit Response
                </Button>
              </div>
            )}
          </div>
        )}

        {isAuthenticated && currentSlide && (
          <Card className="mt-6 p-6">
            <div className="flex items-center gap-2 mb-4">
              <StickyNote className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">My Notes</h3>
            </div>
            <div className="space-y-3">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Take notes on this slide..."
                className="min-h-[120px] resize-none"
                data-testid="textarea-note"
              />
              <Button
                onClick={handleSaveNote}
                disabled={!noteContent.trim() || isSavingNote}
                className="w-full"
                data-testid="button-save-note"
              >
                {isSavingNote ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Note
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
