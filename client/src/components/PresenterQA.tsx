import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Question } from "@shared/schema";
import { io } from "socket.io-client";

interface PresenterQAProps {
  sessionId: string;
}

export default function PresenterQA({ sessionId }: PresenterQAProps) {
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['/api/sessions', sessionId, 'questions'],
    refetchInterval: 2000,
  });

  useEffect(() => {
    const socket = io();
    
    socket.on('questions_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId, 'questions'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  const topQuestions = questions.slice(0, 5);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <MessageSquare className="h-4 w-4" />
        <h3 className="font-semibold text-sm sm:text-base">Audience Questions</h3>
        <span className="text-xs text-muted-foreground">({questions.length})</span>
      </div>
      <div className="space-y-2">
        {isLoading ? (
          <Card className="p-3 sm:p-4 text-center text-muted-foreground text-sm">
            Loading questions...
          </Card>
        ) : topQuestions.length === 0 ? (
          <Card className="p-3 sm:p-4 text-center text-muted-foreground text-sm">
            No questions yet
          </Card>
        ) : (
          topQuestions.map((question, index) => (
            <Card key={question.id} className="p-2.5 sm:p-3" data-testid={`card-presenter-question-${index}`}>
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-0.5 min-w-[2rem]">
                  <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs sm:text-sm font-semibold" data-testid={`text-presenter-upvotes-${index}`}>
                    {question.upvotes}
                  </span>
                </div>
                <p className="text-xs sm:text-sm flex-1 break-words" data-testid={`text-presenter-question-${index}`}>
                  {question.question}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
