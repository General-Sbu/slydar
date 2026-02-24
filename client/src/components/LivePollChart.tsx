import { useEffect, useRef, useState } from "react";

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

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const duration = 500;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    }

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{display}</span>;
}

const BAR_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function LivePollChart({ question, options, totalVotes }: LivePollChartProps) {
  const maxVotes = Math.max(...options.map(o => o.votes), 1);

  return (
    <div className="flex flex-col items-center h-full w-full" data-testid="poll-histogram">
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold">{question}</h2>
        <p className="text-sm text-muted-foreground mt-1">{totalVotes} response{totalVotes !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex-1 flex items-end justify-center gap-3 sm:gap-6 w-full max-w-3xl px-4 pb-2 min-h-[200px]">
        {options.map((option, index) => {
          const heightPercent = maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;
          const barColor = option.color || BAR_COLORS[index % BAR_COLORS.length];

          return (
            <div
              key={index}
              className="flex flex-col items-center flex-1 max-w-[140px] min-w-[60px]"
              data-testid={`poll-bar-${index}`}
            >
              <div className="text-sm font-bold mb-1" style={{ color: barColor }}>
                <AnimatedNumber value={option.votes} />
              </div>

              <div className="w-full relative flex items-end" style={{ height: '180px' }}>
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${Math.max(heightPercent, 2)}%`,
                    backgroundColor: barColor,
                    transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    minHeight: option.votes > 0 ? '8px' : '3px',
                  }}
                />
              </div>

              <div className="mt-2 text-center w-full">
                <p className="text-xs sm:text-sm font-medium leading-tight line-clamp-2">{option.label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{option.percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
