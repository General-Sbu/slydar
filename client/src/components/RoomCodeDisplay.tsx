import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

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

  const joinUrl = `${window.location.origin}/audience/${code}`;

  return (
    <Card className="p-3 sm:p-4 md:p-6">
      <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
        <div>
          <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Join at Slydar.app</div>
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <div 
              className="font-mono text-2xl sm:text-3xl md:text-5xl font-bold tracking-wider" 
              data-testid="text-room-code"
              data-code={code}
            >
              {code}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              data-testid="button-copy-code"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              {copied ? (
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="p-2 sm:p-3 md:p-4 bg-white rounded-lg" data-testid="qr-code-container">
            <QRCodeSVG 
              value={joinUrl} 
              size={window.innerWidth < 640 ? 120 : 160}
              level="M"
              data-testid="qr-code"
            />
          </div>
        </div>
        
        {participantCount > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">{participantCount} participants</span>
          </div>
        )}
      </div>
    </Card>
  );
}
