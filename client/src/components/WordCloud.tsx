import { useEffect, useState, useMemo } from "react";

interface WordCloudProps {
  question: string;
  responses: Array<{ answer: string }>;
}

interface PositionedWord {
  text: string;
  color: string;
  fontSize: number;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // green
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
  "#14b8a6", // teal
];

const DEFAULT_PLACEHOLDERS = [
  "Ask your question here",
  "Your Word Cloud question here",
  "Question",
  "",
];

function estimateTextDimensions(text: string, fontSize: number): { width: number; height: number } {
  const avgCharWidth = fontSize * 0.6;
  const width = text.length * avgCharWidth;
  const height = fontSize * 1.2;
  return { width, height };
}

function getRotatedBoundingBox(width: number, height: number, rotationDeg: number): { width: number; height: number } {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return {
    width: width * cos + height * sin,
    height: width * sin + height * cos,
  };
}

function boxesOverlap(a: BoundingBox, b: BoundingBox, padding: number = 2): boolean {
  return !(
    a.x + a.width / 2 + padding < b.x - b.width / 2 - padding ||
    a.x - a.width / 2 - padding > b.x + b.width / 2 + padding ||
    a.y + a.height / 2 + padding < b.y - b.height / 2 - padding ||
    a.y - a.height / 2 - padding > b.y + b.height / 2 + padding
  );
}

function findPositionSpiral(
  wordBox: { width: number; height: number },
  placedWords: PositionedWord[],
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } | null {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const maxRadius = Math.max(canvasWidth, canvasHeight);
  const spiralStep = 3;
  const angleStep = 0.3;
  
  for (let radius = 0; radius < maxRadius; radius += spiralStep) {
    for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
      const x = centerX + radius * Math.cos(angle + radius * 0.1);
      const y = centerY + radius * Math.sin(angle + radius * 0.1);
      
      const margin = 5;
      if (
        x - wordBox.width / 2 < margin ||
        x + wordBox.width / 2 > canvasWidth - margin ||
        y - wordBox.height / 2 < margin ||
        y + wordBox.height / 2 > canvasHeight - margin
      ) {
        continue;
      }
      
      const candidateBox: BoundingBox = {
        x,
        y,
        width: wordBox.width,
        height: wordBox.height,
      };
      
      let collision = false;
      for (const placed of placedWords) {
        const placedBox: BoundingBox = {
          x: placed.x,
          y: placed.y,
          width: placed.width,
          height: placed.height,
        };
        if (boxesOverlap(candidateBox, placedBox)) {
          collision = true;
          break;
        }
      }
      
      if (!collision) {
        return { x, y };
      }
    }
  }
  
  return null;
}

export default function WordCloud({ question, responses }: WordCloudProps) {
  const [words, setWords] = useState<PositionedWord[]>([]);

  const isUserFilledQuestion = question && !DEFAULT_PLACEHOLDERS.includes(question.trim());

  const wordData = useMemo(() => {
    if (responses.length === 0) return [];

    const wordFrequency = responses.reduce((acc, r) => {
      const text = r.answer.trim();
      if (text) {
        acc[text] = (acc[text] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sortedWords = Object.entries(wordFrequency)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count);

    const maxCount = sortedWords[0]?.count || 1;
    
    return sortedWords.map((word, index) => {
      const fontSize = 14 + (word.count / maxCount) * 26;
      const rotation = (Math.random() - 0.5) * 30;
      const color = COLORS[index % COLORS.length];
      
      return {
        text: word.text,
        count: word.count,
        fontSize,
        rotation,
        color,
      };
    });
  }, [responses]);

  useEffect(() => {
    if (wordData.length === 0) {
      setWords([]);
      return;
    }

    const canvasWidth = 100;
    const canvasHeight = 100;
    
    const placedWords: PositionedWord[] = [];
    
    for (const word of wordData) {
      const { width: textWidth, height: textHeight } = estimateTextDimensions(word.text, word.fontSize);
      const rotatedBox = getRotatedBoundingBox(textWidth, textHeight, word.rotation);
      
      const scaledBox = {
        width: (rotatedBox.width / 10) + 2,
        height: (rotatedBox.height / 10) + 2,
      };
      
      const position = findPositionSpiral(scaledBox, placedWords, canvasWidth, canvasHeight);
      
      if (position) {
        placedWords.push({
          text: word.text,
          color: word.color,
          fontSize: word.fontSize,
          x: position.x,
          y: position.y,
          rotation: word.rotation,
          width: scaledBox.width,
          height: scaledBox.height,
        });
      }
    }
    
    setWords(placedWords);
  }, [wordData]);

  return (
    <div className="text-center space-y-6">
      {isUserFilledQuestion && (
        <h2 className="text-2xl md:text-3xl font-bold">{question}</h2>
      )}
      
      {responses.length === 0 ? (
        <div className="relative w-full min-h-[30vh]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-muted-foreground text-lg">Waiting for responses...</div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full min-h-[30vh] md:min-h-[40vh]">
            {words.map((word, index) => (
              <div
                key={`${word.text}-${index}`}
                className="absolute whitespace-nowrap font-bold transition-all duration-500 ease-out"
                style={{
                  left: `${word.x}%`,
                  top: `${word.y}%`,
                  transform: `translate(-50%, -50%) rotate(${word.rotation}deg)`,
                  color: word.color,
                  fontSize: `${word.fontSize}px`,
                  animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
                }}
                data-testid={`word-${index}`}
              >
                {word.text}
              </div>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {responses.length} {responses.length === 1 ? "response" : "responses"}
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--rotation)) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
