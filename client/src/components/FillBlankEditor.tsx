import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { FillBlankQuestion } from "@shared/schema";

interface FillBlankEditorProps {
  questions: FillBlankQuestion[];
  onChange: (questions: FillBlankQuestion[]) => void;
}

export default function FillBlankEditor({ questions, onChange }: FillBlankEditorProps) {
  const addQuestion = () => {
    const newQuestion: FillBlankQuestion = {
      id: crypto.randomUUID(),
      sentence: "",
      blanks: [{ answer: "" }],
    };
    onChange([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<FillBlankQuestion>) => {
    const updated = [...questions];
    const newQuestion = { ...updated[index], ...updates };
    
    if (updates.sentence !== undefined) {
      const newBlankCount = (updates.sentence.match(/____/g) || []).length;
      const currentBlanks = newQuestion.blanks;
      
      if (newBlankCount > currentBlanks.length) {
        const additionalBlanks = Array.from(
          { length: newBlankCount - currentBlanks.length },
          () => ({ answer: "" })
        );
        newQuestion.blanks = [...currentBlanks, ...additionalBlanks];
      } else if (newBlankCount < currentBlanks.length) {
        newQuestion.blanks = currentBlanks.slice(0, newBlankCount);
      }
    }
    
    updated[index] = newQuestion;
    onChange(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    onChange(questions.filter((_, i) => i !== index));
  };

  const updateBlankAnswer = (questionIndex: number, blankIndex: number, answer: string) => {
    const updated = [...questions];
    const blanks = [...updated[questionIndex].blanks];
    blanks[blankIndex] = { ...blanks[blankIndex], answer };
    updated[questionIndex] = { ...updated[questionIndex], blanks };
    onChange(updated);
  };

  const addBlank = (questionIndex: number) => {
    const updated = [...questions];
    const blanks = [...updated[questionIndex].blanks];
    blanks.push({ answer: "" });
    updated[questionIndex] = { ...updated[questionIndex], blanks };
    onChange(updated);
  };

  const removeBlank = (questionIndex: number, blankIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].blanks.length <= 1) return;
    const blanks = updated[questionIndex].blanks.filter((_, i) => i !== blankIndex);
    updated[questionIndex] = { ...updated[questionIndex], blanks };
    onChange(updated);
  };

  const countBlanksInSentence = (sentence: string) => {
    const matches = sentence.match(/____/g);
    return matches ? matches.length : 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">Questions</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Use four underscores (____) in your sentence to mark where blanks should appear. Add one answer for each blank.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={addQuestion}
          data-testid="button-add-question"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question, qIndex) => {
          const blankCount = countBlanksInSentence(question.sentence);
          const hasBlankMismatch = blankCount !== question.blanks.length && question.sentence.length > 0;
          
          return (
            <Card key={question.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Question {qIndex + 1}
                  </Label>
                  <Input
                    value={question.sentence}
                    onChange={(e) => updateQuestion(qIndex, { sentence: e.target.value })}
                    placeholder="The ____ is the largest planet in our ____ system."
                    className={hasBlankMismatch ? "border-yellow-500" : ""}
                    data-testid={`input-sentence-${qIndex}`}
                  />
                  {hasBlankMismatch && (
                    <p className="text-xs text-yellow-600">
                      Found {blankCount} blank(s) in sentence but {question.blanks.length} answer(s) provided
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(qIndex)}
                  disabled={questions.length <= 1}
                  className="mt-6"
                  data-testid={`button-remove-question-${qIndex}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Answers (in order)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addBlank(qIndex)}
                    className="h-7 text-xs"
                    data-testid={`button-add-blank-${qIndex}`}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Answer
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {question.blanks.map((blank, bIndex) => (
                    <div key={bIndex} className="flex items-center gap-1">
                      <Input
                        value={blank.answer}
                        onChange={(e) => updateBlankAnswer(qIndex, bIndex, e.target.value)}
                        placeholder={`Answer ${bIndex + 1}`}
                        className="w-32 h-8 text-sm"
                        data-testid={`input-answer-${qIndex}-${bIndex}`}
                      />
                      {question.blanks.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBlank(qIndex, bIndex)}
                          className="h-8 w-8"
                          data-testid={`button-remove-blank-${qIndex}-${bIndex}`}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Preview:</p>
                <p className="text-sm mt-1">
                  {question.sentence.split('____').map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="inline-block min-w-[60px] border-b-2 border-primary mx-1 text-center text-primary font-medium">
                          {question.blanks[i]?.answer || '____'}
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
