import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RoomCodeDisplay from "@/components/RoomCodeDisplay";
import LivePollChart from "@/components/LivePollChart";
import { ChevronLeft, ChevronRight, X, Users } from "lucide-react";

export default function Presenter() {
  const mockOptions = [
    { label: "Polls", votes: 45, percentage: 45, color: "hsl(var(--chart-1))" },
    { label: "Quizzes", votes: 30, percentage: 30, color: "hsl(var(--chart-2))" },
    { label: "Word Clouds", votes: 15, percentage: 15, color: "hsl(var(--chart-3))" },
    { label: "Q&A", votes: 10, percentage: 10, color: "hsl(var(--chart-4))" },
  ];

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
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="font-semibold">Product Launch Q4</div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span className="font-medium">24</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-previous-slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-3">Slide 1 / 12</span>
              <Button 
                variant="outline" 
                size="sm"
                data-testid="button-next-slide"
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
            <Card className="p-12">
              <LivePollChart
                question="What's your favorite feature?"
                options={mockOptions}
                totalVotes={100}
              />
            </Card>
          </div>
        </main>

        <aside className="w-96 border-l bg-muted/30 overflow-auto">
          <div className="p-6 space-y-6">
            <RoomCodeDisplay code="ABC123" participantCount={24} />
            
            <div>
              <h3 className="font-semibold mb-3">Recent Responses</h3>
              <div className="space-y-2">
                {[
                  { name: "Participant 24", answer: "Polls" },
                  { name: "Participant 23", answer: "Quizzes" },
                  { name: "Participant 22", answer: "Polls" },
                  { name: "Participant 21", answer: "Word Clouds" },
                ].map((response, index) => (
                  <Card key={index} className="p-3">
                    <div className="text-sm font-medium">{response.name}</div>
                    <div className="text-sm text-muted-foreground">{response.answer}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
