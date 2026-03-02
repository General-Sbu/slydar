import { useState, useCallback, useEffect, useRef } from "react";
import { Play, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SpinnerEntry } from "@shared/schema";

interface SpinnerWheelProps {
  entries: SpinnerEntry[];
  isInteractive?: boolean;
  onSpinComplete?: (winner: SpinnerEntry) => void;
  onRemoveWinner?: (winner: SpinnerEntry) => void;
  onSpinStart?: (data: { winnerIdx: number; targetRotation: number; entries: SpinnerEntry[] }) => void;
  externalSpin?: { winnerIdx: number; targetRotation: number; entries: SpinnerEntry[] } | null;
}

function Confetti({ isActive }: { isActive: boolean }) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    color: string;
    delay: number;
    duration: number;
    size: number;
  }>>([]);

  useEffect(() => {
    if (isActive) {
      const colors = ["#9333EA", "#DC2626", "#EA580C", "#EAB308", "#22C55E", "#14B8A6", "#3B82F6", "#F472B6"];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        size: 8 + Math.random() * 8,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: "-20px",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function SpinnerWheel({ 
  entries: propEntries, 
  isInteractive = false,
  onSpinComplete,
  onRemoveWinner,
  onSpinStart,
  externalSpin,
}: SpinnerWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<SpinnerEntry | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayEntries, setDisplayEntries] = useState(propEntries);
  const prevExternalSpinRef = useRef<typeof externalSpin>(null);

  const segmentCount = displayEntries.length || 8;
  const segmentAngle = 360 / segmentCount;
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  useEffect(() => {
    if (!isInteractive) {
      setDisplayEntries(propEntries);
    }
  }, [propEntries, isInteractive]);

  useEffect(() => {
    if (!externalSpin) return;
    if (prevExternalSpinRef.current === externalSpin) return;
    prevExternalSpinRef.current = externalSpin;

    setDisplayEntries(externalSpin.entries);
    setSpinning(true);
    setWinner(null);
    setShowConfetti(false);
    setRotation(externalSpin.targetRotation);

    setTimeout(() => {
      setSpinning(false);
      const selectedEntry = externalSpin.entries[externalSpin.winnerIdx];
      if (selectedEntry) {
        setWinner(selectedEntry);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }, 4000);
  }, [externalSpin]);

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
    if (spinning || !isInteractive) return;

    setSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    const spins = 5 + Math.floor(Math.random() * 5);
    const winnerIdx = Math.floor(Math.random() * segmentCount);
    
    const winnerAngle = winnerIdx * segmentAngle + segmentAngle / 2;
    const targetMod = 360 - winnerAngle;
    const currentMod = rotation % 360;
    let additionalRotation = targetMod - currentMod;
    if (additionalRotation <= 0) additionalRotation += 360;
    const totalRotation = spins * 360 + additionalRotation;
    const targetRotation = rotation + totalRotation;

    setRotation(targetRotation);

    onSpinStart?.({ winnerIdx, targetRotation, entries: displayEntries });

    setTimeout(() => {
      setSpinning(false);
      const selectedEntry = displayEntries[winnerIdx];
      setWinner(selectedEntry);
      setShowConfetti(true);
      onSpinComplete?.(selectedEntry);
      
      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
    }, 4000);
  }, [spinning, isInteractive, segmentCount, segmentAngle, displayEntries, onSpinComplete, onSpinStart, rotation]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Confetti isActive={showConfetti} />
      
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
            transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
          }}
          data-testid="spinner-wheel"
        >
          {displayEntries.map((entry, index) => {
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
            disabled={spinning}
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

      {winner && !spinning && (
        <div 
          className="text-center p-6 rounded-lg bg-card border-2"
          style={{ borderColor: winner.color }}
          data-testid="spinner-result"
        >
          <p className="text-sm text-muted-foreground mb-1">Winner:</p>
          <p className="text-3xl font-bold mb-4" style={{ color: winner.color }}>
            {winner.label}
          </p>
          {isInteractive && onRemoveWinner && displayEntries.length > 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onRemoveWinner(winner);
                setWinner(null);
                setRotation(0);
              }}
              className="gap-2"
              data-testid="button-remove-winner"
            >
              <UserMinus className="h-4 w-4" />
              Remove & Spin Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
