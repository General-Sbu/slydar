import { Card } from "@/components/ui/card";

interface WordItem {
  text: string;
  count: number;
}

interface WordCloudDisplayProps {
  words: WordItem[];
}

export default function WordCloudDisplay({ words }: WordCloudDisplayProps) {
  const maxCount = Math.max(...words.map(w => w.count), 1);
  
  return (
    <Card className="p-8">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {words.map((word, index) => {
          const scale = 0.5 + (word.count / maxCount) * 2.5;
          const opacity = 0.6 + (word.count / maxCount) * 0.4;
          
          return (
            <span
              key={index}
              className="font-semibold transition-all duration-300"
              style={{
                fontSize: `${scale}rem`,
                opacity,
                color: `hsl(var(--chart-${(index % 5) + 1}))`
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </Card>
  );
}
