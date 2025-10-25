import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Users, MessageSquare, ThumbsUp, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SlideAnalytics {
  slideId: string;
  slideTitle: string;
  slideType: string;
  reactions: number;
  responses: number;
  feedback: number;
}

interface AnalyticsData {
  presentationId: string;
  presentationTitle: string;
  totalSessions: number;
  totalParticipants: number;
  totalQuestions: number;
  slideAnalytics: SlideAnalytics[];
}

export default function Analytics() {
  const [, params] = useRoute("/analytics/:id");
  const presentationId = params?.id;

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/presentations', presentationId, 'analytics'],
    enabled: !!presentationId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Analytics</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Analytics data not available</p>
      </div>
    );
  }

  const totalReactions = data.slideAnalytics.reduce((sum, slide) => sum + slide.reactions, 0);
  const totalResponses = data.slideAnalytics.reduce((sum, slide) => sum + slide.responses, 0);
  const totalFeedback = data.slideAnalytics.reduce((sum, slide) => sum + slide.feedback, 0);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold truncate">{data.presentationTitle}</h1>
              <p className="text-sm text-muted-foreground">Audience Engagement Analytics</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-total-sessions">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-sessions">{data.totalSessions}</div>
                <p className="text-xs text-muted-foreground">Times presented</p>
              </CardContent>
            </Card>

            <Card data-testid="card-total-participants">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
                <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-participants">{data.totalParticipants}</div>
                <p className="text-xs text-muted-foreground">Unique audience members</p>
              </CardContent>
            </Card>

            <Card data-testid="card-total-reactions">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
                <CardTitle className="text-sm font-medium">Total Reactions</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-reactions">{totalReactions}</div>
                <p className="text-xs text-muted-foreground">Likes & hearts</p>
              </CardContent>
            </Card>

            <Card data-testid="card-total-questions">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
                <CardTitle className="text-sm font-medium">Questions Asked</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-questions">{data.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">Audience Q&A</p>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-slide-breakdown">
            <CardHeader>
              <CardTitle>Slide-by-Slide Breakdown</CardTitle>
              <CardDescription>
                Engagement metrics for each slide in your presentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.slideAnalytics.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No slides found in this presentation
                </p>
              ) : (
                <div className="space-y-4">
                  {data.slideAnalytics.map((slide, index) => (
                    <div 
                      key={slide.slideId} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md gap-4"
                      data-testid={`slide-analytics-${index}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium truncate" data-testid={`slide-title-${index}`}>
                            {slide.slideTitle}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {slide.slideType}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`slide-reactions-${index}`}>{slide.reactions}</span>
                          <span className="text-muted-foreground hidden sm:inline">reactions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`slide-responses-${index}`}>{slide.responses}</span>
                          <span className="text-muted-foreground hidden sm:inline">responses</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`slide-feedback-${index}`}>{slide.feedback}</span>
                          <span className="text-muted-foreground hidden sm:inline">feedback</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall Engagement Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Poll Participation</p>
                  <p className="text-2xl font-bold" data-testid="text-total-responses">{totalResponses}</p>
                  <p className="text-xs text-muted-foreground">Total responses</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Feedback Received</p>
                  <p className="text-2xl font-bold" data-testid="text-total-feedback">{totalFeedback}</p>
                  <p className="text-xs text-muted-foreground">Total feedback entries</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg per Session</p>
                  <p className="text-2xl font-bold" data-testid="text-avg-participants">
                    {data.totalSessions > 0 ? Math.round(data.totalParticipants / data.totalSessions) : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Participants per session</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
