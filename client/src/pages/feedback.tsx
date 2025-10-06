import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FeedbackWithSlide {
  id: string;
  sessionId: string;
  slideId: string;
  participantId: string;
  content: string;
  submittedAt: Date;
  slide: {
    id: string;
    type: string;
    question: string | null;
    order: number;
  } | null;
}

export default function FeedbackView() {
  const [, params] = useRoute("/feedback/:sessionId");
  const sessionId = params?.sessionId;

  const { data: feedbackList = [], isLoading } = useQuery<FeedbackWithSlide[]>({
    queryKey: ["/api/sessions", sessionId, "feedback-with-slides"],
    enabled: !!sessionId,
  });

  const getSlideTitle = (feedback: FeedbackWithSlide) => {
    if (!feedback.slide) return "Unknown Slide";
    
    if (feedback.slide.type === "heading") {
      return feedback.slide.question || "Heading Slide";
    } else if (feedback.slide.type === "image") {
      return "Image Slide";
    } else if (feedback.slide.question) {
      return feedback.slide.question;
    }
    return `${feedback.slide.type} slide`;
  };

  const getSlideTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      multiple_choice: "Multiple Choice",
      word_cloud: "Word Cloud",
      open_ended: "Open Ended",
      heading: "Heading",
      image: "Image"
    };
    return typeMap[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading feedback...</div>
        </div>
      </div>
    );
  }

  const groupedFeedback = feedbackList.reduce((acc, fb) => {
    const slideId = fb.slideId;
    if (!acc[slideId]) {
      acc[slideId] = [];
    }
    acc[slideId].push(fb);
    return acc;
  }, {} as Record<string, FeedbackWithSlide[]>);

  const sortedSlides = Object.entries(groupedFeedback).sort(([, a], [, b]) => {
    const orderA = a[0]?.slide?.order ?? 999;
    const orderB = b[0]?.slide?.order ?? 999;
    return orderA - orderB;
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-feedback-title">Session Feedback</h1>
        <p className="text-muted-foreground">
          View all feedback submitted by audience members during this presentation
        </p>
      </div>

      {feedbackList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No feedback yet</p>
            <p className="text-sm text-muted-foreground">
              Audience members haven't submitted any feedback for this session.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5" />
            <span className="font-medium" data-testid="text-total-feedback">
              Total Feedback: {feedbackList.length}
            </span>
          </div>

          {sortedSlides.map(([slideId, slideFeedback]) => {
            const firstFeedback = slideFeedback[0];
            const slide = firstFeedback.slide;

            return (
              <Card key={slideId} data-testid={`card-slide-feedback-${slideId}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2" data-testid={`text-slide-title-${slideId}`}>
                        {getSlideTitle(firstFeedback)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {slide && (
                          <>
                            <Badge variant="secondary" data-testid={`badge-slide-type-${slideId}`}>
                              {getSlideTypeLabel(slide.type)}
                            </Badge>
                            <span className="text-sm">Slide {slide.order + 1}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" data-testid={`badge-feedback-count-${slideId}`}>
                      {slideFeedback.length} feedback
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-auto max-h-96">
                    <div className="space-y-4">
                      {slideFeedback.map((fb, index) => (
                        <div key={fb.id}>
                          <div className="space-y-2" data-testid={`feedback-item-${fb.id}`}>
                            <div className="flex items-start justify-between gap-4">
                              <p className="flex-1 text-sm" data-testid={`text-feedback-content-${fb.id}`}>
                                {fb.content}
                              </p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(fb.submittedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {index < slideFeedback.length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
