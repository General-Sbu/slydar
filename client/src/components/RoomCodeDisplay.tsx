import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface RoomCodeDisplayProps {
  code: string;
  participantCount?: number;
}

export default function RoomCodeDisplay({ code, participantCount = 0 }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <div>
          <div className="text-sm text-muted-foreground mb-2">Join at slidr.app</div>
          <div className="flex items-center justify-center gap-2">
            <div className="font-mono text-5xl font-bold tracking-wider">
              {code}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              data-testid="button-copy-code"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        
        {participantCount > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">{participantCount} participants</span>
          </div>
        )}
      </div>
    </Card>
  );
}
