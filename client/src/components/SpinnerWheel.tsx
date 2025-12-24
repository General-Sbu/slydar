import { useState, useCallback } from "react";
import { Play } from "lucide-react";
import type { SpinnerEntry } from "@shared/schema";

interface SpinnerWheelProps {
  entries: SpinnerEntry[];
  isInteractive?: boolean;
  onSpinComplete?: (winner: SpinnerEntry) => void;
  isSpinning?: boolean;
  winningIndex?: number | null;
}

export default function SpinnerWheel({ 
  entries, 
  isInteractive = false,
  onSpinComplete,
  isSpinning: externalSpinning,
  winningIndex: externalWinningIndex
}: SpinnerWheelProps) {
  const [internalSpinning, setInternalSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<SpinnerEntry | null>(null);

  const isSpinning = externalSpinning !== undefined ? externalSpinning : internalSpinning;

  const segmentCount = entries.length || 8;
  const segmentAngle = 360 / segmentCount;
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  const polarToCartesian = (angle: number, r: number) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(radians),
      y: centerY + r * Math.sin(radians),
    };
  };

  const createSegmentPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      `M ${centerX} ${centerY}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  };

  const handleSpin = useCallback(() => {
    if (isSpinning || !isInteractive) return;

    setInternalSpinning(true);
    setWinner(null);

    const spins = 5 + Math.random() * 5;
    const winnerIdx = Math.floor(Math.random() * segmentCount);
    const winnerAngle = winnerIdx * segmentAngle + segmentAngle / 2;
    const finalRotation = spins * 360 + (360 - winnerAngle);

    setRotation((prev) => prev + finalRotation);

    setTimeout(() => {
      setInternalSpinning(false);
      const selectedEntry = entries[winnerIdx];
      setWinner(selectedEntry);
      onSpinComplete?.(selectedEntry);
    }, 4000);
  }, [isSpinning, isInteractive, segmentCount, segmentAngle, entries, onSpinComplete]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0"
          style={{
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "20px solid hsl(var(--foreground))",
          }}
        />
        
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          className="drop-shadow-lg"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
          }}
          data-testid="spinner-wheel"
        >
          {entries.map((entry, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            const midAngle = startAngle + segmentAngle / 2;
            const textPos = polarToCartesian(midAngle, radius * 0.65);

            return (
              <g key={entry.id}>
                <path
                  d={createSegmentPath(startAngle, endAngle)}
                  fill={entry.color}
                  stroke="white"
                  strokeWidth="2"
                  data-testid={`spinner-segment-${index}`}
                />
                <text
                  x={textPos.x}
                  y={textPos.y}
                  fill="white"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle}, ${textPos.x}, ${textPos.y})`}
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                >
                  {entry.label}
                </text>
              </g>
            );
          })}
          
          <circle
            cx={centerX}
            cy={centerY}
            r="30"
            fill="white"
            stroke="hsl(var(--border))"
            strokeWidth="2"
            className="drop-shadow"
          />
        </svg>

        {isInteractive && (
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-border"
            data-testid="button-spin"
          >
            <Play className="h-6 w-6 text-foreground ml-1" fill="currentColor" />
          </button>
        )}

        {!isInteractive && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border border-border">
            <Play className="h-6 w-6 text-foreground ml-1" fill="currentColor" />
          </div>
        )}
      </div>

      {winner && !isSpinning && (
        <div 
          className="text-center p-4 rounded-lg bg-card border"
          data-testid="spinner-result"
        >
          <p className="text-sm text-muted-foreground">Winner:</p>
          <p className="text-2xl font-bold" style={{ color: winner.color }}>
            {winner.label}
          </p>
        </div>
      )}
    </div>
  );
}
