import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Logo from "@/components/Logo";
import AudienceAnswerButton from "@/components/AudienceAnswerButton";
import SlideReactions from "@/components/SlideReactions";
import SlideWatermark from "@/components/SlideWatermark";
import { SlideCanvas } from "@/components/SlideCanvas";
import DrawingCanvas from "@/components/DrawingCanvas";
import AudienceQA from "@/components/AudienceQA";
import FloatingEmojis, { EmojiSelector } from "@/components/FloatingEmojis";
import PinchZoomContainer from "@/components/PinchZoomContainer";
import { useState, useEffect, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { Check, Loader2, StickyNote, Save } from "lucide-react";
import { useWebSocket } from "@/lib/useWebSocket";
import type { Slide, PresentationSession, Note, Feedback, Reaction, ReactionType, AnnotationData } from "@shared/schema";
import { defaultSpinnerEntries } from "@shared/schema";
import SpinnerWheel from "@/components/SpinnerWheel";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Audience() {
  const [, params] = useRoute("/audience/:code");
  const [, setLocation] = useLocation();
  const { showNotification } = useNotification();
  const roomCode = params?.code?.toUpperCase();

  const [session, setSession] = useState<PresentationSession | null>(null);
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: string; emoji: string; x: number }>>([]);
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);
  const [fillBlankAnswers, setFillBlankAnswers] = useState<Record<string, string[]>>({});
  const [fillBlankSubmitted, setFillBlankSubmitted] = useState(false);

  const { user, isAuthenticated } = useAuth();

  const { data: existingNote } = useQuery<Note | null>({
    queryKey: currentSlide?.id ? [`/api/notes/slide/${currentSlide.id}`] : [],
    enabled: isAuthenticated && !!currentSlide?.id,
  });

  const { data: reactions = [] } = useQuery<Reaction[]>({
    queryKey: currentSlide?.id && session?.id ? [`/api/slides/${currentSlide.id}/reactions/${session.id}`] : [],
    enabled: !!currentSlide?.id && !!session?.id,
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
      if (currentSlide?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/notes/slide/${currentSlide.id}`] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setIsSavingNote(false);
      showNotification("Note saved successfully", "success");
    },
    onError: () => {
      setIsSavingNote(false);
      showNotification("Failed to save note", "error");
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentSlide || !session || !participantId) throw new Error("No slide, session, or participant");
      const res = await apiRequest('POST', '/api/feedback', {
        slideId: currentSlide.id,
        sessionId: session.id,
        participantId,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      setFeedbackContent("");
      setIsSavingFeedback(false);
      showNotification("Thank you for your feedback!", "success");
    },
    onError: () => {
      setIsSavingFeedback(false);
      showNotification("Failed to submit feedback", "error");
    },
  });

  const submitReactionMutation = useMutation({
    mutationFn: async (reactionType: ReactionType) => {
      if (!currentSlide || !session || !participantId) throw new Error("No slide, session, or participant");
      const res = await apiRequest('POST', '/api/reactions', {
        slideId: currentSlide.id,
        sessionId: session.id,
        participantId,
        reactionType,
      });
      return res.json();
    },
    onSuccess: () => {
      if (currentSlide?.id && session?.id) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/slides/${currentSlide.id}/reactions/${session.id}`] 
        });
      }
    },
  });

  const websocketOptions = useMemo(() => ({
    onSessionJoined: (data: { session: PresentationSession; currentSlide: Slide; slides: Slide[]; participantId?: string }) => {
      setSession(data.session);
      setCurrentSlide(data.currentSlide);
      setParticipantId(data.participantId || null);
      setSubmitted(false);
      setSelectedAnswer(null);
      setTextAnswer("");
    },
    onSlideChanged: (data: { slideIndex: number; slide: Slide }) => {
      setCurrentSlide(data.slide);
      setSubmitted(false);
      setSelectedAnswer(null);
      setTextAnswer("");
      setFeedbackContent("");
      setAnnotations([]);
      setFillBlankAnswers({});
      setFillBlankSubmitted(false);
    },
    onReactionsUpdated: (data: { slideId: string; reactions: Reaction[] }) => {
      if (currentSlide?.id && session?.id) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/slides/${currentSlide.id}/reactions/${session.id}`] 
        });
      }
    },
    onEmojiSent: (data: { emoji: string }) => {
      const id = `${Date.now()}-${Math.random()}`;
      const x = Math.random() * 80 + 10;
      setFloatingEmojis(prev => [...prev, { id, emoji: data.emoji, x }]);
      
      setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== id));
      }, 3000);
    },
    onAnnotationAdded: (data: { annotation: AnnotationData }) => {
      console.log("[Audience] Annotation received:", data.annotation);
      setAnnotations((prev) => {
        const updated = [...prev, data.annotation];
        console.log("[Audience] Total annotations:", updated.length);
        return updated;
      });
    },
    onAnnotationsCleared: () => {
      setAnnotations([]);
    },
    onSessionEnded: () => {
      showNotification("The presentation has been closed by the presenter", "info");
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    },
    onError: (error: string) => {
      showNotification(error, "error");
    }
  }), [showNotification, currentSlide?.id, session?.id, setLocation]);

  const { isConnected, joinSession, submitResponse, sendEmoji } = useWebSocket(websocketOptions);

  useEffect(() => {
    if (roomCode && isConnected && !session) {
      const storedParticipantId = localStorage.getItem(`participant_${roomCode}`);
      joinSession(roomCode, 'audience', storedParticipantId || undefined);
    }
  }, [roomCode, isConnected, session, joinSession]);

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

  const handleSubmitFeedback = () => {
    if (feedbackContent.trim() && currentSlide && session && participantId) {
      setIsSavingFeedback(true);
      submitFeedbackMutation.mutate(feedbackContent.trim());
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

  const handleFillBlankAnswerChange = (questionIndex: number, blankIndex: number, value: string) => {
    setFillBlankAnswers(prev => {
      const key = `${questionIndex}`;
      const currentAnswers = prev[key] || [];
      const newAnswers = [...currentAnswers];
      newAnswers[blankIndex] = value;
      return { ...prev, [key]: newAnswers };
    });
  };

  const handleFillBlankSubmit = () => {
    if (!currentSlide || fillBlankSubmitted || !canSubmitFillBlank()) return;
    
    const questions = currentSlide.config?.fillBlankQuestions || [];
    const allAnswers: Array<{ questionIndex: number; answers: string[] }> = [];
    
    for (let qIdx = 0; qIdx < questions.length; qIdx++) {
      const question = questions[qIdx];
      const blankCount = (question.sentence.match(/____/g) || []).length;
      const userAnswers = fillBlankAnswers[`${qIdx}`] || [];
      const filledAnswers = userAnswers.slice(0, blankCount);
      allAnswers.push({ questionIndex: qIdx, answers: filledAnswers });
    }
    
    submitResponse(currentSlide.id, JSON.stringify(allAnswers));
    setFillBlankSubmitted(true);
  };
  
  const canSubmitFillBlank = () => {
    if (!currentSlide?.config?.fillBlankQuestions) return false;
    const questions = currentSlide.config.fillBlankQuestions;
    if (questions.length === 0) return false;
    
    for (let qIdx = 0; qIdx < questions.length; qIdx++) {
      const question = questions[qIdx];
      const sentenceBlankCount = (question.sentence.match(/____/g) || []).length;
      const configuredBlankCount = question.blanks.length;
      
      if (sentenceBlankCount !== configuredBlankCount) return false;
      
      const userAnswers = fillBlankAnswers[`${qIdx}`] || [];
      for (let i = 0; i < sentenceBlankCount; i++) {
        if (!userAnswers[i]?.trim()) return false;
      }
    }
    return true;
  };

  const handleReaction = (reactionType: ReactionType) => {
    submitReactionMutation.mutate(reactionType);
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {currentSlide.type === 'heading' ? (
          <PinchZoomContainer className="relative rounded-xl">
            <div 
              className="rounded-xl border shadow-sm text-center relative overflow-visible aspect-video"
              style={{
                backgroundColor: (typeof currentSlide?.config?.background === 'string' ? currentSlide.config.background : 'hsl(var(--card))'),
                color: (typeof currentSlide?.config?.textColor === 'string' ? currentSlide.config.textColor : 'hsl(var(--card-foreground))'),
                borderColor: 'hsl(var(--card-border))'
              }}
            >
              <div className="absolute inset-0">
                <SlideCanvas
                  elements={currentSlide?.config?.elements || []}
                  isEditable={false}
                />
              </div>
              {!currentSlide?.config?.elements?.length && (
                <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold">{currentSlide.question || "Heading"}</h1>
                </div>
              )}
              <DrawingCanvas
                annotations={annotations}
                activeTool="pen"
                activeColor="#000000"
                isDrawingMode={false}
                onAnnotationAdd={() => {}}
              />
              <SlideWatermark />
            </div>
          </PinchZoomContainer>
        ) : currentSlide.type === 'image' ? (
          <PinchZoomContainer className="relative rounded-xl">
            <Card className="p-0 overflow-visible relative aspect-video">
              <div className="absolute inset-0">
                <SlideCanvas
                  elements={currentSlide?.config?.elements || []}
                  isEditable={false}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <img 
                  src={currentSlide.question || ''} 
                  alt="Presentation slide" 
                  className="max-w-full max-h-full object-contain"
                  data-testid="img-slide"
                />
              </div>
              <DrawingCanvas
                annotations={annotations}
                activeTool="pen"
                activeColor="#000000"
                isDrawingMode={false}
                onAnnotationAdd={() => {}}
              />
              <SlideWatermark />
            </Card>
          </PinchZoomContainer>
        ) : submitted ? (
          <Card className="p-8 sm:p-12 text-center relative overflow-visible min-h-[50vh] md:min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold">Response Submitted!</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Waiting for the next question...
                </p>
              </div>
            </div>
            <DrawingCanvas
              annotations={annotations}
              activeTool="pen"
              activeColor="#000000"
              isDrawingMode={false}
              onAnnotationAdd={() => {}}
            />
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 relative overflow-visible min-h-[50vh] md:min-h-[60vh]" data-testid="card-slide">
            <div className="space-y-6 sm:space-y-8 relative z-10">
              {currentSlide.type === 'multiple_choice' && (
                <div className="text-center mb-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{currentSlide.question || 'Your question here'}</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Select one option</p>
                </div>
              )}
              {(currentSlide.type === 'open_ended' || currentSlide.type === 'word_cloud') && (
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{currentSlide.question || 'Your question here'}</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Type your answer below</p>
                </div>
              )}

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

              {currentSlide.type === 'spinner' && (
                <div className="flex flex-col items-center justify-center py-4">
                  <SpinnerWheel
                    entries={currentSlide.config?.spinnerEntries || defaultSpinnerEntries}
                    isInteractive={false}
                  />
                  <p className="text-muted-foreground mt-4 text-center">
                    The presenter will spin the wheel
                  </p>
                </div>
              )}

              {currentSlide.type === 'fill_blank' && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Fill in the Blanks</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">Complete the sentences below</p>
                  </div>
                  
                  {fillBlankSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Submitted!</h3>
                      <p className="text-muted-foreground">Your answers have been recorded.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {currentSlide.config?.fillBlankQuestions?.map((question, qIdx) => {
                        const parts = question.sentence.split('____');
                        const blanks = question.blanks || [];
                        
                        return (
                          <Card key={qIdx} className="p-4" data-testid={`card-question-${qIdx}`}>
                            <div className="flex flex-wrap items-center gap-2 text-lg">
                              {parts.map((part, pIdx) => (
                                <span key={pIdx}>
                                  {part}
                                  {pIdx < parts.length - 1 && (
                                    <Input
                                      className="inline-block w-32 mx-1 text-center"
                                      placeholder="..."
                                      value={fillBlankAnswers[`${qIdx}`]?.[pIdx] || ''}
                                      onChange={(e) => handleFillBlankAnswerChange(qIdx, pIdx, e.target.value)}
                                      data-testid={`input-blank-${qIdx}-${pIdx}`}
                                    />
                                  )}
                                </span>
                              ))}
                            </div>
                          </Card>
                        );
                      })}
                      
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={handleFillBlankSubmit}
                        disabled={!canSubmitFillBlank()}
                        data-testid="button-submit-fill-blank"
                      >
                        Submit Answers
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DrawingCanvas
              annotations={annotations}
              activeTool="pen"
              activeColor="#000000"
              isDrawingMode={false}
              onAnnotationAdd={() => {}}
            />
          </Card>
        )}

        {currentSlide && currentSlide.type !== 'word_cloud' && currentSlide.type !== 'spinner' && session && participantId && (
          <div className="mt-6">
            <SlideReactions
              slideId={currentSlide.id}
              sessionId={session.id}
              participantId={participantId}
              reactions={reactions}
              onReact={handleReaction}
            />
          </div>
        )}

        {currentSlide && currentSlide.type !== 'word_cloud' && currentSlide.type !== 'spinner' && session && (
          <Card className="mt-6 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🎉</span>
              <h3 className="font-semibold">Live Reactions</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Send real-time emoji reactions that everyone can see!
            </p>
            <EmojiSelector onEmojiSelect={sendEmoji} data-testid="emoji-selector" />
          </Card>
        )}

        {currentSlide && currentSlide.type !== 'word_cloud' && currentSlide.type !== 'spinner' && session && participantId && (
          <Card className="mt-6 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Slide Feedback</h3>
            </div>
            <div className="space-y-3">
              <Textarea
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder="Share your thoughts on this slide..."
                className="min-h-[100px] resize-none"
                data-testid="textarea-feedback"
              />
              <Button
                onClick={handleSubmitFeedback}
                disabled={!feedbackContent.trim() || isSavingFeedback}
                className="w-full"
                data-testid="button-submit-feedback"
              >
                {isSavingFeedback ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </div>
          </Card>
        )}

        {currentSlide && currentSlide.type !== 'word_cloud' && session && participantId && (
          <div className="mt-6">
            <AudienceQA sessionId={session.id} participantId={participantId} />
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
      <FloatingEmojis emojis={floatingEmojis} />
    </div>
  );
}
