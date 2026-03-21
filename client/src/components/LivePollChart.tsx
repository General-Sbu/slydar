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
    <div
      className="flex flex-col w-full h-full rounded-xl"
      style={{ padding: '20px 20px 16px' }}
      data-testid="poll-histogram"
    >
      {/* Title section */}
      <div className="text-center" style={{ marginBottom: '20px' }}>
        <h2
          className="font-bold leading-tight break-words hyphens-auto"
          style={{ fontSize: 'clamp(1.1rem, 4vw, 1.75rem)' }}
        >
          {question}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {totalVotes} response{totalVotes !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Chart section */}
      <div className="flex-1 flex flex-col min-h-0" style={{ gap: '0px' }}>
        {/* Bars + numeric indicators */}
        <div
          className="flex items-end w-full"
          style={{ gap: '10px', paddingBottom: '10px' }}
        >
          {options.map((option, index) => {
            const heightPercent = maxVotes > 0 ? (option.votes / maxVotes) * 100 : 0;
            const barColor = option.color || BAR_COLORS[index % BAR_COLORS.length];

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1"
                data-testid={`poll-bar-${index}`}
              >
                {/* Vote count above bar */}
                <div
                  className="font-bold tabular-nums mb-1.5"
                  style={{ color: barColor, fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)' }}
                >
                  <AnimatedNumber value={option.votes} />
                </div>

                {/* Bar track */}
                <div
                  className="w-full relative flex items-end rounded-lg overflow-hidden"
                  style={{ height: '160px', backgroundColor: 'hsl(var(--muted))' }}
                >
                  <div
                    className="w-full rounded-lg"
                    style={{
                      height: `${Math.max(heightPercent, option.votes > 0 ? 4 : 1)}%`,
                      backgroundColor: barColor,
                      transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      minHeight: option.votes > 0 ? '10px' : '3px',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Labels row — aligned exactly under each bar */}
        <div
          className="flex w-full"
          style={{ gap: '10px', marginTop: '10px' }}
        >
          {options.map((option, index) => {
            const barColor = option.color || BAR_COLORS[index % BAR_COLORS.length];
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center text-center"
              >
                <p
                  className="font-medium leading-tight break-words w-full"
                  style={{ fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}
                >
                  {option.label}
                </p>
                <p
                  className="mt-1 font-semibold"
                  style={{ color: barColor, fontSize: 'clamp(0.65rem, 1.8vw, 0.8rem)' }}
                >
                  {option.percentage}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
