import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Users, MessageSquare, BarChart3, ThumbsUp, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { format } from "date-fns";

interface SessionDetails {
  id: string;
  presentationId: string;
  presentationTitle: string;
  code: string;
  startedAt: string;
  isActive: boolean;
  currentSlideIndex: number;
  participantCount: number;
  responseCount: number;
  slideAnalytics: Array<{
    slideId: string;
    slideType: string;
    slideOrder: number;
    question: string | null;
    responseCount: number;
    uniqueParticipants: number;
  }>;
}

export default function SessionAnalytics() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();

  const { data: session, isLoading } = useQuery<SessionDetails>({
    queryKey: [`/api/sessions/${id}/details`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Session not found</h3>
            <p className="text-muted-foreground mb-4">
              This session may have been deleted or you don't have access to it.
            </p>
            <Button onClick={() => setLocation('/report')} data-testid="button-back-report">
              Back to Report
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation('/report')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold" data-testid="session-title">
              {session.presentationTitle}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono bg-muted px-2 py-0.5 rounded">{session.code}</span>
              <span>-</span>
              <span>{format(new Date(session.startedAt), 'MMMM d, yyyy h:mm a')}</span>
              {session.isActive && (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-participants">
                {session.participantCount}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Responses</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-responses">
                {session.responseCount}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Slides Covered</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-slides">
                {session.currentSlideIndex + 1}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Started</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold" data-testid="stat-started">
                {format(new Date(session.startedAt), 'h:mm a')}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Slide Analytics</h2>
          
          {session.slideAnalytics.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No slide data available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {session.slideAnalytics.map((slide, index) => (
                <Card key={slide.slideId} data-testid={`slide-analytics-${slide.slideId}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {slide.slideOrder + 1}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded capitalize">
                              {slide.slideType.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {slide.question || 'No question'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-center">
                          <div className="text-lg font-semibold" data-testid={`slide-responses-${slide.slideId}`}>
                            {slide.responseCount}
                          </div>
                          <div className="text-xs text-muted-foreground">Responses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold" data-testid={`slide-participants-${slide.slideId}`}>
                            {slide.uniqueParticipants}
                          </div>
                          <div className="text-xs text-muted-foreground">Participants</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
