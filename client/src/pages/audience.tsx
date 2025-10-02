import { Card } from "@/components/ui/card";
import Logo from "@/components/Logo";
import AudienceAnswerButton from "@/components/AudienceAnswerButton";
import { useState } from "react";
import { Check } from "lucide-react";

export default function Audience() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (answer: string) => {
    if (!submitted) {
      setSelectedAnswer(answer);
      setTimeout(() => {
        setSubmitted(true);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Logo size="sm" />
            <div className="text-sm text-muted-foreground">
              Room: <span className="font-mono font-semibold">ABC123</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!submitted ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold">
                What's your favorite feature?
              </h1>
              <p className="text-muted-foreground">Select one option</p>
            </div>

            <div className="grid gap-3">
              <AudienceAnswerButton
                label="Polls"
                selected={selectedAnswer === "Polls"}
                onClick={() => handleAnswer("Polls")}
              />
              <AudienceAnswerButton
                label="Quizzes"
                selected={selectedAnswer === "Quizzes"}
                onClick={() => handleAnswer("Quizzes")}
              />
              <AudienceAnswerButton
                label="Word Clouds"
                selected={selectedAnswer === "Word Clouds"}
                onClick={() => handleAnswer("Word Clouds")}
              />
              <AudienceAnswerButton
                label="Q&A"
                selected={selectedAnswer === "Q&A"}
                onClick={() => handleAnswer("Q&A")}
              />
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Response Submitted!</h2>
                <p className="text-muted-foreground">
                  Waiting for the next question...
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
