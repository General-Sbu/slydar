import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PollOption {
  label: string;
  votes: number;
  percentage: number;
  color: string;
}

interface LivePollChartProps {
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export default function LivePollChart({ question, options, totalVotes }: LivePollChartProps) {
  return (
    <div className="flex flex-col items-center h-full">
      {/* Question at top center - bigger */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">{question}</h2>
        <p className="text-sm text-muted-foreground mt-2">{totalVotes} responses</p>
      </div>

      {/* Options in center */}
      <div className="space-y-4 w-full max-w-2xl">
        {options.map((option, index) => (
          <Card key={index} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{option.label}</span>
              <span className="text-sm font-semibold">{option.percentage}%</span>
            </div>
            <Progress 
              value={option.percentage} 
              className="h-3"
              style={{
                '--progress-background': option.color
              } as React.CSSProperties}
            />
            <div className="text-xs text-muted-foreground">{option.votes} votes</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
