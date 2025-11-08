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
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{totalVotes} responses</p>
      </div>

      <div className="space-y-4">
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
