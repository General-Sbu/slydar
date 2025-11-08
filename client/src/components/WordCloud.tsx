import { useEffect, useState } from "react";

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

export default function WordCloud({ question, responses }: WordCloudProps) {
  const [words, setWords] = useState<PositionedWord[]>([]);

  useEffect(() => {
    if (responses.length === 0) {
      setWords([]);
      return;
    }

    // Count word frequencies
    const wordFrequency = responses.reduce((acc, r) => {
      const text = r.answer.trim();
      if (text) {
        acc[text] = (acc[text] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by frequency
    const sortedWords = Object.entries(wordFrequency)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count);

    // Create positioned words with random placement
    const positionedWords: PositionedWord[] = sortedWords.map((word, index) => {
      // Font size based on frequency (max 3em, min 0.8em)
      const maxCount = sortedWords[0].count;
      const fontSize = 0.8 + (word.count / maxCount) * 2.2;

      return {
        text: word.text,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        fontSize,
        x: Math.random() * 80 + 10, // 10-90% of width
        y: Math.random() * 70 + 15, // 15-85% of height
        rotation: (Math.random() - 0.5) * 30, // -15 to +15 degrees
      };
    });

    setWords(positionedWords);
  }, [responses]);

  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold">{question}</h2>
      
      <div className="relative w-full min-h-[300px] md:min-h-[400px]">
        {words.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Waiting for responses...
          </div>
        ) : (
          words.map((word, index) => (
            <div
              key={`${word.text}-${index}`}
              className="absolute whitespace-nowrap font-bold transition-all duration-500 ease-out"
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: `translate(-50%, -50%) rotate(${word.rotation}deg)`,
                color: word.color,
                fontSize: `${word.fontSize}em`,
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
              }}
              data-testid={`word-${index}`}
            >
              {word.text}
            </div>
          ))
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {responses.length} {responses.length === 1 ? "response" : "responses"}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(${0}deg) scale(0.5);
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
