import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RoomCodeDisplay from "@/components/RoomCodeDisplay";
import LivePollChart from "@/components/LivePollChart";
import SlideWatermark from "@/components/SlideWatermark";
import { SlideCanvas } from "@/components/SlideCanvas";
import PresentationTimer from "@/components/PresentationTimer";
import PresenterNotes from "@/components/PresenterNotes";
import UpcomingSlidePreview from "@/components/UpcomingSlidePreview";
import PresenterQA from "@/components/PresenterQA";
import FloatingEmojis from "@/components/FloatingEmojis";
import CastButton, { CastButtonRef } from "@/components/CastButton";
import DrawingToolbar from "@/components/DrawingToolbar";
import DrawingCanvas from "@/components/DrawingCanvas";
import WordCloud from "@/components/WordCloud";
import SpinnerWheel from "@/components/SpinnerWheel";
import { ChevronLeft, ChevronRight, X, Users, MessageSquare, ThumbsUp, Heart, ThumbsDown, ArrowLeft, StopCircle, Download } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Presentation, Slide, PresentationSession, Response, Feedback, Reaction, AnnotationData, AnnotationToolType } from "@shared/schema";
import { defaultSpinnerEntries } from "@shared/schema";
import { useWebSocket } from "@/lib/useWebSocket";
import { useNotification } from "@/hooks/useNotification";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export default function Presenter() {
  const [, params] = useRoute("/presenter/:id");
  const [, setLocation] = useLocation();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const presentationId = params?.id;

  const [session, setSession] = useState<PresentationSession | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [participantCount, setParticipantCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const [allResponses, setAllResponses] = useState<Response[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: string; emoji: string; x: number }>>([]);
  
  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeTool, setActiveTool] = useState<AnnotationToolType | null>(null);
  const [activeColor, setActiveColor] = useState("#ef4444");
  const [annotations, setAnnotations] = useState<AnnotationData[]>([]);
  const [activeSpinnerEntries, setActiveSpinnerEntries] = useState<typeof defaultSpinnerEntries | null>(null);
  
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const castButtonRef = useRef<CastButtonRef>(null);

  const { data: presentation, isLoading: presentationLoading } = useQuery<Presentation>({
    queryKey: ['/api/presentations', presentationId],
    enabled: !!presentationId,
  });

  const { data: slides = [], isLoading: slidesLoading } = useQuery<Slide[]>({
    queryKey: ['/api/presentations', presentationId, 'slides'],
    enabled: !!presentationId,
  });


  const { data: responses = [] } = useQuery<Response[]>({
    queryKey: ['/api/sessions', session?.id, 'responses'],
    enabled: !!session?.id,
    refetchInterval: 2000,
  });

  const { data: allFeedback = [] } = useQuery<Feedback[]>({
    queryKey: ['/api/sessions', session?.id, 'feedback'],
    enabled: !!session?.id,
    refetchInterval: 3000,
  });

  const { data: reactions = [] } = useQuery<Reaction[]>({
    queryKey: currentSlide?.id && session?.id ? [`/api/slides/${currentSlide.id}/reactions/${session.id}`] : [],
    enabled: !!currentSlide?.id && !!session?.id,
  });

  const { data: allWordCloudResponses = [] } = useQuery<Response[]>({
    queryKey: ['/api/slides', currentSlide?.id, 'responses', session?.id],
    enabled: !!currentSlide?.id && !!session?.id && currentSlide?.type === 'word_cloud',
    refetchInterval: 3000,
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentationId })
      });
      if (!res.ok) throw new Error('Failed to create session');
      return res.json();
    },
    onSuccess: (data: PresentationSession) => {
      // Reset all session-scoped state for a fresh start
      setSession(data);
      setCurrentSlideIndex(0);
      setAllResponses([]);
      setParticipantCount(0);
      setAnnotations([]);
      setFloatingEmojis([]);
      setActiveSpinnerEntries(null);
      if (slides.length > 0) {
        setCurrentSlide(slides[0]);
      }
      console.log(`🎯 ROOM CODE: ${data.code}`);
      console.log(`Join at: /audience/${data.code}`);
    },
    onError: () => {
      showNotification("Failed to start presentation", "error");
    }
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!session) return;
      const res = await fetch(`/api/sessions/${session.id}/end`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to end session');
      return res.json();
    },
    onSuccess: () => {
      setSession(null);
      setCurrentSlideIndex(0);
      showNotification("Presentation has been closed", "success");
      setLocation('/dashboard');
    }
  });

  const toggleDownloadMutation = useMutation({
    mutationFn: async () => {
      if (!session) return;
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowDownload: !session.allowDownload })
      });
      if (!res.ok) throw new Error('Failed to toggle download');
      return res.json();
    },
    onSuccess: (updatedSession: any) => {
      if (updatedSession) {
        setSession(updatedSession);
      }
    }
  });

  const { isConnected, joinSession, navigateSlide, addAnnotation, clearAnnotations: clearAnnotationsSocket } = useWebSocket({
    onSessionJoined: (data) => {
      setCurrentSlide(data.currentSlide);
    },
    onSlideChanged: (data) => {
      setCurrentSlideIndex(data.slideIndex);
      setCurrentSlide(data.slide);
      setAnnotations([]);
      setActiveSpinnerEntries(null);
    },
    onNewResponse: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', session?.id, 'responses'] });
    },
    onParticipantCount: (count) => {
      setParticipantCount(count);
    },
    onReactionsUpdated: (data) => {
      if (currentSlide?.id && session?.id) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/slides/${currentSlide.id}/reactions/${session.id}`] 
        });
      }
    },
    onEmojiSent: (data) => {
      const id = `${Date.now()}-${Math.random()}`;
      const x = Math.random() * 80 + 10;
      setFloatingEmojis(prev => [...prev, { id, emoji: data.emoji, x }]);
      
      setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== id));
      }, 3000);
    },
    onAnnotationAdded: (data) => {
      setAnnotations(prev => [...prev, data.annotation]);
    },
    onAnnotationsCleared: () => {
      setAnnotations([]);
    },
    onSessionEnded: () => {
      showNotification("Presentation has been closed", "success");
      setLocation('/dashboard');
    }
  });

  useEffect(() => {
    if (!session && presentationId && slides.length > 0 && !createSessionMutation.isPending) {
      // Always create a new session - don't reuse old ones
      // This ensures presentations start fresh from the beginning with no previous responses
      createSessionMutation.mutate();
    }
  }, [presentationId, slides, session, createSessionMutation.isPending]);

  useEffect(() => {
    if (session && isConnected) {
      joinSession(session.code, 'presenter');
    }
  }, [session, isConnected]);

  useEffect(() => {
    // Always sync allResponses with the query result
    setAllResponses(responses);
  }, [responses]);

  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(newIndex);
      navigateSlide(newIndex);
      setActiveSpinnerEntries(null);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      const newIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(newIndex);
      navigateSlide(newIndex);
      setActiveSpinnerEntries(null);
    }
  };

  const handleEndPresentation = () => {
    castButtonRef.current?.terminate();
    endSessionMutation.mutate();
  };

  const minSwipeDistance = 50;

  const handleSwipeEnd = () => {
    if (touchStartRef.current === null || touchEndRef.current === null) return;
    
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNextSlide();
    }
    if (isRightSwipe) {
      handlePreviousSlide();
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    handleSwipeEnd();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    touchEndRef.current = null;
    touchStartRef.current = e.clientX;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    touchEndRef.current = e.clientX;
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    handleSwipeEnd();
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      handleSwipeEnd();
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (touchStartRef.current !== null && touchEndRef.current !== null) {
          const distance = touchStartRef.current - touchEndRef.current;
          const isLeftSwipe = distance > minSwipeDistance;
          const isRightSwipe = distance < -minSwipeDistance;
          
          if (isLeftSwipe) {
            handleNextSlide();
          }
          if (isRightSwipe) {
            handlePreviousSlide();
          }
        }
        touchStartRef.current = null;
        touchEndRef.current = null;
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, currentSlideIndex, slides.length]);

  const slideResponses = useMemo(() => {
    if (!currentSlide) return [];
    return allResponses.filter(r => r.slideId === currentSlide.id);
  }, [allResponses, currentSlide]);

  const slideFeedback = useMemo(() => {
    if (!currentSlide) return [];
    return allFeedback.filter(f => f.slideId === currentSlide.id);
  }, [allFeedback, currentSlide]);

  const chartOptions = useMemo(() => {
    if (!currentSlide || currentSlide.type !== 'multiple_choice' || !currentSlide.options) {
      return [];
    }

    const answerCounts: Record<string, number> = {};
    currentSlide.options.forEach(opt => {
      answerCounts[opt] = 0;
    });

    slideResponses.forEach(r => {
      if (answerCounts[r.answer] !== undefined) {
        answerCounts[r.answer]++;
      }
    });

    const total = slideResponses.length || 1;
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))"
    ];

    return currentSlide.options.map((option, index) => ({
      label: option,
      votes: answerCounts[option],
      percentage: Math.round((answerCounts[option] / total) * 100),
      color: colors[index % colors.length]
    }));
  }, [currentSlide, slideResponses]);

  const recentResponses = useMemo(() => {
    return slideResponses.slice(-10).reverse();
  }, [slideResponses]);

  const reactionCounts = useMemo(() => {
    const counts = { like: 0, heart: 0, thumbs_down: 0 };
    reactions.forEach(reaction => {
      if (reaction.reactionType === 'like') counts.like++;
      else if (reaction.reactionType === 'heart') counts.heart++;
      else if (reaction.reactionType === 'thumbs_down') counts.thumbs_down++;
    });
    return counts;
  }, [reactions]);

  if (!presentationId) {
    return <div className="h-screen flex items-center justify-center">Invalid presentation ID</div>;
  }

  const isLoading = presentationLoading || slidesLoading;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="px-2 sm:px-4 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Link href={`/editor/${presentationId}`}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  data-testid="button-back-to-editor"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="font-semibold truncate hidden sm:block">{presentation?.title || 'Untitled'}</div>
              <div className="flex items-center gap-1.5 text-sm">
                <Users className="h-4 w-4" />
                <span className="font-medium" data-testid="text-participant-count">{participantCount}</span>
              </div>
              {slideFeedback.length > 0 && (
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <span>|</span>
                  <span className="font-medium" data-testid="text-feedback-count">
                    {slideFeedback.length} feedback
                  </span>
                </div>
              )}
              {session && allFeedback.length > 0 && (
                <Link href={`/feedback/${session.id}`} className="hidden lg:block">
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid="button-view-feedback"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View All Feedback
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-previous-slide"
                onClick={handlePreviousSlide}
                disabled={currentSlideIndex === 0}
                className="h-9 w-9 sm:w-auto sm:px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:ml-1">Prev</span>
              </Button>
              <span className="text-xs sm:text-sm font-medium px-1 sm:px-2" data-testid="text-slide-number">
                <span className="sm:hidden">{currentSlideIndex + 1}/{slides.length}</span>
                <span className="hidden sm:inline">Slide {currentSlideIndex + 1} / {slides.length}</span>
              </span>
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-next-slide"
                onClick={handleNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="h-9 w-9 sm:w-auto sm:px-3"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:ml-1">Next</span>
              </Button>
              {session && (
                <Button
                  variant={session.allowDownload ? "default" : "outline"}
                  size="icon"
                  onClick={() => toggleDownloadMutation.mutate()}
                  disabled={toggleDownloadMutation.isPending}
                  data-testid="button-toggle-download"
                  title={session.allowDownload ? "Downloads enabled for audience" : "Enable audience downloads"}
                  className={`toggle-elevate ${session.allowDownload ? "toggle-elevated" : ""}`}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              {session && typeof window !== 'undefined' && (
                <CastButton 
                  ref={castButtonRef}
                  presentationUrl={`${window.location.origin}/audience/${session.code}`} 
                />
              )}
              {session && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleEndPresentation}
                  disabled={endSessionMutation.isPending}
                  data-testid="button-end-presentation"
                  className="h-9"
                >
                  <StopCircle className="h-4 w-4 sm:mr-1" />
                  <span className="sr-only sm:not-sr-only">End</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-8 min-h-0 bg-background">
          <div className="w-full h-full flex items-center justify-center md:max-w-5xl md:mx-auto">
            {isLoading || !currentSlide ? (
              <Card className="p-6 md:p-12">
                <div className="text-center space-y-4">
                  <Skeleton className="h-12 w-3/4 mx-auto" />
                  <Skeleton className="h-8 w-1/2 mx-auto" />
                </div>
              </Card>
            ) : (
              <Card 
                className={`cursor-grab active:cursor-grabbing relative overflow-visible w-full ${currentSlide.type === 'image' ? 'aspect-video p-0' : currentSlide.type === 'heading' ? 'aspect-video p-4 sm:p-6 md:p-12' : 'min-h-[50vh] md:min-h-[60vh] p-4 sm:p-6 md:p-12'}`}
                style={{
                  backgroundColor: (typeof currentSlide?.config?.background === 'string' ? currentSlide.config.background : undefined),
                  color: (typeof currentSlide?.config?.textColor === 'string' ? currentSlide.config.textColor : undefined)
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                data-testid="card-slide"
              >
                {currentSlide.type === 'image' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={currentSlide.question || ''} 
                      alt={`Slide ${currentSlideIndex + 1}`} 
                      className="max-w-full max-h-full object-contain"
                      data-testid="img-slide"
                    />
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0">
                      <SlideCanvas
                        elements={currentSlide?.config?.elements || []}
                        isEditable={false}
                      />
                    </div>
                    {/* Drawing Canvas Overlay */}
                    <DrawingCanvas
                      annotations={annotations}
                      activeTool={activeTool}
                      activeColor={activeColor}
                      isDrawingMode={isDrawingMode}
                      onAnnotationAdd={(annotation) => {
                        // Only emit via Socket.IO - don't add locally to avoid duplication
                        // The socket broadcast will add it for all clients including presenter
                        addAnnotation(annotation);
                      }}
                    />
                    <div className="relative z-10">
                      {currentSlide.type === 'heading' && !currentSlide?.config?.elements?.length ? (
                        <div className="text-center">
                          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold">{currentSlide.question || currentSlide.title || ""}</h1>
                        </div>
                      ) : currentSlide.type === 'multiple_choice' && currentSlide.options ? (
                        <LivePollChart
                          question={currentSlide.question || "Question"}
                          options={chartOptions}
                          totalVotes={slideResponses.length}
                        />
                      ) : currentSlide.type === 'word_cloud' ? (
                        <WordCloud
                          question={currentSlide.question || "Question"}
                          responses={allWordCloudResponses.length > 0 ? allWordCloudResponses : slideResponses}
                        />
                      ) : currentSlide.type === 'open_ended' ? (
                        <div className="flex flex-col items-center min-h-[50vh]">
                          <div className="text-center mb-4">
                            <h2 className="text-3xl font-bold">{currentSlide.question || ''}</h2>
                            {slideResponses.length === 0 && (
                              <p className="text-muted-foreground mt-4">Waiting for responses...</p>
                            )}
                          </div>
                          {slideResponses.length > 0 && (
                            <div className="w-full max-w-4xl overflow-y-auto max-h-[40vh]">
                              <div className="columns-1 md:columns-2 gap-4 space-y-4">
                                {slideResponses.map((response, index) => (
                                  <Card key={response.id || index} className="p-4 break-inside-avoid">
                                    <p className="text-base leading-relaxed">{response.answer}</p>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : currentSlide.type === 'spinner' ? (
                        <div className="flex items-center justify-center">
                          <SpinnerWheel
                            entries={activeSpinnerEntries || currentSlide.config?.spinnerEntries || defaultSpinnerEntries}
                            isInteractive={true}
                            onRemoveWinner={(winner) => {
                              const currentEntries = activeSpinnerEntries || currentSlide.config?.spinnerEntries || defaultSpinnerEntries;
                              const filteredEntries = currentEntries.filter(e => e.id !== winner.id);
                              setActiveSpinnerEntries(filteredEntries);
                            }}
                          />
                        </div>
                      ) : currentSlide?.config?.elements?.length ? (
                        null
                      ) : (
                        <div className="text-center">
                          <h2 className="text-3xl font-bold">{currentSlide.question || currentSlide.title || ''}</h2>
                        </div>
                      )}
                    </div>
                    <SlideWatermark />
                  </>
                )}
              </Card>
            )}
          </div>
        </main>

        <aside className="w-full md:w-96 border-t md:border-t-0 md:border-l bg-muted/30 overflow-y-auto max-h-[40vh] md:max-h-none flex-shrink-0">
          <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
            {session ? (
              <RoomCodeDisplay code={session.code} participantCount={participantCount} />
            ) : (
              <Card className="p-4 md:p-6">
                <div className="text-center space-y-3">
                  <Skeleton className="h-8 w-32 mx-auto" />
                  <Skeleton className="h-12 w-48 mx-auto" />
                </div>
              </Card>
            )}
            
            {currentSlide?.type !== 'word_cloud' && currentSlide?.type !== 'multiple_choice' && currentSlide?.type !== 'open_ended' && currentSlide?.type !== 'spinner' && (
              <>
                <PresentationTimer />
                
                {currentSlide && presentationId && (
                  <PresenterNotes 
                    slideId={currentSlide.id} 
                    presentationId={presentationId}
                  />
                )}
                
                <UpcomingSlidePreview 
                  slide={currentSlideIndex < slides.length - 1 ? slides[currentSlideIndex + 1] : null}
                />
                
                <div>
                  <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Slide Reactions</h3>
                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center justify-around gap-2 sm:gap-3">
                      <div className="flex flex-col items-center gap-1" data-testid="reaction-like">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-base sm:text-lg font-semibold" data-testid="text-like-count">{reactionCounts.like}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Like</span>
                      </div>
                      <div className="flex flex-col items-center gap-1" data-testid="reaction-heart">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                          <span className="text-base sm:text-lg font-semibold" data-testid="text-heart-count">{reactionCounts.heart}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Love</span>
                      </div>
                      <div className="flex flex-col items-center gap-1" data-testid="reaction-thumbs_down">
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                          <span className="text-base sm:text-lg font-semibold" data-testid="text-thumbs_down-count">{reactionCounts.thumbs_down}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Dislike</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {session && (
                  <PresenterQA sessionId={session.id} />
                )}
              </>
            )}

            {currentSlide?.type === 'word_cloud' && (
              <div>
                <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Word Cloud Responses</h3>
                <Card className="p-3 sm:p-4 max-h-[300px] overflow-y-auto">
                  {allWordCloudResponses.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm">
                      No responses yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground mb-2">
                        {allWordCloudResponses.length} total response{allWordCloudResponses.length !== 1 ? 's' : ''}
                      </div>
                      {allWordCloudResponses.map((response, index) => (
                        <div 
                          key={response.id || index} 
                          className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                          data-testid={`wordcloud-response-${index}`}
                        >
                          <span className="text-sm font-medium truncate max-w-[200px]">{response.answer}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(response.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Recent Responses</h3>
              <div className="space-y-2">
                {recentResponses.length === 0 ? (
                  <Card className="p-3 sm:p-4 text-center text-muted-foreground text-sm">
                    No responses yet
                  </Card>
                ) : (
                  recentResponses.map((response, index) => (
                    <Card key={response.id || index} className="p-2.5 sm:p-3" data-testid={`card-response-${index}`}>
                      <div className="text-xs sm:text-sm font-medium">Participant {response.participantId.slice(0, 8)}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">{response.answer}</div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
      <FloatingEmojis emojis={floatingEmojis} />
      
      {/* Drawing Toolbar */}
      <DrawingToolbar
        activeTool={activeTool}
        activeColor={activeColor}
        isDrawingMode={isDrawingMode}
        onToolSelect={(tool) => {
          setActiveTool(tool);
          if (!isDrawingMode) {
            setIsDrawingMode(true);
          }
        }}
        onColorSelect={setActiveColor}
        onToggleDrawingMode={() => {
          setIsDrawingMode(!isDrawingMode);
          if (isDrawingMode) {
            setActiveTool(null);
          } else {
            setActiveTool("pen");
          }
        }}
        onClearAnnotations={() => {
          // Only emit via Socket.IO - the socket broadcast will clear for all clients
          clearAnnotationsSocket();
          showNotification("Annotations cleared", "success");
        }}
      />
    </div>
  );
}
