import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MessageSquare, ThumbsUp, Heart, ThumbsDown, Clock, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { format } from "date-fns";

interface ResponseData {
  id: string;
  participantId: string;
  answer: string;
  submittedAt: string;
}

interface FeedbackData {
  id: string;
  participantId: string;
  content: string;
  submittedAt: string;
}

interface ReactionData {
  id: string;
  participantId: string;
  reactionType: string;
  submittedAt: string;
}

interface SlideResponsesData {
  sessionId: string;
  slideId: string;
  slideType: string;
  slideOrder: number;
  question: string | null;
  config: Record<string, unknown> | null;
  presentationTitle: string;
  sessionCode: string;
  responses: ResponseData[];
  feedback: FeedbackData[];
  reactions: ReactionData[];
  uniqueParticipantCount: number;
}

function getSlideTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'multiple_choice': 'Poll',
    'word_cloud': 'Word Cloud',
    'fill_blank': 'Fill in the Blank',
    'heading': 'Heading',
    'image': 'Image',
    'spinner': 'Spinner Wheel',
    'qa': 'Q&A'
  };
  return labels[type] || type.replace('_', ' ');
}

function getReactionIcon(type: string) {
  switch (type) {
    case 'like':
      return <ThumbsUp className="h-4 w-4" />;
    case 'heart':
      return <Heart className="h-4 w-4" />;
    case 'thumbs_down':
      return <ThumbsDown className="h-4 w-4" />;
    default:
      return <ThumbsUp className="h-4 w-4" />;
  }
}

function formatParticipantId(id: string): string {
  return `Participant ${id.slice(-6).toUpperCase()}`;
}

export default function SlideResponses() {
  const [, setLocation] = useLocation();
  const { sessionId, slideId } = useParams<{ sessionId: string; slideId: string }>();

  const { data, isLoading, error, refetch } = useQuery<SlideResponsesData>({
    queryKey: [`/api/sessions/${sessionId}/slides/${slideId}/responses`],
    enabled: !!sessionId && !!slideId,
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as Error).message || 'An error occurred';
    const isForbidden = errorMessage.includes('403') || errorMessage.includes('Forbidden');
    
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2" data-testid="error-title">
              {isForbidden ? 'Access Denied' : 'Error loading data'}
            </h3>
            <p className="text-muted-foreground mb-4" data-testid="error-message">
              {isForbidden 
                ? "You don't have permission to view this slide's responses."
                : 'There was a problem loading the slide responses.'}
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => refetch()} data-testid="button-retry">
                Try Again
              </Button>
              <Button onClick={() => setLocation(`/session/${sessionId}`)} data-testid="button-back-session">
                Back to Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2" data-testid="not-found-title">Slide not found</h3>
            <p className="text-muted-foreground mb-4">
              This slide data may not be available.
            </p>
            <Button onClick={() => setLocation(`/session/${sessionId}`)} data-testid="button-back-session">
              Back to Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const responseCounts = data.responses.reduce((acc, r) => {
    acc[r.answer] = (acc[r.answer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reactionCounts = data.reactions.reduce((acc, r) => {
    acc[r.reactionType] = (acc[r.reactionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation(`/session/${sessionId}`)}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold" data-testid="slide-title">
                Slide {data.slideOrder + 1}
              </h1>
              <Badge variant="secondary" className="capitalize">
                {getSlideTypeLabel(data.slideType)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {data.presentationTitle} - Code: {data.sessionCode}
            </p>
          </div>
        </div>

        {data.question && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium" data-testid="slide-question">{data.question}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Responses</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-responses">
                {data.responses.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-participants">
                {data.uniqueParticipantCount}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Reactions</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-reactions">
                {data.reactions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {data.slideType === 'multiple_choice' && Object.keys(responseCounts).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Response Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(responseCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([answer, count]) => {
                    const percentage = Math.round((count / data.responses.length) * 100);
                    return (
                      <div key={answer} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{answer}</span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {data.responses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Individual Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.responses.map((response) => (
                  <div 
                    key={response.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg"
                    data-testid={`response-${response.id}`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium" data-testid={`response-participant-${response.id}`}>
                          {formatParticipantId(response.participantId)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(response.submittedAt), 'h:mm:ss a')}
                        </span>
                      </div>
                      <p className="text-sm" data-testid={`response-answer-${response.id}`}>
                        {response.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.feedback.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.feedback.map((fb) => (
                  <div 
                    key={fb.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg"
                    data-testid={`feedback-${fb.id}`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium" data-testid={`feedback-participant-${fb.id}`}>
                          {formatParticipantId(fb.participantId)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(fb.submittedAt), 'h:mm:ss a')}
                        </span>
                      </div>
                      <p className="text-sm" data-testid={`feedback-content-${fb.id}`}>{fb.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.reactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Reactions
                <div className="flex gap-2">
                  {Object.entries(reactionCounts).map(([type, count]) => (
                    <Badge key={type} variant="secondary" className="flex items-center gap-1" data-testid={`badge-reaction-${type}`}>
                      {getReactionIcon(type)}
                      <span data-testid={`reaction-count-${type}`}>{count}</span>
                    </Badge>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.reactions.map((reaction) => (
                  <div 
                    key={reaction.id} 
                    className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm"
                    data-testid={`reaction-${reaction.id}`}
                  >
                    {getReactionIcon(reaction.reactionType)}
                    <span className="text-muted-foreground">
                      {formatParticipantId(reaction.participantId)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.responses.length === 0 && data.feedback.length === 0 && data.reactions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No activity on this slide</h3>
              <p className="text-muted-foreground">
                No responses, feedback, or reactions were recorded for this slide.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
