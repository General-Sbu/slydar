import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Question } from "@shared/schema";
import { useNotification } from "@/hooks/useNotification";
import { io } from "socket.io-client";

interface AudienceQAProps {
  sessionId: string;
  participantId: string;
}

interface QuestionWithVoteState extends Question {
  hasUpvoted?: boolean;
}

export default function AudienceQA({ sessionId, participantId }: AudienceQAProps) {
  const [questionText, setQuestionText] = useState("");
  const [votedQuestions, setVotedQuestions] = useState<Set<string>>(new Set());
  const { showNotification } = useNotification();

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['/api/sessions', sessionId, 'questions'],
    refetchInterval: 3000,
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

  const submitQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest('POST', '/api/questions', {
        sessionId,
        participantId,
        question
      });
      return res.json();
    },
    onSuccess: () => {
      setQuestionText("");
      showNotification("Question submitted!", "success");
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId, 'questions'] });
    },
    onError: () => {
      showNotification("Failed to submit question", "error");
    }
  });

  const upvoteMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const res = await apiRequest('POST', `/api/questions/${questionId}/upvote`, {
        participantId,
        sessionId
      });
      return res.json();
    },
    onSuccess: (data: { upvoted: boolean }, questionId: string) => {
      setVotedQuestions(prev => {
        const newSet = new Set(prev);
        if (data.upvoted) {
          newSet.add(questionId);
        } else {
          newSet.delete(questionId);
        }
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId, 'questions'] });
    },
    onError: () => {
      showNotification("Failed to upvote", "error");
    }
  });

  const handleSubmit = () => {
    if (!questionText.trim()) return;
    submitQuestionMutation.mutate(questionText);
  };

  const handleUpvote = (questionId: string) => {
    upvoteMutation.mutate(questionId);
  };

  const hasUpvoted = (questionId: string) => {
    return votedQuestions.has(questionId);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Ask a Question</h3>
        <Textarea
          placeholder="Type your question here..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="mb-3"
          data-testid="textarea-question"
        />
        <Button
          onClick={handleSubmit}
          disabled={!questionText.trim() || submitQuestionMutation.isPending}
          data-testid="button-submit-question"
          className="w-full"
        >
          {submitQuestionMutation.isPending ? "Submitting..." : "Submit Question"}
        </Button>
      </Card>

      <div>
        <h3 className="font-semibold mb-3">Questions ({questions.length})</h3>
        <div className="space-y-2">
          {isLoading ? (
            <Card className="p-4 text-center text-muted-foreground text-sm">
              Loading questions...
            </Card>
          ) : questions.length === 0 ? (
            <Card className="p-4 text-center text-muted-foreground text-sm">
              No questions yet. Be the first to ask!
            </Card>
          ) : (
            questions.map((question) => (
              <Card key={question.id} className="p-3" data-testid={`card-question-${question.id}`}>
                <div className="flex items-start gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpvote(question.id)}
                    className="flex-col h-auto py-1 px-2"
                    data-testid={`button-upvote-${question.id}`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${hasUpvoted(question.id) ? 'fill-current text-blue-600 dark:text-blue-400' : ''}`} />
                    <span className="text-xs font-semibold mt-1" data-testid={`text-upvotes-${question.id}`}>
                      {question.upvotes}
                    </span>
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm break-words" data-testid={`text-question-${question.id}`}>
                      {question.question}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
