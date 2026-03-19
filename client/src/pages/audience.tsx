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
import { Check, X, Loader2, StickyNote, Save, FileText, Trash2, Download, Users } from "lucide-react";
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
  const [allSlides, setAllSlides] = useState<Slide[]>([]);
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
  const [allowDownload, setAllowDownload] = useState(false);
  const [attendanceName, setAttendanceName] = useState("");
  const [attendanceSurname, setAttendanceSurname] = useState("");
  const [attendanceCertified, setAttendanceCertified] = useState(false);
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);
  const [externalSpin, setExternalSpin] = useState<{ winnerIdx: number; targetRotation: number; entries: any[] } | null>(null);

  const { user, isAuthenticated } = useAuth();

  const { data: existingNote } = useQuery<Note | null>({
    queryKey: currentSlide?.id ? [`/api/notes/slide/${currentSlide.id}`] : [],
    enabled: isAuthenticated && !!currentSlide?.id,
  });

  const { data: presentationNotes = [] } = useQuery<Note[]>({
    queryKey: session?.presentationId ? ['/api/notes/presentation', session.presentationId] : [],
    enabled: isAuthenticated && !!session?.presentationId,
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
      if (session?.presentationId) {
        queryClient.invalidateQueries({ queryKey: ['/api/notes/presentation', session.presentationId] });
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

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await apiRequest('DELETE', `/api/notes/${noteId}`);
    },
    onSuccess: () => {
      if (currentSlide?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/notes/slide/${currentSlide.id}`] });
      }
      if (session?.presentationId) {
        queryClient.invalidateQueries({ queryKey: ['/api/notes/presentation', session.presentationId] });
      }
      showNotification("Note deleted", "success");
    },
    onError: () => {
      showNotification("Failed to delete note", "error");
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
      setAllSlides(data.slides || []);
      setParticipantId(data.participantId || null);
      setAllowDownload(!!data.session.allowDownload);
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
      setExternalSpin(null);
      setAttendanceName("");
      setAttendanceSurname("");
      setAttendanceCertified(false);
      setAttendanceSubmitted(false);
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
    onDownloadToggle: (data: { allowDownload: boolean }) => {
      setAllowDownload(data.allowDownload);
    },
    onSpinnerSpin: (data: { winnerIdx: number; targetRotation: number; entries: any[] }) => {
      setExternalSpin({ ...data });
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

  const handleAttendanceSubmit = () => {
    if (!currentSlide || attendanceSubmitted || !attendanceName.trim() || !attendanceSurname.trim() || !attendanceCertified) return;
    const record = JSON.stringify({ firstName: attendanceName.trim(), lastName: attendanceSurname.trim(), certified: true });
    submitResponse(currentSlide.id, record);
    setAttendanceSubmitted(true);
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
          <div className="flex h-14 items-center justify-between gap-4">
            <Logo size="sm" />
            <div className="flex items-center gap-3 flex-wrap">
              {allowDownload && session && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open(`/api/sessions/${session.id}/download/pptx`, '_blank');
                  }}
                  data-testid="button-download-slides"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Download
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                Room: <span className="font-mono font-semibold" data-testid="text-room-code">{session.code}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {((currentSlide.config as any)?.isJoinSlide || currentSlide.title === '__join_slide__') ? (
          <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">You're in!</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-sm">
              The presenter will begin shortly. Sit tight!
            </p>
          </div>
        ) : currentSlide.type === 'heading' ? (
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
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold">{currentSlide.question || currentSlide.title || ""}</h1>
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
        ) : currentSlide.type === 'attendance' ? (
          <Card className="p-4 sm:p-6 min-h-[800px] sm:min-h-0" data-testid="card-slide">
            <div className="space-y-4 sm:space-y-5">
              <div>
                <h2 className="text-xs sm:text-base md:text-lg font-semibold sm:font-bold mb-0.5 leading-snug">
                  {currentSlide.question || 'Please Confirm Your Attendance'}
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Enter your details below</p>
              </div>

              {attendanceSubmitted ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1">Attendance Confirmed!</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Your attendance has been recorded. Thank you!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium block" htmlFor="attendance-first-name">
                      First Name
                    </label>
                    <Input
                      id="attendance-first-name"
                      value={attendanceName}
                      onChange={(e) => setAttendanceName(e.target.value)}
                      placeholder="Enter your first name"
                      className="h-9 sm:h-10 text-sm sm:text-base"
                      data-testid="input-attendance-name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium block" htmlFor="attendance-surname">
                      Last Name / Surname
                    </label>
                    <Input
                      id="attendance-surname"
                      value={attendanceSurname}
                      onChange={(e) => setAttendanceSurname(e.target.value)}
                      placeholder="Enter your last name / surname"
                      className="h-9 sm:h-10 text-sm sm:text-base"
                      data-testid="input-attendance-surname"
                    />
                  </div>
                  <label
                    className="flex items-start gap-2.5 cursor-pointer pt-0.5"
                    data-testid="label-attendance-certified"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 rounded border-input accent-primary cursor-pointer"
                      checked={attendanceCertified}
                      onChange={(e) => setAttendanceCertified(e.target.checked)}
                      data-testid="checkbox-attendance-certified"
                    />
                    <span className="text-xs text-muted-foreground leading-snug">
                      I certify that the above information is correct and that I am attending this session.
                    </span>
                  </label>
                  <Button
                    className="w-full"
                    onClick={handleAttendanceSubmit}
                    disabled={!attendanceName.trim() || !attendanceSurname.trim() || !attendanceCertified}
                    data-testid="button-submit-attendance"
                  >
                    Confirm Attendance
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ) : submitted ? (
          <Card className="p-8 sm:p-12 text-center relative overflow-visible min-h-[50vh] md:min-h-[60vh] flex items-center justify-center">
            {currentSlide.type === 'select_answer' ? (() => {
              const correctIdx = currentSlide.config?.correctAnswer ?? 0;
              const correctOption = currentSlide.options?.[correctIdx as number] ?? '';
              const isCorrect = selectedAnswer === correctOption;
              return (
                <div className="flex flex-col items-center gap-4 relative z-10">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {isCorrect
                      ? <Check className="h-10 w-10 text-green-500" />
                      : <X className="h-10 w-10 text-red-500" />
                    }
                  </div>
                  <div className="space-y-2">
                    <h2 className={`text-2xl sm:text-3xl font-bold ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isCorrect ? 'Correct!' : 'Wrong!'}
                    </h2>
                    {!isCorrect && (
                      <p className="text-sm sm:text-base text-muted-foreground">
                        The correct answer was: <span className="font-semibold text-foreground">{correctOption}</span>
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">Waiting for the next question...</p>
                  </div>
                </div>
              );
            })() : (
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
            )}
            <DrawingCanvas
              annotations={annotations}
              activeTool="pen"
              activeColor="#000000"
              isDrawingMode={false}
              onAnnotationAdd={() => {}}
            />
          </Card>
        ) : (currentSlide.type === 'multiple_choice' || currentSlide.type === 'poll') ? (
          <div className="flex flex-col gap-4 -mx-4 sm:-mx-6 lg:-mx-8 px-3 sm:px-5 lg:px-6" data-testid="card-slide">
            <div className="rounded-xl border bg-card px-5 py-5 sm:px-7 sm:py-6 shadow-sm text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug">
                {currentSlide.question || 'Your question here'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                {currentSlide.type === 'poll' ? 'Cast your vote' : 'Select the correct answer'}
              </p>
            </div>
            {currentSlide.options && currentSlide.options.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {currentSlide.options.map((option, index) => {
                  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                  const isSelected = selectedAnswer === option;
                  const colorMap = [
                    { bg: 'bg-blue-500/10', border: 'border-blue-400', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-500' },
                    { bg: 'bg-orange-500/10', border: 'border-orange-400', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-500' },
                    { bg: 'bg-purple-500/10', border: 'border-purple-400', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-500' },
                    { bg: 'bg-green-500/10', border: 'border-green-400', text: 'text-green-700 dark:text-green-300', badge: 'bg-green-500' },
                    { bg: 'bg-pink-500/10', border: 'border-pink-400', text: 'text-pink-700 dark:text-pink-300', badge: 'bg-pink-500' },
                    { bg: 'bg-yellow-500/10', border: 'border-yellow-400', text: 'text-yellow-700 dark:text-yellow-300', badge: 'bg-yellow-500' },
                  ];
                  const c = colorMap[index % colorMap.length];
                  return (
                    <button
                      key={index}
                      onClick={() => handleMultipleChoiceAnswer(option)}
                      data-testid={`button-option-${index}`}
                      style={{ minHeight: '185px' }}
                      className={[
                        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 w-full',
                        'font-semibold text-base sm:text-lg text-center transition-all duration-150 active:scale-95',
                        isSelected
                          ? 'border-green-500 bg-green-500/15 text-green-700 dark:text-green-300'
                          : `${c.bg} ${c.border} ${c.text}`,
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          'text-base font-bold text-white shrink-0',
                          isSelected ? 'bg-green-500' : c.badge,
                        ].join(' ')}
                      >
                        {letters[index]}
                      </span>
                      <span className="leading-snug break-words w-full">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : currentSlide.type === 'select_answer' ? (
          <div className="flex flex-col gap-4 -mx-4 sm:-mx-6 lg:-mx-8 px-3 sm:px-5 lg:px-6" data-testid="card-slide">
            <div className="rounded-xl border bg-card px-5 py-5 sm:px-7 sm:py-6 shadow-sm text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug">
                {currentSlide.question || 'Select the correct answer'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Tap to select your answer
              </p>
            </div>
            {currentSlide.options && currentSlide.options.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {currentSlide.options.map((option, index) => {
                  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                  const isSelected = selectedAnswer === option;
                  const colorMap = [
                    { bg: 'bg-blue-500/10', border: 'border-blue-400', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-500' },
                    { bg: 'bg-orange-500/10', border: 'border-orange-400', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-500' },
                    { bg: 'bg-purple-500/10', border: 'border-purple-400', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-500' },
                    { bg: 'bg-green-500/10', border: 'border-green-400', text: 'text-green-700 dark:text-green-300', badge: 'bg-green-500' },
                    { bg: 'bg-pink-500/10', border: 'border-pink-400', text: 'text-pink-700 dark:text-pink-300', badge: 'bg-pink-500' },
                    { bg: 'bg-yellow-500/10', border: 'border-yellow-400', text: 'text-yellow-700 dark:text-yellow-300', badge: 'bg-yellow-500' },
                  ];
                  const c = colorMap[index % colorMap.length];
                  return (
                    <button
                      key={index}
                      onClick={() => handleMultipleChoiceAnswer(option)}
                      data-testid={`button-option-${index}`}
                      style={{ minHeight: '185px' }}
                      className={[
                        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 w-full',
                        'font-semibold text-base sm:text-lg text-center transition-all duration-150 active:scale-95',
                        isSelected
                          ? 'border-green-500 bg-green-500/15 text-green-700 dark:text-green-300'
                          : `${c.bg} ${c.border} ${c.text}`,
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          'text-base font-bold text-white shrink-0',
                          isSelected ? 'bg-green-500' : c.badge,
                        ].join(' ')}
                      >
                        {letters[index]}
                      </span>
                      <span className="leading-snug break-words w-full">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <Card className="p-6 sm:p-8 relative overflow-visible min-h-[50vh] md:min-h-[60vh]" data-testid="card-slide">
            <div className="space-y-6 sm:space-y-8 relative z-10">
              {currentSlide.type === 'open_ended' && (
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{currentSlide.question || 'Your question here'}</h2>
                </div>
              )}
              {currentSlide.type === 'word_cloud' && (() => {
                const wcQuestion = currentSlide.question
                  || (currentSlide.config as any)?.elements?.find((el: any) => el.type === 'text')?.content
                  || '';
                const wcPlaceholders = ['Ask your question here', 'Your Word Cloud question here', 'Question', ''];
                const showQuestion = wcQuestion && !wcPlaceholders.includes(wcQuestion.trim());
                return (
                  <div className="text-center">
                    {showQuestion && (
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">{wcQuestion}</h2>
                    )}
                    <p className="text-sm sm:text-base text-muted-foreground">Enter a word or phrase</p>
                  </div>
                );
              })()}

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
                    externalSpin={externalSpin}
                  />
                  {!externalSpin && (
                    <p className="text-muted-foreground mt-4 text-center">
                      The presenter will spin the wheel
                    </p>
                  )}
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

        {currentSlide && currentSlide.type !== 'word_cloud' && currentSlide.type !== 'spinner' && currentSlide.type !== 'attendance' && currentSlide.type !== 'select_answer' && session && participantId && (
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

        {currentSlide && currentSlide.type !== 'word_cloud' && currentSlide.type !== 'spinner' && currentSlide.type !== 'attendance' && currentSlide.type !== 'select_answer' && session && (
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

        {currentSlide && currentSlide.type !== 'word_cloud' && currentSlide.type !== 'spinner' && currentSlide.type !== 'attendance' && currentSlide.type !== 'poll' && currentSlide.type !== 'multiple_choice' && currentSlide.type !== 'select_answer' && session && participantId && (
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

        {currentSlide && currentSlide.type !== 'word_cloud' && currentSlide.type !== 'spinner' && currentSlide.type !== 'attendance' && currentSlide.type !== 'poll' && currentSlide.type !== 'multiple_choice' && currentSlide.type !== 'select_answer' && session && participantId && (
          <div className="mt-6">
            <AudienceQA sessionId={session.id} participantId={participantId} />
          </div>
        )}

        {isAuthenticated && currentSlide && currentSlide.type !== 'poll' && currentSlide.type !== 'multiple_choice' && currentSlide.type !== 'select_answer' && (
          <Card className="mt-6 p-6" data-testid="card-notes-section">
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

            {presentationNotes.length > 0 && (
              <div className="mt-6 border-t pt-4" data-testid="saved-notes-list">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">Saved Notes ({presentationNotes.length})</h4>
                </div>
                <div className="space-y-3">
                  {presentationNotes.map((savedNote) => {
                    const slideIndex = allSlides.findIndex(s => s.id === savedNote.slideId);
                    const slide = allSlides.find(s => s.id === savedNote.slideId);
                    const slideLabel = slideIndex >= 0 
                      ? `Slide ${slideIndex + 1}${slide?.question ? ` - ${slide.question.substring(0, 40)}${slide.question.length > 40 ? '...' : ''}` : ''}`
                      : 'Unknown slide';
                    const isCurrentSlideNote = savedNote.slideId === currentSlide?.id;

                    return (
                      <div 
                        key={savedNote.id} 
                        className={`p-3 rounded-md border text-sm ${isCurrentSlideNote ? 'border-primary/30 bg-primary/5' : 'bg-muted/30'}`}
                        data-testid={`saved-note-${savedNote.id}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`text-xs font-medium ${isCurrentSlideNote ? 'text-primary' : 'text-muted-foreground'}`} data-testid={`note-slide-label-${savedNote.id}`}>
                            {slideLabel}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={() => deleteNoteMutation.mutate(savedNote.id)}
                            disabled={deleteNoteMutation.isPending}
                            data-testid={`button-delete-note-${savedNote.id}`}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap" data-testid={`note-content-${savedNote.id}`}>{savedNote.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        )}
      </main>
      <FloatingEmojis emojis={floatingEmojis} />
    </div>
  );
}
