import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RoomCodeDisplay from "@/components/RoomCodeDisplay";
import LivePollChart from "@/components/LivePollChart";
import { ChevronLeft, ChevronRight, X, Users } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Presentation, Slide, Session, Response } from "@shared/schema";
import { useWebSocket } from "@/lib/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Presenter() {
  const [, params] = useRoute("/present/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const presentationId = params?.id;

  const [session, setSession] = useState<Session | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [participantCount, setParticipantCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const [allResponses, setAllResponses] = useState<Response[]>([]);

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
    onSuccess: (data: Session) => {
      setSession(data);
      setCurrentSlideIndex(0);
      if (slides.length > 0) {
        setCurrentSlide(slides[0]);
      }
      console.log(`🎯 ROOM CODE: ${data.code}`);
      console.log(`Join at: /audience/${data.code}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start presentation",
        variant: "destructive"
      });
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
      toast({
        title: "Session ended",
        description: "Presentation has been closed"
      });
      setLocation('/dashboard');
    }
  });

  const { isConnected, joinSession, navigateSlide } = useWebSocket({
    onSessionJoined: (data) => {
      setCurrentSlide(data.currentSlide);
    },
    onSlideChanged: (data) => {
      setCurrentSlideIndex(data.slideIndex);
      setCurrentSlide(data.slide);
    },
    onNewResponse: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', session?.id, 'responses'] });
    },
    onParticipantCount: (count) => {
      setParticipantCount(count);
    },
    onSessionEnded: () => {
      toast({
        title: "Session ended",
        description: "Presentation has been closed"
      });
      setLocation('/dashboard');
    }
  });

  useEffect(() => {
    if (!session && presentationId && slides.length > 0 && !createSessionMutation.isPending) {
      createSessionMutation.mutate();
    }
  }, [presentationId, slides]);

  useEffect(() => {
    if (session && isConnected) {
      joinSession(session.code, 'presenter');
    }
  }, [session, isConnected]);

  useEffect(() => {
    if (responses.length > 0) {
      setAllResponses(responses);
    }
  }, [responses]);

  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(newIndex);
      navigateSlide(newIndex);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      const newIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(newIndex);
      navigateSlide(newIndex);
    }
  };

  const handleEndPresentation = () => {
    endSessionMutation.mutate();
  };

  const slideResponses = useMemo(() => {
    if (!currentSlide) return [];
    return allResponses.filter(r => r.slideId === currentSlide.id);
  }, [allResponses, currentSlide]);

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

  if (!presentationId) {
    return <div className="h-screen flex items-center justify-center">Invalid presentation ID</div>;
  }

  const isLoading = presentationLoading || slidesLoading;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="button-exit-presentation"
                onClick={handleEndPresentation}
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="font-semibold">{presentation?.title || 'Untitled'}</div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span className="font-medium" data-testid="text-participant-count">{participantCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-previous-slide"
                onClick={handlePreviousSlide}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-3" data-testid="text-slide-number">
                Slide {currentSlideIndex + 1} / {slides.length}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-next-slide"
                onClick={handleNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            {isLoading || !currentSlide ? (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <Skeleton className="h-12 w-3/4 mx-auto" />
                  <Skeleton className="h-8 w-1/2 mx-auto" />
                </div>
              </Card>
            ) : (
              <Card className="p-12">
                {currentSlide.type === 'heading' ? (
                  <div className="text-center">
                    <h1 className="text-5xl font-bold">{currentSlide.question || "Heading"}</h1>
                  </div>
                ) : currentSlide.type === 'multiple_choice' && currentSlide.options ? (
                  <LivePollChart
                    question={currentSlide.question || "Question"}
                    options={chartOptions}
                    totalVotes={slideResponses.length}
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold">{currentSlide.question || "Question"}</h2>
                    <div className="text-muted-foreground">
                      {slideResponses.length} {slideResponses.length === 1 ? 'response' : 'responses'}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </main>

        <aside className="w-96 border-l bg-muted/30 overflow-auto">
          <div className="p-6 space-y-6">
            {session ? (
              <RoomCodeDisplay code={session.code} participantCount={participantCount} />
            ) : (
              <Card className="p-6">
                <div className="text-center space-y-3">
                  <Skeleton className="h-8 w-32 mx-auto" />
                  <Skeleton className="h-12 w-48 mx-auto" />
                </div>
              </Card>
            )}
            
            <div>
              <h3 className="font-semibold mb-3">Recent Responses</h3>
              <div className="space-y-2">
                {recentResponses.length === 0 ? (
                  <Card className="p-4 text-center text-muted-foreground text-sm">
                    No responses yet
                  </Card>
                ) : (
                  recentResponses.map((response, index) => (
                    <Card key={response.id || index} className="p-3" data-testid={`card-response-${index}`}>
                      <div className="text-sm font-medium">Participant {response.participantId.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground truncate">{response.answer}</div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
